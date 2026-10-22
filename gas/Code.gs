/**
 * Concert Setlist - Google Apps Script Backend Web App
 * 
 * Acts as the serverless REST API connected to Google Sheets.
 * Deploy as a Web App:
 *  - Execute as: "Me"
 *  - Who has access: "Anyone"
 */

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
  const ss = SpreadsheetApp.getActiveSpreadsheet();
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

function doGet(e) {
  try {
    const action = e && e.parameter ? e.parameter.action : 'get_songs';

    if (action === 'get_songs') {
      const sheet = getOrCreateSheet();
      const lastRow = sheet.getLastRow();
      if (lastRow <= 1) {
        return jsonResponse({ success: true, songs: [] });
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

      return jsonResponse({ success: true, songs: songs });
    }

    if (action === 'fetch_dochord') {
      const url = e.parameter.url;
      if (!url) {
        return jsonResponse({ success: false, error: 'Missing url parameter' });
      }

      const chordContent = scrapeDochord(url);
      return jsonResponse({ success: true, chordContent: chordContent });
    }

    return jsonResponse({ success: true, message: 'Concert Setlist GAS API is running' });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ success: false, error: 'No post data' });
    }

    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const sheet = getOrCreateSheet();

    if (action === 'add_song') {
      const song = payload.song;
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
      return jsonResponse({
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
      });
    }

    if (action === 'update_song') {
      const id = payload.id;
      const updates = payload.updates;
      const lastRow = sheet.getLastRow();
      if (lastRow <= 1) {
        return jsonResponse({ success: false, error: 'Song not found' });
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
        return jsonResponse({ success: false, error: 'Song not found with id ' + id });
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
      return jsonResponse({ success: true, updated: true });
    }

    if (action === 'delete_song') {
      const id = payload.id;
      const lastRow = sheet.getLastRow();
      if (lastRow <= 1) return jsonResponse({ success: true });

      const idValues = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (let i = 0; i < idValues.length; i++) {
        if (String(idValues[i][0]) === String(id)) {
          sheet.deleteRow(i + 2);
          break;
        }
      }
      return jsonResponse({ success: true, deleted: true });
    }

    if (action === 'reorder_songs') {
      const orderedIds = payload.orderedIds || [];
      const lastRow = sheet.getLastRow();
      if (lastRow <= 1) return jsonResponse({ success: true });

      const values = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
      const map = {};
      for (let i = 0; i < values.length; i++) {
        map[String(values[i][0])] = values[i];
      }

      const updatedRows = [];
      for (let j = 0; j < orderedIds.length; j++) {
        const row = map[String(orderedIds[j])];
        if (row) {
          row[1] = j; // update orderIndex
          row[11] = new Date().toISOString();
          updatedRows.push(row);
          delete map[String(orderedIds[j])];
        }
      }

      // Append any remaining
      for (let remainingId in map) {
        const remRow = map[remainingId];
        remRow[1] = updatedRows.length;
        remRow[11] = new Date().toISOString();
        updatedRows.push(remRow);
      }

      if (updatedRows.length > 0) {
        sheet.getRange(2, 1, updatedRows.length, HEADERS.length).setValues(updatedRows);
      }

      return jsonResponse({ success: true, reordered: true });
    }

    return jsonResponse({ success: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * Scrapes DoChord page and strips HTML down to text/pre chords
 */
function scrapeDochord(url) {
  try {
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = response.getContentText();
    
    // Look for <pre> tag which Dochord uses to store chord diagrams & lyrics
    const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
    if (preMatch && preMatch[1]) {
      let content = preMatch[1];
      // Strip remaining HTML tags
      content = content.replace(/<[^>]+>/g, '');
      // Decode HTML entities
      content = content.replace(/&amp;/g, '&')
                       .replace(/&lt;/g, '<')
                       .replace(/&gt;/g, '>')
                       .replace(/&quot;/g, '"')
                       .replace(/&#039;/g, "'");
      return content.trim();
    }

    return 'ไม่สามารถสกัดคอร์ดจากหน้าเว็บได้ กรุณาคัดลอกคอร์ดมาวางด้วยตนเอง';
  } catch (err) {
    return 'เกิดข้อผิดพลาดในการดึงข้อมูลจาก DoChord: ' + err.toString();
  }
}
