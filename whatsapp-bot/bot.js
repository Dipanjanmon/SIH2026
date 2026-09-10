/**
 * whatsapp-web.js bot — v3 (professional: AI + auto-location + medicine + hospital)
 * - Own WhatsApp number, session saved => login only once (QR scan first time)
 *
 * FLOW:
 *   1. Photo  -> /api/analyze (SpeciesNet + MobilenetV2) -> disease + species
 *   2. Location:
 *        a) GPS already inside the photo (EXIF) -> used automatically
 *        b) else bot asks you to SHARE your location (pin / live)
 *   3. With location -> /api/recommend -> professional medicine list + nearest
 *      vet hospital (distance + phone) + helpline 1962.
 *   4. Text -> /vet/chat (Bengali AI vet doctor) -> reply + 🔊 voice note
 *
 * Commands:
 *   .medicine      -> general medicine + nearest hospital (asks location once)
 *   .voice on|off  -> toggle voice-note reply (default ON)
 *   .clear         -> clear AI chat history
 *   .menu          -> menu
 *
 * Run:
 *   node bot.js                    -> bot (AI replies + voice + location-based care)
 *   node bot.js send 91xxxxxxxxxx "hi"  -> send a message (when paired)
 */
const fs = require("fs");
const path = require("path");
const qrcode = require("qrcode-terminal");
const exifParser = require("exif-parser");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");

const SESSION_DIR = path.join(__dirname, "wa-session");
const MEDIA_DIR = path.join(__dirname, "media");
const IMG_DIR = path.join(__dirname, "img");
const LOC_DIR = path.join(__dirname, "locations");
const VOICE_STATE_FILE = path.join(__dirname, "voice_state.json");
const STATE_FILE = path.join(__dirname, "bot_state.json");

const PENDING_TTL = 15 * 60 * 1000; // pending disease/location valid 15 min

// local AI server (same folder). Override via env AI_API_URL if moved.
const AI_BASE = process.env.AI_API_URL || "http://127.0.0.1:5000";

// ---- ensure folders ----
if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true });
if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR, { recursive: true });
if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });
if (!fs.existsSync(LOC_DIR)) fs.mkdirSync(LOC_DIR, { recursive: true });

// ---- tiny persisted per-chat state (pending disease, last location) ----
function loadAll() { try { return JSON.parse(fs.readFileSync(STATE_FILE, "utf8")) || {}; } catch (e) { return {}; } }
function saveAll(st) { try { fs.writeFileSync(STATE_FILE, JSON.stringify(st, null, 2)); } catch (e) {} }
function chatState(chatId) { const st = loadAll(); st[chatId] = st[chatId] || {}; return st[chatId]; }
function setChatState(chatId, patch) { const st = loadAll(); st[chatId] = Object.assign({}, st[chatId], patch); saveAll(st); }

// ---- voice toggle (persisted, default ON) ----
function voiceEnabledFor(chatId) {
  try { return JSON.parse(fs.readFileSync(VOICE_STATE_FILE, "utf8"))[chatId] !== false; } catch (e) { return true; }
}
function setVoiceState(chatId, on) {
  let st = {};
  try { st = JSON.parse(fs.readFileSync(VOICE_STATE_FILE, "utf8")); } catch (e) {}
  st[chatId] = !!on;
  fs.writeFileSync(VOICE_STATE_FILE, JSON.stringify(st, null, 2));
}

// ---- client with persistent local session (no re-login) ----
const client = new Client({
  authStrategy: new LocalAuth({ clientId: "pashuraksha", dataPath: SESSION_DIR }),
  puppeteer: {
    headless: true,
    ignoreHTTPSErrors: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--ignore-certificate-errors"],
  },
});

let isReady = false;

client.on("qr", (qr) => {
  console.log("\n>>> PAIR THIS BOT WITH YOUR WHATSAPP <<<");
  console.log("Open WhatsApp on your phone -> Settings -> Linked Devices -> Link a Device.");
  console.log("RAW_QR_STRING_START|" + qr + "|RAW_QR_STRING_END");
  console.log("Scan the QR code below:\n");
  qrcode.generate(qr, { small: true });
  console.log("\n(If QR expires, a new one will print automatically.)");
});

client.on("authenticated", () => {
  console.log("Authenticated. Session will be saved -> no re-login next time.");
});

client.on("ready", () => {
  isReady = true;
  console.log("READY! Bot is online using your own WhatsApp number.");
  console.log("WhatsApp number in use:", client.info.wid.user);
  console.log("AI server:", AI_BASE);
  if (process.argv[2] === "send") {
    sendMessageFromCLI();
  }
});

client.on("message", async (msg) => {
  if (!msg.fromMe) {
    const contact = await msg.getContact().catch(() => null);
    const who = contact ? contact.pushname || contact.number : msg.from;
    console.log(`[IN] from=${msg.from} (${who}) type=${msg.type} text=${msg.body || ""}`);
    try {
      await handleIncoming(msg);
    } catch (e) {
      console.error("handleIncoming error:", e.message);
    }
  }
});

// WhatsApp Web renamed message id property id._serialized -> id.$1 (2026-07).
function fixMessageId(msg) {
  if (msg && msg.id) {
    if (msg.id._serialized == null && msg.id.$1 != null) msg.id._serialized = msg.id.$1;
    else if (msg.id._serialized == null && msg.id.remote && msg.id.id)
      msg.id._serialized = `${msg.id.fromMe ? "true" : "false"}_${msg.id.remote}_${msg.id.id}`;
  }
}

// Convert EXIF degrees-minutes-seconds into decimal lat/long
function dmsToDecimal(dmsArr, ref) {
  if (!Array.isArray(dmsArr) || dmsArr.length < 3) return null;
  const d = dmsArr[0], m = dmsArr[1], s = dmsArr[2];
  let val = d + m / 60 + s / 3600;
  if (ref === "S" || ref === "W") val = -val;
  return val;
}

function extractMetadata(filepath) {
  const meta = { file: path.basename(filepath) };
  try {
    const parser = exifParser.create(fs.readFileSync(filepath));
    const result = parser.parse();
    const t = result.tags;
    meta.width = result.imageSize.width;
    meta.height = result.imageSize.height;
    if (t.DateTimeOriginal) meta.captureTime = t.DateTimeOriginal;
    const gps = result.gps;
    if (gps && typeof gps.latitude === "number" && typeof gps.longitude === "number") {
      meta.gpsLat = gps.latitude;
      meta.gpsLon = gps.longitude;
      if (gps.altitude) meta.gpsAltitude = gps.altitude;
    }
  } catch (e) {
    meta.exifError = e.message;
  }
  return meta;
}

async function reverseGeocode(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=16`;
    const res = await fetch(url, { headers: { "User-Agent": "PashuRakshaBot/1.0" } });
    if (res.ok) {
      const data = await res.json();
      const d = data.address || {};
      const parts = [d.city_district, d.city, d.town, d.village, d.state_district, d.state, d.country].filter(Boolean);
      return parts.slice(0, 3).join(", ") || data.display_name || null;
    }
  } catch (e) {}
  return null;
}

// --------------------------------------------------------------------------- //
// local AI integration
// --------------------------------------------------------------------------- //

// Bengali AI vet-doctor chat (server-side session keyed by whatsapp number)
async function aiVetChat(uid, message) {
  const res = await fetch(`${AI_BASE}/vet/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: message, uid, tone: "male" }),
  });
  if (!res.ok) throw new Error(`vet/chat HTTP ${res.status}`);
  return res.json();
}

// Photo analysis. extra = { lat, lng, state } (auto-location bootstrap)
async function aiAnalyze(fileBuffer, filename, extra = {}) {
  const form = new FormData();
  form.append("file", new Blob([fileBuffer], { type: "image/jpeg" }), filename);
  if (extra.state) form.append("state", extra.state);
  if (extra.lat != null) form.append("lat", String(extra.lat));
  if (extra.lng != null) form.append("lng", String(extra.lng));
  const res = await fetch(`${AI_BASE}/api/analyze`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`api/analyze HTTP ${res.status}`);
  return res.json();
}

// Professional recommendation: disease -> medicines + nearest hospital
async function aiRecommend(disease, extra = {}) {
  const res = await fetch(`${AI_BASE}/api/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ disease, lat: extra.lat, lng: extra.lng, state: extra.state }),
  });
  if (!res.ok) throw new Error(`api/recommend HTTP ${res.status}`);
  return res.json();
}

// Neural TTS -> audio bytes (edge-tts on the AI server, OGG/Opus for proper voice note)
async function aiSpeakMP3(text) {
  const res = await fetch(`${AI_BASE}/speak?q=${encodeURIComponent(text)}&tone=male&fmt=ogg`);
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  const ctype = (res.headers.get("content-type") || "").toLowerCase();
  const isOgg = ctype.includes("ogg") || buf.subarray(0, 4).toString("hex") === "4f676753";
  return { buf, mime: isOgg ? "audio/ogg; codecs=opus" : "audio/mp3" };
}

async function sendVoiceNote(to, text) {
  if (!text) return;
  const audio = await aiSpeakMP3(text);
  if (!audio || !audio.buf) return;
  try {
    await client.sendMessage(to, new MessageMedia(audio.mime, audio.buf.toString("base64")), { sendAudioAsVoice: true });
    console.log(`[VOICE] sent ${(audio.buf.length / 1024).toFixed(0)} KB (${audio.mime}) to ${to}`);
  } catch (e) {
    console.error("voice fail -> audio file:", e.message);
    try {
      await client.sendMessage(to, new MessageMedia(audio.mime, audio.buf.toString("base64")), { caption: "🔊" });
    } catch (e2) {}
  }
}

// plain text for TTS (strip markdown emoji-ish chars)
const plain = (t) => (t || "").replace(/[*_#`\u{1F000}-\u{1FAFF}]/gu, "").replace(/\s+/g, " ").trim();
const pct = (v) => (typeof v === "number" ? (v * 100).toFixed(0) + "%" : "");

// strongest non-healthy disease label from the custom models, else KB problem name
function topDiseaseName(ana) {
  const diag = ana && ana.custom_diagnosis ? ana.custom_diagnosis : [];
  const nonHealthy = diag.filter((m) => m.prediction && !/healthy/i.test(m.prediction));
  if (nonHealthy.length) {
    nonHealthy.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
    return nonHealthy[0].prediction;
  }
  if (ana && ana.problem && ana.problem.name) return ana.problem.name;
  return null;
}

// ---- analysis report (species + disease short card) ----
function formatAnalysis(ana) {
  const lines = [];
  lines.push("🐄 *PashuRaksha AI Analysis*");
  const d = ana.detection || {};
  lines.push(`▪ পশু(বর্গ): *${d.species || "চেনা যায়নি"}* — ${d.category || "Livestock"}`);
  if (d.score != null) lines.push(`▪ শনাক্ত: ${pct(d.score)}`);
  const diag = ana.custom_diagnosis || [];
  if (diag.length) {
    lines.push("\n*AI রোগ নির্ণয় (MobilenetV2):*");
    diag.forEach((m) => {
      const acc = typeof m.val_accuracy === "number" ? ` (acc ${m.val_accuracy.toFixed(1)}%)` : "";
      lines.push(`▪ ${m.prediction} — ${pct(m.confidence)}${acc}`);
    });
  }
  if (ana.problem) lines.push(`\n*সন্দেহজনক সমস্যা:* ${ana.problem.name} (severity: ${ana.problem.severity})`);
  const up = ana.upai || {};
  if (up.immediate) lines.push(`\n*উপায়:* ${up.immediate}`);
  if (ana.hospitals && ana.hospitals.helpline) lines.push(`\n*হেল্পলাইন:* ${ana.hospitals.helpline}`);
  return lines.join("\n");
}

// ---- professional medicine + hospital card ----
function formatRecommend(r, userGps) {
  const lines = [];
  const dis = r.disease || {};
  const tag = dis.category ? ` (${dis.category})` : "";
  lines.push(`🩺 *উপায় ও চিকিৎসা* — ${dis.bn_name || dis.requested}${tag}`);

  if (dis.report) lines.push(`⚠️ *${dis.report}`);

  const meds = r.medicines || [];
  if (meds.length) {
    lines.push("\n💊 *প্রস্তাবিত ওষুধ:*");
    meds.forEach((m, i) => {
      const nm = typeof m === "string" ? m : m.name;
      const pp = typeof m === "string" ? "" : m.purpose;
      lines.push(`${i + 1}. ${nm}${pp ? " — " + pp : ""}`);
    });
  } else {
    lines.push("\n💊 প্রস্তাবিত ওষুধ: (চিকিৎসকের পরামর্শ নিন)");
  }

  if (r.care) lines.push(`\n🛌 *যত্ন:* ${r.care}`);
  if (dis.vaccine) lines.push(`💉 *ভ্যাকসিন:* ${dis.vaccine}`);

  const hs = (r.hospitals || {}).nearby || [];
  if (hs.length) {
    lines.push(`\n🏥 *নিকটস্থ পশু হাসপাতাল:*`);
    hs.forEach((h) => {
      const km = h.distance_km != null ? ` — ${h.distance_km} কিমি` : "";
      const navLink = userGps ? mapsDirLink(userGps.lat, userGps.lng, h) : "";
      lines.push(`• ${h.name}${km}\n   📍 ${h.city}, ${h.state}${h.phone ? " | ☎ " + h.phone : ""}${navLink ? "\n   ➡️ Google Maps: " + navLink : ""}`);
    });
  }
  const helpline = (r.hospitals || {}).helpline || "1962";
  lines.push(`\n📞 *হেল্পলাইন:* ${helpline}`);
  lines.push(`\n_${r.disclaimer || ""}_`);
  return lines.join("\n");
}

function aiDownNote() {
  return "🤖 AI সার্ভার অনলাইন নেই। আগে এই ফোল্ডার থেকে `python server.py` চালাও।";
}

// Google Maps turn-by-turn navigation link (user loc -> hospital)
function mapsDirLink(ulat, ulng, hosp) {
  if (hosp && hosp.lat != null && hosp.lng != null)
    return `https://www.google.com/maps/dir/${ulat},${ulng}/${hosp.lat},${hosp.lng}`;
  const q = encodeURIComponent(`${hosp.name} ${hosp.city}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

async function fetchHospitals(extra = {}, limit = 3) {
  const q = [];
  if (extra.lat != null) q.push(`lat=${encodeURIComponent(extra.lat)}`);
  if (extra.lng != null) q.push(`lng=${encodeURIComponent(extra.lng)}`);
  if (extra.state) q.push(`state=${encodeURIComponent(extra.state)}`);
  q.push(`limit=${limit}`);
  const res = await fetch(`${AI_BASE}/api/hospitals?${q.join("&")}`);
  if (!res.ok) throw new Error(`hospitals HTTP ${res.status}`);
  return res.json();
}

// ---- professional SOS emergency card ----
function formatSOS(gps, place, data) {
  const lines = [];
  lines.push("🚨 *#SOS — জরুরি পশু সাহায্য* 🚨");
  lines.push(`\n📍 *তোমার লোকেশন:*${place ? ` ${place}` : ""}\n${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)}`);

  const hList = (data && data.data) || [];
  if (hList.length) {
    lines.push(`\n🏥 *নিকটস্থ পশু হাসপাতাল (জরুরি):*`);
    hList.forEach((h, i) => {
      const km = h.distance_km != null ? ` — ${h.distance_km} কিমি` : "";
      lines.push(
        `${i + 1}. ${h.name}${km}\n` +
        `   📍 ${h.city}, ${h.state}${h.phone ? " | ☎ " + h.phone : ""}\n` +
        `   ➡️ নেভিগেশন (Google Maps): ${mapsDirLink(gps.lat, gps.lng, h)}`
      );
    });
  } else {
    lines.push("\n🏥 নিকটস্থ হাসপাতাল পাওয়া যায়নি — হেল্পলাইনে কল করুন।");
  }

  lines.push("\n🩺 *প্রাথমিক ব্যবস্থা:*");
  lines.push("• পশুকে আলাদা শান্ত জায়গায় রাখুন");
  lines.push("• ক্ষত হলে povidone-iodine দিয়ে পরিষ্কার করুন");
  lines.push("• পানি ও নরম খাবার দিন (পেটের রোগে খাবার নয়)");
  lines.push("• পশু না সরান, পরিবহনের আগে হাসপাতালে ফোন করে নিন");
  lines.push(`\n📞 *হেল্পলাইন: 1962* (পশু) | 108 (জরুরি)`);
  lines.push("\n_এটি AI-নির্ভর জরুরি তথ্য — ভেটেরিনারি ডাক্তারের সঙ্গে নিশ্চিত হোন।_");
  return lines.join("\n");
}

// --------------------------------------------------------------------------- //
// Incoming router
// --------------------------------------------------------------------------- //
async function handleIncoming(msg) {
  const lower = (msg.body || "").trim().toLowerCase();
  fixMessageId(msg);

  try {
    // ---------- greeting & intro ----------
    if (/^(hi|hello|hey|namaste|pashuraksha|start)$/.test(lower)) {
      const bannerPath = path.join(IMG_DIR, "banner.jpeg");
      let media = null;
      if (fs.existsSync(bannerPath)) {
        media = MessageMedia.fromFilePath(bannerPath);
      }
      const caption = "🐾 *Hi, we are PashuRaksha!*\n\nWelcome to your 24/7 Professional AI Vet Assistant.\n\n" +
                      "🆘 *Type .sos* - For Emergency Help & nearest hospital routing\n" +
                      "🏥 *Type .medicine* - For medicine suggestions & nearby vet clinics\n" +
                      "🗣️ *Send any message* - To chat with our expert AI Vet Doctor\n" +
                      "📷 *Send an image* - For automatic disease detection (FMD, LSD, etc.)\n\n" +
                      "Reply with *.menu* to see all options in local language.";
      if (media) {
        await client.sendMessage(msg.from, media, { caption });
      } else {
        await client.sendMessage(msg.from, caption);
      }
      return;
    }

    // ---------- commands ----------
    if (lower === ".voice" || lower === ".voice on") {
      setVoiceState(msg.from, true);
      await client.sendMessage(msg.from, "🔊 ভয়েস নোট ON");
      return;
    }
    if (lower === ".voice off") {
      setVoiceState(msg.from, false);
      await client.sendMessage(msg.from, "🔇 ভয়েস নোট OFF (শুধু লেখা)");
      return;
    }
    if (lower === ".clear" || lower === "/clear") {
      await client.sendMessage(msg.from, "🧹 AI ডাক্তার হিস্ট্রি মুছছি...");
      try { await fetch(`${AI_BASE}/vet/clear?uid=${encodeURIComponent(msg.from)}`); } catch (e) {}
      await client.sendMessage(msg.from, "✅ হিস্ট্রি মুছে ফেলা হয়েছে।");
      return;
    }
    if (lower === ".medicine" || lower === "medicine") {
      const st = chatState(msg.from);
      if (st.lastLoc && Date.now() - (st.lastLocAt || 0) < 24 * 3600 * 1000) {
        const r = await aiRecommend("general", st.lastLoc);
        const card = formatRecommend(r, st.lastLoc);
        await client.sendMessage(msg.from, card);
        if (voiceEnabledFor(msg.from)) await sendVoiceNote(msg.from, plain(card));
      } else {
        setChatState(msg.from, { pendingDisease: "general", pendingAt: Date.now(), pendingKind: "medicine" });
        await client.sendMessage(msg.from, "💊 সাধারণ চিকিৎসা + নিকটস্থ হাসপাতাল পাঠাতে\nআমাকে তোমার 📍 *লোকেশন* শেয়ার করো 👇");
      }
      return;
    }
    if (lower === ".menu" || lower === "0" || lower === "menu" || lower === "/menu") {
      await client.sendMessage(msg.from, MENU_TEXT);
      return;
    }

    // ---- SOS emergency ----
    if (lower === ".sos" || lower === "sos") {
      const st = chatState(msg.from);
      if (st.lastLoc && Date.now() - (st.lastLocAt || 0) < 6 * 3600 * 1000) {
        let hospitals = null;
        try { hospitals = await fetchHospitals(st.lastLoc, 3); } catch (e) {}
        const card = formatSOS(st.lastLoc, null, hospitals);
        await client.sendMessage(msg.from, card);
        if (voiceEnabledFor(msg.from)) await sendVoiceNote(msg.from, "जोरुरি সাহায্য — সবচেয়ে কাছের পশু হাসপাতাল ও Google Maps link পাঠানো হলো। 1962 এ কল করুন।");
      } else {
        setChatState(msg.from, { pendingSOS: true, pendingAt: Date.now() });
        await client.sendMessage(msg.from,
          "🚨 *SOS — জরুরি পশু সাহায্য*\n\n📍 তোমার 📍 *লোকেশন* শেয়ার করো।\nনিকটস্থ হাসপাতাল + Google Maps navigation + হেল্পলাইন সঙ্গে সঙ্গে পাবে।");
      }
      return;
    }

    // ---------- live / pinned location ----------
    if (msg.type === "location" && msg.location) {
      const gps = { lat: msg.location.latitude, lng: msg.location.longitude };
      const loc = { from: msg.from, latitude: gps.lat, longitude: gps.lng, description: msg.location.description || null, receivedAt: new Date().toISOString() };
      fs.writeFileSync(path.join(LOC_DIR, `${Date.now()}.json`), JSON.stringify(loc, null, 2));
      console.log("[LOCATION] saved", gps.lat, gps.lng);
      const place = await reverseGeocode(gps.lat, gps.lng);

      const st = chatState(msg.from);
      if (st.pendingDisease && Date.now() - (st.pendingAt || 0) < PENDING_TTL) {
        const disease = st.pendingDisease;
        setChatState(msg.from, { pendingDisease: null, pendingAt: null });
        await client.sendMessage(msg.from, `📍 লোকেশন পেলাম${place ? ": " + place : ""} ✅\nএখন ডাক্তারের পরামর্শ তৈরি করছি...`);
        let r;
        try { r = await aiRecommend(disease, gps); } catch (e) { r = null; }
        if (r) {
          const card = formatRecommend(r, gps);
          await client.sendMessage(msg.from, card);
          if (voiceEnabledFor(msg.from)) await sendVoiceNote(msg.from, plain(card));
        } else {
          await client.sendMessage(msg.from, aiDownNote());
        }
        return;
      }

      // ---- SOS flow ----
      if (st.pendingSOS) {
        setChatState(msg.from, { pendingSOS: false, lastLoc: gps, lastLocAt: Date.now() });
        let hospitals = null;
        try { hospitals = await fetchHospitals(gps, 3); } catch (e) {}
        const card = formatSOS(gps, place, hospitals);
        await client.sendMessage(msg.from, card);
        if (voiceEnabledFor(msg.from)) await sendVoiceNote(msg.from,
          `জরুরি সাহায্য — ${hospitals && hospitals.data && hospitals.data[0] ? hospitals.data[0].name + " সবচেয়ে কাছে" : "নিকটস্থ হাসপাতাল"}। 1962 এ কল করুন।`);
        return;
      }

      setChatState(msg.from, { lastLoc: gps, lastLocAt: Date.now() });
      await client.sendMessage(msg.from,
        `📍 লোকেশন বাঁচল${place ? ` — ${place}` : ""} ✅\n\nএখন পশুর *ছবি* 📸 পাঠাও — AI রোগ ধরে medicine + নিকটস্থ হাসপাতাল দেখাবে।\nঅথবা `.medicine` দাও সাধারণ পরামর্শ নিতে।`);
      return;
    }

    // ---------- image -> AI analyze (EXIF GPS = auto-location) ----------
    if (msg.hasMedia || msg.type === "image") {
      let media = null;
      for (let i = 0; i < 3 && !media; i++) {
        try { media = await msg.downloadMedia(); }
        catch (e) { console.error(`retry ${i + 1}:`, e.message); await new Promise((r) => setTimeout(r, 1500)); }
      }
      if (!media) {
        await client.sendMessage(msg.from, "ছবি download হচ্ছে না — আরেকবার পাঠান?");
        return;
      }
      const ext = (media.mimetype || "image/jpeg").split("/")[1] || "jpg";
      const filename = `wa_${Date.now()}.${ext}`;
      const filepath = path.join(IMG_DIR, filename);
      fs.writeFileSync(filepath, media.data, "base64");
      console.log(`[SAVED-IMG] -> ${filename}`);

      // 1) auto-location from photo EXIF GPS if present
      let gps = null;
      try {
        const meta = extractMetadata(filepath);
        if (meta.gpsLat != null && meta.gpsLon != null) gps = { lat: meta.gpsLat, lng: meta.gpsLon };
      } catch (e) {}
      if (gps) setChatState(msg.from, { lastLoc: gps, lastLocAt: Date.now() });

      let ana;
      try { ana = await aiAnalyze(media.data, filename, gps || {}); }
      catch (e) { await client.sendMessage(msg.from, aiDownNote()); return; }

      if (ana && ana.error) { await client.sendMessage(msg.from, `❌ বিশ্লেষণ ব্যর্থ: ${ana.error}`); return; }

      const base = formatAnalysis(ana);
      await client.sendMessage(msg.from, base);

      const disease = topDiseaseName(ana);

      // 2) if we have location -> full professional card now
      if (disease && gps) {
        await client.sendMessage(msg.from, "📍 ছবির GPS-এ তোমার লোকেশন পেয়েছি — medicine + হাসপাতাল দেখাচ্ছি...");
        let r;
        try { r = await aiRecommend(disease, gps); } catch (e) { r = null; }
        if (r) {
          const card = formatRecommend(r, gps);
          await client.sendMessage(msg.from, card);
          if (voiceEnabledFor(msg.from)) await sendVoiceNote(msg.from, plain(card));
        }
      } else if (disease) {
        // 3) else ask for location, remember pending disease
        setChatState(msg.from, { pendingDisease: disease, pendingAt: Date.now(), pendingKind: "photo" });
        await client.sendMessage(msg.from,
          "📌 এখন *medicine + নিকটস্থ পশু হাসপাতাল* বলতে হলে তোমার 📍 *লোকেশন* share করো (pin 📍 অথবা লাইভ লোকেশন)।");
      } else if (!gps) {
        await client.sendMessage(msg.from, "ছবিতে GPS নেই — disha নিকটস্থ হাসপাতালের জন্য 📍 লোকেশন share করো বা `.medicine` লিখো।");
      }
      return;
    }

    // ---------- other media ----------
    if (["video", "audio", "document", "sticker", "ptt"].includes(msg.type)) {
      let media = null;
      try { media = await msg.downloadMedia(); } catch (e) {}
      if (media) {
        const ext = (media.mimetype || "bin").split("/")[1] || "bin";
        fs.writeFileSync(path.join(MEDIA_DIR, `wa_${Date.now()}.${ext}`), media.data, "base64");
      }
      await client.sendMessage(msg.from, "📁 সেভ করে রেখেছি। AI analyze-তে দরকার পশুর *ছবি* 📸।");
      return;
    }

    // ---------- empty text ----------
    if (!lower) {
      await client.sendMessage(msg.from, "বন্ধু, স্পষ্ট করে লিখো।\n📸 ছবি পাঠাও · 📍 লোকেশন share করো · 💬 প্রশ্ন লিখো — তারপর AI উত্তর/medicine/হাসপাতাল পাবে।");
      if (voiceEnabledFor(msg.from)) await sendVoiceNote(msg.from, "বন্ধু, স্পষ্ট করে লিখো।");
      return;
    }

    // ---------- greetings (standalone words ONLY — "hi" inside u-chi-t must NOT trigger) ----------
    {
      const _GREET = new Set(["hi", "hello", "hey", "hlw", "namaste", "namaskar", "salam", "hola", "howdy", "bhai", "vai", "bro", "vy", "হ্যালো", "হাই", "নমস্কার", "সালাম", "ভাই"]);
      const _tokens = (lower || "").replace(/[^a-z\u0980-\u09ff\s]/gi, " ").split(/\s+/).filter(Boolean);
      if (_tokens.length <= 3 && _tokens.some((t) => _GREET.has(t))) {
        await client.sendMessage(msg.from,
          "হ্যালো! 👋 *PashuRaksha Professional AI Bot*\n\n" +
          "📸 পশুর *ছবি* পাঠান — AI রোগ/species নির্ণয়\n" +
          "📍 লোকেশন share করলেই — 💊 medicine + 🏥 নিকটস্থ হাসপাতাল\n" +
          "💬 বাংলায় প্রশ্ন — AI ডাক্তার উত্তর + 🔊 ভয়েস\n\n" +
          "☎️ *Help Desk:* ১ 🡔 রোগ · ২ 🡔 ওষুধ · ৩ 🡔 SOS · ৪ 🡔 ভ্যাকসিন\n     ৫ 🡔 AI ডাক্তার · ৬ 🡔 ভয়েস · ৭ 🡔 হেল্পলাইন\n     0 🡔 মেনু\n\n" +
          "জরুরি: লোকেশন 📍 দাও অথবা `.sos`");
        return;
      }
    }

    // ---------- help desk (numbers 0-7, "help", "sahayya", "help desk") ----------
    if (helpDeskWelcome(lower, msg)) {
      return;
    }

    // ---------- expect location keywords (e.g. "location") ----------
    if (/(location|লোকেশন|ঠিকানা)/.test(lower)) {
      await client.sendMessage(msg.from, "পিন 📍 চেপে তোমার *বর্তমান লোকেশন* share করো — medicine + নিকটস্থ হাসপাতাল বের করে দেব।");
      return;
    }

    // ---------- default: AI vet doctor chat ----------
    let replyData = null;
    try { replyData = await aiVetChat(msg.from, msg.body || ""); } catch (e) { console.error("vet/chat:", e.message); }

    if (replyData && replyData.reply) {
      const reply = replyData.reply.trim();
      await client.sendMessage(msg.from, reply);
      if (voiceEnabledFor(msg.from)) await sendVoiceNote(msg.from, reply);
    } else {
      const fb = fallbackReply(lower);
      await client.sendMessage(msg.from, fb);
      if (voiceEnabledFor(msg.from) && !fb.startsWith("🤖 AI")) await sendVoiceNote(msg.from, plain(fb));
    }
  } catch (e) {
    console.error("handle error:", e.message);
  }
}

// --------------------------------------------------------------------------- //
// Help Desk (IVR style) — professional auto-support
// --------------------------------------------------------------------------- //
const HELPDESK_MENU =
  "☎️ *PashuRaksha Help Desk* ☎️\n" +
  "প্রাণিসম্পদ সমস্যা সমাধানে একটা নম্বর বেছে নাও:\n\n" +
  "1️⃣ 📸 ছবি দিয়ে রোগ নির্ণয়\n" +
  "2️⃣ 💊 ওষুধ ও চিকিৎসা পরামর্শ\n" +
  "3️⃣ 🚨 জরুরি সাহায্য (SOS)\n" +
  "4️⃣ 💉 ভ্যাকসিন / টিকাদান\n" +
  "5️⃣ 💬 AI ডাক্তারের সঙ্গে প্রশ্ন\n" +
  "6️⃣ 🔉 ভয়েস সহায়তা চালু/বন্ধ\n" +
  "7️⃣ 📞 হেল্পলাইন ও যোগাযোগ\n\n" +
  "▸ জরুরি লাগলে: 📍 pin চেপে লোকেশন দাও — সাথে সাথে\n   নিকটস্থ পশু হাসপাতাল + Maps navigation পাবে।\n" +
  "0️⃣ মেনু / শুরুতে ফিরে যাও\n\n" +
  "☎️ 24×7 পশু হেল্পলাইন: *1962*";

const HELPDESK_SUBS = {
  "1":
    "1️⃣ *ছবি দিয়ে রোগ নির্ণয়* 📸\n\n" +
    "- পশুর *দানা/ক্ষত/সর্দি/ফোলা/মল* — পরিষ্কার ছবি পাঠাও\n" +
    "- AI (SpeciesNet + MobilenetV2) চিনে রোগ বলবে:\n" +
    "  • FMD · LSD · Mastitis · Newcastle · Coccidiosis\n" +
    "- তারপর medicine + নিকটস্থ হাসপাতাল পাবে\n\n▸ এখনই পশুর *ছবি* 📸 পাঠাও\n▸ আরও নিয়ম জানতে নম্বর দাও: 1-7",
  "2":
    "2️⃣ *ওষুধ ও চিকিৎসা পরামর্শ* 💊\n\n" +
    "- রোগ বোঝাতে ছবি 📸 OR প্রশ্ন 💬 পাঠাও\n- AI সঠিক medicine + ডোজ + সতর্কতা দেবে\n\n▸ দ্রুত medicine + হাসপাতাল: `.medicine`\n▸ আরও নিয়ম জানতে নম্বর দাও: 1-7",
  "3":
    "3️⃣ *জরুরি সাহায্য (SOS)* 🚨\n\n" +
    "- সবচেয়ে কাছে পশু হাসপাতাল + দূরত্ব + ☎ + Google Maps\n- প্রাথমিক ব্যবস্থা + হেল্পলাইন 1962\n\n▸ *লোকেশন দাও:* পিন 📍 share করো অথবা লিখো `.sos`\n▸ আরও নিয়ম জানতে নম্বর দাও: 1-7",
  "4":
    "4️⃣ *ভ্যাকসিন / টিকাদান* 💉\n\n" +
    "- NADCP-র অধীনে FMD, LSD, PPR, ASF-এর ভ্যাকসিন\n- পশু প্রতি বছর নির্ধারিত সময়ে টিকা নিতে হবে\n- স্থানীয় প্রাণিসম্পদ অফিস / MVU-তে বিনামূল্যে টিকা\n\n▸ টিকার সময়সূচি জানতে AI-তে প্রশ্ন করো\n▸ আরও নিয়ম জানতে নম্বর দাও: 1-7",
  "5":
    "5️⃣ *AI ডাক্তারের সঙ্গে প্রশ্ন* 💬\n\n" +
    "- বাংলায়/বাংলিশে যেকোনো প্রশ্ন করো\n- AI ডাক্তার উত্তর দেবে 🔊 ভয়েস-সহ\n\n▸ যেমন: `amar gorur gai te dana poreche`\n▸ ইতিহাস মুছতে: `.clear`\n▸ আরও নিয়ম জানতে নম্বর দাও: 1-7",
  "6":
    "6️⃣ *ভয়েস সহায়তা* 🔉\n\n" +
    "- চালু: `.voice on`\n- বন্ধ: `.voice off`\n\n▸ আরও নিয়ম জানতে নম্বর দাও: 1-7",
  "7":
    "7️⃣ *হেল্পলাইন ও যোগাযোগ* 📞\n\n" +
    "- পশু হেল্পলাইন: *1962* (জাতীয়, 24×7)\n- জরুরি সাধারণ: *108*\n- স্থানীয় জেলা প্রাণিসম্পদ অফিস / MVU\n\n▸ নম্বর দাও: 1-7 🡔 অন্য বিষয় | 0 🡔 মেনু",
  "0":
    "☎️ *PashuRaksha Help Desk* ☎️\n" +
    "নম্বর বেছে নাও: 1️⃣ রোগ · 2️⃣ ওষুধ · 3️⃣ SOS · 4️⃣ ভ্যাকসিন · 5️⃣ AI ডাক্তার · 6️⃣ ভয়েস · 7️⃣ হেল্পলাইন",
};

const HELPDESK_ACTIONS = {
  "3": "sosAsk",
  "2": "medicineAsk",
  "1": "photoHint",
};

// Returns {text, action} or null if not a help-desk input.
function helpDeskLookup(lower) {
  if (/^(helpdesk|help desk|sahayya|সাহায্য|support|assistance)$/.test(lower.trim()))
    return { text: HELPDESK_MENU, action: null };
  if (/^1(\.|\)|-)?\s*$/.test(lower)) return { text: HELPDESK_SUBS["1"], action: "photoHint" };
  if (/^2(\.|\)|-)?\s*$/.test(lower)) return { text: HELPDESK_SUBS["2"], action: "medicineAsk" };
  if (/^3(\.|\)|-)?\s*$/.test(lower)) return { text: HELPDESK_SUBS["3"], action: "sosAsk" };
  if (/^4(\.|\)|-)?\s*$/.test(lower)) return { text: HELPDESK_SUBS["4"], action: null };
  if (/^5(\.|\)|-)?\s*$/.test(lower)) return { text: HELPDESK_SUBS["5"], action: "aichatHint" };
  if (/^6(\.|\)|-)?\s*$/.test(lower)) return { text: HELPDESK_SUBS["6"], action: "voiceHint" };
  if (/^7(\.|\)|-)?\s*$/.test(lower)) return { text: HELPDESK_SUBS["7"], action: null };
  if (/^0(\.|\)|-)?\s*$/.test(lower)) return { text: HELPDESK_SUBS["0"], action: null };
  return null;
}

function helpDeskWelcome(lower, msg) {
  const hit = helpDeskLookup(lower);
  if (!hit) return false;
  if (hit.text) client.sendMessage(msg.from, hit.text);

  try {
    const action = hit.action;
    if (action === "sosAsk") {
      setChatState(msg.from, { pendingSOS: true, pendingAt: Date.now() });
      setTimeout(() => client.sendMessage(msg.from, "📍 এখন তোমার *লোকেশন* 📍 share করো — নিকটস্থ হাসপাতাল + Maps navigation পাবে।"), 400);
    } else if (action === "medicineAsk") {
      const st = chatState(msg.from);
      if (st.lastLoc && Date.now() - (st.lastLocAt || 0) < 24 * 3600 * 1000) {
        aiRecommend("general", st.lastLoc)
          .then((r) => client.sendMessage(msg.from, formatRecommend(r, st.lastLoc)))
          .catch(() => {});
      } else {
        setChatState(msg.from, { pendingDisease: "general", pendingAt: Date.now(), pendingKind: "medicine" });
        setTimeout(() => client.sendMessage(msg.from, "📍 লোকেশন share করো — medicine + হাসপাতাল পাঠাব।"), 400);
      }
    } else if (action === "photoHint") {
      setTimeout(() => client.sendMessage(msg.from, "📸 পশুর রোগের অংশটুকুর *পরিষ্কার ছবি* পাঠাও — AI বিশ্লেষণ শুরু করে দেবে।"), 400);
    } else if (action === "aichatHint") {
      setTimeout(() => client.sendMessage(msg.from, "✍️ তুমার সমস্যা বাংলায় লিখো — AI ডাক্তার উত্তর দেবে।"), 400);
    } else if (action === "voiceHint") {
      setTimeout(() => client.sendMessage(msg.from, `.voice on ➡️ চালু\n.voice off ➡️ বন্ধ — লিখলেই হবে।`), 400);
    }
  } catch (e) {}
  return true;
}

const MENU_TEXT =
  "📋 *PashuRaksha Professional AI Bot*\n\n" +
  "📸 পশুর *ছবি* পাঠাও → SpeciesNet + MobilenetV2 দিয়ে রোগ নির্ণয়\n" +
  "📍 *লোকেশন* share করো → 💊 medicine + 🏥 নিকটস্থ হাসপাতাল (দূরত্ব + ☎ + Maps link)\n" +
  "   (ছবিতে GPS থাকলে automatically ধরে)\n" +
  "💬 যেকোনো প্রশ্ন → AI ডাক্তার + 🔊 ভয়েস\n\n" +
  "🚨 *জরুরি:* `.sos` → লোকেশন দাও, নিকটস্থ হাসপাতাল + Maps + হেল্পলাইন পাবে\n\n" +
  "কমান্ড:\n" +
  "  `.medicine` — general medicine + হাসপাতাল\n" +
  "  `.sos` — 🚨 জরুরি সাহায্য (নিকটস্থ হাসপাতাল + Maps navigation)\n" +
  "  `.voice on/off` — ভয়েস নোট চালু/বন্ধ\n" +
  "  `.clear` — হিস্ট্রি মুছো\n" +
  "  `.menu` — মেনু\n\n" +
  "☎️ পশু হেল্পলাইন: 1962 | জরুরি: 108";

function fallbackReply(lower) {
  if (lower === "1" || lower.includes("pashuraksha"))
    return "🛡️ PashuRaksha — জাতীয় প্রাণিসম্পদ স্বাস্থ্য ও নজরদারি। AI সার্ভার চালু করতে এখানে `python server.py` চালাও।";
  if (lower === "2" || lower.includes("disease") || lower.includes("fmd"))
    return "🩺 রোগের তথ্য: FMD, LSD, PPR, ASF। পশুর ছবি পাঠান বা AI-তে প্রশ্ন করুন।";
  if (lower === "3" || lower.includes("vaccin"))
    return "💉 টিকাদান ও MVU — NADCP। ছবি/প্রশ্ন পাঠালে বিস্তারিত।";
  if (lower === "4" || lower.includes("help") || lower.includes("support"))
    return "🏛️ সহায়তা: হেল্পলাইন 1962, জেলা প্রাণিসম্পদ কর্মকর্তা।";
  return "🤖 AI সার্ভার অফলাইন। এই ফোল্ডারে `python server.py` চালান, অথবা `.menu`।";
}

// ---- SEND from command line ----
async function sendMessageFromCLI() {
  const to = process.argv[3];
  const text = process.argv.slice(4).join(" ");
  if (!to) {
    console.log("Usage: node bot.js send <number> <message>");
    process.exit(1);
  }
  let number = to;
  if (/^[6-9]\d{9}$/.test(to)) number = "91" + to;
  const formatted = number.includes("@c.us") ? number : `${number}@c.us`;
  try {
    const sent = await client.sendMessage(formatted, text || "test");
    console.log("SENT OK:", sent.id._serialized);
    setTimeout(() => process.exit(0), 800);
  } catch (e) {
    console.error("Send failed:", e.message);
    process.exit(1);
  }
}

if (process.argv[2] !== "send") {
  console.log("Starting bot... scan the QR to pair (first time only).");
}

client.initialize().catch((e) => {
  console.error("Init error:", e.message);
  process.exit(1);
});