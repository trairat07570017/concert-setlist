import { describe, it, expect, beforeEach } from 'vitest';
import { MockSongRepository, MemoryStorage } from './mock-song-repository';

describe('MockSongRepository', () => {
  let repository: MockSongRepository;
  let memoryStorage: MemoryStorage;

  beforeEach(() => {
    memoryStorage = new MemoryStorage();
    repository = new MockSongRepository(memoryStorage);
  });

  it('initializes with seed songs when storage is empty', async () => {
    const songs = await repository.getSongs();
    expect(songs.length).toBeGreaterThan(0);
    expect(songs[0]).toHaveProperty('title');
    expect(songs[0]).toHaveProperty('playKey');
  });

  it('saves a new song and persists it in order', async () => {
    const initialSongs = await repository.getSongs();
    const newSong = await repository.saveSong({
      title: 'ใจสั่งมา',
      artist: 'Loso',
      originalKey: 'G',
      playKey: 'A',
      tempoBpm: 75,
      versionUrl: 'https://www.youtube.com/watch?v=example',
      chordUrl: '',
      chordContent: '',
      notes: 'Solo ท้ายยาว 2 รอบ'
    });

    expect(newSong.id).toBeDefined();
    expect(newSong.title).toBe('ใจสั่งมา');
    expect(newSong.orderIndex).toBe(initialSongs.length);

    const updatedSongs = await repository.getSongs();
    expect(updatedSongs.length).toBe(initialSongs.length + 1);
    expect(updatedSongs[updatedSongs.length - 1].id).toBe(newSong.id);
  });

  it('updates an existing song', async () => {
    const songs = await repository.getSongs();
    const targetSong = songs[0];

    const updated = await repository.updateSong(targetSong.id, {
      playKey: 'Em',
      notes: 'เปลี่ยนคีย์เป็น Em'
    });

    expect(updated.playKey).toBe('Em');
    expect(updated.notes).toBe('เปลี่ยนคีย์เป็น Em');
    expect(updated.title).toBe(targetSong.title);

    const reloaded = await repository.getSongs();
    expect(reloaded[0].playKey).toBe('Em');
  });

  it('deletes a song by id and re-indexes remaining songs sequentially', async () => {
    const initialSongs = await repository.getSongs();
    expect(initialSongs.length).toBeGreaterThanOrEqual(3);
    const middleSongId = initialSongs[1].id;

    await repository.deleteSong(middleSongId);

    const reloaded = await repository.getSongs();
    expect(reloaded.length).toBe(initialSongs.length - 1);
    expect(reloaded.find(s => s.id === middleSongId)).toBeUndefined();
    // Verify contiguous zero-based indices
    reloaded.forEach((song, idx) => {
      expect(song.orderIndex).toBe(idx);
    });
  });

  it('moves a song up and down correctly', async () => {
    const songs = await repository.getSongs();
    const [song0, song1, song2] = songs;

    // Swap index 1 with index 0 (move up)
    await repository.reorderSongs([song1.id, song0.id, song2.id]);
    const afterMoveUp = await repository.getSongs();
    expect(afterMoveUp[0].id).toBe(song1.id);
    expect(afterMoveUp[1].id).toBe(song0.id);
    expect(afterMoveUp[0].orderIndex).toBe(0);
    expect(afterMoveUp[1].orderIndex).toBe(1);

    // Swap index 0 with index 2 (move down)
    await repository.reorderSongs([song0.id, song2.id, song1.id]);
    const afterMoveDown = await repository.getSongs();
    expect(afterMoveDown[0].id).toBe(song0.id);
    expect(afterMoveDown[1].id).toBe(song2.id);
    expect(afterMoveDown[2].id).toBe(song1.id);
  });

  it('reorders songs based on given id sequence', async () => {
    const songs = await repository.getSongs();
    expect(songs.length).toBeGreaterThanOrEqual(2);

    const reversedIds = [...songs].reverse().map(s => s.id);
    await repository.reorderSongs(reversedIds);

    const reordered = await repository.getSongs();
    expect(reordered.map(s => s.id)).toEqual(reversedIds);
    expect(reordered[0].orderIndex).toBe(0);
    expect(reordered[1].orderIndex).toBe(1);
  });
});
