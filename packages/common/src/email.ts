import { Resend } from "resend";

import { env } from "./env.mjs";

// 创建 Resend 实例，如果没有提供 API 密钥，则使用空字符串
// 在生产环境中会正常工作，但在没有配置 API 密钥时会忽略邮件发送功能
export const resend = new Resend(env.RESEND_API_KEY || "");
