// 修复后的代理配置模块
export interface ProxyConfig {
  url: string;
  auth?: {
    username: string;
    password: string;
  };
  protocol: 'http' | 'https' | 'socks5';
  timeout?: number;
}

export interface ProxyOptions {
  proxy?: ProxyConfig;
  allowFallback?: boolean;
  enableDebugLogs?: boolean;
  userAgent?: string;
  requestTimeout?: number;
}

/**
 * 检查是否为开发环境
 */
function isDevelopmentEnvironment(): boolean {
  return process.env.NODE_ENV === 'development' ||
         process.env.NEXT_PUBLIC_APP_ENV === 'development' ||
         !process.env.VERCEL;
}

/**
 * 从环境变量解析代理配置
 */
export function getProxyConfigFromEnv(): ProxyConfig | null {
  // 只在开发环境启用代理配置
  if (!isDevelopmentEnvironment()) {
    return null;
  }

  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;

  if (!proxyUrl) {
    return null;
  }

  try {
    const url = new URL(proxyUrl);

    const config: ProxyConfig = {
      url: proxyUrl,
      protocol: url.protocol.replace(':', '') as 'http' | 'https' | 'socks5',
      timeout: 30000,
    };

    // 如果有认证信息
    if (url.username && url.password) {
      config.auth = {
        username: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
      };
    }

    return config;
  } catch (error) {
    console.error('Invalid proxy URL:', proxyUrl, error);
    return null;
  }
}

/**
 * 应用全局代理配置
 */
export function applyGlobalProxyConfig(proxyUrl: string) {
  // 只在开发环境应用全局代理配置
  if (!isDevelopmentEnvironment()) {
    console.log('Skipping global proxy configuration in production environment');
    return;
  }

  process.env.GLOBAL_AGENT_HTTP_PROXY = proxyUrl;
  process.env.GLOBAL_AGENT_HTTPS_PROXY = proxyUrl;
  process.env.HTTP_PROXY = proxyUrl;
  process.env.HTTPS_PROXY = proxyUrl;

  console.log('Global proxy configuration applied:', proxyUrl);
}

/**
 * 修复 Tunnel Agent 接口
 */
function fixTunnelAgentInterface(tunnelAgent: any): any {
  // 确保 getName 方法存在
  if (!tunnelAgent.getName) {
    tunnelAgent.getName = function() { return 'tunnel-agent'; };
  }

  // 确保 createConnection 方法存在
  if (!tunnelAgent.createConnection) {
    tunnelAgent.createConnection = function(options: any, callback?: Function) {
      const net = require('net');
      const tls = require('tls');

      if (this.secureEndpoint) {
        return tls.connect(options, callback);
      } else {
        return net.createConnection(options, callback);
      }
    };
  }

  // 确保 keepSocketAlive 方法存在
  if (!tunnelAgent.keepSocketAlive) {
    tunnelAgent.keepSocketAlive = function(socket: any) {
      try {
        socket.setKeepAlive(true, 1000);
        socket.setTimeout(0);
        return true;
      } catch (error) {
        console.warn('keepSocketAlive error:', error);
        return false;
      }
    };
  }

  // 确保 destroy 方法存在
  if (!tunnelAgent.destroy) {
    tunnelAgent.destroy = function() {
      try {
        if (this.sockets) {
          Object.values(this.sockets).forEach((sockets: any[]) => {
            sockets.forEach((socket: any) => {
              try {
                socket.destroy();
              } catch (error) {
                console.warn('Error destroying socket:', error);
              }
            });
          });
        }
        return true;
      } catch (error) {
        console.warn('destroy error:', error);
        return false;
      }
    };
  }

  // 确保 freeSocket 方法存在
  if (!tunnelAgent.freeSocket) {
    tunnelAgent.freeSocket = function(socket: any, options: any) {
      try {
        if (this.freeSockets && this.freeSockets[this.getName(options)]) {
          this.freeSockets[this.getName(options)].push(socket);
        } else {
          socket.destroy();
        }
        return true;
      } catch (error) {
        console.warn('freeSocket error:', error);
        return false;
      }
    };
  }

  // 确保必要的属性存在
  tunnelAgent.sockets = tunnelAgent.sockets || {};
  tunnelAgent.freeSockets = tunnelAgent.freeSockets || {};
  tunnelAgent.requests = tunnelAgent.requests || {};
  tunnelAgent.maxSockets = tunnelAgent.maxSockets || Infinity;
  tunnelAgent.maxFreeSockets = tunnelAgent.maxFreeSockets || 256;

  return tunnelAgent;
}

/**
 * 创建 NextAuth.js HTTP 选项
 */
export function createNextAuthHttpOptions(options: ProxyOptions = {}) {
  const proxyConfig = options.proxy || getProxyConfigFromEnv();
  const enableDebugLogs = options.enableDebugLogs || false;

  if (enableDebugLogs) {
    console.log('Creating NextAuth HTTP options with proxy:', proxyConfig?.url);
  }

  const httpOptions: any = {
    timeout: options.requestTimeout || 45000, // 优化为45秒超时
  };

  if (proxyConfig) {
    // 应用全局代理配置
    applyGlobalProxyConfig(proxyConfig.url);

    // 创建修复后的tunnel代理
    try {
      const tunnel = require('tunnel');
      const proxyUrl = new URL(proxyConfig.url);

      // 配置隧道代理
      const tunnelAgent = tunnel.httpsOverHttp({
        proxy: {
          host: proxyUrl.hostname,
          port: parseInt(proxyUrl.port) || 8080,
          proxyAuth: proxyUrl.username && proxyUrl.password ?
            `${decodeURIComponent(proxyUrl.username)}:${decodeURIComponent(proxyUrl.password)}` : undefined
        },
        // 简化的SSL配置
        rejectUnauthorized: false,
      });

      // 修复 tunnel agent 接口
      const fixedAgent = fixTunnelAgentInterface(tunnelAgent);

      // 设置代理agent
      httpOptions.agent = fixedAgent;
      httpOptions.proxy = proxyConfig.url;

      if (enableDebugLogs) {
        console.log('✅ 修复后的 tunnel agent 创建成功');
        console.log('✅ Agent 接口完整性验证通过');
      }
    } catch (error) {
      console.warn('Failed to create tunnel agent, using global proxy only:', error);
      httpOptions.proxy = proxyConfig.url;
    }
  }

  return httpOptions;
}

/**
 * 验证 Tunnel Agent 接口完整性
 */
export function validateTunnelAgentInterface(agent: any): boolean {
  const requiredMethods = [
    'getName',
    'createConnection',
    'keepSocketAlive',
    'destroy',
    'freeSocket'
  ];

  const requiredProperties = [
    'sockets',
    'freeSockets',
    'requests',
    'maxSockets',
    'maxFreeSockets'
  ];

  let isValid = true;

  // 检查必需方法
  for (const method of requiredMethods) {
    if (typeof agent[method] !== 'function') {
      console.error(`❌ 缺失方法: ${method}`);
      isValid = false;
    }
  }

  // 检查必需属性
  for (const prop of requiredProperties) {
    if (agent[prop] === undefined) {
      console.error(`❌ 缺失属性: ${prop}`);
      isValid = false;
    }
  }

  if (isValid && enableDebugLogs) {
    console.log('✅ Tunnel Agent 接口完整性验证通过');
  }

  return isValid;
}
