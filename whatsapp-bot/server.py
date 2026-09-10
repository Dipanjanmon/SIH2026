from flask import Flask, request, jsonify, Response
from chat import generate_reply, clear_history
from voice_engine import tts_to_bytes, detect_lang
from config import (
    GEMINI_API_KEY,
    MODEL_NAME,
    get_system_prompt,
    OPENROUTER_API_KEY,
    OPENROUTER_MODEL,
    MEDICAL_SYSTEM_PROMPT,
    GENERIC_MEDICAL_PROMPT,
)
from sessions import save_session, get_session, delete_session, recover_session, clear_session
from Analysis.analyzer import (
    analyze_image,
    load_custom_models,
    load_speciesnet,
    load_vet_kb,
    nearby_hospitals,
)
import asyncio
import os
import tempfile
import time
import urllib.request
import json as _json
from pathlib import Path
from urllib.parse import quote
import google.generativeai as genai

app = Flask(__name__)

CHAT_TONES = ("male", "female")

ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff", ".dcm"}
MAX_SIZE = 25 * 1024 * 1024

VET_SYSTEM_PROMPT = (
    "তুমি 'পশু সহায়' (PashuSahaya) — একজন পেশাদার AI পশুচিকিৎসক (ভেটেরিনারি ডাক্তার) সহকারী। "
    "ভারত/দক্ষিণ এশিয়ার কৃষক, প্রাণিসম্পদ কর্মকর্তা ও পশুপালকদের গবাদি পশু, ছাগল-ভেড়া, শুকর, হাঁস-মুরগি, "
    "কুকুর-বিড়াল ও বন্য প্রাণীর রোগ, লক্ষণ, প্রতিরোধ, টিকা, পুষ্টি, প্রজনন ও জরুরি ব্যবস্থাপনায় সাহায্য করো।\n"
    "ভাষার নিয়ম:\n"
    "১) ইউজার যে ভাষায়/বানানে লিখবে, তুমি ঠিক সেই একই স্টাইলে উত্তর দাও:\n"
    "   – বাংলা হরফে লিখলে → বাংলা হরফে (যেমন: 'গরুর গায়ে দানা পড়েছে')\n"
    "   – বাংলিশে লিখলে (ইংরেজি হরফে বাংলা, যেমন 'amar gorur gai te dana poreche', 'eta ki lumpy skin disease?') "
    "→ বাংলিশেই উত্তর দাও (সম্পূর্ণ বাংলা শব্দ ইংরেজি হরফে, যেমন 'apnar gorur lumpy skin disease hote pare. "
    "take alada rakhen ebong kichu din kichhu jwala dekhun')\n"
    "   – হিন্দি হরফে লিখলে → হিন্দি हरफ़ে\n"
    "   – হিংলিশে লিখলে (ইংরেজি হরফে হিন্দি, যেমন 'mera gai bimar hai') → একই হিংলিশ স্টাইলে "
    "(যেমন 'aapki gai ko lumpy skin disease ho sakta hai. use alag rakhen')\n"
    "   – ইংরেজিতে লিখলে → ইংরেজিতে\n"
    "২) বাংলিশ/হিংলিশে উত্তর দেওয়ার সময় রোগের নাম ও চিকিৎসা-সংক্রান্ত শব্দ ইংরেজিতেই লিখবে "
    "(FMD, LSD, mastitis, quarantine, vector) যাতে বোঝা সহজ হয়।\n"
    "৩) সবসময় পেশাদার, সহানুভূতিশীল ও ব্যবহারিক উত্তর দাও — উত্তর ৩ ভাগে: (ক) সম্ভাব্য রোগ/সমস্যা ও লক্ষণ; "
    "(খ) ঘরোয়া/প্রাথমিক ব্যবস্থা ও উপাই; (গ) কখন ভেটেরিনারি ডাক্তার/প্রাণিসম্পদ কর্মকর্তা দেখাতে হবে।\n"
    "৪) নিকটস্থ প্রাণি হাসপাতাল, উপজেলা/তালুকা প্রাণিসম্পদ দপ্তর বা হেল্পলাইন ১৯৬২-এ পাঠাতে বলো।\n"
    "৫) FMD, LSD, PPR, ASF, H5N1, নিউক্যাসল, অ্যানথ্রাক্স, ব্রুসেলোসিস ইত্যাদি নোটিফায়েবল/জুনোটিক "
    "রোগ হলে অবিলম্বে কর্মকর্তাকে জানাতে বলো; মৃত পশু খুলতে নিষেধ করো।\n"
    "৬) কোনো ওষুধ বা টিকার ডোজ/মাত্রা দেবে না।\n"
    "৭) তোমার উত্তর রোগনির্ণয় নয় — শুধু প্রাথমিক তথ্য ও পরামর্শ। ছোট ও ব্যবহারিক রাখো (৩০০ শব্দের কম)।"
)


def _cors(resp):
    resp.headers["Access-Control-Allow-Origin"] = "*"
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type, X-Requested-With, Origin"
    resp.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return resp


@app.before_request
def _cors_preflight():
    if request.method == "OPTIONS":
        return _cors(app.make_default_options_response())


_chat_models = {}


def openrouter_reply(message: str, system: str, history=None) -> str:
    msgs = [{"role": "system", "content": system}]
    if history:
        msgs += history
    msgs.append({"role": "user", "content": message})
    body = _json.dumps({
        "model": OPENROUTER_MODEL,
        "messages": msgs,
        "temperature": 0.7,
    }).encode()
    req = urllib.request.Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=body,
        headers={
            "Content-Type": "application/json",
            "Authorization": "Bearer " + OPENROUTER_API_KEY,
        },
    )
    with urllib.request.urlopen(req, timeout=40) as r:
        d = _json.loads(r.read().decode())
    return d["choices"][0]["message"]["content"] or ""


def ai_reply(message: str, tone: str = "male", uid: str = None) -> str:
    """Generic (normal) chat — uses Gemini, but stripped to MEDICAL topics only.
    Non-medical questions get a polite decline (the generic medical prompt
    enforces "only medical answers"). On Gemini quota/network errors, falls back
    to the keyword-based SmartBot so normal chat always stays alive."""
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            system_instruction=GENERIC_MEDICAL_PROMPT,
            generation_config=genai.GenerationConfig(temperature=0.6, max_output_tokens=500),
        )
        chat = model.start_chat()
        reply = (chat.send_message(message).text or "").strip()
        if reply:
            return reply
    except Exception:
        pass
    try:
        reply = openrouter_reply(message, GENERIC_MEDICAL_PROMPT)
        if reply:
            return reply
    except Exception:
        pass
    try:
        return asyncio.run(generate_reply(uid or "generic", message, tone))
    except Exception:
        return None


@app.route("/chat", methods=["GET", "POST"])
def chat():
    if request.method == "POST":
        data = request.get_json(silent=True) or {}
        message = (data.get("q") or "").strip()
        tone = data.get("tone", "male")
    else:
        message = (request.args.get("q") or "").strip()
        tone = request.args.get("tone", "male")

    if not message:
        resp = jsonify({"reply": "", "lang": "en", "offline": False})
        resp.headers["Access-Control-Allow-Origin"] = "*"
        return resp

    uid = None
    if request.method == "POST":
        uid = data.get("uid") or data.get("user_id")
    reply = ai_reply(message, tone, uid)
    if not reply:
        resp = jsonify({"reply": None, "lang": detect_lang(message), "offline": True})
        resp.headers["Access-Control-Allow-Origin"] = "*"
        return resp

    resp = jsonify({"reply": reply, "lang": detect_lang(message), "offline": False})
    resp.headers["Access-Control-Allow-Origin"] = "*"
    return resp


_med_model = None


def get_med_model():
    """Medical-assistant Gemini model — the shared medical API key is used ONLY
    for medical/veterinary endpoints, never for the generic chat."""
    global _med_model
    if _med_model is None:
        genai.configure(api_key=GEMINI_API_KEY)
        _med_model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            system_instruction=MEDICAL_SYSTEM_PROMPT,
            generation_config=genai.GenerationConfig(temperature=0.5, max_output_tokens=700),
        )
    return _med_model


def _medical_flow(user_id, message, tone):
    """Real-time medical conversation with persistent session history.
    Gemini (medical) first with full history; OpenRouter as fallback."""
    hist = get_session(user_id) or []
    reply = None
    try:
        turns = [
            {"role": "user" if h.get("role") == "user" else "model", "parts": [h.get("content", "")]}
            for h in hist
        ]
        chat = get_med_model().start_chat(history=turns)
        reply = (chat.send_message(message).text or "").strip()
    except Exception:
        reply = None
    if not reply:
        try:
            reply = openrouter_reply(message, MEDICAL_SYSTEM_PROMPT, history=hist if hist else None)
        except Exception:
            return None
    hist.append({"role": "user", "content": message})
    hist.append({"role": "assistant", "content": reply})
    save_session(user_id, hist)
    return reply


@app.route("/medical/chat", methods=["GET", "POST"])
def medical_chat():
    if request.method == "POST":
        data = request.get_json(silent=True) or {}
        message = (data.get("q") or "").strip()
        tone = data.get("tone", "male")
        user_id = data.get("uid") or "unknown"
    else:
        message = (request.args.get("q") or "").strip()
        tone = request.args.get("tone", "male")
        user_id = request.args.get("uid") or "unknown"

    if not message:
        resp = jsonify({"reply": "", "lang": "bn", "offline": False})
        resp.headers["Access-Control-Allow-Origin"] = "*"
        return resp

    reply = _medical_flow(user_id, message, tone)
    if not reply:
        resp = jsonify({"reply": None, "lang": detect_lang(message), "offline": True})
        resp.headers["Access-Control-Allow-Origin"] = "*"
        return resp

    resp = jsonify({"reply": reply, "lang": "bn", "offline": False, "uid": user_id})
    resp.headers["Access-Control-Allow-Origin"] = "*"
    return resp


@app.route("/medical/clear", methods=["GET", "POST"])
def medical_clear():
    user_id = request.args.get("uid") or (request.get_json(silent=True) or {}).get("uid", "unknown")
    delete_session(user_id)
    resp = jsonify({"reply": "✅ মেডিকেল চ্যাট হিস্ট্রি মুছে ফেলা হয়েছে।", "uid": user_id})
    resp.headers["Access-Control-Allow-Origin"] = "*"
    return resp


@app.route("/medical/history", methods=["GET"])
def medical_history():
    user_id = request.args.get("uid") or "unknown"
    hist = get_session(user_id) or []
    resp = jsonify({"uid": user_id, "count": len(hist), "history": hist})
    resp.headers["Access-Control-Allow-Origin"] = "*"
    return resp


@app.route("/session/recover", methods=["GET", "POST"])
def session_recover():
    if request.method == "POST":
        data = request.get_json(silent=True) or {}
        user_id = data.get("uid") or "unknown"
    else:
        user_id = request.args.get("uid") or "unknown"
    hist = recover_session(user_id)
    if hist is None:
        resp = jsonify({"recovered": False, "msg": "কোনো মুছে ফেলা session খুঁজে পাওয়া যায়নি।"})
    else:
        resp = jsonify({"recovered": True, "uid": user_id, "count": len(hist), "history": hist})
    resp.headers["Access-Control-Allow-Origin"] = "*"
    return resp


@app.route("/session/clear", methods=["GET", "POST"])
def session_clear():
    if request.method == "POST":
        data = request.get_json(silent=True) or {}
        user_id = data.get("uid") or "unknown"
    else:
        user_id = request.args.get("uid") or "unknown"
    delete_session(user_id)
    resp = jsonify({"cleared": True, "uid": user_id, "msg": "✅ Session মুছে আর্কাইভে রাখা হয়েছে। /session/recover দিয়ে ফেরানো যাবে।"})
    resp.headers["Access-Control-Allow-Origin"] = "*"
    return resp


@app.route("/speak", methods=["GET"])
def speak():
    text = request.args.get("q", "")
    tone = request.args.get("tone", "male")
    fmt = (request.args.get("fmt", "mp3") or "mp3").lower()
    if not text:
        return jsonify({"error": "no text"}), 400
    audio = asyncio.run(tts_to_bytes(text, tone))
    if not audio:
        return jsonify({"error": "no audio"}), 502
    ctype = "audio/mpeg"
    if fmt == "ogg":
        ogg = _mp3_to_ogg(audio)
        if ogg:
            audio = ogg
            ctype = "audio/ogg; codecs=opus"
        else:
            fmt = "mp3"  # conversion unavailable -> keep mp3
    resp = Response(audio, mimetype=ctype)
    resp.headers["Access-Control-Allow-Origin"] = "*"
    resp.headers["Cache-Control"] = "no-store"
    return resp


def _mp3_to_ogg(mp3: bytes):
    """Convert MP3 bytes to OGG/Opus so WhatsApp renders a proper voice note.
    Uses imageio-ffmpeg's bundled ffmpeg if available, else system ffmpeg."""
    try:
        import imageio_ffmpeg as _iff

        _ffmpeg = _iff.get_ffmpeg_exe()
    except Exception:
        import shutil

        _ffmpeg = shutil.which("ffmpeg")
    if not _ffmpeg:
        return None
    import subprocess

    try:
        tmp_in = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)
        tmp_out = tempfile.NamedTemporaryFile(suffix=".ogg", delete=False)
        tmp_in.write(mp3)
        tmp_in.close()
        tmp_out.close()
        cmd = [
            _ffmpeg, "-y", "-i", tmp_in.name,
            "-c:a", "libopus", "-b:a", "32k", "-ar", "48000",
            "-f", "ogg", tmp_out.name,
        ]
        r = subprocess.run(cmd, capture_output=True, timeout=60)
        data = None
        if r.returncode == 0:
            with open(tmp_out.name, "rb") as f:
                data = f.read()
        os.unlink(tmp_in.name)
        os.unlink(tmp_out.name)
        return data
    except Exception:
        return None


@app.route("/vcheck", methods=["GET"])
def vcheck():
    return jsonify({
        "status": "ok",
        "voices": {
            "male": {"bn": "bn-IN-BashkarNeural", "hi": "hi-IN-MadhurNeural", "en": "en-IN-PrabhatNeural"},
            "female": {"bn": "bn-IN-TanishaaNeural", "hi": "hi-IN-SwaraNeural", "en": "en-IN-NeerjaNeural"},
        }
    })


@app.route("/tts", methods=["GET"])
def tts():
    q = request.args.get("q", "")
    tl = request.args.get("tl", "bn")
    if not q:
        return jsonify({"error": "no text"}), 400

    url = "https://translate.google.com/translate_tts?ie=UTF-8&q=" + quote(q) + "&tl=" + tl + "&client=tw-ob"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=20) as r:
        data = r.read()

    resp = Response(data, mimetype="audio/mpeg")
    resp.headers["Access-Control-Allow-Origin"] = "*"
    resp.headers["Cache-Control"] = "no-store"
    return resp


@app.route("/webhook", methods=["POST"])
def webhook():
    data = request.json
    user_id = data.get("from", "unknown")
    message = data.get("body", "").strip()

    if not message:
        return jsonify({"reply": ""})

    cmd = message.lower()

    if cmd in ["/clear", "/reset", "/নতুন"]:
        delete_session(user_id)
        return jsonify({"reply": "✅ চ্যাট হিস্ট্রি মুছে আর্কাইভে রাখা হয়েছে।\n/রিকভার বা /recover দিয়ে ফেরাতে পারো।"})

    if cmd in ["/recover", "/রিকভার", "/ফিরাও"]:
        hist = recover_session(user_id)
        if hist is None:
            return jsonify({"reply": "❌ কোনো মুছে ফেলা হিস্ট্রি পাওয়া যায়নি।"})
        short = " → ".join(
            h["content"][:40] for h in hist[-4:] if h["role"] == "user"
        )
        return jsonify({"reply": f"✅ Session ফেরানো হয়েছে! শেষ কথা: {short}"})

    if cmd in ["/help", "/সাহায্য"]:
        help_text = (
            "🤖 *SmartBot কমান্ড লিস্ট:*\n\n"
            "💬 যেকোনো মেসেজ লিখো — AI উত্তর দেবে\n"
            "🔄 /clear — চ্যাট হিস্ট্রি মুছো\n"
            "❓ /help — এই হেল্প দেখো\n\n"
            "বাংলা, হিন্দি বা ইংরেজিতে লিখো, আমি সেই ভাষায় উত্তর দেবো!"
        )
        return jsonify({"reply": help_text})

    reply = asyncio.run(generate_reply(user_id, message))
    return jsonify({"reply": reply})


# --------------------------------------------------------------------------- #
# PashuSahaya — Vet doctor chat (Gemini + OpenRouter fallback, persistent session)
# --------------------------------------------------------------------------- #
VET_TONE_RULES = {
    "male": "টোন: পেশাদার, সোজাসুজি, দৃঢ় — কম emoji, স্পষ্ট উপদেশ, বিশ্বাসী ('vote vule na' টাইপ না)।",
    "female": "টোন: উষ্ণ, যত্নশীল, সহানুভূতিশীল — ধৈর্য ধরে বুঝিয়ে বলো, কিছুটা সহানুভূতিও দেখাও ('chinta korben na...').",
}
_vet_models = {}


def get_vet_model(tone="male"):
    if tone not in CHAT_TONES:
        tone = "male"
    m = _vet_models.get(tone)
    if m is None:
        genai.configure(api_key=GEMINI_API_KEY)
        m = genai.GenerativeModel(
            model_name=MODEL_NAME,
            system_instruction=VET_SYSTEM_PROMPT + "\n" + VET_TONE_RULES.get(tone, VET_TONE_RULES["male"]),
            generation_config=genai.GenerationConfig(temperature=0.7, max_output_tokens=800),
        )
        _vet_models[tone] = m
    return m


def vet_reply(uid: str, message: str, tone: str = "male"):
    """Doctor-style veterinary reply with persistent session history.

    Tries Gemini first (with full history, per tone), OpenRouter second;
    returns (reply, offline)."""
    key = "vet:" + uid
    hist = get_session(key) or []
    reply = None
    try:
        turns = []
        for h in hist:
            turns.append({
                "role": "user" if h.get("role") == "user" else "model",
                "parts": [h.get("content", "")],
            })
        chat = get_vet_model(tone).start_chat(history=turns)
        reply = (chat.send_message(message).text or "").strip()
    except Exception:
        reply = None
    if not reply:
        try:
            reply = openrouter_reply(message, VET_SYSTEM_PROMPT, hist)
        except Exception:
            reply = None
    if not reply:
        return None, True
    hist = get_session(key) or []
    hist.append({"role": "user", "content": message})
    hist.append({"role": "assistant", "content": reply})
    save_session(key, hist)
    return reply, False


@app.route("/vet/chat", methods=["GET", "POST"])
def vet_chat():
    if request.method == "POST":
        data = request.get_json(silent=True) or {}
        message = (data.get("q") or "").strip()
        user_id = data.get("uid") or "unknown"
        tone = data.get("tone", "male")
    else:
        message = (request.args.get("q") or "").strip()
        user_id = request.args.get("uid") or "unknown"
        tone = request.args.get("tone", "male")

    if not message:
        return _cors(jsonify({"reply": "", "lang": detect_lang("পশু"), "offline": False}))

    reply, offline = vet_reply(user_id, message, tone)
    lang = detect_lang(message)
    if reply is None:
        return _cors(jsonify({"reply": None, "lang": lang, "offline": True, "uid": user_id}))
    return _cors(jsonify({"reply": reply, "lang": lang, "offline": False, "uid": user_id}))


@app.route("/vet/clear", methods=["GET", "POST"])
def vet_clear():
    user_id = request.args.get("uid") or (request.get_json(silent=True) or {}).get("uid", "unknown")
    delete_session("vet:" + user_id)
    return _cors(jsonify({"reply": "✅ ডাক্তার চ্যাটের ইতিহাস মুছে আর্কাইভে রাখা হয়েছে।", "uid": user_id}))


@app.route("/vet/history", methods=["GET"])
def vet_history():
    user_id = request.args.get("uid") or "unknown"
    hist = get_session("vet:" + user_id) or []
    return _cors(jsonify({"uid": user_id, "count": len(hist), "history": hist}))


# --------------------------------------------------------------------------- #
# PashuSahaya — AI photo analysis, hospitals, vet KB
# --------------------------------------------------------------------------- #
@app.route("/api/health", methods=["GET"])
def api_health():
    species_ok = load_speciesnet() is not None
    return _cors(jsonify({
        "status": "ok" if species_ok else "degraded",
        "engine": "speciesnet-v4.0.3a",
        "speciesnet_ready": species_ok,
        "custom_models": [
            {"model": key, "labels": meta["labels"], "val_accuracy": meta.get("val_accuracy")}
            for key, meta in load_custom_models().items()
        ],
    }))


@app.route("/api/analyze", methods=["POST", "OPTIONS"])
def api_analyze():
    if request.method == "OPTIONS":
        return _cors(jsonify({}))
    f = request.files.get("file")
    if not f or not f.filename:
        return _cors(jsonify({"error": "no file uploaded"})), 400
    ext = Path(f.filename).suffix.lower()
    if ext not in ALLOWED_EXT:
        return _cors(jsonify({"error": f"unsupported file type '{ext}'. Use JPG/PNG/WEBP/TIFF/DICOM."})), 415
    data = f.read()
    if len(data) > MAX_SIZE:
        return _cors(jsonify({"error": "file too large (max 25 MB)"})), 413

    tmp_dir = Path(tempfile.mkdtemp(prefix="pashu_upload_"))
    tmp = tmp_dir / (f"upload_{int(time.time() * 1000)}{ext}")
    tmp.write_bytes(data)
    try:
        lat = request.values.get("lat")
        lng = request.values.get("lng")
        state = request.values.get("state")
        result = analyze_image(
            tmp,
            state=state or None,
            lat=float(lat) if lat else None,
            lng=float(lng) if lng else None,
        )
        return _cors(jsonify(result))
    except Exception as exc:
        return _cors(jsonify({"error": f"analysis failed: {exc}"})), 500
    finally:
        try:
            tmp.unlink(missing_ok=True)
            tmp_dir.rmdir()
        except OSError:
            pass


@app.route("/api/hospitals", methods=["GET"])
def api_hospitals():
    lat = request.args.get("lat")
    lng = request.args.get("lng")
    state = request.args.get("state")
    limit = request.args.get("limit", "3")
    try:
        result = nearby_hospitals(
            lat=float(lat) if lat else None,
            lng=float(lng) if lng else None,
            state=state or None,
            limit=int(limit),
        )
        return _cors(jsonify({"data": result}))
    except Exception as exc:
        return _cors(jsonify({"error": str(exc)})), 400


@app.route("/api/vet-kb", methods=["GET"])
def api_vet_kb():
    return _cors(jsonify(load_vet_kb()))


# ------------------------- # medicine + hospital recommendation # ------ #
MEDICINES_PATH = Path(__file__).resolve().parent / "Analysis" / "medicines.json"
_MEDICINE_LOADED = None


def load_medicines() -> dict:
    global _MEDICINE_LOADED
    if _MEDICINE_LOADED is None:
        with open(MEDICINES_PATH, encoding="utf-8") as fp:
            _MEDICINE_LOADED = _json.load(fp)
    return _MEDICINE_LOADED


def _map_disease_key(name: str):
    """Loose match from a problem/disease name (or normalized model label) to a
    medicines.json key. e.g. 'Lumpy Skin Disease' -> 'lumpy_skin'."""
    if not name:
        return None
    text = str(name).lower().replace("-", "_")
    tokens = {t for t in text.replace("_", " ").split() if t}
    for token, key in [
        ("foot", "foot_and_mouth"), ("fmd", "foot_and_mouth"),
        ("lumpy", "lumpy_skin"), ("lsd", "lumpy_skin"),
        ("mastitis", "mastitis"), ("cocci", "coccidiosis"),
        ("newcastle", "newcastle"), ("ranikhet", "newcastle"),
        ("salmonella", "salmonella"), ("brucellosis", "brucellosis"),
        ("anthrax", "anthrax"),
    ]:
        if token in tokens:
            return key
    if any(t in tokens for t in ("healthy", "normal")):
        return "healthy"
    return None


@app.route("/api/recommend", methods=["GET", "POST"])
def api_recommend():
    """Medicine + nearest vet hospital for a detected disease + location.

    POST body or query params: disease (name/key), lat, lng, state, limit."""
    if request.method == "POST":
        data = request.get_json(silent=True) or {}
        disease = (data.get("disease") or "").strip() or None
        lat = data.get("lat"); lng = data.get("lng")
        state = (data.get("state") or "").strip() or None
        limit = data.get("limit", 3)
    else:
        disease = (request.args.get("disease") or "").strip() or None
        lat = request.args.get("lat"); lng = request.args.get("lng")
        state = request.args.get("state") or None
        limit = request.args.get("limit", "3")

    if not disease:
        return _cors(jsonify({"error": "disease parameter required"})), 400

    meds = load_medicines()
    key = _map_disease_key(disease)
    entry = meds["diseases"].get(key) if key else None
    if entry is None:
        entry = meds["general"]

    hospitals = nearby_hospitals(
        lat=float(lat) if lat else None,
        lng=float(lng) if lng else None,
        state=state,
        limit=max(1, min(int(limit or 3), 10)),
    )

    result = {
        "disease": {
            "requested": disease,
            "key": key,
            "bn_name": entry.get("bn_name"),
            "category": entry.get("category"),
            "report": entry.get("report"),
            "vaccine": entry.get("vaccine"),
        },
        "medicines": entry.get("medicines", []),
        "care": entry.get("care"),
        "hospitals": {
            "helpline": meds.get("helpline", "1962"),
            "nearby": hospitals,
        },
        "disclaimer": meds.get("disclaimer", ""),
        "location_used": {"lat": float(lat) if lat else None, "lng": float(lng) if lng else None, "state": state},
    }
    return _cors(jsonify(result))


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "bot": "SmartBot"})


if __name__ == "__main__":
    print("[PashuSahaya] Warming up SpeciesNet + custom disease models...", flush=True)
    load_speciesnet()
    load_custom_models()
    print("[PashuSahaya] Models ready — serving on http://127.0.0.1:5000", flush=True)
    app.run(host="0.0.0.0", port=5000, debug=False, use_reloader=False, threaded=True)
