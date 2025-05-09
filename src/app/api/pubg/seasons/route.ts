import { pubgApiService } from '@/lib/api/pubg-api-service';
import { PlatformShard } from '@/types/pubg-api';
import { NextRequest, NextResponse } from 'next/server';

// 日志工具函数
function logApiRequest(endpoint: string, params: Record<string, any>) {
  console.log(`📡 API 路由请求: ${endpoint}`);
  console.log(`📝 请求参数:`, params);
}

/**
 * GET 处理器 - 获取赛季列表
 * 
 * 查询参数:
 * - shard: (可选) 平台分片
 * - current: (可选) 设为 "true" 只返回当前赛季
 * 
 * @param request Next.js 请求对象
 * @returns 赛季列表或当前赛季或错误响应
 */
export async function GET(request: NextRequest) {
  try {
    // 从 URL 查询参数中获取平台分片和当前赛季标志
    const url = new URL(request.url);
    const shard = url.searchParams.get('shard') as PlatformShard | undefined;
    const currentOnly = url.searchParams.get('current') === 'true';
    
    // 记录 API 请求
    logApiRequest('/api/pubg/seasons', { shard, current: currentOnly });

    if (currentOnly) {
      // 只获取当前赛季
      console.log(`🔍 获取当前赛季, 平台: ${shard || '默认'}`);
      const currentSeason = await pubgApiService.getCurrentSeason(shard);
      
      if (!currentSeason) {
        console.log(`❌ 未找到当前赛季`);
        return NextResponse.json(
          { error: 'Current season not found' },
          { status: 404 }
        );
      }
      
      console.log(`✅ 成功获取当前赛季: ${currentSeason.id}`);
      return NextResponse.json({ currentSeason });
    } else {
      // 获取所有赛季
      console.log(`🔍 获取所有赛季列表, 平台: ${shard || '默认'}`);
      const seasons = await pubgApiService.getSeasons(shard);
      
      if (!seasons || seasons.length === 0) {
        console.log(`❌ 未找到任何赛季数据`);
        return NextResponse.json(
          { error: 'No seasons found' },
          { status: 404 }
        );
      }
      
      // 找到标记为当前赛季的
      let currentSeason = seasons.find(season => season.attributes.isCurrentSeason);
      
      // 如果没有明确标记的当前赛季，使用最新的赛季(已经按ID从新到旧排序)
      if (!currentSeason && seasons.length > 0) {
        currentSeason = seasons[0];
        console.log(`📊 未找到明确标记的当前赛季，使用最新赛季: ${currentSeason.id}`);
      }
      
      console.log(`✅ 成功获取 ${seasons.length} 个赛季`);
      if (currentSeason) {
        console.log(`📊 当前/最新赛季: ${currentSeason.id}`);
      }
      
      return NextResponse.json({ 
        seasons,
        currentSeason: currentSeason
      });
    }
  } catch (error) {
    console.error('❌ Error in seasons API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch seasons' },
      { status: 500 }
    );
  }
}