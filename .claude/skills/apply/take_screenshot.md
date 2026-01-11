---
name: take_screenshot
description: 截取申请表单的截图，用于记录和存档。支持全页截图和元素截图。
trigger: ["截图", "take screenshot", "保存截图"]
allowed-tools: mcp__chrome-devtools__take_screenshot, Bash
---

# Take Screenshot Skill

截取申请页面的截图。

## 输入参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| type | 截图类型 | "fullPage" |
| filename | 文件名 | "{company}-{date}-{type}.png" |
| uid | 元素 uid（可选） | null |

## 截图类型

| 类型 | 说明 | 用途 |
|------|------|------|
| preview | 提交前预览 | 确认填写内容 |
| confirmation | 提交后确认 | 证明已申请 |
| error | 错误页面 | 问题诊断 |
| full | 完整页面 | 存档 |

## 执行步骤

### Step 1: 确定保存路径

```
data/screenshots/{company}-{YYYY-MM-DD}-{type}.png
```

示例: `anthropic-2025-01-11-preview.png`

### Step 2: 截取全页截图

```
mcp__chrome-devtools__take_screenshot({
  fullPage: true,
  format: "png",
  filePath: "data/screenshots/anthropic-2025-01-11-preview.png"
})
```

### Step 3: 截取元素截图（可选）

如果只需要特定元素：

```
mcp__chrome-devtools__take_screenshot({
  uid: "{element_uid}",
  format: "png",
  filePath: "..."
})
```

### Step 4: 验证保存

确认文件已保存：
```bash
ls -la data/screenshots/anthropic-2025-01-11-preview.png
```

## 输出格式

```
## 截图已保存

类型: 提交前预览
文件: anthropic-2025-01-11-preview.png
路径: data/screenshots/
大小: 1.2 MB
分辨率: 1920 x 3200

截图时间: 2025-01-11 10:30:45

---

今日截图:
1. anthropic-2025-01-11-preview.png (1.2 MB)
2. stripe-2025-01-11-preview.png (980 KB)
3. stripe-2025-01-11-confirmation.png (450 KB)

总大小: 2.6 MB
```

## 截图命名规范

```
{company}-{date}-{type}.png

company: 公司名称（小写，去除空格）
date: YYYY-MM-DD 格式
type: preview / confirmation / error / full
```

示例：
- `anthropic-2025-01-11-preview.png`
- `anthropic-2025-01-11-confirmation.png`
- `meta-2025-01-11-preview.png`

## 截图质量设置

### PNG（默认）
- 无损压缩
- 适合存档
- 文件较大

### JPEG
```
mcp__chrome-devtools__take_screenshot({
  format: "jpeg",
  quality: 80,  // 0-100
  ...
})
```
- 有损压缩
- 文件较小
- 适合快速预览

### WebP
- 现代格式
- 质量好且文件小
- 部分工具不支持

## 注意事项

1. 全页截图可能很大（高度超过视口）
2. 确保敏感信息（如密码）不在截图中
3. 定期清理旧截图节省空间
4. 截图用于个人记录，不要分享
