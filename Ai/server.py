from flask import Flask, request, jsonify, Response
from chat import generate_reply, clear_history
from voice_engine import tts_to_bytes, detect_lang
from config import GEMINI_API_KEY, get_system_prompt, OPENROUTER_API_KEY, OPENROUTER_MODEL, MEDICAL_SYSTEM_PROMPT
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


def get_model(tone="male"):
    if tone not in CHAT_TONES:
        tone = "male"
    m = _chat_models.get(tone)
    if m is None:
        genai.configure(api_key=GEMINI_API_KEY)
        m = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            system_instruction=get_system_prompt(tone),
            generation_config=genai.GenerationConfig(temperature=0.7, max_output_tokens=500),
        )
        _chat_models[tone] = m
    return m


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


def ai_reply(message: str, tone: str = "male") -> str:
    # Try Gemini first, then OpenRouter (free model), then None -> offline
    try:
        m = get_model(tone)
        resp = m.generate_content(message)
        return resp.text or "হুম..."
    except Exception:
        pass
    try:
        return openrouter_reply(message, get_system_prompt(tone))
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

    reply = ai_reply(message, tone)
    if not reply:
        resp = jsonify({"reply": None, "lang": detect_lang(message), "offline": True})
        resp.headers["Access-Control-Allow-Origin"] = "*"
        return resp

    resp = jsonify({"reply": reply, "lang": detect_lang(message), "offline": False})
    resp.headers["Access-Control-Allow-Origin"] = "*"
    return resp


def _medical_flow(user_id, message, tone):
    """Real-time medical conversation with persistent session history."""
    hist = get_session(user_id) or []
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
    if not text:
        return jsonify({"error": "no text"}), 400
    audio = asyncio.run(tts_to_bytes(text, tone))
    if not audio:
        return jsonify({"error": "no audio"}), 502
    resp = Response(audio, mimetype="audio/mpeg")
    resp.headers["Access-Control-Allow-Origin"] = "*"
    resp.headers["Cache-Control"] = "no-store"
    return resp


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
            model_name="gemini-2.0-flash",
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


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "bot": "SmartBot"})


if __name__ == "__main__":
    print("[PashuSahaya] Warming up SpeciesNet + custom disease models...", flush=True)
    load_speciesnet()
    load_custom_models()
    print("[PashuSahaya] Models ready — serving on http://127.0.0.1:5000", flush=True)
    app.run(host="0.0.0.0", port=5000, debug=False, use_reloader=False, threaded=True)
