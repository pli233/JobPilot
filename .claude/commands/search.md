# /search - 快速搜索职位

快速搜索职位的快捷命令。

## 使用方式

```
/search [关键词] [选项]
```

## 示例

- `/search python engineer`
- `/search full stack remote`
- `/search ML engineer site:greenhouse.io`

## 执行流程

1. 读取 `config/preferences.json` 获取默认搜索偏好
2. 调用 `search_all_platforms` 子代理
3. 并行搜索 LinkedIn、Indeed、Glassdoor
4. 去重并计算匹配度
5. 按匹配度排序显示结果

## 参数

| 参数 | 说明 | 示例 |
|------|------|------|
| 关键词 | 职位搜索词 | `python engineer` |
| `site:` | 限定平台 | `site:greenhouse.io` |
| `-senior` | 排除词 | `-senior -lead` |
| `remote` | 远程职位 | `remote` |

## 输出

返回匹配职位列表，包含：
- 职位名称和公司
- 匹配度分数
- 薪资范围（如有）
- 发布时间
- 申请链接
