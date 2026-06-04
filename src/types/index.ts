export interface Goal {
  id: string;
  title: string;
  action: string;
  category: string;
  icon: string;
  energy: number;
  relatedIds: string[];
}

export interface Season {
  id: string;
  name: string;
  start_date: string;
  end_date?: string;
  goals: Goal[];
  created_at: string;
}

export interface DailyEntry {
  id: string;
  season_id: string;
  entry_date: string;
  morning_focus_goal_id?: string;
  morning_intention?: string;
  morning_completed_at?: string;
  evening_journal?: string;
  evening_energy?: number;
  evening_mood?: string;
  evening_completed_at?: string;
  created_at: string;
}
