# PashuRaksha — Re-Analysis (From Scratch)

**SIH26128 · Government of Maharashtra · Livestock Disease Surveillance**

This folder is a complete from-scratch re-analysis of the project: what it is, what's built, what's left, and how it scales to mass adoption.

---

## Read in this order

| Doc | What it answers |
|-----|----------------|
| **[01_PROBLEM_AND_VISION.md](01_PROBLEM_AND_VISION.md)** | What problem are we solving? Who uses it? Why do we win vs existing apps? |
| **[02_WHAT_IS_BUILT.md](02_WHAT_IS_BUILT.md)** | Current state — every file, every feature, verified with tests (92% done) |
| **[03_WHAT_NEEDS_BUILDING.md](03_WHAT_NEEDS_BUILDING.md)** | Phase 5 remaining work + honest limitations |
| **[04_HOW_MASS_ADOPTION_WORKS.md](04_HOW_MASS_ADOPTION_WORKS.md)** | How an uneducated farmer uses it, how it scales to 535M animals |
| **[05_FOLDER_STRUCTURE.md](05_FOLDER_STRUCTURE.md)** | Complete annotated file map |

---

## 30-Second Summary

**Problem:** India's 535M livestock have no unified early-warning system. Diseases spread before officials know.

**Solution:** PashuRaksha — a public-health surveillance system where:
- Farmers report via **voice/photo** (8 languages, works for uneducated users)
- **AI** identifies disease + treatment + area outbreak risk
- **Auto-alerts** flow to vets and government
- **Geospatial clustering** detects outbreaks before they spread
- **Government dashboard** shows real-time epidemic intelligence

**Status:** ~92% complete. All core features built and tested (23/23 backend + 11/11 browser tests). Only Phase 5 (multilingual UI, Docker deploy, demo prep) remains.

**Differentiator:** Not a vet-consultation app. A system-level epidemic-prevention infrastructure — detect the outbreak before it becomes an epidemic.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, TypeScript, Vite, Tailwind, PWA |
| Backend | Java 21, Spring Boot 3.4, Spring Security JWT, JPA |
| AI | Python, FastAPI, PyTorch (MobileNetV2 CNN), NLP engine |
| Database | PostgreSQL 15 + PostGIS |
| Deploy | Docker, Nginx, Supervisord |
| Testing | Playwright (browser), PowerShell (API) |
