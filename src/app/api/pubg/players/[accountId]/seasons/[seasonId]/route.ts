import { pubgApiService } from '@/lib/api/pubg-api-service';
import { PlatformShard } from '@/types/pubg-api';
import { NextRequest, NextResponse } from 'next/server';

// 日志工具函数
function logApiRequest(endpoint: string, params: Record<string, any>) {
  console.log(`📡 API 路由请求: ${endpoint}`);
  console.log(`📝 请求参数:`, params);
}

interface RouteParams {
  params: {
    accountId: string;
    seasonId: string;
  };
}

/**
 * GET 处理器 - 获取玩家指定赛季的数据
 * 
 * 路径参数:
 * - accountId: 玩家账号ID
 * - seasonId: 赛季ID
 * 
 * 查询参数:
 * - shard: (可选) 平台分片
 * 
 * @param request Next.js 请求对象
 * @param params 路由参数，包含 accountId 和 seasonId
 * @returns 玩家赛季数据或错误响应
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { accountId, seasonId } = params;
    
    // 从 URL 查询参数中获取平台分片
    const url = new URL(request.url);
    const shard = url.searchParams.get('shard') as PlatformShard | undefined;

    // 记录 API 请求
    logApiRequest(`/api/pubg/players/${accountId}/seasons/${seasonId}`, { 
      accountId, 
      seasonId, 
      shard 
    });

    // 检查参数有效性
    if (!accountId || !seasonId) {
      console.log('❌ 请求错误: 缺少账号ID或赛季ID参数');
      return NextResponse.json(
        { error: 'Account ID and Season ID are required' },
        { status: 400 }
      );
    }

    // 特殊处理 "current" 作为 seasonId 的情况
    if (seasonId === 'current') {
      console.log(`🔍 获取当前赛季数据, 玩家ID: ${accountId}`);
      const currentSeason = await pubgApiService.getCurrentSeason(shard);
      
      if (!currentSeason) {
        console.log('❌ 未找到当前赛季信息');
        return NextResponse.json(
          { error: 'Failed to fetch current season information' },
          { status: 500 }
        );
      }
      
      console.log(`✅ 获取到当前赛季: ${currentSeason.id}`);
      const seasonStats = await pubgApiService.getPlayerSeasonStats(accountId, currentSeason.id, shard);
      
      if (!seasonStats) {
        console.log(`❌ 未找到玩家 ${accountId} 的当前赛季数据`);
        return NextResponse.json(
          { error: 'Player season stats not found' },
          { status: 404 }
        );
      }
      
      console.log(`✅ 成功获取玩家 ${accountId} 的当前赛季数据`);
      return NextResponse.json({ 
        seasonStats,
        seasonInfo: currentSeason
      });
    } 
    
    // 正常处理指定的赛季ID
    console.log(`🔍 获取指定赛季 ${seasonId} 的数据, 玩家ID: ${accountId}`);
    const seasonStats = await pubgApiService.getPlayerSeasonStats(accountId, seasonId, shard);
    
    if (!seasonStats) {
      console.log(`❌ 未找到玩家 ${accountId} 在赛季 ${seasonId} 的数据`);
      return NextResponse.json(
        { error: 'Player season stats not found' },
        { status: 404 }
      );
    }
    
    console.log(`✅ 成功获取玩家 ${accountId} 在赛季 ${seasonId} 的数据`);
    return NextResponse.json({ seasonStats });
  } catch (error) {
    console.error('❌ Error in player season stats API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player season stats' },
      { status: 500 }
    );
  }
}