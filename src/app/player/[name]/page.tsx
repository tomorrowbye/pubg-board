"use client";

import { useEffect, useState } from "react";
import { PlatformShard } from "@/types/pubg-api";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import MatchList from '@/components/MatchList/index';
import ClanBadge from '@/components/ClanBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import styles from '../seasons.module.css';

export default function PlayerPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const playerName = params.name as string;
  const shard =
    (searchParams.get("shard") as PlatformShard) || PlatformShard.STEAM;

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [playerData, setPlayerData] = useState<any>(null);
  const [seasonStats, setSeasonStats] = useState<any>(null);
  const [currentSeason, setCurrentSeason] = useState<any>(null);
  const [syncLoading, setSyncLoading] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncCooldown, setSyncCooldown] = useState<number>(0);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("current");
  const [clanInfo, setClanInfo] = useState<{id: string, name: string, tag: string, found?: boolean} | null>(null);
  const [activeGameMode, setActiveGameMode] = useState<string>("squad-fpp");

  async function fetchPlayerData() {
    try {
      setLoading(true);
      setError(null);
      setSyncError(null);

      // 获取玩家信息
      const playerResponse = await fetch(
        `/api/pubg/players?playerName=${encodeURIComponent(playerName)}&shard=${shard}`,
      );

      if (!playerResponse.ok) {
        throw new Error("Failed to fetch player data");
      }

      const playerResult = await playerResponse.json();
      setPlayerData(playerResult.player);
      
      // 如果数据来自缓存，设置最后同步时间
      if (playerResult.fromCache) {
        setLastSyncTime(playerResult.player?.last_sync_at || null);
      }
      
      // 获取玩家战队信息
      if (playerResult.player?.id) {
        try {
          const clanResponse = await fetch(
            `/api/pubg/players/${playerResult.player.id}/clan?shard=${shard}`
          );
          
          if (clanResponse.ok) {
            const clanResult = await clanResponse.json();
            console.log("Clan API response:", JSON.stringify(clanResult, null, 2));
            if (clanResult && clanResult.clan && clanResult.clan.found) {
              const clan = {
                id: clanResult.clan.id || '',
                name: clanResult.clan.name || '',
                tag: clanResult.clan.tag || '',
                found: true
              };
              console.log("Setting clan info:", clan);
              setClanInfo(clan);
            } else {
              // 如果没有战队信息，设置为null
              console.log("No clan found for player");
              setClanInfo(null);
            }
          }
        } catch (err) {
          console.error("Error fetching clan info:", err);
          setClanInfo(null);
        }
      }

      // 获取所有赛季信息
      const allSeasonsResponse = await fetch(
        `/api/pubg/seasons?shard=${shard}`,
      );
      if (allSeasonsResponse.ok) {
        const allSeasonsResult = await allSeasonsResponse.json();
        // 按ID排序，确保最新的赛季在前面
        const sortedSeasons = [...allSeasonsResult.seasons].sort((a, b) =>
          b.id.localeCompare(a.id),
        );
        setSeasons(sortedSeasons);

        // 设置当前赛季
        setCurrentSeason(allSeasonsResult.currentSeason || sortedSeasons[0]);

        // 获取玩家当前赛季数据
        if (playerResult.player?.id) {
          const seasonToUse =
            allSeasonsResult.currentSeason?.id ||
            sortedSeasons[0]?.id ||
            "current";
          const statsResponse = await fetch(
            `/api/pubg/players/${playerResult.player.id}/seasons/${seasonToUse}?shard=${shard}`,
          );

          if (statsResponse.ok) {
            const statsResult = await statsResponse.json();
            setSeasonStats(statsResult.seasonStats);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching player data");
    } finally {
      setLoading(false);
    }
  }

  // 同步玩家数据
  async function syncPlayerData() {
    if (!playerData?.id) return;

    try {
      setSyncLoading(true);
      setSyncError(null);

      const response = await fetch(
        `/api/pubg/players/${playerData.id}/sync?shard=${shard}`,
        { method: 'POST' }
      );

      const result = await response.json();

      if (!response.ok) {
        // 处理冷却时间
        if (response.status === 429 && result.retryAfter) {
          setSyncCooldown(result.retryAfter);
          throw new Error(result.message || "Please wait before syncing again");
        }
        throw new Error(result.error || "Failed to sync player data");
      }

      // 成功同步后重新加载数据
      await fetchPlayerData();
      setLastSyncTime(new Date(result.timestamp).toLocaleString());

    } catch (err: any) {
      setSyncError(err.message || "An error occurred while syncing player data");
    } finally {
      setSyncLoading(false);
    }
  }

  // 处理冷却时间倒计时
  useEffect(() => {
    if (syncCooldown <= 0) return;

    const timer = setInterval(() => {
      setSyncCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [syncCooldown]);

  useEffect(() => {
    if (playerName) {
      fetchPlayerData();
    }
  }, [playerName, shard]);

  // 当选择不同赛季时加载数据
  const loadSeasonStats = async (seasonId: string) => {
    if (!playerData?.id) return;

    try {
      setLoading(true);
      setSelectedSeasonId(seasonId);

      if (seasonId === "lifetime") {
        // 获取终身数据
        const lifetimeResponse = await fetch(
          `/api/pubg/players/${playerData.id}/lifetime?shard=${shard}`,
        );

        if (lifetimeResponse.ok) {
          const lifetimeResult = await lifetimeResponse.json();
          setSeasonStats(lifetimeResult.lifetimeStats);
        } else {
          setError("Failed to fetch lifetime stats");
        }
      } else {
        // 获取指定赛季数据
        const statsResponse = await fetch(
          `/api/pubg/players/${playerData.id}/seasons/${seasonId}?shard=${shard}`,
        );

        if (statsResponse.ok) {
          const statsResult = await statsResponse.json();
          setSeasonStats(statsResult.seasonStats);
          // 如果选择的是当前赛季，更新当前赛季状态
          if (seasonId === "current" && statsResult.seasonInfo) {
            setCurrentSeason(statsResult.seasonInfo);
          } else {
            // 否则，找到对应的赛季信息
            const selectedSeason = seasons.find((s) => s.id === seasonId);
            if (selectedSeason) {
              setCurrentSeason(selectedSeason);
            }
          }
        } else {
          setError("Failed to fetch season stats");
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching season stats");
    } finally {
      setLoading(false);
    }
  };

  // 游戏模式展示顺序
  const gameModes = [
    { id: "squad", label: "Squad TPP" },
    { id: "squad-fpp", label: "Squad FPP" },
    { id: "duo", label: "Duo TPP" },
    { id: "duo-fpp", label: "Duo FPP" },
    { id: "solo", label: "Solo TPP" },
    { id: "solo-fpp", label: "Solo FPP" },
  ];

  // 平台选项
  const platforms = [
    { value: PlatformShard.STEAM, label: "Steam" },
    { value: PlatformShard.KAKAO, label: "Kakao" },
    { value: PlatformShard.XBOX, label: "Xbox" },
    { value: PlatformShard.PSN, label: "PlayStation" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 dark:border-primary-400 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
            Loading player data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-xl w-full">
          <h1 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-4">
            Error
          </h1>
          <p className="text-red-600 dark:text-red-300">{error}</p>
          <p className="mt-4">
            <Link
              href="/"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              Return to home page
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (!playerData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-6 max-w-xl w-full">
          <h1 className="text-2xl font-bold text-amber-700 dark:text-amber-400 mb-4">
            Player Not Found
          </h1>
          <p className="text-amber-600 dark:text-amber-300">
            The player "{playerName}" could not be found on the {shard}{" "}
            platform.
          </p>
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Try a different platform:
            </h2>
            <div className="flex flex-wrap gap-2">
              {platforms.map((platform) => (
                <Link
                  key={platform.value}
                  href={`/player/${encodeURIComponent(playerName)}?shard=${platform.value}`}
                  className={`px-4 py-2 rounded-lg ${
                    platform.value === shard
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {platform.label}
                </Link>
              ))}
            </div>
          </div>
          <p className="mt-6">
            <Link
              href="/"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              Return to home page
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="rounded-lg shadow-lg overflow-hidden border border-amber-800/30">
        {/* 玩家信息头部 */}
        <div className="bg-gradient-to-r from-amber-800/90 to-gray-900/90 text-white p-6 border-b border-amber-700/50">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">
                {playerData.attributes.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-amber-200">
                  Platform: {playerData.attributes.shardId}
                </p>
                {clanInfo && clanInfo.found ? (
                  <>
                    <ClanBadge 
                      clanId={clanInfo.id} 
                      clanName={clanInfo.name} 
                      clanTag={clanInfo.tag} 
                    />
                    <span className="hidden">{/* Force re-render hack */}{Date.now()}</span>
                  </>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {currentSeason && (
                  <p className="mt-1 text-sm bg-amber-800/80 text-white rounded-full px-3 py-1 inline-block">
                    Season:{" "}
                    {currentSeason.id.split("division.bro.official.")[1] ||
                      currentSeason.id}
                  </p>
                )}
                
                {lastSyncTime && (
                  <p className="text-xs text-amber-300/80">
                    Last synced: {lastSyncTime}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="flex flex-col space-y-2">
                <div className="flex space-x-2">
                  {platforms.map((platform) => (
                    <Link
                      key={platform.value}
                      href={`/player/${encodeURIComponent(playerName)}?shard=${platform.value}`}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        platform.value === shard
                          ? "bg-white text-amber-900"
                          : "bg-amber-900/80 hover:bg-amber-800/90 text-white"
                      }`}
                    >
                      {platform.label}
                    </Link>
                  ))}
                </div>
                
                <button
                  onClick={syncPlayerData}
                  disabled={syncLoading || syncCooldown > 0}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    syncLoading 
                      ? "bg-gray-600/80 text-white cursor-not-allowed"
                      : syncCooldown > 0
                        ? "bg-amber-700/90 text-white cursor-not-allowed"
                        : "bg-amber-600/90 hover:bg-amber-500/90 text-white"
                  }`}
                >
                  {syncLoading 
                    ? "Syncing..." 
                    : syncCooldown > 0 
                      ? `Cooldown: ${syncCooldown}s` 
                      : "Sync Data"}
                </button>
                
                {syncError && (
                  <p className="text-xs text-red-300 mt-1">{syncError}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 赛季选择器 */}
        <div className="px-6 pt-4 pb-0">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-amber-100">
              Season Statistics
            </h2>

            <select
              value={selectedSeasonId}
              onChange={(e) => {
                loadSeasonStats(e.target.value);
              }}
              className="px-3 py-1.5 border border-amber-700/50 rounded-md bg-gradient-to-r from-amber-900/50 to-gray-900/80 text-amber-100 focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="current">Current Season</option>
              <option value="lifetime">Lifetime Stats</option>
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.id.split("division.bro.official.")[1] || season.id}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 数据统计 */}
        {seasonStats && (
          <div className="p-6">
            <Tabs defaultValue="squad-fpp" value={activeGameMode} onValueChange={setActiveGameMode} className="w-full">
              <TabsList className="mb-4 flex-wrap bg-gradient-to-r from-amber-900/50 to-gray-900/70 border border-amber-800/50">
                {gameModes.map((mode) => {
                  const modeStats = seasonStats.attributes?.gameModeStats?.[mode.id];
                  if (!modeStats) return null;
                  
                  return (
                    <TabsTrigger 
                      key={mode.id} 
                      value={mode.id}
                      className="font-medium"
                    >
                      {mode.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              
              {gameModes.map((mode) => {
                const modeStats = seasonStats.attributes?.gameModeStats?.[mode.id];
                if (!modeStats) return null;

                // 基本战绩
                const kd = modeStats.kills / (modeStats.losses > 0 ? modeStats.losses : 1);
                const winRate = (modeStats.wins / (modeStats.wins + modeStats.losses > 0 ? modeStats.wins + modeStats.losses : 1)) * 100;
                const adr = modeStats.damageDealt / modeStats.roundsPlayed;
                const mostKills = modeStats.roundMostKills;

                // 额外统计
                const headshotRate = (modeStats.headshotKills / (modeStats.kills > 0 ? modeStats.kills : 1)) * 100;
                const avgSurvivalTime = modeStats.timeSurvived / modeStats.roundsPlayed / 60;
                const longestKill = modeStats.longestKill;
                const roadKills = modeStats.roadKills;

                return (
                  <TabsContent key={mode.id} value={mode.id} className="mt-0">
                    <div className={styles['stats-section']}>
                      <div className={styles['stats-grid']}>
                        <div className={styles['main-stat-card']}>
                          <div className={`${styles['kd-ratio']} font-mono`}>
                            {kd.toFixed(2)}
                          </div>
                          <div className={styles['stats-label']}>
                            K/D Ratio
                          </div>
                        </div>

                        <div className={styles['main-stat-card']}>
                          <div className={`${styles['win-rate']} font-mono`}>
                            {winRate.toFixed(1)}%
                          </div>
                          <div className={styles['stats-label']}>
                            Win Rate
                          </div>
                        </div>

                        <div className={styles['main-stat-card']}>
                          <div className={`${styles['avg-damage']} font-mono`}>
                            {adr.toFixed(0)}
                          </div>
                          <div className={styles['stats-label']}>
                            Avg Damage
                          </div>
                        </div>

                        <div className={styles['main-stat-card']}>
                          <div className={`${styles['most-kills']} font-mono`}>
                            {mostKills}
                          </div>
                          <div className={styles['stats-label']}>
                            Most Kills
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className={styles['stats-card']}>
                          <h4 className={`${styles['matches-category']} mb-2`}>Matches</h4>
                          <div className="grid grid-cols-2 gap-y-1">
                            <div className={styles['sub-stat-label']}>Played:</div>
                            <div className={`text-right ${styles['sub-stat-value']} font-mono`}>{modeStats.roundsPlayed}</div>
                            
                            <div className={styles['sub-stat-label']}>Wins:</div>
                            <div className={`text-right ${styles['sub-stat-value']} font-mono`}>{modeStats.wins}</div>
                            
                            <div className={styles['sub-stat-label']}>Top 10:</div>
                            <div className={`text-right ${styles['sub-stat-value']} font-mono`}>{modeStats.top10s}</div>
                            
                            <div className={styles['sub-stat-label']}>Avg Time:</div>
                            <div className={`text-right ${styles['sub-stat-value']} font-mono`}>{Math.floor(avgSurvivalTime)}m</div>
                          </div>
                        </div>
                        
                        <div className={styles['stats-card']}>
                          <h4 className={`${styles['combat-category']} mb-2`}>Combat</h4>
                          <div className="grid grid-cols-2 gap-y-1">
                            <div className={styles['sub-stat-label']}>Kills:</div>
                            <div className={`text-right ${styles['sub-stat-value']} font-mono`}>{modeStats.kills}</div>
                            
                            <div className={styles['sub-stat-label']}>Headshots:</div>
                            <div className={`text-right ${styles['sub-stat-value']} font-mono`}>{headshotRate.toFixed(1)}%</div>
                            
                            <div className={styles['sub-stat-label']}>Assists:</div>
                            <div className={`text-right ${styles['sub-stat-value']} font-mono`}>{modeStats.assists}</div>
                            
                            <div className={styles['sub-stat-label']}>Longest:</div>
                            <div className={`text-right ${styles['sub-stat-value']} font-mono`}>{longestKill.toFixed(1)}m</div>
                          </div>
                        </div>
                        
                        <div className={styles['stats-card']}>
                          <h4 className={`${styles['survival-category']} mb-2`}>Survival</h4>
                          <div className="grid grid-cols-2 gap-y-1">
                            <div className={styles['sub-stat-label']}>Revives:</div>
                            <div className={`text-right ${styles['sub-stat-value']} font-mono`}>{modeStats.revives}</div>
                            
                            <div className={styles['sub-stat-label']}>DBNOs:</div>
                            <div className={`text-right ${styles['sub-stat-value']} font-mono`}>{modeStats.dBNOs}</div>
                            
                            <div className={styles['sub-stat-label']}>Heals:</div>
                            <div className={`text-right ${styles['sub-stat-value']} font-mono`}>{modeStats.heals}</div>
                            
                            <div className={styles['sub-stat-label']}>Boosts:</div>
                            <div className={`text-right ${styles['sub-stat-value']} font-mono`}>{modeStats.boosts}</div>
                          </div>
                        </div>
                        
                        <div className={styles['stats-card']}>
                          <h4 className={`${styles['movement-category']} mb-2`}>Movement</h4>
                          <div className="grid grid-cols-2 gap-y-1">
                            <div className={styles['sub-stat-label']}>Distance:</div>
                            <div className={`text-right ${styles['sub-stat-value']} font-mono`}>{(modeStats.rideDistance / 1000).toFixed(1)}km</div>
                            
                            <div className={styles['sub-stat-label']}>Walked:</div>
                            <div className={`text-right ${styles['sub-stat-value']} font-mono`}>{(modeStats.walkDistance / 1000).toFixed(1)}km</div>
                            
                            <div className={styles['sub-stat-label']}>Vehicles:</div>
                            <div className={`text-right ${styles['sub-stat-value']} font-mono`}>{modeStats.vehicleDestroys}</div>
                            
                            <div className={styles['sub-stat-label']}>Road Kills:</div>
                            <div className={`text-right ${styles['sub-stat-value']} font-mono`}>{roadKills}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
        )}

        {/* 比赛记录 */}
        {playerData?.id && (
          <div className="p-6 border-t border-amber-800/30">
            <MatchList 
              accountId={playerData.id}
              shard={shard}
              limit={20}
            />
          </div>
        )}
      </div>
    </div>
  );
}