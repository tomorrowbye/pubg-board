# PUBG Board 文档

欢迎来到 PUBG Board 项目文档！本文档提供了项目概述、开发指南和 API 参考资料，帮助您理解和贡献项目。

## 文档目录

### [规则和指南](/docs/rules/index.md)
- [PUBG API 规则和文档](/docs/rules/PUBG_API_RULES.md)
- [PUBG API 参考文档](/docs/rules/PUBG_API_REFERENCE.md)
- [PUBG API 数据模型](/docs/rules/PUBG_DATA_MODELS.md)

### 开发指南
- 项目架构
- 贡献指南
- 代码风格

### 功能文档
- 用户界面
- 数据流
- 缓存策略

## 快速开始

1. 克隆仓库
2. 安装依赖: `npm install`
3. 创建配置文件: 复制 `.env.local.example` 到 `.env.local` 并填入您的 API 密钥
4. 启动开发服务器: `npm run dev`

## 技术栈

- **前端框架**: Next.js 15+
- **UI 组件**: Radix UI
- **样式**: Tailwind CSS
- **数据库**: Supabase

## 常见问题

### 如何获取 PUBG API 密钥?
您需要在 [PUBG 开发者门户](https://developer.pubg.com/) 注册并申请 API 密钥。

### 我遇到 API 速率限制怎么办?
PUBG API 有每分钟最多 10 个请求的限制。我们的应用实现了缓存策略来减少请求次数，同时也添加了用户限制以防止过频请求。

## 贡献

我们欢迎并感谢任何形式的贡献！请查看 [贡献指南](/docs/CONTRIBUTING.md) 了解更多信息。

---

最后更新: 2023年5月12日