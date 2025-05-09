import React, { useEffect, useState } from "react";
import MatchCard from "../MatchCard";
import { Skeleton } from "../ui/skeleton";

interface MatchListProps {
  accountId: string;
  shard: string;
  limit?: number;
}

// 比赛数据格式化函数
const formatMatchData = (matchData: any) => {
  if (!matchData) return null;

  try {
    // 获取基本信息
    const matchInfo = matchData.data?.attributes || {};

    // 查找玩家相关的参与者
    const participant = matchData.included?.find(
      (item: any) =>
        item.type === "participant" &&
        item.attributes?.stats?.playerId === matchData.playerAccountId,
    );

    if (!participant) return null;

    // 获取队友信息 (所有同一个roster的玩家)
    const roster = matchData.included?.find(
      (item: any) =>
        item.type === "roster" &&
        item.relationships?.participants?.data?.some(
          (p: any) => p.id === participant.id,
        ),
    );

    const teammates =
      roster?.relationships?.participants?.data
        .filter((p: any) => p.id !== participant.id)
        .map((p: any) => {
          const teammateData = matchData.included?.find(
            (item: any) => item.type === "participant" && item.id === p.id,
          );
          return teammateData
            ? {
                name: teammateData.attributes?.stats?.name || "Unknown",
                kills: teammateData.attributes?.stats?.kills || 0,
              }
            : null;
        })
        .filter(Boolean) || [];

    // 获取玩家统计数据
    const stats = participant.attributes?.stats || {};

    return {
      id: matchData.data?.id || "",
      gameMode: matchInfo.gameMode || "",
      mapName: matchInfo.mapName || "",
      createdAt: matchInfo.createdAt || new Date().toISOString(),
      stats: {
        rank: roster?.attributes?.stats?.rank || 0,
        kills: stats.kills || 0,
        damage: Math.round(stats.damageDealt || 0),
        survivalTime: stats.timeSurvived || 0,
        healingItems: stats.heals || 0,
        boostItems: stats.boosts || 0,
        revives: stats.revives || 0,
        longestKill: Math.round(stats.longestKill || 0),
        teammates: teammates,
      },
    };
  } catch (err) {
    console.error("Error formatting match data:", err);
    return null;
  }
};

export default function MatchList({
  accountId,
  shard,
  limit = 20,
}: MatchListProps) {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMatches() {
      if (!accountId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/pubg/players/${accountId}/matches?shard=${shard}&limit=${limit}`,
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch matches: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.matches) {
          // 处理并格式化匹配数据
          const formattedMatches = data.matches
            .map((match: any) => {
              // 添加玩家ID到匹配数据中以便识别
              if (match) {
                match.playerAccountId = accountId;
              }
              return formatMatchData(match);
            })
            .filter(Boolean); // 移除无效数据
          setMatches(formattedMatches);
        } else {
          setMatches([]);
        }
      } catch (err: any) {
        console.error("Error fetching matches:", err);
        setError(err.message || "Failed to load match history");
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, [accountId, shard, limit]);

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-amber-100 mb-4">
          Recent Matches
        </h2>
        <div className="space-y-4">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-amber-900/80 to-gray-900/90 rounded-lg p-4 border border-amber-800/50"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-14 h-14 rounded-md bg-amber-800/30" />
                    <div>
                      <Skeleton className="h-5 w-24 mb-2 bg-amber-800/30" />
                      <Skeleton className="h-4 w-32 bg-amber-800/30" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <Skeleton className="w-10 h-10 rounded-full bg-amber-800/30" />
                    <Skeleton className="w-10 h-12 bg-amber-800/30" />
                    <Skeleton className="w-10 h-12 bg-amber-800/30" />
                    <Skeleton className="w-16 h-12 bg-amber-800/30" />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-amber-100 mb-4">
          Recent Matches
        </h2>
        <div className="bg-red-900/40 border border-red-700 rounded-lg p-4 text-red-200">
          <p>Error loading match history: {error}</p>
          <p className="mt-2 text-sm">
            Please try again later or check your connection.
          </p>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-amber-100 mb-4">
          Recent Matches
        </h2>
        <div className="bg-gradient-to-br from-amber-900/60 to-gray-900/80 rounded-lg p-6 border border-amber-800/50 text-center">
          <p className="text-amber-200/90">No recent matches found.</p>
          <p className="mt-2 text-sm text-amber-200/70">
            This player has not played any matches recently or match data is not
            available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-amber-100 mb-4">Recent Matches</h2>
      <div className="space-y-4">
        {matches.map((match, index) => (
          <MatchCard key={`${match.id || index}`} match={match} shard={shard} />
        ))}
      </div>
    </div>
  );
}
