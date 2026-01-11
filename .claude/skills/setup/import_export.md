---
name: import_export
description: 导入导出配置文件和问答模板，支持备份和迁移。
trigger: ["导入配置", "导出配置", "import config", "export config", "备份", "backup"]
allowed-tools: Read, Write, Bash, mcp__excel__read_data_from_excel, mcp__excel__write_data_to_excel, AskUserQuestion
---

# Import Export Skill

导入导出配置和数据。

## 支持的导出格式

| 数据类型 | 文件格式 |
|----------|----------|
| 用户偏好 | JSON |
| 问答模板 | JSON |
| 申请记录 | Excel / JSON |
| 保存的职位 | Excel / JSON |

## 导出功能

### 导出所有配置

将所有配置打包为单个备份：

```bash
# 创建备份目录
mkdir -p k:/JobPilot/backups/{date}

# 复制配置文件
cp k:/JobPilot/config/preferences.json k:/JobPilot/backups/{date}/
cp k:/JobPilot/config/qa_templates.json k:/JobPilot/backups/{date}/
cp k:/JobPilot/data/job_tracker.xlsx k:/JobPilot/backups/{date}/
```

### 导出申请记录为 JSON

```
Read Excel → 转换为 JSON → 保存
```

输出格式：
```json
{
  "exported_at": "2025-01-11T10:00:00Z",
  "applications": [
    {
      "id": "APP-20250110-001",
      "date": "2025-01-10",
      "platform": "linkedin",
      "company": "Anthropic",
      "position": "Senior Engineer",
      "status": "Applied"
    }
  ]
}
```

## 导入功能

### 导入配置文件

1. 读取备份文件
2. 验证格式
3. 合并或覆盖现有配置

### 导入问答模板

支持合并模式：
- **覆盖**: 完全替换现有模板
- **合并**: 添加新模板，保留现有模板
- **更新**: 更新同 ID 模板，添加新模板

### 导入申请记录

从 JSON 导入到 Excel：
1. 读取 JSON 文件
2. 验证数据格式
3. 写入 Excel 工作表

## 执行步骤

### 导出

1. 使用 AskUserQuestion 选择：
   - 导出所有配置
   - 仅导出偏好设置
   - 仅导出问答模板
   - 仅导出申请记录

2. 选择导出路径

3. 执行导出

### 导入

1. 询问导入文件路径

2. 验证文件：
   - 检查文件存在
   - 检查格式正确
   - 检查必需字段

3. 选择导入模式（合并/覆盖）

4. 执行导入

5. 显示导入摘要

## 输出

### 导出完成
```
## 导出完成

备份路径: k:\JobPilot\backups\2025-01-11\
包含文件:
- preferences.json (1.2 KB)
- qa_templates.json (2.4 KB)
- job_tracker.xlsx (45 KB)

建议: 将备份文件夹保存到云存储或外部设备。
```

### 导入完成
```
## 导入完成

来源: k:\JobPilot\backups\2025-01-10\
模式: 合并

导入结果:
- 偏好设置: 已更新
- 问答模板: 新增 3 个，更新 2 个，保留 5 个
- 申请记录: 新增 15 条

注意: 原配置已备份到 k:\JobPilot\backups\pre-import\
```
