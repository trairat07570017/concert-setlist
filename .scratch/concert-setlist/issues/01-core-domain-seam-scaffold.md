# 01: Core Domain, Repository Seam & Local Dev Scaffold

**What to build:** A runnable Vite + React + Tailwind CSS web application containing the core Setlist domain model and a `SongRepository` seam. Out of the box, with zero configuration or live backend connection, band members and developers can open the app, see preloaded sample songs in the setlist (title, artist, original key, performance key, tempo BPM, and notes), and submit a new song to the setlist which persists to browser LocalStorage.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Running `npm install && npm run dev` launches the Vite dev server with zero warnings or errors
- [x] Setlist view displays song title, artist, original key, performance key badge, tempo (BPM), and performance notes
- [x] Clean architectural layout adhering to Deep Modules principles (`src/domain`, `src/repositories`, `src/modules`, `src/components/ui`)
- [x] `SongRepository` interface with `MockSongRepository` implementation persisting to `localStorage`
- [x] "Add Song" modal/form allows entering title, artist, original key, play key, tempo, version link, and notes
- [x] Adding a song updates the view immediately and persists on page reload
- [x] Automated contract tests verifying `SongRepository` and domain operations
