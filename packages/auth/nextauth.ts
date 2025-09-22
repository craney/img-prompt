import type { NextAuthOptions, User } from "next-auth";
import { getServerSession } from "next-auth";
import { KyselyAdapter } from "@auth/kysely-adapter";
import GitHubProvider from "next-auth/providers/github";
import EmailProvider from "next-auth/providers/email";
import { createOAuth2GoogleProvider, createOAuth2GoogleProviderSync } from "./google-provider-oauth2";
import { applyGlobalProxyConfig, getProxyConfigFromEnv } from "./proxy-config";

// 延迟导入 resend，只在需要时才加载
import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";

import { db } from "./db";
import { env } from "./env.mjs";

// 在应用启动时设置全局代理配置
const proxyConfig = getProxyConfigFromEnv();
if (proxyConfig) {
  applyGlobalProxyConfig(proxyConfig.url);
  console.log('Global proxy configured at startup:', proxyConfig.url);
}

// 辅助函数：确保环境变量存在
const getEnv = (key: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(`${key} is required but not provided`);
  }
  return value;
};

type UserId = string;
type IsAdmin = boolean;

declare module "next-auth" {
  interface Session {
    user: User & {
      id: UserId;
      isAdmin: IsAdmin;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: UserId;
    isAdmin: IsAdmin;
  }
}

// 检查数据库连接
const checkDatabaseConnection = async () => {
  try {
    // 尝试执行一个简单的查询来测试连接
    await db.selectFrom('User').select('id').limit(1).execute();
    console.log('Database connection test successful');
  } catch (error) {
    console.error('Database connection test failed:', error);
  }
};

// 如果在服务器环境中，检查数据库连接
if (typeof window === 'undefined') {
  checkDatabaseConnection().catch(console.error);
}

// 创建基础 providers 数组
const baseProviders = [
  // 只在提供了 GitHub 客户端 ID 和密钥时添加 GitHubProvider
  ...(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
    ? [
        GitHubProvider({
          clientId: getEnv("GITHUB_CLIENT_ID", env.GITHUB_CLIENT_ID),
          clientSecret: getEnv("GITHUB_CLIENT_SECRET", env.GITHUB_CLIENT_SECRET),
          httpOptions: { timeout: 15000 },
        }),
      ]
    : []),
  // 添加 Google Provider（异步版本）
  ...(function() {
    try {
      console.log('Attempting to create Google OAuth provider...');
      // 使用同步版本以避免异步问题
      const provider = createOAuth2GoogleProviderSync();
      if (provider) {
        console.log('Google OAuth provider created successfully');
        return [provider];
      } else {
        console.warn('Google OAuth provider not created - configuration incomplete');
        return [];
      }
    } catch (error) {
      console.error('Error creating Google OAuth provider:', error);
      return [];
    }
  })(),
  // 只在提供了 RESEND_FROM 和 RESEND_API_KEY 时添加 EmailProvider
  ...(env.RESEND_FROM && env.RESEND_API_KEY
    ? [
        EmailProvider({
          sendVerificationRequest: async ({ identifier, url }) => {
            const user = await db
              .selectFrom("User")
              .select(["name", "emailVerified"])
              .where("email", "=", identifier)
              .executeTakeFirst();
            const userVerified = !!user?.emailVerified;

            try {
              // 动态导入 resend 和相关组件，只在需要时才加载
              const { MagicLinkEmail, siteConfig } = await import("@saasfly/common");
              const authSubject = userVerified
                ? `Sign-in link for ${(siteConfig as { name: string }).name}`
                : "Activate your account";

              // 创建一个新的 Resend 实例，确保使用了 API 密钥
              const { Resend } = await import("resend");
              const resend = new Resend(getEnv("RESEND_API_KEY", env.RESEND_API_KEY));

              if (resend && typeof resend.emails?.send === 'function') {
                await resend.emails.send({
                  from: getEnv("RESEND_FROM", env.RESEND_FROM),
                  to: identifier,
                  subject: authSubject,
                  react: MagicLinkEmail({
                    firstName: user?.name ?? "",
                    actionUrl: url,
                    mailType: userVerified ? "login" : "register",
                    siteName: (siteConfig as { name: string }).name,
                  }),
                  // Set this to prevent Gmail from threading emails.
                  // More info: https://resend.com/changelog/custom-email-headers
                  headers: {
                    "X-Entity-Ref-ID": new Date().getTime() + "",
                  },
                });
              }
            } catch (error) {
              console.log("Error sending verification email:", error);
            }
          },
        }),
      ]
    : []),
];

// 创建同步版本的 authOptions
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/en/login",
  },
  adapter: KyselyAdapter(db),
  useSecureCookies: false,
  // 增加超时设置
  logger: {
    error: (code, metadata) => {
      console.error('NextAuth Error:', code, metadata);
      if (metadata && 'error' in metadata && metadata.error) {
        const error = metadata.error;
        console.error('NextAuth Error Details:', error);
        console.error('NextAuth Error Stack:', error.stack);
        console.error('NextAuth Error Message:', error.message);
        console.error('NextAuth Error Name:', error.name);
      }
    },
    warn: (code) => {
      console.warn('NextAuth Warning:', code);
    },
    debug: (code, metadata) => {
      console.debug('NextAuth Debug:', code, metadata);
    },
  },
  providers: baseProviders,
  callbacks: {
    session({ token, session }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.name = token.name ?? undefined;
        session.user.email = token.email ?? undefined;
        session.user.image = token.picture ?? undefined;
        session.user.isAdmin = token.isAdmin || false;
      }
      return session;
    },
    async jwt({ token, user }) {
      const email = token?.email ?? "";
      const dbUser = email
        ? await db
            .selectFrom("User")
            .where("email", "=", email)
            .selectAll()
            .executeTakeFirst()
        : null;
      
      if (!dbUser) {
        if (user) {
          token.id = user.id;
          token.isAdmin = false;
        }
        return token;
      }
      
      let isAdmin = false;
      if (env.ADMIN_EMAIL) {
        const adminEmails = getEnv("ADMIN_EMAIL", env.ADMIN_EMAIL).split(",");
        if (email) {
          isAdmin = adminEmails.includes(email);
        }
      }
      
      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
        isAdmin: isAdmin,
      };
    },
  },
    debug: true,
    events: {
      signIn(message) {
        console.log('NextAuth Sign In Event:', message);
        return true;
      },
      signOut(message) {
        console.log('NextAuth Sign Out Event:', message);
        return true;
      },
      createUser(message) {
        console.log('NextAuth Create User Event:', message);
        return true;
      },
      updateUser(message) {
        console.log('NextAuth Update User Event:', message);
        return true;
      },
      linkAccount(message) {
        console.log('NextAuth Link Account Event:', message);
        return true;
      },
      session(message) {
        console.log('NextAuth Session Event:', message);
        return true;
      },
    },
  };

// Use it in server contexts
export async function auth(
  ...args:
    | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, authOptions);
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}