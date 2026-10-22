import { SongRepository } from './song-repository';
import { MockSongRepository } from './mock-song-repository';

let activeRepository: SongRepository | null = null;

export function getSongRepository(): SongRepository {
  if (!activeRepository) {
    const gasUrl = import.meta.env.VITE_GAS_API_URL;
    if (gasUrl && gasUrl.trim().length > 0) {
      // Lazy or direct load GasSongRepository once configured
      // For now fallback to mock until Ticket 03 wires up GAS
      console.log('Connecting to Google Apps Script Web App API:', gasUrl);
    }
    activeRepository = new MockSongRepository();
  }
  return activeRepository;
}

export * from './song-repository';
export * from './mock-song-repository';
