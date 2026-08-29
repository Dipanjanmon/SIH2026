import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Camera, FileText, CheckCircle, Mic, MicOff, Shield, Pill, Clock, Users, MapPin, Activity, Volume2, Navigation } from 'lucide-react';
import apiClient from '../api/client';

// --- Language Configuration ---
const LANGUAGES = [
  { code: 'hi-IN', name: 'हिन्दी', label: 'Hindi' },
  { code: 'mr-IN', name: 'मराठी', label: 'Marathi' },
  { code: 'bn-IN', name: 'বাংলা', label: 'Bengali' },
  { code: 'pa-IN', name: 'ਪੰਜਾਬੀ', label: 'Punjabi' },
  { code: 'te-IN', name: 'తెలుగు', label: 'Telugu' },
  { code: 'ta-IN', name: 'தமிழ்', label: 'Tamil' },
  { code: 'gu-IN', name: 'ગુજરાતી', label: 'Gujarati' },
  { code: 'en-IN', name: 'English', label: 'English' },
];

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  image?: string;
  data?: CompleteResponse;
  timestamp: Date;
}

interface CompleteResponse {
  identified_disease?: string;
  confidence?: number;
  risk_level?: string;
  natural_response?: string | null;
  response_source?: string;
  diagnosis?: {
    probable_disease: string;
    confidence: number;
    risk_level: string;
    is_emergency: boolean;
    immediate_actions: string[];
    follow_up_questions?: string[];
  };
  treatment?: {
    available: boolean;
    first_aid: string[];
    drugs: Array<{ name: string; dosage: string; purpose: string; duration: string }>;
    severity_timeline: Record<string, string>;
    estimated_cost: { per_animal: string; breakdown: string };
    mortality_rate: string;
    recovery_time: string;
    prevention: string[];
  };
  intelligence?: {
    area_cases: { same_disease_nearby: number; cases_last_7_days: number; cluster_forming: boolean; summary: string };
    vaccination_status: { coverage_percent: number; status: string; message: string };
    weather_risk: { season: string; season_risk: string; advisory: string };
    herd_risk: { animals_at_risk: number; farm_animals: number; timeframe: string; risk_level: string; message: string };
    outbreak_status: { status: string; level: string; message: string };
  };
  action_summary?: {
    urgency: string;
    actions: Array<{ priority: string; action: string }>;
    auto_report_recommended: boolean;
  };
  image_analysis?: { prediction: string; confidence: number };
}

const QUICK_PROMPTS = [
  '🐄 Cow has fever and blisters',
  '🐐 Goat diarrhea and nasal discharge',
  '🐃 Buffalo skin lumps/nodules',
  '🐄 Udder swollen, milk clots',
  '💀 Animal died suddenly',
];

export default function AiFloatingChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0', role: 'ai',
      text: "Namaste! 🙏 I'm PashuRaksha AI — your livestock health assistant.\n\n🔬 Describe symptoms or upload a photo\n💊 I'll give you disease + treatment + drugs\n📊 Area outbreak status + herd risk\n🎤 Speak in your language (Hindi, Marathi, Bengali...)\n📍 Auto GPS location capture\n\nWhat's happening with your animal?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [animalType, setAnimalType] = useState('cattle');
  const [district, setDistrict] = useState('Palghar');
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [selectedLang, setSelectedLang] = useState('hi-IN');
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const addMessage = (msg: ChatMessage) => setMessages(prev => [...prev, msg]);

  // --- GPS Auto-Capture ---
  const captureGPS = () => {
    if (!navigator.geolocation) {
      alert('GPS not supported on this device');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
        addMessage({
          id: Date.now().toString(), role: 'ai',
          text: `📍 Location captured: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}\n\nThis will be used to check nearby cases and outbreaks in your area.`,
          timestamp: new Date(),
        });
      },
      () => {
        setGpsLoading(false);
        addMessage({
          id: Date.now().toString(), role: 'ai',
          text: `📍 Could not get GPS. Please allow location access or type your village/district name.`,
          timestamp: new Date(),
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // --- Text-to-Speech (Read AI response aloud) ---
  const speakText = (text: string, msgId: string) => {
    if (speakingId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    // Clean text: remove markdown bold, emojis for cleaner speech
    const cleanText = text.replace(/\*\*/g, '').replace(/[🔬💊📊🎤📍⚠️🚨🟢🟡🔴⏱️💀💰🐄🐐🐃]/g, '').replace(/\n+/g, '. ');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Match TTS language to selected language
    const langMap: Record<string, string> = {
      'hi-IN': 'hi-IN', 'mr-IN': 'mr-IN', 'bn-IN': 'bn-IN', 'pa-IN': 'pa-IN',
      'te-IN': 'te-IN', 'ta-IN': 'ta-IN', 'gu-IN': 'gu-IN', 'en-IN': 'en-IN',
    };
    utterance.lang = langMap[selectedLang] || 'hi-IN';
    utterance.rate = 0.9;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // --- Speech-to-Text (Voice Input) ---
  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input not supported. Use Chrome or Edge browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = selectedLang; // Uses selected language
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => (prev + ' ' + transcript).trim());
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  // --- Complete Diagnosis (text) ---
  const sendText = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    addMessage({ id: Date.now().toString(), role: 'user', text: msg, timestamp: new Date() });
    setInput('');
    setLoading(true);

    try {
      const payload: Record<string, any> = {
        message: msg, animal_type: animalType, district, farm_animal_count: 12, language: selectedLang,
      };
      if (gpsLocation) { payload.latitude = gpsLocation.lat; payload.longitude = gpsLocation.lng; }
      const res = await apiClient.post('/diagnose/complete', payload);
      const data: CompleteResponse = res.data;
      const responseText = buildResponseText(data);
      addMessage({ id: (Date.now() + 1).toString(), role: 'ai', text: responseText, data, timestamp: new Date() });
    } catch {
      try {
        const res = await apiClient.post('/chat/advisory', { message: msg, animal_type: animalType, language: selectedLang });
        addMessage({ id: (Date.now() + 1).toString(), role: 'ai', text: res.data.response || 'Could not analyze.', data: res.data, timestamp: new Date() });
      } catch {
        addMessage({ id: (Date.now() + 1).toString(), role: 'ai', text: 'Service unavailable. Please try again.', timestamp: new Date() });
      }
    } finally { setLoading(false); }
  };

  // --- Image Upload + Complete Diagnosis ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || loading) return;
    const reader = new FileReader();
    reader.onload = () => addMessage({ id: Date.now().toString(), role: 'user', text: '📷 Analyzing image...', image: reader.result as string, timestamp: new Date() });
    reader.readAsDataURL(file);

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const imgRes = await apiClient.post('/detect/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const imgResult = imgRes.data;

      const payload: Record<string, any> = {
        image_prediction: imgResult.prediction, image_confidence: imgResult.confidence,
        animal_type: animalType, district, farm_animal_count: 12, language: selectedLang,
      };
      if (gpsLocation) { payload.latitude = gpsLocation.lat; payload.longitude = gpsLocation.lng; }
      const completeRes = await apiClient.post('/diagnose/complete', payload);
      const data: CompleteResponse = completeRes.data;
      const responseText = buildResponseText(data);
      addMessage({ id: (Date.now() + 1).toString(), role: 'ai', text: responseText, data, timestamp: new Date() });
    } catch {
      addMessage({ id: (Date.now() + 1).toString(), role: 'ai', text: 'Could not analyze image. Try a clearer photo or describe symptoms.', timestamp: new Date() });
    } finally { setLoading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendText(); } };

  function buildResponseText(data: CompleteResponse): string {
    if (!data.identified_disease) return 'Could not identify disease clearly. Please describe more symptoms.';
    const d = data.identified_disease;
    const conf = Math.round((data.confidence || 0) * 100);
    const risk = data.risk_level || 'UNKNOWN';
    const emergency = data.diagnosis?.is_emergency ? '🚨 EMERGENCY\n' : '';
    // If the LLM produced a natural-language summary in the farmer's language, lead with it.
    const natural = data.natural_response ? `${data.natural_response}\n\n─────────\n` : '';
    let text = `${natural}${emergency}🔬 **${d}** (${conf}%, ${risk} risk)\n`;
    if (data.intelligence?.outbreak_status) text += `\n${data.intelligence.outbreak_status.message}\n`;
    if (data.intelligence?.herd_risk && data.intelligence.herd_risk.risk_level !== 'LOW') text += `\n🐄 ${data.intelligence.herd_risk.message}\n`;
    if (data.treatment?.available) text += `\n⏱️ Recovery: ${data.treatment.recovery_time} | 💀 Mortality: ${data.treatment.mortality_rate}\n💰 Est. cost: ${data.treatment.estimated_cost.per_animal}`;
    return text;
  }

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button onClick={() => setOpen(true)} className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all group">
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold ring-2 ring-white">AI</span>
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white overflow-hidden sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[400px] sm:h-[640px] sm:rounded-2xl sm:border sm:border-gray-200 sm:shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20"><Bot className="h-4 w-4 text-white" /></div>
              <div>
                <p className="text-sm font-semibold text-white">PashuRaksha AI</p>
                <p className="text-[10px] text-indigo-200">Detect • Treat • Prevent</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* Language Selector */}
              <select value={selectedLang} onChange={e => setSelectedLang(e.target.value)} className="rounded bg-white/20 px-1 py-0.5 text-[10px] text-white border-0 focus:outline-none" title="Voice language">
                {LANGUAGES.map(l => <option key={l.code} value={l.code} className="text-gray-900">{l.name}</option>)}
              </select>
              <select value={animalType} onChange={e => setAnimalType(e.target.value)} className="rounded bg-white/20 px-1 py-0.5 text-[10px] text-white border-0">
                <option value="cattle" className="text-gray-900">🐄 Cattle</option>
                <option value="buffalo" className="text-gray-900">🐃 Buffalo</option>
                <option value="goat" className="text-gray-900">🐐 Goat</option>
                <option value="sheep" className="text-gray-900">🐑 Sheep</option>
              </select>
              <button onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-white/20"><X className="h-4 w-4 text-white" /></button>
            </div>
          </div>

          {/* GPS + District Bar */}
          <div className="flex items-center justify-between bg-gray-100 px-3 py-1.5 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <button onClick={captureGPS} disabled={gpsLoading} className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition ${gpsLocation ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600 hover:bg-indigo-100 hover:text-indigo-700'}`}>
                <Navigation className={`h-3 w-3 ${gpsLoading ? 'animate-spin' : ''}`} />
                {gpsLocation ? `📍 ${gpsLocation.lat.toFixed(2)}, ${gpsLocation.lng.toFixed(2)}` : gpsLoading ? 'Getting GPS...' : '📍 Capture Location'}
              </button>
            </div>
            <select value={district} onChange={e => setDistrict(e.target.value)} className="rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[10px] focus:outline-none">
              <option value="Palghar">Palghar</option>
              <option value="Thane">Thane</option>
              <option value="Nashik">Nashik</option>
              <option value="Pune">Pune</option>
              <option value="Nagpur">Nagpur</option>
              <option value="Kolhapur">Kolhapur</option>
            </select>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13px] ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'}`}>
                  {msg.image && <img src={msg.image} alt="" className="mb-2 rounded-lg max-h-28 w-auto" />}
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>

                  {/* 🔊 Read Aloud Button */}
                  {msg.role === 'ai' && msg.text.length > 20 && (
                    <button onClick={() => speakText(msg.text, msg.id)} className={`mt-1.5 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition ${speakingId === msg.id ? 'bg-indigo-100 text-indigo-700 animate-pulse' : 'bg-gray-100 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'}`}>
                      <Volume2 className="h-3 w-3" /> {speakingId === msg.id ? 'Stop' : 'Read Aloud 🔊'}
                    </button>
                  )}

                  {/* Complete Response Cards */}
                  {msg.data && msg.data.identified_disease && (
                    <div className="mt-2 space-y-2 border-t border-gray-100 pt-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          msg.data.risk_level === 'CRITICAL' ? 'bg-red-100 text-red-800' : msg.data.risk_level === 'HIGH' ? 'bg-orange-100 text-orange-800' : msg.data.risk_level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>{msg.data.diagnosis?.is_emergency ? '🚨 ' : ''}{msg.data.risk_level}</span>
                        <span className="text-[10px] text-gray-500">{Math.round((msg.data.confidence || 0) * 100)}%</span>
                      </div>

                      {/* Expandable Sections */}
                      <div className="space-y-1">
                        {msg.data.treatment?.available && (
                          <button onClick={() => setShowDetails(showDetails === msg.id + '_treatment' ? null : msg.id + '_treatment')} className="flex items-center gap-1.5 w-full text-left rounded-lg bg-green-50 px-2.5 py-1.5 text-[11px] font-medium text-green-800 hover:bg-green-100 transition">
                            <Pill className="h-3 w-3" /> First Aid & Treatment ▾
                          </button>
                        )}
                        {showDetails === msg.id + '_treatment' && msg.data.treatment && (
                          <div className="rounded-lg bg-green-50 border border-green-100 px-3 py-2 space-y-1.5">
                            {msg.data.treatment.first_aid.slice(0, 4).map((fa, i) => (
                              <div key={i} className="flex items-start gap-1.5"><CheckCircle className="h-3 w-3 shrink-0 text-green-600 mt-0.5" /><span className="text-[11px] text-gray-700">{fa}</span></div>
                            ))}
                            <p className="text-[10px] font-semibold text-green-700 mt-1">Drugs:</p>
                            {msg.data.treatment.drugs.slice(0, 3).map((drug, i) => (
                              <div key={i} className="text-[10px] text-gray-600">• <strong>{drug.name}</strong> — {drug.dosage}</div>
                            ))}
                          </div>
                        )}

                        {msg.data.treatment?.severity_timeline && (
                          <button onClick={() => setShowDetails(showDetails === msg.id + '_timeline' ? null : msg.id + '_timeline')} className="flex items-center gap-1.5 w-full text-left rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] font-medium text-amber-800 hover:bg-amber-100 transition">
                            <Clock className="h-3 w-3" /> Severity Timeline ▾
                          </button>
                        )}
                        {showDetails === msg.id + '_timeline' && msg.data.treatment?.severity_timeline && (
                          <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 space-y-1">
                            {Object.entries(msg.data.treatment.severity_timeline).map(([period, desc]) => (
                              <div key={period} className="text-[10px]"><span className="font-semibold text-amber-800">{period}:</span> <span className="text-gray-700">{desc}</span></div>
                            ))}
                          </div>
                        )}

                        {msg.data.intelligence && (
                          <button onClick={() => setShowDetails(showDetails === msg.id + '_intel' ? null : msg.id + '_intel')} className="flex items-center gap-1.5 w-full text-left rounded-lg bg-blue-50 px-2.5 py-1.5 text-[11px] font-medium text-blue-800 hover:bg-blue-100 transition">
                            <MapPin className="h-3 w-3" /> Area Intelligence ▾
                          </button>
                        )}
                        {showDetails === msg.id + '_intel' && msg.data.intelligence && (
                          <div className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 space-y-1.5 text-[10px]">
                            <div className="flex items-center gap-1"><Activity className="h-3 w-3 text-blue-600" /> <span>{msg.data.intelligence.area_cases.summary}</span></div>
                            <div className="flex items-center gap-1"><Shield className="h-3 w-3 text-blue-600" /> <span>{msg.data.intelligence.vaccination_status.message}</span></div>
                            <div className="flex items-center gap-1"><Users className="h-3 w-3 text-blue-600" /> <span>{msg.data.intelligence.herd_risk.message}</span></div>
                            <div>🌤️ {msg.data.intelligence.weather_risk.advisory}</div>
                          </div>
                        )}

                        {msg.data.action_summary && msg.data.action_summary.actions.length > 0 && (
                          <div className="rounded-lg bg-red-50 border border-red-100 px-2.5 py-2">
                            <p className="text-[10px] font-bold text-red-800 mb-1">⚡ Priority Actions ({msg.data.action_summary.urgency})</p>
                            {msg.data.action_summary.actions.slice(0, 3).map((a, i) => (
                              <div key={i} className="flex items-start gap-1 text-[10px] text-gray-700"><span className={`font-bold ${a.priority === 'EMERGENCY' ? 'text-red-600' : a.priority === 'NOW' ? 'text-orange-600' : 'text-blue-600'}`}>[{a.priority}]</span> {a.action}</div>
                            ))}
                          </div>
                        )}
                      </div>

                      {msg.data.action_summary?.auto_report_recommended && (
                        <a href="/report" className="flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-[11px] font-semibold text-white hover:bg-red-700 transition w-full">
                          <FileText className="h-3.5 w-3.5" /> File Disease Report Now
                        </a>
                      )}

                      {msg.data.diagnosis?.follow_up_questions && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {msg.data.diagnosis.follow_up_questions.slice(0, 2).map((q, i) => (
                            <button key={i} onClick={() => sendText(q)} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-indigo-700 hover:bg-indigo-100 transition">→ {q.slice(0, 30)}...</button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-white border border-gray-200 px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 2 && (
            <div className="border-t border-gray-100 bg-white px-3 py-2">
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map(p => (
                  <button key={p} onClick={() => sendText(p)} className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] text-gray-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition">{p}</button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white px-3 py-2.5">
            <div className="flex items-end gap-1.5">
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <button onClick={() => fileRef.current?.click()} disabled={loading} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-indigo-600 disabled:opacity-40 transition" title="Upload photo">
                <Camera className="h-4 w-4" />
              </button>
              <button onClick={toggleVoice} disabled={loading} className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition ${isListening ? 'border-red-300 bg-red-50 text-red-600 animate-pulse' : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-indigo-600'} disabled:opacity-40`} title={`Voice (${LANGUAGES.find(l => l.code === selectedLang)?.label})`}>
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
              <div className="flex-1 relative">
                <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={isListening ? `🎤 Listening (${LANGUAGES.find(l => l.code === selectedLang)?.label})...` : "Describe symptoms..."} rows={1} className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 pr-10 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-100" />
                <button onClick={() => sendText()} disabled={!input.trim() || loading} className="absolute right-2 bottom-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white disabled:opacity-30 hover:bg-indigo-700 transition">
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            {isListening && <p className="mt-1 text-center text-[10px] text-red-500 animate-pulse">🎤 Listening ({LANGUAGES.find(l => l.code === selectedLang)?.name})... speak now</p>}
          </div>
        </div>
      )}
    </>
  );
}
