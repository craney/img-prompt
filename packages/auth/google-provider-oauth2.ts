import GoogleProvider from "next-auth/providers/google";
import { HttpsProxyAgent } from "https-proxy-agent";
import { getGoogleOAuthConfig } from "./env.mjs";

// 创建标准 Google Provider，动态获取配置
export function createOAuth2GoogleProvider() {
  const agent = process.env.HTTPS_PROXY ? new HttpsProxyAgent(process.env.HTTPS_PROXY) : undefined;
  const config = getGoogleOAuthConfig();

  if (!config.isConfigured) {
    console.warn('Google OAuth credentials not found in environment variables');
    return null;
  }

  return GoogleProvider({
    clientId: config.clientId!,
    clientSecret: config.clientSecret!,
    httpOptions: {
      timeout: 15000,
      agent: agent
    }
  });
}