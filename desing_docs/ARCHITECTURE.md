# Job Pilot - 系统架构设计

> 详细 MCP 工具参数见 [IMPLEMENTATION.md](IMPLEMENTATION.md)
> 前端组件代码见 [FRONTEND.md](FRONTEND.md)

---

## 🎯 项目概述

Job Pilot 是一个基于 MCP (Model Context Protocol) 的自动化求职系统：
- 多平台职位搜索 (LinkedIn, Indeed, Glassdoor)
- 智能匹配与自动填表申请
- Next.js Dashboard 可视化管理

---

## 🛠️ MCP 工具映射

| MCP Server | 在 Job Pilot 中的用途 |
|------------|----------------------|
| **chrome-devtools** | → Browser Automation (填表、点击、截图) |
| **firecrawl-mcp** | → Job Search Aggregator (Indeed/Glassdoor 抓取) |
| **linkedin** | → Job Search Aggregator (LinkedIn 搜索) |
| **excel** | → Storage Manager (追踪表、报告导出) |
| **shadcn** | → Frontend Dashboard (UI 组件) |
| **tailwindcss-server** | → Frontend Dashboard (样式) |

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Job Pilot System                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐    ┌──────────────────────────────────────────────┐  │
│  │   Claude     │    │              MCP Servers Layer                │  │
│  │   Desktop    │◄──►│  ┌────────────┐  ┌────────────┐  ┌─────────┐ │  │
│  │   or Code    │    │  │ Browser    │  │ Job Search │  │ Storage │ │  │
│  └──────────────┘    │  │ Automation │  │ Aggregator │  │ Manager │ │  │
│         │            │  │            │  │            │  │         │ │  │
│         │            │  │ (chrome-   │  │ (linkedin  │  │ (excel  │ │  │
│         │            │  │  devtools) │  │  firecrawl)│  │  sqlite)│ │  │
│         │            │  └─────┬──────┘  └─────┬──────┘  └────┬────┘ │  │
│         │            └────────┼───────────────┼──────────────┼──────┘  │
│         ▼                     ▼               ▼              ▼         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    Next.js Full-Stack Dashboard                   │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │                 Frontend (shadcn/ui + Tailwind)             │  │  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │  │  │
│  │  │  │Dashboard │ │Job Search│ │Kanban    │ │ Settings     │   │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │                 Backend (API Routes + Server Actions)       │  │  │
│  │  │  ┌─────────┐ ┌─────────┐ ┌──────────────┐ ┌────────────┐   │  │  │
│  │  │  │ Resume  │ │ Q&A     │ │ Application  │ │  Export    │   │  │  │
│  │  │  │ Parser  │ │ Matcher │ │   Tracker    │ │  Service   │   │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                        │                               │
│                                        ▼                               │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                          Data Layer                               │  │
│  │  ┌─────────┐ ┌─────────┐ ┌──────────────┐ ┌──────────────────┐   │  │
│  │  │ SQLite  │ │ Resume  │ │ Screenshots  │ │ Excel Reports    │   │  │
│  │  │ DB      │ │ Storage │ │ Storage      │ │ (via Excel MCP)  │   │  │
│  │  └─────────┘ └─────────┘ └──────────────┘ └──────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 项目结构

```
jobpilot/
├── packages/
│   ├── mcp-browser/           # 浏览器自动化 MCP Server
│   │   └── src/
│   │       ├── index.ts
│   │       └── tools/         # navigate, click, fill, screenshot
│   │
│   ├── mcp-jobsearch/         # 职位搜索聚合 MCP Server
│   │   └── src/
│   │       ├── index.ts
│   │       └── platforms/     # linkedin.ts, indeed.ts, glassdoor.ts
│   │
│   ├── mcp-storage/           # 数据存储 MCP Server
│   │   └── src/
│   │       ├── index.ts
│   │       └── db/schema.ts
│   │
│   └── dashboard/             # Next.js Dashboard
│       └── src/
│           ├── app/           # App Router 页面
│           ├── components/    # React 组件
│           └── lib/db/        # Drizzle ORM
│
├── data/
│   ├── resumes/               # 简历 PDF
│   ├── db/                    # SQLite 数据库
│   └── screenshots/           # 申请截图
│
├── config/
│   ├── preferences.json       # 用户偏好
│   └── qa_templates.json      # 问答模板
│
└── docs/
```

---

## 🔧 核心 MCP Servers 设计

### 1. Browser Automation Server

封装 `chrome-devtools` MCP，提供高级浏览器操作。

| Tool | 底层调用 | 用途 |
|------|----------|------|
| browser_navigate | navigate_page | 打开申请页面 |
| browser_fill_form | fill_form | 批量填写表单 |
| browser_upload | upload_file | 上传简历 |
| browser_screenshot | take_screenshot | 保存申请截图 |
| browser_extract | take_snapshot | 获取页面元素 uid |

### 2. Job Search Aggregator Server

聚合 `linkedin` + `firecrawl` MCP 的多平台搜索。

| Tool | 底层调用 | 用途 |
|------|----------|------|
| job_search | linkedin:search_jobs + firecrawl:search | 统一搜索接口 |
| job_details | linkedin:get_job_details / firecrawl:scrape | 获取详情 |
| job_match | 本地计算 | 简历匹配评分 |

### 3. Storage Manager Server

管理数据存储，集成 `excel` MCP 导出功能。

| Tool | 底层调用 | 用途 |
|------|----------|------|
| application_create | SQLite insert | 记录申请 |
| application_update | SQLite update | 更新状态 |
| export_excel | excel:write_data_to_excel | 导出报告 |
| qa_search | SQLite + 语义匹配 | 搜索问答模板 |

---

## 🔄 核心工作流

### Flow 1: 职位搜索

```
用户输入 "搜索 Remote Python 职位"
         │
         ▼
┌─────────────────────────────────────┐
│  Claude 解析意图，并行调用:          │
│  • linkedin: search_jobs            │
│  • firecrawl: search Indeed         │
│  • firecrawl: search Glassdoor      │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  合并去重 → 匹配评分 → 排序         │
└─────────────────────────────────────┘
         │
         ▼
   返回 Top N 职位列表
```

### Flow 2: 自动申请

```
用户: "申请这个职位"
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│  chrome-devtools: navigate_page (打开申请页面)               │
│           ▼                                                  │
│  chrome-devtools: take_snapshot (获取表单元素 uid)           │
│           ▼                                                  │
│  chrome-devtools: fill_form (填写基本信息)                   │
│           ▼                                                  │
│  chrome-devtools: upload_file (上传简历)                     │
│           ▼                                                  │
│  遇到问答题 → qa_search 匹配 / AI 生成 → 用户确认           │
│           ▼                                                  │
│  chrome-devtools: take_screenshot (截图保存)                 │
│           ▼                                                  │
│  chrome-devtools: click (提交申请)                           │
│           ▼                                                  │
│  excel: write_data_to_excel (记录到追踪表)                   │
└──────────────────────────────────────────────────────────────┘
```

### Flow 3: 问答匹配

```
表单问题: "Why do you want to work here?"
         │
         ▼
┌────────────────────────────────────┐
│  qa_search 语义匹配现有模板         │
│  匹配度 > 0.8 → 使用模板 + 变量替换 │
│  匹配度 < 0.8 → Claude AI 生成     │
└────────────────────────────────────┘
         │
         ▼
   用户确认/编辑 → 保存为新模板
```

---

## 📊 数据模型

### Job (职位)

```typescript
interface Job {
  id: string;
  platform: 'linkedin' | 'indeed' | 'glassdoor';
  title: string;
  company: string;
  location: string;
  locationType: 'remote' | 'hybrid' | 'onsite';
  salary?: { min: number; max: number };
  url: string;
  easyApply: boolean;
  matchScore?: number;
}
```

### Application (申请)

```typescript
interface Application {
  id: string;
  jobId: string;
  resumeId: string;
  status: 'draft' | 'applied' | 'viewed' | 'interview' | 'rejected' | 'offer';
  appliedAt: Date;
  notes?: string;
  screenshotPath?: string;
}
```

---

## 🛡️ 安全考虑

1. **凭证管理**: LinkedIn Cookie 存环境变量，定期更新
2. **速率限制**: LinkedIn 25次/天，Indeed 30次/小时
3. **防检测**: 操作间隔 30秒+，随机延迟
4. **数据备份**: 定期备份 SQLite 和 Excel 追踪表
