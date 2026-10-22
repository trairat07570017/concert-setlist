# Concert Setlist

A web application for band members to collaborate on a concert setlist, track song versions, performance keys, and view chords/stage reference during rehearsals and live gigs.

## Language

**Setlist**:
The ordered collection of songs to be rehearsed and performed for a concert.
_Avoid_: Playlist, tracklist, song queue

**Song**:
A musical piece within a Setlist, containing metadata such as title, artist, key, tempo, reference link, and chord sheet reference.
_Avoid_: Track, item

**Performance Key**:
The musical key the band actually plays the song in, which may differ from the original recording's key.
_Avoid_: Tonality, scale, song pitch

**Stage Mode**:
A high-contrast, distraction-free view designed for tablets and mobile devices on stage or music stands.
_Avoid_: Live view, performance screen

**Chord Sheet**:
Lyrics with harmonic chord notations above the text, retrieved or linked for a song.
_Avoid_: Tab, sheet music, lead sheet

**Transposition**:
Shifting chord notations by semitones to match the Performance Key from the original key.
_Avoid_: Key change, pitch shift

**DoChord Proxy**:
The Google Apps Script serverless fetcher that retrieves chord HTML from DoChord bypassing browser CORS restrictions.
_Avoid_: Scraper backend, crawler
