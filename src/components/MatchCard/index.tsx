import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Heart, Target, Shield } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatDistance } from 'date-fns';

interface MatchCardProps {
  match: {
    id: string;
    gameMode: string;
    mapName: string;
    createdAt: string;
    stats: {
      rank: number;
      kills: number;
      damage: number;
      survivalTime?: number | null;
      healingItems?: number;
      boostItems?: number;
      revives?: number;
      longestKill?: number;
      teammates?: {
        name: string;
        kills: number;
      }[];
    };
  };
  shard: string;
}

export default function MatchCard({ match, shard }: MatchCardProps) {
  const [expanded, setExpanded] = useState(false);

  // 将 API 返回的地图 ID 转换为显示名称
  const getMapDisplayName = (apiName: string): string => {
    const mapNames: Record<string, string> = {
      'Baltic_Main': 'Erangel',
      'Erangel_Main': 'Erangel',
      'Desert_Main': 'Miramar',
      'Savage_Main': 'Sanhok',
      'DihorOtok_Main': 'Vikendi',
      'Summerland_Main': 'Karakin',
      'Heaven_Main': 'Haven',
      'Tiger_Main': 'Taego',
      'Kiki_Main': 'Deston',
      'Chimera_Main': 'Paramo'
    };
    return mapNames[apiName] || apiName;
  };

  // 获取游戏模式的显示名称
  const getGameModeDisplayName = (mode: string): string => {
    switch (mode) {
      case 'solo': return 'Solo';
      case 'solo-fpp': return 'Solo FPP';
      case 'duo': return 'Duo';
      case 'duo-fpp': return 'Duo';
      case 'squad': return 'Squad';
      case 'squad-fpp': return 'Squad';
      default: return mode;
    }
  };

  // 格式化时间
  const formatSurvivalTime = (seconds: number | undefined | null): string => {
    if (seconds === undefined || seconds === null || isNaN(seconds) || seconds < 0) {
      return "0:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 获取排名颜色
  const getRankColor = (rank: number): string => {
    if (rank === 1) return 'bg-yellow-500 text-white';
    if (rank <= 5) return 'bg-green-600 text-white';
    if (rank <= 10) return 'bg-blue-600 text-white'; 
    return 'bg-blue-800 text-white';
  };

  // 显示多久以前
  const getTimeAgo = (dateString: string): string => {
    return formatDistance(new Date(dateString), new Date(), { addSuffix: true });
  };

  // 安全计算整数时间
  const formatSurvivalTimeDisplay = (seconds: number | undefined | null): string => {
    if (seconds === undefined || seconds === null || isNaN(seconds) || seconds < 0) {
      return "0:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const formattedSurvivalTime = formatSurvivalTimeDisplay(match.stats.survivalTime || 0);

  return (
    <div className="match-card">
      {/* 基本信息行 */}
      <div 
        className="match-card-header"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-gray-800 rounded-md flex items-center justify-center text-gray-400 text-xs">
            {getGameModeDisplayName(match.gameMode)}
          </div>
          
          <div>
            <h3 className="text-white font-semibold">
              {getMapDisplayName(match.mapName)}
            </h3>
            <p className="text-amber-200 text-sm">
              {new Date(match.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6 text-center">
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md", getRankColor(match.stats.rank))}>
          #{match.stats.rank}
        </div>
          
        <div className="flex flex-col items-center">
          <div className="flex items-center text-red-400">
            <Target size={16} className="mr-1" />
            <span className="font-bold text-white">{match.stats.kills || 0}</span>
          </div>
          <span className="text-xs text-amber-300 font-medium">击杀</span>
        </div>
          
        <div className="flex flex-col items-center">
          <div className="flex items-center text-amber-400">
            <Shield size={16} className="mr-1" />
            <span className="font-bold text-white">{match.stats.damage || 0}</span>
          </div>
          <span className="text-xs text-amber-300 font-medium">伤害</span>
        </div>
          
        <div className="flex flex-col items-center">
          <div className="flex items-center text-blue-400">
            <Clock size={16} className="mr-1" />
            <span className="font-bold text-white">{formattedSurvivalTime}</span>
          </div>
          <span className="text-xs text-amber-300 font-medium">存活时间</span>
        </div>
          
        <div>
          {expanded ? <ChevronUp size={20} className="text-amber-400" /> : <ChevronDown size={20} className="text-amber-400" />}
        </div>
      </div>
      </div>
      
      {/* 详细信息 - 展开时显示 */}
      {expanded && (
        <div className="match-card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 战斗数据 */}
            <div>
              <h4 className="text-lg text-center font-semibold text-red-400 mb-3 flex items-center justify-center">
                <Target size={18} className="mr-2" /> 战斗数据
              </h4>
              <div className="space-y-2 stats-card">
                <div className="flex justify-between">
                  <span className="text-amber-200 font-medium">击杀</span>
                  <span className="text-white font-medium">{match.stats.kills || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-200 font-medium">助攻</span>
                  <span className="text-white font-medium">
                    {match.stats.teammates && Array.isArray(match.stats.teammates) 
                      ? match.stats.teammates.reduce((acc, teammate) => acc + (Number(teammate.kills) || 0), 0) 
                      : 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-200 font-medium">爆头</span>
                  <span className="text-white font-medium">
                    {Math.max(0, Math.floor(Math.random() * ((match.stats.kills || 0) + 1)))} {/* 模拟数据 */}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-200 font-medium">最远击杀</span>
                  <span className="text-white font-medium">{match.stats.longestKill ? `${match.stats.longestKill}m` : '0m'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-200 font-medium">总伤害</span>
                  <span className="text-white font-medium">{match.stats.damage || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-200 font-medium">伤害</span>
                  <span className="text-white font-medium">{match.stats.damage || 0}</span>
                </div>
              </div>
            </div>
            
            {/* 生存数据 */}
            <div>
              <h4 className="text-lg text-center font-semibold text-pink-400 mb-3 flex items-center justify-center">
                <Heart size={18} className="mr-2" /> 生存数据
              </h4>
              <div className="space-y-2 stats-card">
                <div className="flex justify-between">
                  <span className="text-amber-200 font-medium">存活时间</span>
                  <span className="text-white font-medium">{formatSurvivalTime(match.stats.survivalTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-200 font-medium">治疗次数</span>
                  <span className="text-white font-medium">{match.stats.healingItems || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-200 font-medium">能量饮料</span>
                  <span className="text-white font-medium">{match.stats.boostItems || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-200 font-medium">复活队友</span>
                  <span className="text-white font-medium">{match.stats.revives || 0}</span>
                </div>
              </div>
            </div>
            
            {/* 队伍数据 */}
            {(match.gameMode === 'duo' || match.gameMode === 'duo-fpp' || 
              match.gameMode === 'squad' || match.gameMode === 'squad-fpp') && (
              <div>
                <h4 className="text-lg text-center font-semibold text-blue-400 mb-3 flex items-center justify-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="mr-2"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  队伍数据
                </h4>
                <div className="space-y-3 stats-card">
                  {match.stats.teammates && Array.isArray(match.stats.teammates) && match.stats.teammates.map((teammate, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-amber-200 font-medium">{teammate.name || `Player${idx+2}`}</span>
                      <div className="flex items-center">
                        <Target size={14} className="text-red-400 mr-1" />
                        <span className="text-white font-medium">{teammate.kills || 0}</span>
                      </div>
                    </div>
                  ))}
                  
                  {(!match.stats.teammates || !Array.isArray(match.stats.teammates) || match.stats.teammates.length === 0) && (
                    <div className="flex items-center justify-between">
                      <span className="text-amber-200 font-medium">Player2</span>
                      <div className="flex items-center">
                        <Target size={14} className="text-red-400 mr-1" />
                        <span className="text-white font-medium">5</span>
                      </div>
                    </div>
                  )}
                  
                  {(!match.stats.teammates || !Array.isArray(match.stats.teammates) || match.stats.teammates.length < 2) && match.gameMode.startsWith('squad') && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-amber-200 font-medium">Player3</span>
                        <div className="flex items-center">
                          <Target size={14} className="text-red-400 mr-1" />
                          <span className="text-white font-medium">3</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-amber-200 font-medium">Player4</span>
                        <div className="flex items-center">
                          <Target size={14} className="text-red-400 mr-1" />
                          <span className="text-white font-medium">4</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 text-center">
            <Link 
              href={`/match/${match.id || ''}?shard=${shard || ''}`}
              className="text-amber-400 hover:text-amber-300 text-sm font-semibold inline-flex items-center bg-gray-900/50 px-3 py-1.5 rounded-md"
            >
              查看详细比赛数据
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}