const SPREADSHEET_ID = '17jR8HlBPi4AL6o6gmvIR_f1GkRthVCY79hR04N2bdwA';

const HEADERS = [
  'id',
  'order_index',
  'title',
  'artist',
  'original_key',
  'play_key',
  'tempo_bpm',
  'version_url',
  'chord_url',
  'chord_content',
  'notes',
  'updated_at'
];

function getOrCreateSheet() {
  let ss = null;

  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== '') {
    try {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID.trim());
    } catch (e) {
      Logger.log('Could not open by ID: ' + e);
    }
  }

  if (!ss) {
    try {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    } catch (e) {
      Logger.log('No active spreadsheet: ' + e);
    }
  }

  if (!ss) {
    throw new Error('ไม่พบ Google Sheet: กรุณาตรวจสอบสิทธิ์การเข้าถึงหรือ SPREADSHEET_ID');
  }

  let sheet = ss.getSheetByName('Setlist');
  if (!sheet) {
    sheet = ss.getSheets()[0];
    sheet.setName('Setlist');
  }

  // Check if header row exists
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#f3f4f6');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleGetSongs(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return { success: true, songs: [] };
  }

  const values = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  const songs = values.map(function(row) {
    return {
      id: String(row[0] || ''),
      orderIndex: Number(row[1] || 0),
      title: String(row[2] || ''),
      artist: String(row[3] || ''),
      originalKey: String(row[4] || 'C'),
      playKey: String(row[5] || 'C'),
      tempoBpm: row[6] ? Number(row[6]) : null,
      versionUrl: String(row[7] || ''),
      chordUrl: String(row[8] || ''),
      chordContent: String(row[9] || ''),
      notes: String(row[10] || ''),
      updatedAt: String(row[11] || new Date().toISOString())
    };
  }).filter(function(s) {
    return s.id !== '';
  });

  songs.sort(function(a, b) {
    return a.orderIndex - b.orderIndex;
  });

  return { success: true, songs: songs };
}

function handleAddSong(sheet, song) {
  const lastRow = sheet.getLastRow();
  const nextIndex = lastRow <= 1 ? 0 : lastRow - 1;

  const newId = song.id || ('song-' + new Date().getTime() + '-' + Math.random().toString(36).substring(2, 7));
  const rowData = [
    newId,
    song.orderIndex !== undefined ? song.orderIndex : nextIndex,
    song.title || '',
    song.artist || '',
    song.originalKey || 'C',
    song.playKey || song.originalKey || 'C',
    song.tempoBpm || '',
    song.versionUrl || '',
    song.chordUrl || '',
    song.chordContent || '',
    song.notes || '',
    new Date().toISOString()
  ];

  sheet.appendRow(rowData);
  return {
    success: true,
    song: {
      id: newId,
      orderIndex: rowData[1],
      title: rowData[2],
      artist: rowData[3],
      originalKey: rowData[4],
      playKey: rowData[5],
      tempoBpm: rowData[6] ? Number(rowData[6]) : null,
      versionUrl: rowData[7],
      chordUrl: rowData[8],
      chordContent: rowData[9],
      notes: rowData[10],
      updatedAt: rowData[11]
    }
  };
}

function handleUpdateSong(sheet, id, updates) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return { success: false, error: 'Song not found' };
  }

  const idValues = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  let targetRowIndex = -1;
  for (let i = 0; i < idValues.length; i++) {
    if (String(idValues[i][0]) === String(id)) {
      targetRowIndex = i + 2;
      break;
    }
  }

  if (targetRowIndex === -1) {
    return { success: false, error: 'Song not found with id ' + id };
  }

  const currentRow = sheet.getRange(targetRowIndex, 1, 1, HEADERS.length).getValues()[0];

  if (updates.orderIndex !== undefined) currentRow[1] = updates.orderIndex;
  if (updates.title !== undefined) currentRow[2] = updates.title;
  if (updates.artist !== undefined) currentRow[3] = updates.artist;
  if (updates.originalKey !== undefined) currentRow[4] = updates.originalKey;
  if (updates.playKey !== undefined) currentRow[5] = updates.playKey;
  if (updates.tempoBpm !== undefined) currentRow[6] = updates.tempoBpm || '';
  if (updates.versionUrl !== undefined) currentRow[7] = updates.versionUrl;
  if (updates.chordUrl !== undefined) currentRow[8] = updates.chordUrl;
  if (updates.chordContent !== undefined) currentRow[9] = updates.chordContent;
  if (updates.notes !== undefined) currentRow[10] = updates.notes;
  currentRow[11] = new Date().toISOString();

  sheet.getRange(targetRowIndex, 1, 1, HEADERS.length).setValues([currentRow]);
  return { success: true, updated: true };
}

function handleDeleteSong(sheet, id) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { success: true };

  const idValues = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < idValues.length; i++) {
    if (String(idValues[i][0]) === String(id)) {
      sheet.deleteRow(i + 2);
      break;
    }
  }
  return { success: true, deleted: true };
}

function handleReorderSongs(sheet, orderedIds) {
  orderedIds = orderedIds || [];
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { success: true };

  const values = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  const map = {};
  for (let i = 0; i < values.length; i++) {
    map[String(values[i][0])] = values[i];
  }

  const updatedRows = [];
  for (let j = 0; j < orderedIds.length; j++) {
    const row = map[String(orderedIds[j])];
    if (row) {
      row[1] = j;
      row[11] = new Date().toISOString();
      updatedRows.push(row);
      delete map[String(orderedIds[j])];
    }
  }

  for (let remainingId in map) {
    const remRow = map[remainingId];
    remRow[1] = updatedRows.length;
    remRow[11] = new Date().toISOString();
    updatedRows.push(remRow);
  }

  if (updatedRows.length > 0) {
    sheet.getRange(2, 1, updatedRows.length, HEADERS.length).setValues(updatedRows);
  }

  return { success: true, reordered: true };
}

/**
 * Handles GET requests:
 * Supports querying and lightweight mutations to avoid Google 302 echo redirect 404 bugs!
 */
function doGet(e) {
  try {
    const action = e && e.parameter ? e.parameter.action : 'get_songs';
    const sheet = getOrCreateSheet();

    if (action === 'get_songs') {
      return jsonResponse(handleGetSongs(sheet));
    }

    if (action === 'add_song') {
      const payload = JSON.parse(e.parameter.payload || '{}');
      return jsonResponse(handleAddSong(sheet, payload.song || payload));
    }

    if (action === 'update_song') {
      const payload = JSON.parse(e.parameter.payload || '{}');
      return jsonResponse(handleUpdateSong(sheet, payload.id || e.parameter.id, payload.updates || payload));
    }

    if (action === 'delete_song') {
      const id = e.parameter.id || (e.parameter.payload ? JSON.parse(e.parameter.payload).id : null);
      return jsonResponse(handleDeleteSong(sheet, id));
    }

    if (action === 'reorder_songs') {
      const payload = JSON.parse(e.parameter.payload || '{}');
      return jsonResponse(handleReorderSongs(sheet, payload.orderedIds || []));
    }

    if (action === 'fetch_dochord' || action === 'fetch_chord') {
      const url = e.parameter.url;
      if (!url) {
        return jsonResponse({ success: false, error: 'Missing url parameter' });
      }
      const result = scrapeChordFromUrl(url);
      return jsonResponse(result);
    }

    return jsonResponse({ success: true, message: 'Concert Setlist GAS API is running' });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * Handles POST requests as fallback
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ success: false, error: 'No post data' });
    }

    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const sheet = getOrCreateSheet();

    if (action === 'add_song') {
      return jsonResponse(handleAddSong(sheet, payload.song));
    }
    if (action === 'update_song') {
      return jsonResponse(handleUpdateSong(sheet, payload.id, payload.updates));
    }
    if (action === 'delete_song') {
      return jsonResponse(handleDeleteSong(sheet, payload.id));
    }
    if (action === 'reorder_songs') {
      return jsonResponse(handleReorderSongs(sheet, payload.orderedIds));
    }

    return jsonResponse({ success: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

var THAI_COMBINING_REGEX = /[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/g;

function getVisualLength(str) {
  return str.replace(THAI_COMBINING_REGEX, '').length;
}

function parseChordzaa(html) {
  var liveMatch = html.match(/<div id="live">([\s\S]*?)<\/div>\s*<script>/i);
  if (!liveMatch) {
    var colMatch = html.match(/<div id="column_1">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/i);
    if (!colMatch) return null;
    liveMatch = [null, colMatch[1]];
  }

  var liveContent = liveMatch[1];

  // Replace <span class="c2">CHORD</span> with [CHORD]
  var text = liveContent.replace(/<span[^>]*class=["']c2["'][^>]*>(.*?)<\/span>/gi, '[$1]');

  // Replace section headers <span class="c1">...</span> with plain text
  text = text.replace(/<span[^>]*class=["']c1["'][^>]*>([\s\S]*?)<\/span>/gi, function(m, p1) {
    return p1.replace(/&nbsp;/g, ' ');
  });

  // Replace <br /> and <br> with newlines
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // Remove other HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Clean HTML entities
  text = text.replace(/&nbsp;/g, ' ')
             .replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&#039;/g, "'")
             .replace(/&quot;/g, '"');

  text = text.replace(/\r/g, '');
  var lines = text.split('\n');
  var formattedLines = [];

  for (var k = 0; k < lines.length; k++) {
    var rawLine = lines[k];
    var line = rawLine.trimEnd();
    var trimmed = line.trim();
    if (!trimmed) {
      formattedLines.push('');
      continue;
    }

    // Check if line is intro, outro, instru, or contains bars "|"
    var isBarLine = trimmed.startsWith('|') || trimmed.includes(' : |') || trimmed.includes(': |');
    if (!line.includes('[') || isBarLine) {
      formattedLines.push(line.replace(/\[([A-G][^\]]*)\]/g, '$1'));
      continue;
    }

    // Convert inline [CHORD] to 2 lines: chordLine above, lyricLine below
    var chordLine = '';
    var lyricLine = '';
    var visualLen = 0;
    var i = 0;

    while (i < line.length) {
      if (line[i] === '[' && line.indexOf(']', i) !== -1) {
        var closeIdx = line.indexOf(']', i);
        var chord = line.substring(i + 1, closeIdx);
        var chordVisualLen = getVisualLength(chordLine);

        if (chordVisualLen < visualLen) {
          while (getVisualLength(chordLine) < visualLen) {
            chordLine += ' ';
          }
        } else if (chordVisualLen > visualLen && chordLine.length > 0) {
          chordLine += ' ';
        }
        chordLine += chord;
        i = closeIdx + 1;
      } else {
        var ch = line[i];
        lyricLine += ch;
        if (!THAI_COMBINING_REGEX.test(ch)) {
          visualLen++;
        }
        THAI_COMBINING_REGEX.lastIndex = 0;
        i++;
      }
    }

    if (chordLine.trim().length > 0) {
      formattedLines.push(chordLine);
    }
    if (lyricLine.trim().length > 0) {
      formattedLines.push(lyricLine);
    }
  }

  return formattedLines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function scrapeChordFromUrl(url) {
  try {
    var response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    var code = response.getResponseCode();
    var html = response.getContentText();

    // 1. Check if it is Chordzaa (handles both /easy-chord/ and standard URLs)
    if (url.indexOf('chordzaa.com') !== -1) {
      var chordzaaContent = parseChordzaa(html);
      if (chordzaaContent && chordzaaContent.length > 20) {
        return { success: true, chordContent: chordzaaContent };
      }
    }

    // 2. Check Cloudflare or bot challenge protection (DoChord)
    if (code === 403 || html.indexOf('challenges.cloudflare.com') !== -1 || html.indexOf('Just a moment...') !== -1) {
      return {
        success: false,
        isBlocked: true,
        error: 'เว็บนี้มีระบบป้องกันบอท (Cloudflare) แนะนำให้ใช้ลิงก์จากเว็บ Chordzaa (chordzaa.com) หรือเปิดหน้าเว็บแล้วคัดลอกคอร์ดมาวางครับ'
      };
    }

    // 3. Try finding chords in <pre> tag (DoChord or standard sites)
    var preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
    if (preMatch && preMatch[1]) {
      var content = preMatch[1];
      content = content.replace(/<[^>]+>/g, '');
      content = content.replace(/&amp;/g, '&')
                       .replace(/&lt;/g, '<')
                       .replace(/&gt;/g, '>')
                       .replace(/&quot;/g, '"')
                       .replace(/&#039;/g, "'");
      return { success: true, chordContent: content.trim() };
    }

    // 4. Fallback: check <div class="entry-content"> or similar chord containers
    var divMatch = html.match(/<div[^>]*class=["'][^"']*(?:chord_content|entry-content|content-chord)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
    if (divMatch && divMatch[1]) {
      var content2 = divMatch[1].replace(/<br\s*\/?>/gi, '\n');
      content2 = content2.replace(/<[^>]+>/g, '');
      content2 = content2.replace(/&amp;/g, '&')
                         .replace(/&lt;/g, '<')
                         .replace(/&gt;/g, '>')
                         .replace(/&quot;/g, '"')
                         .replace(/&#039;/g, "'");
      return { success: true, chordContent: content2.trim() };
    }

    return {
      success: false,
      isBlocked: false,
      error: 'ไม่สามารถสกัดคอร์ดจากหน้าเว็บนี้ได้ แนะนำให้ใส่ลิงก์จาก Chordzaa หรือวางคอร์ดด้วยตนเอง'
    };
  } catch (err) {
    return {
      success: false,
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลจากเว็บ: ' + err.toString()
    };
  }
}
