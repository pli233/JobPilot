---
name: simplify_copilot_apply
description: 使用 Simplify Copilot 浏览器插件自动申请。最快最简单的申请方式。
trigger: ["simplify申请", "simplify apply", "使用simplify"]
allowed-tools: mcp__chrome-devtools__navigate_page, mcp__chrome-devtools__take_snapshot, mcp__chrome-devtools__click, mcp__chrome-devtools__wait_for, mcp__chrome-devtools__take_screenshot, Read, AskUserQuestion
---

# Simplify Copilot 自动申请技能

## 概述

Simplify Copilot 是一个浏览器插件，可以一键自动申请职位，通常只需点击一个按钮即可完成整个申请流程。这是最快最简单的申请方式。

## 前置要求

- 已安装 Simplify Copilot 浏览器扩展
- 浏览器为 Chrome、Edge 或 Firefox
- 已在 Simplify 中配置个人信息和简历

## 申请流程

### Step 1: 打开职位页面

```
mcp__chrome-devtools__navigate_page({
  url: "{job_url}",
  type: "url"
})
```

### Step 2: 获取页面快照 (必须！)

```
mcp__chrome-devtools__take_snapshot({})
```

### Step 3: 检测 Simplify 按钮

从快照中查找 Simplify Copilot 按钮，通常的识别方式：

- `button` 包含 "Simplify" 文本
- `button` 包含 Simplify logo 或 icon
- 按钮位置通常在页面右上角或表单顶部
- 按钮颜色通常为绿色或蓝色

典型快照元素：
```
button "Simplify your application"
button "Apply with Simplify"
button with icon containing "Simplify"
```

### Step 4: 点击 Simplify 按钮

```
mcp__chrome-devtools__click({ uid: "{simplify_button_uid}" })
```

### Step 5: 等待 Simplify 对话框加载

Simplify 会弹出一个对话框或新标签页，开始自动填表过程。等待加载：

```
mcp__chrome-devtools__wait_for({
  text: "Applying",
  timeout: 10000
})
```

或

```
mcp__chrome-devtools__wait_for({
  text: "Application submitted",
  timeout: 30000
})
```

### Step 6: 获取更新的快照

```
mcp__chrome-devtools__take_snapshot({})
```

检查以下信息：
- Simplify 对话框中显示的进度
- 是否需要用户输入（如 CAPTCHA、邮箱验证码）
- 是否显示申请成功信息

### Step 7: 处理用户交互 (如需要)

如果 Simplify 弹出需要用户输入的内容：

- **邮箱验证码**: 提示用户检查邮箱并输入
- **CAPTCHA**: 提示用户完成验证
- **自定义问题**: 提示用户提供答案

```
使用 AskUserQuestion 询问用户
```

### Step 8: 等待申请完成

监听申请成功提示：

```
mcp__chrome-devtools__wait_for({
  text: "Application submitted successfully",
  timeout: 30000
})
```

成功标志：
- 显示 "Thank you" 或 "Submitted" 信息
- URL 跳转到确认页面
- 显示确认编号或 application ID

### Step 9: 截图保存

申请成功后保存截图作为证明：

```
mcp__chrome-devtools__take_screenshot({
  fullPage: true,
  format: "png",
  filePath: "/绝对路径/data/screenshots/{company}-simplify-{date}.png"
})
```

### Step 10: 记录申请

保存申请记录到数据库/Excel，标注：
- 方式: "simplify"
- 时间: 申请提交时间
- 截图: 确认截图路径

---

## 常见场景

### 场景 1: Simplify 按钮存在且可用 ✓ (最佳情况)

1. 页面加载 → 检测到 Simplify 按钮 → 用户确认 → 点击 → 申请完成
2. 通常只需 3-5 秒

### 场景 2: Simplify 按钮存在但禁用或隐藏

**症状**: 按钮灰显或不可见

**解决**:
1. 重新加载页面，等待完全加载
2. 检查浏览器是否正确安装了插件
3. 如果仍无法使用，fallback 到人工申请

### 场景 3: Simplify 按钮不存在

**症状**: 快照中找不到 Simplify 按钮

**可能原因**:
1. 该职位平台 Simplify 不支持 (如: 直接招聘、内部系统等)
2. 浏览器插件未安装
3. Simplify 还未更新到支持此平台

**解决**:
- 记录 "Simplify 不支持" 状态
- Fallback 到平台特定的申请方式 (greenhouse / ashby / workday 等)

### 场景 4: 申请中途失败

**症状**: Simplify 显示错误或卡住

**解决**:
1. 重试一次
2. 如果再次失败，关闭 Simplify
3. Fallback 到手工申请或其他方式

---

## 故障排查

| 问题 | 症状 | 解决方案 |
|------|------|--------|
| 插件未安装 | 看不到 Simplify 按钮 | 安装浏览器扩展 |
| 插件已禁用 | 按钮灰显或无响应 | 在扩展管理器中启用 |
| 页面未加载完 | 按钮出现晚或不出现 | 增加等待时间，wait_for 改为 5-10s |
| 申请卡住 | Simplify 对话框无进展 | 关闭重试，或 fallback |
| 验证码需要 | 申请流程停止 | 提示用户手动验证 |

---

## 优势对比

| 方式 | 时间 | 自动化度 | 成功率 |
|------|------|---------|--------|
| Simplify | 3-10 秒 | 99% | 95%+ |
| Greenhouse 手工 | 1-2 分钟 | 60% | 99% |
| 通用表单 | 2-5 分钟 | 40% | 85% |

---

## 最佳实践

1. **优先尝试 Simplify** - 如果可用，总是用它
2. **快速失败** - 如果 30 秒内没完成，考虑 fallback
3. **记录方式** - 标注申请使用的方式，便于后续跟进
4. **检查成功** - 申请成功前一定要看确认页面

