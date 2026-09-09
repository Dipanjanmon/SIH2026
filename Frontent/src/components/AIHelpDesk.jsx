import { useEffect, useRef, useState } from 'react'
import { X, RefreshCw, Paperclip, Send, ScanLine } from 'lucide-react'

const ESC = (s) =>
  String(s || '').replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c]))

const AI_API_BASE = (import.meta.env && import.meta.env.VITE_AI_API_URL) || 'http://127.0.0.1:5000'

const SEVERITY_STYLE = {
  high: { label: 'HIGH RISK', cls: 'border-red-300 bg-red-50 text-red-700' },
  medium: { label: 'MODERATE', cls: 'border-amber-300 bg-amber-50 text-amber-700' },
  low: { label: 'MILD', cls: 'border-green-300 bg-green-50 text-green-700' },
}

function isImageFile(name) {
  return /\.(jpg|jpeg|png|webp|bmp|tif|tiff|dcm)$/i.test(String(name || ''))
}

function analyzeImage(file) {
  const fd = new FormData()
  fd.append('file', file)
  return getGeo().then((geo) => {
    if (geo) {
      fd.append('lat', geo.lat)
      fd.append('lng', geo.lng)
      fd.append('state', geo.state || '')
    }
    return fetch(`${AI_API_BASE}/api/analyze`, { method: 'POST', body: fd })
      .then(async (r) => {
        if (!r.ok) throw new Error(`API ${r.status}: ${await r.text()}`)
        return r.json()
      })
  })
}

// Persistent session id for the vet doctor chat.
const makeUid = () => 'uid_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

// Doctor-style chat (Gemini backend, Bengali, remembers conversation).
function doctorChat(q, uid, tone) {
  return fetch(`${AI_API_BASE}/vet/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q, uid, tone }),
  }).then(async (r) => {
    if (!r.ok) throw new Error(`API ${r.status}: ${await r.text()}`)
    return r.json()
  })
}

// Convert plain text (Gemini/offline answer) into safe message HTML with line breaks.
function formatChatReply(text) {
  var esc = ESC(String(text || ''))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
  var lines = esc.split(/\n+/).filter(function (l) { return l.trim() })
  var html = ''
  for (var i = 0; i < lines.length; i++) {
    var t = lines[i].trim()
    var cls = 'text-slate-700'
    if (t.charAt(0) === '-' || t.charAt(0) === '*') cls = 'pl-2 text-slate-700'
    else if (/^\W*\d+/.test(t)) cls = 'font-semibold text-slate-800'
    html += '<div class="' + cls + '">' + t.replace(/^[-*•]\s*/, '') + '</div>'
  }
  return '<div class="space-y-1 text-[13px] leading-relaxed">' + html + '</div>'
}

function getGeo() {
  return new Promise((resolve) => {
    // Reverse geocode via OpenStreeMap Nominatim when browser location is shared.
    if (!navigator.geolocation || !navigator.onLine) return resolve(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
          .then((r) => r.json())
          .then((j) => resolve({ lat, lng, state: (j.address && (j.address.state || j.address.country)) || '' }))
          .catch(() => resolve({ lat, lng, state: '' }))
      },
      () => resolve(null),
      { timeout: 4000, maximumAge: 600000 }
    )
  })
}

function formatAnalysis(res) {
  const det = res.detection || {}
  const problem = res.problem || {}
  const upai = res.upai || {}
  const health = res.health || {}
  const guid = res.guidance || {}
  const hos = (res.hospitals && res.hospitals.nearby) || []
  const helpline = (res.hospitals && res.hospitals.helpline) || '1962'
  const top = det.top5 || {}
  const species = ESC(det.species || 'unknown')
  const score = det.score != null ? Math.round(det.score * 100) : null
  const cat = ESC(det.category || 'Livestock')

  let html = '<div class="space-y-2 text-[12px] leading-snug">'
  html += '<div class="rounded-lg border border-blue-200 bg-blue-50/80 px-2.5 py-2">'
  html += `<div class="text-[10px] font-bold text-blue-700/70 uppercase">AI species detection &middot; ${ESC(res.engine || 'SpeciesNet')}</div>`
  html += `<div class="mt-0.5 text-sm font-bold text-blue-900">${species}</div>`
  if (score != null) html += `<div class="text-[10px] font-semibold text-blue-600">Confidence ${score}% &middot; ${cat}</div>`
  if (top.classes && top.classes.length) {
    const names = top.classes.slice(0, 3).map((c) => ESC(String(c).split(';').pop() || c))
    html += `<div class="mt-1 text-[10px] text-slate-500">Top: ${names.join(' &middot; ')}</div>`
  }
  html += '</div>'

  if (res.auth_warning) html += `<div class="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[10px] font-semibold text-amber-700">${ESC(res.auth_warning)}</div>`

  if (problem && problem.name) {
    const sev = problem.severity || 'medium'
    const sevCls = sev === 'high' ? 'border-red-400 bg-red-50 text-red-800' : sev === 'medium' ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-green-300 bg-green-50 text-green-800'
    html += '<div class="rounded-lg border border-slate-200 bg-white px-2.5 py-2">'
    html += '<div class="text-[10px] font-bold text-slate-500 uppercase">Main suspected problem</div>'
    html += `<div class="mt-1 flex items-center justify-between gap-1"><span class="font-bold text-slate-800">${ESC(problem.name)}</span><span class="rounded-full border px-1.5 py-px text-[8px] font-bold ${sevCls}">${ESC(sev.toUpperCase())} RISK</span></div>`
    if (problem.signs) html += `<div class="mt-0.5 text-[10px] text-slate-600"><b>Signs to check:</b> ${ESC(problem.signs)}</div>`
    html += '</div>'
  }

  if (upai.immediate || upai.care_tips) {
    html += '<div class="rounded-lg border border-emerald-200 bg-emerald-50/70 px-2.5 py-2">'
    html += '<div class="text-[10px] font-bold text-emerald-700 uppercase">Upai / Remedy</div>'
    if (upai.immediate) html += `<div class="mt-0.5 text-[11px] text-slate-700"><b>Do now:</b> ${ESC(upai.immediate)}</div>`
    if (upai.care_tips) html += `<div class="mt-0.5 text-[10px] text-slate-600"><b>Care tips:</b> ${ESC(upai.care_tips)}</div>`
    if (upai.notify) html += `<div class="mt-0.5 text-[10px] text-red-700"><b>Notify:</b> ${ESC(upai.notify)}</div>`
    html += '</div>'
  }

  const diag = res.custom_diagnosis || []
  if (diag.length) {
    html += '<div class="rounded-lg border border-sky-200 bg-sky-50/70 px-2.5 py-2">'
    html += '<div class="text-[10px] font-bold text-sky-700 uppercase">AI disease detection &middot; trained models</div>'
    for (const d of diag) {
      const conf = d.confidence != null ? Math.round(d.confidence * 100) : null
      const confCls = conf != null && conf >= 45 ? 'text-emerald-700' : 'text-amber-600'
      html += `<div class="mt-1.5 rounded-md border border-sky-200 bg-white px-2 py-1">`
      html += `<div class="flex items-center justify-between gap-1"><span class="font-bold text-slate-800">${ESC(d.prediction || 'unknown')}</span>${conf != null ? `<span class="text-[11px] font-bold ${confCls}">${conf}%</span>` : ''}</div>`
      html += `<div class="text-[9px] text-slate-500">${ESC(d.model)}${d.val_accuracy != null ? ' &middot; val-acc ' + Math.round(d.val_accuracy) + '%' : ''}</div>`
      if (d.top && d.top.length) {
        const alt = d.top.slice(1, 3).map((t) => `${ESC(t.label)} ${t.confidence != null ? Math.round(t.confidence * 100) + '%' : ''}`).join(', ')
        if (alt) html += `<div class="text-[9px] text-slate-400">also: ${alt}</div>`
      }
      html += '</div>'
    }
    html += '</div>'
  }

  if (health.conditions && health.conditions.length) {
    html += '<div class="rounded-lg border border-slate-200 bg-white px-2.5 py-2">'
    html += '<div class="text-[10px] font-bold text-slate-500 uppercase">Other conditions to screen</div>'
    for (const c of health.conditions.slice(0, 5)) {
      const st = SEVERITY_STYLE[c.severity] || SEVERITY_STYLE.medium
      html += `<div class="mt-1.5 border ${st.cls} rounded-md px-2 py-1">`
      html += `<div class="flex items-center justify-between gap-1"><span class="font-bold">${ESC(c.name)}</span><span class="rounded-full border px-1.5 py-px text-[8px] font-bold ${st.cls}">${st.label}</span></div>`
      html += `<div class="text-[10px] mt-0.5"><b>Signs:</b> ${ESC(c.signs)}</div>`
      html += `<div class="text-[10px] mt-0.5"><b>Advice:</b> ${ESC(c.advice)}</div>`
      html += '</div>'
    }
    if (health.red_flags && health.red_flags.length) html += `<div class="mt-1.5 text-[10px] font-semibold text-red-600">Red flags: ${health.red_flags.map(ESC).join(', ')}</div>`
    html += '</div>'
  }

  if (hos.length) {
    html += '<div class="rounded-lg border border-violet-200 bg-violet-50/70 px-2.5 py-2">'
    html += '<div class="text-[10px] font-bold text-violet-700 uppercase">Nearby veterinary hospital / check-up</div>'
    for (const h of hos.slice(0, 3)) {
      const dist = h.distance_km != null ? ` &middot; ~${Math.round(h.distance_km)} km away` : ''
      html += `<div class="mt-1.5 rounded-md border border-violet-200 bg-white px-2 py-1">`
      html += `<div class="font-bold text-slate-800">${ESC(h.name)}${dist}</div>`
      html += `<div class="text-[10px] text-slate-500">${ESC(h.type)} &middot; ${ESC(h.city)}, ${ESC(h.state)}</div>`
      html += `<div class="text-[10px] text-slate-500">Phone: <b>${ESC(h.phone || helpline)}</b></div>`
      html += '</div>'
    }
    html += `<div class="mt-1 text-[10px] font-semibold text-violet-700">Toll-free helpline: <b>${ESC((res.hospitals && res.hospitals.helpline) || '1962')}</b></div>`
    html += '</div>'
  }

  if (guid.care_tips || guid.helpline) {
    html += '<div class="rounded-lg border border-slate-200 bg-white px-2.5 py-2">'
    if (guid.care_tips) html += `<div class="text-[10px]"><b>Care tips:</b> ${ESC(guid.care_tips)}</div>`
    if (guid.helpline) html += `<div class="text-[10px] mt-1"><b>Helpline:</b> ${ESC(guid.helpline)}</div>`
    html += '</div>'
  }

  html += `<div class="text-[9px] italic text-slate-400">${ESC(res.disclaimer || 'AI-assisted screening only — not a veterinary diagnosis.')}</div>`
  html += '</div>'
  return html
}

const KB = [
  { re: /(outbreak|case|infected|cattle|lsd|fmd|ppr|avian|bird|flu|swine|disease|zoonotic)/i, reply: 'Active outbreak summary &mdash; LSD in Gir breed cattle (Gujarat), FMD with vesicular lesions (Rajasthan), PPR (Rajasthan), Avian Influenza H5N1 with culling zone (Alappuzha, Kerala) and ASF under movement ban (Kamrup, Assam). All cases are geo-tagged with lab confirmation in the Cases module. Current flash alerts: 14 active &middot; 9 quarantine orders issued.' },
  { re: /(vaccine|vaccin|camp|dose|booster|ring|immun)/i, reply: 'The Vaccination module tracks coverage across all districts &mdash; administered vs target doses (in lakh). Ring vaccination is active around LSD/FMD hotspots with winter booster campaigns for FMD &amp; LSD. Field vaccination camps are scheduled state-wise with live coverage %.' },
  { re: /(mvu|mobile|vehicle|dispatch|van|fleet|driver)/i, reply: 'Mobile Veterinary Unit dispatch &mdash; 12 response teams, 7 deployed in field, 5 en route/standby across 11 zones. Each MVU carries rapid diagnostic kits, cold-chain vaccines and emergency medicines. Live dispatch log available in the MVU module.' },
  { re: /(helpline|compensation|subsidy|claim|reimburs|fund|money|1962)/i, reply: 'Helpline 1962 (toll-free, 24x7). Compensation for notified disease losses is disbursed under state schemes &mdash; current disbursement cross 4.2 Cr. File and track claims from the Reports module or your district veterinary office.' },
  { re: /(quarantine|ban|movement|contain|zone|culling|bio.?securit)/i, reply: 'Containment status &mdash; 9 active quarantine orders, culling zone for H5N1 (Kerala), ASF movement ban (Assam) and border checkpoints active in 8 districts. Refer to the Cases module &raquo; Action Taken column for per-outbreak biosafety measures.' },
  { re: /(lab|test|sample|rt-?pcr|saliva|serolog|confirm)/i, reply: 'Regional veterinary labs perform RT-PCR, serotyping and whole-genome sequencing. Lab module shows 4,236 samples tested (1,179 positive). Per-case collection, test and confirmation status is updated live.' },
  { re: /(vaccine code|report|form|document|permit|certificate|nodal|officer|helpline number)/i, reply: 'Government coordination &mdash; 58 nodal officers across states and 180 district contacts. Submit reports, access formats and track compensation in the Reports module. The full nodal officer directory is in the Govteam module.' },
]

const FALLBACK = 'I provide information on active disease outbreaks, field vaccination campaigns, MVU dispatch tracking, regional lab test results, quarantine/containment orders and the national helpline (1962). You can use the quick chips above or ask about "outbreak status", "vaccination camp", "MVU team" or "helpline 1962".'

function answer(q) {
  for (let i = 0; i < KB.length; i++) {
    if (KB[i].re.test(q)) return KB[i].reply
  }
  return FALLBACK
}

// Bengali/Banglish offline reply so the doctor ALWAYS talks Bengali when the AI server is down.
function localReply(q) {
  const t = String(q || '').trim()
  const low = t.toLowerCase()
  if (/(^|\s)(hlw|hello|hellow|hlo|hei|hii?|hi|assalam|namaste|namaskar|shagoto|ki\s*obostha|kemon\s*(acho|achen|aso)|kire)\b/.test(low) || /[\u0980-\u09FF]/.test(t.slice(0, 4))) {
    return 'Namaste! Ami PashuSahaya — apnar AI pashu-chikitshak (vet doctor). Goru-mahish, chagol-bhera, has-murgi o kukur-biraler rog, tauta bujhiye poshu upai, tikar somoy, ba poshur photo pathale notun kothao vet hospital khuje dewa — ami ei shob kore debo. Chaliye-dekhun, kotha boli. Joruri hole Helpline 1962.'
  }
  for (let i = 0; i < KB.length; i++) {
    if (KB[i].re.test(q)) return KB[i].reply
  }
  if (/[\u0980-\u09FF]/.test(t) || /\b(goru|gai|chagol|murgi|rog|bimar|lumpy|lumpi|dana|jwala|tika|poka|khabar|upai)\b/i.test(low)) {
    return 'Apnar prosnota ektu bissoy ta bujhte parini. Choto kore likhun: "kis poshu? ki somossha? kotodin dhore?" — ba ekti photo pathaleo hobe. Ami rog bole diye kache vet hospital o dekhay dibo. Jaruri hole Helpline 1962.'
  }
  return FALLBACK
}

const MALE_TEXTS = ['AI Help Desk', 'রোগ নজরদারি ও দ্রুত প্রতিক্রিয়া', 'জরুরি হেল্পলাইন 1962', 'টিকা ও রোগ-নিয়ন্ত্রণ তথ্য', 'সচল প্রাদুর্ভাব ব্যবস্থাপনা']
const FEMALE_TEXTS = ['AI Help Desk', 'গবাদি-পশুর স্বাস্থ্য উপদেশ', 'প্রতিরোধ টিকাকরণ সহায়তায়', 'কৃষক সহায়তা ও দাবি পূরণ', 'রোগ-গবেষণা ও প্রতিবেদন']

const GENDER_SRC = {
  male: 'img/icon/male_ai_help_desk.png',
  female: 'img/icon/female_ai_help_desk.jpg',
}

function fileIcon(name) {
  const n = name.toLowerCase()
  if (n.match(/\.(xls|xlsx|csv)$/)) return 'FileSpreadsheet'
  if (n.match(/\.(dcm|dicom)$/)) return 'ScanLine'
  if (n.match(/\.(jpg|jpeg|png|tiff|tif)$/)) return 'FileImage'
  if (n.match(/\.(pdf)$/)) return 'FileBadge'
  if (n.match(/\.(doc|docx)$/)) return 'FileText'
  return 'Paperclip'
}

function ts() {
  const d = new Date()
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
}

function plainText(html) {
  return String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&mdash;/g, ' — ')
    .replace(/&middot;/g, ' · ')
    .replace(/&raquo;/g, ' » ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function Message({ who, html, gender }) {
  const src = GENDER_SRC[gender]
  if (who === 'u') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-gradient-to-br from-blue-700 to-blue-900 px-3.5 py-2.5 text-[13px] leading-relaxed text-white shadow" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    )
  }
  return (
    <div className="flex justify-start items-end gap-2">
      <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full ring-1 ring-blue-200">
        <img className="ai-bot-av h-7 w-7 rounded-full object-cover" src={src} alt="AI" />
      </div>
      <div className="max-w-[80%] rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-slate-700 shadow-sm" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}

export default function AIHelpDesk() {
  const [open, setOpen] = useState(false)
  const [gender, setGender] = useState('male')
  const [auto, setAuto] = useState(true)
  const [label, setLabel] = useState('')
  const [labelShown, setLabelShown] = useState(false)
  const [showPanel, setShowPanel] = useState(false)
  const [messages, setMessages] = useState([])
  const [attach, setAttach] = useState([])
  const [typing, setTyping] = useState(false)
  const [input, setInput] = useState('')
  const [speed, setSpeed] = useState(1.0)
  const [pitch, setPitch] = useState(0)
  const [panelW, setPanelW] = useState(380)
  const spdRef = useRef(1.0)
  const pchRef = useRef(0)
  const resizingRef = useRef(false)
  const inputRef = useRef(null)
  const fileRef = useRef(null)
  const msgsRef = useRef(null)
  const busyRef = useRef(false)
  const uidRef = useRef(makeUid())
  const spkRef = useRef(0)
  const cycleTimer = useRef(null)
  const cycleOn = useRef(true)
  const idxRef = useRef(-1)
  const cycleCount = useRef(0)
  const genderRef = useRef('male')
  const autoRef = useRef(true)

  const scrollBottom = () => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight
  }

  const startResize = (e) => {
    e.preventDefault()
    resizingRef.current = true
    document.body.style.userSelect = 'none'
    const onMove = (ev) => {
      if (!resizingRef.current) return
      const vw = window.innerWidth
      const handleW = document.getElementById('aiResizeHandle')
      const handleX = handleW ? handleW.getBoundingClientRect().right : 0
      const want = 380 + (handleX - ev.clientX)
      const max = Math.floor(vw - 40)
      setPanelW(Math.max(300, Math.min(560, max, want)))
    }
    const onUp = () => {
      resizingRef.current = false
      document.body.style.userSelect = ''
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  useEffect(() => {
    if (!open) return
    scrollBottom()
  }, [messages, typing, open])

  useEffect(() => {
    scrollBottom()
  }, [])

  // Voice read-out — exactly like the original PashuSahaya SmartBot `speak()`:
  // try server edge-tts /speak first, fall back to browser speechSynthesis so the
  // bot ALWAYS speaks, with a press-again-to-stop toggle.
  useEffect(() => {
    const guessLang = (t) => {
      const s = String(t || '')
      for (const ch of s) {
        const p = ch.codePointAt(0)
        if (p >= 0x0980 && p <= 0x09FF) return 'bn'
        if (p >= 0x0900 && p <= 0x097F) return 'hi'
        if (p >= 0x0600 && p <= 0x06FF) return 'ur'
      }
      const w = ' ' + s.toLowerCase() + ' '
      const bnRe = /\b(kemon|obostha|korcho|bolo|valo|bhalo|dhonyobad|ami|amar|tumi|apni|apnar|kotha|chakri|tokar|poysa|mon|vai|bhai|korte|lagbe|korbo|koro|korben|likhi|likhte|hobe|acha|thik|ache|ase|sobar|ki|na|ar|goru|gorur|hote|pare|rakhen|khub|jola|jwala|rog|thakbe|hoyeche|dekhay)\b/g
      const hiRe = /\b(main|tum|mera|meri|kaise|kya|hai|kaam|chahiye|naam|acha|badiya|shukriya|bolo|batao|madad|sawal|sabse|apna|apni|apka|kuch|karo|karne|hoga|tha|hum|aap|kaun|kyun|kab|gai|bimar|doodh|hota|kijiye)\b/g
      const bnl = (w.match(bnRe) || []).length
      const hil = (w.match(hiRe) || []).length
      if (bnl > 0 && bnl >= hil) return 'bn'
      if (hil > 0) return 'hi'
      return 'en'
    }
    window.PS_Speak = function (encText, btnId) {
      const btn = btnId ? document.getElementById(btnId) : null
      const LBL = '🔊 Read'
      if (!btn) return
      const wasPlaying = btn.classList.contains('playing')
      if (window.__psAud) {
        const au = window.__psAud
        au.pause()
        au.onended = null
        au.onerror = null
        au.src = ''
        window.__psAud = null
      }
      if (window.__psSyn) {
        try { speechSynthesis.cancel() } catch (e) {}
        window.__psSyn = null
      }
      document.querySelectorAll('.speak-btn.playing').forEach((b) => {
        b.classList.remove('playing')
        b.textContent = LBL
      })
      if (wasPlaying) return
      const text = decodeURIComponent(encText)
      const tone = genderRef.current === 'female' ? 'female' : 'male'
      const spd = Number(spdRef.current) || 1
      const pch = Number(pchRef.current) || 0
      const markBtn = (playing) => {
        if (playing) {
          btn.classList.add('playing')
          btn.textContent = '⏹️ Stop'
        } else {
          btn.classList.remove('playing')
          btn.textContent = LBL
        }
      }
      const synth = () => {
        try {
          const ul = guessLang(text)
          const u = new SpeechSynthesisUtterance(text)
          u.lang = ul === 'bn' ? 'bn-BD' : ul === 'hi' ? 'hi-IN' : ul === 'ur' ? 'ur-PK' : 'en-IN'
          u.rate = spd
          u.pitch = 1 + pch
          const v = window.speechSynthesis ? speechSynthesis.getVoices().find((x) => x.lang === u.lang) : null
          if (v) u.voice = v
          u.onend = () => { window.__psSyn = null; markBtn(false) }
          u.onerror = () => { window.__psSyn = null; markBtn(false) }
          markBtn(true)
          window.__psSyn = u
          speechSynthesis.speak(u)
        } catch (e) { markBtn(false) }
      }
      const tryServer = () => {
        fetch(AI_API_BASE + '/speak?q=' + encText + '&tone=' + tone, { signal: AbortSignal.timeout(12000) })
          .then((r) => { if (!r.ok) throw new Error('http'); return r.arrayBuffer() })
          .then((buf) => {
            const url = URL.createObjectURL(new Blob([buf], { type: 'audio/mpeg' }))
            const au = new Audio(url)
            au.playbackRate = spd
            au.preservesPitch = false
            au.onended = () => { window.__psAud = null; markBtn(false); URL.revokeObjectURL(url) }
            au.onerror = () => { window.__psAud = null; URL.revokeObjectURL(url); synth() }
            au.play().catch(() => { window.__psAud = null; URL.revokeObjectURL(url); synth() })
            window.__psAud = au
            markBtn(true)
          })
          .catch(() => synth())
      }
      tryServer()
    }
  }, [])

  const aiName = () => (genderRef.current === 'female' ? 'Dr. Ananya AI' : 'Dr. Arjun AI')

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          who: 'b',
          html:
            '<span class="ai-msg-name text-[10px] font-semibold text-blue-700/60">' + aiName() + '</span><span class="text-[10px] font-semibold text-blue-700/60"> &middot; ' + ts() + '</span><br>Namaste! I am <span class="ai-msg-name font-semibold">' + aiName() + '</span> &mdash; National Livestock Disease Surveillance &amp; Response system. I assist field veterinary officers, nodal officers and farmers with outbreak tracking, vaccination coverage, MVU dispatch, lab test reports, quarantine status and the national helpline (1962).',
        },
      ])
    }
  }, [])

  useEffect(() => {
    genderRef.current = gender
  }, [gender])

  useEffect(() => {
    autoRef.current = auto
  }, [auto])

  const aiNext = () => {
    if (!cycleOn.current || open) return
    cycleCount.current++
    if (autoRef.current && cycleCount.current % 3 === 0) {
      const ng = genderRef.current === 'male' ? 'female' : 'male'
      setGender(ng)
    }
    const list = genderRef.current === 'female' ? FEMALE_TEXTS : MALE_TEXTS
    idxRef.current = (idxRef.current + 1) % list.length
    const text = list[idxRef.current]
    let parts
    if (window.Intl && Intl.Segmenter) {
      parts = Array.from(new Intl.Segmenter('und', { granularity: 'grapheme' }).segment(text), (s) => s.segment)
    } else {
      parts = Array.from(text)
    }
    setLabelShown(true)
    setLabel('')
    const typeIt = (i) => {
      if (!cycleOn.current || open) return
      setLabel(parts.slice(0, i).join(''))
      if (i < parts.length) {
        cycleTimer.current = setTimeout(() => typeIt(i + 1), 48)
      } else {
        cycleTimer.current = setTimeout(() => {
          setLabelShown(false)
          aiHideAll()
        }, 5000)
      }
    }
    cycleTimer.current = setTimeout(() => typeIt(1), 250)
  }

  const aiHideAll = () => {
    if (!cycleOn.current || open) return
    setLabelShown(false)
    cycleTimer.current = setTimeout(aiNext, 1200)
  }

  useEffect(() => {
    if (!open) {
      cycleOn.current = true
      cycleTimer.current = setTimeout(aiNext, 1200)
    } else {
      cycleOn.current = false
      if (cycleTimer.current) clearTimeout(cycleTimer.current)
    }
    return () => {
      if (cycleTimer.current) clearTimeout(cycleTimer.current)
    }
  }, [open])

  useEffect(() => () => { if (cycleTimer.current) clearTimeout(cycleTimer.current) }, [])

  const handleToggle = () => {
    const next = !open
    setOpen(next)
    if (next) {
      setShowPanel(true)
    } else {
      setShowPanel(false)
    }
  }

  const handleGender = (g) => {
    setGender(g)
    setAuto(false)
  }

  const handleAuto = () => setAuto((a) => !a)

  const onFiles = (e) => {
    const files = Array.prototype.slice.call(e.target.files || [])
    e.target.value = ''
    setAttach((a) => [...a, ...files])
  }

  const removeAt = (i) => setAttach((a) => a.filter((_, x) => x !== i))

  const send = (forced) => {
    const q = (forced !== undefined ? forced : input).trim()
    const att = attach
    if (!q && !att.length) return
    if (busyRef.current) return
    setInput('')
    busyRef.current = true

    let attHtml = ''
    if (att.length) {
      attHtml = '<div class="mt-1.5 flex flex-col gap-0.5">' + att.map((a) => '<div class="flex items-center gap-1 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-50">' + ESC(a.name) + '</div>').join('') + '</div>'
    }
    setMessages((m) => [...m, { who: 'u', html: '<span class="text-[10px] font-semibold text-blue-100/80">You &middot; ' + ts() + '</span><br>' + ESC(q) + attHtml }])
    setTyping(true)

    const pics = att.filter((a) => isImageFile(a.name))
    const hasTextQ = !!q

    const finish = (reply, keepAtt = false, rawText = null) => {
      const spkId = 'ps-spk-' + ++spkRef.current
      const srcText = encodeURIComponent(rawText !== null ? String(rawText) : plainText(reply)).replace(/'/g, '%27')
      const speakBtn =
        '<div class="mt-2 flex justify-end"><button id="' + spkId +
        '" onclick="window.PS_Speak(\'' + srcText + '\',\'' + spkId + '\')" ' +
        'class="speak-btn rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700 hover:bg-blue-100">🔊 Read</button></div>'
      setMessages((m) => [...m, { who: 'b', html: '<span class="ai-msg-name text-[10px] font-semibold text-blue-700/60">' + aiName() + '</span><span class="text-[10px] font-semibold text-blue-700/60"> &middot; ' + ts() + '</span><br>' + reply + (rawText !== null || reply ? speakBtn : '') }])
      setTyping(false)
      if (!keepAtt) setAttach([])
      busyRef.current = false
    }

    const doReply = () => {
      let reply = answer(q || '')
      if (att.length) {
        const other = att.filter((a) => !isImageFile(a.name))
        reply += '<br><div class="mt-1.5 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-[10px] font-semibold text-blue-700">Attachment received and associated with the case workspace: ' + att.map((a) => ESC(a.name)).join(', ') + '.</div>'
        if (other.length) reply += '<div class="mt-1 text-[10px] text-amber-600">Non-image files are attached to the case — send an image (JPG/PNG/WEBP/TIFF) for AI health analysis.</div>'
      }
      finish(reply, false, plainText(reply))
    }

    if (pics.length) {
      const file = pics[0]
      analyzeImage(file)
        .then((res) => {
          const det = res.detection || {}
          const prob = res.problem || {}
          const upai = res.upai || {}
          const raw = (det.species || 'Animal') +
            (det.score != null ? ' detected with ' + Math.round(det.score * 100) + '% confidence. ' : ' ') +
            (prob.name ? 'Possible disease: ' + prob.name + '. ' : '') +
            (prob.signs ? 'Signs to check: ' + prob.signs + '. ' : '') +
            (upai.immediate ? 'Immediate advice: ' + upai.immediate + '. ' : '')
          const prefix = hasTextQ ? `<div class="mb-1.5 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-[10px] font-semibold text-blue-700">Analysis for <b>${ESC(file.name)}</b></div>` : ''
          finish(prefix + formatAnalysis(res), false, raw)
        })
        .catch((err) => {
          const hint = hasTextQ ? '' : ' Include an image to run AI health analysis.'
          finish('<div class="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-700">AI analysis unavailable: ' + ESC(String(err.message || err)) + '. Is the backend running? (' + ESC(AI_API_BASE) + ')' + hint + '</div>')
        })
      return
    }

    if (q) {
      // Full doctor chat via backend Gemini (Bengali) — local KB only as offline fallback.
      doctorChat(q, uidRef.current, genderRef.current === 'female' ? 'female' : 'male')
        .then((d) => {
          if (d && d.reply && !d.offline) {
            finish(formatChatReply(d.reply), false, d.reply)
          } else {
            finish(localReply(q), false, plainText(localReply(q)))
          }
        })
        .catch(() => {
          finish(localReply(q), false, plainText(localReply(q)))
        })
      return
    }

    setTimeout(doReply, 900)
  }

  const quick = (k) => {
    const map = { outbreak: 'Latest outbreak status?', vaccination: 'Vaccination camps schedule', mvu: 'MVU team status', helpline: 'Helpline & compensation' }
    send(map[k] || map.outbreak)
  }

  useEffect(() => { scrollBottom() }, [attach])

  return (
    <>
      <div className="fixed bottom-5 right-5 z-[60] flex items-center gap-2.5">
        <div id="aiLabel" className={`ai-label-anim whitespace-nowrap ${labelShown && !open ? 'ai-cycle-shown' : 'ai-cycle-hide ai-hide-l'}`}>
          <span id="aiLabelText" className="text-lg font-bold text-blue-900">{label}</span>
          <span id="aiCaret" className="ai-caret ml-0.5 text-lg font-bold text-blue-500" style={{ display: open || !labelShown ? 'none' : 'inline-block' }}>|</span>
        </div>
        <div
          id="aiFab"
          onClick={handleToggle}
          className={`${open ? 'ai-idle ai-cycle-shown' : 'ai-glow-container ai-cycle-shown'} flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-blue-700 via-blue-800 to-blue-950 shadow-2xl shadow-blue-900/40 ring-4 ring-blue-700/25 hover:scale-105 hover:ring-blue-600/50 transition-all duration-300`}
          title="AI Help Desk"
        >
          <img id="aiFabImg" src={GENDER_SRC[gender]} alt="AI Help Desk" className="ai-pop h-16 w-16 rounded-full object-cover" />
        </div>
      </div>

      {showPanel && (
        <div
          id="aiPanelWrap"
          className={`fixed bottom-24 right-5 z-[60] transition-all duration-300 ${open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'}`}
          style={{ width: panelW + 'px', maxWidth: 'calc(100vw - 2.5rem)', maxHeight: 'min(600px, calc(100vh - 8rem))' }}
        >
          <div
            id="aiResizeHandle"
            onMouseDown={startResize}
            className="group absolute -left-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize rounded-full border border-blue-200 bg-blue-50/80 px-[3px] py-4 shadow-sm hover:border-blue-400 hover:bg-blue-100 active:bg-blue-200"
            title="Drag to resize"
          >
            <div className="flex h-5 w-[3px] flex-col justify-center gap-[3px]">
              <span className="h-[3px] w-[3px] rounded-full bg-blue-400"></span>
              <span className="h-[3px] w-[3px] rounded-full bg-blue-400"></span>
              <span className="h-[3px] w-[3px] rounded-full bg-blue-400"></span>
            </div>
          </div>
          <div id="aiPanel" className="flex h-full max-h-[inherit] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl shadow-blue-900/30 ring-1 ring-slate-200 border border-slate-200">
          <div className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808]"></div>
          <div className="flex items-center gap-3 bg-gradient-to-br from-blue-900 to-indigo-950 px-4 py-3 text-white">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full ring-2 ring-white/30">
              <img id="aiAvatar" src={GENDER_SRC[gender]} alt="AI Assistant" className="ai-pop h-11 w-11 rounded-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold leading-tight">PashuSahaya AI Help Desk</div>
              <div className="flex items-center gap-1 text-[10px] text-blue-200">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></span>
                Online &middot; <span id="aiGenText">{gender === 'female' ? 'Dr. Ananya · AI assistant' : 'Dr. Arjun · AI assistant'}</span>
              </div>
            </div>
            <button onClick={handleToggle} className="rounded-full p-1.5 hover:bg-white/10"><X className="h-5 w-5" /></button>
          </div>
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-white px-3 py-2">
            <span className="text-[11px] font-semibold text-slate-500">Assistant:</span>
            <div className="flex items-center gap-1.5">
              <div className="flex rounded-full bg-slate-100 p-1">
                <button onClick={() => handleGender('male')} data-g="male" className={`ai-gender-opt flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${gender === 'male' ? 'bg-gradient-to-br from-blue-700 to-blue-900 text-white shadow-md opacity-100' : 'text-slate-600 opacity-60'}`}>
                  <img src={GENDER_SRC.male} alt="Arjun" className="h-5 w-5 rounded-full object-cover" />
                  Arjun
                </button>
                <button onClick={() => handleGender('female')} data-g="female" className={`ai-gender-opt flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${gender === 'female' ? 'bg-gradient-to-br from-blue-700 to-blue-900 text-white shadow-md opacity-100' : 'text-slate-600 opacity-60'}`}>
                  <img src={GENDER_SRC.female} alt="Ananya" className="h-5 w-5 rounded-full object-cover" />
                  Ananya
                </button>
              </div>
              <button onClick={handleAuto} className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold shadow transition ${auto ? 'bg-blue-600 text-white' : 'text-blue-600 bg-transparent'}`} title="Auto switch male/female">
                <RefreshCw className="h-3.5 w-3.5" /> AUTO
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 border-b border-slate-100 bg-white px-3 py-2">
            <div className="flex flex-1 flex-wrap items-center gap-1.5">
              <button onClick={() => quick('outbreak')} className="ai-chip shrink-0 whitespace-nowrap rounded-full border border-blue-200 bg-blue-50/60 px-2.5 py-1 text-[11px] font-bold leading-none text-blue-700 transition hover:bg-blue-100 hover:border-blue-400">🔥 Outbreak</button>
              <button onClick={() => quick('vaccination')} className="ai-chip shrink-0 whitespace-nowrap rounded-full border border-blue-200 bg-blue-50/60 px-2.5 py-1 text-[11px] font-bold leading-none text-blue-700 transition hover:bg-blue-100 hover:border-blue-400">💉 Vaccine</button>
              <button onClick={() => quick('mvu')} className="ai-chip shrink-0 whitespace-nowrap rounded-full border border-blue-200 bg-blue-50/60 px-2.5 py-1 text-[11px] font-bold leading-none text-blue-700 transition hover:bg-blue-100 hover:border-blue-400">🚚 MVU</button>
              <button onClick={() => quick('helpline')} className="ai-chip shrink-0 whitespace-nowrap rounded-full border border-blue-200 bg-blue-50/60 px-2.5 py-1 text-[11px] font-bold leading-none text-blue-700 transition hover:bg-blue-100 hover:border-blue-400">☎️ Helpline</button>
            </div>
            <button onClick={() => fileRef.current.click()} className="shrink-0 rounded-full border border-emerald-300 bg-emerald-50 p-2 text-emerald-700 transition hover:bg-emerald-100" title="Health scan — upload animal photo"><ScanLine className="h-3.5 w-3.5" /></button>
          </div>

          <div ref={msgsRef} className="custom-scrollbar flex-1 space-y-3 overflow-y-auto bg-slate-50/70 px-3 py-3">
            {messages.map((m, i) => (
              <Message key={i} who={m.who} html={m.html} gender={gender} />
            ))}
            {typing && (
              <div className="flex items-end gap-2 ai-typing">
                <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full ring-1 ring-blue-200">
                  <img className="ai-bot-av h-7 w-7 rounded-full object-cover" src={GENDER_SRC[gender]} alt="AI" />
                </div>
                <div className="rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-3.5 py-3 shadow-sm">
                  <i></i><i></i><i></i>
                </div>
              </div>
            )}
          </div>

          {attach.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 bg-white px-3 pt-2">
              {attach.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] text-slate-600">
                  <span className="max-w-[130px] truncate font-semibold text-slate-700">{f.name}</span>
                  <button onClick={() => removeAt(i)} className="text-slate-400 hover:text-red-500"><X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2.5 border-t border-slate-100 bg-slate-50/80 px-3 py-1.5">
            <div className="flex items-center gap-1">
              <button onClick={() => handleGender('male')} title="Male voice" className={`rounded-full px-2 py-0.5 text-[10px] font-bold leading-none transition ${gender === 'male' ? 'bg-gradient-to-br from-blue-700 to-blue-900 text-white shadow' : 'bg-white text-slate-500 border border-slate-200'}`}>🧔 Male</button>
              <button onClick={() => handleGender('female')} title="Female voice" className={`rounded-full px-2 py-0.5 text-[10px] font-bold leading-none transition ${gender === 'female' ? 'bg-gradient-to-br from-blue-700 to-blue-900 text-white shadow' : 'bg-white text-slate-500 border border-slate-200'}`}>👩 Female</button>
            </div>
            <label className="flex flex-1 items-center gap-1 text-[9px] font-bold text-slate-500" title="Speech speed">⚡<input type="range" min="0.7" max="1.5" step="0.05" value={speed} onChange={(e) => { const v = parseFloat(e.target.value) || 1; setSpeed(v); spdRef.current = v }} className="w-full cursor-pointer accent-blue-700" /></label>
            <label className="flex flex-1 items-center gap-1 text-[9px] font-bold text-slate-500" title="Voice pitch">🎵<input type="range" min="-0.3" max="0.3" step="0.05" value={pitch} onChange={(e) => { const v = parseFloat(e.target.value) || 0; setPitch(v); pchRef.current = v }} className="w-full cursor-pointer accent-blue-700" /></label>
          </div>

          <div className="flex items-center gap-2 border-t border-slate-200 bg-white px-3 py-2.5">
            <button onClick={() => fileRef.current.click()} className="rounded-full p-2.5 text-slate-500 hover:bg-slate-100 hover:text-blue-700" title="Upload file">
              <Paperclip className="h-4 w-4 rotate-45" />
            </button>
            <input ref={fileRef} type="file" multiple accept=".xls,.xlsx,.jpg,.jpeg,.png,.webp,.bmp,.tiff,.tif,.dcm,.doc,.docx,.pdf" className="hidden" onChange={onFiles} />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') send() }}
              type="text"
              placeholder="Ask anything about livestock, outbreaks, camps..."
              autoComplete="off"
              className="flex-1 rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            <button onClick={() => send()} className="rounded-full bg-gradient-to-br from-blue-700 to-blue-900 p-2.5 text-white shadow-md hover:opacity-90"><Send className="h-4 w-4" /></button>
          </div>
          <div className="px-3 pb-2 text-[9px] leading-tight text-slate-400">Attach an animal photo for AI health scan &middot; supports JPG/PNG/WEBP/TIFF/DICOM · XLS/DOC/PDF for case files</div>
          </div>
        </div>
      )}
    </>
  )
}
