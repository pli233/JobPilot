---
name: handle_captcha
description: 处理验证码。检测验证码类型并提示用户手动完成。
trigger: ["处理验证码", "handle captcha", "验证码"]
allowed-tools: mcp__chrome-devtools__take_snapshot, mcp__chrome-devtools__take_screenshot, mcp__chrome-devtools__wait_for, AskUserQuestion
---

# Handle Captcha Skill

处理页面上的验证码。

## 验证码类型

| 类型 | 特征 | 处理方式 |
|------|------|----------|
| reCAPTCHA v2 | "I'm not a robot" 复选框 | 用户点击 |
| reCAPTCHA v3 | 隐藏，自动评分 | 通常不需要处理 |
| hCaptcha | 选择图片 | 用户完成 |
| 文本验证码 | 输入图片中的文字 | 用户输入 |
| 滑块验证 | 拖动滑块 | 用户操作 |

## 执行步骤

### Step 1: 检测验证码

获取快照并检查是否存在验证码：

```
mcp__chrome-devtools__take_snapshot({})
```

检测关键词：
- "I'm not a robot"
- "CAPTCHA"
- "Verify you are human"
- "Select all images"

### Step 2: 截图保存

```
mcp__chrome-devtools__take_screenshot({
  filePath: "k:\\JobPilot\\data\\screenshots\\captcha.png"
})
```

### Step 3: 通知用户

使用 AskUserQuestion 提示：

```
检测到验证码

类型: reCAPTCHA v2
截图已保存: captcha.png

请在浏览器中完成验证码，完成后告诉我：
[已完成] [跳过] [取消申请]
```

### Step 4: 等待用户完成

用户确认后继续：

```
mcp__chrome-devtools__wait_for({
  text: "Verified" 或 其他确认文本,
  timeout: 60000
})
```

### Step 5: 重新获取快照

```
mcp__chrome-devtools__take_snapshot({})
```

## 输出格式

### 检测到验证码
```
## 验证码检测

**类型**: reCAPTCHA v2
**位置**: 表单底部

**请手动完成验证**:
1. 在浏览器中找到 "I'm not a robot" 复选框
2. 点击复选框
3. 如需要，完成图片选择
4. 确认验证通过

完成后请告知我继续。
```

### 验证完成
```
## 验证码已完成

耗时: 15 秒
状态: 验证通过

继续申请流程...
```

### 无法完成
```
## 验证码处理失败

原因: 用户选择跳过

**选项**:
1. 重新加载页面
2. 稍后再试
3. 放弃此申请
```

## 预防措施

### 减少触发验证码
1. **请求间隔** - 操作之间添加延迟
2. **模拟人类行为** - 不要过快填写
3. **使用正常 User-Agent** - 不要伪装
4. **避免频繁刷新** - 减少页面加载

### 常见触发场景
- 短时间内多次申请
- 使用自动化工具被检测
- IP 地址异常
- 新账号或低信誉账号

## 注意事项

1. 验证码必须由用户手动完成
2. 不要尝试自动绕过验证码
3. 频繁出现验证码说明需要降低操作频率
4. 某些验证码可能需要较长时间
