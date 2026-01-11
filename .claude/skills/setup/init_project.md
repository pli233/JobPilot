---
name: init_project
description: 初始化 JobPilot 项目结构：创建目录、Excel 追踪表、配置文件。用于新项目或重置项目。
trigger: ["初始化项目", "init project", "创建项目", "setup project"]
allowed-tools: mcp__excel__create_workbook, mcp__excel__create_worksheet, mcp__excel__write_data_to_excel, mcp__excel__rename_worksheet, Bash, Write, Read
---

# Init Project Skill

初始化 JobPilot 项目结构。

## 执行步骤

### Step 1: 创建目录结构

```bash
mkdir -p .claude/skills/setup
mkdir -p .claude/skills/search
mkdir -p .claude/skills/apply
mkdir -p .claude/skills/tracker
mkdir -p .claude/skills/utils
mkdir -p data/resumes
mkdir -p data/screenshots
mkdir -p config
```

### Step 2: 创建 Excel 追踪表

如果 `data/job_tracker.xlsx` 不存在：

1. 创建工作簿
```
mcp__excel__create_workbook({ filepath: "data/job_tracker.xlsx" })
```

2. 重命名默认工作表为 Applications
```
mcp__excel__rename_worksheet({ filepath: "...", old_name: "Sheet1", new_name: "Applications" })
```

3. 写入 Applications 表头
```
mcp__excel__write_data_to_excel({
  filepath: "data/job_tracker.xlsx",
  sheet_name: "Applications",
  data: [["ID", "Date", "Platform", "Company", "Position", "Location", "Status", "Match Score", "Resume", "URL", "Notes"]],
  start_cell: "A1"
})
```

4. 创建 Saved Jobs 工作表
```
mcp__excel__create_worksheet({ filepath: "...", sheet_name: "Saved Jobs" })
```

5. 写入 Saved Jobs 表头
```
mcp__excel__write_data_to_excel({
  filepath: "data/job_tracker.xlsx",
  sheet_name: "Saved Jobs",
  data: [["ID", "Platform", "Company", "Position", "Location", "Salary", "Easy Apply", "Match Score", "Saved At", "Applied"]],
  start_cell: "A1"
})
```

### Step 3: 创建个人档案文件 (profile.json)

如果 `config/profile.json` 不存在，创建默认档案：

```json
{
  "personal_info": {
    "first_name": "",
    "last_name": "",
    "full_name": "",
    "email": "",
    "phone": "",
    "address": {
      "street": "",
      "city": "",
      "state": "",
      "zip_code": "",
      "country": "United States"
    }
  },
  "online_presence": {
    "linkedin_url": "",
    "github_url": "",
    "portfolio_url": "",
    "personal_website": ""
  },
  "education": [],
  "work_experience": [],
  "skills": {
    "technical": [],
    "programming_languages": [],
    "frameworks": [],
    "tools": [],
    "languages": [{"language": "English", "proficiency": "Native"}]
  },
  "certifications": [],
  "projects": [],
  "documents": {
    "resume_path": "data/resumes/resume_main.pdf"
  },
  "work_authorization": {
    "authorized_to_work": true,
    "requires_sponsorship": false,
    "visa_status": "",
    "citizenship": ""
  },
  "professional_summary": ""
}
```

### Step 4: 创建求职偏好文件 (preferences.json)

如果 `config/preferences.json` 不存在，创建默认偏好：

```json
{
  "job_search": {
    "keywords": ["Software Engineer"],
    "titles": [],
    "locations": [],
    "remote_preference": "remote",
    "job_types": ["Full-time"],
    "experience_levels": []
  },
  "salary": {
    "minimum": 0,
    "currency": "USD",
    "period": "yearly"
  },
  "companies": {
    "preferred": [],
    "excluded": []
  },
  "application": {
    "auto_submit": false,
    "require_confirmation": true,
    "save_screenshots": true,
    "daily_limit": 20,
    "min_match_score": 60
  },
  "filters": {
    "posted_within_days": 7,
    "exclude_staffing": true
  }
}
```

### Step 5: 创建 QA 模板文件 (qa_templates.json)

如果 `config/qa_templates.json` 不存在，创建默认模板：

```json
{
  "templates": []
}
```

## 配置文件说明

| 文件 | 用途 |
|------|------|
| profile.json | 个人档案：姓名、联系方式、教育、工作经历、技能等 |
| preferences.json | 求职偏好：搜索关键词、薪资期望、公司偏好等 |
| qa_templates.json | 问答模板：常见申请问题的预设答案 |

## 输出

初始化完成后显示：

```
## 项目初始化完成

已创建目录:
- .claude/skills/ (setup, search, apply, tracker, utils)
- data/resumes/
- data/screenshots/
- config/

已创建文件:
- data/job_tracker.xlsx (Applications + Saved Jobs)
- config/profile.json (个人档案)
- config/preferences.json (求职偏好)
- config/qa_templates.json (问答模板)

下一步:
1. 运行 "设置个人信息" 完善 profile.json
2. 运行 "设置求职偏好" 完善 preferences.json
3. 上传简历到 data/resumes/
4. 添加常见问答模板
```
