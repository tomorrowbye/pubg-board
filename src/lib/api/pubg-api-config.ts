import { PlatformShard } from '@/types/pubg-api';

/**
 * 获取 PUBG API 配置信息
 * @returns 包含 API Key 和默认分片的配置对象
 */
export function getPubgApiConfig() {
  // 从环境变量获取 API Key
  const apiKey = process.env.PUBG_OPEN_API_KEY;
  
  if (!apiKey) {
    throw new Error('PUBG API Key is not configured. Please add PUBG_OPEN_API_KEY to your .env.local file.');
  }

  // 获取默认分片
  const defaultShard = (process.env.NEXT_PUBLIC_DEFAULT_SHARD || 'steam') as PlatformShard;

  return {
    apiKey,
    shard: defaultShard,
  };
}

/**
 * 获取可用平台分片列表
 * @returns 分片选项列表
 */
export function getAvailableShards() {
  return [
    { value: PlatformShard.STEAM, label: 'Steam' },
    { value: PlatformShard.KAKAO, label: 'Kakao' },
    { value: PlatformShard.XBOX, label: 'Xbox' },
    { value: PlatformShard.PSN, label: 'PlayStation' },
    { value: PlatformShard.STADIA, label: 'Stadia' },
    { value: PlatformShard.CONSOLE, label: 'Console' },
  ];
}

/**
 * 获取游戏模式选项
 * @returns 游戏模式选项列表
 */
export function getGameModes() {
  return [
    { value: 'solo', label: 'Solo TPP' },
    { value: 'solo-fpp', label: 'Solo FPP' },
    { value: 'duo', label: 'Duo TPP' },
    { value: 'duo-fpp', label: 'Duo FPP' },
    { value: 'squad', label: 'Squad TPP' },
    { value: 'squad-fpp', label: 'Squad FPP' },
  ];
}