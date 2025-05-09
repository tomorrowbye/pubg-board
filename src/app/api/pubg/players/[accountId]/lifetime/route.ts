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
  };
}

/**
 * GET 处理器 - 获取玩家终身统计数据
 * 
 * 路径参数:
 * - accountId: 玩家账号ID
 * 
 * 查询参数:
 * - shard: (可选) 平台分片
 * 
 * @param request Next.js 请求对象
 * @param params 路由参数，包含 accountId
 * @returns 玩家终身统计数据或错误响应
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { accountId } = params;
    
    // 从 URL 查询参数中获取平台分片
    const url = new URL(request.url);
    const shard = url.searchParams.get('shard') as PlatformShard | undefined;

    // 记录 API 请求
    logApiRequest(`/api/pubg/players/${accountId}/lifetime`, { accountId, shard });

    // 检查参数有效性
    if (!accountId) {
      console.log('❌ 请求错误: 缺少账号ID参数');
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // 获取玩家终身统计数据
    console.log(`🔍 获取玩家 ${accountId} 的终身统计数据`);
    const lifetimeStats = await pubgApiService.getPlayerLifetimeStats(accountId, shard);
    
    if (!lifetimeStats) {
      console.log(`❌ 未找到玩家 ${accountId} 的终身统计数据`);
      return NextResponse.json(
        { error: 'Player lifetime stats not found' },
        { status: 404 }
      );
    }
    
    console.log(`✅ 成功获取玩家 ${accountId} 的终身统计数据`);
    return NextResponse.json({ lifetimeStats });
  } catch (error) {
    console.error('❌ Error in player lifetime stats API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player lifetime stats' },
      { status: 500 }
    );
  }
}