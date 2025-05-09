import { pubgApiService } from '@/lib/api/pubg-api-service';
import { supabaseService } from '@/lib/supabase/supabase-client';
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
  };
}

/**
 * POST 处理器 - 同步玩家数据
 * 
 * 路径参数:
 * - accountId: 玩家账号ID
 * 
 * 查询参数:
 * - shard: (可选) 平台分片
 * 
 * @param request Next.js 请求对象
 * @param params 路由参数，包含 accountId
 * @returns 同步结果或错误响应
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { accountId } = params;
    
    // 从 URL 查询参数中获取平台分片
    const url = new URL(request.url);
    const shard = url.searchParams.get('shard') as PlatformShard | undefined;

    // 记录 API 请求
    logApiRequest(`/api/pubg/players/${accountId}/sync`, { 
      accountId, 
      shard 
    });

    // 检查参数有效性
    if (!accountId) {
      console.log('❌ 请求错误: 缺少账号ID参数');
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // 检查是否可以同步（5分钟冷却时间）
    const canSync = await supabaseService.canSyncPlayer(accountId);
    if (!canSync) {
      console.log(`❌ 同步受限: 玩家 ${accountId} 在最近5分钟内已同步`);
      return NextResponse.json(
        { 
          error: 'Sync cooldown active', 
          message: 'Please wait at least 5 minutes between syncs',
          retryAfter: 300 // 5分钟 = 300秒
        },
        { status: 429 }
      );
    }

    // 获取玩家信息
    console.log(`🔄 同步玩家 ${accountId} 的数据`);
    const player = await pubgApiService.getPlayer(accountId, shard);
    
    if (!player) {
      console.log(`❌ 未找到玩家: ${accountId}`);
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    // 保存玩家数据
    await supabaseService.savePlayer({
      id: player.id,
      name: player.attributes.name,
      shard: shard || 'steam',
      data: player,
      last_sync_at: new Date().toISOString()
    });

    // 获取当前赛季
    const currentSeason = await pubgApiService.getCurrentSeason(shard);
    
    // 同步赛季数据
    let seasonStats = null;
    if (currentSeason) {
      console.log(`🔄 同步玩家 ${accountId} 的当前赛季 ${currentSeason.id} 数据`);
      seasonStats = await pubgApiService.getPlayerSeasonStats(accountId, currentSeason.id, shard);
      
      if (seasonStats) {
        await supabaseService.savePlayerSeasonStats({
          player_id: accountId,
          season_id: currentSeason.id,
          shard: shard || 'steam',
          data: seasonStats,
          last_sync_at: new Date().toISOString()
        });
      }
    }

    // 记录同步成功
    await supabaseService.addSyncHistory({
      player_id: accountId,
      sync_type: 'player',
      status: 'success',
      details: 'Full sync completed successfully'
    });

    console.log(`✅ 成功同步玩家 ${player.attributes.name} (${accountId}) 的数据`);
    
    return NextResponse.json({ 
      success: true,
      player: player,
      seasonStats: seasonStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error in player sync API route:', error);
    
    // 记录同步失败
    if (params.accountId) {
      await supabaseService.addSyncHistory({
        player_id: params.accountId,
        sync_type: 'player',
        status: 'failed',
        details: `Error: ${(error as Error).message}`
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to sync player data', message: (error as Error).message },
      { status: 500 }
    );
  }
}