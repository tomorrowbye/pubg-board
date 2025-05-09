/**
 * 环境变量工具函数
 * 封装获取环境变量的方法，提供类型安全和默认值
 */

/**
 * 获取必需的环境变量
 * 如果变量不存在，将抛出错误
 * 
 * @param key 环境变量名称
 * @param defaultValue 可选的默认值
 * @returns 环境变量值
 */
export function getEnvVariable(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  
  return value;
}

/**
 * 获取可选的环境变量
 * 如果变量不存在，返回 undefined 或默认值
 * 
 * @param key 环境变量名称
 * @param defaultValue 可选的默认值
 * @returns 环境变量值或 undefined 或默认值
 */
export function getOptionalEnvVariable(key: string, defaultValue?: string): string | undefined {
  return process.env[key] || defaultValue;
}

/**
 * 获取布尔类型的环境变量
 * 将 "true", "1", "yes" 解析为 true
 * 将 "false", "0", "no" 解析为 false
 * 
 * @param key 环境变量名称
 * @param defaultValue 可选的默认值
 * @returns 环境变量的布尔值
 */
export function getBooleanEnvVariable(key: string, defaultValue = false): boolean {
  const value = process.env[key]?.toLowerCase();
  
  if (value === undefined || value === '') {
    return defaultValue;
  }
  
  return ['true', '1', 'yes'].includes(value);
}

/**
 * 获取数字类型的环境变量
 * 
 * @param key 环境变量名称
 * @param defaultValue 可选的默认值
 * @returns 环境变量的数字值或默认值
 */
export function getNumberEnvVariable(key: string, defaultValue?: number): number | undefined {
  const value = process.env[key];
  
  if (value === undefined || value === '') {
    return defaultValue;
  }
  
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

/**
 * 获取 PUBG API Key
 * @returns PUBG API Key
 */
export function getPubgApiKey(): string {
  return getEnvVariable('PUBG_OPEN_API_KEY');
}

/**
 * 获取 PUBG API 基础 URL
 * @returns PUBG API 基础 URL
 */
export function getPubgApiBaseUrl(): string {
  return getEnvVariable('PUBG_API_BASE_URL', 'https://api.pubg.com');
}

/**
 * 获取默认平台
 * @returns 默认平台
 */
export function getDefaultPlatform(): string {
  return getEnvVariable('NEXT_PUBLIC_DEFAULT_PLATFORM', 'steam');
}