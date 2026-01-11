---
name: generic_form_apply
description: 通用网页表单申请 - 最后的 fallback，适用于任何标准 HTML 表单。
trigger: ["generic apply", "通用申请", "表单申请"]
allowed-tools: mcp__chrome-devtools__navigate_page, mcp__chrome-devtools__take_snapshot, mcp__chrome-devtools__fill, mcp__chrome-devtools__fill_form, mcp__chrome-devtools__click, mcp__chrome-devtools__upload_file, mcp__chrome-devtools__take_screenshot, mcp__chrome-devtools__wait_for, Read, AskUserQuestion
---

# 通用网页表单申请技能 (Generic Form Apply)

## 概述

当其他平台特定的申请方式都不可用时，使用通用表单申请。这是一个 fallback 方案，支持标准的 HTML 表单。

**使用场景**:
- 公司自建申请系统
- 小型 ATS（Applicant Tracking System）
- LinkedIn 职位页面的内嵌表单
- 其他不常见的求职平台

**成功率**: ★★☆☆☆ (相比平台特定的申请方式较低)

## 申请流程

### Step 1: 打开职位页面

```
mcp__chrome-devtools__navigate_page({
  url: "{job_url}",
  type: "url"
})
```

### Step 2: 等待页面加载

```
mcp__chrome-devtools__wait_for({
  text: "Apply",
  timeout: 10000
})
```

### Step 3: 获取页面快照

```
mcp__chrome-devtools__take_snapshot({})
```

从快照中识别以下元素：

**基本字段**:
```
textbox "First Name" | "Name" | "Your Name"
textbox "Last Name" | "Surname"
textbox "Email" | "Email Address"
textbox "Phone" | "Phone Number"
```

**简历/文件上传**:
```
button "Attach" | "Upload" | "Choose File"
input[type="file"]
button "Browse"
```

**自定义问题**:
```
textarea "Tell us about..."
textarea "Why are you..."
combobox "Experience level"
```

**协议复选框**:
```
checkbox "I agree to"
checkbox "I consent to"
```

**提交按钮**:
```
button "Submit" | "Apply" | "Send Application"
```

### Step 4: 获取用户信息

```
Read config/profile.json
```

提取需要的字段：
- personal_info: first_name, last_name, email, phone
- online_presence: linkedin_url, github_url
- documents: resume_path
- work_authorization: 签证信息
- demographics: 如需要

### Step 5: 填写基本信息

识别出基本字段后，使用 fill_form 批量填写：

```
mcp__chrome-devtools__fill_form({
  elements: [
    { uid: "{first_name_uid}", value: "{first_name}" },
    { uid: "{last_name_uid}", value: "{last_name}" },
    { uid: "{email_uid}", value: "{email}" },
    { uid: "{phone_uid}", value: "{phone}" }
  ]
})
```

如果快照中没找到所有字段，一次性提交已找到的：

```
mcp__chrome-devtools__fill_form({
  elements: [
    // 可用的字段
  ]
})
```

### Step 6: 填写在线资料 (如有)

```
mcp__chrome-devtools__fill({
  uid: "{linkedin_uid}",
  value: "{linkedin_url}"
})

mcp__chrome-devtools__fill({
  uid: "{github_uid}",
  value: "{github_url}"
})
```

### Step 7: 检查是否有更多字段

填写后重新获取快照，检查是否有新的字段出现：

```
mcp__chrome-devtools__take_snapshot({})
```

常见的延迟加载字段：
- 自定义问题（可能需要先选择职位或经验等级）
- 地址字段（可能需要先选择国家）
- CAPTCHA（可能在最后才出现）

### Step 8: 填写自定义问题

对于自定义问题（如果有），按以下策略处理：

**如果有 QA 模板匹配**:
```
Read config/qa_templates.json
匹配问题 → 填入答案
```

**如果无模板匹配**:
```
AskUserQuestion: "问题: {question_text}"
等待用户输入答案
```

**快速处理**:
如果问题很多（> 3 个），可以：
1. 截图显示给用户
2. 询问用户是否同意用 AI 生成答案
3. 或询问用户手动修改

### Step 9: 处理复选框

通常需要勾选同意条款：

```
# 找到所有 checkbox
mcp__chrome-devtools__click({ uid: "{checkbox_uid}" })

# 重新获取快照确认勾选
mcp__chrome-devtools__take_snapshot({})
```

### Step 10: 上传简历

如果找到文件上传字段：

```
mcp__chrome-devtools__upload_file({
  uid: "{file_input_uid}",
  filePath: "/绝对路径/data/resumes/resume_main.pdf"
})

# 等待上传完成
mcp__chrome-devtools__wait_for({
  text: "resume" | "file" | "uploaded",
  timeout: 10000
})

# 重新获取快照确认上传
mcp__chrome-devtools__take_snapshot({})
```

### Step 11: 最终检查

重新获取快照，确保所有必填字段都已填写：

```
mcp__chrome-devtools__take_snapshot({})
```

检查清单：
- [ ] 基本信息已填 (姓名、邮箱、电话)
- [ ] 简历已上传 (或不需要上传)
- [ ] 自定义问题已回答
- [ ] 复选框已勾选
- [ ] 提交按钮可见且启用

如果有缺失，标记为"需要用户手动完成"。

### Step 12: 截图预览

```
mcp__chrome-devtools__take_screenshot({
  fullPage: true,
  format: "png",
  filePath: "/绝对路径/data/screenshots/{company}-generic-preview.png"
})
```

### Step 13: 用户确认 (必须！)

显示申请摘要，请求用户确认：

```
使用 AskUserQuestion 显示：
- 公司: {company}
- 职位: {position}
- 已填字段: {list}
- 可能缺失: {list}
- "是否提交？" [提交] [取消]
```

### Step 14: 提交申请

```
mcp__chrome-devtools__click({ uid: "{submit_button_uid}" })
```

### Step 15: 等待确认

```
mcp__chrome-devtools__wait_for({
  text: "Thank you" | "submitted" | "confirmation",
  timeout: 30000
})
```

或者等待 URL 变化（如跳转到确认页面）。

### Step 16: 保存确认截图

```
mcp__chrome-devtools__take_screenshot({
  fullPage: true,
  format: "png",
  filePath: "/绝对路径/data/screenshots/{company}-generic-confirmation.png"
})
```

### Step 17: 记录申请

保存申请记录：
```
{
  "method": "generic_form",
  "company": "{company}",
  "position": "{position}",
  "status": "applied",
  "applied_at": "{timestamp}",
  "fields_filled": "{list}",
  "fields_skipped": "{list}",
  "notes": "通用表单申请，{自定义备注}"
}
```

---

## 常见表单类型

### 类型 1: 简单表单 (最好处理)

只有 5-8 个字段：
- First Name
- Last Name
- Email
- Phone
- Resume
- Submit

**处理**: 快速填写，2-3 分钟完成

### 类型 2: 中等表单 (可处理)

10-15 个字段：
- 基本信息 (5 个)
- 在线资料 (2-3 个)
- 自定义问题 (3-5 个)
- 协议 (1 个)

**处理**: 需要用户对自定义问题确认，3-5 分钟

### 类型 3: 复杂表单 (难以处理)

20+ 个字段，含：
- 多步骤表单（需要点击"下一步"）
- 条件字段（基于上一个答案显示）
- 复杂的下拉框或多选
- 自由文本问题

**处理**: 建议用户手动填写，或使用 AskUserQuestion 逐步引导

### 类型 4: 无表单直接链接

某些职位直接链接到外部邮箱或招聘系统：
```
"请将简历发送至 careers@company.com"
```

**处理**: 无法自动化，提示用户手动申请

---

## 字段识别技巧

### 输入框识别

```
快照中查找:
- label "First Name" → 对应 textbox
- placeholder="First Name"
- name="first_name" 或 id="first_name"
- aria-label="First Name"
```

### 下拉框识别

```
combobox "Select experience level"
combobox with options: ["0-2 years", "3-5 years", ...]
```

点击后会显示 listbox 和 option 元素。

### 文件上传识别

```
button "Attach Resume"
button "Upload File"
input[type="file"]
```

### 复选框识别

```
checkbox "I agree to the terms"
checkbox "I agree to receive emails"
```

---

## 故障排查

| 问题 | 症状 | 解决 |
|------|------|------|
| 字段无法识别 | 快照中找不到字段 | 等待 3 秒后重新获取快照，可能需要 JavaScript 加载 |
| 文件上传失败 | 显示 "No file chosen" | 检查文件路径是否正确，使用绝对路径 |
| 表单提交无响应 | 点击后没反应 | 可能是 JavaScript 验证失败，检查必填字段 |
| 验证错误 | 显示 "Please fill all required fields" | 审查快照，找出缺失的必填字段 |
| CAPTCHA 出现 | 无法自动通过 | 提示用户手动完成验证码 |

---

## 最佳实践

1. **分步进行** - 先填基本信息，再上传简历，最后填问题
2. **重新获取快照** - 每次重要操作后都要获取快照，确认状态
3. **用户确认** - 对于任何不确定的字段，询问用户
4. **记录缺失** - 如果无法填某个字段，记录下来（便于后续追踪）
5. **设置超时** - 对于 wait_for，总是设置合理的 timeout（10-30s）

---

## 相关技能

- [decide_apply_method.md](decide_apply_method.md) - 申请方式路由器
- [greenhouse_apply.md](greenhouse_apply.md) - Greenhouse 平台申请
- [simplify_copilot_apply.md](simplify_copilot_apply.md) - Simplify 一键申请

