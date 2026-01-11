---
name: analyze_form
description: 分析申请表单结构，识别所有输入字段、下拉框、文件上传、提交按钮等。
trigger: ["分析表单", "analyze form", "识别字段"]
allowed-tools: mcp__chrome-devtools__take_snapshot, Read
---

# Analyze Form Skill

分析申请表单结构，识别所有字段。

## 前置条件

- 已打开申请页面 (open_apply_page)
- 页面已完全加载

## 执行步骤

### Step 1: 获取页面快照

```
mcp__chrome-devtools__take_snapshot({
  verbose: true
})
```

`verbose: true` 返回更详细的元素信息。

### Step 2: 分析快照内容

从快照中识别以下元素类型：

#### 输入字段 (input)
| 类型 | 识别特征 | 常见 name/label |
|------|----------|-----------------|
| text | type="text" | first_name, last_name, name |
| email | type="email" | email, email_address |
| tel | type="tel" | phone, phone_number |
| url | type="url" | linkedin, github, portfolio |
| number | type="number" | experience_years, salary |

#### 文本区域 (textarea)
- cover_letter
- why_interested
- additional_info

#### 下拉选择 (select)
- work_authorization
- willing_to_relocate
- gender, ethnicity (EEO)

#### 单选/多选 (radio/checkbox)
- yes/no 问题
- 同意条款

#### 文件上传 (file)
- resume
- cover_letter
- portfolio

#### 按钮 (button)
- submit
- next (多页表单)
- save_draft

### Step 3: 字段映射

将识别的字段映射到配置文件中的值：

**数据来源**:
- 个人信息: `profile.json`
- 求职偏好: `preferences.json`
- 问答模板: `qa_templates.json`

```json
{
  "form_fields": [
    {
      "uid": "e1",
      "type": "input",
      "field_type": "text",
      "label": "First Name",
      "source": "profile.json",
      "mapped_to": "personal_info.first_name",
      "required": true
    },
    {
      "uid": "e2",
      "type": "input",
      "field_type": "email",
      "label": "Email",
      "source": "profile.json",
      "mapped_to": "personal_info.email",
      "required": true
    },
    {
      "uid": "e5",
      "type": "file",
      "label": "Resume",
      "source": "profile.json",
      "mapped_to": "documents.resume_path",
      "required": true
    },
    {
      "uid": "e8",
      "type": "textarea",
      "label": "Why are you interested?",
      "source": "qa_templates.json",
      "mapped_to": "templates:why_company",
      "required": false
    }
  ]
}
```

## 输出格式

```
## 表单分析结果

页面: https://boards.greenhouse.io/company/jobs/123
检测到 {count} 个字段

### 基本信息字段 (可自动填写)

| UID | 类型 | 标签 | 映射到 | 必填 |
|-----|------|------|--------|------|
| e1 | text | First Name | personal_info.first_name | Yes |
| e2 | text | Last Name | personal_info.last_name | Yes |
| e3 | email | Email | personal_info.email | Yes |
| e4 | tel | Phone | personal_info.phone | Yes |
| e5 | url | LinkedIn | personal_info.linkedin_url | No |

### 文件上传

| UID | 标签 | 支持格式 | 映射到 |
|-----|------|----------|--------|
| e6 | Resume | PDF, DOCX | resume_main.pdf |
| e7 | Cover Letter | PDF | - (需生成) |

### 问答字段 (需要匹配模板)

| UID | 问题 | 匹配模板 |
|-----|------|----------|
| e8 | Why are you interested in this role? | why_company |
| e9 | What is your salary expectation? | salary |
| e10 | When can you start? | availability |

### 选择字段

| UID | 标签 | 选项 | 默认值 |
|-----|------|------|--------|
| e11 | Work Authorization | [Authorized, Need Sponsorship] | Authorized |
| e12 | Willing to Relocate | [Yes, No, Maybe] | Yes |

### 提交按钮

| UID | 文本 |
|-----|------|
| e15 | Submit Application |

---

**下一步**: 运行 fill_basic_info 填写基本信息字段
```

## 字段类型识别规则

### 姓名字段
- label 包含: name, first, last, 名, 姓
- placeholder 包含: name

### 邮箱字段
- type="email"
- label 包含: email, 邮箱
- name 包含: email

### 电话字段
- type="tel"
- label 包含: phone, tel, 电话

### 简历上传
- type="file"
- accept 包含: .pdf, .doc
- label 包含: resume, cv, 简历

## 注意事项

1. 某些字段可能隐藏直到填写前置字段
2. 动态加载的字段需要等待出现
3. 多页表单需要逐页分析
4. EEO 字段通常是可选的
