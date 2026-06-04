import type { Goal } from "./index";

export interface SeasonRow {
  id: string;
  name: string;
  start_date: string;
  end_date: string | null;
  goals: Goal[];
  created_at: string;
}

export interface DailyEntryRow {
  id: string;
  season_id: string;
  entry_date: string;
  morning_focus_goal_id: string | null;
  morning_intention: string | null;
  morning_completed_at: string | null;
  evening_journal: string | null;
  evening_energy: number | null;
  evening_mood: string | null;
  evening_completed_at: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      seasons: {
        Row: SeasonRow;
        Insert: Omit<SeasonRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<SeasonRow>;
      };
      daily_entries: {
        Row: DailyEntryRow;
        Insert: Omit<DailyEntryRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<DailyEntryRow>;
      };
    };
  };
}
