
export interface Memory {
  id: string;
  type: 'note' | 'photo';
  content: string;
  createdAt: Date;
}

export interface DailyMemories {
  [key: string]: Memory[];  // key is date in format YYYY-MM-DD
}
