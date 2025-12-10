// Vercel API 路由 - DeepSeek 代理
export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 只处理 POST 请求
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { apiKey, messages, model = 'deepseek-chat' } = req.body;

    if (!apiKey) {
      res.status(400).json({ error: 'API Key is required' });
      return;
    }

    console.log(`[${new Date().toISOString()}] 转发请求到 DeepSeek API`);

    // 调用 DeepSeek API
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    console.log(`[${new Date().toISOString()}] DeepSeek 响应状态: ${deepseekResponse.status}`);

    const data = await deepseekResponse.json();

    if (!deepseekResponse.ok) {
      console.error('DeepSeek API 错误:', data);
      res.status(deepseekResponse.status).json(data);
      return;
    }

    res.status(200).json(data);

  } catch (error) {
    console.error(`[${new Date().toISOString()}] 代理请求失败:`, error);
    res.status(500).json({ 
      error: 'Proxy request failed', 
      message: error.message 
    });
  }
}