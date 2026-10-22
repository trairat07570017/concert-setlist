# Spec: Concert Setlist Web Application

Status: ready-for-agent

## Problem Statement

A music band preparing for a concert needs an easy, centralized way to manage their song list. During rehearsals and live gigs, members frequently get confused about which version/arrangement of a song they are playing, what key the band has decided to perform it in (which often differs from the original artist's recording), and what the lyrics or chords are. Currently, they have no shared system, and existing tools are either overly complicated, require accounts/logins, or don't support instant stage-friendly chord views and link references.

## Solution

A responsive, lightweight web application hosted on GitHub Pages with Google Sheets as its serverless database (powered by Google Apps Script). Anyone in the band with the web link can instantly:
- View the real-time ordered Setlist.
- Add, edit, remove, and drag-and-drop reorder songs.
- Set the Song title, artist, original key, band's Performance Key, tempo (BPM), and reference link (e.g., YouTube/Spotify).
- Fetch chord sheets from dochord.com via Google Apps Script CORS proxy or paste/edit custom chords.
- Switch to a distraction-free "Stage Mode" optimized for mobile/tablet music stands.
- Work offline or in local development with zero setup via an in-memory/LocalStorage mock adapter.

## User Stories

1. As a band member, I want to view the list of songs in the current Setlist, so that I know what songs we are playing for the concert.
2. As a band member, I want to see the Performance Key alongside the original key for each song, so that I instantly know the transposed key the band agreed upon.
3. As a band member, I want to see the tempo (BPM) of each song, so that the drummer and rhythm section can set their metronome accurately.
4. As a band member, I want to click on a reference link (e.g. YouTube/Spotify), so that I can listen to the specific arrangement or version we are practicing.
5. As a band member, I want to add a new song to the Setlist with title, artist, keys, tempo, and notes, so that we can expand our repertoire.
6. As a band member, I want to edit existing song details (such as changing the key or notes), so that the setlist stays up to date after rehearsal decisions.
7. As a band member, I want to remove a song from the Setlist, so that we can cut songs that didn't make the final show.
8. As a band member, I want to drag and drop songs or click up/down buttons to reorder them, so that the running order matches our concert flow.
9. As a band member, I want to input a DoChord URL for a song and have the app automatically fetch the chords and lyrics, so that I don't have to manually retype them.
10. As a band member, I want to edit and save the fetched chord sheet, so that I can fix chord mistakes, customize bridge chords, or add instrumental cue notes.
11. As a band member, I want to transpose chords up or down by semitones within the chord viewer, so that the chords match our chosen Performance Key.
12. As a band member, I want to activate Stage Mode, so that I get a high-contrast, large-font view of the setlist and song chords that is easy to read while standing on stage.
13. As a band member, I want to auto-scroll the chord sheet during Stage Mode, so that I can play hands-free without touching my tablet screen.
14. As a developer/AI, I want to clone the repository and run `npm run dev` with zero setup or credentials, so that I can preview, test, and develop features without needing internet or live Google Sheets access.
15. As a band administrator, I want changes made in the web app to persist directly to Google Sheets, so that I have a transparent, human-readable spreadsheet backup of the setlist.

## Implementation Decisions

- **Architecture Shape**: React + Vite SPA deployed on GitHub Pages with Google Apps Script Web App providing JSON endpoints to Google Sheets.
- **Repository Seam**: All data mutations and queries must go through a single `SongRepository` interface. Two adapters satisfy this seam:
  - `MockSongRepository`: Uses browser LocalStorage and preloaded sample songs with simulated DoChord parsing. Active when `VITE_GAS_API_URL` is omitted or empty.
  - `GasSongRepository`: Sends HTTP POST/GET requests to the GAS Web App URL with `mode: 'cors'`, handling GAS 302 redirects properly. Active when `VITE_GAS_API_URL` is provided.
- **Backend Service (GAS)**:
  - Deployed as a Google Apps Script Web App with access set to "Anyone" (no OAuth required for band members).
  - Handles `GET` for fetching setlist and scraping DoChord (`action=get_songs`, `action=fetch_dochord`).
  - Handles `POST` for mutations (`action=add_song`, `action=update_song`, `action=delete_song`, `action=reorder_songs`).
- **DoChord Proxy & Parsing**:
  - Implemented in GAS via `UrlFetchApp.fetch(url)` to circumvent browser CORS restrictions.
  - Extracts chord and lyric containers from the HTML, stripping unwanted navigation, ads, and footers.
- **Domain Models & Invariants**:
  - `Song`: immutable ID (string UUID), `orderIndex` (number), `title` (string), `artist` (string), `originalKey` (string), `playKey` (string), `tempoBpm` (number | null), `versionUrl` (string), `chordUrl` (string), `chordContent` (string), `notes` (string), `updatedAt` (string).
  - Transposition logic pure function: `transposeChords(text: string, semitones: number): string`.
- **UI & Interaction**:
  - Tailwind CSS for responsive styling, dark mode, and high-contrast stage view.
  - Accessible dialog modal for adding/editing songs.
  - Slide-over or modal for viewing and transposing chords.

## Testing Decisions

- Test only external behavior through the `SongRepository` seam and pure domain functions.
- Unit test suite for `transposeChords` verifying sharp/flat transpositions across musical intervals (e.g., C to D, G to Bb).
- Integration test for `SongRepository` contract ensuring both Mock and API adapters satisfy expected CRUD invariants.
- Component tests for Setlist ordering and Stage Mode toggle.

## Out of Scope

- Multi-user authentication / personal user accounts (all users share public access as agreed in Q2).
- Multiple concurrent concerts / multi-gig management (deferred to future milestone as decided in Q1).
- Real-time WebSockets synchronization (polling or manual refresh on load is sufficient for rehearsal use).
- Native mobile app store releases (PWA / responsive web via GitHub Pages is used instead).

## Further Notes

- The project should include a `gas/Code.gs` file containing the ready-to-deploy Google Apps Script backend code with step-by-step instructions on setting up the Google Sheet.
