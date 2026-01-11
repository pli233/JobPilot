---
name: set_profile
description: 设置个人档案信息。更新 profile.json（个人信息、教育、工作经历等）。
trigger: ["设置个人信息", "set profile", "更新档案", "修改个人资料"]
allowed-tools: Read, Write, AskUserQuestion
---

# Set Profile Skill

设置和更新用户个人档案。

## 配置文件

- **个人档案**: `k:\JobPilot\config\profile.json`
- **求职偏好**: `k:\JobPilot\config\preferences.json` (另见 set_preferences)

## Profile 结构

### 1. 个人信息 (personal_info)

| 字段 | 说明 | 示例 |
|------|------|------|
| first_name | 名 | John |
| last_name | 姓 | Doe |
| full_name | 全名 | John Doe |
| email | 邮箱 | john@example.com |
| phone | 电话 | +1-555-123-4567 |
| address | 地址对象 | {city, state, zip_code, country} |

### 2. 在线信息 (online_presence)

| 字段 | 说明 | 示例 |
|------|------|------|
| linkedin_url | LinkedIn | https://linkedin.com/in/johndoe |
| github_url | GitHub | https://github.com/johndoe |
| portfolio_url | 作品集 | https://johndoe.dev |
| personal_website | 个人网站 | https://johndoe.com |

### 3. 教育经历 (education)

数组，每项包含：
| 字段 | 说明 |
|------|------|
| school | 学校名称 |
| degree | 学位 (Bachelor's, Master's, PhD) |
| field_of_study | 专业 |
| start_date | 开始日期 |
| end_date | 结束日期 |
| gpa | GPA |
| location | 地点 |

### 4. 工作经历 (work_experience)

数组，每项包含：
| 字段 | 说明 |
|------|------|
| company | 公司名称 |
| title | 职位 |
| location | 地点 |
| start_date | 开始日期 |
| end_date | 结束日期 |
| is_current | 是否当前工作 |
| description | 工作描述 |
| achievements | 成就列表 |

### 5. 技能 (skills)

| 字段 | 说明 |
|------|------|
| technical | 技术技能 |
| programming_languages | 编程语言 |
| frameworks | 框架 |
| tools | 工具 |
| soft_skills | 软技能 |
| languages | 语言能力 |

### 6. 工作授权 (work_authorization)

| 字段 | 说明 |
|------|------|
| authorized_to_work | 是否有工作许可 |
| requires_sponsorship | 是否需要签证赞助 |
| visa_status | 签证状态 |
| citizenship | 国籍 |

## 执行步骤

### Step 1: 读取当前档案

```
Read k:\JobPilot\config\profile.json
```

### Step 2: 询问要修改的部分

使用 AskUserQuestion 提供选项：
- 修改个人信息
- 修改在线链接
- 添加/编辑教育经历
- 添加/编辑工作经历
- 修改技能列表
- 修改工作授权信息
- 查看当前档案

### Step 3: 收集新值

根据选择，询问具体字段的新值。

### Step 4: 更新档案文件

使用 Write 工具更新 profile.json。

## 输出格式

```
## 档案已更新

修改的字段:
- personal_info.email: old@example.com → new@example.com
- online_presence.linkedin_url: (新增)

当前档案摘要:
- 姓名: John Doe
- 邮箱: new@example.com
- 电话: +1-555-123-4567
- 地点: San Francisco, CA
- LinkedIn: https://linkedin.com/in/johndoe
- 工作经历: 3 段
- 教育经历: 2 段
```

## 快速设置向导

如果是首次设置，依次询问：
1. 姓名、邮箱、电话
2. LinkedIn、GitHub 链接
3. 最近的工作经历
4. 最高学历
5. 主要技能
6. 工作授权状态

## 注意事项

1. 所有个人信息都存储在本地
2. 敏感信息（如 SSN）不应存储
3. 更新后建议运行简历一致性检查
