import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Camera, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import apiClient from '../api/client';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  image?: string; // base64 preview
  data?: AiResponse;
  imageResult?: ImageResult;
  timestamp: Date;
}

interface AiResponse {
  response: string;
  probable_disease: string | null;
  confidence: number;
  risk_level: string;
  immediate_actions: string[];
  should_report: boolean;
  is_emergency: boolean;
  detected_symptoms: string[];
  differential_diagnosis?: { disease: string; confidence: number }[];
  follow_up_questions?: string[];
}

interface ImageResult {
  prediction: string;
  confidence: number;
  description: string;
  recommendations: string[];
  all_predictions?: { disease: string; confidence: number }[];
}

const QUICK_PROMPTS = [
  '🐄 Cow has fever and blisters',
  '🐐 Goat diarrhea and nasal discharge',
  '🐃 Buffalo skin lumps and nodules',
  '🐄 Cow udder swollen, milk clots',
  '💀 Animal died suddenly with blood',
];

export default function AiFloatingChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'ai',
      text: "Namaste! 🙏 I'm PashuRaksha AI. I can help you:\n\n• Describe symptoms → I'll identify the disease\n• Upload a photo → I'll analyze it\n• Get treatment advice and next steps\n\nDescribe what you see, or upload a photo of your animal.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [animalType, setAnimalType] = useState('cattle');
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (msg: ChatMessage) => setMessages(prev => [...prev, msg]);

  const sendText = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    addMessage({ id: Date.now().toString(), role: 'user', text: msg, timestamp: new Date() });
    setInput('');
    setLoading(true);

    try {
      const res = await apiClient.post('/chat/advisory', { message: msg, animal_type: animalType });
      const data: AiResponse = res.data;
      addMessage({ id: (Date.now() + 1).toString(), role: 'ai', text: data.response || '', data, timestamp: new Date() });
    } catch {
      addMessage({ id: (Date.now() + 1).toString(), role: 'ai', text: 'Sorry, could not reach AI service. Please try again.', timestamp: new Date() });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || loading) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = () => {
      addMessage({ id: Date.now().toString(), role: 'user', text: '📷 Uploaded image for analysis', image: reader.result as string, timestamp: new Date() });
    };
    reader.readAsDataURL(file);

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post('/detect/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const result: ImageResult = res.data;

      const responseText = result.prediction === 'Healthy'
        ? `✅ **Analysis: Healthy**\nNo visible disease signs detected in this image. The animal appears healthy.\n\nIf you still have concerns, describe the symptoms you're observing.`
        : `⚠️ **Analysis: ${result.prediction}** (${Math.round(result.confidence * 100)}% confidence)\n\n${result.description}\n\n**Recommendations:**\n${result.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}`;

      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: responseText,
        imageResult: result,
        timestamp: new Date(),
      });
    } catch {
      addMessage({ id: (Date.now() + 1).toString(), role: 'ai', text: 'Could not analyze the image. Please try again with a clearer photo.', timestamp: new Date() });
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendText(); }
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all"
          title="AI Disease Advisory"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold">AI</span>
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col w-[380px] h-[600px] rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between bg-indigo-600 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">PashuRaksha AI</p>
                <p className="text-[10px] text-indigo-200">Disease Detection • Advisory • Cure</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={animalType}
                onChange={e => setAnimalType(e.target.value)}
                className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] text-white border-0 focus:outline-none"
              >
                <option value="cattle" className="text-gray-900">Cattle</option>
                <option value="buffalo" className="text-gray-900">Buffalo</option>
                <option value="goat" className="text-gray-900">Goat</option>
                <option value="sheep" className="text-gray-900">Sheep</option>
                <option value="pig" className="text-gray-900">Pig</option>
              </select>
              <button onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-white/20 transition">
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-md'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm'
                }`}>
                  {/* Image preview */}
                  {msg.image && (
                    <img src={msg.image} alt="uploaded" className="mb-2 rounded-lg max-h-32 w-auto" />
                  )}

                  {/* Text */}
                  <p className="whitespace-pre-wrap text-[13px] leading-relaxed">{msg.text}</p>

                  {/* AI Disease Card */}
                  {msg.data && msg.data.probable_disease && (
                    <div className="mt-2.5 space-y-2 border-t border-gray-100 pt-2.5">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          msg.data.risk_level === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                          msg.data.risk_level === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                          msg.data.risk_level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {msg.data.is_emergency ? '🚨 ' : ''}{msg.data.risk_level}
                        </span>
                        <span className="text-[10px] text-gray-500">{Math.round(msg.data.confidence * 100)}%</span>
                      </div>

                      {/* Actions */}
                      <div className="space-y-1">
                        {msg.data.immediate_actions.slice(0, 3).map((action, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <CheckCircle className="mt-0.5 h-3 w-3 shrink-0 text-green-500" />
                            <span className="text-[11px] text-gray-700">{action}</span>
                          </div>
                        ))}
                      </div>

                      {/* Report button */}
                      {msg.data.should_report && (
                        <a href="/report" className="flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-700 hover:bg-red-100 transition w-fit">
                          <FileText className="h-3 w-3" /> File Report
                        </a>
                      )}

                      {/* Follow-up questions */}
                      {msg.data.follow_up_questions && msg.data.follow_up_questions.length > 0 && (
                        <div className="mt-1">
                          <p className="text-[10px] text-gray-400 mb-1">Follow-up:</p>
                          {msg.data.follow_up_questions.slice(0, 2).map((q, i) => (
                            <button key={i} onClick={() => sendText(q)} className="block text-left text-[11px] text-indigo-600 hover:underline mb-0.5">
                              → {q}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Image Detection Card */}
                  {msg.imageResult && msg.imageResult.prediction !== 'Healthy' && (
                    <div className="mt-2.5 border-t border-gray-100 pt-2.5">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-xs font-semibold text-gray-900">{msg.imageResult.prediction}</span>
                        <span className="text-[10px] text-gray-500">{Math.round(msg.imageResult.confidence * 100)}%</span>
                      </div>
                      {msg.imageResult.all_predictions && msg.imageResult.all_predictions.length > 1 && (
                        <div className="flex gap-1 flex-wrap mt-1">
                          {msg.imageResult.all_predictions.slice(1, 3).map((p, i) => (
                            <span key={i} className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] text-gray-600">
                              {p.disease} {Math.round(p.confidence * 100)}%
                            </span>
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
                <div className="rounded-2xl rounded-bl-md bg-white border border-gray-200 px-4 py-3 shadow-sm">
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

          {/* Quick Prompts (only when few messages) */}
          {messages.length <= 2 && (
            <div className="border-t border-gray-100 bg-white px-3 py-2">
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map(p => (
                  <button key={p} onClick={() => sendText(p)} className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] text-gray-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition">
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white px-3 py-2.5">
            <div className="flex items-end gap-2">
              {/* Image upload */}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={loading}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-indigo-600 disabled:opacity-40 transition"
                title="Upload animal photo"
              >
                <Camera className="h-4 w-4" />
              </button>

              {/* Text input */}
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe symptoms or ask..."
                  rows={1}
                  className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 pr-10 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-100"
                />
                <button
                  onClick={() => sendText()}
                  disabled={!input.trim() || loading}
                  className="absolute right-2 bottom-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white disabled:opacity-30 hover:bg-indigo-700 transition"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
