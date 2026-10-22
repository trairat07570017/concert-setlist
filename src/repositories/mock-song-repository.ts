import { Song, SongInput } from '../domain/song';
import { SongRepository } from './song-repository';

const STORAGE_KEY = 'concert_setlist_songs';

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  clear?(): void;
}

export class MemoryStorage implements KeyValueStorage {
  private map = new Map<string, string>();
  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
  clear(): void {
    this.map.clear();
  }
}

const INITIAL_SEEDS: Song[] = [
  {
    id: 'seed-1',
    orderIndex: 0,
    title: 'วัดปะหล่ะ? (TEST ME)',
    artist: '4EVE',
    originalKey: 'F',
    playKey: 'G',
    tempoBpm: 105,
    versionUrl: 'https://www.youtube.com/watch?v=S8pB4kXN3aQ',
    chordUrl: 'https://www.dochord.com/393393/',
    chordContent: `[Intro]
G  Em  C  D

[Verse 1]
G                 Em
  เธอเคยคิดไหมว่าเราน่ะเหมาะกัน
C                 D
  ถ้าเธอไม่คิดงั้นลองมาวัดกันดูหน่อยไหม`,
    notes: 'อินโทรกลองเคาะ 4 จังหวะ กีตาร์โปร่งขึ้นเดี่ยว',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'seed-2',
    orderIndex: 1,
    title: 'ซ่อนกลิ่น',
    artist: 'Palmy',
    originalKey: 'Bb',
    playKey: 'C',
    tempoBpm: 85,
    versionUrl: 'https://www.youtube.com/watch?v=cM3jCqL7z00',
    chordUrl: 'https://www.dochord.com/175841/',
    chordContent: `[Intro]
C  Em  Am  F

[Verse]
C           Em
คงเก็บเอาไว้แต่ความทรงจำ
    Am               F
ที่ยังคอยย้ำเตือนใจเรื่อยมา`,
    notes: 'คีย์ C นักร้องขอคีย์สูงกว่าต้นฉบับ 2 เซมิโทน',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'seed-3',
    orderIndex: 2,
    title: 'ทรงอย่างแบด (Bad Boy)',
    artist: 'Paper Planes',
    originalKey: 'E',
    playKey: 'E',
    tempoBpm: 150,
    versionUrl: 'https://www.youtube.com/watch?v=qf6a89c3w1g',
    chordUrl: '',
    chordContent: `[Intro]
E  G#m  C#m  A

[Chorus]
E                    G#m
ทรงอย่างแบด แซดอย่างบ่อย
C#m                 A
เธอไม่อินกับผู้ชาย bad boy`,
    notes: 'เพลงเปิดช่วงครึ่งหลัง เบสเตรียมเปิดเสียงแตก Fuzz',
    updatedAt: new Date().toISOString()
  }
];

export class MockSongRepository implements SongRepository {
  private storage: KeyValueStorage;

  constructor(customStorage?: KeyValueStorage) {
    if (customStorage) {
      this.storage = customStorage;
    } else if (typeof window !== 'undefined' && window.localStorage) {
      this.storage = window.localStorage;
    } else {
      this.storage = new MemoryStorage();
    }
  }

  private getStorage(): Song[] {
    const data = this.storage.getItem(STORAGE_KEY);
    if (!data) {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEEDS));
      return [...INITIAL_SEEDS];
    }
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => a.orderIndex - b.orderIndex);
      }
      return [...INITIAL_SEEDS];
    } catch {
      return [...INITIAL_SEEDS];
    }
  }

  private saveStorage(songs: Song[]): void {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(songs));
  }

  async getSongs(): Promise<Song[]> {
    return this.getStorage();
  }

  async saveSong(songInput: SongInput): Promise<Song> {
    const songs = this.getStorage();
    const newSong: Song = {
      id: songInput.id || `song-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      orderIndex: songInput.orderIndex ?? songs.length,
      title: songInput.title.trim(),
      artist: songInput.artist.trim(),
      originalKey: songInput.originalKey || 'C',
      playKey: songInput.playKey || songInput.originalKey || 'C',
      tempoBpm: songInput.tempoBpm ?? null,
      versionUrl: songInput.versionUrl?.trim() || '',
      chordUrl: songInput.chordUrl?.trim() || '',
      chordContent: songInput.chordContent || '',
      notes: songInput.notes || '',
      updatedAt: new Date().toISOString()
    };

    songs.push(newSong);
    songs.sort((a, b) => a.orderIndex - b.orderIndex);
    this.saveStorage(songs);
    return newSong;
  }

  async updateSong(id: string, updates: Partial<SongInput>): Promise<Song> {
    const songs = this.getStorage();
    const index = songs.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error(`Song with id ${id} not found`);
    }

    const current = songs[index];
    const updated: Song = {
      ...current,
      title: updates.title !== undefined ? updates.title.trim() : current.title,
      artist: updates.artist !== undefined ? updates.artist.trim() : current.artist,
      originalKey: updates.originalKey !== undefined ? updates.originalKey : current.originalKey,
      playKey: updates.playKey !== undefined ? updates.playKey : current.playKey,
      tempoBpm: updates.tempoBpm !== undefined ? updates.tempoBpm : current.tempoBpm,
      versionUrl: updates.versionUrl !== undefined ? updates.versionUrl.trim() : current.versionUrl,
      chordUrl: updates.chordUrl !== undefined ? updates.chordUrl.trim() : current.chordUrl,
      chordContent: updates.chordContent !== undefined ? updates.chordContent : current.chordContent,
      notes: updates.notes !== undefined ? updates.notes : current.notes,
      orderIndex: updates.orderIndex !== undefined ? updates.orderIndex : current.orderIndex,
      updatedAt: new Date().toISOString()
    };

    songs[index] = updated;
    songs.sort((a, b) => a.orderIndex - b.orderIndex);
    this.saveStorage(songs);
    return updated;
  }

  async deleteSong(id: string): Promise<void> {
    const songs = this.getStorage();
    const filtered = songs.filter(s => s.id !== id);
    const reindexed = filtered.map((song, index) => ({
      ...song,
      orderIndex: index
    }));
    this.saveStorage(reindexed);
  }

  async reorderSongs(orderedIds: string[]): Promise<void> {
    const songs = this.getStorage();
    const map = new Map(songs.map(s => [s.id, s]));

    const reordered: Song[] = [];
    orderedIds.forEach((id, index) => {
      const song = map.get(id);
      if (song) {
        reordered.push({
          ...song,
          orderIndex: index,
          updatedAt: new Date().toISOString()
        });
        map.delete(id);
      }
    });

    map.forEach(song => {
      reordered.push({
        ...song,
        orderIndex: reordered.length,
        updatedAt: new Date().toISOString()
      });
    });

    this.saveStorage(reordered);
  }

  async fetchChordFromDochord(url: string): Promise<string> {
    return `[Intro]\nC  G  Am  F\n\n[Verse 1]\nC               G\nคอร์ดจำลองสำหรับ: ${url}\nAm              F\nดึงผ่านระบบ Mock เพื่อการทดสอบ`;
  }
}
