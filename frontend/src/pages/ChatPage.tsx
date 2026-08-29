import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, CheckCircle, FileText } from 'lucide-react';
import apiClient from '../api/client';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  data?: AiResponse;
  timestamp: Date;
}

interface AiResponse {
  response: string;
  probable_disease: string | null;
  confidence: number;
  risk_level: string;
  immediate_actions: string[];
  should_report: boolean;
  detected_symptoms: string[];
  differential_diagnosis?: { disease: string; confidence: number }[];
}

const QUICK_PROMPTS = [
  'My cow has fever and blisters in mouth',
  'Goat has diarrhea and nasal discharge',
  'Buffalo has lumps on skin',
  'Cow udder is swollen and milk has clots',
  'Animal suddenly died with blood',
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'ai',
      text: "Hello! I'm PashuRaksha AI Assistant. Describe your animal's symptoms and I'll help identify possible diseases and recommend actions. You can type in English or Hindi.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [animalType, setAnimalType] = useState('cattle');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: msg,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiClient.post('/chat/advisory', {
        message: msg,
        animal_type: animalType,
      });
      const data: AiResponse = res.data;

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: data.response,
        data,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          text: 'Sorry, I could not process your request. Please try again or contact your local veterinarian.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
              <Bot className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">AI Disease Advisory</h2>
              <p className="text-xs text-gray-500">Describe symptoms to get instant guidance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-600">Animal:</label>
            <select
              value={animalType}
              onChange={e => setAnimalType(e.target.value)}
              className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="cattle">Cattle</option>
              <option value="buffalo">Buffalo</option>
              <option value="goat">Goat</option>
              <option value="sheep">Sheep</option>
              <option value="pig">Pig</option>
              <option value="poultry">Poultry</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] ${msg.role === 'user' ? 'order-2' : ''}`}>
              <div className="flex items-start gap-2">
                {msg.role === 'ai' && (
                  <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                    <Bot className="h-4 w-4 text-indigo-600" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>

                  {/* AI Response Card */}
                  {msg.data && msg.data.probable_disease && (
                    <div className="mt-3 space-y-3 border-t border-gray-100 pt-3">
                      {/* Disease + Confidence */}
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                          msg.data.risk_level === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                          msg.data.risk_level === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                          msg.data.risk_level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {msg.data.risk_level}
                        </span>
                        <span className="text-xs text-gray-500">
                          {Math.round(msg.data.confidence * 100)}% confidence
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="space-y-1">
                        {msg.data.immediate_actions.slice(0, 4).map((action, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <CheckCircle className="mt-0.5 h-3 w-3 shrink-0 text-green-500" />
                            <span className="text-xs text-gray-700">{action}</span>
                          </div>
                        ))}
                      </div>

                      {/* Differential */}
                      {msg.data.differential_diagnosis && msg.data.differential_diagnosis.length > 0 && (
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Also consider: </span>
                          {msg.data.differential_diagnosis.map(d => `${d.disease} (${Math.round(d.confidence * 100)}%)`).join(', ')}
                        </div>
                      )}

                      {/* Report Button */}
                      {msg.data.should_report && (
                        <a
                          href="/report"
                          className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
                        >
                          <FileText className="h-3 w-3" />
                          File Disease Report
                        </a>
                      )}
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100">
                <Bot className="h-4 w-4 text-indigo-600 animate-pulse" />
              </div>
              <div className="rounded-2xl bg-white border border-gray-200 px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="border-t border-gray-200 bg-white px-6 py-3">
          <p className="mb-2 text-xs font-medium text-gray-500">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map(prompt => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your animal's symptoms..."
              rows={1}
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
