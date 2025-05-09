import { createClient } from '@supabase/supabase-js';
import { Database } from './supabase-types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Types for our database tables
export type PlayerRecord = {
  id: string;
  name: string;
  shard: string;
  data: any;
  last_sync_at: string;
  created_at?: string;
  updated_at?: string;
};

export type PlayerSeasonStatsRecord = {
  id?: number;
  player_id: string;
  season_id: string;
  shard: string;
  data: any;
  last_sync_at: string;
  created_at?: string;
  updated_at?: string;
};

export type SyncHistoryRecord = {
  id?: number;
  player_id: string;
  sync_type: 'player' | 'season_stats' | 'lifetime_stats';
  status: 'success' | 'failed';
  details?: string;
  created_at?: string;
};

// Initialize Supabase client
// @ts-ignore - Ignore type errors in Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
});

// Supabase data service
export const supabaseService = {
  /**
   * Get a player by name and shard
   * @param name Player name
   * @param shard Platform shard
   * @returns Player record or null
   */
  async getPlayerByName(name: string, shard: string): Promise<PlayerRecord | null> {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('name', name)
        .eq('shard', shard)
        .single();

      if (error) {
        console.log('❌ Error fetching player from Supabase:', error.message);
        return null;
      }

      return data as unknown as PlayerRecord;
    } catch (err) {
      console.log('❌ Exception in getPlayerByName:', err);
      return null;
    }
  },

  /**
   * Get a player by ID
   * @param id Player ID
   * @returns Player record or null
   */
  async getPlayerById(id: string): Promise<PlayerRecord | null> {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.log('❌ Error fetching player from Supabase:', error.message);
        return null;
      }

      // 确保数据有效并包含必要字段
      if (!data) {
        return null;
      }

      // 确保数据结构完整
      if (!data.data) {
        data.data = {};
      }
      
      if (!data.data.relationships) {
        data.data.relationships = {};
      }

      return data as unknown as PlayerRecord;
    } catch (err) {
      console.log('❌ Exception in getPlayerById:', err);
      return null;
    }
  },

  /**
   * Save or update a player
   * @param player Player data to save
   * @returns Saved player record or null
   */
  async savePlayer(player: PlayerRecord): Promise<PlayerRecord | null> {
    try {
      // 确保数据结构完整
      if (!player.data) {
        player.data = {};
      }
      
      if (!player.data.relationships) {
        player.data.relationships = {};
      }

      // Check if player exists
      const existingPlayer = await this.getPlayerById(player.id);

      let result;
      if (existingPlayer) {
        // 更新时保留任何现有的关系数据，除非明确覆盖
        if (existingPlayer.data && existingPlayer.data.relationships) {
          player.data.relationships = {
            ...existingPlayer.data.relationships,
            ...player.data.relationships
          };
        }

        // Update existing player
        const { data, error } = await supabase
          .from('players')
          .update({
            name: player.name,
            shard: player.shard,
            data: player.data,
            last_sync_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', player.id)
          .select();

        if (error) {
          console.log('❌ Error updating player in Supabase:', error.message);
          return null;
        }
        result = data?.[0];
      } else {
        // Insert new player
        const { data, error } = await supabase
          .from('players')
          .insert({
            id: player.id,
            name: player.name,
            shard: player.shard,
            data: player.data,
            last_sync_at: new Date().toISOString()
          })
          .select();

        if (error) {
          console.log('❌ Error inserting player in Supabase:', error.message);
          return null;
        }
        result = data?.[0];
      }

      // Add sync history entry
      await this.addSyncHistory({
        player_id: player.id,
        sync_type: 'player',
        status: 'success'
      });

      return result as unknown as PlayerRecord;
    } catch (err) {
      console.log('❌ Exception in savePlayer:', err);
      return null;
    }
  },

  /**
   * Get player season stats
   * @param playerId Player ID
   * @param seasonId Season ID
   * @param shard Platform shard
   * @returns Season stats record or null
   */
  async getPlayerSeasonStats(
    playerId: string,
    seasonId: string,
    shard: string
  ): Promise<PlayerSeasonStatsRecord | null> {
    try {
      const { data, error } = await supabase
        .from('player_season_stats')
        .select('*')
        .eq('player_id', playerId)
        .eq('season_id', seasonId)
        .eq('shard', shard)
        .single();

      if (error) {
        console.log('❌ Error fetching season stats from Supabase:', error.message);
        return null;
      }

      return data as unknown as PlayerSeasonStatsRecord;
    } catch (err) {
      console.log('❌ Exception in getPlayerSeasonStats:', err);
      return null;
    }
  },

  /**
   * Save or update player season stats
   * @param stats Season stats data to save
   * @returns Saved season stats record or null
   */
  async savePlayerSeasonStats(
    stats: PlayerSeasonStatsRecord
  ): Promise<PlayerSeasonStatsRecord | null> {
    try {
      // Check if stats exists
      const existingStats = await this.getPlayerSeasonStats(
        stats.player_id,
        stats.season_id,
        stats.shard
      );

      let result;
      if (existingStats) {
        // Update existing stats
        const { data, error } = await supabase
          .from('player_season_stats')
          .update({
            data: stats.data,
            last_sync_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('player_id', stats.player_id)
          .eq('season_id', stats.season_id)
          .eq('shard', stats.shard)
          .select();

        if (error) {
          console.log('❌ Error updating season stats in Supabase:', error.message);
          return null;
        }
        result = data?.[0];
      } else {
        // Insert new stats
        const { data, error } = await supabase
          .from('player_season_stats')
          .insert({
            player_id: stats.player_id,
            season_id: stats.season_id,
            shard: stats.shard,
            data: stats.data,
            last_sync_at: new Date().toISOString()
          })
          .select();

        if (error) {
          console.log('❌ Error inserting season stats in Supabase:', error.message);
          return null;
        }
        result = data?.[0];
      }

      // Add sync history entry
      await this.addSyncHistory({
        player_id: stats.player_id,
        sync_type: 'season_stats',
        status: 'success'
      });

      return result as unknown as PlayerSeasonStatsRecord;
    } catch (err) {
      console.log('❌ Exception in savePlayerSeasonStats:', err);
      return null;
    }
  },

  /**
   * Add a sync history record
   * @param history Sync history data
   * @returns Saved history record or null
   */
  async addSyncHistory(history: SyncHistoryRecord): Promise<SyncHistoryRecord | null> {
    try {
      const { data, error } = await supabase
        .from('sync_history')
        .insert({
          player_id: history.player_id,
          sync_type: history.sync_type,
          status: history.status,
          details: history.details
        })
        .select();

      if (error) {
        console.log('❌ Error adding sync history in Supabase:', error.message);
        return null;
      }

      return data?.[0] as unknown as SyncHistoryRecord;
    } catch (err) {
      console.log('❌ Exception in addSyncHistory:', err);
      return null;
    }
  },

  /**
   * Get the last sync time for a player
   * @param playerId Player ID
   * @returns Last sync time or null
   */
  async getLastPlayerSyncTime(playerId: string): Promise<Date | null> {
    try {
      const { data, error } = await supabase
        .from('sync_history')
        .select('created_at')
        .eq('player_id', playerId)
        .eq('status', 'success')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error || !data || data.length === 0) {
        return null;
      }

      return new Date((data[0] as any).created_at);
    } catch (err) {
      console.log('❌ Exception in getLastPlayerSyncTime:', err);
      return null;
    }
  },

  /**
   * Check if player can be synced (not synced in the last 5 minutes)
   * @param playerId Player ID
   * @returns Whether the player can be synced
   */
  async canSyncPlayer(playerId: string): Promise<boolean> {
    const lastSync = await this.getLastPlayerSyncTime(playerId);
    
    if (!lastSync) {
      return true; // No sync history, can sync
    }

    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    return lastSync < fiveMinutesAgo;
  }
};