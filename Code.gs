const SHEET_ID = "";

const SHEET = "messages";
function book() {
  return SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
}
function sh() {
  const ss = book();
  return ss.getSheetByName(SHEET) || ss.insertSheet(SHEET);
}
// Everyone's browser reads the last 7 days of messages from here.
function doGet() {
  const week = Date.now() - 7 * 864e5, out = [];
  sh().getDataRange().getValues().forEach(r => {
    try { const o = JSON.parse(r[0]); if (o.t > week) out.push(o); } catch (e) {}
  });
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}
// New messages arrive here. Basic size checks; the page also re-validates everything it reads.
function doPost(e) {
  try {
    const raw = e.postData.contents;
    if (raw.length > 40000) throw new Error("too big");
    const o = JSON.parse(raw);
    if (!o || typeof o.text !== "string" || o.text.length > 200 || String(o.name || "").length > 30) throw new Error("bad");
    sh().appendRow([JSON.stringify(o)]);
  } catch (err) {}
  return ContentService.createTextOutput("ok");
}
