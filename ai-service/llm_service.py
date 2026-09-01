"""
PashuRaksha LLM Service — Gemini Flash with multi-key failover.

Purpose: Wrap the rule-based diagnosis (chat_engine + treatment + intelligence)
in natural, conversational language in the farmer's own language.

Design principles:
- Multi-key failover: rotates through several API keys; if one is rate-limited
  or fails, automatically tries the next. Never blocks the user.
- Graceful degradation: if ALL keys fail, returns the rule-based response as-is.
  The rule-based engine is ALWAYS the source of truth for medical facts —
  the LLM only rephrases, never invents diagnoses.
- Zero-cost demo mode: works fully without any API key (returns structured
  rule-based text). LLM is an enhancement layer, not a dependency.
"""

import os
import json
import time
import requests
from typing import Dict, List, Optional
from dotenv import load_dotenv

load_dotenv()

# --- Multi-key configuration ---
# Keys can be provided via env vars GEMINI_API_KEY, GEMINI_API_KEY_2, ... GEMINI_API_KEY_5
# or a comma-separated GEMINI_API_KEYS. Empty list = LLM disabled (rule-based only).

def _load_keys() -> List[str]:
    keys: List[str] = []
    # Comma-separated bundle
    bundle = os.getenv("GEMINI_API_KEYS", "")
    if bundle:
        keys.extend([k.strip() for k in bundle.split(",") if k.strip()])
    # Individual keys
    for suffix in ["", "_2", "_3", "_4", "_5"]:
        k = os.getenv(f"GEMINI_API_KEY{suffix}", "").strip()
        if k and k not in keys:
            keys.append(k)
    return keys


GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

LANGUAGE_NAMES = {
    "hi-IN": "Hindi", "mr-IN": "Marathi", "bn-IN": "Bengali", "pa-IN": "Punjabi",
    "te-IN": "Telugu", "ta-IN": "Tamil", "gu-IN": "Gujarati", "en-IN": "English",
    "hi": "Hindi", "mr": "Marathi", "bn": "Bengali", "pa": "Punjabi",
    "te": "Telugu", "ta": "Tamil", "gu": "Gujarati", "en": "English",
}

# Shown when an uploaded image is not a livestock animal. Keeps the tool on-scope.
LIVESTOCK_REFUSAL = {
    "en-IN": "This does not look like a farm animal. Please upload a clear photo of your cattle, buffalo, goat, sheep, or poultry.",
    "hi-IN": "यह किसी पशु की तस्वीर नहीं लगती। कृपया अपनी गाय, भैंस, बकरी, भेड़ या मुर्गी की साफ़ तस्वीर भेजें।",
    "mr-IN": "ही पशुची छायाचित्र वाटत नाही. कृपया तुमची गाय, म्हैस, शेळी, मेंढी किंवा कोंबडीचे स्पष्ट छायाचित्र पाठवा.",
    "bn-IN": "এটি খামারের পশুর ছবি বলে মনে হচ্ছে না। অনুগ্রহ করে আপনার গরু, মহিষ, ছাগল, ভেড়া বা মুরগির স্পষ্ট ছবি দিন।",
    "pa-IN": "ਇਹ ਪਸ਼ੂ ਦੀ ਤਸਵੀਰ ਨਹੀਂ ਲੱਗਦੀ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਗਾਂ, ਮੱਝ, ਬੱਕਰੀ, ਭੇਡ ਜਾਂ ਮੁਰਗੀ ਦੀ ਸਾਫ਼ ਤਸਵੀਰ ਭੇਜੋ।",
    "te-IN": "ఇది పశువు చిత్రంలా లేదు. దయచేసి మీ ఆవు, గేదె, మేక, గొర్రె లేదా కోడి స్పష్టమైన ఫోటో పంపండి.",
    "ta-IN": "இது கால்நடையின் படமாகத் தெரியவில்லை. உங்கள் மாடு, எருமை, ஆடு, செம்மறி அல்லது கோழியின் தெளிவான படத்தை அனுப்பவும்.",
    "gu-IN": "આ પશુની તસવીર જણાતી નથી. કૃપા કરીને તમારી ગાય, ભેંસ, બકરી, ઘેટાં કે મરઘીની સ્પષ્ટ તસવીર મોકલો.",
}


class LLMService:
    def __init__(self):
        self.keys = _load_keys()
        self.model = GEMINI_MODEL
        # Track failed keys with a cooldown timestamp so we skip them temporarily
        self._key_cooldown: Dict[str, float] = {}
        self._cooldown_seconds = 60

    @property
    def enabled(self) -> bool:
        return len(self.keys) > 0

    def _available_keys(self) -> List[str]:
        now = time.time()
        return [k for k in self.keys if self._key_cooldown.get(k, 0) < now]

    def enhance_diagnosis(self, rule_result: Dict, language: str = "hi-IN",
                          user_message: str = "") -> Dict:
        """
        Takes the rule-based diagnosis result and produces a natural-language
        response in the requested language. Falls back to rule-based text if
        LLM is unavailable.

        The rule_result stays authoritative — we return it augmented with an
        'llm_response' field and set 'response_source'.
        """
        if not self.enabled or not self._available_keys():
            rule_result = dict(rule_result)
            rule_result["response_source"] = "rule-based"
            return rule_result

        prompt = self._build_prompt(rule_result, language, user_message)
        llm_text = self._call_with_failover(prompt)

        result = dict(rule_result)
        if llm_text:
            result["llm_response"] = llm_text
            result["response"] = llm_text  # override display text with natural language
            result["response_source"] = "gemini-flash"
        else:
            result["response_source"] = "rule-based-fallback"
        return result

    def chat(self, message: str, language: str = "hi-IN",
             context: str = "") -> Optional[str]:
        """Free-form conversational chat (for general questions, not diagnosis)."""
        if not self.enabled or not self._available_keys():
            return None
        lang_name = LANGUAGE_NAMES.get(language, "Hindi")
        prompt = (
            f"You are PashuRaksha, a livestock health assistant for Indian farmers. "
            f"Answer helpfully and briefly in {lang_name}. "
            f"Only discuss livestock health, diseases, treatment, vaccination, and farming. "
            f"If asked something unrelated, politely redirect to animal health.\n\n"
            f"{('Context: ' + context) if context else ''}\n\n"
            f"Farmer's question: {message}"
        )
        return self._call_with_failover(prompt)

    def analyze_image(self, image_bytes: bytes, mime_type: str = "image/jpeg",
                      language: str = "hi-IN", cnn_hint: str = "",
                      symptoms: str = "") -> Optional[Dict]:
        """
        Multimodal: send the ACTUAL photo to Gemini (which can see it) along with
        the local CNN's guess and any described symptoms. Gemini identifies the
        animal + likely disease + gives advice in the farmer's language.

        This is the catch-all for animals/diseases the CNN was never trained on
        (buffalo, sheep, pig, specific goat diseases, etc.). Returns None if the
        LLM is unavailable, so callers fall back to the CNN + rule-based path.

        Returns a dict: {animal, disease, is_healthy, confidence_note, advice, raw}.
        """
        if not self.enabled or not self._available_keys() or not image_bytes:
            return None

        import base64
        lang_name = LANGUAGE_NAMES.get(language, "Hindi")
        b64 = base64.b64encode(image_bytes).decode("ascii")

        hint = f"A local image model guessed: {cnn_hint}. " if cnn_hint else ""
        symp = f"The farmer also describes: {symptoms}. " if symptoms else ""

        # Ask for a compact, parseable answer AND farmer-friendly advice in one shot.
        # First gate: is this actually a farm/livestock animal? Refuse everything else.
        refusal = LIVESTOCK_REFUSAL.get(language, LIVESTOCK_REFUSAL["en-IN"])
        instruction = (
            "You are PashuRaksha AI, a LIVESTOCK health assistant for Indian farmers. "
            "You ONLY help with farm/livestock animals: cattle, buffalo, goat, sheep, "
            "poultry/chicken, and pig. "
            "First, decide if the image clearly shows one of these livestock animals. "
            f"{hint}{symp}"
            "Treat the local model's guess as a hint only — trust what you actually see. "
            "Respond in STRICT JSON with these keys and nothing else:\n"
            '{"is_farm_animal": <true|false>, '
            '"animal": "<cattle|buffalo|goat|sheep|poultry|pig|other>", '
            '"disease": "<most likely disease or \'appears healthy\'>", '
            '"is_healthy": <true|false>, '
            '"confidence": "<high|medium|low>", '
            f'"advice": "<2-3 short sentences of first-aid + when to call a vet, in {lang_name}>"}}\n'
            "RULES: If the image is NOT a livestock animal (e.g. a person, pet dog/cat, "
            "car, food, plant, scenery, screenshot, or anything else), set "
            'is_farm_animal=false, animal="other", and set advice to EXACTLY this text: '
            f'"{refusal}". Do NOT describe or analyze non-livestock images. '
            "Do NOT invent specific drug dosages — keep advice to first aid and vet referral."
        )

        parts = [
            {"inline_data": {"mime_type": mime_type, "data": b64}},
            {"text": instruction},
        ]
        # Vision + JSON needs more tokens and a longer read timeout than text rephrasing.
        raw = self._call_parts(parts, max_tokens=600, read_timeout=25)
        if not raw:
            return None

        return self._parse_vision_json(raw, language)

    def livestock_refusal(self, language: str = "en-IN") -> str:
        """The localized 'please upload a livestock photo' message."""
        return LIVESTOCK_REFUSAL.get(language, LIVESTOCK_REFUSAL["en-IN"])

    def is_livestock_image(self, image_bytes: bytes, mime_type: str = "image/jpeg") -> bool:
        """
        Fast, always-on scope gate: asks Gemini a single yes/no — is this a farm/
        livestock animal? Tiny prompt + tiny output = quick and cheap, so it can run
        on EVERY image (closing the high-CNN-confidence ceiling).

        Fails OPEN: if the LLM is unavailable (no key/offline), returns True so the
        tool still works without the LLM (the CNN-only path stays functional).
        """
        if not self.enabled or not self._available_keys() or not image_bytes:
            return True  # can't check -> don't block

        import base64
        b64 = base64.b64encode(image_bytes).decode("ascii")
        parts = [
            {"inline_data": {"mime_type": mime_type, "data": b64}},
            {"text": (
                "Does this image clearly show a farm/livestock animal "
                "(cattle, buffalo, goat, sheep, chicken/poultry, or pig)? "
                "Answer with ONLY one word: YES or NO."
            )},
        ]
        # Very small output; short timeout keeps the request snappy.
        raw = self._call_parts(parts, max_tokens=5, read_timeout=12)
        if raw is None:
            return True  # call failed -> fail open
        return "yes" in raw.strip().lower()

    # Livestock species we accept. Anything else is out of scope.
    _LIVESTOCK = {"cattle", "buffalo", "goat", "sheep", "poultry", "chicken", "pig"}

    @classmethod
    def _parse_vision_json(cls, raw: str, language: str = "en-IN") -> Dict:
        """Extract the JSON object from the model's reply (it sometimes wraps it in
        ```json fences or prose). Enforces the livestock-only gate in code so a
        non-farm-animal image is rejected even if the model's wording drifts."""
        refusal = LIVESTOCK_REFUSAL.get(language, LIVESTOCK_REFUSAL["en-IN"])
        text = raw.strip()
        # Strip code fences if present
        if "```" in text:
            import re
            m = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
            if m:
                text = m.group(1)
        # Grab the first {...} block
        start, end = text.find("{"), text.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                data = json.loads(text[start:end + 1])
                data["raw"] = raw
                # Code-level gate: reject if the model flagged non-farm-animal OR the
                # animal isn't in our livestock set. Don't trust prompt-only refusal.
                animal = str(data.get("animal", "")).lower()
                is_farm = data.get("is_farm_animal")
                if is_farm is False or (animal not in cls._LIVESTOCK):
                    return {"rejected": True, "is_farm_animal": False, "animal": "other",
                            "disease": None, "is_healthy": None, "confidence": "low",
                            "advice": refusal, "raw": raw}
                return data
            except Exception:
                pass
        # Couldn't parse the model's JSON — be safe and reject rather than show noise.
        return {"rejected": True, "is_farm_animal": None, "animal": "unknown",
                "disease": None, "is_healthy": None, "confidence": "low",
                "advice": refusal, "raw": raw}

    def _build_prompt(self, r: Dict, language: str, user_message: str) -> str:
        lang_name = LANGUAGE_NAMES.get(language, "Hindi")
        disease = r.get("identified_disease") or r.get("probable_disease") or "Unknown"
        confidence = int((r.get("confidence") or 0) * 100)
        risk = r.get("risk_level", "UNKNOWN")

        treatment = r.get("treatment", {})
        first_aid = treatment.get("first_aid", [])[:4] if isinstance(treatment, dict) else []
        intel = r.get("intelligence", {})
        herd = intel.get("herd_risk", {}) if isinstance(intel, dict) else {}
        outbreak = intel.get("outbreak_status", {}) if isinstance(intel, dict) else {}

        # Give the LLM the FACTS; instruct it to only rephrase, not invent.
        facts = {
            "disease": disease,
            "confidence_percent": confidence,
            "risk_level": risk,
            "first_aid_steps": first_aid,
            "herd_risk": herd.get("message", ""),
            "outbreak_status": outbreak.get("message", ""),
            "recovery_time": treatment.get("recovery_time", "") if isinstance(treatment, dict) else "",
        }

        return (
            f"You are PashuRaksha AI, a trusted livestock health assistant for Indian farmers "
            f"(many with low literacy). A veterinary rule-based system has already diagnosed the case. "
            f"Your ONLY job is to explain these EXACT facts warmly and clearly in {lang_name}. "
            f"DO NOT invent new medical facts, drugs, or diagnoses. DO NOT change the disease or numbers. "
            f"Keep it short (4-6 sentences), reassuring, and action-oriented. "
            f"Start with the disease name and how serious it is, then the top 2-3 immediate actions, "
            f"then when to call the vet.\n\n"
            f"Farmer said: \"{user_message}\"\n\n"
            f"Diagnosis facts (do not alter):\n{json.dumps(facts, ensure_ascii=False, indent=2)}\n\n"
            f"Now write the response in {lang_name}:"
        )

    def _call_with_failover(self, prompt: str) -> Optional[str]:
        """Text-only convenience wrapper around _call_parts."""
        return self._call_parts([{"text": prompt}])

    def _call_parts(self, parts: list, max_tokens: int = 400,
                    read_timeout: int = 12) -> Optional[str]:
        """Try each available key in order until one succeeds. `parts` is the Gemini
        content parts list — text-only or text+inline image (multimodal)."""
        available = self._available_keys()
        if not available:
            return None

        for key in available:
            try:
                url = GEMINI_URL_TEMPLATE.format(model=self.model)
                resp = requests.post(
                    url,
                    # Auth via x-goog-api-key header — works for both legacy standard
                    # keys and the newer authorization keys (AQ.* format). Query-param
                    # (?key=) auth does NOT work for auth keys.
                    headers={"Content-Type": "application/json", "x-goog-api-key": key},
                    json={
                        "contents": [{"parts": parts}],
                        "generationConfig": {
                            "temperature": 0.4,
                            "maxOutputTokens": max_tokens,
                            "topP": 0.9,
                            # Gemini 2.5 "thinks" before answering by default, which adds
                            # real latency for a task that's just rephrasing known facts.
                            # thinkingBudget=0 skips that step for fast, snappy replies.
                            "thinkingConfig": {"thinkingBudget": 0},
                        },
                    },
                    # (connect timeout, read timeout) — fail over to the next key fast
                    # instead of leaving a farmer staring at a spinner. Vision needs
                    # a longer read timeout than text.
                    timeout=(5, read_timeout),
                )

                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        text = "".join(p.get("text", "") for p in parts).strip()
                        if text:
                            return text
                    # Empty response — try next key
                    continue

                elif resp.status_code in (429, 403):
                    # Rate limited or quota — cooldown this key, try next
                    self._key_cooldown[key] = time.time() + self._cooldown_seconds
                    print(f"[LLM] Key rate-limited/quota ({resp.status_code}), failing over...")
                    continue

                else:
                    # Other error — try next key
                    print(f"[LLM] Key returned {resp.status_code}, trying next...")
                    continue

            except requests.exceptions.Timeout:
                print("[LLM] Timeout, trying next key...")
                continue
            except Exception as e:
                print(f"[LLM] Error: {e}, trying next key...")
                continue

        # All keys exhausted
        return None

    def status(self) -> Dict:
        """Health/status of the LLM layer."""
        return {
            "enabled": self.enabled,
            "total_keys": len(self.keys),
            "available_keys": len(self._available_keys()),
            "model": self.model,
            "mode": "gemini-flash" if self.enabled else "rule-based-only",
        }
