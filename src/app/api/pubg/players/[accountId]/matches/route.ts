import { pubgApiService } from "@/lib/api/pubg-api-service";
import { PlatformShard } from "@/types/pubg-api";
import { NextRequest, NextResponse } from "next/server";

// 日志工具函数
function logApiRequest(endpoint: string, params: Record<string, any>) {
  console.log(`📡 API 路由请求: ${endpoint}`);
  console.log(`📝 请求参数:`, params);
}

/**
 * GET 处理器 - 获取玩家最近的比赛
 *
 * 路径参数:
 * - accountId: 玩家账号ID
 *
 * 查询参数:
 * - shard: (可选) 平台分片
 * - limit: (可选) 返回的比赛数量，默认20
 *
 * @param request Next.js 请求对象
 * @param params 路由参数，包含 accountId
 * @returns 玩家最近的比赛数据或错误响应
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> },
) {
  try {
    const { accountId } = await params;

    // 从 URL 查询参数中获取平台分片和限制数量
    const url = new URL(request.url);
    const shard = url.searchParams.get("shard") as PlatformShard | undefined;
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);

    // 记录 API 请求
    logApiRequest(`/api/pubg/players/${accountId}/matches`, {
      accountId,
      shard,
      limit,
    });

    // 检查参数有效性
    if (!accountId) {
      console.log("❌ 请求错误: 缺少账号ID参数");
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 },
      );
    }

    // 先获取玩家信息
    console.log(`🔍 获取玩家信息: ${accountId}`);
    const player = await pubgApiService.getPlayer(accountId, shard);

    if (!player) {
      console.log(`❌ 未找到玩家: ${accountId}`);
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    // 获取玩家最近的比赛
    console.log(`🔍 获取玩家最近 ${limit} 场比赛`);
    const matches = await pubgApiService.getPlayerRecentMatches(
      player,
      limit,
      shard,
    );

    if (!matches || matches.length === 0) {
      console.log(`❌ 未找到玩家 ${accountId} 的比赛数据`);
      return NextResponse.json(
        { error: "No matches found for this player" },
        { status: 404 },
      );
    }

    console.log(`✅ 成功获取玩家 ${accountId} 的 ${matches.length} 场比赛数据`);
    return NextResponse.json({
      matches,
      playerName: player.attributes.name,
      count: matches.length,
    });
  } catch (error) {
    console.error("❌ Error in player matches API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch player matches" },
      { status: 500 },
    );
  }
}
