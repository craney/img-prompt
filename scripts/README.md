# 音效脚本说明（服务器环境兼容版）

## 功能
在命令执行完成后播放音效，提供听觉反馈。脚本会自动检测环境并适应不同的服务器环境。

## 环境兼容性

### ✅ 本地开发环境
- macOS: 播放系统音效
- Linux: 尝试播放系统音效或终端响铃
- Windows: 仅显示消息（可扩展支持）

### ✅ CI/CD 环境（安全跳过音效）
- GitHub Actions
- Vercel
- Netlify
- GitLab CI
- Jenkins
- Travis CI
- CircleCI
- Buildkite

### ✅ 服务器环境（安全跳过音效）
- 无图形界面的 Linux 服务器
- Docker 容器
- 云服务器

## 使用方法

### 自动触发（推荐）
脚本已经配置为 post 钩子，会在以下命令后自动播放：
- `bun run build` → 播放音效（本地环境）/ 显示消息（服务器环境）
- `bun run build:web` → 播放音效（本地环境）/ 显示消息（服务器环境）

### 手动播放
```bash
# 直接执行脚本
./scripts/play-sound.sh
```

### 测试不同环境
```bash
# 模拟 CI/CD 环境
CI=true ./scripts/play-sound.sh
# 输出：🔔 构建完成！(CI/CD 环境跳过音效)

# 模拟 Vercel 环境
VERCEL=true ./scripts/play-sound.sh
# 输出：🔔 构建完成！(CI/CD 环境跳过音效)
```

## 钩子说明

### 已配置的钩子
- `postbuild`: 在 `build` 命令完成后执行
- `postbuild:web`: 在 `build:web` 命令完成后执行

### 钩子机制
npm/bun 支持以下钩子：
- `pre<command>`: 命令执行前运行
- `post<command>`: 命令执行后运行

## 安全特性

### 1. 环境检测
脚本会检测以下环境变量来判断是否在 CI/CD 环境中：
- `$CI` - 通用 CI 标志
- `$GITHUB_ACTIONS` - GitHub Actions
- `$VERCEL` - Vercel
- `$NETLIFY` - Netlify
- `$JENKINS_URL` - Jenkins
- `$GITLAB_CI` - GitLab CI
- `$TRAVIS` - Travis CI
- `$CIRCLECI` - Circle CI
- `$BUILDKITE` - Buildkite

### 2. 服务器检测
检测是否在无图形界面的服务器上：
- 检查 `$DISPLAY` 环境变量
- 检查系统音效目录是否存在
- 检查是否有图形界面进程运行

### 3. 错误处理
- 所有音效播放命令都会重定向输出到 `/dev/null`
- 使用 `||` 捕获错误，避免影响构建流程
- 即使音效播放失败，构建仍然会成功

## 音效说明

### macOS 系统音效
使用系统内置的 Glass 音效：
- 路径：`/System/Library/Sounds/Glass.aiff`
- 播放工具：`afplay`

### Linux 系统音效
尝试以下音效文件：
- `/usr/share/sounds/freedesktop/stereo/complete.oga`
- `/usr/share/sounds/alsa/Front_Left.wav`
- 终端响铃 `\a`

## 自定义音效

### 使用其他系统音效
```bash
# 查看可用音效
ls /System/Library/Sounds/
ls /usr/share/sounds/

# 修改脚本中的音效文件路径
# 在 macOS 系统音效部分修改
```

### 使用自定义音效
1. 将音效文件放入项目
2. 修改脚本路径：
```bash
# 在相应的系统部分添加
if [ -f "./scripts/success.mp3" ]; then
    # 使用相应的播放命令
    afplay "./scripts/success.mp3" >/dev/null 2>&1 &
fi
```

## 故障排除

### 服务器环境没有声音（正常行为）
在服务器环境中，脚本会显示：
```
🔔 构建完成！(服务器环境跳过音效)
```
这是正常的，为了避免服务器环境中的音频问题。

### CI/CD 环境没有声音（正常行为）
在 CI/CD 环境中，脚本会显示：
```
🔔 构建完成！(CI/CD 环境跳过音效)
```
这是正常的，为了避免 CI/CD 环境中的音频问题。

### 权限问题
```bash
# 确保脚本有执行权限
chmod +x scripts/play-sound.sh
```

### 脚本执行失败
脚本有错误处理机制，即使音效播放失败也不会影响构建流程。

## 部署注意事项

### 1. 无需修改配置
脚本已经为所有环境优化，无需额外配置。

### 2. 构建日志
在服务器环境中，你会看到类似这样的日志：
```
🔔 构建完成！(CI/CD 环境跳过音效)
```
这表示脚本正常工作，只是在服务器环境中跳过了音效播放。

### 3. 构建性能
- 本地环境：音效播放在后台执行，不影响构建性能
- 服务器环境：直接跳过音效，无性能影响

## 示例使用场景

```bash
# 本地开发
bun run build
# 输出：🔔 构建完成！（播放音效）

# 本地开发
bun run build:web
# 输出：🔔 构建完成！（播放音效）

# Vercel 部署
vercel --prod
# 构建日志：🔔 构建完成！(CI/CD 环境跳过音效)

# GitHub Actions
# 自动检测：🔔 构建完成！(CI/CD 环境跳过音效)
```