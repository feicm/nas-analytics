#!/bin/bash
# start-gateway.sh - OpenClaw Gateway 启动脚本

echo "=== OpenClaw Gateway 启动脚本 ==="

# 检查是否安装了 pnpm
if ! command -v pnpm &> /dev/null; then
    echo "pnpm 未安装，正在安装..."
    npm install -g pnpm
fi

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo "正在安装项目依赖..."
    pnpm install
fi

# 检查是否安装了 OpenClaw
if ! pnpm list openclaw &> /dev/null; then
    echo "OpenClaw 未安装，正在安装..."
    pnpm add -g openclaw
fi

echo ""
echo "启动 OpenClaw Gateway..."
echo "端口: 18789"
echo "访问地址将在端口转发后显示"
echo ""
echo "提示: 如需配置消息频道（Telegram、Nostr等），请设置相应的环境变量"
echo ""

# 启动 Gateway
pnpm openclaw gateway --port 18789 --verbose
