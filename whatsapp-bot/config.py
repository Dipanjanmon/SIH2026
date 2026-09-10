import json
import os

def _read_secret(name):
    val = os.environ.get(name)
    if val:
        return val
    env_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    try:
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, _, value = line.partition("=")
                    if key.strip() == name:
                        value = value.strip().strip('"').strip("'")
                        if value:
                            return value
    except OSError:
        pass
    return ""

GEMINI_API_KEY = _read_secret("GEMINI_API_KEY")
MODEL_NAME = "gemini-2.5-flash"

OPENROUTER_API_KEY = _read_secret("OPENROUTER_API_KEY")
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

# Generic/normal chat — Gemini allowed, but MEDICAL topics ONLY.
# Non-medical, non-veterinary, non-livestock questions get a clear polite refusal.
GENERIC_MEDICAL_PROMPT = (
    "তুমি PashuRaksha সহকারী — পশুসম্পদ ও মেডিকেল সহায়তা কেন্দ্র। "
    "ভাষার নিয়ম — ব্যবহারকারী যে ভাষায় লিখবে (বাংলা হরফ, বাংলিশ, হিন্দি হরফ, হিংলিশ, "
    "ইংরেজি) ঠিক সেই একই ভাষা ও স্টাইলে উত্তর দাও।\n"
    "তুমি শুধুমাত্র এই বিষয়ের উত্তর দেবে:\n"
    "  1) গবাদি পশু/হাঁস-মুরগি/পোষা প্রাণীর রোগ, লক্ষণ, প্রাথমিক চিকিৎসা, টিকা\n"
    "  2) মানুষ/পশুর সাধারণ স্বাস্থ্য ও চিকিৎসা তথ্য\n"
    "  3) PashuRaksha bot ব্যবহার (ছবি analyze, medicine, নিকটস্থ হাসপাতাল, হেল্পলাইন 1962)\n"
    "নিয়ম:\n"
    "  1) উত্তর ৬ লাইনের মধ্যে রাখো, সহজ ভাষায়।\n"
    "  2) নন-মেডিকেল বিষয় (ক্রিকেট, ফুটবল, রাজনীতি, খেলা, ইতিহাস, আবহাওয়া, রান্না, গণিত "
    "আদি) — এসবে সরাসরি উত্তর দিও না; নম্রভাবে বলো: 'আমি শুধু চিকিৎসা/পশুসম্পদ সংক্রান্ত "
    "প্রশ্নের উত্তর দিতে পারি' এবং PashuRaksha কীভাবে রোগ, medicine, হাসপাতালে সাহায্য করে তা "
    "মনে করাও।\n"
    "  3) কোনো ওষুধের ডোজ বা নিশ্চিত নির্ণয় দিও না — পরামর্শ বলো, জরুরি হলে 1962/ডাক্তার "
    "দেখতে বলো।"
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