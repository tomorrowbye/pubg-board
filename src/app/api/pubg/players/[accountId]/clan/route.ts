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
 * GET 处理器 - 获取玩家的战队信息
 * 
 * 路径参数:
 * - accountId: 玩家账号ID
 * 
 * 查询参数:
 * - shard: (可选) 平台分片
 * 
 * @param request Next.js 请求对象
 * @param params 路由参数，包含 accountId
 * @returns 玩家的战队信息或错误响应
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
    logApiRequest(`/api/pubg/players/${accountId}/clan`, { 
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

    // 先获取玩家信息
    console.log(`🔍 获取玩家信息: ${accountId}`);
    const player = await pubgApiService.getPlayer(accountId, shard);
    
    if (!player) {
      console.log(`❌ 未找到玩家: ${accountId}`);
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }
    
    // 查找玩家的战队关联信息
    // 注意：PUBG API 并不直接提供从玩家到战队的映射
    // 这里需要间接获取或通过其他方式实现
    
    // 模拟实现：获取玩家战队信息（实际应用中可能需要不同的实现方式）
    try {
      console.log(`🔍 查找玩家 ${player.attributes.name} 的战队信息`);
      
      // 这里需要实现一个查找玩家战队的逻辑
      // 由于 PUBG API 没有直接提供这个功能，可能需要通过其他方式实现
      // 例如：维护一个玩家-战队映射数据库，或使用第三方服务
      
      // 模拟返回数据
      // 实际实现中，您需要替换此处逻辑
      const clanData = {
        found: false,
        message: "PUBG API does not directly provide clan information for players. Custom implementation needed."
      };
      
      return NextResponse.json({
        player: {
          id: player.id,
          name: player.attributes.name
        },
        clan: clanData
      });
    } catch (clanError) {
      console.error(`❌ 获取玩家战队信息失败:`, clanError);
      return NextResponse.json({
        player: {
          id: player.id,
          name: player.attributes.name
        },
        clan: {
          found: false,
          error: "Failed to retrieve clan information"
        }
      });
    }
  } catch (error) {
    console.error('❌ Error in player clan API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player clan information' },
      { status: 500 }
    );
  }
}