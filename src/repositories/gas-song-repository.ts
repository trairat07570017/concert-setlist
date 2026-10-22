import { Song, SongInput } from '../domain/song';
import { SongRepository } from './song-repository';

export class GasSongRepository implements SongRepository {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl.trim();
  }

  private async fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(url, {
        ...options,
        redirect: 'follow'
      });

      if (!response.ok) {
        throw new Error(`GAS API HTTP error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Unknown error occurred in GAS API');
      }

      return data as T;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('GAS Request failed:', message);
      throw new Error(`ไม่สามารถเชื่อมต่อ Google Sheets API ได้: ${message}`);
    }
  }

  async getSongs(): Promise<Song[]> {
    const url = `${this.apiUrl}?action=get_songs`;
    const res = await this.fetchApi<{ success: boolean; songs: Song[] }>(url);
    return res.songs || [];
  }

  async saveSong(songInput: SongInput): Promise<Song> {
    const payload = {
      action: 'add_song',
      song: songInput
    };

    const res = await this.fetchApi<{ success: boolean; song: Song }>(this.apiUrl, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    return res.song;
  }

  async updateSong(id: string, updates: Partial<SongInput>): Promise<Song> {
    const payload = {
      action: 'update_song',
      id,
      updates
    };

    await this.fetchApi<{ success: boolean; updated: boolean }>(this.apiUrl, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    // Return the updated representation
    const songs = await this.getSongs();
    const found = songs.find((s) => s.id === id);
    if (!found) {
      throw new Error(`Song with id ${id} not found after update`);
    }
    return found;
  }

  async deleteSong(id: string): Promise<void> {
    const payload = {
      action: 'delete_song',
      id
    };

    await this.fetchApi<{ success: boolean; deleted: boolean }>(this.apiUrl, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async reorderSongs(orderedIds: string[]): Promise<void> {
    const payload = {
      action: 'reorder_songs',
      orderedIds
    };

    await this.fetchApi<{ success: boolean; reordered: boolean }>(this.apiUrl, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async fetchChordFromDochord(url: string): Promise<string> {
    const fetchUrl = `${this.apiUrl}?action=fetch_dochord&url=${encodeURIComponent(url)}`;
    const res = await this.fetchApi<{ success: boolean; chordContent: string }>(fetchUrl);
    return res.chordContent || '';
  }
}
