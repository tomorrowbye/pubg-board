# PUBG API 集成规则和文档

## 简介

PUBG 游戏数据服务提供了对游戏内数据的开放访问，开发者可以利用这些数据构建工具和服务。本文档总结了 PUBG API 的集成规则和使用指南，确保我们的应用程序符合 PUBG 的使用条款和最佳实践。

## API 基础

- **API 格式**：PUBG API 实现了 JSON-API 规范的功能。所有端点返回的数据将采用 JSON-API 格式。
- **文档**：API 端点文档使用 OpenAPI 规范创建，用户可以交互式地查看其工作方式。
- **数据字典和枚举**：可以在 [GitHub](https://github.com/pubg/api-documentation) 上找到数据字典和枚举。

## API 密钥和访问

- **API 密钥管理**：
  - 我们的应用程序 API 密钥必须保密存储在 `.env.local` 文件中，不得提交到版本控制系统。
  - 发布应用程序时，API 密钥应通过安全环境变量传递。
  - API 密钥的格式：`eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.xxx.xxx`

- **速率限制**：
  - 默认限制为每分钟 10 个请求。
  - 我们的应用程序必须实现缓存机制以遵守这些限制。
  - 建议实现指数退避重试机制处理超出速率限制的情况。

## 请求格式

- **基本 URL**：`https://api.pubg.com`
- **请求标头**：
  ```
  Authorization: Bearer <your-api-key>
  Accept: application/vnd.api+json
  ```
- **分片**：所有请求都需要指定一个平台分片（如 `steam`、`psn`、`xbox` 等）
  - 示例: `/shards/{platform}/players?filter[playerNames]=playerName`

## 主要端点

### 玩家数据

- **获取玩家信息**：
  - `GET /shards/{platform}/players?filter[playerNames]={playerNames}`
  - `GET /shards/{platform}/players/{id}`

- **获取玩家赛季数据**：
  - `GET /shards/{platform}/players/{id}/seasons/{seasonId}`

- **获取玩家生涯数据**：
  - `GET /shards/{platform}/players/{id}/seasons/lifetime`

- **获取玩家精通数据**：
  - `GET /shards/{platform}/players/{id}/weapon_mastery`
  - `GET /shards/{platform}/players/{id}/survival_mastery`

### 战队数据

- **获取战队信息**：
  - **重要**：PUBG API 目前不支持获取战队信息。根据官方文档，无法通过公开 API 获取玩家所属战队的数据。
  - 在应用程序中，我们应该明确地仅在存在真实数据时才显示战队信息，而不是显示模拟数据。

### 比赛数据

- **获取比赛详情**：
  - `GET /shards/{platform}/matches/{id}`

- **获取排行榜**：
  - `GET /shards/{platform}/leaderboards/{gameMode}`

- **获取样本比赛**：
  - `GET /shards/{platform}/samples`

## 数据缓存策略

为了遵守 API 速率限制并提高应用性能，我们实施以下缓存策略：

1. **玩家基本信息**：缓存 24 小时
2. **玩家赛季数据**：缓存 1 小时
3. **比赛详情**：缓存 7 天（比赛数据不会变化）
4. **用户同步冷却时间**：5 分钟（限制用户手动刷新的频率）

## 错误处理

我们的应用程序必须优雅地处理以下 API 错误情况：

- `401 Unauthorized`：API 密钥无效
- `404 Not Found`：请求的资源不存在
- `415 Unsupported Media Type`：请求媒体类型错误
- `429 Too Many Requests`：超出速率限制

对于 429 错误，应用程序应实现退避策略，在重试前等待一段适当的时间。

## 数据解析指南

处理 PUBG API 数据时需要注意以下几点：

1. **JSON-API 格式**：数据使用 JSON-API 格式返回，包含 `data`、`included`、`links` 和 `meta` 部分。
2. **关系处理**：实体之间的关系通过 `relationships` 属性定义。
3. **包含的数据**：像比赛详细信息这样的请求会在 `included` 属性中包含相关实体。

## 本地测试

开发过程中，建议：

1. 使用模拟响应进行本地测试，避免消耗 API 配额。
2. 创建一个专用测试账户进行开发测试。
3. 使用缓存数据来减少 API 调用。

## 法律和版权声明

在使用 PUBG API 时，我们必须遵守 PUBG 的服务条款和法律规定：

- 必须注明 PUBG API 的使用
- 必须显示适当的版权声明：
  "© 2021 KRAFTON, Inc. PLAYERUNKNOWN'S BATTLEGROUNDS 和 PUBG 是 KRAFTON, Inc. 的注册商标或服务标志"

## 获取帮助

- 查阅 [PUBG API 文档](https://documentation.pubg.com/)
- 加入 [PUBG Developer API Discord](https://discord.gg/pubgdevelopers) 服务器

## 应用程序特定规则

1. **用户体验**：
   - 显示数据来源（API 或缓存）
   - 提供清晰的刷新/同步机制
   - 显示上次同步时间

2. **数据完整性**：
   - 验证所有来自 API 的数据
   - 对于可选数据（如战队信息），仅在数据真实存在时显示
   - 不使用模拟数据替代缺失的真实数据
   - 保持本地缓存与远程数据的一致性

---

最后更新：2023 年 5 月 9 日