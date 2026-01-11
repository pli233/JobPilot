---
name: get_person_profile
description: 获取招聘官或联系人的 LinkedIn 信息。用于了解招聘负责人背景。
trigger: ["查看个人资料", "person profile", "招聘官信息", "联系人信息"]
allowed-tools: mcp__linkedin__get_person_profile, Read
---

# Get Person Profile Skill

获取 LinkedIn 个人资料信息。

## 输入参数

| 参数 | 说明 | 示例 |
|------|------|------|
| linkedin_username | LinkedIn 用户名 | "johndoe" |

从 URL 提取用户名：
- `https://linkedin.com/in/johndoe` → `johndoe`

## 执行步骤

### Step 1: 获取个人资料

```
mcp__linkedin__get_person_profile({
  linkedin_username: "johndoe"
})
```

### Step 2: 返回信息

LinkedIn 返回：
- 姓名
- 当前职位
- 公司
- 地点
- 个人简介
- 工作经历
- 教育背景
- 技能
- 联系方式（如果公开）

### 输出格式

```
## 个人资料: John Doe

### 基本信息
| 项目 | 信息 |
|------|------|
| 姓名 | John Doe |
| 职位 | Technical Recruiter |
| 公司 | Anthropic |
| 地点 | San Francisco Bay Area |

### 个人简介

Passionate about connecting talented engineers with amazing opportunities.
5+ years of technical recruiting experience in AI/ML companies.

### 工作经历

**Technical Recruiter** @ Anthropic
2022 - Present | San Francisco, CA
- Hiring for engineering, research, and product teams
- Built recruiting pipeline from scratch

**Senior Recruiter** @ Google
2019 - 2022 | Mountain View, CA
- Technical recruiting for Cloud and AI teams

### 教育背景

**UC Berkeley**
B.A. Psychology, 2015

### 技能

Technical Recruiting, Talent Acquisition, LinkedIn Recruiter,
Sourcing, Interviewing, Engineering Hiring

---

**建议操作**:
- 在申请时提及与招聘官的共同点
- 面试后可发送感谢信
```

## 用途

1. **了解招聘官背景** - 准备面试时参考
2. **找共同点** - 学校、前公司、兴趣
3. **定制 Cover Letter** - 提及招聘官发布的内容
4. **面试后跟进** - 发送个性化感谢信

## 找到招聘官

职位页面通常显示发布者，或者可以：
1. 搜索 "{公司名} recruiter"
2. 查看公司 LinkedIn 页面的员工
3. 查看职位描述中的联系人

## 注意事项

1. 尊重隐私，不要滥用信息
2. 仅获取公开信息
3. 不要过于频繁查询
4. 用于专业目的
