import { pubgApiService } from '@/lib/api/pubg-api-service';
import { PlatformShard } from '@/types/pubg-api';
import { NextRequest, NextResponse } from 'next/server';

// 日志工具函数
function logApiRequest(endpoint: string, params: Record<string, any>) {
  console.log(`📡 API 路由请求: ${endpoint}`);
  console.log(`📝 请求参数:`, params);
}

/**
 * GET 处理器 - 根据玩家名称搜索玩家
 * 
 * 查询参数:
 * - playerName: 玩家名称
 * - shard: (可选) 平台分片
 * 
 * @param request Next.js 请求对象
 * @returns 玩家信息或错误响应
 */
export async function GET(request: NextRequest) {
  try {
    // 从 URL 查询参数中获取玩家名称和平台分片
    const url = new URL(request.url);
    const playerName = url.searchParams.get('playerName');
    const shard = url.searchParams.get('shard') as PlatformShard | undefined;

    // 记录 API 请求
    logApiRequest('/api/pubg/players', { playerName, shard });

    // 检查必须参数
    if (!playerName) {
      console.log('❌ 请求错误: 缺少玩家名称参数');
      return NextResponse.json(
        { error: 'Player name is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 搜索玩家: ${playerName}, 平台: ${shard || '默认'}`);
    
    // 调用 API 服务搜索玩家
    const player = await pubgApiService.searchPlayer(playerName, shard);

    if (!player) {
      console.log(`❌ 未找到玩家: ${playerName}`);
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    console.log(`✅ 成功找到玩家: ${player.attributes.name}, ID: ${player.id}`);
    
    // 返回玩家信息
    return NextResponse.json({ player });
  } catch (error) {
    console.error('❌ Error in players API route:', error);
    return NextResponse.json(
      { error: 'Failed to search player' },
      { status: 500 }
    );
  }
}