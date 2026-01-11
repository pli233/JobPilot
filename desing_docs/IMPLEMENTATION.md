# Job Pilot - MCP 工具使用与配置

> 系统架构见 [ARCHITECTURE.md](ARCHITECTURE.md)
> 前端组件见 [FRONTEND.md](FRONTEND.md)

---

## 📋 MCP 工具速查

| MCP | 主要工具 | 用途 |
|-----|----------|------|
| linkedin | search_jobs, get_job_details, get_company_profile | LinkedIn 职位搜索 |
| firecrawl | firecrawl_scrape, firecrawl_search, firecrawl_extract | Indeed/Glassdoor 抓取 |
| chrome-devtools | take_snapshot, fill_form, click, upload_file | 浏览器自动化 |
| excel | write_data_to_excel, create_chart, create_table | 追踪表管理 |

---

## 1. LinkedIn MCP

### 工具列表

```typescript
// search_jobs - 搜索职位
await linkedin.search_jobs({ search_term: "Senior Python Engineer Bay Area" });

// get_job_details - 获取职位详情
await linkedin.get_job_details({ job_id: "4252026496" });

// get_company_profile - 获取公司信息
await linkedin.get_company_profile({
  company_name: "anthropic",
  get_employees: false  // true 会更慢
});

// get_person_profile - 获取个人资料
await linkedin.get_person_profile({ linkedin_username: "stickerdaniel" });

// get_recommended_jobs - 获取推荐职位
await linkedin.get_recommended_jobs({});
```

---

## 2. Firecrawl MCP

### 工具列表

```typescript
// firecrawl_search - 网页搜索 (推荐用于 Indeed/Glassdoor)
await firecrawl.firecrawl_search({
  query: "Senior Python Engineer site:indeed.com",
  limit: 20,
  sources: [{ type: "web" }]
});

// firecrawl_scrape - 抓取单个页面
await firecrawl.firecrawl_scrape({
  url: "https://www.indeed.com/viewjob?jk=xxx",
  formats: ["markdown"],
  onlyMainContent: true
});

// firecrawl_extract - 结构化提取
await firecrawl.firecrawl_extract({
  urls: ["https://indeed.com/job1", "https://indeed.com/job2"],
  prompt: "Extract job title, company, salary, description",
  schema: {
    type: "object",
    properties: {
      title: { type: "string" },
      company: { type: "string" },
      salary: { type: "string" },
      description: { type: "string" }
    }
  }
});

// firecrawl_map - 发现网站 URL
await firecrawl.firecrawl_map({
  url: "https://example.com/careers",
  search: "engineer",
  limit: 50
});
```

### Indeed/Glassdoor URL 模式

```
Indeed:    https://www.indeed.com/jobs?q={query}&l={location}&fromage={days}
Glassdoor: https://www.glassdoor.com/Job/jobs.htm?sc.keyword={query}
```

---

## 3. Chrome DevTools MCP

### 核心工具

```typescript
// ⚠️ 重要: 必须先 take_snapshot 获取 uid，uid 页面刷新后失效

// navigate_page - 导航
await chrome.navigate_page({
  url: "https://boards.greenhouse.io/company/jobs/xxx",
  type: "url"  // "url" | "back" | "forward" | "reload"
});

// take_snapshot - 获取页面元素 (返回带 uid 的元素树)
const snapshot = await chrome.take_snapshot({ verbose: false });
// 返回: 页面元素列表，每个元素有 uid 用于后续操作

// fill_form - 批量填写表单 (推荐)
await chrome.fill_form({
  elements: [
    { uid: "e1", value: "Peiyuan" },
    { uid: "e2", value: "Zhang" },
    { uid: "e3", value: "xxx@gmail.com" },
    { uid: "e4", value: "650-xxx-xxxx" }
  ]
});

// fill - 单个填写
await chrome.fill({ uid: "e5", value: "Open to discussion" });

// click - 点击元素
await chrome.click({ uid: "submit-btn", dblClick: false });

// upload_file - 上传文件
await chrome.upload_file({
  uid: "resume-input",
  filePath: "./data/resumes/resume_main.pdf"
});

// take_screenshot - 截图
await chrome.take_screenshot({
  fullPage: true,
  filePath: "./data/screenshots/application.png"
});

// wait_for - 等待文本出现
await chrome.wait_for({
  text: "Application submitted",
  timeout: 10000
});

// press_key - 按键
await chrome.press_key({ key: "Enter" });  // "Tab", "Control+A", etc.

// evaluate_script - 执行 JS
await chrome.evaluate_script({
  function: "() => document.title"
});
```

### 自动申请流程示例

```typescript
// 1. 打开申请页面
await chrome.navigate_page({ url: jobUrl, type: "url" });

// 2. 获取表单结构
const snapshot = await chrome.take_snapshot({});
// 分析 snapshot 找到 uid: first_name=e1, last_name=e2, email=e3...

// 3. 批量填写
await chrome.fill_form({
  elements: [
    { uid: "e1", value: preferences.first_name },
    { uid: "e2", value: preferences.last_name },
    { uid: "e3", value: preferences.email },
    { uid: "e4", value: preferences.phone }
  ]
});

// 4. 上传简历
await chrome.upload_file({
  uid: "resume-uid",
  filePath: "./data/resumes/resume_main.pdf"
});

// 5. 截图确认
await chrome.take_screenshot({
  filePath: "./data/screenshots/pre-submit.png"
});

// 6. 提交
await chrome.click({ uid: "submit-btn" });

// 7. 等待确认
await chrome.wait_for({ text: "submitted", timeout: 10000 });
```

---

## 4. Excel MCP

### 工具列表

```typescript
// create_workbook - 创建工作簿
await excel.create_workbook({ filepath: "./data/job_tracker.xlsx" });

// write_data_to_excel - 写入数据
await excel.write_data_to_excel({
  filepath: "./data/job_tracker.xlsx",
  sheet_name: "Applications",
  data: [
    ["ID", "Date", "Company", "Position", "Status", "Platform", "URL"],
    ["APP-001", "2025-01-10", "Anthropic", "Sr Python", "Applied", "LinkedIn", "https://..."]
  ],
  start_cell: "A1"
});

// read_data_from_excel - 读取数据
await excel.read_data_from_excel({
  filepath: "./data/job_tracker.xlsx",
  sheet_name: "Applications"
});

// create_table - 创建表格样式
await excel.create_table({
  filepath: "./data/job_tracker.xlsx",
  sheet_name: "Applications",
  data_range: "A1:G100",
  table_style: "TableStyleMedium9"
});

// create_chart - 创建图表
await excel.create_chart({
  filepath: "./data/job_tracker.xlsx",
  sheet_name: "Statistics",
  data_range: "A1:B5",
  chart_type: "bar",
  target_cell: "D2",
  title: "Application Status"
});

// format_range - 格式化
await excel.format_range({
  filepath: "./data/job_tracker.xlsx",
  sheet_name: "Applications",
  start_cell: "A1",
  end_cell: "G1",
  bold: true,
  bg_color: "#4472C4"
});
```

---

## 📊 Excel 追踪表设计

### Sheet: Applications

| Column | Type | Description |
|--------|------|-------------|
| ID | Text | APP-YYYYMMDD-001 |
| Date | Date | 申请日期 |
| Platform | Text | linkedin/indeed/glassdoor |
| Company | Text | 公司名称 |
| Position | Text | 职位名称 |
| Status | Text | applied/viewed/interview/rejected/offer |
| URL | URL | 职位链接 |
| Match Score | Number | 0-100 |
| Resume | Text | 使用的简历 |
| Notes | Text | 备注 |

### Sheet: Saved Jobs

| Column | Type | Description |
|--------|------|-------------|
| ID | Text | 职位 ID |
| Platform | Text | 来源 |
| Company | Text | 公司 |
| Position | Text | 职位 |
| Easy Apply | Boolean | 是否 Easy Apply |
| Match Score | Number | 匹配度 |
| Applied | Boolean | 是否已申请 |

---

## ⚙️ 配置文件

### claude_desktop_config.json

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-chrome-devtools"]
    },
    "firecrawl-mcp": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": { "FIRECRAWL_API_KEY": "your-api-key" }
    },
    "linkedin": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "-e", "LINKEDIN_COOKIE", "stickerdaniel/linkedin-mcp-server:latest"],
      "env": { "LINKEDIN_COOKIE": "your-cookie" }
    },
    "excel": {
      "command": "uvx",
      "args": ["excel-mcp-server", "stdio"]
    }
  }
}
```

### preferences.json

```json
{
  "personal_info": {
    "first_name": "Peiyuan",
    "last_name": "Zhang",
    "email": "xxx@gmail.com",
    "phone": "650-xxx-xxxx",
    "linkedin_url": "https://linkedin.com/in/xxx",
    "github_url": "https://github.com/xxx"
  },
  "search_preferences": {
    "default_keywords": ["Software Engineer", "Backend", "Python"],
    "default_location": "San Francisco Bay Area",
    "remote_preference": "remote",
    "salary_min": 150000,
    "excluded_companies": ["Staffing Agency"],
    "preferred_companies": ["Anthropic", "OpenAI", "Google"]
  },
  "application_settings": {
    "auto_submit": false,
    "save_screenshots": true,
    "daily_limit": 20
  },
  "common_answers": {
    "willing_to_relocate": "Yes",
    "work_authorization": "Authorized to work",
    "visa_sponsorship_required": "No",
    "salary_expectation": "Open to discussion"
  }
}
```

### qa_templates.json

```json
{
  "templates": [
    {
      "id": "why_company",
      "category": "why_company",
      "question_patterns": ["why .* interested", "why do you want to work"],
      "answer_template": "I'm drawn to {company}'s {mission}. With my background in {skill}, I'm excited about {contribution}.",
      "variables": ["company", "mission", "skill", "contribution"]
    },
    {
      "id": "salary",
      "category": "salary",
      "question_patterns": ["salary", "compensation"],
      "answer_template": "Based on my experience, I'm targeting {range}. However, I'm flexible and open to discussing total compensation.",
      "variables": ["range"]
    }
  ]
}
```

---

## 🚀 快速开始

```bash
# 1. 创建数据目录
mkdir -p ~/jobpilot/data/{resumes,screenshots}

# 2. 创建配置文件
touch ~/jobpilot/config/preferences.json
touch ~/jobpilot/config/qa_templates.json

# 3. 确保 MCP Servers 已配置 (见上方 claude_desktop_config.json)

# 4. 上传简历到 ~/jobpilot/data/resumes/

# 5. 在 Claude 中初始化
"初始化 JobPilot，创建 job_tracker.xlsx"
```

---

## ⚠️ 注意事项

| 项目 | 说明 |
|------|------|
| **chrome-devtools uid** | 必须先 take_snapshot，uid 页面刷新后失效 |
| **LinkedIn Cookie** | 1-2 周过期，需更新环境变量 |
| **速率限制** | LinkedIn 25次/天，Indeed/Glassdoor 30次/小时 |
| **申请间隔** | 建议 30 秒以上 |
| **数据备份** | 定期备份 job_tracker.xlsx |
