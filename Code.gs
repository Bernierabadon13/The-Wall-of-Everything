// The Wall of Everything: shared storage + admin tools. No Google Sheet needed.

// 1) Choose a long secret phrase. Only you know it. Never put it in config.js or on GitHub.
const ADMIN_KEY = "CHANGE-ME-to-a-long-secret-phrase";
// 2) Optional: words to refuse (lower-case), for example ["badword1", "badword2"]
const BLOCKED = [];

const WEEK = 7 * 864e5, MAX_MSGS = 600;
function props_() { return PropertiesService.getScriptProperties(); }
function all_() {
  const p = props_().getProperties(), out = [];
  for (const k in p) {
    if (k.indexOf("m:") !== 0) continue;
    try { out.push({ k: k, o: JSON.parse(p[k]) }); } catch (e) {}
  }
  return out;
}
function json_(x) { return ContentService.createTextOutput(JSON.stringify(x)).setMimeType(ContentService.MimeType.JSON); }
function isAdmin_(e) {
  const ok = e && e.parameter && e.parameter.key === ADMIN_KEY && ADMIN_KEY.indexOf("CHANGE-ME") !== 0;
  if (!ok) Utilities.sleep(1500);            // slows down anyone guessing the key
  return ok;
}

const VERSION = 3;                           // open YOUR_LINK?action=ping : it must show {"v":3} when this version is live

function doGet(e) {
  const a = e && e.parameter && e.parameter.action;
  if (a === "ping") return json_({ v: VERSION });
  if (a === "list") {                         // admin: every message, newest first
    if (!isAdmin_(e)) return json_({ error: "denied" });
    return json_(all_().sort((x, y) => y.o.t - x.o.t).map(x => Object.assign({ _k: x.k }, x.o)));
  }
  if (a === "delete") {                       // admin: remove one message
    if (!isAdmin_(e)) return json_({ error: "denied" });
    const id = String(e.parameter.id || ""), k = String(e.parameter.k || ""); let n = 0;
    const lock = LockService.getScriptLock(); lock.waitLock(10000);
    try {
      all_().forEach(x => { if ((k && x.k === k) || (id && String(x.o.id) === id)) { props_().deleteProperty(x.k); n++; } });
    } finally { lock.releaseLock(); }
    return json_({ deleted: n, left: all_().length });
  }
  const since = Date.now() - WEEK;            // everyone: the last 7 days
  return json_(all_().filter(x => x.o.t > since).map(x => x.o));
}

function doPost(e) {
  try {
    const raw = e.postData.contents;
    if (raw.length > 8500) throw new Error("too big");
    const o = JSON.parse(raw);
    if (!o || typeof o.text !== "string" || o.text.length > 200 || String(o.name || "").length > 30 || !(o.t > 0)) throw new Error("bad");
    if (Math.abs(Date.now() - o.t) > 864e5) throw new Error("bad time");     // stops fake timestamps that would never expire
    const low = (o.text + " " + (o.name || "") + " " + (o.to || "")).toLowerCase();
    if (BLOCKED.some(w => w && low.indexOf(w) >= 0)) throw new Error("blocked");
    const lock = LockService.getScriptLock(); lock.waitLock(10000);
    try {
      const list = all_(), since = Date.now() - WEEK;
      list.filter(x => x.o.t < since).forEach(x => props_().deleteProperty(x.k));      // drop expired
      const keep = list.filter(x => x.o.t >= since).sort((a, b) => a.o.t - b.o.t);
      while (keep.length >= MAX_MSGS) props_().deleteProperty(keep.shift().k);          // drop oldest if full
      props_().setProperty("m:" + o.t + ":" + String(o.id || "").slice(0, 20), JSON.stringify(o));
    } finally { lock.releaseLock(); }
  } catch (err) {}
  return ContentService.createTextOutput("ok");
}
