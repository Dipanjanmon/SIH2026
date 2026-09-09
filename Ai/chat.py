"""Generic SmartBot chat — intentionally Gemini-free.

The Gemini API key is reserved for MEDICAL/VETERINARY endpoints only
(see server.py: get_vet_model / get_med_model). The generic /webhook entry
talks to the AI doctor anyway for anything animal related; for everything else
it uses this lightweight keyword fallback so no key is spent.
"""

import re

chat_sessions = {}


def clear_history(user_id: str):
    chat_sessions.pop(user_id, None)


def _fallback(message: str) -> str:
    t = (message or "").lower()
    if any(w in t for w in ("fever", "jor", "jwor", "dana", "lumpy", "fmd", "disease", "rog")):
        return ("গরুর জ্বর/রোগ-সংক্রান্ত প্রশ্নের জন্য আমি তোমাকে পশু ডাক্তারের কাছে পাঠাচ্ছি — "
                "AI সার্ভারে চ্যাট করুন। পশুর ছবি পাঠালে রোগ ধরে medicine + নিকটস্থ হাসপাতাল দেখাবে। "
                "আরও বিস্তারিত: 📍 লোকেশন শেয়ার করলে nearest hospital।")
    if any(w in t for w in ("vaccin", "tika", "টিকা")):
        return "টিকাদান (NADCP) — FMD ৬ মাস অন্তর। বিস্তারিত: নিকটস্থ প্রাণিসম্পদ দপ্তর 1962।"
    if any(w in t for w in ("help", "menu", "hi", "hello")):
        return "📋 কমান্ড: `.menu` `.medicine` `.voice on/off` `.clear` — সাহায্য: 1962"
    return ("বট অনলাইন ✅। পশুর ছবি পাঠাও (AI analyze), 📍 লোকেশন শেয়ার করো (medicine+hospital), "
            "বা স্বাস্থ্য-প্রশ্ন লিখো।")


async def generate_reply(user_id: str, message: str, tone: str = "male") -> str:
    # in-memory turn memory (সর্বশেষ ৮ টার্ন)
    hist = chat_sessions.setdefault(user_id, [])
    hist.append(message)
    del hist[:-8]
    return _fallback(message)