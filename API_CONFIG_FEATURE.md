# API配置功能更新

## 功能概述
在原有的Google Gemini API基础上，新增了对OpenAI和DeepSeek的支持，用户可以自由选择使用哪个AI服务提供商。

## 主要改动

### 1. API配置数据结构
```javascript
{
  provider: 'google' | 'openai' | 'deepseek',  // 当前选择的提供商
  keys: {
    google: '',    // Google Gemini API Key
    openai: '',    // OpenAI API Key
    deepseek: ''   // DeepSeek API Key
  }
}
```

### 2. 新增功能

#### 统一的AI调用接口
- `callAI(provider, apiKey, prompt)` - 根据提供商调用相应的API
- `callAIWithRetry(provider, apiKey, prompt, retries)` - 带重试机制的AI调用

#### 支持的AI服务
1. **Google Gemini**
   - 模型: `gemini-2.0-flash-exp`
   - Key格式: 以 `AIza` 开头
   
2. **OpenAI**
   - 模型: `gpt-4o`
   - Key格式: 以 `sk-` 开头
   - API端点: `https://api.openai.com/v1/chat/completions`
   
3. **DeepSeek**
   - 模型: `deepseek-chat`
   - Key格式: 以 `sk-` 开头
   - API端点: `https://api.deepseek.com/v1/chat/completions`

### 3. UI改进

#### API设置界面
- 三个选项卡切换不同的AI服务提供商
- 每个提供商独立保存API Key
- 实时显示当前选择的提供商
- 智能提示Key格式要求

### 4. 兼容性
- 自动迁移旧版本的单一API Key配置
- 保持原有的所有功能不变
- 所有AI调用（复盘、计划生成）都使用新的统一接口

## 使用方法

1. 点击设置按钮打开API配置界面
2. 选择要使用的AI服务（Google/OpenAI/DeepSeek）
3. 输入对应的API Key
4. 点击保存
5. 系统会自动使用选择的AI服务进行复盘和计划生成

## 数据存储
- 配置保存在 `localStorage` 的 `lifeos_pro_api_config` 键中
- 支持多个API Key同时保存，切换提供商时无需重新输入

## 注意事项
- 不同AI服务的响应格式已统一处理
- 所有服务都返回JSON格式的结构化数据
- 自动重试机制确保调用稳定性
