# 04: DoChord Proxy & Transposable Chord Sheet Viewer

**What to build:** Band members can paste a DoChord song link and click "Fetch Chords", which retrieves and cleans chord and lyric text via the GAS CORS proxy (or sample parser in mock mode). The chord sheet can be inspected in an accessible modal/drawer, edited by the user, saved to the song, and transposed up or down by semitones in real time to match the band's Performance Key.

**Blocked by:** 01 (Core Domain, Repository Seam & Local Dev Scaffold), 03 (Google Apps Script Backend & Sheets Integration)

**Status:** ready-for-agent

- [ ] GAS `fetch_dochord` action uses `UrlFetchApp` to scrape DoChord song page and extract the `<pre>` / chord content without ads or HTML boilerplate
- [ ] Mock repository supports parsing or returning realistic chord sheets for testing without network calls
- [ ] Chord sheet modal / drawer component presenting chords above lyrics in monospaced format
- [ ] In-place editor allowing band members to edit or type custom chord charts and notes
- [ ] Musical transposition engine (`transposeChords`) correctly transposing chords across musical keys (C, C#, D, Eb, etc.)
- [ ] Key change indicator showing transposed key difference from original
- [ ] Unit tests for transposition engine covering major, minor, 7th, slash chords, and enharmonics (e.g., F# / Gb)
