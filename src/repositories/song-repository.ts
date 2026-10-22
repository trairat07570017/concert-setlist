import { Song, SongInput } from '../domain/song';

export interface SongRepository {
  getSongs(): Promise<Song[]>;
  saveSong(song: SongInput): Promise<Song>;
  updateSong(id: string, song: Partial<SongInput>): Promise<Song>;
  deleteSong(id: string): Promise<void>;
  reorderSongs(orderedIds: string[]): Promise<void>;
  fetchChordFromDochord(url: string): Promise<string>;
}
