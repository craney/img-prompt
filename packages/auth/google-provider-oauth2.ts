import GoogleProvider from "next-auth/providers/google";
import { getGoogleOAuthConfig } from "./env.mjs";
import {
  createNextAuthHttpOptions,
  getProxyConfigFromEnv
} from "./proxy-config";

// 创建统一的 Google Provider 配置函数
function createGoogleProviderConfig(enableDebugLogs = false) {
  const config = getGoogleOAuthConfig();

  if (!config.isConfigured) {
    console.warn('Google OAuth credentials not found in environment variables');
    return null;
  }

  // 检查代理配置
  const proxyConfig = getProxyConfigFromEnv();

  // 创建简化的 HTTP 选项
  const httpOptions = createNextAuthHttpOptions({
    enableDebugLogs,
    requestTimeout: 45000, // 统一使用45秒超时
    proxy: proxyConfig,
  });

  // 创建 Google Provider 配置
  const providerConfig: any = {
    clientId: config.clientId!,
    clientSecret: config.clientSecret!,
    wellKnown: "https://accounts.google.com/.well-known/openid-configuration",
    issuer: "https://accounts.google.com",
    httpOptions: httpOptions,
  };

  // 添加授权参数（可选，根据需要）
  if (process.env.GOOGLE_OAUTH_PROMPT === 'consent') {
    providerConfig.authorization = {
      params: {
        prompt: "consent",
        access_type: "offline",
        response_type: "code"
      }
    };
  }

  return { providerConfig, proxyConfig };
}

// 同步版本（主要版本）
export function createOAuth2GoogleProviderSync() {
  const enableDebugLogs = process.env.NEXTAUTH_DEBUG === 'true' || process.env.IS_DEBUG === 'true';
  const result = createGoogleProviderConfig(enableDebugLogs);

  if (!result) {
    return null;
  }

  const { providerConfig, proxyConfig } = result;

  try {
    if (enableDebugLogs) {
      console.log('Creating Google OAuth provider with configuration:', {
        clientId: providerConfig.clientId?.substring(0, 10) + '...',
        hasProxy: !!proxyConfig,
        timeout: providerConfig.httpOptions.timeout,
      });
    }

    return GoogleProvider(providerConfig);
  } catch (error) {
    console.error('Error creating GoogleProvider:', error);
    return null;
  }
}

// 异步版本（保持向后兼容）
export async function createOAuth2GoogleProvider() {
  return createOAuth2GoogleProviderSync();
}