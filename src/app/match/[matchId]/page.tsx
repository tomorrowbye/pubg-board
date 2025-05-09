"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PlatformShard, MatchDetail, Participant, Roster } from "@/types/pubg-api";

export default function MatchDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const matchId = params.matchId as string;
  const shard = (searchParams.get("shard") as PlatformShard) || PlatformShard.STEAM;

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [matchData, setMatchData] = useState<MatchDetail | null>(null);

  useEffect(() => {
    async function fetchMatchData() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/pubg/matches/${matchId}?shard=${shard}`);

        if (!response.ok) {
          throw new Error("Failed to fetch match data");
        }

        const result = await response.json();
        setMatchData(result.match);
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching match data");
      } finally {
        setLoading(false);
      }
    }

    if (matchId) {
      fetchMatchData();
    }
  }, [matchId, shard]);

  // 获取地图名称的可读版本
  const getReadableMapName = (mapName: string): string => {
    const mapNames: Record<string, string> = {
      "Baltic_Main": "Erangel",
      "Desert_Main": "Miramar",
      "Savage_Main": "Sanhok",
      "DihorOtok_Main": "Vikendi",
      "Range_Main": "Camp Jackal",
      "Summerland_Main": "Karakin",
      "Tiger_Main": "Taego",
      "Kiki_Main": "Deston",
      "Heaven_Main": "Haven",
      "Neon_Main": "Rondo",
    };
    
    return mapNames[mapName] || mapName;
  };

  // 获取游戏模式的可读版本
  const getReadableGameMode = (gameMode: string): string => {
    const modes: Record<string, string> = {
      "squad": "Squad TPP",
      "squad-fpp": "Squad FPP",
      "duo": "Duo TPP",
      "duo-fpp": "Duo FPP",
      "solo": "Solo TPP",
      "solo-fpp": "Solo FPP",
      "tdm": "Team Deathmatch",
    };
    
    return modes[gameMode] || gameMode;
  };

  // 按队伍分组 participants
  const groupParticipantsByTeam = (): Array<{roster: Roster, participants: Participant[]}> => {
    if (!matchData) return [];

    const rosters = matchData.included.filter(item => item.type === "roster") as Roster[];
    const participants = matchData.included.filter(item => item.type === "participant") as Participant[];
    
    return rosters.map(roster => {
      const participantIds = roster.relationships.participants.data.map(p => p.id);
      const teamParticipants = participants.filter(p => participantIds.includes(p.id));
      return {
        roster,
        participants: teamParticipants,
      };
    }).sort((a, b) => a.roster.attributes.stats.rank - b.roster.attributes.stats.rank);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 dark:border-primary-400 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
            Loading match data...
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

  if (!matchData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-6 max-w-xl w-full">
          <h1 className="text-2xl font-bold text-amber-700 dark:text-amber-400 mb-4">
            Match Not Found
          </h1>
          <p className="text-amber-600 dark:text-amber-300">
            The match with ID "{matchId}" could not be found on the {shard} platform.
          </p>
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

  const matchDate = new Date(matchData.data.attributes.createdAt);
  const formattedDate = matchDate.toLocaleString();
  const durationMinutes = Math.floor(matchData.data.attributes.duration / 60);
  const teams = groupParticipantsByTeam();

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* 比赛信息头部 */}
        <div className="bg-gradient-to-r from-primary-700 to-primary-900 dark:from-primary-900 dark:to-primary-800 text-white p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">
                {getReadableMapName(matchData.data.attributes.mapName)} - {getReadableGameMode(matchData.data.attributes.gameMode)}
              </h1>
              <p className="text-primary-100">
                Match ID: {matchId}
              </p>
              <p className="text-primary-100">
                Platform: {matchData.data.attributes.shardId}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-white">{formattedDate}</p>
              <p className="text-primary-100">Duration: {durationMinutes} minutes</p>
            </div>
          </div>
        </div>

        {/* 队伍列表 */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Match Results</h2>
          
          <div className="space-y-6">
            {teams.map((team, index) => {
              const isWinner = team.roster.attributes.stats.rank === 1;
              const teamBorderClass = isWinner 
                ? "border-yellow-400 dark:border-yellow-600" 
                : "border-gray-200 dark:border-gray-700";
              
              return (
                <div 
                  key={team.roster.id}
                  className={`border ${teamBorderClass} rounded-lg overflow-hidden ${isWinner ? "bg-yellow-50 dark:bg-yellow-900/20" : ""}`}
                >
                  <div className="px-4 py-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div className="flex items-center">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isWinner ? "bg-yellow-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"}`}>
                        #{team.roster.attributes.stats.rank}
                      </span>
                      <span className="ml-3 font-medium text-gray-900 dark:text-white">
                        Team {team.roster.attributes.stats.teamId} {isWinner && "(Winner)"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Player
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Kills
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Assists
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Damage
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Survived
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            HS Kills
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Revives
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {team.participants.map((player) => (
                          <tr key={player.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Link 
                                href={`/player/${encodeURIComponent(player.attributes.stats.name)}?shard=${shard}`}
                                className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                              >
                                {player.attributes.stats.name}
                              </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                              {player.attributes.stats.kills}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                              {player.attributes.stats.assists}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                              {Math.round(player.attributes.stats.damageDealt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                              {Math.floor(player.attributes.stats.timeSurvived / 60)}m
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                              {player.attributes.stats.headshotKills}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                              {player.attributes.stats.revives}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}