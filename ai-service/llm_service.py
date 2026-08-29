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


GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
GEMINI_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

LANGUAGE_NAMES = {
    "hi-IN": "Hindi", "mr-IN": "Marathi", "bn-IN": "Bengali", "pa-IN": "Punjabi",
    "te-IN": "Telugu", "ta-IN": "Tamil", "gu-IN": "Gujarati", "en-IN": "English",
    "hi": "Hindi", "mr": "Marathi", "bn": "Bengali", "pa": "Punjabi",
    "te": "Telugu", "ta": "Tamil", "gu": "Gujarati", "en": "English",
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
        """Try each available key in order until one succeeds."""
        available = self._available_keys()
        if not available:
            return None

        for key in available:
            try:
                url = GEMINI_URL_TEMPLATE.format(model=self.model)
                resp = requests.post(
                    url,
                    params={"key": key},
                    headers={"Content-Type": "application/json"},
                    json={
                        "contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": {
                            "temperature": 0.4,
                            "maxOutputTokens": 500,
                            "topP": 0.9,
                        },
                    },
                    timeout=15,
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
