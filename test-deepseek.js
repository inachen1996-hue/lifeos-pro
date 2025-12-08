// DeepSeek API 测试脚本
// 使用方法：node test-deepseek.js YOUR_API_KEY

const apiKey = process.argv[2];

if (!apiKey) {
  console.error('❌ 请提供 API Key');
  console.log('使用方法：node test-deepseek.js sk-your-api-key');
  process.exit(1);
}

console.log('🧪 开始测试 DeepSeek API...');
console.log('📝 API Key:', apiKey.substring(0, 10) + '...');

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
      { role: 'user', content: 'Hello, please reply with "Test successful"' }
    ]
  })
})
.then(async response => {
  console.log('📡 响应状态:', response.status, response.statusText);
  
  const data = await response.json();
  
  if (!response.ok) {
    console.error('❌ API 调用失败');
    console.error('错误详情:', JSON.stringify(data, null, 2));
    
    if (response.status === 401) {
      console.log('\n💡 解决方案：');
      console.log('1. 检查 API Key 是否正确');
      console.log('2. 访问 https://platform.deepseek.com/api_keys 确认 Key 状态');
      console.log('3. 确认账户已充值');
    }
    
    process.exit(1);
  }
  
  console.log('✅ API 调用成功！');
  console.log('📨 AI 回复:', data.choices[0].message.content);
  console.log('\n完整响应:', JSON.stringify(data, null, 2));
})
.catch(error => {
  console.error('❌ 请求失败:', error.message);
  console.log('\n💡 可能的原因：');
  console.log('1. 网络连接问题');
  console.log('2. API 地址无法访问');
  console.log('3. 防火墙或代理设置');
});
