---
name: sync_dashboard
description: 将申请记录同步到 Dashboard 进行可视化追踪。支持自动记录申请、截图和状态更新。
trigger: ["同步到dashboard", "sync to dashboard", "记录申请到dashboard"]
allowed-tools: WebFetch, Read
---

# Sync Dashboard Skill

将求职申请记录同步到 Dashboard 进行可视化管理和追踪。

## Dashboard 概述

Dashboard 是 JobPilot 的可视化管理界面，提供：
- Kanban 看板视图（按申请状态分类）
- 申请详情查看（包括截图）
- 统计数据展示
- 导出功能

## API 端点

### 导入申请记录

**Endpoint**: `POST http://localhost:3001/api/applications/import`

#### 快速模式（推荐用于自动化）

```json
{
  "company": "StubHub",
  "position": "Software Engineer I - New Grad",
  "jobUrl": "https://job-boards.eu.greenhouse.io/stubhubinc/jobs/4749965101",
  "resumeName": "Peiyuan Li 26NG.pdf",
  "platform": "greenhouse",
  "location": "Los Angeles, CA (Hybrid)",
  "salaryRange": "$120,000 - $150,000",
  "previewScreenshot": "data/screenshots/stubhub-2025-01-11-preview.png",
  "confirmationScreenshot": "data/screenshots/stubhub-2025-01-11-confirmation.png"
}
```

#### 完整模式

```json
{
  "fullMode": true,
  "company": "StubHub",
  "position": "Software Engineer I - New Grad",
  "jobUrl": "https://job-boards.eu.greenhouse.io/stubhubinc/jobs/4749965101",
  "platform": "greenhouse",
  "location": "Los Angeles, CA",
  "locationType": "Hybrid",
  "salaryMin": 120000,
  "salaryMax": 150000,
  "resumeName": "Peiyuan Li 26NG.pdf",
  "appliedAt": "2025-01-11T10:30:00Z",
  "status": "applied",
  "notes": "Applied via Greenhouse, demographics submitted",
  "previewScreenshotPath": "data/screenshots/stubhub-2025-01-11-preview.png",
  "confirmationScreenshotPath": "data/screenshots/stubhub-2025-01-11-confirmation.png",
  "demographicsSubmitted": true
}
```

## 执行流程

### Step 1: 收集申请信息

在完成申请后，收集以下信息：
- 公司名称
- 职位名称
- 申请链接
- 使用的简历名称
- 平台类型 (greenhouse/lever/workday/linkedin/other)
- 地点信息
- 薪资范围（如有）
- 截图路径

### Step 2: 调用 API

```bash
curl -X POST http://localhost:3001/api/applications/import \
  -H "Content-Type: application/json" \
  -d '{
    "company": "Example Corp",
    "position": "Software Engineer",
    "jobUrl": "https://example.com/job/123",
    "resumeName": "resume.pdf",
    "platform": "greenhouse"
  }'
```

### Step 3: 验证同步

检查返回结果：
```json
{
  "success": true,
  "applicationId": "abc123xyz",
  "message": "Application to Example Corp - Software Engineer recorded successfully"
}
```

## 平台类型

| 平台 | platform 值 | URL 特征 |
|------|------------|----------|
| Greenhouse | greenhouse | greenhouse.io |
| Lever | lever | lever.co |
| Workday | workday | myworkday.com |
| LinkedIn | linkedin | linkedin.com |
| Indeed | indeed | indeed.com |
| Glassdoor | glassdoor | glassdoor.com |
| 其他 | other | - |

## 截图路径约定

截图文件保存在 `data/screenshots/` 目录：
- 预览截图: `{company}-{date}-preview.png`
- 确认截图: `{company}-{date}-confirmation.png`

示例：
```
data/screenshots/
├── stubhub-2025-01-11-preview.png
├── stubhub-2025-01-11-confirmation.png
├── google-2025-01-12-preview.png
└── google-2025-01-12-confirmation.png
```

## Dashboard 功能

### Kanban 看板

按状态分类显示申请：
- **Applied** (蓝色) - 已申请
- **Viewed** (黄色) - 已查看
- **Interview** (紫色) - 面试中
- **Offer** (绿色) - 收到 Offer
- **Rejected** (红色) - 被拒绝

拖拽卡片即可更新状态。

### 卡片信息

每张卡片显示：
- 职位名称
- 公司名称
- 地点（如有）
- 薪资范围（如有）
- 申请时间
- 平台类型（带颜色标记）
- 使用的简历
- 截图数量

点击卡片查看详情和截图。

### 截图查看

详情弹窗中可查看：
- 申请预览截图
- 提交确认截图
- 支持左右切换和全屏查看

## 与 Greenhouse 申请流程集成

在完成 Greenhouse 申请后自动同步：

```
# 申请完成后
1. 截图保存完成
2. 收集申请信息
3. 调用 /api/applications/import
4. 返回 applicationId
```

## 输出格式

```
## Dashboard 同步完成

申请已记录到 Dashboard：
- 公司: StubHub
- 职位: Software Engineer I - New Grad
- 平台: Greenhouse
- 状态: Applied
- ID: abc123xyz

截图已关联:
- 预览: stubhub-2025-01-11-preview.png
- 确认: stubhub-2025-01-11-confirmation.png

访问 Dashboard 查看: http://localhost:3001/applications
```

## 注意事项

1. 确保 Dashboard 服务运行中（端口 3001）
2. 截图路径使用相对于项目根目录的路径
3. 薪资可用范围格式（"$120,000 - $150,000"）或数值
4. 日期使用 ISO 格式或留空使用当前时间
5. platform 字段影响卡片显示颜色
