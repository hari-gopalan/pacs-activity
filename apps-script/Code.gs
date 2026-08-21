/**
 * PACS Kano — response store.
 *
 * Deploy this as a Web App (Deploy > New deployment > type: Web app,
 * execute as: Me, who has access: Anyone). Paste the resulting URL into
 * assets/config.js as APPS_SCRIPT_URL. See README.md for the full walkthrough.
 *
 * Sheet layout (auto-created on first request), tab "Responses":
 *   name | pin | status | timestamp | dataJSON
 * dataJSON holds the full submission (answers, executions, newFeatures,
 * pitchFeature, pitch, justification) as a JSON string, so the sheet stays
 * simple even though the assignment has several parts.
 */

// Must match INSTRUCTOR_PASSWORD in assets/config.js — required to clear all
// responses. Kept server-side too so the "clear everything" action can't be
// triggered just by knowing the client-side password is client-visible.
const SERVER_PASSWORD = 'harigopalan';
const SHEET_NAME = 'Responses';
const HEADERS = ['name', 'pin', 'status', 'timestamp', 'dataJSON'];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
  }
  return sheet;
}

function findRow_(sheet, name) {
  const data = sheet.getDataRange().getValues();
  const target = String(name).trim().toLowerCase();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === target) return i + 1; // 1-based row number
  }
  return -1;
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const action = e.parameter.action;
  if (action === 'list') {
    const sheet = getSheet_();
    const data = sheet.getDataRange().getValues();
    const responses = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue;
      let parsed = {};
      try { parsed = JSON.parse(row[4] || '{}'); } catch (err) { parsed = {}; }
      responses.push(Object.assign({}, parsed, {
        name: row[0],
        status: row[2],
        timestamp: row[3]
        // pin intentionally omitted
      }));
    }
    return jsonOut_({ ok: true, responses: responses });
  }
  return jsonOut_({ ok: false, error: 'unknown_action' });
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonOut_({ ok: false, error: 'bad_request' });
  }
  const action = body.action;
  const sheet = getSheet_();

  if (action === 'load') {
    const rowNum = findRow_(sheet, body.name);
    if (rowNum === -1) return jsonOut_({ ok: true, exists: false });
    const row = sheet.getRange(rowNum, 1, 1, 5).getValues()[0];
    if (String(row[1]) !== String(body.pin)) return jsonOut_({ ok: false, error: 'pin_mismatch' });
    let parsed = {};
    try { parsed = JSON.parse(row[4] || '{}'); } catch (err) { parsed = {}; }
    return jsonOut_({ ok: true, exists: true, data: parsed });
  }

  if (action === 'save') {
    const rowNum = findRow_(sheet, body.name);
    const now = new Date().toISOString();
    const dataJSON = JSON.stringify(body.data || {});
    if (rowNum === -1) {
      sheet.appendRow([body.name, body.pin, body.status || 'draft', now, dataJSON]);
    } else {
      const existingPin = String(sheet.getRange(rowNum, 2).getValue());
      if (existingPin !== String(body.pin)) return jsonOut_({ ok: false, error: 'pin_mismatch' });
      sheet.getRange(rowNum, 3, 1, 3).setValues([[body.status || 'draft', now, dataJSON]]);
    }
    return jsonOut_({ ok: true });
  }

  if (action === 'clearAll') {
    if (body.password !== SERVER_PASSWORD) return jsonOut_({ ok: false, error: 'bad_password' });
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, HEADERS.length).clearContent();
    return jsonOut_({ ok: true });
  }

  return jsonOut_({ ok: false, error: 'unknown_action' });
}
