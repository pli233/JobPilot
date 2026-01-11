# CLAUDE.md - JobPilot 开发指南

## 项目概述

JobPilot 是一个基于 MCP 的自动化求职系统，支持 LinkedIn/Indeed/Glassdoor 多平台搜索和自动申请，配有 Next.js Dashboard 可视化界面。

## 文档导航

| 任务类型 | 参考文档 | 说明 |
|----------|----------|------|
| **系统设计** | [ARCHITECTURE.md](desing_docs/ARCHITECTURE.md) | 系统架构、MCP 映射、项目结构、工作流程 |
| **MCP 工具使用** | [IMPLEMENTATION.md](desing_docs/IMPLEMENTATION.md) | 各 MCP 详细参数、代码示例、配置文件 |
| **前端开发** | [FRONTEND.md](desing_docs/FRONTEND.md) | Next.js 组件、页面设计、Drizzle Schema |
| **使用示例** | [USAGE_EXAMPLES.md](desing_docs/USAGE_EXAMPLES.md) | UI 交互、Claude 对话示例 |

## 核心 MCP 工具

```
chrome-devtools  → 浏览器自动化 (填表、点击、截图)
linkedin         → 职位搜索、公司信息
firecrawl-mcp    → Indeed/Glassdoor 抓取
excel            → 申请记录追踪、报告导出
```

## 技术栈

- **后端**: MCP Servers (TypeScript)
- **前端**: Next.js 15 + shadcn/ui + Tailwind CSS
- **数据库**: SQLite + Drizzle ORM
- **存储**: Excel 追踪表 + 本地文件

## 项目结构

```
jobpilot/
├── packages/
│   ├── mcp-browser/      # 浏览器自动化封装
│   ├── mcp-jobsearch/    # 职位搜索聚合
│   ├── mcp-storage/      # 数据存储管理
│   └── dashboard/        # Next.js 前端
├── data/
│   ├── resumes/          # 简历 PDF
│   ├── screenshots/      # 申请截图
│   └── job_tracker.xlsx  # 追踪表
└── config/
    └── preferences.json  # 用户偏好
```

## 常用开发命令

```bash
# 前端开发
cd packages/dashboard && npm run dev

# 添加 shadcn 组件
npx shadcn@latest add button card dialog

# 数据库迁移
npx drizzle-kit push

# MCP Server 构建
npm run build -w packages/mcp-browser
```

## 核心工作流

### 1. 职位搜索
```
User → Claude → linkedin:search_jobs + firecrawl:search → 结果去重排序 → 显示
```

### 2. 自动申请
```
Claude → chrome-devtools:navigate → take_snapshot → fill_form → upload_file → click(submit) → screenshot → excel:write
```

### 3. 状态追踪
```
Dashboard Kanban → 拖拽更新 → API → SQLite → excel:export
```

## 关键代码模式

### chrome-devtools 表单填写
```typescript
// 1. 获取页面快照 (必须先执行)
const snapshot = await chrome.take_snapshot({});
// 2. 从快照中找到元素 uid
// 3. 使用 uid 操作
await chrome.fill_form({
  elements: [
    { uid: "e1", value: "Name" },
    { uid: "e2", value: "email@example.com" }
  ]
});
```

### LinkedIn 搜索
```typescript
await linkedin.search_jobs({ search_term: "Senior Python Engineer" });
await linkedin.get_job_details({ job_id: "4252026496" });
await linkedin.get_company_profile({ company_name: "anthropic" });
```

### Firecrawl 抓取
```typescript
await firecrawl.firecrawl_search({
  query: "Software Engineer site:indeed.com",
  limit: 20
});
await firecrawl.firecrawl_scrape({
  url: "https://indeed.com/viewjob?jk=xxx",
  formats: ["markdown"]
});
```

### Excel 记录
```typescript
await excel.write_data_to_excel({
  filepath: "./data/job_tracker.xlsx",
  sheet_name: "Applications",
  data: [["APP-001", "2025-01-10", "Anthropic", "Applied"]],
  start_cell: "A2"
});
```

## 注意事项

1. **chrome-devtools**: 必须先 `take_snapshot` 获取 uid，uid 页面刷新后失效
2. **LinkedIn Cookie**: 1-2 周过期，需更新环境变量
3. **速率限制**: LinkedIn 25次/天，Indeed/Glassdoor 30次/小时
4. **申请间隔**: 建议 30 秒以上

## 快速参考

- 系统架构图 → [ARCHITECTURE.md#系统架构](desing_docs/ARCHITECTURE.md)
- MCP 工具详细参数 → [IMPLEMENTATION.md#各-mcp-的具体使用方式](desing_docs/IMPLEMENTATION.md)
- React 组件代码 → [FRONTEND.md#核心组件代码](desing_docs/FRONTEND.md)
- UI 交互流程 → [USAGE_EXAMPLES.md#dashboard-ui-交互示例](desing_docs/USAGE_EXAMPLES.md)
- Claude 对话示例 → [USAGE_EXAMPLES.md#claude-对话交互示例](desing_docs/USAGE_EXAMPLES.md)
