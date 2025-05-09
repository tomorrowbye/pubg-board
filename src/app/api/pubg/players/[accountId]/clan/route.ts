import { pubgApiService } from "@/lib/api/pubg-api-service";
import { PlatformShard } from "@/types/pubg-api";
import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/supabase-client";

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
 * GET 处理器 - 获取玩家战队信息
 *
 * 路径参数:
 * - accountId: 玩家账号ID
 *
 * 查询参数:
 * - shard: (可选) 平台分片
 *
 * @param request Next.js 请求对象
 * @param params 路由参数，包含 accountId
 * @returns 玩家战队信息或错误响应
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> },
) {
  try {
    const { accountId } = await params;

    // 从 URL 查询参数中获取平台分片
    const url = new URL(request.url);
    const shard = url.searchParams.get("shard") as PlatformShard | undefined;

    // 记录 API 请求
    logApiRequest(`/api/pubg/players/${accountId}/clan`, {
      accountId,
      shard,
    });

    // 检查参数有效性
    if (!accountId) {
      console.log("❌ 请求错误: 缺少账号ID参数");
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 },
      );
    }

    // PUBG API 目前不支持获取战队信息
    console.log(`ℹ️ PUBG API 不支持直接获取玩家 ${accountId} 的战队信息`);

    // 尝试从缓存获取可能存在的自定义战队信息
    try {
      const playerData = await supabaseService.getPlayerById(accountId);
      if (playerData?.data?.relationships?.clan) {
        const cachedClanInfo = playerData.data.relationships.clan;

        // 仅当缓存中明确标记为找到战队时才返回
        if (cachedClanInfo.found === true) {
          console.log(
            `✅ 从缓存获取战队信息: ${cachedClanInfo.name || cachedClanInfo.id}`,
          );

          return NextResponse.json({
            clan: {
              id: cachedClanInfo.id || "",
              name: cachedClanInfo.name || "",
              tag: cachedClanInfo.tag || "",
              found: true,
            },
            fromCache: true,
          });
        }
      }
    } catch (cacheError) {
      console.log("⚠️ 缓存获取战队信息失败:", cacheError);
    }

    // 没有找到战队信息，返回 found: false
    return NextResponse.json({
      clan: { found: false },
    });
  } catch (error) {
    console.error("❌ Error in player clan API route:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch player clan info",
        message: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
