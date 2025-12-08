# DeepSeek API 快速修复指南

## 🚨 问题：DeepSeek API 调用失败但有余额

## ⚡ 快速解决方案

### 方案 1：使用调试工具（推荐）

1. **打开调试工具**
   ```bash
   # 在浏览器中打开
   open deepseek-debug.html
   ```

2. **输入你的 API Key**
   - 确保以 `sk-` 开头
   - 完整复制，不要有空格

3. **点击"测试基础连接"**
   - 如果成功 ✅：API Key 有效，继续下一步
   - 如果失败 ❌：查看错误信息

4. **点击"测试（不使用 JSON 模式）"**
   - 如果成功 ✅：说明 `response_format` 参数有问题
   - 如果失败 ❌：API Key 或网络问题

5. **查看详细日志**
   - 找到具体的错误原因

### 方案 2：检查 API Key

1. **访问 DeepSeek 平台**
   - https://platform.deepseek.com/api_keys

2. **检查 Key 状态**
   - ✅ 是否已激活？
   - ✅ 是否有使用限制？
   - ✅ 是否已过期？

3. **重新生成 Key**
   - 如果有问题，生成新的 Key
   - 完整复制新 Key
   - 在应用中更新

### 方案 3：检查余额

1. **访问使用情况页面**
   - https://platform.deepseek.com/usage

2. **确认**
   - ✅ 余额是否充足？
   - ✅ 是否有未支付的账单？
   - ✅ 是否达到使用限制？

### 方案 4：使用改进后的代码

代码已经更新，包含以下改进：

1. **增强的提示词**
   - 自动添加 JSON 格式要求

2. **System Message**
   - 引导 AI 输出 JSON

3. **自动重试**
   - 失败后自动重试 3 次

4. **详细错误信息**
   - 显示具体原因和解决方案

5. **JSON 提取**
   - 自动从文本中提取 JSON

## 🔍 常见错误及解决方案

### 错误 1：401 Unauthorized
```
DeepSeek API 错误 (401): Unauthorized
```

**原因**：API Key 无效

**解决**：
1. 检查 Key 是否正确
2. 重新生成 Key
3. 确认 Key 已激活

### 错误 2：400 Bad Request
```
DeepSeek API 错误 (400): Bad Request
```

**原因**：请求参数错误

**解决**：
- 已在代码中修复
- 使用改进的参数配置
- 添加了 system message

### 错误 3：429 Too Many Requests
```
DeepSeek API 错误 (429): Too Many Requests
```

**原因**：请求过于频繁

**解决**：
- 等待几秒后重试
- 代码已实现自动重试

### 错误 4：500/502/503 Server Error
```
DeepSeek API 错误 (500): Internal Server Error
```

**原因**：DeepSeek 服务器问题

**解决**：
- 等待几分钟后重试
- 临时切换到 Google Gemini

## 📝 测试清单

使用以下清单逐项检查：

- [ ] API Key 格式正确（以 `sk-` 开头）
- [ ] API Key 已激活
- [ ] 账户有余额
- [ ] 没有达到速率限制
- [ ] 网络连接正常
- [ ] 使用了最新的代码
- [ ] 浏览器控制台没有 CORS 错误
- [ ] 使用调试工具测试成功

## 🛠️ 立即测试

### 在浏览器控制台执行：

```javascript
// 替换为你的 API Key
const apiKey = 'sk-your-key-here';

// 测试基础连接
fetch('https://api.deepseek.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  body: JSON.stringify({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: '请回复"测试成功"' }
    ]
  })
})
.then(async response => {
  console.log('状态码:', response.status);
  const data = await response.json();
  console.log('响应:', data);
  if (response.ok) {
    console.log('✅ 测试成功！');
    console.log('回复:', data.choices[0].message.content);
  } else {
    console.error('❌ 测试失败！');
    console.error('错误:', data);
  }
})
.catch(error => {
  console.error('❌ 请求失败！');
  console.error('错误:', error);
});
```

## 🔄 替代方案

如果 DeepSeek 持续出现问题：

### 临时方案：切换到 Google Gemini
1. 点击设置按钮
2. 选择 "Google"
3. 输入 Gemini API Key
4. 保存

### 长期方案：准备多个提供商
- Google Gemini（推荐，免费额度高）
- OpenAI（功能强大，需付费）
- DeepSeek（备用）

## 📞 获取帮助

如果以上方案都无法解决：

1. **收集信息**
   - 浏览器控制台的完整错误
   - `deepseek-debug.html` 的测试结果
   - API Key 前 10 个字符
   - 账户余额截图

2. **联系 DeepSeek 支持**
   - 访问 https://platform.deepseek.com/
   - 查看文档或联系支持

3. **检查服务状态**
   - DeepSeek 可能正在维护
   - 查看官方公告

## ✅ 成功标志

当你看到以下信息时，说明已经成功：

```
✅ 连接成功！
响应内容: [AI 的回复]
```

或在应用中：
```
✅ 今日计划已生成
✅ 复盘报告已生成
```

## 🎯 总结

**最可能的原因**：
1. API Key 格式或状态问题（80%）
2. 参数兼容性问题（15%）
3. 网络或服务器问题（5%）

**最快的解决方案**：
1. 使用 `deepseek-debug.html` 诊断
2. 重新生成 API Key
3. 使用改进后的代码

**备用方案**：
- 切换到 Google Gemini（推荐）
