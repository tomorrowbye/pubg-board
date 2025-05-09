import { PubgApiClient } from '@/lib/api/pubg-api-client';
import { getPubgApiConfig } from '@/lib/api/pubg-api-config';
import {
  ApiError,
  Clan,
  Leaderboard,
  LifetimeStats,
  MatchDetail,
  PlatformShard,
  Player,
  PubgResponse,
  Sample,
  Season,
  SeasonStats,
  SurvivalMastery,
  WeaponMastery,
} from '@/types/pubg-api';

/**
 * 创建 PUBG API 客户端实例
 * @param customShard 可选的自定义分片
 * @returns PUBG API 客户端实例
 */
function createApiClient(customShard?: PlatformShard): PubgApiClient {
  const config = getPubgApiConfig();
  
  // 确保 shard 值有效，且适当转换为小写
  let shard = customShard;
  if (!shard) {
    shard = config.shard;
  }
  
  console.log(`🔧 创建 API 客户端, 平台: ${shard}`);
  
  return new PubgApiClient({
    apiKey: config.apiKey,
    shard: shard,
  });
}

/**
 * PUBG API 服务
 * 提供对 PUBG API 的高级访问方法
 */
export const pubgApiService = {
  /**
   * 搜索玩家
   * @param playerName 玩家名称
   * @param shard 可选平台分片
   * @returns 玩家信息
   */
  async searchPlayer(
    playerName: string,
    shard?: PlatformShard
  ): Promise<Player | null> {
    console.log(`🔍 搜索玩家: ${playerName}, 平台: ${shard || '默认'}`);
    try {
      // 确保玩家名称非空
      if (!playerName || playerName.trim() === '') {
        console.error('❌ 玩家名称为空');
        return null;
      }
      
      // 确保分片值有效
      if (shard) {
        console.log(`🌍 使用指定平台: ${shard}`);
      } else {
        console.log(`🌍 使用默认平台`);
      }
      
      const client = createApiClient(shard);
      console.log(`🔍 使用名称 "${playerName}" 查询玩家`);
      const response = await client.getPlayersByNames([playerName]);
      
      console.log(`📊 API 返回数据: ${JSON.stringify(response?.data?.length ? '找到数据' : '空数据')}`);
      const player = response.data?.[0] || null;
      
      if (player) {
        console.log(`✅ 找到玩家: ${player.attributes.name}, ID: ${player.id}`);
      } else {
        console.log(`❌ 未找到玩家: ${playerName}`);
      }
      
      return player;
    } catch (error) {
      console.error('❌ Error searching player:', error);
      return null;
    }
  },

  /**
   * 获取多个玩家信息
   * @param playerNames 玩家名称数组
   * @param shard 可选平台分片
   * @returns 玩家信息数组
   */
  async getPlayersByNames(
    playerNames: string[],
    shard?: PlatformShard
  ): Promise<Player[]> {
    console.log(`🔍 获取多个玩家信息: ${playerNames.join(', ')}, 平台: ${shard || '默认'}`);
    try {
      const client = createApiClient(shard);
      const response = await client.getPlayersByNames(playerNames);
      
      console.log(`✅ 找到 ${response.data.length} 名玩家`);
      if (response.data.length > 0) {
        console.log(`📊 玩家列表: ${response.data.map(p => p.attributes.name).join(', ')}`);
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error getting players by names:', error);
      return [];
    }
  },

  /**
   * 根据多个账号ID获取玩家信息
   * @param accountIds 账号ID数组
   * @param shard 可选平台分片
   * @returns 玩家信息数组
   */
  async getPlayersByIds(
    accountIds: string[],
    shard?: PlatformShard
  ): Promise<Player[]> {
    console.log(`🔍 根据ID获取多个玩家信息: ${accountIds.join(', ')}, 平台: ${shard || '默认'}`);
    try {
      const client = createApiClient(shard);
      const response = await client.getPlayersByIds(accountIds);
      
      console.log(`✅ 找到 ${response.data.length} 名玩家`);
      if (response.data.length > 0) {
        console.log(`📊 玩家列表: ${response.data.map(p => p.attributes.name).join(', ')}`);
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error getting players by IDs:', error);
      return [];
    }
  },

  /**
   * 根据账号 ID 获取玩家信息
   * @param accountId 账号 ID
   * @param shard 可选平台分片
   * @returns 玩家信息
   */
  async getPlayer(
    accountId: string,
    shard?: PlatformShard
  ): Promise<Player | null> {
    console.log(`🔍 根据 ID 获取玩家: ${accountId}, 平台: ${shard || '默认'}`);
    try {
      const client = createApiClient(shard);
      const response = await client.getPlayer(accountId);
      
      console.log(`✅ 获取到玩家: ${response.data.attributes.name}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error getting player by ID:', error);
      return null;
    }
  },

  /**
   * 获取季节列表
   * @param shard 可选平台分片
   * @param sorted 是否按时间排序（默认为true）
   * @returns 季节列表
   */
  async getSeasons(shard?: PlatformShard, sorted: boolean = true): Promise<Season[]> {
    console.log(`🔍 获取赛季列表, 平台: ${shard || '默认'}`);
    try {
      const client = createApiClient(shard);
      const response = await client.getSeasons();
      
      console.log(`✅ 获取到 ${response.data.length} 个赛季`);
      const currentSeason = response.data.find(s => s.attributes.isCurrentSeason);
      if (currentSeason) {
        console.log(`📊 当前赛季: ${currentSeason.id}`);
      }
      
      // 如果需要排序，按ID排序（通常最新的赛季ID会更大）
      if (sorted && response.data.length > 0) {
        console.log(`🔄 对赛季进行排序`);
        return [...response.data].sort((a, b) => b.id.localeCompare(a.id));
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error getting seasons:', error);
      return [];
    }
  },

  /**
   * 获取当前赛季
   * @param shard 可选平台分片
   * @returns 当前赛季信息
   */
  async getCurrentSeason(shard?: PlatformShard): Promise<Season | null> {
    console.log(`🔍 获取当前赛季, 平台: ${shard || '默认'}`);
    try {
      const client = createApiClient(shard);
      const response = await client.getSeasons();
      
      console.log(`📋 获取到 ${response.data.length} 个赛季`);
      
      // 找到当前赛季
      let currentSeason = response.data.find(season => season.attributes.isCurrentSeason) || null;
      
      if (currentSeason) {
        console.log(`✅ 当前赛季: ${currentSeason.id}`);
        
        // 验证赛季ID格式
        if (!currentSeason.id.startsWith('division.bro.official.')) {
          console.warn(`⚠️ 当前赛季ID格式不符合预期: ${currentSeason.id}`);
        }
      } else {
        console.log(`❌ 未找到当前赛季，尝试获取最新赛季`);
        
        // 如果找不到明确标记为当前赛季的，尝试获取最新的赛季
        if (response.data.length > 0) {
          // 按ID排序，通常最新的赛季ID会更大
          const sortedSeasons = [...response.data].sort((a, b) => b.id.localeCompare(a.id));
          currentSeason = sortedSeasons[0];
          console.log(`✅ 选择最新赛季作为当前赛季: ${currentSeason.id}`);
        }
      }
      
      return currentSeason;
    } catch (error) {
      console.error('❌ Error getting current season:', error);
      return null;
    }
  },

  /**
   * 获取玩家在特定赛季的统计数据
   * @param accountId 账号 ID
   * @param seasonId 赛季 ID
   * @param shard 可选平台分片
   * @returns 赛季统计数据
   */
  async getPlayerSeasonStats(
    accountId: string,
    seasonId: string,
    shard?: PlatformShard
  ): Promise<SeasonStats | null> {
    console.log(`🔍 获取玩家赛季数据: 玩家ID=${accountId}, 赛季=${seasonId}, 平台: ${shard || '默认'}`);
    try {
      const client = createApiClient(shard);
      const response = await client.getPlayerSeasonStats(accountId, seasonId);
      
      console.log(`✅ 获取到玩家赛季数据`);
      // 打印部分统计信息摘要
      const gameModes = Object.keys(response.data.attributes.gameModeStats);
      console.log(`📊 游戏模式: ${gameModes.join(', ')}`);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error getting player season stats:', error);
      return null;
    }
  },

  /**
   * 获取玩家当前赛季的统计数据
   * @param accountId 账号 ID
   * @param shard 可选平台分片
   * @returns 当前赛季统计数据
   */
  async getPlayerCurrentSeasonStats(
    accountId: string,
    shard?: PlatformShard
  ): Promise<SeasonStats | null> {
    console.log(`🔍 获取玩家当前赛季数据: 玩家ID=${accountId}, 平台: ${shard || '默认'}`);
    try {
      const currentSeason = await this.getCurrentSeason(shard);
      if (!currentSeason) {
        console.error(`❌ 未找到当前赛季`);
        throw new Error('Current season not found');
      }
      
      // 确保账号ID格式正确
      if (!accountId || accountId.trim() === '') {
        console.error(`❌ 无效的账号ID: ${accountId}`);
        throw new Error('Invalid account ID');
      }
      
      console.log(`🔄 使用赛季 ${currentSeason.id} 获取玩家 ${accountId} 的统计数据`);
      
      // 直接构建和调用 API
      try {
        const seasonStats = await this.getPlayerSeasonStats(accountId, currentSeason.id, shard);
        if (!seasonStats) {
          throw new Error('No season stats found');
        }
        return seasonStats;
      } catch (statsError) {
        console.error(`❌ 获取玩家赛季数据失败: ${(statsError as Error).message}`);
        console.log(`🔄 尝试获取其他最近赛季数据`);
        
        try {
          // 获取所有赛季并尝试获取最近的另一个赛季的数据
          const client = createApiClient(shard);
          const response = await client.getSeasons();
          
          if (response.data && response.data.length > 0) {
            // 按ID排序，获取最近的几个赛季
            const sortedSeasons = [...response.data]
              .sort((a, b) => b.id.localeCompare(a.id))
              .slice(0, 5); // 获取最近的5个赛季
            
            // 尝试每个赛季，直到找到有数据的赛季
            for (const season of sortedSeasons) {
              if (season.id === currentSeason.id) continue; // 跳过已尝试的当前赛季
              
              console.log(`🔄 尝试赛季 ${season.id}`);
              try {
                const stats = await this.getPlayerSeasonStats(accountId, season.id, shard);
                if (stats) {
                  console.log(`✅ 在赛季 ${season.id} 找到数据`);
                  return stats;
                }
              } catch (e) {
                console.log(`⚠️ 赛季 ${season.id} 无数据`);
              }
            }
          }
        } catch (e) {
          console.error(`❌ 获取替代赛季数据失败:`, e);
        }
        
        // 如果所有赛季都失败，尝试获取终身数据
        console.log(`🔄 尝试使用 lifetime 获取数据`);
        return await this.getPlayerLifetimeStats(accountId, shard) as unknown as SeasonStats;
      }
    } catch (error) {
      console.error('❌ Error getting player current season stats:', error);
      return null;
    }
  },

  /**
   * 获取玩家的终身统计数据
   * @param accountId 账号 ID
   * @param shard 可选平台分片
   * @returns 终身统计数据
   */
  async getPlayerLifetimeStats(
    accountId: string,
    shard?: PlatformShard
  ): Promise<LifetimeStats | null> {
    console.log(`🔍 获取玩家终身统计数据: 玩家ID=${accountId}, 平台: ${shard || '默认'}`);
    try {
      const client = createApiClient(shard);
      const response = await client.getPlayerLifetimeStats(accountId);
      
      console.log(`✅ 获取到玩家终身统计数据`);
      // 打印部分统计信息摘要
      const gameModes = Object.keys(response.data.attributes.gameModeStats);
      console.log(`📊 游戏模式: ${gameModes.join(', ')}`);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error getting player lifetime stats:', error);
      return null;
    }
  },

  /**
   * 获取比赛详情
   * @param matchId 比赛 ID
   * @param shard 可选平台分片
   * @returns 比赛详情
   */
  async getMatch(
    matchId: string,
    shard?: PlatformShard
  ): Promise<MatchDetail | null> {
    console.log(`🔍 获取比赛详情: 比赛ID=${matchId}, 平台: ${shard || '默认'}`);
    try {
      const client = createApiClient(shard);
      const matchDetail = await client.getMatch(matchId);
      
      console.log(`✅ 获取到比赛详情`);
      console.log(`📊 地图: ${matchDetail.data.attributes.mapName}, 模式: ${matchDetail.data.attributes.gameMode}`);
      console.log(`👥 参与者数量: ${matchDetail.included.filter(item => item.type === 'participant').length}`);
      
      return matchDetail;
    } catch (error) {
      console.error('❌ Error getting match details:', error);
      return null;
    }
  },

  /**
   * 获取排行榜
   * @param gameMode 游戏模式
   * @param shard 可选平台分片
   * @returns 排行榜数据
   */
  async getLeaderboard(
    gameMode: string,
    shard?: PlatformShard
  ): Promise<Leaderboard | null> {
    console.log(`🔍 获取排行榜: 游戏模式=${gameMode}, 平台: ${shard || '默认'}`);
    try {
      const client = createApiClient(shard);
      const response = await client.getLeaderboard(gameMode);
      
      console.log(`✅ 获取到排行榜数据`);
      if (response.data.included) {
        console.log(`📊 排行榜玩家数量: ${response.data.included.length}`);
        if (response.data.included.length > 0) {
          console.log(`🥇 第一名: ${response.data.included[0].attributes.name}`);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error getting leaderboard:', error);
      return null;
    }
  },

  /**
   * 获取样本比赛数据
   * @param shard 可选平台分片
   * @returns 样本数据
   */
  async getSampleMatches(
    shard?: PlatformShard
  ): Promise<Sample | null> {
    try {
      const client = createApiClient(shard);
      const response = await client.getSamples();
      return response.data;
    } catch (error) {
      console.error('Error getting sample matches:', error);
      return null;
    }
  },

  /**
   * 获取玩家的武器精通数据
   * @param accountId 账号 ID
   * @param shard 可选平台分片
   * @returns 武器精通数据
   */
  async getWeaponMastery(
    accountId: string,
    shard?: PlatformShard
  ): Promise<WeaponMastery | null> {
    try {
      const client = createApiClient(shard);
      return await client.getWeaponMastery(accountId);
    } catch (error) {
      console.error('Error getting weapon mastery:', error);
      return null;
    }
  },

  /**
   * 获取玩家的生存精通数据
   * @param accountId 账号 ID
   * @param shard 可选平台分片
   * @returns 生存精通数据
   */
  async getSurvivalMastery(
    accountId: string,
    shard?: PlatformShard
  ): Promise<SurvivalMastery | null> {
    try {
      const client = createApiClient(shard);
      return await client.getSurvivalMastery(accountId);
    } catch (error) {
      console.error('Error getting survival mastery:', error);
      return null;
    }
  },

  /**
   * 获取公会信息
   * @param clanId 公会 ID
   * @param shard 可选平台分片
   * @returns 公会信息
   */
  async getClan(
    playerId: string,
    shard?: PlatformShard
  ): Promise<Clan | null> {
    try {
      console.log(`🔍 尝试获取玩家 ${playerId} 战队信息, 平台: ${shard || '默认'}`);
      
      // PUBG API 目前不直接提供获取战队的端点
      // 根据官方文档，无法直接获取玩家战队信息
      // 如果要获取战队信息，将需要额外的服务或API
      
      console.log(`ℹ️ PUBG API 不支持获取战队信息`);
      return null;
    } catch (error) {
      console.error('❌ Error getting clan information:', error);
      return null;
    }
  },

  /**
   * 获取玩家的最近比赛
   * @param player 玩家对象
   * @param limit 获取比赛的数量限制
   * @param shard 可选平台分片
   * @returns 最近比赛数据
   */
  async getPlayerRecentMatches(
    player: Player,
    limit: number = 20,
    shard?: PlatformShard
  ): Promise<MatchDetail[]> {
    try {
      console.log(`🔍 获取玩家 ${player.attributes.name} 的最近 ${limit} 场比赛`);
      
      // 获取玩家的比赛ID列表
      const matchIds = player.relationships?.matches?.data.slice(0, limit).map(match => match.id) || [];
      
      if (matchIds.length === 0) {
        console.log(`⚠️ 玩家没有比赛记录`);
        return [];
      }
      
      console.log(`📊 找到 ${matchIds.length} 场比赛，准备获取详情`);
      const client = createApiClient(shard);
      
      // 并行获取比赛详情，但限制并发数
      const results: MatchDetail[] = [];
      const batchSize = 5; // 每批次处理的比赛数
      
      for (let i = 0; i < matchIds.length; i += batchSize) {
        const batchIds = matchIds.slice(i, i + batchSize);
        console.log(`🔄 获取第 ${i+1}-${Math.min(i+batchSize, matchIds.length)} 场比赛详情`);
        
        const batchPromises = batchIds.map(matchId => client.getMatch(matchId)
          .catch(err => {
            console.error(`❌ 获取比赛 ${matchId} 失败:`, err);
            return null;
          })
        );
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults.filter(Boolean) as MatchDetail[]);
      }
      
      console.log(`✅ 成功获取 ${results.length} 场比赛详情`);
      return results;
    } catch (error) {
      console.error('❌ Error getting player recent matches:', error);
      return [];
    }
  },
};