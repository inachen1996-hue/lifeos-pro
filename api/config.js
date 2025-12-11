// API 配置服务 - 安全管理 API 密钥
export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 从环境变量或 Vercel 环境变量中获取 API 密钥
    const API_KEYS = {
      deepseek: process.env.DEEPSEEK_API_KEY || 'sk-d1fdb210d0424ffdbad83f1ebe4e283b',
      gemini: process.env.GEMINI_API_KEY || 'AIzaSyAs95vJEeL-CkfTdvxeKgZsViKJtjAppBE',
      openai: process.env.OPENAI_API_KEY || ''
    };

    if (req.method === 'GET') {
      // 返回可用的 AI 服务列表（不包含实际密钥）
      const availableServices = {
        deepseek: !!API_KEYS.deepseek,
        gemini: !!API_KEYS.gemini,
        openai: !!API_KEYS.openai
      };

      res.status(200).json({
        success: true,
        services: availableServices,
        defaultProvider: 'deepseek'
      });
      return;
    }

    if (req.method === 'POST') {
      const { action, provider } = req.body;

      if (action === 'test') {
        // 测试指定服务的连接
        const apiKey = API_KEYS[provider];
        if (!apiKey) {
          res.status(400).json({
            success: false,
            error: `${provider} API key not configured`
          });
          return;
        }

        // 测试连接
        let testResult = false;
        let errorMessage = '';

        try {
          if (provider === 'deepseek') {
            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
              },
              body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: '测试连接' }],
                max_tokens: 10
              })
            });
            testResult = response.ok;
            if (!testResult) {
              const errorData = await response.json().catch(() => ({}));
              errorMessage = errorData.error?.message || `HTTP ${response.status}`;
            }
          } else if (provider === 'gemini') {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: '测试连接' }] }]
              })
            });
            testResult = response.ok;
            if (!testResult) {
              const errorData = await response.json().catch(() => ({}));
              errorMessage = errorData.error?.message || `HTTP ${response.status}`;
            }
          }
        } catch (error) {
          testResult = false;
          errorMessage = error.message;
        }

        res.status(200).json({
          success: testResult,
          provider: provider,
          message: testResult ? '连接成功' : `连接失败: ${errorMessage}`
        });
        return;
      }

      if (action === 'getKey') {
        // 返回指定服务的 API 密钥（仅用于实际 API 调用）
        const apiKey = API_KEYS[provider];
        if (!apiKey) {
          res.status(400).json({
            success: false,
            error: `${provider} API key not configured`
          });
          return;
        }

        res.status(200).json({
          success: true,
          provider: provider,
          apiKey: apiKey
        });
        return;
      }
    }

    res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('API Config Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}