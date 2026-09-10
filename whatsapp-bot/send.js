/**
 * Interactive send + receive console for whatsapp-web.js
 *
 * - Uses the SAVED session (no re-login)
 * - Type a message:  <number> <message>   e.g.  919883307417 hello dipa
 * - Or type:  list        to see recent chats
 * - Incoming messages show live and auto-reply
 *
 * Commands:
 *   <number> <text>   -> send a WhatsApp message
 *   list               -> show recent chats
 *   whoami             -> show own number
 *   exit               -> quit
 */
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");

const SESSION_DIR = path.join(__dirname, "wa-session");
const MEDIA_DIR = path.join(__dirname, "media");
const IMG_DIR = path.join(__dirname, "img");
if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR, { recursive: true });
if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });

const client = new Client({
  authStrategy: new LocalAuth({ clientId: "pashuraksha", dataPath: SESSION_DIR }),
  puppeteer: { headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"] },
});

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
let ready = false;
let promptActive = false;

function printPrompt() {
  if (ready && !promptActive) {
    promptActive = true;
    rl.question("\n[you]> ", (input) => {
      promptActive = false;
      handleCommand(input);
    });
  }
}

client.on("qr", (qr) => {
  console.log("\n>>> SCAN QR (only needed once) <<<");
  console.log("WhatsApp -> Settings -> Linked Devices -> Link a Device\n");
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => console.log("Authenticated. Session saved -> no re-login."));

client.on("ready", () => {
  ready = true;
  console.log("\n==============================================");
  console.log("READY! Bot online on:", client.info.wid.user);
  console.log("Send:  <number> <message>   (e.g. 919883307417 hi dipa)");
  console.log("Type 'list' for chats, 'whoami', 'exit' to quit");
  console.log("==============================================");
  printPrompt();
});

client.on("message", async (msg) => {
  if (msg.fromMe) return;
  const contact = await msg.getContact().catch(() => null);
  const who = contact ? contact.pushname || contact.number : msg.from;
  console.log(`\n[IN] from=${msg.from} (${who}) type=${msg.type} text=${msg.body || ""}`);

  // auto-reply logic
  const lower = (msg.body || "").trim().toLowerCase();

  // WhatsApp renamed id._serialized -> id.$1 (2026-07). Backfill so
  // downloadMedia() can resolve the message (else opaque "r: r" error).
  if (msg && msg.id) {
    if (msg.id._serialized == null && msg.id.$1 != null) {
      msg.id._serialized = msg.id.$1;
    } else if (msg.id._serialized == null && msg.id.remote && msg.id.id) {
      msg.id._serialized = `${msg.id.fromMe ? "true" : "false"}_${msg.id.remote}_${msg.id.id}`;
    }
  }

  try {
    const isMedia = msg.hasMedia || ["image", "video", "audio", "document", "sticker"].includes(msg.type);
    if (isMedia) {
      let media = null;
      for (let i = 0; i < 3 && !media; i++) {
        try {
          media = await msg.downloadMedia();
        } catch (e) {
          console.error(`media download retry ${i + 1}:`, e.message);
          await new Promise((r) => setTimeout(r, 1500));
        }
      }
      if (media) {
        const ext = (media.mimetype || "application/octet-stream").split("/")[1] || "bin";
        const filename = `${Date.now()}.${ext}`;
        const targetDir = media.mimetype.startsWith("image") ? IMG_DIR : MEDIA_DIR;
        fs.writeFileSync(path.join(targetDir, filename), media.data, "base64");
        console.log(`[SAVED] ${media.mimetype} -> ${path.basename(targetDir)}/${filename}`);
        await client.sendMessage(msg.from, media, { caption: "Got it ✅ (media auto-saved & echoed)" });
        return;
      } else {
        console.log("[MEDIA] received but download failed (skipped)");
        await client.sendMessage(msg.from, "Photo/video mila, par download hoyni. Abar bhejen?").catch(() => {});
        return;
      }
    }
    let reply;
    if (!lower) {
      reply = "Bhai thik kore likhen.";
    } else if (["hi", "hello", "hey", "hlw", "namaste", "good morning"].some((w) => lower.includes(w))) {
      reply = "Hello! 👋 PashuRaksha bot.\n1 PashuRaksha | 2 Health | 3 Vaccination | 4 Help | 0 Menu";
    } else if (lower === "1") reply = "🛡️ PashuRaksha - Livestock Health & Surveillance.";
    else if (lower === "2") reply = "🩺 Disease info: FMD, LSD, PPR, ASF.";
    else if (lower === "3") reply = "💉 Vaccination & MVU.";
    else if (lower === "4") reply = "🏛️ Help: 1962, District Vet Officer.";
    else if (lower === "0") reply = "📋 Menu: 1..4, 0 Menu";
    else reply = "Ami bujhini 🤔. '0' likh.";
    await client.sendMessage(msg.from, reply);
    console.log(`[REPLY] -> ${reply.slice(0, 50)}`);
  } catch (e) {
    console.error("auto-reply err:", e.message);
  }
  printPrompt();
});

async function handleCommand(input) {
  const text = input.trim();
  if (!text) return printPrompt();

  if (text.toLowerCase() === "exit") { console.log("bye"); process.exit(0); }
  if (text.toLowerCase() === "whoami") { console.log("Own number:", client.info.wid.user); return printPrompt(); }
  if (text.toLowerCase() === "list") {
    const chats = await client.getChats();
    console.log("\nRecent chats:");
    chats.slice(0, 10).forEach((c) => console.log("  -", c.id.user || c.id._serialized, c.name || ""));
    return printPrompt();
  }

  // expect: <number> <message>
  const space = text.indexOf(" ");
  if (space === -1) {
    console.log("Usage: <number> <message>   e.g. 919883307417 hi dipa");
    return printPrompt();
  }
  let number = text.slice(0, space).trim();
  const message = text.slice(space + 1).trim();
  if (/^[6-9]\d{9}$/.test(number)) number = "91" + number; // Indian mobile
  const formatted = number.includes("@c.us") ? number : `${number}@c.us`;
  try {
    const sent = await client.sendMessage(formatted, message || "test");
    console.log("SENT OK to", number, "->", sent.id._serialized);
  } catch (e) {
    console.error("Send failed:", e.message);
  }
  printPrompt();
}

console.log("Starting bot... (uses saved session, no login needed)");
client.initialize().catch((e) => {
  console.error("Init error:", e.message);
  process.exit(1);
});
