export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      players: {
        Row: {
          id: string
          name: string
          shard: string
          data: Json
          last_sync_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          shard: string
          data: Json
          last_sync_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          shard?: string
          data?: Json
          last_sync_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      player_season_stats: {
        Row: {
          id: number
          player_id: string
          season_id: string
          shard: string
          data: Json
          last_sync_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          player_id: string
          season_id: string
          shard: string
          data: Json
          last_sync_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          player_id?: string
          season_id?: string
          shard?: string
          data?: Json
          last_sync_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_season_stats_player_id_fkey"
            columns: ["player_id"]
            referencedRelation: "players"
            referencedColumns: ["id"]
          }
        ]
      }
      sync_history: {
        Row: {
          id: number
          player_id: string
          sync_type: string
          status: string
          details: string | null
          created_at: string
        }
        Insert: {
          id?: number
          player_id: string
          sync_type: string
          status: string
          details?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          player_id?: string
          sync_type?: string
          status?: string
          details?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}