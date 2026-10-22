# 02: Song Management & Reordering (Drag & Drop)

**What to build:** Complete song management allowing band members to edit existing song details (changing keys, notes, tempo, version links), delete songs with confirmation, and dynamically reorder songs using drag-and-drop or up/down arrow buttons with immediate persistence.

**Blocked by:** 01 (Core Domain, Repository Seam & Local Dev Scaffold)

**Status:** done

- [x] "Edit Song" button opens a pre-filled form allowing updates to all song fields
- [x] Saving an edited song updates the setlist view and repository state
- [x] "Delete Song" button with confirmation prompt removes the song from the setlist
- [x] Songs can be reordered via HTML5 drag-and-drop handles
- [x] Mobile-friendly up/down buttons allow reordering songs on touch devices without drag capability
- [x] Reordering updates `orderIndex` and persists to `SongRepository`
- [x] Automated tests for reorder logic and edit/delete mutations
