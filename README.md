<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1OCcYnpYDP6xhzFXNpHOZCOA6T9dI6u2r

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## 🚀 Deploy OpenClaw Gateway in GitHub Codespaces

本项目支持在 GitHub Codespaces 中一键部署 OpenClaw Gateway，无需本地环境配置。

### 快速开始

1. **打开 Codespaces**
   - 点击仓库页面的 "Code" 按钮
   - 选择 "Codespaces" 标签
   - 点击 "Create codespace on main" 或选择现有的 codespace

2. **等待环境初始化**
   - Codespaces 会自动配置 Node.js 环境
   - 自动安装 pnpm 包管理器
   - 自动安装项目依赖

3. **启动 Gateway**
   ```bash
   ./start-gateway.sh
   ```
   
   或者手动启动：
   ```bash
   pnpm openclaw gateway --port 18789 --verbose
   ```

### 访问 Gateway

Gateway 启动后，Codespaces 会自动转发端口 18789。您可以通过以下方式访问：

1. 查看 VS Code 的 "PORTS" 面板
2. 找到端口 18789 (OpenClaw Gateway)
3. 点击 "转发的地址" 链接访问

### 环境变量配置

如需配置消息频道（Telegram、Nostr 等），请在 Codespaces 中设置环境变量：

```bash
# Telegram 配置示例
export TELEGRAM_BOT_TOKEN="your_bot_token"
export TELEGRAM_CHAT_ID="your_chat_id"

# Nostr 配置示例
export NOSTR_PRIVATE_KEY="your_private_key"
export NOSTR_RELAYS="wss://relay1.com,wss://relay2.com"
```

您也可以在 `.env.local` 文件中配置这些变量：

```bash
# 创建 .env.local 文件
cat > .env.local << EOF
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
NOSTR_PRIVATE_KEY=your_private_key
NOSTR_RELAYS=wss://relay1.com,wss://relay2.com
EOF
```

### 技术细节

- **Node.js 版本**: LTS
- **包管理器**: pnpm
- **默认端口**: 18789
- **WebSocket 支持**: 已启用
- **自动端口转发**: 已配置

### 故障排除

**问题：Gateway 启动失败**
- 确保已安装 OpenClaw: `pnpm add -g openclaw`
- 检查端口是否被占用: `lsof -i :18789`

**问题：无法访问 Gateway**
- 检查端口转发是否正常：VS Code 的 "PORTS" 面板
- 确保端口可见性设置为 "Public" 或 "Private"

**问题：缺少依赖**
- 运行: `pnpm install`
- 或重新创建 Codespace

### 参考资源

- [OpenClaw 项目](https://github.com/openclaw/openclaw)
- [GitHub Codespaces 文档](https://docs.github.com/en/codespaces)
- [DevContainer 规范](https://containers.dev/)
