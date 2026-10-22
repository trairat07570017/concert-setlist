# 02: Song Management & Reordering (Drag & Drop)

**What to build:** Complete song management allowing band members to edit existing song details (changing keys, notes, tempo, version links), delete songs with confirmation, and dynamically reorder songs using drag-and-drop or up/down arrow buttons with immediate persistence.

**Blocked by:** 01 (Core Domain, Repository Seam & Local Dev Scaffold)

**Status:** ready-for-agent

- [ ] "Edit Song" button opens a pre-filled form allowing updates to all song fields
- [ ] Saving an edited song updates the setlist view and repository state
- [ ] "Delete Song" button with confirmation prompt removes the song from the setlist
- [ ] Songs can be reordered via HTML5 drag-and-drop handles
- [ ] Mobile-friendly up/down buttons allow reordering songs on touch devices without drag capability
- [ ] Reordering updates `orderIndex` and persists to `SongRepository`
- [ ] Automated tests for reorder logic and edit/delete mutations
