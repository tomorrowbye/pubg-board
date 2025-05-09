import {
  ApiError,
  ApiOptions,
  Asset,
  Clan,
  Leaderboard,
  LifetimeStats,
  Match,
  MatchDetail,
  Participant,
  PlatformShard,
  Player,
  PubgResponse,
  Roster,
  Sample,
  Season,
  SeasonStats,
  SurvivalMastery,
  WeaponMastery,
} from '@/types/pubg-api';

/**
 * PUBG Open API 客户端类
 * 用于与 PUBG API 交互的包装器
 */
export class PubgApiClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly defaultShard: PlatformShard;

  /**
   * 创建 PUBG API 客户端
   * @param options API 选项
   */
  constructor(options: ApiOptions) {
    this.baseUrl = process.env.PUBG_API_BASE_URL || 'https://api.pubg.com';
    this.apiKey = options.apiKey;
    this.defaultShard = options.shard;
    
    console.log(`🔧 初始化 PUBG API 客户端`);
    console.log(`🌐 API 基础 URL: ${this.baseUrl}`);
    console.log(`🔐 API 密钥: ${this.apiKey.substring(0, 8)}...`);
    console.log(`🌍 默认平台分片: ${this.defaultShard}`);
  }

  /**
   * 创建请求头
   * @returns 包含认证信息的请求头
   */
  private getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Accept': 'application/json',
    };
  }

  /**
   * 执行 API 请求
   * @param endpoint API 端点
   * @param shard 可选平台分片
   * @returns Promise 响应
   */
  private async request<T>(endpoint: string, shard: PlatformShard = this.defaultShard): Promise<T> {
    // 确保 shard 值有效
    if (!shard) {
      console.warn(`⚠️ 未提供平台分片，使用默认值: ${this.defaultShard}`);
      shard = this.defaultShard;
    }
    
    // 检查端点格式
    if (endpoint.includes('seasons') && !endpoint.includes('lifetime')) {
      console.log(`🔎 检查赛季端点: ${endpoint}`);
      // 验证赛季ID格式
      const seasonIdMatch = endpoint.match(/seasons\/([^\/]+)/);
      if (seasonIdMatch && seasonIdMatch[1]) {
        const seasonId = seasonIdMatch[1];
        if (!seasonId.startsWith('division.bro.official.')) {
          console.warn(`⚠️ 可能的赛季ID格式问题: ${seasonId}`);
        }
      }
    }
    
    // 构建完整 URL
    const url = `${this.baseUrl}/shards/${shard}/${endpoint}`;
    
    console.log(`🚀 PUBG API 请求: ${url}`);
    console.log(`🔑 请求头: Authorization: Bearer ${this.apiKey.substring(0, 10)}...`);
    console.log(`🌐 平台分片: ${shard}`);
    console.log(`🔗 完整 URL: ${url}`);
    
    const startTime = Date.now();
    const headers = this.getHeaders();
    console.log(`📋 完整请求头:`, headers);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      const elapsed = Date.now() - startTime;
      console.log(`⏱️ API 响应时间: ${elapsed}ms`);
      console.log(`📊 状态码: ${response.status}`);
      console.log(`📑 响应头:`, Object.fromEntries(response.headers.entries()));

      // 获取响应文本，便于调试
      const responseText = await response.text();
      console.log(`📝 原始响应内容:`, responseText);
      
      if (!response.ok) {
        try {
          const errorData = JSON.parse(responseText) as ApiError;
          console.error(`❌ API 错误: ${JSON.stringify(errorData, null, 2)}`);
          throw new Error(
            `PUBG API Error: ${errorData.errors?.[0]?.title} - ${errorData.errors?.[0]?.detail}`
          );
        } catch (parseError) {
          console.error(`❌ 无法解析错误响应:`, parseError);
          throw new Error(`PUBG API Error: Status ${response.status} - ${responseText}`);
        }
      }

      // 将文本转回 JSON
      let data: T;
      try {
        data = JSON.parse(responseText) as T;
        console.log(`✅ API 响应成功`);
        console.log(`📦 响应数据摘要:`, this.summarizeResponse(data));
      } catch (parseError) {
        console.error(`❌ 响应解析失败:`, parseError);
        throw new Error(`Failed to parse API response: ${responseText.substring(0, 200)}...`);
      }
      
      return data;
    } catch (error) {
      console.error('❌ PUBG API request failed:', error);
      throw error;
    }
  }
  
  /**
   * 生成响应数据的摘要
   * @param data 响应数据
   * @returns 数据摘要
   */
  private summarizeResponse(data: any): any {
    if (!data) return 'null';
    
    // 如果是数组，返回数组长度和第一个元素的摘要
    if (Array.isArray(data)) {
      return {
        type: 'Array',
        length: data.length,
        sample: data.length > 0 ? this.summarizeObject(data[0]) : 'empty'
      };
    }
    
    // 如果响应包含 data 属性
    if (data.data) {
      if (Array.isArray(data.data)) {
        return {
          type: 'Collection',
          length: data.data.length,
          sample: data.data.length > 0 ? this.summarizeObject(data.data[0]) : 'empty'
        };
      } else {
        return {
          type: 'SingleObject',
          data: this.summarizeObject(data.data)
        };
      }
    }
    
    return this.summarizeObject(data);
  }
  
  /**
   * 生成对象的摘要
   * @param obj 对象
   * @returns 对象摘要
   */
  private summarizeObject(obj: any): any {
    if (!obj) return 'null';
    if (typeof obj !== 'object') return typeof obj;
    
    // 返回对象类型和ID（如果有）
    const summary: any = {};
    
    if (obj.type) summary.type = obj.type;
    if (obj.id) summary.id = obj.id;
    
    // 返回对象的顶级属性名称
    summary.properties = Object.keys(obj);
    
    return summary;
  }

  /**
   * 根据玩家名称获取玩家信息
   * @param playerNames 玩家名称数组
   * @param shard 可选平台分片
   * @returns 玩家信息
   */
  async getPlayersByNames(
    playerNames: string[],
    shard: PlatformShard = this.defaultShard
  ): Promise<PubgResponse<Player[]>> {
    console.log(`👤 查询玩家: ${playerNames.join(', ')}`);
    // 确保玩家名称非空
    if (!playerNames.length) {
      console.error('❌ 玩家名称列表为空');
      throw new Error('Player names array cannot be empty');
    }
    
    // 构建查询参数 - PUBG API 要求使用 filter[playerNames] 格式
    const namesParam = playerNames.map(name => {
      const encoded = encodeURIComponent(name);
      console.log(`🏷️ 原始玩家名: "${name}" → 编码后: "${encoded}"`);
      return `filter[playerNames]=${encoded}`;
    }).join('&');
    
    console.log(`🔍 完整查询参数: ${namesParam}`);
    
    // 发起请求
    return this.request<PubgResponse<Player[]>>(`players?${namesParam}`, shard);
  }

  /**
   * 根据账号 ID 获取玩家信息
   * @param accountIds 账号 ID 数组
   * @param shard 可选平台分片
   * @returns 玩家信息
   */
  async getPlayersByIds(
    accountIds: string[],
    shard: PlatformShard = this.defaultShard
  ): Promise<PubgResponse<Player[]>> {
    console.log(`🆔 查询玩家ID: ${accountIds.join(', ')}`);
    // 构建查询参数 - PUBG API 要求使用 filter[playerIds] 格式
    const idsParam = accountIds.map(id => {
      const encoded = encodeURIComponent(id);
      return `filter[playerIds]=${encoded}`;
    }).join('&');
    console.log(`🔍 完整查询参数: ${idsParam}`);
    return this.request<PubgResponse<Player[]>>(`players?${idsParam}`, shard);
  }

  /**
   * 获取单个玩家信息
   * @param accountId 账号 ID
   * @param shard 可选平台分片
   * @returns 玩家信息
   */
  async getPlayer(
    accountId: string,
    shard: PlatformShard = this.defaultShard
  ): Promise<PubgResponse<Player>> {
    return this.request<PubgResponse<Player>>(`players/${accountId}`, shard);
  }

  /**
   * 获取赛季列表
   * @param shard 可选平台分片
   * @returns 赛季列表
   */
  async getSeasons(
    shard: PlatformShard = this.defaultShard
  ): Promise<PubgResponse<Season[]>> {
    return this.request<PubgResponse<Season[]>>('seasons', shard);
  }

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
    shard: PlatformShard = this.defaultShard
  ): Promise<PubgResponse<SeasonStats>> {
    console.log(`🔍 获取玩家赛季数据: 账号ID=${accountId}, 赛季ID=${seasonId}`);
    // 确保赛季ID格式正确
    if (!seasonId.startsWith('division.bro.official.') && seasonId !== 'lifetime') {
      console.log(`⚠️ 赛季ID可能格式不正确: ${seasonId}, 期望格式为 "division.bro.official.XXXX"`);
    }
    
    const endpoint = `players/${accountId}/seasons/${seasonId}`;
    console.log(`🌐 请求端点: ${endpoint}`);
    
    return this.request<PubgResponse<SeasonStats>>(endpoint, shard);
  }

  /**
   * 获取玩家的终身统计数据
   * @param accountId 账号 ID
   * @param shard 可选平台分片
   * @returns 终身统计数据
   */
  async getPlayerLifetimeStats(
    accountId: string,
    shard: PlatformShard = this.defaultShard
  ): Promise<PubgResponse<LifetimeStats>> {
    console.log(`🔍 获取玩家终身统计数据: 账号ID=${accountId}`);
    return this.request<PubgResponse<LifetimeStats>>(
      `players/${accountId}/seasons/lifetime`,
      shard
    );
  }

  /**
   * 获取比赛详情
   * @param matchId 比赛 ID
   * @param shard 可选平台分片
   * @returns 比赛详情
   */
  async getMatch(
    matchId: string,
    shard: PlatformShard = this.defaultShard
  ): Promise<MatchDetail> {
    return this.request<MatchDetail>(`matches/${matchId}`, shard);
  }

  /**
   * 获取排行榜
   * @param gameMode 游戏模式
   * @param shard 可选平台分片
   * @returns 排行榜数据
   */
  async getLeaderboard(
    gameMode: string,
    shard: PlatformShard = this.defaultShard
  ): Promise<PubgResponse<Leaderboard>> {
    return this.request<PubgResponse<Leaderboard>>(`leaderboards/${gameMode}`, shard);
  }

  /**
   * 获取样本数据
   * @param shard 可选平台分片
   * @returns 样本数据
   */
  async getSamples(
    shard: PlatformShard = this.defaultShard
  ): Promise<PubgResponse<Sample>> {
    return this.request<PubgResponse<Sample>>('samples', shard);
  }

  /**
   * 获取玩家的武器精通数据
   * @param accountId 账号 ID
   * @param shard 可选平台分片
   * @returns 武器精通数据
   */
  async getWeaponMastery(
    accountId: string,
    shard: PlatformShard = this.defaultShard
  ): Promise<WeaponMastery> {
    return this.request<WeaponMastery>(`players/${accountId}/weapon_mastery`, shard);
  }

  /**
   * 获取玩家的生存精通数据
   * @param accountId 账号 ID
   * @param shard 可选平台分片
   * @returns 生存精通数据
   */
  async getSurvivalMastery(
    accountId: string,
    shard: PlatformShard = this.defaultShard
  ): Promise<SurvivalMastery> {
    return this.request<SurvivalMastery>(`players/${accountId}/survival_mastery`, shard);
  }

  /**
   * 通过公会ID获取公会信息
   * @param clanId 公会 ID
   * @param shard 可选平台分片
   * @returns 公会信息
   */
  async getClan(
    clanId: string,
    shard: PlatformShard = this.defaultShard
  ): Promise<Clan> {
    return this.request<Clan>(`clans/${clanId}`, shard);
  }
}