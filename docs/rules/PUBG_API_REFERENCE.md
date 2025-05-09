# PUBG API 参考文档

## API 基础信息

- **基本URL**: `https://api.pubg.com`
- **格式**: JSON-API
- **身份验证**: Bearer Token

## 请求头

所有请求必须包含以下请求头：

```
Authorization: Bearer <your-api-key>
Accept: application/vnd.api+json
```

## 平台分片

所有请求都必须指定平台分片：

| 分片 | 描述 |
|------|------|
| `steam` | Steam 平台 |
| `kakao` | 韩国 Kakao 平台 |
| `xbox` | Xbox 平台 |
| `psn` | PlayStation 平台 |
| `stadia` | Google Stadia 平台 |
| `console` | 适用于 Xbox 和 PlayStation 统计数据的组合分片 |
| `tournament` | 用于电竞赛事的特殊分片 |

## 主要端点

### 玩家 API

#### 按名称获取玩家

```
GET /shards/{platform}/players?filter[playerNames]={name1,name2,...}
```

**参数**:
- `platform`: 平台分片
- `playerNames`: 逗号分隔的玩家名称列表（最多 10 个）

**响应示例**:
```json
{
  "data": [
    {
      "type": "player",
      "id": "account.a540a32a49784025939a975b45e86bfe",
      "attributes": {
        "name": "PlayerName",
        "shardId": "steam",
        "patchVersion": "",
        "titleId": "pubg"
      },
      "relationships": {
        "assets": {
          "data": []
        },
        "matches": {
          "data": [
            {
              "type": "match",
              "id": "e520caa3-82e8-4698-964e-8180d0edd629"
            }
          ]
        }
      },
      "links": {
        "self": "https://api.pubg.com/shards/steam/players/account.a540a32a49784025939a975b45e86bfe",
        "schema": ""
      }
    }
  ],
  "links": {
    "self": "https://api.pubg.com/shards/steam/players?filter[playerNames]=PlayerName"
  },
  "meta": {}
}
```

#### 按ID获取玩家

```
GET /shards/{platform}/players/{id}
```

**参数**:
- `platform`: 平台分片
- `id`: 玩家账号ID

### 赛季 API

#### 获取赛季列表

```
GET /shards/{platform}/seasons
```

**参数**:
- `platform`: 平台分片

**响应示例**:
```json
{
  "data": [
    {
      "type": "season",
      "id": "division.bro.official.pc-2018-01",
      "attributes": {
        "isCurrentSeason": false,
        "isOffseason": false
      }
    },
    {
      "type": "season",
      "id": "division.bro.official.pc-2018-02",
      "attributes": {
        "isCurrentSeason": true,
        "isOffseason": false
      }
    }
  ],
  "links": {
    "self": "https://api.pubg.com/shards/steam/seasons"
  },
  "meta": {}
}
```

#### 获取玩家赛季统计数据

```
GET /shards/{platform}/players/{accountId}/seasons/{seasonId}
```

**参数**:
- `platform`: 平台分片
- `accountId`: 玩家账号ID
- `seasonId`: 赛季ID

#### 获取玩家生涯统计数据

```
GET /shards/{platform}/players/{accountId}/seasons/lifetime
```

**参数**:
- `platform`: 平台分片
- `accountId`: 玩家账号ID

### 比赛 API

#### 获取比赛详情

```
GET /shards/{platform}/matches/{id}
```

**参数**:
- `platform`: 平台分片
- `id`: 比赛ID

**响应包含**:
- 比赛元数据
- 队伍信息
- 参与者统计
- 遥测数据链接

### 排行榜 API

```
GET /shards/{platform}/leaderboards/{gameMode}
```

**参数**:
- `platform`: 平台分片
- `gameMode`: 游戏模式，例如 `squad`, `solo`, `duo` 及其 FPP 变体

### 样本 API

获取随机的最近比赛样本:

```
GET /shards/{platform}/samples
```

**参数**:
- `platform`: 平台分片
- `filter[createdAt-start]`: (可选) ISO8601 开始日期

### 战队信息

**注意**: PUBG API 目前不支持通过公开 API 获取玩家所属战队的信息。

虽然在游戏内玩家可能属于战队，但官方 API 没有提供查询战队信息的端点。应用程序应当避免显示不存在的战队数据，或明确标注任何非官方来源的战队信息。

#### 生存精通

```
GET /shards/{platform}/players/{accountId}/survival_mastery
```

**参数**:
- `platform`: 平台分片
- `accountId`: 玩家账号ID

#### 战队数据的限制

PUBG API 不提供以下功能：
- 获取玩家所属战队信息
- 查询战队成员列表
- 获取战队排名或统计数据

## 遥测数据

遥测数据包含比赛的详细事件，可通过比赛响应中的资源链接获取。这些数据包含比赛中的详细事件，如玩家位置、伤害、死亡等。

## 错误代码

| HTTP状态码 | 描述 |
|------------|------|
| 200 | 成功 |
| 400 | 错误请求 |
| 401 | 未授权 - API 密钥无效 |
| 404 | 未找到资源 |
| 415 | 不支持的媒体类型 |
| 429 | 请求过多 - 超出速率限制 |

## 速率限制

默认速率限制为每分钟 10 个请求。请求响应头中会包含以下信息：

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1512629169
```

## 数据结构

### 游戏模式

游戏模式可以是以下值之一：

- `solo`: 单人第三人称
- `solo-fpp`: 单人第一人称
- `duo`: 双人组队第三人称
- `duo-fpp`: 双人组队第一人称
- `squad`: 四人组队第三人称
- `squad-fpp`: 四人组队第一人称

### 地图

地图可以是以下值之一：

- `Baltic_Main`: Erangel (重制版)
- `Erangel_Main`: Erangel
- `Desert_Main`: Miramar
- `Savage_Main`: Sanhok
- `DihorOtok_Main`: Vikendi
- `Summerland_Main`: Karakin
- `Heaven_Main`: Haven
- `Tiger_Main`: Taego

## 最佳实践

1. **缓存数据**: 为减少 API 调用次数，缓存不经常变化的数据
2. **处理速率限制**: 实现退避策略处理 429 错误
3. **批量请求**: 使用批量端点（如按名称获取多个玩家）减少请求次数
4. **错误处理**: 全面处理所有错误情况
5. **数据验证**: 始终验证来自 API 的响应数据
6. **缺失数据**: 对于 API 不支持的数据（如战队信息），应当在 UI 中隐藏相关功能或明确标注不可用

## 更多资源

- [PUBG 开发者门户](https://developer.pubg.com/)
- [PUBG API 文档](https://documentation.pubg.com/)
- [GitHub 数据字典](https://github.com/pubg/api-documentation)

---

最后更新: 2023年5月9日