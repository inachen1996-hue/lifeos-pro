# API配置使用指南

## 快速开始

### 1. 获取API Key

#### Google Gemini
1. 访问 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 登录Google账号
3. 点击"Create API Key"
4. 复制生成的API Key（以 `AIza` 开头）

#### OpenAI
1. 访问 [OpenAI Platform](https://platform.openai.com/api-keys)
2. 登录OpenAI账号
3. 点击"Create new secret key"
4. 复制生成的API Key（以 `sk-` 开头）

#### DeepSeek
1. 访问 [DeepSeek Platform](https://platform.deepseek.com/)
2. 注册/登录账号
3. 进入API Keys页面
4. 创建新的API Key（以 `sk-` 开头）

### 2. 配置应用

1. 打开应用，点击右上角的设置图标（齿轮）
2. 在弹出的"设置 API Key"对话框中：
   - 选择要使用的AI服务（Google/OpenAI/DeepSeek）
   - 输入对应的API Key
   - 点击"保存"按钮

### 3. 切换AI服务

- 可以为每个AI服务都配置API Key
- 随时切换使用不同的AI服务
- 切换时无需重新输入已保存的Key

## 功能对比

| 功能 | Google Gemini | OpenAI | DeepSeek |
|------|---------------|--------|----------|
| 模型 | gemini-2.0-flash-exp | gpt-4o | deepseek-chat |
| 响应速度 | 快 | 中等 | 快 |
| 成本 | 低 | 较高 | 低 |
| 中文支持 | 优秀 | 优秀 | 优秀 |

## 常见问题

### Q: 可以同时配置多个API Key吗？
A: 可以！系统会为每个AI服务独立保存API Key，您可以随时切换使用。

### Q: 切换AI服务后，之前的数据会丢失吗？
A: 不会。所有历史数据、日记、计划都会保留，只是使用不同的AI服务生成新的内容。

### Q: 如何知道当前使用的是哪个AI服务？
A: 打开API设置界面，高亮显示的按钮就是当前选择的AI服务。

### Q: API Key安全吗？
A: API Key保存在浏览器的localStorage中，仅在本地存储，不会上传到任何服务器。

### Q: 如果API调用失败怎么办？
A: 系统内置了自动重试机制（最多3次），如果仍然失败会显示错误提示。请检查：
- API Key是否正确
- 网络连接是否正常
- API服务是否可用
- 账户余额是否充足

## 技术细节

### API调用流程
1. 用户触发复盘或计划生成
2. 系统读取当前选择的AI服务提供商
3. 使用对应的API Key调用AI服务
4. 解析返回的JSON数据
5. 展示结果给用户

### 数据格式
所有AI服务返回的数据都会被统一处理为相同的JSON格式，确保功能一致性。

### 错误处理
- 自动重试机制（指数退避）
- 友好的错误提示
- 不影响其他功能的正常使用
