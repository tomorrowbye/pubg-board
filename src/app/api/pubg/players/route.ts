import { pubgApiService } from '@/lib/api/pubg-api-service';
import { supabaseService } from '@/lib/supabase/supabase-client';
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
    
    // 首先从 Supabase 查找玩家数据
    console.log(`📊 从 Supabase 查找玩家记录: ${playerName}`);
    const cachedPlayer = await supabaseService.getPlayerByName(playerName, shard || 'steam');
    
    // 如果找到缓存数据，直接返回
    if (cachedPlayer) {
      console.log(`✅ 找到缓存的玩家数据: ${cachedPlayer.name}, ID: ${cachedPlayer.id}`);
      const player = cachedPlayer.data;
      return NextResponse.json({ player, fromCache: true });
    }
    
    // 如果没有缓存数据，调用 API 服务搜索玩家
    console.log(`🌐 从 PUBG API 获取玩家数据: ${playerName}`);
    const player = await pubgApiService.searchPlayer(playerName, shard);

    if (!player) {
      console.log(`❌ 未找到玩家: ${playerName}`);
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    console.log(`✅ 成功找到玩家: ${player.attributes.name}, ID: ${player.id}`);
    
    // 存储玩家数据到 Supabase
    console.log(`💾 保存玩家数据到 Supabase: ${player.attributes.name}`);
    await supabaseService.savePlayer({
      id: player.id,
      name: player.attributes.name,
      shard: shard || 'steam',
      data: player,
      last_sync_at: new Date().toISOString()
    });
    
    // 返回玩家信息
    return NextResponse.json({ player, fromCache: false });
  } catch (error) {
    console.error('❌ Error in players API route:', error);
    return NextResponse.json(
      { error: 'Failed to search player' },
      { status: 500 }
    );
  }
}