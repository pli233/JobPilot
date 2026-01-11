---
name: get_company_info
description: 获取公司信息和概况。使用 LinkedIn 获取公司主页、员工数、行业等信息。
trigger: ["公司信息", "company info", "查看公司", "公司详情"]
allowed-tools: mcp__linkedin__get_company_profile, mcp__firecrawl-mcp__firecrawl_scrape, Read
---

# Get Company Info Skill

获取公司的详细信息。

## 输入参数

| 参数 | 说明 | 示例 |
|------|------|------|
| company_name | 公司名称 | "anthropic" |
| get_employees | 是否获取员工信息 | false |

## 执行步骤

### Step 1: 获取 LinkedIn 公司主页

```
mcp__linkedin__get_company_profile({
  company_name: "anthropic",
  get_employees: false
})
```

### Step 2: 返回信息

LinkedIn 返回：
- 公司名称
- 行业
- 公司规模（员工数）
- 总部位置
- 公司描述
- 网站 URL
- 关注者数量

### Step 3: 补充信息（可选）

如果需要更多信息，可以抓取公司官网或 Glassdoor：

```
mcp__firecrawl-mcp__firecrawl_scrape({
  url: "https://www.glassdoor.com/Overview/Working-at-Anthropic",
  formats: ["markdown"]
})
```

获取：
- 公司评分
- 员工评价
- 薪资数据
- 面试难度

### 输出格式

```
## 公司信息: Anthropic

### 基本信息
| 项目 | 信息 |
|------|------|
| 行业 | Artificial Intelligence |
| 规模 | 201-500 employees |
| 总部 | San Francisco, CA |
| 成立 | 2021 |
| 类型 | Privately Held |

### 公司简介

Anthropic is an AI safety company that builds reliable, interpretable,
and steerable AI systems. Founded by former OpenAI researchers,
we focus on the long-term safety of artificial intelligence.

### 链接
- **Website**: https://anthropic.com
- **LinkedIn**: https://linkedin.com/company/anthropic
- **Careers**: https://anthropic.com/careers

### Glassdoor 数据 (如果有)
- **评分**: 4.5/5.0 (89 reviews)
- **推荐给朋友**: 95%
- **CEO 支持率**: 98%

### 最近动态
- 最近融资：Series C - $450M
- 员工增长：过去 6 个月增长 50%

---

**相关操作**:
- 搜索该公司职位: "搜索 anthropic 职位"
- 查看招聘经理: "获取 anthropic 招聘负责人"
```

## 用途

1. **申请前调研** - 了解公司背景
2. **面试准备** - 掌握公司信息
3. **筛选公司** - 根据规模、评分筛选
4. **定制申请** - 针对公司特点定制简历

## 注意事项

1. 公司名称需与 LinkedIn 一致
2. 小公司可能信息不完整
3. 员工信息获取较慢（get_employees=true）
4. Glassdoor 数据需额外请求
