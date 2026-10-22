import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GasSongRepository } from './gas-song-repository';

describe('GasSongRepository', () => {
  const apiUrl = 'https://script.google.com/macros/s/TEST/exec';
  let repository: GasSongRepository;

  beforeEach(() => {
    repository = new GasSongRepository(apiUrl);
    vi.restoreAllMocks();
  });

  it('fetches songs via GET with action=get_songs', async () => {
    const mockSongs = [
      {
        id: 's1',
        orderIndex: 0,
        title: 'Song 1',
        artist: 'Artist 1',
        originalKey: 'C',
        playKey: 'D',
        tempoBpm: 120,
        versionUrl: '',
        chordUrl: '',
        chordContent: '',
        notes: '',
        updatedAt: '2026-10-22T00:00:00.000Z'
      }
    ];

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, songs: mockSongs })
    } as Response);

    const songs = await repository.getSongs();
    expect(globalThis.fetch).toHaveBeenCalledWith(`${apiUrl}?action=get_songs`, {
      redirect: 'follow'
    });
    expect(songs).toEqual(mockSongs);
  });

  it('saves song via GET with action=add_song&payload=...', async () => {
    const newSong = {
      id: 's2',
      orderIndex: 1,
      title: 'New Song',
      artist: 'Artist',
      originalKey: 'G',
      playKey: 'G',
      tempoBpm: 100,
      versionUrl: '',
      chordUrl: '',
      chordContent: '',
      notes: '',
      updatedAt: '2026-10-22T00:00:00.000Z'
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, song: newSong })
    } as Response);

    const result = await repository.saveSong(newSong);
    const expectedPayload = encodeURIComponent(JSON.stringify({ song: newSong }));
    expect(globalThis.fetch).toHaveBeenCalledWith(`${apiUrl}?action=add_song&payload=${expectedPayload}`, {
      redirect: 'follow'
    });
    expect(result).toEqual(newSong);
  });

  it('deletes song via GET with action=delete_song&id=...', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, deleted: true })
    } as Response);

    await repository.deleteSong('s1');
    expect(globalThis.fetch).toHaveBeenCalledWith(`${apiUrl}?action=delete_song&id=s1`, {
      redirect: 'follow'
    });
  });

  it('reorders songs via GET with action=reorder_songs&payload=...', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, reordered: true })
    } as Response);

    await repository.reorderSongs(['s2', 's1']);
    const expectedPayload = encodeURIComponent(JSON.stringify({ orderedIds: ['s2', 's1'] }));
    expect(globalThis.fetch).toHaveBeenCalledWith(`${apiUrl}?action=reorder_songs&payload=${expectedPayload}`, {
      redirect: 'follow'
    });
  });

  it('fetches dochord content via GET with action=fetch_dochord', async () => {
    const mockChord = '[Intro]\nC G Am F';
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, chordContent: mockChord })
    } as Response);

    const result = await repository.fetchChordFromDochord('https://www.dochord.com/123/');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${apiUrl}?action=fetch_dochord&url=${encodeURIComponent('https://www.dochord.com/123/')}`,
      { redirect: 'follow' }
    );
    expect(result).toBe(mockChord);
  });
});
