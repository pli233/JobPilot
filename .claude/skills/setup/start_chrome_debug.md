# Start Chrome Debug Mode

启动 Chrome 调试模式，使用**独立的调试配置文件**（持久化登录状态）。

## 重要说明
从 Chrome 136 开始，出于安全原因，**不能直接连接到默认 Chrome 配置文件**进行远程调试。
必须使用独立的 `--user-data-dir` 创建专用调试配置文件。

## 配置文件位置
调试专用配置文件存储在: `~/.chrome-debug-profile`
- 首次使用需要手动登录各网站（LinkedIn、GitHub 等）
- 登录状态会持久保存，下次启动自动恢复

## 前置条件
- macOS 系统
- 已安装 Google Chrome

## 执行步骤

### Step 1: 关闭所有 Chrome 实例
```bash
pkill -9 "Google Chrome" 2>/dev/null || true
sleep 2
```

### Step 2: 启动 Chrome 调试模式（使用独立配置文件）
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir="$HOME/.chrome-debug-profile" \
  > /dev/null 2>&1 &
```

### Step 3: 等待 Chrome 启动
```bash
sleep 4
```

### Step 4: 验证连接
```bash
curl -s http://localhost:9222/json/version
```
如果返回 JSON，说明连接成功。

### Step 5: 使用 MCP 验证
使用 `mcp__chrome-devtools__list_pages` 验证连接是否成功。

## 首次使用
首次启动后，需要在调试 Chrome 窗口中**手动登录**需要的网站：
1. 打开 LinkedIn 并登录
2. 打开 GitHub 并登录
3. 登录其他需要的网站

这些登录状态会保存在 `~/.chrome-debug-profile` 目录中，下次启动自动恢复。

## MCP 配置
确保 `.mcp.json` 中配置了正确的连接参数：
```json
{
  "chrome-devtools": {
    "command": "npx",
    "args": [
      "-y",
      "chrome-devtools-mcp@latest",
      "--browserUrl=http://127.0.0.1:9222"
    ]
  }
}
```

## 快捷方式（可选）
添加到 `~/.zshrc` 或 `~/.bashrc`：
```bash
alias chrome:debug="/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir=\"\$HOME/.chrome-debug-profile\" > /dev/null 2>&1 &"
```
之后只需运行 `chrome:debug` 即可启动。

## 故障排除

### 端口被占用
```bash
lsof -i :9222
kill -9 <PID>
```

### 验证端口是否监听
```bash
curl -s http://localhost:9222/json/version
```

### Chrome 路径问题
```bash
ls -la /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome
```

## 安全注意事项
- 调试配置文件与日常浏览配置文件**完全隔离**
- 不要在调试 Chrome 中进行敏感操作（银行、个人邮箱等）
- 只登录工作需要的网站（LinkedIn、GitHub 等）

## Sources
- [Chrome DevTools MCP 官方博客](https://developer.chrome.com/blog/chrome-devtools-mcp)
- [如何设置持久化调试配置文件](https://raf.dev/blog/chrome-debugging-profile-mcp/)
