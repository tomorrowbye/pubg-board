import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  PlatformShard,
  MatchDetail,
  Participant,
  Roster,
  Asset,
} from "@/types/pubg-api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronsDown,
  ChevronsUp,
  Trophy,
  Skull,
  Clock,
  Map,
  Users,
} from "lucide-react";

interface MatchListProps {
  accountId: string;
  shard: PlatformShard;
  limit?: number;
}

export default function MatchList({
  accountId,
  shard,
  limit = 20,
}: MatchListProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchDetail[]>([]);
  const [expandedMatches, setExpandedMatches] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    async function fetchMatches() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/pubg/players/${accountId}/matches?shard=${shard}&limit=${limit}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch matches");
        }

        const data = await response.json();
        setMatches(data.matches || []);
      } catch (err: any) {
        console.error("Error fetching matches:", err);
        setError(err.message || "An error occurred while fetching matches");
      } finally {
        setLoading(false);
      }
    }

    if (accountId) {
      fetchMatches();
    }
  }, [accountId, shard, limit]);

  // Toggle match expanded state
  const toggleMatchExpanded = (matchId: string) => {
    setExpandedMatches((prev) => ({
      ...prev,
      [matchId]: !prev[matchId],
    }));
  };

  // Get player data from match and calculate total players
  const getPlayerFromMatch = (match: MatchDetail): Participant | null => {
    if (!match?.included) return null;

    // First find the participant with matching accountId
    const participant = match.included.find(
      (item) => {
        if (item.type !== "participant") return false;
        // Type guard to ensure we're working with a Participant
        const participantItem = item as Participant;
        return participantItem.attributes?.stats?.playerId === accountId;
      }
    ) as Participant | undefined;

    if (!participant) return null;
    return participant;
  };

  // Get team data and placement from match
  const getTeamData = (match: MatchDetail, participant: Participant) => {
    if (!match?.included) return { teamMembers: [], placement: 0 };

    // Find the roster (team) that contains this participant
    const roster = match.included.find((item) => {
      if (item.type !== "roster") return false;

      // TypeScript safe check to make sure this is a Roster
      const rosterItem = item as Roster;
      if (!rosterItem.relationships?.participants?.data) return false;

      return rosterItem.relationships.participants.data.some(
        (p: { id: string }) => p.id === participant.id,
      );
    }) as Roster | undefined;

    if (!roster) return { teamMembers: [], placement: 0 };

    // Get the team placement
    const placement = roster.attributes?.stats?.rank || 0;

    // Find all participants in this roster
    const teamMemberIds =
      roster.relationships?.participants?.data.map(
        (p: { id: string }) => p.id,
      ) || [];

    const teamMembers = match.included.filter((item) => {
      if (item.type !== "participant") return false;
      // Type guard to ensure we're dealing with a Participant
      const participantItem = item as Participant;
      return teamMemberIds.includes(participantItem.id);
    }) as Participant[];

    return {
      teamMembers,
      placement,
    };
  };

  // Format match duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Get game mode display name
  const getGameModeDisplay = (gameMode: string) => {
    const modes: Record<string, string> = {
      solo: "Solo TPP",
      "solo-fpp": "Solo FPP",
      duo: "Duo TPP",
      "duo-fpp": "Duo FPP",
      squad: "Squad TPP",
      "squad-fpp": "Squad FPP",
      tdm: "Team Deathmatch",
      conquest: "Conquest",
      esports: "Esports",
      war: "War Mode",
      zombie: "Zombie Mode",
    };

    return modes[gameMode] || gameMode;
  };

  // Get map display name
  const getMapDisplay = (mapName: string) => {
    const maps: Record<string, string> = {
      Baltic_Main: "Erangel",
      Desert_Main: "Miramar",
      Savage_Main: "Sanhok",
      DihorOtok_Main: "Vikendi",
      Range_Main: "Camp Jackal",
      Summerland_Main: "Karakin",
      Tiger_Main: "Taego",
      Kiki_Main: "Deston",
      Heaven_Main: "Haven",
      Chimera_Main: "Paramo",
    };

    return maps[mapName] || mapName;
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Loading recent matches...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-400">
            Error
          </h3>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          No recent matches found
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Recent Matches
        </h2>
        <Badge variant="outline" className="px-3 py-1">
          {matches.length} matches
        </Badge>
      </div>

      <div className="space-y-4">
        {matches.map((match) => {
          // Ensure we have valid match data
          if (!match?.data?.id || !match?.data?.attributes) return null;
          
          // Get player data safely
          const playerData = getPlayerFromMatch(match);
          if (!playerData || !playerData.attributes || !playerData.attributes.stats) return null;

          // Get team data with safety checks
          const { teamMembers, placement } = getTeamData(match, playerData);
          const isExpanded = expandedMatches[match.data.id] || false;
          const matchDate = new Date(match.data.attributes.createdAt || Date.now());
          const stats = playerData.attributes.stats;
          const isWin = placement === 1;

          return (
            <Card
              key={match.data.id}
              className={`
              ${isWin ? "border-green-400 dark:border-green-600" : ""}
              hover:shadow-md transition-shadow
            `}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          isWin
                            ? "success"
                            : (stats.kills > 3)
                              ? "info"
                              : "secondary"
                        }
                      >
                        {getGameModeDisplay(match.data.attributes.gameMode || "unknown")}
                      </Badge>
                      <CardDescription>
                        {format(matchDate, "MMM d, yyyy · h:mm a")}
                      </CardDescription>
                    </div>
                    <CardTitle className="mt-2 text-xl">
                      {isWin && (
                        <Trophy
                          className="inline-block mr-1 text-yellow-500"
                          size={20}
                        />
                      )}
                      {isWin
                        ? "Winner Winner Chicken Dinner!"
                        : `#${placement || '?'} of ${match.included?.filter(item => item.type === "participant")?.length || 0} players`}
                    </CardTitle>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex space-x-6 text-sm">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center text-red-600 dark:text-red-400">
                          <Skull size={16} className="mr-1" />
                          <span className="font-semibold">{stats.kills || 0}</span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Kills
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="font-semibold">
                          {Math.round(stats.damageDealt || 0)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Damage
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pb-2 pt-0">
                <div className="flex items-center space-x-4 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-center">
                    <Map size={16} className="mr-1 text-gray-500" />
                    {getMapDisplay(match.data.attributes.mapName || "Unknown")}
                  </div>
                  <div className="flex items-center">
                    <Clock size={16} className="mr-1 text-gray-500" />
                    {formatDuration(Math.floor(stats.timeSurvived || 0))}
                  </div>
                </div>
              </CardContent>

              {isExpanded && (
                <>
                  <Separator />
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center">
                          <Users size={16} className="mr-1" />
                          Team Stats
                        </h4>
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                          <div className="space-y-2">
                            {teamMembers.map((member) => (
                              <div
                                key={member.id}
                                className="flex justify-between items-center"
                              >
                                <div className="font-medium">
                                  {member.attributes.stats.name}
                                  {member.attributes.stats.playerId ===
                                    accountId && (
                                    <span className="text-xs ml-1 text-primary-600">
                                      (You)
                                    </span>
                                  )}
                                </div>
                                <div className="flex space-x-4 text-sm">
                                  <div>
                                    <span className="text-red-600 dark:text-red-400 font-medium">
                                      {member.attributes.stats.kills}
                                    </span>{" "}
                                    kills
                                  </div>
                                  <div>
                                    <span className="font-medium">
                                      {Math.round(
                                        member.attributes.stats.damageDealt,
                                      )}
                                    </span>{" "}
                                    dmg
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold mb-2">
                          Your Match Stats
                        </h4>
                        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              Kills
                            </span>
                            <span className="font-medium">{stats.kills || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              Damage
                            </span>
                            <span className="font-medium">
                              {Math.round(stats.damageDealt)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              Headshots
                            </span>
                            <span className="font-medium">
                              {stats.headshotKills}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              Assists
                            </span>
                            <span className="font-medium">{stats.assists || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              DBNOs
                            </span>
                            <span className="font-medium">{stats.DBNOs || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              Revives
                            </span>
                            <span className="font-medium">{stats.revives || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              Distance
                            </span>
                            <span className="font-medium">
                              {Math.round(
                                stats.walkDistance + stats.rideDistance,
                              )}
                              m
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              Heals Used
                            </span>
                            <span className="font-medium">{stats.heals || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </>
              )}

              <CardFooter className="pt-0 pb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => toggleMatchExpanded(match.data.id)}
                >
                  {isExpanded ? (
                    <>
                      <ChevronsUp className="mr-1 h-4 w-4" />
                      <span>Show Less</span>
                    </>
                  ) : (
                    <>
                      <ChevronsDown className="mr-1 h-4 w-4" />
                      <span>Show Details</span>
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
