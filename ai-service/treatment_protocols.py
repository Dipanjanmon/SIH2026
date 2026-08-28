"""
PashuRaksha Treatment Protocol Knowledge Base
Veterinary treatment information for all 8 diseases.
Includes: first aid, drugs/dosage, severity timeline, cost estimates, prevention.
Source: Indian Veterinary Pharmacopoeia + ICAR guidelines + field veterinary practice.
"""

from typing import Dict, List

TREATMENT_DB: Dict[str, Dict] = {
    "Foot and Mouth Disease": {
        "first_aid": [
            "Wash mouth lesions gently with 1% potassium permanganate (KMnO4) solution",
            "Apply boroglycerin paste on mouth ulcers",
            "Clean hoof lesions with Dettol/antiseptic and apply tincture iodine",
            "Provide soft, palatable feed (boiled rice, jaggery water)",
            "Ensure clean drinking water is always available",
            "Apply coconut oil on cracked hooves",
        ],
        "drugs": [
            {"name": "Inj. Meloxicam", "dosage": "0.5 mg/kg body weight, IM", "purpose": "Anti-inflammatory, pain relief", "duration": "3-5 days"},
            {"name": "Inj. Chlorpheniramine maleate", "dosage": "0.5 mg/kg, IM", "purpose": "Anti-allergic", "duration": "3 days"},
            {"name": "Inj. Enrofloxacin 10%", "dosage": "5 mg/kg, IM", "purpose": "Prevent secondary bacterial infection", "duration": "5 days"},
            {"name": "Inj. Dextrose 25%", "dosage": "500ml IV (cattle)", "purpose": "Energy support for anorexic animals", "duration": "As needed"},
            {"name": "Topical: Boroglycerin + Gentian violet", "dosage": "Apply 2-3 times daily on lesions", "purpose": "Wound healing", "duration": "7-10 days"},
        ],
        "vaccines": [
            {"name": "FMD Vaccine (Raksha Ovac / Raksha FMD)", "schedule": "First dose at 4 months, booster at 9 months, then every 6 months", "cost": "₹5-15 per dose"},
        ],
        "severity_timeline": {
            "day_1_3": "Fever (104-106°F), reduced appetite, initial vesicles forming in mouth",
            "day_3_5": "Vesicles rupture → painful ulcers, excessive drooling, lameness begins, milk drop 50-80%",
            "day_5_10": "Secondary infections possible, hoof lesions deepen, weight loss 5-10%",
            "day_10_21": "Recovery begins if uncomplicated. Milk production recovers 60-70% in 2-3 weeks",
            "complications": "Myocarditis in young calves (sudden death), chronic lameness, permanent milk yield reduction 15-20%",
        },
        "estimated_cost": {"per_animal": "₹500-1500", "breakdown": "Medicines ₹300-800, Vet fees ₹200-500, Feed supplements ₹200-300"},
        "mortality_rate": "1-5% in adults, 20-50% in young calves (myocarditis)",
        "recovery_time": "14-21 days (uncomplicated)",
        "prevention": [
            "Vaccination every 6 months (mandatory under FMD-CP)",
            "Restrict animal movement during outbreaks",
            "Quarantine new animals for 28 days before mixing",
            "Disinfect vehicles entering farm premises",
        ],
    },

    "Lumpy Skin Disease": {
        "first_aid": [
            "Isolate animal immediately from herd",
            "Apply fly repellent (Himax/neem oil) on nodules to prevent vector spread",
            "Clean wounds with povidone-iodine (Betadine) solution",
            "Provide nutritious feed to maintain immunity",
            "Use mosquito nets/screens in cattle shed if possible",
        ],
        "drugs": [
            {"name": "Inj. Meloxicam", "dosage": "0.5 mg/kg, IM", "purpose": "Anti-inflammatory, fever control", "duration": "5 days"},
            {"name": "Inj. Oxytetracycline LA", "dosage": "20 mg/kg, IM", "purpose": "Broad-spectrum antibiotic (secondary infections)", "duration": "Every 72 hrs, 2-3 doses"},
            {"name": "Inj. Chlorpheniramine maleate", "dosage": "0.5 mg/kg, IM", "purpose": "Anti-allergic, reduce inflammation", "duration": "5 days"},
            {"name": "Inj. B-complex + Liver extract", "dosage": "10-15ml, IM", "purpose": "Immune support, appetite stimulation", "duration": "7 days"},
            {"name": "Topical: Povidone-iodine + wound spray", "dosage": "Apply on nodules twice daily", "purpose": "Prevent secondary infection", "duration": "Until healed"},
            {"name": "Ivermectin 1%", "dosage": "0.2 mg/kg, SC", "purpose": "Kill vectors (mites, flies) on animal", "duration": "Single dose, repeat after 14 days"},
        ],
        "vaccines": [
            {"name": "Goat Pox Vaccine (Uttarkashi strain)", "schedule": "0.5ml SC, annual vaccination", "cost": "₹3-8 per dose"},
            {"name": "Lumpi-ProVac (Homologous LSD vaccine)", "schedule": "2ml SC, annual", "cost": "₹50-80 per dose"},
        ],
        "severity_timeline": {
            "day_1_3": "Fever (104-105°F), watery eyes, nasal discharge, swollen lymph nodes",
            "day_3_7": "Skin nodules appear (2-5cm), firm and round, across body. Milk drop 25-40%",
            "day_7_14": "Nodules may ulcerate, secondary bacterial infections, edema in legs/brisket",
            "day_14_28": "Nodules begin to scab and heal. Some leave permanent scars",
            "complications": "Pneumonia, mastitis, infertility in bulls, permanent hide damage (economic loss)",
        },
        "estimated_cost": {"per_animal": "₹1000-3000", "breakdown": "Medicines ₹500-1500, Vector control ₹200-500, Vet fees ₹300-500, Productivity loss ₹5000-15000"},
        "mortality_rate": "1-5% (up to 10% in severe outbreaks)",
        "recovery_time": "21-45 days",
        "prevention": [
            "Annual vaccination before monsoon season",
            "Strict vector control (insecticide spraying, nets, repellents)",
            "Quarantine infected animals for minimum 28 days",
            "Do NOT allow animal movement from affected area",
        ],
    },

    "Peste des Petits Ruminants": {
        "first_aid": [
            "Quarantine the ENTIRE flock immediately",
            "Provide oral rehydration solution (ORS: salt + sugar + water)",
            "Keep animals warm and dry",
            "Offer soft, easily digestible feed",
            "Maintain strict hygiene — wash hands between handling animals",
        ],
        "drugs": [
            {"name": "Inj. Oxytetracycline LA", "dosage": "20 mg/kg, IM", "purpose": "Prevent/treat secondary pneumonia", "duration": "Every 72 hrs, 3 doses"},
            {"name": "Inj. Meloxicam", "dosage": "0.5 mg/kg, IM", "purpose": "Fever and pain control", "duration": "3-5 days"},
            {"name": "Oral Rehydration Therapy", "dosage": "500ml-1L per animal per day", "purpose": "Counter dehydration from diarrhea", "duration": "Until recovery"},
            {"name": "Inj. B-complex", "dosage": "3-5ml, IM", "purpose": "Appetite and immunity support", "duration": "5-7 days"},
            {"name": "Mouth wash: 1% KMnO4", "dosage": "Swab mouth 2-3 times daily", "purpose": "Clean oral ulcers", "duration": "7 days"},
        ],
        "vaccines": [
            {"name": "PPR Vaccine (Sungri/96 strain)", "schedule": "Single dose SC at 4 months age, immunity lasts 3+ years", "cost": "₹3-5 per dose"},
        ],
        "severity_timeline": {
            "day_1_3": "High fever (105-107°F), depression, loss of appetite, initial watery nasal/eye discharge",
            "day_3_5": "Discharge becomes mucopurulent, mouth ulcers appear, diarrhea starts (profuse, watery)",
            "day_5_8": "Severe dehydration, pneumonia develops, emaciation. CRITICAL period — most deaths occur here",
            "day_8_14": "Survivors begin slow recovery. Diarrhea resolves, appetite returns",
            "complications": "Bronchopneumonia (fatal), severe dehydration (fatal in kids), abortion in pregnant does",
        },
        "estimated_cost": {"per_animal": "₹200-800 (goat)", "breakdown": "Medicines ₹100-400, ORS ₹50-100, Vet fees ₹100-300"},
        "mortality_rate": "50-90% in naive (unvaccinated) flocks, <10% in vaccinated flocks",
        "recovery_time": "10-14 days (survivors)",
        "prevention": [
            "Single vaccination provides 3+ years immunity — VACCINATE ALL GOATS",
            "Quarantine new animals for 21 days",
            "Do not purchase animals from markets during outbreaks",
            "Report immediately — notifiable disease",
        ],
    },

    "Mastitis": {
        "first_aid": [
            "Milk out the affected quarter COMPLETELY — do not skip milking",
            "Apply warm water compress on swollen udder (15-20 min)",
            "Massage udder gently downward while milking",
            "DISCARD all milk from affected quarter — do not feed to calves",
            "Clean teats with antiseptic before and after milking",
        ],
        "drugs": [
            {"name": "Intramammary: Ceftriaxone + Sulbactam tube", "dosage": "One tube per affected quarter after milking", "purpose": "Direct antibiotic into udder", "duration": "3-4 days (6-8 tubes total)"},
            {"name": "Inj. Enrofloxacin 10%", "dosage": "5 mg/kg, IM", "purpose": "Systemic antibiotic support", "duration": "5 days"},
            {"name": "Inj. Meloxicam", "dosage": "0.5 mg/kg, IM", "purpose": "Reduce udder inflammation", "duration": "3 days"},
            {"name": "Inj. Calcium borogluconate", "dosage": "450ml slow IV (if milk fever concurrent)", "purpose": "Calcium support", "duration": "Single dose"},
        ],
        "vaccines": [
            {"name": "No effective vaccine available", "schedule": "Prevention through hygiene and management", "cost": "N/A"},
        ],
        "severity_timeline": {
            "day_1_2": "Mild swelling, slight change in milk (flakes/clots), animal may be normal otherwise",
            "day_2_4": "Udder hot and painful, milk clearly abnormal (yellow/bloody), reduced yield 50%+",
            "day_4_7": "If untreated: quarter becomes hard (fibrosis), systemic illness possible (fever, off feed)",
            "chronic": "Permanent damage to quarter, reduced lifetime production, recurring infections",
            "complications": "Gangrene (blue/black udder — emergency), septicemia, permanent quarter loss",
        },
        "estimated_cost": {"per_animal": "₹500-2000", "breakdown": "Intramammary tubes ₹200-600, Injectables ₹200-800, Vet fees ₹200-500, Milk loss ₹2000-10000"},
        "mortality_rate": "<1% (but gangrenous mastitis: 10-20%)",
        "recovery_time": "5-10 days (clinical cure), milk quality restoration 2-4 weeks",
        "prevention": [
            "Pre and post-milking teat dipping (iodine-based solution)",
            "Milk infected animals LAST",
            "Dry cow therapy (antibiotic tube at drying off)",
            "Maintain clean, dry bedding",
            "Proper milking technique — do not over-milk",
        ],
    },

    "Brucellosis": {
        "first_aid": [
            "ISOLATE the animal immediately — ZOONOTIC disease",
            "Wear GLOVES when handling — can infect humans",
            "Burn or deeply bury aborted fetus and placenta with lime",
            "Do NOT consume raw milk from this animal",
            "Disinfect contaminated area with 2% formalin or 5% calcium hydroxide",
        ],
        "drugs": [
            {"name": "NO EFFECTIVE TREATMENT — carrier for life", "dosage": "N/A", "purpose": "Brucellosis cannot be cured in animals", "duration": "N/A"},
            {"name": "Supportive: Inj. Calcium borogluconate", "dosage": "If retained placenta/weakness", "purpose": "Post-abortion support", "duration": "As needed"},
            {"name": "Intrauterine: Lugol's iodine wash", "dosage": "1% solution, 500ml intrauterine", "purpose": "If retained placenta", "duration": "Single flush"},
        ],
        "vaccines": [
            {"name": "Brucella abortus S19 (female calves)", "schedule": "Single dose at 4-8 months age (females only)", "cost": "₹10-30 per dose"},
            {"name": "RB51 vaccine", "schedule": "For adult cattle, single dose", "cost": "₹50-100 per dose"},
        ],
        "severity_timeline": {
            "day_1_7": "Often no visible symptoms until abortion occurs (usually last trimester)",
            "abortion": "Abortion at 6-9 months gestation, retained placenta, metritis",
            "chronic": "Repeat breeding, infertility, reduced milk yield, hygroma (swollen joints)",
            "in_males": "Orchitis (swollen testicles), infertility",
            "complications": "Permanent infertility, chronic carrier shedding bacteria in milk/urine",
        },
        "estimated_cost": {"per_animal": "₹300-1000 (testing) + economic loss from infertility", "breakdown": "Blood test ₹200-500, Supportive care ₹200-500, Loss of calf: ₹15000-30000"},
        "mortality_rate": "<5% (but 100% become carriers)",
        "recovery_time": "No recovery — infected animals remain carriers",
        "prevention": [
            "Calf-hood vaccination (S19) is MANDATORY under national program",
            "Test and segregate/cull positive animals",
            "Never purchase animals without brucellosis test certificate",
            "Pasteurize milk before consumption",
            "Report to veterinary authority — NOTIFIABLE disease",
        ],
    },

    "Anthrax": {
        "first_aid": [
            "DO NOT TOUCH THE CARCASS — spores are deadly",
            "DO NOT OPEN/CUT THE BODY under any circumstances",
            "Keep all people and animals away from the site",
            "Report to veterinary authority IMMEDIATELY — call 1962",
            "Mark the area as dangerous — no grazing",
        ],
        "drugs": [
            {"name": "Inj. Penicillin G (Crystalline)", "dosage": "10,000-22,000 IU/kg, IV/IM every 6 hours", "purpose": "Only effective if animal still alive and caught very early", "duration": "5-7 days minimum"},
            {"name": "Inj. Oxytetracycline", "dosage": "10 mg/kg, IV/IM", "purpose": "Alternative antibiotic", "duration": "5-7 days"},
            {"name": "Anthrax antiserum", "dosage": "100-200ml IV (cattle)", "purpose": "Neutralize toxin (if available)", "duration": "Single dose"},
        ],
        "vaccines": [
            {"name": "Anthrax Spore Vaccine (Sterne strain)", "schedule": "Annual vaccination in endemic areas, 1ml SC", "cost": "₹5-15 per dose"},
        ],
        "severity_timeline": {
            "peracute": "Found DEAD without any prior symptoms (most common in cattle). Death within 1-2 hours",
            "acute": "High fever, trembling, difficulty breathing, bloody discharge from nose/mouth/anus. Death in 12-36 hours",
            "subacute": "Swelling of throat/tongue, edema. May survive 48 hours if treated immediately",
            "post_mortem": "Dark, tarry non-clotting blood. Spleen enormously enlarged. Body bloats rapidly",
            "complications": "Environmental contamination — spores survive 40+ years in soil",
        },
        "estimated_cost": {"per_animal": "₹0 (usually dead) or ₹1000-5000 (if caught alive)", "breakdown": "Emergency treatment ₹1000-3000, Carcass disposal ₹2000-5000, Area decontamination ₹5000-20000"},
        "mortality_rate": "95-100% (peracute/acute), 50% (subacute with immediate treatment)",
        "recovery_time": "7-14 days (extremely rare survivors)",
        "prevention": [
            "ANNUAL vaccination in all endemic areas — non-negotiable",
            "Proper disposal of carcasses (burn or deep burial with quicklime)",
            "NEVER open anthrax carcasses — spores spread",
            "Quarantine affected area for 20 days minimum",
            "Humans: occupational vaccination for high-risk workers",
        ],
    },

    "Hemorrhagic Septicemia": {
        "first_aid": [
            "Call veterinarian IMMEDIATELY — death within 12-24 hours",
            "Keep animal calm — stress worsens condition",
            "Do NOT force-feed or drench — aspiration pneumonia risk",
            "Move to sheltered area away from rain/cold",
            "Separate from herd immediately",
        ],
        "drugs": [
            {"name": "Inj. Oxytetracycline LA", "dosage": "20 mg/kg, deep IM", "purpose": "First-line antibiotic — must give within hours", "duration": "Every 72 hrs, 3 doses"},
            {"name": "Inj. Penicillin + Streptomycin", "dosage": "Penicillin 10,000 IU/kg + Streptomycin 10 mg/kg, IM", "purpose": "Broad-spectrum cover", "duration": "5 days twice daily"},
            {"name": "Inj. Sulphadimidine 33%", "dosage": "1ml/16kg IV (first dose), then 1ml/32kg", "purpose": "Sulfonamide — good tissue penetration", "duration": "3-5 days"},
            {"name": "Inj. Dexamethasone", "dosage": "0.05 mg/kg, IV/IM", "purpose": "Reduce throat swelling (single dose only)", "duration": "Single dose"},
            {"name": "Inj. Chlorpheniramine", "dosage": "0.5 mg/kg, IM", "purpose": "Anti-allergic, reduce edema", "duration": "3 days"},
        ],
        "vaccines": [
            {"name": "HS Oil Adjuvant Vaccine", "schedule": "Annual before monsoon (May-June), 2ml IM", "cost": "₹8-20 per dose"},
            {"name": "HS + BQ Combined Vaccine", "schedule": "Annual, covers both diseases", "cost": "₹15-30 per dose"},
        ],
        "severity_timeline": {
            "hour_0_6": "Sudden high fever (106-108°F), dullness, stops eating/ruminating",
            "hour_6_12": "Swelling of throat/neck (edematous), difficult breathing, salivation",
            "hour_12_18": "Severe dyspnea, tongue protrusion, collapse, recumbency",
            "hour_18_24": "DEATH if untreated. Mortality nearly 100% without antibiotics",
            "complications": "Even with treatment, survival rate only 30-50% if started after 12 hours",
        },
        "estimated_cost": {"per_animal": "₹500-2000 (emergency treatment)", "breakdown": "Emergency antibiotics ₹300-1000, Vet emergency visit ₹500-1000, IV fluids ₹200-500"},
        "mortality_rate": "95-100% untreated, 30-50% with late treatment, <10% with early treatment",
        "recovery_time": "5-7 days (if animal survives first 48 hours)",
        "prevention": [
            "ANNUAL vaccination before monsoon — this is the single most important prevention",
            "Avoid waterlogged grazing areas during monsoon",
            "Provide clean drinking water (not stagnant ponds)",
            "Deworm animals before monsoon season",
            "Keep cattle shed dry and well-ventilated",
        ],
    },

    "Black Quarter": {
        "first_aid": [
            "Call veterinarian IMMEDIATELY — fatal within hours",
            "Keep animal still — movement worsens gas gangrene",
            "Do NOT massage or apply pressure on swollen area",
            "Isolate from herd",
            "Mark the swollen area (for vet reference)",
        ],
        "drugs": [
            {"name": "Inj. Penicillin G (high dose)", "dosage": "22,000-44,000 IU/kg, IM/IV every 6 hours", "purpose": "Kill Clostridium bacteria — MUST be high dose", "duration": "7-10 days"},
            {"name": "Inj. Oxytetracycline LA", "dosage": "20 mg/kg, deep IM", "purpose": "Broad-spectrum support", "duration": "Every 72 hrs"},
            {"name": "BQ Antiserum", "dosage": "100-200ml SC around lesion + 100ml IV", "purpose": "Neutralize toxin (if available)", "duration": "Single dose"},
            {"name": "Surgical: Incision of swelling", "dosage": "By vet only — release gas, irrigate with H2O2", "purpose": "Drain gas gangrene, oxygenate tissue", "duration": "Once, then daily dressing"},
            {"name": "Inj. Meloxicam", "dosage": "0.5 mg/kg, IM", "purpose": "Pain relief", "duration": "3-5 days"},
        ],
        "vaccines": [
            {"name": "BQ Vaccine (Bacterin)", "schedule": "Annual, 2ml SC. Calves: first dose at 6 months", "cost": "₹8-15 per dose"},
            {"name": "HS + BQ Combined Vaccine", "schedule": "Annual before monsoon", "cost": "₹15-30 per dose"},
        ],
        "severity_timeline": {
            "hour_0_6": "Sudden lameness, fever (106-108°F), hot painful swelling on hip/shoulder/leg",
            "hour_6_12": "Swelling becomes cold and crepitant (crackling on touch), skin darkens",
            "hour_12_24": "Severe toxemia, recumbency, rapid deterioration",
            "hour_24_48": "DEATH if untreated. Area of gangrene extends rapidly",
            "complications": "Toxemia, septicemia, death even with treatment if started late",
        },
        "estimated_cost": {"per_animal": "₹1000-3000", "breakdown": "High-dose antibiotics ₹500-1500, Antiserum ₹300-800, Surgery ₹500-1000, Vet fees ₹300-500"},
        "mortality_rate": "100% untreated, 40-60% with late treatment, <20% with early treatment + surgery",
        "recovery_time": "14-28 days (survivors)",
        "prevention": [
            "Annual vaccination of ALL cattle 6 months - 3 years age",
            "Avoid grazing in waterlogged/recently flooded areas",
            "Do not graze immediately after heavy rain",
            "Ensure good drainage around cattle sheds",
        ],
    },
}


def get_treatment_protocol(disease_name: str) -> Dict:
    """Get full treatment protocol for a disease."""
    protocol = TREATMENT_DB.get(disease_name)
    if not protocol:
        # Try fuzzy match
        for key in TREATMENT_DB:
            if disease_name.lower() in key.lower() or key.lower() in disease_name.lower():
                protocol = TREATMENT_DB[key]
                break

    if not protocol:
        return {
            "available": False,
            "message": f"No treatment protocol found for '{disease_name}'. Consult veterinarian.",
        }

    return {
        "available": True,
        "disease": disease_name,
        "first_aid": protocol["first_aid"],
        "drugs": protocol["drugs"],
        "vaccines": protocol["vaccines"],
        "severity_timeline": protocol["severity_timeline"],
        "estimated_cost": protocol["estimated_cost"],
        "mortality_rate": protocol["mortality_rate"],
        "recovery_time": protocol["recovery_time"],
        "prevention": protocol["prevention"],
    }
