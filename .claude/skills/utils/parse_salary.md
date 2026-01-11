---
name: parse_salary
description: 解析薪资字符串，提取数值范围。支持多种格式和货币。
trigger: ["解析薪资", "parse salary", "薪资分析"]
allowed-tools: []
---

# Parse Salary Skill

解析职位薪资字符串。

## 支持的格式

| 格式 | 示例 | 解析结果 |
|------|------|----------|
| 年薪范围 | "$150,000 - $180,000" | { min: 150000, max: 180000, period: "yearly" } |
| 年薪单值 | "$150K/year" | { min: 150000, max: 150000, period: "yearly" } |
| 时薪 | "$75 - $85/hour" | { min: 156000, max: 176800, period: "yearly" } |
| 月薪 | "$12,000 - $15,000/month" | { min: 144000, max: 180000, period: "yearly" } |
| 缩写 | "150K-180K" | { min: 150000, max: 180000, period: "yearly" } |
| 估算 | "Estimated: $160K" | { min: 160000, max: 160000, estimated: true } |

## 解析规则

### 数值提取
```python
def extract_number(text):
    # 移除货币符号和逗号
    text = re.sub(r'[$,]', '', text)

    # 处理 K/k 缩写
    if 'k' in text.lower():
        text = re.sub(r'(\d+)k', r'\1000', text, flags=re.IGNORECASE)

    # 处理 M 缩写
    if 'm' in text.lower():
        text = re.sub(r'(\d+)m', r'\1000000', text, flags=re.IGNORECASE)

    return int(re.search(r'\d+', text).group())
```

### 周期转换
| 原始周期 | 年薪系数 |
|----------|----------|
| hourly | × 2080 (40h × 52w) |
| weekly | × 52 |
| bi-weekly | × 26 |
| monthly | × 12 |
| yearly | × 1 |

### 货币转换
默认假设 USD，如检测到其他货币：
| 货币 | 符号 | 转换率 (示例) |
|------|------|---------------|
| USD | $ | 1.00 |
| EUR | € | 1.10 |
| GBP | £ | 1.27 |
| CAD | C$ | 0.74 |

## 输出格式

```
## 薪资解析结果

原始: "$150,000 - $180,000 per year"

**解析结果**:
| 项目 | 值 |
|------|------|
| 最低薪资 | $150,000 |
| 最高薪资 | $180,000 |
| 中位数 | $165,000 |
| 周期 | 年薪 |
| 货币 | USD |
| 估算 | 否 |

**时薪换算**: $72 - $87/hour
**月薪换算**: $12,500 - $15,000/month
```

## 特殊情况

### 无薪资信息
```
原始: "Competitive salary"
结果: { min: null, max: null, note: "Competitive" }
```

### 薪资 + 股权
```
原始: "$180K base + equity"
结果: {
    min: 180000,
    max: 180000,
    period: "yearly",
    includes_equity: true
}
```

### 经验相关
```
原始: "$150K - $220K DOE"
结果: {
    min: 150000,
    max: 220000,
    note: "Depends on experience"
}
```

## 匹配度评估

与用户期望薪资比较：

```
用户期望: $160,000
职位薪资: $150,000 - $180,000

评估:
- 最低薪资: ✓ 接近期望 (94%)
- 最高薪资: ✓ 超过期望 (113%)
- 结论: 薪资范围符合期望
```

## 注意事项

1. Glassdoor 估算可能不准确
2. 不同地区薪资水平差异大
3. 总包 (TC) 包含基础薪资 + 奖金 + 股权
4. 某些职位薪资需要 negotiation
