---
name: retry_with_delay
description: 带延迟的重试机制。用于处理临时失败的操作，支持指数退避。
trigger: ["重试", "retry", "重试操作"]
allowed-tools: []
---

# Retry With Delay Skill

提供重试机制的指导，处理临时失败。

## 参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| max_retries | 最大重试次数 | 3 |
| initial_delay | 初始延迟 (秒) | 2 |
| backoff_factor | 退避因子 | 2 |
| max_delay | 最大延迟 (秒) | 30 |

## 重试策略

### 固定延迟
每次重试使用相同延迟：
```
重试 1: 等待 2 秒
重试 2: 等待 2 秒
重试 3: 等待 2 秒
```

### 指数退避（推荐）
每次重试延迟翻倍：
```
重试 1: 等待 2 秒
重试 2: 等待 4 秒
重试 3: 等待 8 秒
```

### 带抖动的指数退避
添加随机因素防止雷同：
```
重试 1: 等待 2 + random(0,1) 秒
重试 2: 等待 4 + random(0,2) 秒
重试 3: 等待 8 + random(0,4) 秒
```

## 适用场景

| 错误类型 | 是否重试 | 延迟策略 |
|----------|----------|----------|
| 网络超时 | 是 | 指数退避 |
| 服务器 500 | 是 | 指数退避 |
| 服务器 502/503 | 是 | 固定延迟 |
| 速率限制 429 | 是 | 长延迟 |
| 元素未找到 | 是 | 短延迟 |
| 认证失败 401 | 否 | - |
| 资源不存在 404 | 否 | - |
| 参数错误 400 | 否 | - |

## 执行流程

```python
def retry_with_delay(operation, max_retries=3, initial_delay=2, backoff_factor=2):
    delay = initial_delay

    for attempt in range(max_retries):
        try:
            result = operation()
            return result  # 成功
        except RetryableError as e:
            if attempt < max_retries - 1:
                print(f"尝试 {attempt + 1} 失败，{delay} 秒后重试...")
                sleep(delay)
                delay = min(delay * backoff_factor, max_delay)
            else:
                raise  # 达到最大重试次数

    raise MaxRetriesExceeded()
```

## 输出格式

### 重试中
```
## 操作重试

操作: 打开申请页面
状态: 失败 (网络超时)

重试进度:
- 尝试 1/3: 失败 - 等待 2 秒
- 尝试 2/3: 进行中...
```

### 重试成功
```
## 重试成功

操作: 打开申请页面
总尝试次数: 2
总耗时: 5.2 秒
最终状态: 成功

继续执行下一步...
```

### 重试失败
```
## 重试失败

操作: 打开申请页面
尝试次数: 3/3
总耗时: 14 秒
错误: 网络超时

**建议**:
1. 检查网络连接
2. 稍后再试
3. 尝试其他职位
```

## 具体应用

### 页面加载重试
```
max_retries: 3
initial_delay: 2
backoff_factor: 2
```

### API 请求重试
```
max_retries: 5
initial_delay: 1
backoff_factor: 2
max_delay: 60
```

### 文件上传重试
```
max_retries: 3
initial_delay: 3
backoff_factor: 1.5
```

## 注意事项

1. 不是所有错误都应该重试
2. 重试会增加总耗时
3. 速率限制错误应使用更长延迟
4. 记录重试日志用于诊断
