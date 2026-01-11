---
name: decide_apply_method
description: 检测职位申请平台，优先选择 Simplify，然后 fallback 到 Greenhouse、Ashby、Workday 等。
trigger: ["决定申请方式", "detect apply method", "选择申请平台"]
allowed-tools: mcp__chrome-devtools__navigate_page, mcp__chrome-devtools__take_snapshot, mcp__chrome-devtools__wait_for, Read
---

# 申请方式决策器 (Decide Apply Method)

## 概述

本技能的职责是：
1. 打开职位页面
2. 分析页面，检测可用的申请方式
3. 按优先级返回推荐的申请策略

这是申请流程的**第一步**，决定接下来使用哪个专门的申请技能。

## 申请方式优先级

```
优先级 1: Simplify Copilot     (最快，只需点击)
优先级 2: Greenhouse            (常见平台，有专门技能)
优先级 3: Ashby                 (Y Combinator 公司常用)
优先级 4: Workday               (大型企业)
优先级 5: Lever                 (中型公司常用)
优先级 6: 通用网页表单          (fallback)
```

## 执行流程

### Step 1: 打开职位页面

```
mcp__chrome-devtools__navigate_page({
  url: "{job_url}",
  type: "url"
})
```

### Step 2: 等待页面加载完成

```
mcp__chrome-devtools__wait_for({
  text: "Apply",
  timeout: 10000
})
```

失败也继续（某些页面可能文本不同）。

### Step 3: 获取页面快照

```
mcp__chrome-devtools__take_snapshot({})
```

### Step 4: 分析快照，逐一检测

按照优先级顺序检测：

#### 4.1 检测 Simplify Copilot

快照中查找以下元素：

```
button "Simplify your application"
button "Apply with Simplify"
button contains "Simplify" with icon
```

如果找到 **且按钮可见且启用**:
```
✓ 推荐: Simplify Copilot
  执行: simplify_copilot_apply 技能
```

#### 4.2 检测 Greenhouse

快照中查找以下元素和特征：

```
heading "Apply for this job"
text "greenhouse.io"
URL contains "greenhouse.io"
button "Submit application"
heading level 2 or 3 starting with "Apply"
```

如果找到且 URL 或页面内容包含 "greenhouse":
```
✓ 推荐: Greenhouse 申请平台
  执行: greenhouse_apply 技能
```

#### 4.3 检测 Ashby

快照中查找以下元素：

```
text "Ashby"
URL contains "ashby.com"
form with class "ashby-form" or id containing "ashby"
button with "Ashby" text
```

如果找到:
```
✓ 推荐: Ashby 申请平台
  执行: ashby_apply 技能 (如果存在)
```

#### 4.4 检测 Workday

快照中查找以下元素：

```
URL contains "workday.com"
text "Workday"
javascript variable "workdayConfig"
form with Workday-specific styling
```

如果找到:
```
✓ 推荐: Workday 申请平台
  执行: workday_apply 技能 (如果存在)
```

#### 4.5 检测 Lever

快照中查找以下元素：

```
URL contains "lever.co"
text "Lever"
form with class or id containing "lever"
button with "Lever" reference
```

如果找到:
```
✓ 推荐: Lever 申请平台
  执行: lever_apply 技能 (如果存在)
```

#### 4.6 检测通用表单 (Fallback)

快照中查找通用 HTML 表单元素：

```
form element
input[type="text"] for name/email
input[type="file"] for resume
button with "Submit" or "Apply" text
```

如果找到:
```
✓ 推荐: 通用网页表单
  执行: generic_form_apply 技能
```

### Step 5: 返回决策结果

输出格式：

```json
{
  "detected_method": "simplify",  // or "greenhouse", "ashby", etc.
  "confidence": 95,               // 置信度 0-100
  "url": "{job_url}",
  "company": "{company_name}",
  "position": "{job_title}",
  "next_skill": "simplify_copilot_apply",
  "details": {
    "has_simplify_button": true,
    "simplify_button_uid": "...",
    "button_visible": true,
    "button_enabled": true
  }
}
```

---

## 检测规则详解

### Simplify Copilot 检测

**条件** (ALL 必须满足):
- [ ] 快照中存在包含 "Simplify" 的按钮
- [ ] 按钮的 `display` 不是 `none`
- [ ] 按钮的 `visibility` 不是 `hidden`
- [ ] 按钮不是 `disabled` 状态
- [ ] 按钮不在 modal 内且 modal 未关闭

**优先级提升**:
- 如果按钮标签明确说 "One-click apply" → 优先级 +10
- 如果近期有 Simplify 更新适配此公司 → 优先级 +5

### Greenhouse 检测

**强指标** (任一满足):
- URL 包含 "greenhouse.io"
- 页面包含 heading "Apply for this job"
- 表单包含 Greenhouse 特有的字段结构

**弱指标**:
- 按钮文本为 "Submit application"
- 输入框标签包含 Greenhouse 风格

### 平台检测通用规则

**确定指标**: URL 明确包含平台域名
```
greenhouse.io → Greenhouse
ashby.com → Ashby
workday.com → Workday
lever.co → Lever
```

**推断指标**: 页面内容或 JavaScript 变量
```
window.ashbyConfig → Ashby
window.workdayConfig → Workday
```

---

## 失败恢复

### 检测结果为空

如果没有检测到任何已知平台的特征：

1. 再等 3 秒
2. 重新获取快照
3. 如果仍未检测到 → 默认为 "通用表单"

### Simplify 按钮存在但禁用

如果按钮存在但 disabled:

```
检查禁用原因 →
  可能需要先填写某些字段 →
  fallback 到平台特定申请
```

### 多个平台检测到

如果快照同时显示多个平台的特征（罕见，但可能发生）：

1. 选择优先级最高的
2. 如果优先级相同，选择 URL 匹配的（更可靠）

---

## 快速查询表

| URL 特征 | 检测平台 | 技能 | 支持度 |
|----------|---------|------|--------|
| greenhouse.io | Greenhouse | greenhouse_apply | ★★★★★ |
| ashby.com | Ashby | ashby_apply | ★★★★☆ |
| workday.com | Workday | workday_apply | ★★★☆☆ |
| lever.co | Lever | lever_apply | ★★★☆☆ |
| Simplify 按钮 | Simplify | simplify_copilot_apply | ★★★★★ |
| 通用表单 | 通用 | generic_form_apply | ★★☆☆☆ |

---

## 最佳实践

1. **始终先检测 Simplify** - 这是最佳选择
2. **URL 优于页面内容** - URL 更可靠
3. **如果不确定，ask user** - 可以询问用户选择
4. **记录决策** - 保存选择的方法，便于优化算法

---

## 相关技能

- [simplify_copilot_apply.md](simplify_copilot_apply.md) - Simplify 一键申请
- [greenhouse_apply.md](greenhouse_apply.md) - Greenhouse 平台申请
- [generic_form_apply.md](generic_form_apply.md) - 通用表单申请

