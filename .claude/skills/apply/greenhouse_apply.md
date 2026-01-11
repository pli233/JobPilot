---
name: greenhouse_apply
description: 完整的 Greenhouse 求职平台自动申请流程。支持自动填写基本信息、上传简历、填写自定义问题、Voluntary Self-Identification、截图和提交。
trigger: ["申请greenhouse", "greenhouse apply", "申请职位"]
allowed-tools: mcp__chrome-devtools__navigate_page, mcp__chrome-devtools__take_snapshot, mcp__chrome-devtools__fill, mcp__chrome-devtools__fill_form, mcp__chrome-devtools__click, mcp__chrome-devtools__upload_file, mcp__chrome-devtools__take_screenshot, mcp__chrome-devtools__wait_for, Read, Bash, AskUserQuestion
---

# Greenhouse 求职平台自动申请技能

## 概述

Greenhouse 是最常用的求职平台之一，被 Anthropic、Stripe、StubHub 等公司使用。本技能提供完整的自动申请流程。

## Greenhouse 表单结构

### 典型字段分布

| 区域 | 字段类型 | 示例字段 |
|------|----------|----------|
| 基本信息 | text/email/phone | First Name, Last Name, Email, Phone |
| 简历上传 | file input | Resume/CV |
| 在线资料 | text | LinkedIn URL, GitHub, Portfolio |
| 自定义问题 | combobox/textarea | Visa Sponsorship, Remote Work, Years of Experience |
| 协议确认 | checkbox | I agree to terms |
| Voluntary Self-ID | combobox | Gender, Hispanic/Latino, Race, Veteran, Disability |

### Greenhouse 特有元素识别

```
# 表单区域标识
heading "Apply for this job" level="2"

# 必填字段标识
StaticText "*"

# 下拉框结构
combobox "问题文本" autocomplete="list" expandable haspopup="menu"
  → 点击后出现 listbox 和 option 元素

# 文件上传
button "Attach" 或 button "Choose File"
  → 使用 upload_file 工具

# 提交按钮
button "Submit application"
```

## 完整申请流程

### Phase 1: 准备阶段

#### Step 1.1: 读取配置文件

```
Read config/profile.json        # 个人信息 + 人口统计信息
Read config/qa_templates.json   # 问答模板 (可选)
```

**profile.json 关键字段**:
```json
{
  "personal_info": {
    "first_name": "...",
    "last_name": "...",
    "email": "...",
    "phone": "..."
  },
  "online_presence": {
    "linkedin_url": "...",
    "github_url": "..."
  },
  "documents": {
    "resume_path": "data/resumes/{filename}.pdf"
  },
  "work_authorization": {
    "requires_sponsorship": true/false
  },
  "demographics": {
    "gender": "Male/Female/Decline to self-identify",
    "hispanic_latino": true/false,
    "race": ["Asian", ...],
    "veteran_status": "I am not a protected veteran",
    "disability_status": "No, I do not have a disability..."
  }
}
```

#### Step 1.2: 打开申请页面

```
mcp__chrome-devtools__navigate_page({
  url: "{job_url}",
  type: "url"
})
```

#### Step 1.3: 获取页面快照 (必须!)

```
mcp__chrome-devtools__take_snapshot({})
```

**重要**: 每次页面变化后都要重新获取快照，uid 会改变!

---

### Phase 2: 填写基本信息

#### Step 2.1: 识别基本字段

从快照中找到:
- `textbox "First Name"` → uid
- `textbox "Last Name"` → uid
- `textbox "Email"` → uid
- `textbox "Phone"` → uid

#### Step 2.2: 批量填写

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

#### Step 2.3: 填写在线资料 (如有)

```
mcp__chrome-devtools__fill({ uid: "{linkedin_uid}", value: "{linkedin_url}" })
mcp__chrome-devtools__fill({ uid: "{github_uid}", value: "{github_url}" })
```

---

### Phase 3: 上传简历

#### Step 3.1: 准备简历文件

简历命名建议: `{姓名} {职位类型}.pdf`
例如: `Peiyuan Li 26NG.pdf`

如需重命名:
```bash
cp "data/resumes/resume_main.pdf" "data/resumes/{新文件名}.pdf"
```

#### Step 3.2: 识别上传按钮

从快照中找到:
- `button "Attach"` 或
- `button "Choose File"` 或
- 带 `value="未选择任何文件"` 的 button

#### Step 3.3: 上传文件

```
mcp__chrome-devtools__upload_file({
  uid: "{attach_button_uid}",
  filePath: "/绝对路径/data/resumes/{filename}.pdf"
})
```

#### Step 3.4: 验证上传

重新获取快照，确认显示文件名:
```
StaticText "{filename}.pdf"
button "Remove file"
```

---

### Phase 4: 填写自定义问题

#### Step 4.1: 识别下拉框问题

常见问题类型:

| 问题关键词 | 典型答案 | 数据来源 |
|------------|----------|----------|
| sponsorship / H-1B / visa | Yes/No | work_authorization.requires_sponsorship |
| hybrid / remote / in-office | Yes/No | 根据职位要求 |
| years of experience | 0-3 Years, 3-5 Years... | 计算 work_experience |
| relocate | Yes/No | preferences |
| salary expectation | 数字或范围 | preferences.salary |

#### Step 4.2: 填写下拉框

**方法一**: 直接填写 (如果知道选项文本)
```
mcp__chrome-devtools__fill({
  uid: "{combobox_uid}",
  value: "Yes"
})
```

**方法二**: 点击后选择 (更可靠)
```
# 1. 点击下拉框
mcp__chrome-devtools__click({ uid: "{combobox_uid}" })

# 2. 获取快照查看选项
mcp__chrome-devtools__take_snapshot({})

# 3. 点击选项
mcp__chrome-devtools__click({ uid: "{option_uid}" })
```

#### Step 4.3: 勾选协议确认

```
mcp__chrome-devtools__click({ uid: "{checkbox_uid}" })
```

确认后快照显示: `checkbox "I agree" checked`

---

### Phase 5: Voluntary Self-Identification

#### Step 5.1: 字段清单

| 字段 | 选项示例 | 数据来源 |
|------|----------|----------|
| Gender | Male, Female, Decline to self-identify | demographics.gender |
| Hispanic/Latino | Yes, No | demographics.hispanic_latino |
| Race | Asian, Black or African American, White... | demographics.race |
| Veteran Status | I am not a protected veteran, I identify as... | demographics.veteran_status |
| Disability Status | No disability, Have disability, Do not wish to answer | demographics.disability_status |

#### Step 5.2: 逐个填写

对每个下拉框:
```
# 1. 点击下拉框
mcp__chrome-devtools__click({ uid: "{combobox_uid}" })

# 2. 获取快照，找到 listbox 中的 option
mcp__chrome-devtools__take_snapshot({})

# 3. 点击正确的选项
mcp__chrome-devtools__click({ uid: "{option_uid}" })
```

#### Step 5.3: 特殊情况 - Race 字段

Hispanic/Latino 选择 "No" 后会出现 Race 字段，需要重新获取快照。

---

### Phase 6: 截图预览

#### Step 6.1: 保存预览截图

```
mcp__chrome-devtools__take_screenshot({
  fullPage: true,
  format: "png",
  filePath: "/绝对路径/data/screenshots/{company}-{date}-preview.png"
})
```

#### Step 6.2: 请求用户确认

使用 AskUserQuestion 显示填写摘要并请求确认:

```
申请摘要:
- 公司: {company}
- 职位: {position}
- 简历: {resume_filename}
- 所有字段已填写

确认提交?
[提交] [取消]
```

---

### Phase 7: 提交申请

#### Step 7.1: 点击提交按钮

```
mcp__chrome-devtools__click({ uid: "{submit_button_uid}" })
```

#### Step 7.2: 处理验证码 (如有)

Greenhouse 可能要求邮箱验证码:
```
"A verification code was sent to {email}. Enter the 8-character code..."
```

→ 提示用户检查邮箱，手动输入验证码

#### Step 7.3: 等待确认页面

```
mcp__chrome-devtools__wait_for({
  text: "Thank you",
  timeout: 30000
})
```

#### Step 7.4: 保存确认截图

```
mcp__chrome-devtools__take_screenshot({
  fullPage: true,
  format: "png",
  filePath: "/绝对路径/data/screenshots/{company}-{date}-confirmation.png"
})
```

---

## 常见问题处理

### 问题 1: 下拉框填写失败

**症状**: `Could not find option with text "..."`

**解决**: 使用点击选择法
```
mcp__chrome-devtools__click({ uid: "{combobox_uid}" })  # 打开
mcp__chrome-devtools__take_snapshot({})                  # 查看选项
mcp__chrome-devtools__click({ uid: "{option_uid}" })     # 选择
```

### 问题 2: 文件上传后不显示

**解决**: 检查文件路径是否为绝对路径，重新获取快照确认

### 问题 3: 页面元素找不到

**解决**: 页面可能滚动或刷新，重新 take_snapshot

### 问题 4: 提交按钮禁用

**原因**: 必填字段未填写或验证码未完成

**解决**: 检查页面错误提示，填写遗漏字段

### 问题 5: 验证码 / CAPTCHA

**处理**:
1. 邮箱验证码 → 提示用户手动输入
2. reCAPTCHA → 通常自动完成，如需人工验证则提示用户

---

## 输出格式

### 申请成功

```
## 申请提交成功

**公司**: {company}
**职位**: {position}
**提交时间**: {datetime}

**截图已保存**:
- 预览: {company}-{date}-preview.png
- 确认: {company}-{date}-confirmation.png

**下一步**:
- 登录 MyGreenhouse 追踪申请状态
- 运行 tracker/add_application 记录此申请
```

### 申请失败

```
## 申请提交失败

**错误**: {error_message}

**可能原因**:
1. 必填字段未填写
2. 验证码未完成
3. 已申请过此职位

**截图已保存**: {company}-{date}-error.png

**建议**: 检查表单错误提示，手动修复后重试
```

---

## 最佳实践

1. **始终先 take_snapshot** - 这是获取 uid 的唯一方式
2. **uid 会过期** - 页面刷新后必须重新获取
3. **用户确认再提交** - 永远不要自动提交
4. **保存截图** - 作为申请记录的证据
5. **更新 profile.json** - 保存人口统计信息供未来使用
6. **简历命名** - 使用有意义的文件名，HR 能看到

---

## 相关技能

- [fill_basic_info.md](fill_basic_info.md) - 基本信息填写
- [upload_resume.md](upload_resume.md) - 简历上传
- [submit_form.md](submit_form.md) - 表单提交
- [take_screenshot.md](take_screenshot.md) - 截图保存
- [check_duplicate.md](check_duplicate.md) - 重复检查
