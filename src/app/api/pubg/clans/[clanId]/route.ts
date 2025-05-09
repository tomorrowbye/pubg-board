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
    clanId: string;
  };
}

/**
 * GET 处理器 - 获取战队信息
 * 
 * 路径参数:
 * - clanId: 战队ID
 * 
 * 查询参数:
 * - shard: (可选) 平台分片
 * 
 * @param request Next.js 请求对象
 * @param params 路由参数，包含 clanId
 * @returns 战队信息或错误响应
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { clanId } = params;
    
    // 从 URL 查询参数中获取平台分片
    const url = new URL(request.url);
    const shard = url.searchParams.get('shard') as PlatformShard | undefined;

    // 记录 API 请求
    logApiRequest(`/api/pubg/clans/${clanId}`, { 
      clanId, 
      shard 
    });

    // 检查参数有效性
    if (!clanId) {
      console.log('❌ 请求错误: 缺少战队ID参数');
      return NextResponse.json(
        { error: 'Clan ID is required' },
        { status: 400 }
      );
    }

    // 获取战队信息
    console.log(`🔍 获取战队信息: ${clanId}`);
    const clan = await pubgApiService.getClan(clanId, shard);
    
    if (!clan) {
      console.log(`❌ 未找到战队: ${clanId}`);
      return NextResponse.json(
        { error: 'Clan not found' },
        { status: 404 }
      );
    }
    
    // 处理成员信息
    const memberIds = clan.data.relationships?.members?.data.map(member => member.id) || [];
    console.log(`📊 战队成员数量: ${memberIds.length}`);
    
    // 获取成员详细信息
    let members = [];
    if (memberIds.length > 0) {
      // 分批获取成员信息，避免请求过大
      const batchSize = 10;
      for (let i = 0; i < memberIds.length; i += batchSize) {
        const batchIds = memberIds.slice(i, i + batchSize);
        console.log(`🔄 获取第 ${i+1}-${Math.min(i+batchSize, memberIds.length)} 个成员信息`);
        
        try {
          const batchPlayers = await pubgApiService.getPlayersByIds(batchIds, shard);
          if (batchPlayers && batchPlayers.length > 0) {
            members.push(...batchPlayers);
          }
        } catch (err) {
          console.error(`❌ 获取部分成员信息失败:`, err);
        }
      }
    }
    
    console.log(`✅ 成功获取战队 ${clanId} 的信息`);
    return NextResponse.json({ 
      clan,
      members
    });
  } catch (error) {
    console.error('❌ Error in clan API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clan information' },
      { status: 500 }
    );
  }
}