// DeepSeek API 代理服务器
// 用于解决浏览器 CORS 限制问题

import http from 'http';
import https from 'https';

const PORT = 3000;

const server = http.createServer((req, res) => {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // 只处理 POST 请求
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  // 收集请求体
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    try {
      const requestData = JSON.parse(body);
      const apiKey = requestData.apiKey;
      const messages = requestData.messages;
      const model = requestData.model || 'deepseek-chat';

      if (!apiKey) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'API Key is required' }));
        return;
      }

      // 构建发送给 DeepSeek 的请求
      const deepseekData = JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 4000
      });

      const options = {
        hostname: 'api.deepseek.com',
        port: 443,
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Content-Length': Buffer.byteLength(deepseekData)
        }
      };

      console.log(`[${new Date().toISOString()}] 转发请求到 DeepSeek API`);

      // 发送请求到 DeepSeek
      const deepseekReq = https.request(options, (deepseekRes) => {
        let responseData = '';

        deepseekRes.on('data', (chunk) => {
          responseData += chunk;
        });

        deepseekRes.on('end', () => {
          console.log(`[${new Date().toISOString()}] DeepSeek 响应状态: ${deepseekRes.statusCode}`);
          
          res.writeHead(deepseekRes.statusCode, { 'Content-Type': 'application/json' });
          res.end(responseData);
        });
      });

      deepseekReq.on('error', (error) => {
        console.error(`[${new Date().toISOString()}] 请求 DeepSeek 失败:`, error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Proxy request failed', 
          message: error.message 
        }));
      });

      deepseekReq.write(deepseekData);
      deepseekReq.end();

    } catch (error) {
      console.error(`[${new Date().toISOString()}] 解析请求失败:`, error);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Invalid request', 
        message: error.message 
      }));
    }
  });
});

// 获取本机 IP 地址
import os from 'os';
const networkInterfaces = os.networkInterfaces();
let localIP = 'localhost';

// 查找局域网 IP
for (const interfaceName in networkInterfaces) {
  const interfaces = networkInterfaces[interfaceName];
  for (const iface of interfaces) {
    // 跳过内部和非 IPv4 地址
    if (iface.family === 'IPv4' && !iface.internal) {
      localIP = iface.address;
      break;
    }
  }
  if (localIP !== 'localhost') break;
}

// 监听所有网络接口（支持手机访问）
server.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(60));
  console.log('🚀 DeepSeek API 代理服务器已启动！');
  console.log('='.repeat(60));
  console.log(`📡 监听端口: ${PORT}`);
  console.log(`🌐 电脑访问: http://localhost:${PORT}`);
  console.log(`📱 手机访问: http://${localIP}:${PORT}`);
  console.log('');
  console.log('💡 使用方法：');
  console.log('   电脑: http://localhost:8001/index.html');
  console.log(`   手机: http://${localIP}:8001/index.html`);
  console.log('   (确保手机和电脑在同一 WiFi 网络)');
  console.log('');
  console.log('⏹  停止服务器: 按 Ctrl+C');
  console.log('='.repeat(60));
});
