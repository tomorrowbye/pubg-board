import { NextRequest, NextResponse } from 'next/server';
import { PubgApiClient } from '@/lib/api/pubg-api-client';
import { getPubgApiConfig } from '@/lib/api/pubg-api-config';
import { PlatformShard } from '@/types/pubg-api';

/**
 * GET 处理器 - 测试获取赛季信息
 * 
 * 查询参数:
 * - accountId: 玩家账号ID
 * - shard: (可选) 平台分片
 * 
 * @param request Next.js 请求对象
 * @returns API测试结果
 */
export async function GET(request: NextRequest) {
  try {
    // 从 URL 查询参数中获取必要信息
    const url = new URL(request.url);
    const accountId = url.searchParams.get('accountId');
    const shard = (url.searchParams.get('shard') as PlatformShard) || PlatformShard.STEAM;
    const seasonId = url.searchParams.get('seasonId') || 'current';

    // 记录 API 请求
    console.log(`📡 测试赛季 API 请求`);
    console.log(`📝 测试参数:`, { accountId, seasonId, shard });

    // 获取 API 配置
    const config = getPubgApiConfig();
    console.log(`🔑 使用 API 密钥: ${config.apiKey.substring(0, 10)}...`);

    // 创建 API 客户端
    const client = new PubgApiClient({
      apiKey: config.apiKey,
      shard: shard
    });

    // 测试结果对象
    const result: any = {
      success: false,
      seasonData: null,
      playerSeasonData: null,
      errors: [],
      requestInfo: {
        accountId,
        seasonId,
        shard
      }
    };

    // 测试 1: 获取所有赛季
    try {
      console.log(`🔍 测试 getSeasons API...`);
      const seasonsStartTime = Date.now();
      const seasons = await client.getSeasons();
      const seasonsElapsed = Date.now() - seasonsStartTime;
      
      result.seasons = {
        success: true,
        count: seasons.data.length,
        elapsed: `${seasonsElapsed}ms`,
        currentSeason: seasons.data.find(s => s.attributes.isCurrentSeason),
        firstSeason: seasons.data[0],
        lastSeason: seasons.data[seasons.data.length - 1]
      };
    } catch (error: any) {
      result.errors.push({
        api: 'getSeasons',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }

    // 只有当提供了 accountId 时才测试玩家赛季数据
    if (accountId) {
      // 测试 2: 获取当前赛季或指定赛季
      try {
        console.log(`🔍 测试 getPlayerSeasonStats API...`);
        
        // 如果是 'current'，先获取当前赛季ID
        let actualSeasonId = seasonId;
        if (seasonId === 'current' && result.seasons?.currentSeason) {
          actualSeasonId = result.seasons.currentSeason.id;
          console.log(`📊 使用当前赛季ID: ${actualSeasonId}`);
        }
        
        // 直接构建 URL 和头信息，绕过客户端
        const apiBaseUrl = process.env.PUBG_API_BASE_URL || 'https://api.pubg.com';
        const apiUrl = `${apiBaseUrl}/shards/${shard}/players/${accountId}/seasons/${actualSeasonId}`;
        console.log(`🌐 API URL: ${apiUrl}`);
        
        const headers = {
          'Authorization': `Bearer ${config.apiKey}`,
          'Accept': 'application/vnd.api+json'
        };
        
        // 发送请求
        const statsStartTime = Date.now();
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: headers
        });
        const statsElapsed = Date.now() - statsStartTime;
        
        // 处理响应
        const responseStatus = response.status;
        const responseText = await response.text();
        
        let statsData;
        try {
          statsData = JSON.parse(responseText);
          result.playerSeasonData = {
            success: response.ok,
            status: responseStatus,
            elapsed: `${statsElapsed}ms`,
            data: statsData
          };
        } catch (e) {
          result.playerSeasonData = {
            success: false,
            status: responseStatus,
            elapsed: `${statsElapsed}ms`,
            rawResponse: responseText,
            parseError: (e as Error).message
          };
        }
      } catch (error: any) {
        result.errors.push({
          api: 'getPlayerSeasonStats',
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      }
    }

    // 设置整体成功状态
    result.success = result.errors.length === 0;
    
    // 返回测试结果
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('❌ API 测试错误:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'API 测试失败',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}