import { getServerSession, NextAuthOptions, User } from "next-auth";
import { KyselyAdapter } from "@auth/kysely-adapter";
import GitHubProvider from "next-auth/providers/github";
import EmailProvider from "next-auth/providers/email";

// 延迟导入 resend，只在需要时才加载
import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";

import { db } from "./db";
import { env } from "./env.mjs";

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

// 动态构建 providers 数组，只包含有有效配置的 provider
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  adapter: KyselyAdapter(db) as any,

  providers: [
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
    // 如果没有配置任何 provider，添加一个占位符以避免空数组错误
    ...([] as any[]),
  ],
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
          token.id = user.id as UserId;
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
  debug: (env.IS_DEBUG as string) === "true",
};

// Use it in server contexts
export function auth(
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
