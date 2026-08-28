"""
PashuRaksha AI Chat Advisory Engine v2
Proper symptom→disease diagnostic engine with:
- Comprehensive symptom vocabulary (English + Hindi + Marathi)
- Multi-factor scoring (symptom match + specificity + combinations)
- Lethal disease priority escalation
- Species-aware filtering
- Differential diagnosis with reasoning
"""

import re
from typing import Dict, List, Optional, Tuple
from collections import defaultdict


# =============================================================================
# SYMPTOM VOCABULARY — Every way a farmer might describe a symptom
# Maps to canonical symptom IDs used in disease matching
# =============================================================================

SYMPTOM_VOCABULARY = {
    # --- FEVER ---
    "fever": "FEVER", "temperature": "FEVER", "hot": "FEVER", "pyrexia": "FEVER",
    "bukhar": "FEVER", "taap": "FEVER", "jwara": "FEVER", "tap": "FEVER",
    "buhkaar": "FEVER", "garam": "FEVER",

    # --- ORAL LESIONS (blisters, ulcers in mouth) ---
    "blister": "ORAL_LESIONS", "blisters": "ORAL_LESIONS", "mouth_sore": "ORAL_LESIONS",
    "oral_lesions": "ORAL_LESIONS", "mouth_lesion": "ORAL_LESIONS", "ulcer": "ORAL_LESIONS",
    "ulcers": "ORAL_LESIONS", "vesicle": "ORAL_LESIONS", "vesicles": "ORAL_LESIONS",
    "mouth_blister": "ORAL_LESIONS", "tongue_sore": "ORAL_LESIONS", "tongue_lesion": "ORAL_LESIONS",
    "chhaale": "ORAL_LESIONS", "chhala": "ORAL_LESIONS", "muh_chhale": "ORAL_LESIONS",
    "mouth": "ORAL_LESIONS", "muh": "ORAL_LESIONS", "jibh": "ORAL_LESIONS",

    # --- SALIVATION / DROOLING ---
    "salivation": "SALIVATION", "drooling": "SALIVATION", "drool": "SALIVATION",
    "excessive_saliva": "SALIVATION", "slobber": "SALIVATION", "frothing": "SALIVATION",
    "raal": "SALIVATION", "laar": "SALIVATION", "jhag": "SALIVATION",

    # --- LAMENESS / LIMPING ---
    "limping": "LAMENESS", "limp": "LAMENESS", "lameness": "LAMENESS", "lame": "LAMENESS",
    "cant_walk": "LAMENESS", "difficulty_walking": "LAMENESS", "hoof_pain": "LAMENESS",
    "langda": "LAMENESS", "langadi": "LAMENESS", "pair_dard": "LAMENESS",
    "foot_pain": "LAMENESS", "hoof": "LAMENESS",

    # --- SKIN LESIONS / NODULES / LUMPS ---
    "skin_lesion": "SKIN_LESIONS", "skin_lesions": "SKIN_LESIONS", "nodule": "SKIN_LESIONS",
    "nodules": "SKIN_LESIONS", "lump": "SKIN_LESIONS", "lumps": "SKIN_LESIONS",
    "bumps": "SKIN_LESIONS", "bump": "SKIN_LESIONS", "skin_nodule": "SKIN_LESIONS",
    "raised_lesion": "SKIN_LESIONS", "skin_bump": "SKIN_LESIONS", "papule": "SKIN_LESIONS",
    "gilti": "SKIN_LESIONS", "gadde": "SKIN_LESIONS", "chamdi": "SKIN_LESIONS",
    "lumpy": "SKIN_LESIONS", "skin": "SKIN_LESIONS", "gath": "SKIN_LESIONS",

    # --- NASAL DISCHARGE ---
    "nasal_discharge": "NASAL_DISCHARGE", "nasal": "NASAL_DISCHARGE", "runny_nose": "NASAL_DISCHARGE",
    "nose_discharge": "NASAL_DISCHARGE", "snot": "NASAL_DISCHARGE", "mucus_nose": "NASAL_DISCHARGE",
    "nak": "NASAL_DISCHARGE", "naak": "NASAL_DISCHARGE", "nak_behna": "NASAL_DISCHARGE",

    # --- EYE DISCHARGE ---
    "eye_discharge": "EYE_DISCHARGE", "watery_eyes": "EYE_DISCHARGE", "tearing": "EYE_DISCHARGE",
    "eye_mucus": "EYE_DISCHARGE", "conjunctivitis": "EYE_DISCHARGE",
    "aankh": "EYE_DISCHARGE", "aankh_behna": "EYE_DISCHARGE",

    # --- DIARRHEA ---
    "diarrhea": "DIARRHEA", "diarrhoea": "DIARRHEA", "loose_motion": "DIARRHEA",
    "loose_stool": "DIARRHEA", "watery_stool": "DIARRHEA", "scour": "DIARRHEA",
    "dast": "DIARRHEA", "patlaa": "DIARRHEA", "patla": "DIARRHEA",
    "jullab": "DIARRHEA", "dysentery": "DIARRHEA",

    # --- COUGHING ---
    "cough": "COUGHING", "coughing": "COUGHING", "respiratory": "COUGHING",
    "khansi": "COUGHING", "khaansi": "COUGHING",

    # --- DIFFICULTY BREATHING ---
    "breathing": "DYSPNEA", "difficulty_breathing": "DYSPNEA", "dyspnea": "DYSPNEA",
    "breathless": "DYSPNEA", "gasping": "DYSPNEA", "labored_breathing": "DYSPNEA",
    "sans": "DYSPNEA", "saans": "DYSPNEA", "dam_ghutna": "DYSPNEA",
    "suffocate": "DYSPNEA", "cant_breathe": "DYSPNEA",

    # --- SWELLING ---
    "swelling": "SWELLING", "swollen": "SWELLING", "edema": "SWELLING",
    "oedema": "SWELLING", "enlarged": "SWELLING", "puffiness": "SWELLING",
    "sujan": "SWELLING", "soojan": "SWELLING", "phulna": "SWELLING",

    # --- NECK SWELLING (specific for HS) ---
    "neck": "NECK_SWELLING", "throat": "NECK_SWELLING", "neck_swelling": "NECK_SWELLING",
    "jaw_swelling": "NECK_SWELLING", "submandibular": "NECK_SWELLING",
    "gala": "NECK_SWELLING", "gardan": "NECK_SWELLING",

    # --- MILK REDUCTION / UDDER ---
    "milk_reduction": "MILK_ISSUES", "less_milk": "MILK_ISSUES", "no_milk": "MILK_ISSUES",
    "reduced_milk": "MILK_ISSUES", "milk_drop": "MILK_ISSUES", "poor_milk": "MILK_ISSUES",
    "doodh_kam": "MILK_ISSUES", "doodh": "MILK_ISSUES", "dudh": "MILK_ISSUES",
    "udder": "UDDER_PROBLEM", "teat": "UDDER_PROBLEM", "udder_swollen": "UDDER_PROBLEM",
    "udder_hard": "UDDER_PROBLEM", "clots": "UDDER_PROBLEM", "pus_milk": "UDDER_PROBLEM",
    "blood_milk": "UDDER_PROBLEM", "thaan": "UDDER_PROBLEM",

    # --- REDUCED APPETITE ---
    "not_eating": "ANOREXIA", "reduced_appetite": "ANOREXIA", "appetite_loss": "ANOREXIA",
    "anorexia": "ANOREXIA", "off_feed": "ANOREXIA", "wont_eat": "ANOREXIA",
    "khana_nahi": "ANOREXIA", "chara_nahi": "ANOREXIA", "bhuk_nahi": "ANOREXIA",

    # --- ABORTION ---
    "abortion": "ABORTION", "miscarriage": "ABORTION", "premature_birth": "ABORTION",
    "stillborn": "ABORTION", "aborted": "ABORTION",
    "pet_girana": "ABORTION", "bacha_girna": "ABORTION",

    # --- SUDDEN DEATH ---
    "sudden_death": "SUDDEN_DEATH", "died_suddenly": "SUDDEN_DEATH", "found_dead": "SUDDEN_DEATH",
    "sudden": "SUDDEN_DEATH", "death": "SUDDEN_DEATH", "dead": "SUDDEN_DEATH",
    "achanak_maut": "SUDDEN_DEATH", "mar_gaya": "SUDDEN_DEATH", "mara": "SUDDEN_DEATH",

    # --- BLOOD / HEMORRHAGE ---
    "blood": "HEMORRHAGE", "bleeding": "HEMORRHAGE", "bloody": "HEMORRHAGE",
    "hemorrhage": "HEMORRHAGE", "dark_blood": "HEMORRHAGE", "blood_oozing": "HEMORRHAGE",
    "khoon": "HEMORRHAGE", "lahu": "HEMORRHAGE",

    # --- GAS / CREPITATION (Black Quarter specific) ---
    "gas": "CREPITATION", "crackling": "CREPITATION", "crepitation": "CREPITATION",
    "crepitus": "CREPITATION", "bubbles_skin": "CREPITATION", "emphysema": "CREPITATION",
    "gas_gangrene": "CREPITATION", "charchara": "CREPITATION",

    # --- LEG SWELLING (BQ specific) ---
    "leg": "LEG_AFFECTED", "leg_swelling": "LEG_AFFECTED", "leg_swollen": "LEG_AFFECTED",
    "muscle_swelling": "LEG_AFFECTED", "thigh": "LEG_AFFECTED",
    "tang": "LEG_AFFECTED", "pair": "LEG_AFFECTED", "taang": "LEG_AFFECTED",

    # --- WEIGHT LOSS ---
    "weight_loss": "WEIGHT_LOSS", "emaciation": "WEIGHT_LOSS", "thin": "WEIGHT_LOSS",
    "wasting": "WEIGHT_LOSS", "kamzor": "WEIGHT_LOSS", "weak": "WEIGHT_LOSS",
    "patla": "WEIGHT_LOSS", "dubla": "WEIGHT_LOSS",

    # --- INFERTILITY ---
    "infertility": "INFERTILITY", "not_conceiving": "INFERTILITY", "repeat_breeding": "INFERTILITY",
    "baanjhpan": "INFERTILITY",
}


# =============================================================================
# DISEASE DATABASE — Diagnostic criteria for each disease
# =============================================================================

DISEASE_DB = {
    "Foot and Mouth Disease": {
        "required_symptoms": [],  # No single symptom is mandatory alone
        "primary_indicators": ["ORAL_LESIONS", "SALIVATION", "LAMENESS"],  # Strong indicators
        "supporting_symptoms": ["FEVER", "ANOREXIA", "MILK_ISSUES"],
        "combination_rules": [
            # (symptom_set, bonus_score) — if these appear together, boost confidence
            ({"ORAL_LESIONS", "SALIVATION"}, 0.35),
            ({"ORAL_LESIONS", "FEVER"}, 0.30),
            ({"LAMENESS", "SALIVATION"}, 0.25),
            ({"ORAL_LESIONS", "LAMENESS", "FEVER"}, 0.45),
            ({"SALIVATION", "FEVER", "LAMENESS"}, 0.40),
        ],
        "species": ["cattle", "buffalo", "goat", "sheep", "pig"],
        "severity": "HIGH",
        "is_lethal": False,
        "actions": [
            "Isolate the affected animal immediately from the herd",
            "Do NOT move any livestock from the premises",
            "Contact your nearest veterinary officer within 24 hours",
            "Provide soft food and clean water",
            "Disinfect the area around the animal",
            "Report to district animal husbandry office"
        ],
        "description": "Foot and Mouth Disease (FMD) is a highly contagious viral disease. It causes blisters/vesicles in the mouth, on the tongue, and between the hooves. Animals drool excessively and become lame."
    },

    "Lumpy Skin Disease": {
        "required_symptoms": [],
        "primary_indicators": ["SKIN_LESIONS"],
        "supporting_symptoms": ["FEVER", "SWELLING", "ANOREXIA", "MILK_ISSUES", "EYE_DISCHARGE"],
        "combination_rules": [
            ({"SKIN_LESIONS", "FEVER"}, 0.45),
            ({"SKIN_LESIONS", "SWELLING"}, 0.40),
            ({"SKIN_LESIONS", "FEVER", "ANOREXIA"}, 0.50),
            ({"SKIN_LESIONS"}, 0.30),  # Even alone, skin nodules strongly suggest LSD
        ],
        "species": ["cattle", "buffalo"],
        "severity": "HIGH",
        "is_lethal": False,
        "actions": [
            "Isolate affected animal from the herd immediately",
            "Implement strict vector control (insecticides, repellents, nets)",
            "Report to veterinary authority — this is a notifiable disease",
            "Provide supportive care and proper nutrition",
            "Vaccinate all unaffected animals in the herd",
            "Do NOT allow animal movement from the farm"
        ],
        "description": "Lumpy Skin Disease (LSD) is a viral disease causing firm, round nodules (2-5cm) across the skin. It spreads via insects (mosquitoes, flies). Causes fever, reduced milk, and secondary infections."
    },

    "Peste des Petits Ruminants": {
        "required_symptoms": [],
        "primary_indicators": ["NASAL_DISCHARGE", "DIARRHEA"],
        "supporting_symptoms": ["FEVER", "COUGHING", "EYE_DISCHARGE", "ORAL_LESIONS", "ANOREXIA", "DYSPNEA"],
        "combination_rules": [
            ({"NASAL_DISCHARGE", "DIARRHEA"}, 0.40),
            ({"FEVER", "NASAL_DISCHARGE", "DIARRHEA"}, 0.50),
            ({"NASAL_DISCHARGE", "COUGHING", "FEVER"}, 0.45),
            ({"DIARRHEA", "FEVER", "ANOREXIA"}, 0.30),
            ({"NASAL_DISCHARGE", "EYE_DISCHARGE", "FEVER"}, 0.45),
        ],
        "species": ["goat", "sheep"],  # Species-specific — NOT cattle
        "severity": "CRITICAL",
        "is_lethal": True,
        "actions": [
            "QUARANTINE the entire flock immediately",
            "Contact veterinary officer URGENTLY — high mortality disease",
            "Vaccinate all unaffected animals immediately",
            "Provide oral rehydration for animals with diarrhea",
            "Do NOT introduce new animals to the flock",
            "Report to district animal husbandry office"
        ],
        "description": "PPR (Goat Plague) is a highly fatal viral disease of goats and sheep. Causes high fever, severe nasal/eye discharge, diarrhea, mouth sores, and pneumonia. Mortality can reach 90% in naive flocks."
    },

    "Mastitis": {
        "required_symptoms": [],
        "primary_indicators": ["UDDER_PROBLEM", "MILK_ISSUES"],
        "supporting_symptoms": ["FEVER", "SWELLING", "ANOREXIA"],
        "combination_rules": [
            ({"UDDER_PROBLEM", "MILK_ISSUES"}, 0.50),
            ({"UDDER_PROBLEM", "FEVER"}, 0.40),
            ({"UDDER_PROBLEM"}, 0.35),
            ({"MILK_ISSUES", "FEVER"}, 0.30),
            ({"UDDER_PROBLEM", "SWELLING"}, 0.40),
        ],
        "species": ["cattle", "buffalo", "goat"],
        "severity": "MEDIUM",
        "is_lethal": False,
        "actions": [
            "Milk the affected quarter separately and DISCARD the milk",
            "Contact veterinarian for antibiotic treatment",
            "Apply warm compresses to the affected udder",
            "Maintain strict milking hygiene (clean hands, teat dipping)",
            "Milk affected animal LAST to prevent spread",
            "Do not consume raw milk from affected animal"
        ],
        "description": "Mastitis is a bacterial infection of the udder causing inflammation, swelling, and changes in milk (clots, pus, blood, watery). Common in dairy animals with poor milking hygiene."
    },

    "Brucellosis": {
        "required_symptoms": [],
        "primary_indicators": ["ABORTION", "INFERTILITY"],
        "supporting_symptoms": ["FEVER", "ANOREXIA", "SWELLING", "WEIGHT_LOSS"],
        "combination_rules": [
            ({"ABORTION", "FEVER"}, 0.55),
            ({"ABORTION"}, 0.40),
            ({"ABORTION", "INFERTILITY"}, 0.55),
            ({"INFERTILITY", "FEVER"}, 0.35),
            ({"ABORTION", "ANOREXIA", "FEVER"}, 0.50),
        ],
        "species": ["cattle", "buffalo", "goat", "sheep"],
        "severity": "HIGH",
        "is_lethal": False,
        "actions": [
            "Isolate the animal immediately — ZOONOTIC disease (spreads to humans)",
            "Report to veterinary authority — NOTIFIABLE disease",
            "Get the entire herd tested (serology)",
            "Do NOT consume raw milk or handle aborted material without gloves",
            "Burn or bury aborted fetus and placenta deeply with lime",
            "Practice strict biosecurity and hygiene"
        ],
        "description": "Brucellosis is a bacterial zoonotic disease causing late-term abortion, infertility, and fever. It spreads to humans through raw milk or contact with aborted material. Mandatory reporting."
    },

    "Anthrax": {
        "required_symptoms": [],
        "primary_indicators": ["SUDDEN_DEATH", "HEMORRHAGE"],
        "supporting_symptoms": ["FEVER", "SWELLING"],
        "combination_rules": [
            ({"SUDDEN_DEATH", "HEMORRHAGE"}, 0.60),
            ({"SUDDEN_DEATH"}, 0.35),
            ({"HEMORRHAGE", "SUDDEN_DEATH"}, 0.60),
            ({"SUDDEN_DEATH", "SWELLING"}, 0.45),
            ({"HEMORRHAGE", "FEVER"}, 0.30),
        ],
        "species": ["cattle", "buffalo", "goat", "sheep"],
        "severity": "CRITICAL",
        "is_lethal": True,
        "lethal_priority": 10,  # Highest priority — immediate danger
        "actions": [
            "DO NOT OPEN OR CUT THE CARCASS — spores will spread",
            "Report to veterinary authority IMMEDIATELY",
            "QUARANTINE the entire area — restrict all movement",
            "Vaccinate all surrounding animals within 24 hours",
            "Burn or deeply bury the carcass with quicklime",
            "HUMANS: avoid ALL contact — wear full protective equipment",
            "Disinfect the area thoroughly (5% formalin)"
        ],
        "description": "Anthrax is a FATAL bacterial disease (Bacillus anthracis). Animals often found dead without prior symptoms. Dark, non-clotting blood may ooze from nose/mouth/anus. NEVER open the carcass. Zoonotic — deadly to humans."
    },

    "Hemorrhagic Septicemia": {
        "required_symptoms": [],
        "primary_indicators": ["NECK_SWELLING", "DYSPNEA"],
        "supporting_symptoms": ["FEVER", "SWELLING", "SUDDEN_DEATH", "SALIVATION"],
        "combination_rules": [
            ({"NECK_SWELLING", "DYSPNEA"}, 0.55),
            ({"NECK_SWELLING", "FEVER"}, 0.45),
            ({"DYSPNEA", "FEVER", "SWELLING"}, 0.45),
            ({"NECK_SWELLING", "FEVER", "DYSPNEA"}, 0.60),
            ({"SWELLING", "DYSPNEA", "FEVER"}, 0.40),
        ],
        "species": ["cattle", "buffalo"],
        "severity": "CRITICAL",
        "is_lethal": True,
        "lethal_priority": 9,
        "actions": [
            "Call veterinarian IMMEDIATELY — death within 12-24 hours if untreated",
            "High-dose antibiotic treatment must start WITHIN HOURS",
            "Isolate affected animals",
            "Vaccinate the entire herd immediately",
            "Keep animals sheltered during monsoon season",
            "Ensure clean drinking water (avoid stagnant ponds)"
        ],
        "description": "Hemorrhagic Septicemia (HS/Gala Ghontu) is an acute, fatal bacterial disease. Causes sudden high fever, massive throat/neck swelling, severe difficulty breathing. KILLS within 12-24 hours without antibiotic treatment. Common during monsoon."
    },

    "Black Quarter": {
        "required_symptoms": [],
        "primary_indicators": ["CREPITATION", "LEG_AFFECTED"],
        "supporting_symptoms": ["FEVER", "SWELLING", "LAMENESS", "SUDDEN_DEATH"],
        "combination_rules": [
            ({"CREPITATION", "LEG_AFFECTED"}, 0.55),
            ({"CREPITATION", "SWELLING"}, 0.45),
            ({"LEG_AFFECTED", "SWELLING", "FEVER"}, 0.45),
            ({"CREPITATION", "FEVER"}, 0.40),
            ({"LEG_AFFECTED", "FEVER", "LAMENESS"}, 0.40),
            ({"SUDDEN_DEATH", "LEG_AFFECTED"}, 0.40),
        ],
        "species": ["cattle", "buffalo"],
        "severity": "CRITICAL",
        "is_lethal": True,
        "lethal_priority": 8,
        "actions": [
            "Contact veterinarian IMMEDIATELY — this is an emergency",
            "High-dose penicillin treatment needed URGENTLY",
            "Isolate affected animal",
            "Vaccinate all healthy animals in the herd",
            "Avoid grazing in waterlogged or recently flooded areas",
            "Do not slaughter or consume meat from affected animal"
        ],
        "description": "Black Quarter (BQ/Black Leg) is an acute, fatal bacterial disease causing gas gangrene in muscles, usually of the legs. Affected area is swollen, hot, and feels crackling (crepitant) on touch. Rapid death if untreated."
    },
}


# =============================================================================
# SCORING ENGINE
# =============================================================================

class ChatEngine:
    def __init__(self):
        self.conversation_history: Dict[str, List[Dict]] = {}

    def analyze(self, message: str, animal_type: Optional[str] = None,
                conversation_id: Optional[str] = None) -> Dict:
        # Extract symptoms from message
        symptoms = self._extract_symptoms(message)

        # Get conversation context
        context_symptoms = []
        if conversation_id and conversation_id in self.conversation_history:
            for prev in self.conversation_history[conversation_id]:
                context_symptoms.extend(prev.get("symptoms", []))

        # Combine current + context symptoms
        all_symptoms = list(set(symptoms + context_symptoms))

        if not all_symptoms:
            return self._no_symptoms_response(message, conversation_id)

        # Score all diseases
        scores = self._score_diseases(all_symptoms, animal_type)

        # Store in conversation history
        if conversation_id:
            if conversation_id not in self.conversation_history:
                self.conversation_history[conversation_id] = []
            self.conversation_history[conversation_id].append({
                "message": message,
                "symptoms": symptoms,
            })

        if not scores:
            return self._uncertain_response(all_symptoms, conversation_id)

        # Get top result
        top = scores[0]
        disease_info = DISEASE_DB[top["name"]]

        # Build response
        return {
            "response": self._build_response(top, disease_info, all_symptoms),
            "probable_disease": top["name"],
            "confidence": top["confidence"],
            "risk_level": disease_info["severity"],
            "immediate_actions": disease_info["actions"],
            "should_report": disease_info["severity"] in ("HIGH", "CRITICAL"),
            "is_emergency": disease_info.get("is_lethal", False),
            "detected_symptoms": all_symptoms,
            "matched_indicators": top.get("matched_primary", []),
            "differential_diagnosis": [
                {"disease": s["name"], "confidence": s["confidence"], "reason": s.get("reason", "")}
                for s in scores[1:4]
            ],
            "follow_up_questions": self._get_follow_up(top, all_symptoms),
            "algorithm": "diagnostic-v2"
        }

    def _extract_symptoms(self, message: str) -> List[str]:
        """Extract canonical symptom IDs from free text."""
        message_lower = message.lower().strip()
        # Remove common non-symptom words
        noise = {"my", "the", "is", "has", "have", "been", "since", "days", "day",
                 "ago", "from", "and", "with", "also", "very", "much", "lot",
                 "cow", "buffalo", "goat", "sheep", "animal", "cattle", "bull",
                 "gaay", "bhains", "bakri", "janwar", "pashu"}

        found_symptoms = set()

        # Strategy 1: Direct word matching
        words = re.findall(r'[a-z_]+', message_lower)
        for word in words:
            if word in noise:
                continue
            if word in SYMPTOM_VOCABULARY:
                found_symptoms.add(SYMPTOM_VOCABULARY[word])

        # Strategy 2: Phrase matching (2-3 word combos)
        for i in range(len(words)):
            for j in range(i + 1, min(i + 4, len(words) + 1)):
                phrase = "_".join(words[i:j])
                if phrase in SYMPTOM_VOCABULARY:
                    found_symptoms.add(SYMPTOM_VOCABULARY[phrase])

        # Strategy 3: Substring matching for Hindi/compound words
        for term, symptom_id in SYMPTOM_VOCABULARY.items():
            if len(term) >= 4 and term in message_lower:
                found_symptoms.add(symptom_id)

        return list(found_symptoms)

    def _score_diseases(self, symptoms: List[str], animal_type: Optional[str]) -> List[Dict]:
        """Score diseases using multi-factor analysis."""
        symptom_set = set(symptoms)
        candidates = []

        for disease_name, info in DISEASE_DB.items():
            # Species filter
            if animal_type:
                animal_lower = animal_type.lower()
                if animal_lower not in [s.lower() for s in info["species"]]:
                    continue

            # Calculate score components
            primary_matches = symptom_set & set(info["primary_indicators"])
            support_matches = symptom_set & set(info["supporting_symptoms"])
            all_disease_symptoms = set(info["primary_indicators"] + info["supporting_symptoms"])
            total_matches = symptom_set & all_disease_symptoms

            if not total_matches:
                continue

            # Base score from matches
            score = 0.0

            # Primary indicator matching (high value)
            if primary_matches:
                primary_ratio = len(primary_matches) / len(info["primary_indicators"])
                score += primary_ratio * 0.40

            # Supporting symptom matching
            if support_matches:
                support_ratio = len(support_matches) / len(info["supporting_symptoms"])
                score += support_ratio * 0.15

            # Combination rule bonuses (the most important factor)
            best_combo_bonus = 0.0
            matched_combo = None
            for combo_set, bonus in info["combination_rules"]:
                if combo_set.issubset(symptom_set):
                    if bonus > best_combo_bonus:
                        best_combo_bonus = bonus
                        matched_combo = combo_set
            score += best_combo_bonus

            # Lethal disease boost — if ANY primary indicator matches, boost lethal diseases
            if info.get("is_lethal") and primary_matches:
                priority = info.get("lethal_priority", 5)
                score += 0.05 * priority / 10.0

            # Cap at 0.95
            score = min(round(score, 3), 0.95)

            # Minimum threshold
            if score < 0.15:
                continue

            # Determine reason for match
            reason = ""
            if matched_combo:
                reason = f"Matched symptom pattern: {', '.join(sorted(matched_combo))}"
            elif primary_matches:
                reason = f"Key indicators: {', '.join(sorted(primary_matches))}"

            candidates.append({
                "name": disease_name,
                "confidence": score,
                "matched_primary": list(primary_matches),
                "matched_support": list(support_matches),
                "reason": reason,
            })

        # Sort: lethal diseases with similar scores get priority
        candidates.sort(key=lambda x: (
            x["confidence"] + (0.05 if DISEASE_DB[x["name"]].get("is_lethal") else 0)
        ), reverse=True)

        return candidates

    def _build_response(self, top: Dict, info: Dict, symptoms: List[str]) -> str:
        conf_pct = int(top["confidence"] * 100)
        severity = info["severity"]
        is_lethal = info.get("is_lethal", False)

        # Emergency header
        if is_lethal:
            header = f"🚨 EMERGENCY — {severity} RISK"
        elif severity == "HIGH":
            header = f"🔴 HIGH RISK"
        elif severity == "MEDIUM":
            header = f"🟡 MODERATE RISK"
        else:
            header = f"🟢 LOW RISK"

        response = f"{header}\n\n"
        response += f"Based on the symptoms ({', '.join(symptoms[:6])}), "
        response += f"this is most likely **{top['name']}** ({conf_pct}% confidence).\n\n"
        response += f"{info['description']}\n\n"

        response += "**Immediate Actions:**\n"
        for i, action in enumerate(info["actions"][:5], 1):
            response += f"{i}. {action}\n"

        if is_lethal:
            response += f"\n⚠️ **THIS IS A LIFE-THREATENING EMERGENCY.** "
            response += f"Contact veterinarian within hours, not days."

        if info["severity"] in ("HIGH", "CRITICAL"):
            response += f"\n\n📋 **This disease requires MANDATORY reporting** to the district veterinary office."

        return response

    def _no_symptoms_response(self, message: str, conversation_id: Optional[str]) -> Dict:
        return {
            "response": "I couldn't identify specific symptoms from your description. "
                       "Please tell me:\n"
                       "1. What symptoms do you see? (fever, swelling, blisters, limping, diarrhea, lumps, etc.)\n"
                       "2. Which body part is affected? (mouth, legs, skin, udder, neck)\n"
                       "3. How long has this been going on?\n\n"
                       "You can describe in Hindi too (bukhar, chhaale, sujan, langda, dast, gilti).",
            "probable_disease": None,
            "confidence": 0.0,
            "risk_level": "UNKNOWN",
            "immediate_actions": [
                "Observe the animal closely for specific symptoms",
                "Check body temperature if possible",
                "Describe what you see in more detail"
            ],
            "should_report": False,
            "is_emergency": False,
            "detected_symptoms": [],
            "differential_diagnosis": [],
            "follow_up_questions": [
                "Does the animal have fever (feeling hot)?",
                "Is there any swelling on the body?",
                "Can the animal walk normally?",
                "Is the animal eating and drinking?"
            ],
            "algorithm": "diagnostic-v2"
        }

    def _uncertain_response(self, symptoms: List[str], conversation_id: Optional[str]) -> Dict:
        return {
            "response": f"I detected these symptoms: {', '.join(symptoms)}, but I cannot make a "
                       f"confident diagnosis. The combination doesn't clearly match a single disease.\n\n"
                       f"**Recommended:** Contact your nearest veterinary officer for physical examination.",
            "probable_disease": None,
            "confidence": 0.0,
            "risk_level": "UNKNOWN",
            "immediate_actions": [
                "Contact nearest veterinary officer",
                "Isolate the animal as precaution",
                "Monitor for new symptoms"
            ],
            "should_report": True,
            "is_emergency": False,
            "detected_symptoms": symptoms,
            "differential_diagnosis": [],
            "follow_up_questions": [
                "Are there any other symptoms you noticed?",
                "Has any other animal shown similar signs?",
                "When did the symptoms first appear?"
            ],
            "algorithm": "diagnostic-v2"
        }

    def _get_follow_up(self, top: Dict, symptoms: List[str]) -> List[str]:
        """Generate relevant follow-up questions based on current diagnosis."""
        disease = top["name"]
        questions = []

        if disease == "Foot and Mouth Disease":
            if "LAMENESS" not in symptoms:
                questions.append("Is the animal limping or reluctant to walk?")
            if "SALIVATION" not in symptoms:
                questions.append("Is there excessive drooling/salivation?")

        elif disease == "Lumpy Skin Disease":
            questions.append("Are the lumps hard and round (2-5 cm)?")
            questions.append("Are there many nodules across the body or just a few?")

        elif disease == "Anthrax":
            questions.append("Is there dark blood coming from nose, mouth, or anus?")
            questions.append("How quickly did the animal die (hours or days)?")

        elif disease == "Hemorrhagic Septicemia":
            questions.append("Is the neck/throat area very swollen?")
            questions.append("Is the animal struggling to breathe?")

        if not questions:
            questions = [
                "Are other animals in the herd showing similar symptoms?",
                "Has the animal been vaccinated recently?"
            ]

        return questions
