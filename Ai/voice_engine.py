import asyncio
import re
import edge_tts

VOICE_MAP = {
    "bn": ("bn-IN-BashkarNeural", "bn-IN-TanishaaNeural"),
    "hi": ("hi-IN-MadhurNeural", "hi-IN-SwaraNeural"),
    "ur": ("ur-PK-SalmanNeural", "ur-PK-UzmaNeural"),
    "en": ("en-IN-PrabhatNeural", "en-IN-NeerjaNeural"),
}

# ---- Language detection ----------------------------------------------------- #
# Strategy: script check first (Bengali/Devanagari/Urdu chars). For romanized
# text we score strongly-marking words (BN_ONLY / HI_ONLY — never overlap) then
# a wider but still distinctive set (_BANGLISH / _HINGLISH). Words shared by
# both scripts (bhai, bolo, acha, thik, jor...) are deliberately NOT in the
# `_ONLY` sets, so the majority marker decides.
_BN_ONLY = re.compile(
    r"\b(kemon|obostha|korcho|korchi|valo|bhalo|dhonyobad|dhannobad|apni|tumi|tui|amar|tomar|apnar|"
    r"korbo|korben|korbe|korte|lagbe|laglo|likhi|likhte|ache|ase|hoise|hoilo|hoyeche|hoyna|hochche|"
    r"korechi|koreche|diyeche|niyeche|aseche|chai|chay|hoi|hoye|hocche|hoyechi|"
    r"ki\b|na\b|ar\b|o\b|ei\b|shei\b|eta|oti|keno|kono|jono|tokhon|ekhon|tarpor|abar|kirobh|"
    r"kibhabe|kemon|kon|kothay|jabe|jan|jaan|jani|janina|bolo|bole|bolben|dilo|dilam|debo|dibe|"
    r"gelo|gele|jabo|khabo|khete|shikhe|porbo|porle|bujhi|bujhte|mone|mon|bhoy|swapne|thik)\b",
    re.I | re.X)
_HI_ONLY = re.compile(
    r"\b(main|tum|aap|hum|mera|tera|apna|aisa|waise|mujhe|tera|tere|kaise|kya|kahaan|kyun|kab|kaun|"
    r"hai|hain|ho|tha|thi|the|hoga|hogi|karne|karna|karo|karta|kya\b|nahi|bahut|chahiye|chahie|naam|"
    r"baat|samajh|batao|bataiye|sunao|madhur|shukriya|namaste|madad|sawaal|pehle|baad|abhi|yaha|waha|"
    r"kuch|rakho|rakha|rakhna|hai\b|kar\b|dekh|dekho|jaldi|arr|fir|phir|aur)\b", re.I | re.X)
# wider distinctive vocabulary (still mostly unique to one script)
_BANGLISH = re.compile(
    r"\b(kemon|obostha|korcho|korchi|bolo|bolen|valo|bhalo|dhonyobad|dhannobad|ami|tumi|apni|kotha|"
    r"chakri|tokar|poysa|taka|mon|mone|vai|bhai|korte|korbo|korben|lagbe|korbo|koro|koren|likhi|"
    r"likhte|hobe|hoy|hoise|hoilo|hoyeche|hoyche|hoyechi|ache|ase|korechi|koreche|diyeche|niyeche|"
    r"sobar|ki\b|na\b|ar\b|o\b|ei\b|shei\b|amar|tomar|apnar|"
    r"keno|kono|kibhabe|kothay|khete|khabo|debo|dibe|gelo|gele|jabo|bujhi|thik\b|vul|jinis|kam|"
    r"goru|gari|gai|gaay|dodh|boda|khan|para|basha|orshe|but|din|rat|kal|aj|dekhi|das|korim|"
    r"samne|pichone|matha|hate|pa\b|mukh|chokh|kan|nasik|thanda|garma|jor\b)\b", re.I | re.X)
_HINGLISH = re.compile(
    r"\b(main|tum|aap|hum|kaise|kya|hai|hain|ho|kaam|chahiye|chahie|naam|acha|thik|badiya|shukriya|"
    r"batao|bataiye|madad|sawal|prashna|sabse|apna|apni|kuch|karo|karne|karna|hoga|hogi|tha|tha|"
    r"kaun|kyun|kab|mujhe|mera|tera|apna|bahut|rah|rakha|rakho|dekh|dekho|sun|meri|tumhara|aapka|"
    r"kia|krke|hoti|hota|chahiye|bolo\b)\b", re.I | re.X)
_URDU = re.compile(r"\b(salam|aap|kaise|chahiye|chahie|shukriya|acha|main|hai|kya|mirza|khan|bhai)\b", re.I)
_ENGLISH = re.compile(
    r"\b(the|and|you|your|are|was|what|this|that|with|have|has|how|can|for|when|where|tell|please|"
    r"help|need|want|veterinary|farmer|animal|cattle|disease|fever|injection|medicine|hospital|"
    r"please|thanks|thank|hello|hi\b|lumpy|foot|mouth|mastitis|newcastle|coccidiosis)\b", re.I | re.X)


def _token_matches(text: str) -> tuple[int, int]:
    """Returns (bn_marker_count, hi_marker_count) on word boundaries."""
    bn = len(_BANGLISH.findall(text))
    hi = len(_HINGLISH.findall(text))
    return bn, hi


def detect_lang(text: str) -> str:
    t = text.strip()
    if not t:
        return "en"
    # hard script check
    for ch in t:
        o = ord(ch)
        if 0x0980 <= o <= 0x09FF:
            return "bn"
        if 0x0900 <= o <= 0x097F:
            return "hi"
        if 0x0600 <= o <= 0x06FF:
            return "ur"
    # strong distinct markers first (each easy-to-accept word is decisive)
    dbn = len(_BN_ONLY.findall(t))
    dhi = len(_HI_ONLY.findall(t))
    if dhi > dbn:
        return "hi"
    if dbn > 0:
        return "bn"

    lbn, lhi = _token_matches(t)

    # urdu detection before English (urdu shares a lot with hinglish lists)
    if len(_URDU.findall(t)) >= 2 and lhi >= 2 and lbn == 0:
        return "ur"
    if lbn > 0 and lbn >= lhi:
        return "bn"
    if lhi > 0:
        return "hi"

    # late fallback: Banglish/Hinglish verb clustering
    bn_verbs = re.findall(r"\b\w{2,}(?:bo|chi|chece|lam|lo|ben|y)\b", t)
    hi_verbs = re.findall(r"\b\w{2,}(?:ta|te|na|o|a|ha|ya)\b", t)
    if len(bn_verbs) >= 2:
        return "bn"
    if len(hi_verbs) >= len(bn_verbs) + 2:
        return "hi"
    if len(_ENGLISH.findall(t)) > 0:
        return "en"
    return "bn"  # last resort: multilingual farming chatter is usually Banglish


async def tts_to_bytes(text: str, tone: str = "male", lang: str = None) -> bytes:
    lang = lang or detect_lang(text)
    male, female = VOICE_MAP.get(lang, VOICE_MAP["en"])
    voice = male if tone == "male" else female
    comm = edge_tts.Communicate(text, voice=voice)
    chunks = b""
    async for chunk in comm.stream():
        if chunk["type"] == "audio":
            chunks += chunk["data"]
    return chunks