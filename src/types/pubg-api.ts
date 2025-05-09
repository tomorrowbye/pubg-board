// PUBG API 类型定义

/**
 * 可用的平台/分片
 */
export enum PlatformShard {
  STEAM = 'steam',
  KAKAO = 'kakao',
  XBOX = 'xbox',
  PSN = 'psn',
  STADIA = 'stadia',
  CONSOLE = 'console',
  TOURNAMENT = 'tournament',
}

/**
 * 请求参数类型
 */
export interface ApiOptions {
  shard: PlatformShard;
  apiKey: string;
}

// 通用响应类型
export interface PubgResponse<T> {
  data: T;
  links?: {
    self?: string;
    next?: string;
  };
  meta?: Record<string, any>;
}

// 玩家相关类型
export interface Player {
  type: string;
  id: string;
  attributes: {
    name: string;
    shardId: string;
    stats?: null;
    titleId?: string;
    patchVersion?: string;
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
    self?: string;
    schema?: string;
  };
}

// 赛季统计相关类型
export interface SeasonStats {
  type: string;
  attributes: {
    gameModeStats: {
      [key: string]: GameModeStats;
    };
  };
  relationships: {
    player: { data: { type: string; id: string } };
    season: { data: { type: string; id: string } };
  };
}

// 游戏模式统计
export interface GameModeStats {
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

// 终身统计相关类型
export interface LifetimeStats {
  type: string;
  attributes: {
    gameModeStats: {
      [key: string]: GameModeStats;
    };
  };
  relationships: {
    player: { data: { type: string; id: string } };
  };
}

// 赛季相关类型
export interface Season {
  type: string;
  id: string;
  attributes: {
    isCurrentSeason: boolean;
    isOffseason: boolean;
  };
}

// 比赛相关类型
export interface Match {
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

// 比赛详细信息
export interface MatchDetail {
  data: Match;
  included: Array<
    | Roster
    | Participant
    | Asset
  >;
  links: {
    self: string;
  };
  meta: Record<string, any>;
}

// 战队相关类型
export interface Roster {
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

// 参与者相关类型
export interface Participant {
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

// 资源相关类型
export interface Asset {
  type: string;
  id: string;
  attributes: {
    URL: string;
    createdAt: string;
    description: string;
    name: string;
  };
}

// 排行榜相关类型
export interface Leaderboard {
  type: string;
  id: string;
  attributes: {
    shardId: string;
    gameMode: string;
    name: string;
  };
  included: Array<{
    type: string;
    id: string;
    attributes: {
      name: string;
      rank: number;
      stats: {
        averageDamage: number;
        averageRank: number;
        games: number;
        killDeathRatio: number;
        kills: number;
        rankPoints: number;
        winRatio: number;
        wins: number;
      };
    };
  }>;
}

// 样本相关类型
export interface Sample {
  type: string;
  id: string;
  attributes: {
    createdAt: string;
    shardId: string;
    titleId: string;
  };
  relationships: {
    matches: {
      data: Array<{ type: string; id: string }>;
    };
  };
}

// 精通相关类型
export interface WeaponMastery {
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

// 生存精通相关类型
export interface SurvivalMastery {
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

// 公会相关类型
export interface Clan {
  data: {
    type: string;
    id: string;
    attributes: {
      name: string;
      tag: string;
      createdAt: string;
      updatedAt: string;
    };
    relationships: {
      members: {
        data: Array<{
          type: string;
          id: string;
          attributes: {
            role: string;
          };
        }>;
      };
    };
  };
  links: {
    self: string;
    schema: string;
  };
}

// 错误响应类型
export interface ApiError {
  errors: Array<{
    title: string;
    detail: string;
    status: string;
    code?: string;
  }>;
}