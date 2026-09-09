import asyncio
import re
import edge_tts

VOICE_MAP = {
    "bn": ("bn-IN-BashkarNeural", "bn-IN-TanishaaNeural"),
    "hi": ("hi-IN-MadhurNeural", "hi-IN-SwaraNeural"),
    "ur": ("ur-PK-SalmanNeural", "ur-PK-UzmaNeural"),
    "en": ("en-IN-PrabhatNeural", "en-IN-NeerjaNeural"),
}

_HI_ONLY = re.compile(r"\b(kaise|kya|main|aap|tum|hum|hai|ho|kaam|chahiye|batao|madad|kyun|kab|hoga|karne|sabse|aisa|waise)\b", re.I)
_BN_ONLY = re.compile(r"\b(kemon|obostha|korcho|valo|bhalo|dhonyobad|apni|chakri|poysa|tokar|vai|bhai|korte|lagbe|korbo|likhi|ache|ase|sobar)\b", re.I)
_BANGLISH = re.compile(r"\b(kemon|obostha|korcho|bolo|valo|bhalo|dhonyobad|ami|tumi|apni|kotha|chakri|tokar|poysa|mon|vai|bhai|korte|lagbe|korbo|koro|likhi|likhte|hobe|acha|thik|ache|ase|sobar|ki|na|ar)\b", re.I)
_HINGLISH = re.compile(r"\b(main|tum|kaise|kya|hai|kaam|chahiye|naam|acha|thik|badiya|shukriya|bolo|batao|madad|sawal|sabse|apna|apni|kuch|karo|karne|hoga|tha|hum|aap|kaun|kyun|kab)\b", re.I)
_URDU = re.compile(r"\b(salam|aap|kaise|chahiye|shukriya|acha|main|hai)\b", re.I)
_ENGLISH = re.compile(r"\b(how|are|you|what|career|job|money|code|hello|hi|thanks|help|work|tell|me|the|and|can|do)\b", re.I)


def detect_lang(text: str) -> str:
    t = text.strip()
    if not t:
        return "en"
    for ch in t:
        o = ord(ch)
        if 0x0980 <= o <= 0x09FF:
            return "bn"
        if 0x0900 <= o <= 0x097F:
            return "hi"
        if 0x0600 <= o <= 0x06FF:
            return "ur"
    d_bn = len(_BN_ONLY.findall(t))
    d_hi = len(_HI_ONLY.findall(t))
    if d_hi > d_bn:
        return "hi"
    if d_bn > 0:
        return "bn"
    lbn = len(_BANGLISH.findall(t))
    lhi = len(_HINGLISH.findall(t))
    if lbn > 0 and lbn >= lhi:
        return "bn"
    if lhi > 0:
        return "hi"
    if len(_URDU.findall(t)) > 0:
        return "ur"
    return "en"


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