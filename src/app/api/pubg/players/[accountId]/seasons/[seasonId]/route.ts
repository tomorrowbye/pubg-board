import { pubgApiService } from "@/lib/api/pubg-api-service";
import { supabaseService } from "@/lib/supabase/supabase-client";
import { PlatformShard } from "@/types/pubg-api";
import { NextRequest, NextResponse } from "next/server";

// 日志工具函数
function logApiRequest(endpoint: string, params: Record<string, any>) {
  console.log(`📡 API 路由请求: ${endpoint}`);
  console.log(`📝 请求参数:`, params);
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
  { params }: { params: Promise<{ accountId: string; seasonId: string }> },
) {
  try {
    const { accountId, seasonId } = await params;

    // 从 URL 查询参数中获取平台分片
    const url = new URL(request.url);
    const shard = url.searchParams.get("shard") as PlatformShard | undefined;

    // 记录 API 请求
    logApiRequest(`/api/pubg/players/${accountId}/seasons/${seasonId}`, {
      accountId,
      seasonId,
      shard,
    });

    // 检查参数有效性
    if (!accountId || !seasonId) {
      console.log("❌ 请求错误: 缺少账号ID或赛季ID参数");
      return NextResponse.json(
        { error: "Account ID and Season ID are required" },
        { status: 400 },
      );
    }

    // 特殊处理 "current" 作为 seasonId 的情况
    if (seasonId === "current") {
      console.log(`🔍 获取当前赛季数据, 玩家ID: ${accountId}`);
      const currentSeason = await pubgApiService.getCurrentSeason(shard);

      if (!currentSeason) {
        console.log("❌ 未找到当前赛季信息");
        return NextResponse.json(
          { error: "Failed to fetch current season information" },
          { status: 500 },
        );
      }

      console.log(`✅ 获取到当前赛季: ${currentSeason.id}`);

      // 从 Supabase 查找缓存的赛季数据
      console.log(
        `📊 从 Supabase 查找缓存的赛季数据: 玩家=${accountId}, 赛季=${currentSeason.id}`,
      );
      const cachedStats = await supabaseService.getPlayerSeasonStats(
        accountId,
        currentSeason.id,
        shard || "steam",
      );

      // 如果找到缓存数据，直接返回
      if (cachedStats) {
        console.log(`✅ 找到缓存的赛季数据`);
        return NextResponse.json({
          seasonStats: cachedStats.data,
          seasonInfo: currentSeason,
          fromCache: true,
        });
      }

      // 如果没有缓存数据，调用 API 获取
      console.log(`🌐 从 PUBG API 获取当前赛季数据: ${currentSeason.id}`);
      const seasonStats = await pubgApiService.getPlayerSeasonStats(
        accountId,
        currentSeason.id,
        shard,
      );

      if (!seasonStats) {
        console.log(`❌ 未找到玩家 ${accountId} 的当前赛季数据`);
        return NextResponse.json(
          { error: "Player season stats not found" },
          { status: 404 },
        );
      }

      // 保存数据到 Supabase
      console.log(
        `💾 保存赛季数据到 Supabase: 玩家=${accountId}, 赛季=${currentSeason.id}`,
      );
      await supabaseService.savePlayerSeasonStats({
        player_id: accountId,
        season_id: currentSeason.id,
        shard: shard || "steam",
        data: seasonStats,
        last_sync_at: new Date().toISOString(),
      });

      console.log(`✅ 成功获取玩家 ${accountId} 的当前赛季数据`);
      return NextResponse.json({
        seasonStats,
        seasonInfo: currentSeason,
        fromCache: false,
      });
    }

    // 正常处理指定的赛季ID
    console.log(`🔍 获取指定赛季 ${seasonId} 的数据, 玩家ID: ${accountId}`);

    // 从 Supabase 查找缓存的赛季数据
    console.log(
      `📊 从 Supabase 查找缓存的赛季数据: 玩家=${accountId}, 赛季=${seasonId}`,
    );
    const cachedStats = await supabaseService.getPlayerSeasonStats(
      accountId,
      seasonId,
      shard || "steam",
    );

    // 如果找到缓存数据，直接返回
    if (cachedStats) {
      console.log(`✅ 找到缓存的赛季数据`);
      return NextResponse.json({
        seasonStats: cachedStats.data,
        fromCache: true,
      });
    }

    // 如果没有缓存数据，调用 API 获取
    console.log(`🌐 从 PUBG API 获取赛季数据: ${seasonId}`);
    const seasonStats = await pubgApiService.getPlayerSeasonStats(
      accountId,
      seasonId,
      shard,
    );

    if (!seasonStats) {
      console.log(`❌ 未找到玩家 ${accountId} 在赛季 ${seasonId} 的数据`);
      return NextResponse.json(
        { error: "Player season stats not found" },
        { status: 404 },
      );
    }

    // 保存数据到 Supabase
    console.log(
      `💾 保存赛季数据到 Supabase: 玩家=${accountId}, 赛季=${seasonId}`,
    );
    await supabaseService.savePlayerSeasonStats({
      player_id: accountId,
      season_id: seasonId,
      shard: shard || "steam",
      data: seasonStats,
      last_sync_at: new Date().toISOString(),
    });

    console.log(`✅ 成功获取玩家 ${accountId} 在赛季 ${seasonId} 的数据`);
    return NextResponse.json({ seasonStats, fromCache: false });
  } catch (error) {
    console.error("❌ Error in player season stats API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch player season stats" },
      { status: 500 },
    );
  }
}
