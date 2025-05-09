import { NextRequest, NextResponse } from 'next/server';
import { PubgApiClient } from '@/lib/api/pubg-api-client';
import { getPubgApiConfig } from '@/lib/api/pubg-api-config';
import { PlatformShard } from '@/types/pubg-api';

/**
 * GET 处理器 - 测试 PUBG API 连接
 * 
 * 查询参数:
 * - playerName: 玩家名称
 * - shard: (可选) 平台分片
 * 
 * @param request Next.js 请求对象
 * @returns API测试结果
 */
export async function GET(request: NextRequest) {
  try {
    // 从 URL 查询参数中获取玩家名称和平台分片
    const url = new URL(request.url);
    const playerName = url.searchParams.get('playerName') || 'shroud';
    const shard = (url.searchParams.get('shard') as PlatformShard) || PlatformShard.STEAM;

    // 记录 API 请求
    console.log(`📡 测试 API 请求`);
    console.log(`📝 测试参数:`, { playerName, shard });

    // 获取 API 配置
    const config = getPubgApiConfig();
    console.log(`🔑 使用 API 密钥: ${config.apiKey.substring(0, 10)}...`);

    // 创建 API 客户端
    const client = new PubgApiClient({
      apiKey: config.apiKey,
      shard: shard
    });

    // 构建参数
    const filterParam = `filter[playerNames]=${encodeURIComponent(playerName)}`;
    console.log(`🔍 构建查询参数: ${filterParam}`);

    // 构建 URL
    const apiUrl = `${process.env.PUBG_API_BASE_URL || 'https://api.pubg.com'}/shards/${shard}/players?${filterParam}`;
    console.log(`🌐 完整 API URL: ${apiUrl}`);

    // 构建请求头
    const headers = {
      'Authorization': `Bearer ${config.apiKey}`,
      'Accept': 'application/vnd.api+json'
    };
    console.log(`📋 请求头:`, headers);

    // 直接调用 PUBG API
    const startTime = Date.now();
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: headers
    });
    const elapsed = Date.now() - startTime;

    // 获取响应详情
    const responseStatus = response.status;
    const responseHeaders = Object.fromEntries(response.headers.entries());
    const responseText = await response.text();

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { error: "无法解析 JSON 响应" };
    }

    // 返回测试结果
    return NextResponse.json({
      success: response.ok,
      statusCode: responseStatus,
      elapsed: `${elapsed}ms`,
      request: {
        url: apiUrl,
        headers: headers,
        playerName,
        shard
      },
      response: {
        headers: responseHeaders,
        data: responseData
      }
    });
  } catch (error: any) {
    console.error('❌ API 测试错误:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'API 测试失败',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}