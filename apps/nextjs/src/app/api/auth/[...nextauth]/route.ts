/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// 简化版的认证配置，仅包含基本的凭据提供者
const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      // 标识符
      id: "credentials",
      // 名称显示在登录页面上
      name: "Credentials",
      // 定义登录表单中的字段
      credentials: {
        username: { label: "Username", type: "text", placeholder: "用户名" },
        password: { label: "Password", type: "password" }
      },
      // 验证凭据的逻辑
      async authorize(credentials, req) {
        // 注意：这只是一个简化版的实现，仅用于测试部署
        // 在实际环境中，应该验证凭据是否有效
        if (credentials?.username === "demo" && credentials?.password === "demo") {
          return {
            id: "1",
            name: "Demo User",
            email: "demo@example.com"
          };
        }
        return null;
      }
    })
  ],
  // 简化的会话策略
  session: {
    strategy: "jwt"
  },
  // 简化的回调
  callbacks: {
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    }
  },
  // 禁用调试模式
  debug: false
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
