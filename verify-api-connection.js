// API 连接验证脚本
const API_KEYS = {
    deepseek: 'sk-d1fdb210d0424ffdbad83f1ebe4e283b',
    gemini: 'AIzaSyAs95vJEeL-CkfTdvxeKgZsViKJtjAppBE'
};

// 测试 DeepSeek API
async function testDeepSeek() {
    console.log('🧪 测试 DeepSeek API...');
    
    try {
        const response = await fetch('http://localhost:8000/api/deepseek', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                apiKey: API_KEYS.deepseek,
                messages: [
                    {
                        role: 'user',
                        content: '请用JSON格式回复：{"status": "success", "message": "DeepSeek连接成功"}'
                    }
                ],
                model: 'deepseek-chat'
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ DeepSeek API 测试成功:', data);
        return true;
        
    } catch (error) {
        console.error('❌ DeepSeek API 测试失败:', error.message);
        return false;
    }
}

// 测试 Gemini API
async function testGemini() {
    console.log('🧪 测试 Gemini API...');
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEYS.gemini}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: '请用JSON格式回复：{"status": "success", "message": "Gemini连接成功"}'
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Gemini API 测试成功:', data);
        return true;
        
    } catch (error) {
        console.error('❌ Gemini API 测试失败:', error.message);
        return false;
    }
}

// 运行所有测试
async function runTests() {
    console.log('🚀 开始 API 连接测试...\n');
    
    const deepseekResult = await testDeepSeek();
    console.log('');
    const geminiResult = await testGemini();
    
    console.log('\n📊 测试结果汇总:');
    console.log(`DeepSeek API: ${deepseekResult ? '✅ 成功' : '❌ 失败'}`);
    console.log(`Gemini API: ${geminiResult ? '✅ 成功' : '❌ 失败'}`);
    
    if (deepseekResult && geminiResult) {
        console.log('\n🎉 所有 API 连接测试通过！一键连接功能可以正常使用。');
    } else {
        console.log('\n⚠️  部分 API 连接失败，请检查网络或 API 密钥。');
    }
}

// 如果在 Node.js 环境中运行
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { testDeepSeek, testGemini, runTests };
}

// 如果在浏览器中运行
if (typeof window !== 'undefined') {
    window.apiTests = { testDeepSeek, testGemini, runTests };
    console.log('API 测试函数已加载到 window.apiTests');
}