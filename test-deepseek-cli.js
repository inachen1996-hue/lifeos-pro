#!/usr/bin/env node

// DeepSeek API 命令行测试工具
import https from 'https';

const API_KEY = 'sk-d1fdb210d0424ffdbad83f1ebe4e283b';

async function testDeepSeekAPI(prompt, testName) {
    console.log(`\n🧪 测试: ${testName}`);
    console.log('=' .repeat(50));
    
    const enhancedPrompt = `${prompt}\n\n重要：请确保你的回复是有效的JSON格式。`;
    
    const requestData = JSON.stringify({
        model: 'deepseek-chat',
        messages: [
            { role: 'system', content: 'You are a helpful assistant that always responds in valid JSON format.' },
            { role: 'user', content: enhancedPrompt }
        ],
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
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Length': Buffer.byteLength(requestData)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`📡 响应状态: ${res.statusCode}`);
                
                if (res.statusCode !== 200) {
                    console.error(`❌ API 错误: ${res.statusCode}`);
                    console.error(`错误详情: ${data}`);
                    reject(new Error(`API Error: ${res.statusCode}`));
                    return;
                }
                
                try {
                    const response = JSON.parse(data);
                    console.log(`✅ API 调用成功`);
                    
                    if (response.choices && response.choices[0] && response.choices[0].message) {
                        const content = response.choices[0].message.content;
                        console.log(`📝 回复长度: ${content.length} 字符`);
                        
                        // 验证 JSON 格式
                        try {
                            const parsedContent = JSON.parse(content);
                            console.log(`✅ JSON 格式验证通过`);
                            console.log(`📋 解析结果:`, JSON.stringify(parsedContent, null, 2));
                            resolve(parsedContent);
                        } catch (jsonError) {
                            console.log(`⚠️  JSON 解析失败，尝试提取...`);
                            console.log(`原始内容: ${content}`);
                            
                            // 尝试提取 JSON
                            const jsonMatch = content.match(/\{[\s\S]*\}/);
                            if (jsonMatch) {
                                try {
                                    const extractedJson = JSON.parse(jsonMatch[0]);
                                    console.log(`✅ 成功提取 JSON`);
                                    console.log(`📋 提取结果:`, JSON.stringify(extractedJson, null, 2));
                                    resolve(extractedJson);
                                } catch (e) {
                                    console.error(`❌ 提取的 JSON 仍然无效: ${e.message}`);
                                    reject(new Error(`Invalid JSON: ${content}`));
                                }
                            } else {
                                console.error(`❌ 无法找到 JSON 内容`);
                                reject(new Error(`No JSON found: ${content}`));
                            }
                        }
                    } else {
                        console.error(`❌ API 响应格式异常`);
                        console.error(`响应结构:`, JSON.stringify(response, null, 2));
                        reject(new Error('Invalid API response structure'));
                    }
                } catch (parseError) {
                    console.error(`❌ 响应解析失败: ${parseError.message}`);
                    console.error(`原始响应: ${data}`);
                    reject(parseError);
                }
            });
        });
        
        req.on('error', (error) => {
            console.error(`❌ 请求失败: ${error.message}`);
            reject(error);
        });
        
        req.write(requestData);
        req.end();
    });
}

async function runTests() {
    console.log('🚀 DeepSeek API 测试开始');
    console.log(`🔑 使用 API Key: ${API_KEY.substring(0, 10)}...`);
    
    // 测试1: 简单 JSON 响应
    try {
        await testDeepSeekAPI(
            '请生成一个简单的JSON格式回复，包含一个greeting字段，内容为"Hello World"',
            '简单 JSON 响应'
        );
    } catch (error) {
        console.error(`测试1失败: ${error.message}`);
    }
    
    // 测试2: 计划生成
    try {
        const planPrompt = `Current Time: 09:00, Date: 2024-12-11. User Bio: {"wakeTime":"07:00","sleepTime":"23:00","workHours":8}. User State: {"energy":"high","mood":"good"}. User Request: "今天想要高效工作". Targets: {"work":8,"study":2,"hobby":1}. Pomodoro Settings: {"workDuration":25,"shortBreak":5,"longBreak":15,"cyclesBeforeLongBreak":4}. Language: Chinese (Mandarin). 

CRITICAL RULES:
1. **Plan End**: STRICTLY plan tasks ONLY until 23:00.
2. **Pomodoro Integration**: Use user's custom pomodoro settings
3. **Output JSON**: { "theme_title": "String", "advice": "String", "blocks": [ { "time": "HH:MM - HH:MM", "category": "work|study|rest", "title": "String", "desc": "String" } ] }`;
        
        await testDeepSeekAPI(planPrompt, '计划生成');
    } catch (error) {
        console.error(`测试2失败: ${error.message}`);
    }
    
    // 测试3: 复盘生成
    try {
        const reviewPrompt = `Role: Life Analyst. Scope: 今日. Targets: {"work":8,"study":2,"hobby":1}. **STATS**: {"work":6.5,"study":1.5,"rest":2,"entertainment":1}. **Logs**: """09:00-12:00 工作 编程开发
14:00-17:00 工作 会议讨论
19:00-20:00 学习 阅读技术文档""". **Diary**: """今天工作效率不错，但学习时间不够""". 

Task: 
1. **Deep Insight**: Find behavior patterns
2. **Vision**: Project future if habits continue
3. **3 Protections**: List 3 things to protect
4. **Advice**: Time adjustments
5. **Language**: PURE CHINESE (Mandarin)

Output JSON: { "summary": "String", "insights": ["String 1", "String 2", "String 3", "String 4"] }`;
        
        await testDeepSeekAPI(reviewPrompt, '复盘生成');
    } catch (error) {
        console.error(`测试3失败: ${error.message}`);
    }
    
    console.log('\n🏁 所有测试完成');
}

// 运行测试
runTests().catch(console.error);