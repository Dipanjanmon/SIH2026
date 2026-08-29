# 03 — What Still Needs Building

**Remaining: ~8% — all Phase 5 (polish, deploy, demo).**
No core functionality is missing. What remains makes it demo-ready and accessible.

---

## Phase 5 — Polish & Deploy (the only pending phase)

| # | Task | Why | Effort | Priority |
|---|------|-----|--------|----------|
| 5.1 | **Hindi/Marathi UI labels** | PS says "multilingual"; farmers are uneducated. Voice already works, need visible UI translation | 4 hrs | 🔴 HIGH |
| 5.2 | **Docker one-command deploy** | Demo day reliability — `docker compose up` starts everything | 3 hrs | 🔴 HIGH |
| 5.3 | **Demo script + flow rehearsal** | The 9-step story judges will see | 2 hrs | 🔴 HIGH |
| 5.4 | **Mobile responsive check** | Farmers use phones — test at 360px | 2 hrs | 🟡 MED |
| 5.5 | **Error handling + loading states** | Graceful failures, spinners | 2 hrs | 🟡 MED |
| 5.6 | **README + screenshots** | Documentation for judges/evaluators | 1 hr | 🟡 MED |

---

## Optional Enhancements (post-SIH, or if time permits)

| Feature | Value | Effort |
|---------|-------|--------|
| Real SMS gateway (MSG91/Twilio) | Currently simulated with logs | 2 hrs |
| LLM-based conversational chat (Ollama) | Chat is keyword-based; LLM = natural prose | 4 hrs |
| More LSD training images | 2/12 mild LSD misclassified as healthy | 3 hrs |
| Live NADRS/INAPH govt API integration | Currently documented as "compatible" | Unknown (needs govt API access) |
| Push notifications (Firebase) | Real-time alerts to phones | 3 hrs |
| PDF report export for officials | Nice-to-have for govt | 2 hrs |

---

## Known Limitations (acceptable for demo, documented honestly)

| Limitation | Impact | Mitigation |
|-----------|--------|-----------|
| Image model: 2/12 mild LSD → healthy | Minor accuracy gap | More early-stage LSD data (post-SIH) |
| Chat is keyword-based, not LLM | Responses structured not conversational | Works reliably, fast, no API cost |
| SMS is simulated (logged) | No real messages sent | Documented as "production uses MSG91" |
| Outbreak intel uses estimated vaccination % | Not from live govt data | Documented; connects to real DB when available |
| Weather uses free Open-Meteo | Not IMD official | Open-Meteo is accurate enough for demo |

---

## What is NOT needed (scope discipline)

These would be scope creep — the PS does NOT require them:
- Payment/billing system (it's a free govt tool)
- Video consultation (that's DrPashu's model, not ours)
- E-commerce for medicines
- Social features
- Blockchain (buzzword, no real value here)

---

## Definition of "Done" for SIH Demo

- [ ] `docker compose up` → whole system starts in one command
- [ ] Farmer can login, speak in Hindi/Marathi, get diagnosis with audio response
- [ ] Photo upload → disease detection → treatment + outbreak intelligence
- [ ] GPS auto-capture works on the report form
- [ ] Government dashboard shows live outbreak map + analytics
- [ ] The 9-step demo flow runs smoothly in < 5 minutes
- [ ] UI labels available in at least Hindi + English toggle
- [ ] Mobile view works on a phone screen
