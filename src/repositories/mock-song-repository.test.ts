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

  it('deletes a song by id', async () => {
    const initialSongs = await repository.getSongs();
    const targetId = initialSongs[0].id;

    await repository.deleteSong(targetId);

    const reloaded = await repository.getSongs();
    expect(reloaded.length).toBe(initialSongs.length - 1);
    expect(reloaded.find(s => s.id === targetId)).toBeUndefined();
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
