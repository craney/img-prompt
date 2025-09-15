#!/bin/bash

# 构建完成音效脚本 - 服务器环境兼容版本
# 使用方法：在 package.json 中添加 "postbuild": "./scripts/play-sound.sh"

# 检查是否在 CI/CD 环境中
is_ci_environment() {
    # 检查常见的 CI/CD 环境变量
    [ -n "$CI" ] || \
    [ -n "$GITHUB_ACTIONS" ] || \
    [ -n "$VERCEL" ] || \
    [ -n "$NETLIFY" ] || \
    [ -n "$JENKINS_URL" ] || \
    [ -n "$GITLAB_CI" ] || \
    [ -n "$TRAVIS" ] || \
    [ -n "$CIRCLECI" ] || \
    [ -n "$BUILDKITE" ]
}

# 检查是否在服务器环境（无图形界面）
is_server_environment() {
    # 检查是否在无图形界面的服务器上
    [ -z "$DISPLAY" ] || \
    [ ! -d "/System/Library/Sounds" ] || \
    [ "$OSTYPE" = "linux-gnu" ] && [ -z "$(pgrep -x Xorg)" ] 2>/dev/null
}

# 安全播放音效的函数
play_sound_safely() {
    # 如果在 CI/CD 环境中，不播放音效
    if is_ci_environment; then
        echo "🔔 构建完成！(CI/CD 环境跳过音效)"
        return 0
    fi

    # 如果在服务器环境中，不播放音效
    if is_server_environment; then
        echo "🔔 构建完成！(服务器环境跳过音效)"
        return 0
    fi

    # macOS 系统音效
    if [ "$(uname)" = "Darwin" ] && [ -f "/System/Library/Sounds/Glass.aiff" ]; then
        afplay "/System/Library/Sounds/Glass.aiff" >/dev/null 2>&1 &
        echo "🔔 构建完成！"
        return 0
    fi

    # Linux 系统音效（如果可用）
    if [ "$(uname)" = "Linux" ] && command -v paplay >/dev/null 2>&1; then
        # 尝试使用系统默认音效
        if [ -f "/usr/share/sounds/freedesktop/stereo/complete.oga" ]; then
            paplay "/usr/share/sounds/freedesktop/stereo/complete.oga" >/dev/null 2>&1 &
        elif [ -f "/usr/share/sounds/alsa/Front_Left.wav" ]; then
            paplay "/usr/share/sounds/alsa/Front_Left.wav" >/dev/null 2>&1 &
        else
            # 使用终端响铃作为后备
            echo -e "\a" >/dev/tty 2>/dev/null
        fi
        echo "🔔 构建完成！"
        return 0
    fi

    # 其他情况：只显示消息，不播放音效
    echo "🔔 构建完成！"
}

# 主函数
main() {
    # 捕获可能的错误，避免影响构建流程
    play_sound_safely || {
        # 如果音效播放失败，只显示消息
        echo "🔔 构建完成！"
    }
}

# 执行主函数
main