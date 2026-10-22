export interface Song {
  id: string;
  orderIndex: number;
  title: string;
  artist: string;
  originalKey: string;
  playKey: string;
  tempoBpm: number | null;
  versionUrl: string;
  chordUrl: string;
  chordContent: string;
  notes: string;
  updatedAt: string;
}

export type SongInput = Omit<Song, 'id' | 'orderIndex' | 'updatedAt'> & {
  id?: string;
  orderIndex?: number;
};

export const COMMON_KEYS = [
  'C', 'C#', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B',
  'Cm', 'C#m', 'Dm', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'Abm', 'Am', 'Bbm', 'Bm'
] as const;
