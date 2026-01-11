---
name: linkedin_batch_search
description: 使用 Chrome DevTools 在 LinkedIn 批量搜索职位并保存到数据库。适合大量收集职位。
trigger: ["批量搜索linkedin", "linkedin batch search", "收集linkedin职位", "搜索100个职位"]
allowed-tools: mcp__chrome-devtools__navigate_page, mcp__chrome-devtools__evaluate_script, mcp__chrome-devtools__take_snapshot, mcp__chrome-devtools__click, Bash, Read
---

# LinkedIn Batch Search Skill

使用 Chrome DevTools MCP 在已登录的 LinkedIn 页面批量搜索并提取职位信息，保存到 SQLite 数据库。

## 为什么使用 Chrome DevTools

- **已登录状态**: 可以访问用户已登录的 LinkedIn 会话
- **无 API 限制**: 不依赖 LinkedIn API，避免速率限制
- **完整数据**: 可以获取页面上显示的所有职位信息
- **灵活筛选**: 支持 LinkedIn 原生筛选器

## 输入参数

| 参数 | 说明 | 示例 | 默认值 |
|------|------|------|--------|
| keywords | 搜索关键词 | "software engineer entry level junior" | 必填 |
| location | 地点 | "United States" | "United States" |
| experience_level | 经验级别 | "entry" / "associate" / "mid-senior" | "entry" |
| date_posted | 发布时间 | "past_month" / "past_week" / "past_24h" | "past_month" |
| sort_by | 排序方式 | "DD" (最近) / "R" (相关性) | "DD" |
| target_count | 目标数量 | 100 | 50 |

## 严格过滤规则 (MUST FOLLOW)

### 1. 排除 Senior 职位
**必须排除**标题中包含以下关键词的职位：
- `Senior`
- `Sr.` / `Sr `
- `Staff`
- `Principal`
- `Lead`
- `Manager`
- `Director`
- `VP`
- `Head of`
- `III` / `IV` / `V` (罗马数字表示高级别)

### 2. 仅限美国地区
**必须排除**非美国地区的职位，包括：
- 地点不包含美国州名或城市
- 地点包含其他国家名称 (Canada, UK, India, Germany, etc.)
- 地点为 "Worldwide" 或 "Global" (除非明确标注 Remote - US)

**美国地点识别**:
- 包含美国州缩写: CA, NY, TX, WA, MA, etc.
- 包含 "United States" 或 "USA"
- 包含美国城市名: San Francisco, New York, Seattle, etc.
- "Remote" 且未标注其他国家

## LinkedIn URL 参数

构建搜索 URL:
```
https://www.linkedin.com/jobs/search/?
  keywords={keywords}
  &f_E={experience_level_code}
  &f_TPR={date_posted_code}
  &sortBy={sort_by}
  &start={page_offset}
```

### 参数编码

**经验级别 (f_E)**:
- `1` = Internship
- `2` = Entry level
- `3` = Associate
- `4` = Mid-Senior level
- `5` = Director
- `6` = Executive

**发布时间 (f_TPR)**:
- `r86400` = Past 24 hours
- `r604800` = Past week
- `r2592000` = Past month

**分页 (start)**:
- 每页约 25 个职位
- Page 1: start=0
- Page 2: start=25
- Page 3: start=50
- ...

## 执行步骤

### Step 1: 确保 Chrome 已登录 LinkedIn

用户需要在 Chrome 中已登录 LinkedIn。

### Step 2: 导航到搜索页面

```javascript
mcp__chrome-devtools__navigate_page({
  type: "url",
  url: "https://www.linkedin.com/jobs/search/?f_E=2&f_TPR=r2592000&keywords=software%20engineer%20entry%20level%20junior&sortBy=DD&start=0"
})
```

### Step 3: 提取职位数据 (带过滤)

使用 JavaScript 从页面 DOM 提取职位信息，**同时应用过滤规则**:

```javascript
mcp__chrome-devtools__evaluate_script({
  function: `() => {
    // 排除 Senior 职位的关键词
    const seniorKeywords = [
      'senior', 'sr.', 'sr ', 'staff', 'principal', 'lead',
      'manager', 'director', 'vp', 'head of', ' iii', ' iv', ' v',
      'architect', 'distinguished'
    ];

    // 美国州缩写列表
    const usStates = [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
      'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
      'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
      'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
      'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
    ];

    // 非美国国家关键词
    const nonUSCountries = [
      'canada', 'uk', 'united kingdom', 'india', 'germany', 'france',
      'australia', 'singapore', 'japan', 'china', 'brazil', 'mexico',
      'netherlands', 'ireland', 'spain', 'italy', 'poland', 'israel',
      'sweden', 'switzerland', 'austria', 'belgium', 'portugal'
    ];

    // 检查是否为 Senior 职位
    const isSeniorTitle = (title) => {
      const lowerTitle = title.toLowerCase();
      return seniorKeywords.some(kw => lowerTitle.includes(kw));
    };

    // 检查是否为美国地点
    const isUSLocation = (location) => {
      const loc = location.toLowerCase();

      // 排除非美国国家
      if (nonUSCountries.some(country => loc.includes(country))) {
        return false;
      }

      // 检查是否包含美国标识
      if (loc.includes('united states') || loc.includes('usa')) {
        return true;
      }

      // 检查是否包含美国州缩写 (需要精确匹配)
      const hasUSState = usStates.some(state => {
        const regex = new RegExp('\\\\b' + state + '\\\\b', 'i');
        return regex.test(location);
      });

      if (hasUSState) return true;

      // Remote 职位默认为美国 (除非标注其他国家)
      if (loc.includes('remote') && !nonUSCountries.some(c => loc.includes(c))) {
        return true;
      }

      return false;
    };

    const jobs = [];
    const skipped = { senior: 0, nonUS: 0 };
    const jobCards = document.querySelectorAll('[data-occludable-job-id]');

    jobCards.forEach(card => {
      const jobId = card.getAttribute('data-occludable-job-id');
      const titleEl = card.querySelector('a[href*="/jobs/view/"] strong, a.job-card-list__title');
      const companyEl = card.querySelector('.job-card-container__primary-description, .artdeco-entity-lockup__subtitle');
      const locationEl = card.querySelector('.job-card-container__metadata-wrapper li, .artdeco-entity-lockup__caption');

      if (jobId && titleEl) {
        const title = titleEl.innerText?.trim() || '';
        const company = companyEl?.innerText?.trim() || '';
        const location = locationEl?.innerText?.trim() || '';

        // 过滤: 排除 Senior 职位
        if (isSeniorTitle(title)) {
          skipped.senior++;
          return;
        }

        // 过滤: 仅限美国地区
        if (!isUSLocation(location)) {
          skipped.nonUS++;
          return;
        }

        const isEasyApply = card.innerText.includes('Easy Apply');

        let locationType = 'onsite';
        if (location.toLowerCase().includes('remote')) locationType = 'remote';
        else if (location.toLowerCase().includes('hybrid')) locationType = 'hybrid';

        const cleanLocation = location.replace(/\\(.*?\\)/g, '').trim();

        jobs.push({
          id: \`linkedin_\${jobId}\`,
          title,
          company,
          location: cleanLocation,
          locationType,
          easyApply: isEasyApply ? 1 : 0,
          url: \`https://www.linkedin.com/jobs/view/\${jobId}\`
        });
      }
    });

    return { jobs, skipped };
  }`
})
```

**返回结果**:
```json
{
  "jobs": [...],
  "skipped": {
    "senior": 3,
    "nonUS": 2
  }
}
```

### Step 4: 保存到数据库

使用 SQLite 批量插入:

```sql
INSERT OR REPLACE INTO jobs (id, platform, title, company, location, location_type, url, easy_apply, saved_at) VALUES
('linkedin_123456', 'linkedin', 'Software Engineer', 'Company', 'Location', 'remote', 'URL', 1, strftime('%s', 'now')),
('linkedin_789012', 'linkedin', 'Developer', 'Company2', 'Location2', 'onsite', 'URL2', 0, strftime('%s', 'now'));
```

### Step 5: 翻页继续

导航到下一页:
```javascript
mcp__chrome-devtools__navigate_page({
  type: "url",
  url: "https://www.linkedin.com/jobs/search/?...&start=25"
})
```

重复 Step 3-5 直到达到目标数量。

## 完整工作流

```
1. 构建搜索 URL (keywords + filters)
2. 导航到第一页 (start=0)
3. 循环:
   a. evaluate_script 提取当前页职位
   b. 执行 SQL INSERT 保存到数据库
   c. 检查是否达到目标数量
   d. 如果未达到，导航到下一页 (start += 25)
4. 输出统计摘要
```

## 数据库 Schema

```sql
CREATE TABLE jobs (
  id TEXT PRIMARY KEY,           -- linkedin_123456
  platform TEXT NOT NULL,        -- linkedin
  title TEXT NOT NULL,           -- Software Engineer
  company TEXT,                  -- Google
  location TEXT,                 -- San Francisco, CA
  location_type TEXT,            -- remote / hybrid / onsite
  url TEXT,                      -- https://linkedin.com/jobs/view/123456
  easy_apply INTEGER DEFAULT 0,  -- 1 = Yes, 0 = No
  saved_at INTEGER               -- Unix timestamp
);
```

## 输出格式

```
## LinkedIn 批量搜索完成

**搜索条件**:
- 关键词: software engineer entry level junior
- 经验级别: Entry Level
- 发布时间: 最近一个月
- 排序: 最新优先
- 过滤: 排除 Senior，仅限美国

**过滤统计**:
| 过滤原因 | 排除数量 |
|----------|----------|
| Senior 职位 | 15 |
| 非美国地区 | 8 |
| **通过过滤** | **101** |

**结果统计**:
| 指标 | 数量 |
|------|------|
| 总职位数 | 101 |
| Easy Apply | 12 |
| Remote | 21 |
| Hybrid | 7 |
| Onsite | 44 |

**Top 公司**:
| 公司 | 职位数 |
|------|--------|
| Lensa | 10 |
| DataAnnotation | 7 |
| hackajob | 5 |

所有职位已保存到 data/db/jobpilot.db
```

## 注意事项

1. **登录状态**: 必须在 Chrome DevTools 连接的浏览器中已登录 LinkedIn
2. **速率控制**: 页面导航间隔建议 2-3 秒，避免被检测
3. **去重**: 使用 `INSERT OR REPLACE` 自动去重
4. **数据完整性**: 某些职位可能缺少公司或地点信息
5. **页面加载**: 导航后等待页面完全加载再提取数据

## 常见问题

### Q: 页面点击翻页按钮不生效？
A: 使用 `navigate_page` 直接修改 URL 中的 `start` 参数更可靠。

### Q: 提取到的职位数量少于页面显示？
A: LinkedIn 使用懒加载，可能需要先滚动页面加载更多职位卡片。

### Q: 如何筛选特定公司规模？
A: 可以结合 Job Screener 浏览器插件的数据，或在提取后过滤。
