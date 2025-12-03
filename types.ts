export interface WeekDay {
  id: string;
  label: string;
  full: string;
  focus: string;
}

export interface Exercise {
  id: string;
  day: string;
  name: string;
  muscle: string;
  function?: string;
}

export interface SetData {
  reps: string;
  kg: string;
}

export interface LogEntry {
  date: string;
  timestamp: number;
  mode: 'standard' | 'dynamic';
  note?: string;
  // Standard mode data
  sets?: string;
  reps?: string;
  kg?: string;
  // Dynamic mode data
  dynamicSets?: SetData[];
}

export type LogsMap = Record<string, LogEntry>;