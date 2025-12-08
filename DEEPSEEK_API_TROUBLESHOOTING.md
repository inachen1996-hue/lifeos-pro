# DeepSeek API 故障排除指南

## 问题：调用 DeepSeek API 时提示"生成失败"

即使账户有余额，也可能因为多种原因导致 API 调用失败。

## 快速诊断步骤

### 步骤 1：使用调试工具

打开 `deepseek-debug.html` 文件进行诊断：

```bash
# 在浏览器中打开
open deepseek-debug.html
```

按照页面上的步骤：
1. 输入你的 API Key
2. 验证 Key 格式
3. 测试基础连接
4. 测试不同配置
5. 查看详细日志

### 步骤 2：检查常见问题

#### 问题 1：API Key 格式错误
**症状**：401 Unauthorized 错误

**检查**：
- API Key 是否以 `sk-` 开头？
- Key 是否完整复制（没有多余空格）？
- Key 是否已激活？

**解决方案**：
1. 访问 https://platform.deepseek.com/api_keys
2. 重新生成一个新的 API Key
3. 确保完整复制（包括 `sk-` 前缀）

#### 问题 2：余额不足或未激活
**症状**：401 或 403 错误

**检查**：
1. 访问 https://platform.deepseek.com/usage
2. 查看账户余额
3. 确认 API Key 状态

**解决方案**：
- 充值账户
- 确认 Key 已激活
- 检查是否有使用限制

#### 问题 3：请求参数不兼容
**症状**：400 Bad Request 错误

**可能原因**：
- `response_format` 参数不被支持
- 提示词过长
- 模型名称错误

**解决方案**：
已在代码中实现自动处理：
- 添加了 system message 来引导 JSON 输出
- 增强了提示词
- 添加了 JSON 提取逻辑

#### 问题 4：速率限制
**症状**：429 Too Many Requests 错误

**解决方案**：
- 等待几秒后重试（已实现自动重试）
- 检查 API 使用频率
- 考虑升级账户等级

#### 问题 5：服务器错误
**症状**：500/502/503 错误

**解决方案**：
- DeepSeek 服务暂时不可用
- 等待几分钟后重试
- 临时切换到 Google Gemini 或 OpenAI

#### 问题 6：CORS 跨域问题
**症状**：Network error 或 CORS policy 错误

**解决方案**：
- 确保在 HTTPS 环境下运行
- 检查浏览器控制台的详细错误
- DeepSeek API 应该支持浏览器直接调用

## 代码改进

### 改进 1：增强的提示词
```javascript
const enhancedPrompt = `${prompt}\n\n重要：请确保你的回复是有效的JSON格式。`;
```

### 改进 2：添加 System Message
```javascript
messages: [
  { 
    role: 'system', 
    content: 'You are a helpful assistant that always responds in valid JSON format.' 
  },
  { 
    role: 'user', 
    content: enhancedPrompt 
  }
]
```

### 改进 3：JSON 提取逻辑
```javascript
try {
  JSON.parse(content);
  return content;
} catch (e) {
  // 尝试从文本中提取 JSON
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }
  throw new Error('无法解析为 JSON');
}
```

### 改进 4：详细的错误信息
现在会显示：
- 具体的错误代码
- 错误原因
- 解决方案建议
- 相关链接

### 改进 5：自动重试机制
```javascript
const callAIWithRetry = async (provider, apiKey, prompt, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await callAI(provider, apiKey, prompt);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
};
```

## 测试步骤

### 1. 基础测试
```javascript
// 在浏览器控制台执行
const testKey = 'sk-your-key-here';
const testPrompt = '请用JSON格式回复：{"status": "ok"}';

fetch('https://api.deepseek.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${testKey}`
  },
  body: JSON.stringify({
    model: 'deepseek-chat',
    messages: [{ role: 'user', content: testPrompt }]
  })
})
.then(r => r.json())
.then(d => console.log('Success:', d))
.catch(e => console.error('Error:', e));
```

### 2. 使用调试工具
打开 `deepseek-debug.html` 进行全面测试。

### 3. 检查浏览器控制台
查看详细的请求和响应日志。

## 替代方案

如果 DeepSeek 持续出现问题，可以：

### 方案 1：切换到 Google Gemini
- 免费额度更高
- 稳定性更好
- 速度更快

### 方案 2：切换到 OpenAI
- 功能最强大
- 文档最完善
- 需要付费

### 方案 3：混合使用
- 主要使用 Google Gemini
- DeepSeek 作为备用
- OpenAI 用于复杂任务

## 常见错误代码

| 错误码 | 含义 | 解决方案 |
|--------|------|----------|
| 401 | 未授权 | 检查 API Key |
| 403 | 禁止访问 | 检查账户状态 |
| 429 | 请求过多 | 等待后重试 |
| 400 | 请求错误 | 检查参数格式 |
| 500 | 服务器错误 | 稍后重试 |
| 502 | 网关错误 | 稍后重试 |
| 503 | 服务不可用 | 稍后重试 |

## 获取帮助

### DeepSeek 官方资源
- 官网：https://www.deepseek.com/
- 平台：https://platform.deepseek.com/
- 文档：https://platform.deepseek.com/api-docs/
- 状态页：检查服务状态

### 调试信息收集
如果问题持续，收集以下信息：
1. 浏览器控制台的完整错误日志
2. `deepseek-debug.html` 的测试结果
3. API Key 的前 10 个字符（不要泄露完整 Key）
4. 账户余额截图
5. 具体的错误信息

## 最佳实践

1. **使用环境变量**：不要在代码中硬编码 API Key
2. **实现重试逻辑**：已在代码中实现
3. **监控使用量**：定期检查 API 使用情况
4. **设置超时**：避免长时间等待
5. **错误处理**：提供友好的错误提示
6. **日志记录**：记录所有 API 调用
7. **备用方案**：准备多个 AI 提供商

## 更新日志

### 2024-12-08
- ✅ 添加详细的错误处理
- ✅ 实现自动重试机制
- ✅ 增强提示词以确保 JSON 输出
- ✅ 添加 JSON 提取逻辑
- ✅ 创建调试工具
- ✅ 改进错误信息显示

## 总结

DeepSeek API 调用失败的主要原因：
1. **API Key 问题**（最常见）
2. **参数兼容性问题**
3. **网络或服务器问题**
4. **速率限制**

通过使用 `deepseek-debug.html` 工具和改进后的代码，大部分问题都可以快速定位和解决。
