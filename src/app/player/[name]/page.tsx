"use client";

import { useEffect, useState } from "react";
import { PlatformShard } from "@/types/pubg-api";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import MatchList from '@/components/MatchList/index';

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
  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("current");

  useEffect(() => {
    async function fetchPlayerData() {
      try {
        setLoading(true);
        setError(null);

        // 获取玩家信息
        const playerResponse = await fetch(
          `/api/pubg/players?playerName=${encodeURIComponent(playerName)}&shard=${shard}`,
        );

        if (!playerResponse.ok) {
          throw new Error("Failed to fetch player data");
        }

        const playerResult = await playerResponse.json();
        setPlayerData(playerResult.player);

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
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* 玩家信息头部 */}
        <div className="bg-gradient-to-r from-primary-700 to-primary-900 dark:from-primary-900 dark:to-primary-800 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">
                {playerData.attributes.name}
              </h1>
              <p className="text-primary-100">
                Platform: {playerData.attributes.shardId}
              </p>
              {currentSeason && (
                <p className="mt-1 text-sm bg-primary-800 dark:bg-primary-700 text-white rounded-full px-3 py-1 inline-block">
                  Season:{" "}
                  {currentSeason.id.split("division.bro.official.")[1] ||
                    currentSeason.id}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="flex space-x-2">
                {platforms.map((platform) => (
                  <Link
                    key={platform.value}
                    href={`/player/${encodeURIComponent(playerName)}?shard=${platform.value}`}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      platform.value === shard
                        ? "bg-white dark:bg-gray-200 text-primary-800"
                        : "bg-primary-800 dark:bg-primary-700 hover:bg-primary-700 dark:hover:bg-primary-600 text-white"
                    }`}
                  >
                    {platform.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 赛季选择器 */}
        <div className="px-6 pt-4 pb-0">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Season Statistics
            </h2>

            <select
              value={selectedSeasonId}
              onChange={(e) => {
                loadSeasonStats(e.target.value);
              }}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="current">Current Season</option>
              <option value="lifetime">Lifetime Stats</option>
              {seasons.slice(0, 10).map((season) => (
                <option key={season.id} value={season.id}>
                  {season.id.split("division.bro.official.")[1] || season.id}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 数据部分 */}
        {seasonStats ? (
          <div className="p-6 pt-2">
            {selectedSeasonId === "lifetime" && (
              <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 p-3 mb-4 text-blue-800 dark:text-blue-300">
                Showing lifetime statistics across all seasons
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gameModes.map((mode) => {
                const stats = seasonStats.attributes.gameModeStats[mode.id];

                if (!stats) {
                  return null;
                }

                return (
                  <div
                    key={mode.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow bg-white dark:bg-gray-800"
                  >
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                      {mode.label}
                    </h3>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex flex-col">
                        <span className="text-gray-600 dark:text-gray-400">
                          Matches
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {stats.roundsPlayed}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-gray-600 dark:text-gray-400">
                          Wins
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {stats.wins}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-gray-600 dark:text-gray-400">
                          Win Rate
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {stats.roundsPlayed > 0
                            ? `${((stats.wins / stats.roundsPlayed) * 100).toFixed(1)}%`
                            : "0%"}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-gray-600 dark:text-gray-400">
                          Top 10
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {stats.top10s}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-gray-600 dark:text-gray-400">
                          Kills
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {stats.kills}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-gray-600 dark:text-gray-400">
                          K/D
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {stats.roundsPlayed > stats.wins
                            ? (
                                stats.kills /
                                (stats.roundsPlayed - stats.wins)
                              ).toFixed(2)
                            : stats.kills.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-gray-600 dark:text-gray-400">
                          Avg Damage
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {stats.roundsPlayed > 0
                            ? Math.round(stats.damageDealt / stats.roundsPlayed)
                            : 0}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-gray-600 dark:text-gray-400">
                          Longest Kill
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {Math.round(stats.longestKill)}m
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-gray-600 dark:text-gray-400">
                          Headshot %
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {stats.kills > 0
                            ? `${((stats.headshotKills / stats.kills) * 100).toFixed(1)}%`
                            : "0%"}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-gray-600 dark:text-gray-400">
                          Avg Survival
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {stats.roundsPlayed > 0
                            ? `${Math.floor(stats.timeSurvived / stats.roundsPlayed / 60)}m`
                            : "0m"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No stats available for this player
            </p>
            <button
              onClick={() => loadSeasonStats("lifetime")}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Try Viewing Lifetime Stats
            </button>
          </div>
        )}

        {/* 比赛列表 */}
        {playerData && (
          <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-6 px-6">
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
