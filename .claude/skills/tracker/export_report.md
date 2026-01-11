---
name: export_report
description: 导出申请报告。支持导出为新 Excel 工作表或 JSON 格式。
trigger: ["导出报告", "export report", "生成报告"]
allowed-tools: mcp__excel__read_data_from_excel, mcp__excel__write_data_to_excel, mcp__excel__create_worksheet, mcp__excel__create_chart, mcp__excel__format_range, Write
---

# Export Report Skill

导出申请统计报告。

## 输入参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| format | 导出格式 | "excel" |
| period | 统计周期 | "month" |
| include_charts | 是否包含图表 | true |

格式选项：
- "excel" - 创建新工作表
- "json" - 导出 JSON 文件

## 执行步骤

### Step 1: 读取数据并计算统计

读取 Applications 数据，计算所有统计指标。

### Step 2: 创建报告工作表

```
mcp__excel__create_worksheet({
  filepath: "data/job_tracker.xlsx",
  sheet_name: "Report-2025-01-11"
})
```

### Step 3: 写入报告内容

```
mcp__excel__write_data_to_excel({
  filepath: "data/job_tracker.xlsx",
  sheet_name: "Report-2025-01-11",
  data: [
    ["Job Search Report", "", "", "", "Generated: 2025-01-11 10:00"],
    [""],
    ["Summary Metrics"],
    ["Metric", "Value", "Percentage"],
    ["Total Applications", "128", "100%"],
    ["Responses", "64", "50%"],
    ["Interviews", "16", "12.5%"],
    ["Offers", "4", "3.1%"],
    [""],
    ["Status Breakdown"],
    ["Status", "Count", "Percentage"],
    ["Applied", "48", "37.5%"],
    ["Viewed", "24", "18.8%"],
    ["Phone Screen", "16", "12.5%"],
    ["Interview", "12", "9.4%"],
    ["Offer", "4", "3.1%"],
    ["Rejected", "20", "15.6%"],
    ["Withdrawn", "4", "3.1%"],
    [""],
    ["Platform Performance"],
    ["Platform", "Applications", "Response Rate", "Interview Rate"],
    ["LinkedIn", "65", "55%", "15%"],
    ["Indeed", "30", "40%", "10%"],
    ["Glassdoor", "15", "47%", "13%"],
    ["Direct", "18", "61%", "17%"]
  ],
  start_cell: "A1"
})
```

### Step 4: 格式化报告

```
mcp__excel__format_range({
  filepath: "data/job_tracker.xlsx",
  sheet_name: "Report-2025-01-11",
  start_cell: "A1",
  end_cell: "E1",
  bold: true,
  font_size: 14,
  bg_color: "#4F81BD",
  font_color: "#FFFFFF"
})
```

### Step 5: 创建图表（可选）

```
mcp__excel__create_chart({
  filepath: "data/job_tracker.xlsx",
  sheet_name: "Report-2025-01-11",
  data_range: "A11:C18",
  chart_type: "bar",
  target_cell: "F10",
  title: "Application Status Distribution"
})
```

## 输出格式

### Excel 报告
```
## 报告已导出

**文件**: data/job_tracker.xlsx
**工作表**: Report-2025-01-11

**报告内容**:
- 总体统计
- 状态分布
- 平台表现
- 时间趋势
- 状态分布图表
- 平台对比图表

**文件大小**: 58 KB

可以在 Excel 中打开查看完整报告。
```

### JSON 报告
```
## 报告已导出

**文件**: data/reports/report-2025-01-11.json

**内容预览**:
```json
{
  "generated_at": "2025-01-11T10:00:00Z",
  "period": "2025-01-01 to 2025-01-11",
  "summary": {
    "total_applications": 128,
    "response_rate": 0.50,
    "interview_rate": 0.125,
    "offer_rate": 0.031
  },
  "status_breakdown": {
    "Applied": 48,
    "Viewed": 24,
    ...
  },
  "platform_performance": {
    "LinkedIn": { "count": 65, "response_rate": 0.55 },
    ...
  },
  "applications": [...]
}
```
```

## 报告模板

### 周报
- 本周申请数量
- 本周收到的回复
- 本周面试安排
- 下周计划

### 月报
- 月度申请总结
- 成功率分析
- 平台效果对比
- 改进建议

### 自定义报告
指定日期范围和要包含的内容。

## 注意事项

1. 报告工作表名称包含日期，不会覆盖旧报告
2. 图表可能需要手动调整大小
3. JSON 格式便于程序化处理
4. 大量数据可能导致文件较大
