export interface User {
  id: number;
  name: string;
  settings?: {
    alarmSound: string;
    alarmName: string;
  };
}

export interface Reminder {
  id: number;
  user_id: number;
  title: string;
  description: string;
  due_time: string | null;
  location_lat: number | null;
  location_lng: number | null;
  location_radius: number | null;
  status: 'active' | 'completed' | 'ignored' | 'snoozed';
  priority: 'normal' | 'high' | 'emergency';
  context_type: 'time' | 'location' | 'routine' | 'emotion';
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  created_at: string;
}

export interface EmergencyContact {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  relation: string;
}

export interface GameScore {
  id: number;
  user_id: number;
  game_type: string;
  score: number;
  timestamp: string;
}

export interface LocationState {
  lat: number;
  lng: number;
}
