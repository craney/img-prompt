# Playwright E2E Testing

本项目已经配置了Playwright进行端到端测试。

## 安装状态

✅ **已安装**：
- Playwright测试包 (`@playwright/test@1.55.0`)
- Playwright配置文件 (`playwright.config.ts`)
- 测试示例 (`tests/image-to-prompt.spec.ts`)
- 测试脚本 (package.json)

## 可用命令

```bash
# 运行所有测试（无头模式）
bun run test

# 运行测试并显示UI界面
bun run test:ui

# 运行测试（有头模式，可以看到浏览器）
bun run test:headed

# 调试模式（带调试工具）
bun run test:debug

# 查看测试报告
bun run test:report
```

## 测试文件位置

- **配置文件**: `playwright.config.ts`
- **测试文件**: `tests/`
- **测试报告**: `playwright-report/`

## 配置特点

- **多浏览器支持**: Chromium、Firefox、WebKit
- **移动端测试**: Pixel 5、iPhone 12
- **自动服务器启动**: 测试前自动启动开发服务器
- **失败截图**: 测试失败时自动截图
- **并行测试**: 支持并行执行以提高速度
- **重试机制**: CI环境下自动重试失败测试

## 编写新测试

1. 在 `tests/` 目录下创建 `.spec.ts` 文件
2. 使用 Playwright API 编写测试
3. 运行 `bun run test` 执行测试

示例：
```typescript
import { test, expect } from '@playwright/test';

test('example test', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/ImagePrompt/);
});
```

## 注意事项

- 测试会自动启动开发服务器在端口3000
- 确保端口3000未被占用
- 测试数据不会影响生产环境