import { SongRepository } from './song-repository';
import { MockSongRepository } from './mock-song-repository';
import { GasSongRepository } from './gas-song-repository';

let activeRepository: SongRepository | null = null;

export function getSongRepository(): SongRepository {
  if (!activeRepository) {
    const gasUrl = import.meta.env.VITE_GAS_API_URL;
    if (gasUrl && gasUrl.trim().length > 0) {
      console.log('Connecting to Google Apps Script Web App API:', gasUrl);
      activeRepository = new GasSongRepository(gasUrl);
    } else {
      activeRepository = new MockSongRepository();
    }
  }
  return activeRepository;
}

export * from './song-repository';
export * from './mock-song-repository';
export * from './gas-song-repository';
