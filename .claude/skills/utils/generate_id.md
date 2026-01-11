---
name: generate_id
description: 生成唯一 ID。用于申请记录、职位保存等需要唯一标识的场景。
trigger: ["生成 ID", "generate id", "创建 ID"]
allowed-tools: mcp__excel__read_data_from_excel
---

# Generate ID Skill

生成唯一标识符。

## ID 格式

### 申请 ID
```
格式: APP-YYYYMMDD-NNN
示例: APP-20250111-003

APP      - 前缀，表示 Application
20250111 - 日期
003      - 当日序号
```

### 职位 ID
```
格式: JOB-{platform}-{platform_id}
示例: JOB-linkedin-4252026496

JOB          - 前缀，表示 Job
linkedin     - 平台名
4252026496   - 平台原始 ID
```

### QA 模板 ID
```
格式: QA-{category}-{sequence}
示例: QA-salary-001

QA      - 前缀
salary  - 类别
001     - 序号
```

## 生成规则

### 申请 ID 生成

```python
def generate_application_id():
    # 获取今日日期
    today = datetime.now().strftime("%Y%m%d")

    # 读取现有记录，统计今日申请数
    existing = read_excel_applications()
    today_count = count(app for app in existing if app.date == today)

    # 生成新 ID
    sequence = str(today_count + 1).zfill(3)
    return f"APP-{today}-{sequence}"
```

### 职位 ID 生成

```python
def generate_job_id(platform, platform_job_id):
    # 使用平台原始 ID 确保唯一性
    return f"JOB-{platform}-{platform_job_id}"
```

### UUID 生成（备用）

```python
import uuid
unique_id = str(uuid.uuid4())
# 例如: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

## 执行步骤

### Step 1: 确定 ID 类型

根据用途选择格式：
- 申请记录 → APP-YYYYMMDD-NNN
- 职位保存 → JOB-platform-id
- 其他 → UUID

### Step 2: 检查唯一性

读取现有数据，确保不重复：

```
mcp__excel__read_data_from_excel({
  filepath: "k:\\JobPilot\\data\\job_tracker.xlsx",
  sheet_name: "Applications"
})
```

### Step 3: 生成并返回

```
新生成的 ID: APP-20250111-004
```

## 输出格式

```
## ID 已生成

类型: 申请 ID
值: APP-20250111-004

今日已生成:
- APP-20250111-001
- APP-20250111-002
- APP-20250111-003
- APP-20250111-004 (新)

下一个可用: APP-20250111-005
```

## ID 查询

### 查找申请
```
查询 APP-20250111-003

结果:
| 字段 | 值 |
|------|------|
| ID | APP-20250111-003 |
| Company | Anthropic |
| Position | Senior Python Engineer |
| Status | Applied |
```

### ID 格式验证
```python
def validate_application_id(id):
    pattern = r'^APP-\d{8}-\d{3}$'
    return bool(re.match(pattern, id))
```

## 注意事项

1. ID 一旦生成不应修改
2. 日期部分使用 UTC 或本地时区一致
3. 序号从 001 开始
4. 跨日时序号重置
