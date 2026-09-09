import json
import os

GEMINI_API_KEY = "AIzaSyDESwvWxmvGgcCfd5ZJNt2pI4QkNNXFiGI"
MODEL_NAME = "gemini-2.0-flash"

OPENROUTER_API_KEY = "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"
OPENROUTER_MODEL = "qwen/qwen-2.5-72b-instruct"

MEDICAL_SYSTEM_PROMPT = (
    "তুমি একজন মেডিকেল তথ্যদাতা সহকারী (Medical Assistant)। শুধুমাত্র চিকিৎসা/স্বাস্থ্য "
    "সম্পর্কিত প্রশ্নের উত্তর দেবে।\n"
    "ভাষার নিয়ম — ব্যবহারকারী যে ভাষায় লিখবে (বাংলা হরফ, বাংলিশ, হিন্দি হরফ, হিংলিশ, "
    "ইংরেজি) ঠিক সেই একই ভাষা ও স্টাইলে উত্তর দাও।\n"
    "দুটি জরুরি নিয়ম:\n"
    "1) তোমার উত্তর কোনো ডাক্তারি নির্ণয় বা চিকিৎসা নয় — সাধারণ তথ্যই।\n"
    "2) গুরুতর লক্ষণ (বুকে ব্যথা, শ্বাসকষ্ট, প্রচণ্ড রক্তক্ষরণ, অজ্ঞান, আত্মহত্যার চিন্তা) হলে "
    "অবিলম্বে নিকটস্থ হাসপাতাল বা জাতীয় জরুরি সেবা (999) নেওয়ার দৃঢ় পরামর্শ দাও।\n"
    "৩টি অংশে উত্তর দাও: ১) পরিস্থিতির সহজ ব্যাখ্যা, ২) সাধারণ ঘরোয়া/প্রাথমিক ব্যবস্থা, "
    "৩) কখন ডাক্তার দেখাতে হবে। ছোট রাখো। কোনো ঔষধের ডোজ দিও না।"
)

_TONE_FILE = os.path.join(os.path.dirname(__file__), "tone.json")


def load_tones():
    with open(_TONE_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


TONE_CONFIG = load_tones()
ACTIVE_TONE = TONE_CONFIG["default_tone"]

def get_system_prompt(tone_id=None):
    tone_id = tone_id or ACTIVE_TONE
    tone = TONE_CONFIG["tones"].get(tone_id, list(TONE_CONFIG["tones"].values())[0])
    return tone["system_prompt"]


def set_active_tone(tone_id):
    global ACTIVE_TONE
    if tone_id in TONE_CONFIG["tones"]:
        ACTIVE_TONE = tone_id
        return True
    return False


SYSTEM_PROMPT = get_system_prompt()