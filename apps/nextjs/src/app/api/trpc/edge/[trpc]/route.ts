import type {NextRequest} from "next/server";
import {fetchRequestHandler} from "@trpc/server/adapters/fetch";
import { initTRPC } from '@trpc/server';

// 创建一个完全独立的 tRPC 实例，不依赖任何外部包或环境变量
const t = initTRPC.create();

// 创建一个非常简单的路由器，只包含一个 health check 端点
const router = t.router({
  health: t.procedure.query(() => {
    return { status: 'ok' };
  }),
});

type Router = typeof router;

// 创建一个不依赖任何外部服务的上下文
const createContext = async (_req: NextRequest) => {
  return {};
};

// 创建简化的处理程序
const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc/edge",
    router,
    req,
    createContext: () => createContext(req),
    onError: ({error, path}) => {
      console.log("Error in simplified tRPC handler (edge) on path", path);
      console.error(error);
    },
  });

export {handler as GET, handler as POST};
