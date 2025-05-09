import { pubgApiService } from "@/lib/api/pubg-api-service";
import { PlatformShard } from "@/types/pubg-api";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET 处理器 - 获取比赛详情
 *
 * 路径参数:
 * - matchId: 比赛ID
 *
 * 查询参数:
 * - shard: (可选) 平台分片
 *
 * @param request Next.js 请求对象
 * @param params 路由参数，包含 matchId
 * @returns 比赛详情或错误响应
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> },
) {
  try {
    const { matchId } = await params;

    // 从 URL 查询参数中获取平台分片
    const url = new URL(request.url);
    const shard = url.searchParams.get("shard") as PlatformShard | undefined;

    // 检查参数有效性
    if (!matchId) {
      return NextResponse.json(
        { error: "Match ID is required" },
        { status: 400 },
      );
    }

    // 获取比赛详情
    const matchDetail = await pubgApiService.getMatch(matchId, shard);

    if (!matchDetail) {
      return NextResponse.json(
        { error: "Match details not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ match: matchDetail });
  } catch (error) {
    console.error("Error in match details API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch match details" },
      { status: 500 },
    );
  }
}
