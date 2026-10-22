# 03: Google Apps Script Backend & Sheets Integration

**What to build:** The serverless Google Apps Script code (`gas/Code.gs`) providing a REST JSON Web App API to Google Sheets for CRUD and reordering operations, paired with a frontend `GasSongRepository` adapter. When `VITE_GAS_API_URL` is set in `.env`, the app seamlessly talks to Google Sheets without UI code changes; when unset, it falls back to LocalStorage.

**Blocked by:** 01 (Core Domain, Repository Seam & Local Dev Scaffold)

**Status:** ready-for-agent

- [ ] Complete `gas/Code.gs` script implementing `doGet` and `doPost` with CORS support and JSON responses
- [ ] Auto-initialization of Google Sheet headers (`id`, `order_index`, `title`, `artist`, `original_key`, `play_key`, `tempo_bpm`, `version_url`, `chord_url`, `chord_content`, `notes`, `updated_at`) if sheet is blank
- [ ] Frontend `GasSongRepository` implementing `SongRepository` interface communicating with the GAS Web App
- [ ] Handling of GAS 302 redirects in fetch calls with transparent error messaging
- [ ] Factory function `createSongRepository()` switching between Mock and GAS repository based on environment configuration
- [ ] Clear step-by-step documentation (`gas/README.md`) on how to deploy the Apps Script Web App and link the Google Sheet
