# PUBG API 数据模型参考

## 数据模型概述

本文档描述 PUBG API 返回的关键数据结构和模型，帮助开发者理解和处理 API 数据。

## 核心数据类型

### Player (玩家)

```typescript
interface Player {
  type: string;  // 通常为 "player"
  id: string;    // 玩家账号 ID
  attributes: {
    name: string;       // 玩家名称
    shardId: string;    // 平台分片
    stats?: null;       // 弃用字段
    titleId?: string;   // 游戏标题 ID
    patchVersion?: string; // 补丁版本
  };
  relationships?: {
    assets?: {
      data: Array<{ type: string; id: string }>;
    };
    matches?: {
      data: Array<{ type: string; id: string }>;
    };
  };
  links?: {
    self?: string;   // 资源链接
    schema?: string; // 模式链接
  };
}
```

### Season (赛季)

```typescript
interface Season {
  type: string;  // 通常为 "season"
  id: string;    // 赛季 ID，如 "division.bro.official.pc-2018-01"
  attributes: {
    isCurrentSeason: boolean; // 是否为当前赛季
    isOffseason: boolean;     // 是否为赛季间隔期
  };
}
```

### SeasonStats (赛季统计)

```typescript
interface SeasonStats {
  type: string;
  attributes: {
    gameModeStats: {
      [gameMode: string]: GameModeStats;
    };
  };
  relationships: {
    player: { data: { type: string; id: string } };
    season: { data: { type: string; id: string } };
  };
}

interface GameModeStats {
  assists: number;
  boosts: number;
  dBNOs: number;
  dailyKills: number;
  dailyWins: number;
  damageDealt: number;
  days: number;
  headshotKills: number;
  heals: number;
  killPoints: number;
  kills: number;
  longestKill: number;
  longestTimeSurvived: number;
  losses: number;
  maxKillStreaks: number;
  mostSurvivalTime: number;
  rankPoints: number;
  rankPointsTitle: string;
  revives: number;
  rideDistance: number;
  roadKills: number;
  roundMostKills: number;
  roundsPlayed: number;
  suicides: number;
  swimDistance: number;
  teamKills: number;
  timeSurvived: number;
  top10s: number;
  vehicleDestroys: number;
  walkDistance: number;
  weaponsAcquired: number;
  weeklyKills: number;
  weeklyWins: number;
  winPoints: number;
  wins: number;
}
```

### Match (比赛)

```typescript
interface Match {
  type: string;
  id: string;
  attributes: {
    createdAt: string;
    duration: number;
    gameMode: string;
    mapName: string;
    isCustomMatch: boolean;
    seasonState: string;
    shardId: string;
    stats: null;
    tags: null;
    titleId: string;
  };
  relationships: {
    assets: {
      data: Array<{ type: string; id: string }>;
    };
    rosters: {
      data: Array<{ type: string; id: string }>;
    };
    rounds?: {
      data: Array<{ type: string; id: string }>;
    };
    participants: {
      data: Array<{ type: string; id: string }>;
    };
  };
  links: {
    self: string;
    schema: string;
  };
}
```

### Roster (队伍)

```typescript
interface Roster {
  type: string;
  id: string;
  attributes: {
    shardId: string;
    stats: {
      rank: number;
      teamId: number;
    };
    won: string;
  };
  relationships: {
    participants: {
      data: Array<{ type: string; id: string }>;
    };
    team?: {
      data: { type: string; id: string };
    };
  };
}
```

### Participant (参与者)

```typescript
interface Participant {
  type: string;
  id: string;
  attributes: {
    actor: string;
    shardId: string;
    stats: {
      DBNOs: number;
      assists: number;
      boosts: number;
      damageDealt: number;
      deathType: string;
      headshotKills: number;
      heals: number;
      killPlace: number;
      killStreaks: number;
      kills: number;
      longestKill: number;
      name: string;
      playerId: string;
      revives: number;
      rideDistance: number;
      roadKills: number;
      swimDistance: number;
      teamKills: number;
      timeSurvived: number;
      vehicleDestroys: number;
      walkDistance: number;
      weaponsAcquired: number;
      winPlace: number;
    };
  };
  relationships: {
    assets?: {
      data: Array<{ type: string; id: string }>;
    };
    player?: {
      data: { type: string; id: string };
    };
  };
}
```

### WeaponMastery (武器精通)

```typescript
interface WeaponMastery {
  data: {
    type: string;
    attributes: {
      weaponSummaries: Record<string, {
        XPTotal: number;
        LevelCurrent: number;
        TierCurrent: number;
        StatsTotal: {
          Kills: number;
          Damage: number;
          Headshots: number;
          LongestKill: number;
          Defeats: number;
          GroggyKills: number;
        };
        medals: Record<string, number>;
      }>;
    };
    relationships: {
      player: {
        data: {
          type: string;
          id: string;
        };
      };
    };
  };
  links: {
    self: string;
  };
  meta: Record<string, any>;
}
```

### SurvivalMastery (生存精通)

```typescript
interface SurvivalMastery {
  data: {
    type: string;
    attributes: {
      xp: number;
      level: number;
      lastMatchId: string;
      totalMatchesPlayed: number;
      stats: {
        airDropsCalled: number;
        damageDealt: number;
        damageTaken: number;
        distance: {
          ride: number;
          swim: number;
          walk: number;
        };
        enemyCratesLooted: number;
        enemiesKnockedDown: number;
        enemyPlayersKilled: number;
        healingItemsUsed: number;
        hotDropLandings: number;
        items: {
          hats: number;
          masks: number;
          shirts: number;
          vests: number;
        };
        uniqueItemsLooted: number;
        vehiclesDestroyed: number;
      };
    };
    relationships: {
      player: {
        data: {
          type: string;
          id: string;
        };
      };
    };
  };
  links: {
    self: string;
  };
  meta: Record<string, any>;
}
```

## 请求和响应示例

### 查找玩家

**请求:**
```
GET https://api.pubg.com/shards/steam/players?filter[playerNames]=shroud
```

**响应:**
```json
{
  "data": [
    {
      "type": "player",
      "id": "account.d50fdc18fcad49c691d38466bed6f8fd",
      "attributes": {
        "name": "shroud",
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
              "id": "a6d8d8f7-a3c4-4b1c-9947-8df40c144283"
            },
            {
              "type": "match",
              "id": "b9f14071-72ad-4bde-ba0a-a33eb3b039f9"
            }
          ]
        }
      },
      "links": {
        "self": "https://api.pubg.com/shards/steam/players/account.d50fdc18fcad49c691d38466bed6f8fd",
        "schema": ""
      }
    }
  ],
  "links": {
    "self": "https://api.pubg.com/shards/steam/players?filter[playerNames]=shroud"
  },
  "meta": {}
}
```

### 获取赛季统计

**请求:**
```
GET https://api.pubg.com/shards/steam/players/account.d50fdc18fcad49c691d38466bed6f8fd/seasons/division.bro.official.pc-2018-01
```

**响应:**
```json
{
  "data": {
    "type": "playerSeason",
    "attributes": {
      "gameModeStats": {
        "duo": {
          "assists": 0,
          "boosts": 0,
          "dBNOs": 0,
          "dailyKills": 0,
          "dailyWins": 0,
          "damageDealt": 0,
          "days": 0,
          "headshotKills": 0,
          "heals": 0,
          "killPoints": 0,
          "kills": 0,
          "longestKill": 0,
          "longestTimeSurvived": 0,
          "losses": 0,
          "maxKillStreaks": 0,
          "mostSurvivalTime": 0,
          "rankPoints": 0,
          "rankPointsTitle": "",
          "revives": 0,
          "rideDistance": 0,
          "roadKills": 0,
          "roundMostKills": 0,
          "roundsPlayed": 0,
          "suicides": 0,
          "swimDistance": 0,
          "teamKills": 0,
          "timeSurvived": 0,
          "top10s": 0,
          "vehicleDestroys": 0,
          "walkDistance": 0,
          "weaponsAcquired": 0,
          "weeklyKills": 0,
          "weeklyWins": 0,
          "winPoints": 0,
          "wins": 0
        },
        "duo-fpp": {
          "assists": 7,
          "boosts": 23,
          "dBNOs": 11,
          "dailyKills": 10,
          "dailyWins": 0,
          "damageDealt": 2730.818,
          "days": 2,
          "headshotKills": 5,
          "heals": 19,
          "killPoints": 1230.8215,
          "kills": 18,
          "longestKill": 289.292,
          "longestTimeSurvived": 1367.962,
          "losses": 9,
          "maxKillStreaks": 2,
          "mostSurvivalTime": 1367.962,
          "rankPoints": 0,
          "rankPointsTitle": "",
          "revives": 2,
          "rideDistance": 25933.844,
          "roadKills": 0,
          "roundMostKills": 6,
          "roundsPlayed": 9,
          "suicides": 0,
          "swimDistance": 0,
          "teamKills": 0,
          "timeSurvived": 8071.5957,
          "top10s": 4,
          "vehicleDestroys": 0,
          "walkDistance": 19784.387,
          "weaponsAcquired": 46,
          "weeklyKills": 18,
          "weeklyWins": 0,
          "winPoints": 1237.5992,
          "wins": 0
        }
      }
    },
    "relationships": {
      "player": {
        "data": {
          "type": "player",
          "id": "account.d50fdc18fcad49c691d38466bed6f8fd"
        }
      },
      "season": {
        "data": {
          "type": "season",
          "id": "division.bro.official.pc-2018-01"
        }
      }
    }
  },
  "links": {
    "self": "https://api.pubg.com/shards/steam/players/account.d50fdc18fcad49c691d38466bed6f8fd/seasons/division.bro.official.pc-2018-01"
  },
  "meta": {}
}
```

## 枚举值

### 游戏模式

- `solo`: 第三人称单人模式
- `solo-fpp`: 第一人称单人模式
- `duo`: 第三人称双人模式
- `duo-fpp`: 第一人称双人模式
- `squad`: 第三人称四人模式
- `squad-fpp`: 第一人称四人模式

### 地图名称

- `Baltic_Main`: Erangel (重制版)
- `Erangel_Main`: Erangel
- `Desert_Main`: Miramar
- `Savage_Main`: Sanhok
- `DihorOtok_Main`: Vikendi
- `Summerland_Main`: Karakin
- `Heaven_Main`: Haven
- `Tiger_Main`: Taego
- `Kiki_Main`: Deston
- `Chimera_Main`: Paramo

### 死亡类型

- `alive`: 存活
- `byplayer`: 被玩家击杀
- `suicide`: 自杀
- `logout`: 掉线
- `bluezone`: 被蓝圈击杀
- `redzone`: 被红圈轰炸击杀

## 注意事项

1. API 返回的某些字段可能为空或 null，需要做好数据验证
2. 部分数据结构可能随版本更新而变化
3. 始终检查文档中的最新更改

---

最后更新: 2023年5月9日