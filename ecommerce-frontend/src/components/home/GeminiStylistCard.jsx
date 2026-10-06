import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, Bot, User, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import api from '../../utils/api.js';

export default function GeminiStylistCard() {
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'ai',
      text: 'Namaste! 🙏 I am your Rigamart AI Assistant. Ask me about sizing recommendations, fabric care, outfit coordination, or order delivery timelines!'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatScrollRef = useRef(null);

  const quickPrompts = [
    'Will size M fit a 40-inch chest?',
    'Suggest shoes for Khaki chinos',
    'How do doorstep returns work?'
  ];

  useEffect(() => {
    chatScrollRef.current?.scrollTo({
      top: chatScrollRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [messages, isThinking]);

  const sendPrompt = async (question) => {
    if (!question || !question.trim()) return;
    const query = question.trim();
    setInputText('');

    const userMsg = { id: `u-${Date.now()}`, sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const res = await api.post('/ai/chat', {
        message: query,
        context: 'stylist',
        chatHistory: messages.slice(-6) // send last 6 messages for context
      });

      if (res?.data?.success && res.data.data?.reply) {
        setMessages((prev) => [
          ...prev,
          { id: `ai-${Date.now()}`, sender: 'ai', text: res.data.data.reply }
        ]);
        return;
      }
    } catch {
      // silent — fall through to local heuristic below
    } finally {
      setIsThinking(false);
    }

    // Local heuristic fallback (used if backend is down)
    const lower = query.toLowerCase();
    let aiReply = "Based on your inquiry, our stylists recommend pairing with crisp white sneakers and a neutral leather belt. For sizing, our measurements follow standard Indian tailored cuts with a 94% fit confidence score.";

    if (lower.includes('chest') || lower.includes('size m')) {
      aiReply = "✅ Yes! Our Size M is tailored for a 38-40 inch chest with a 2-inch comfort ease. If you prefer a relaxed or layered look over a tee, Size L will give you that breezy Mediterranean aesthetic.";
    } else if (lower.includes('shoes') || lower.includes('chinos') || lower.includes('khaki')) {
      aiReply = "👟 For Khaki chinos, our Minimalist White Court Sneakers create the cleanest smart-casual contrast. For evening ethnic wear, tan Peshawari sandals or loafers work best!";
    } else if (lower.includes('return') || lower.includes('doorstep')) {
      aiReply = "🛡️ Rigamart offers a 7-day zero-friction doorstep return policy. Simply go to 'My Orders', tap 'Request Return', and our courier associate collects the sealed package from your home with instant escrow refund!";
    }

    setMessages((prev) => [
      ...prev,
      { id: `ai-${Date.now()}`, sender: 'ai', text: aiReply }
    ]);
  };

  return (
    <div className="bg-surface border border-line rounded-3xl p-5 sm:p-6 shadow-card flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center font-bold text-sm shadow-subtle shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-ink truncate">
              Rigamart AI Assistant
            </h3>
            <p className="text-[10px] sm:text-[11px] text-muted truncate">
              Smart shopping advisor, fit guide &amp; order assistant
            </p>
          </div>
        </div>

        <span className="text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-full shrink-0 tracking-wider">
          ● AI Live
        </span>
      </div>

      {/* Chat Messages Window */}
      <div
        ref={chatScrollRef}
        className="h-44 sm:h-48 overflow-y-auto space-y-3 p-3 bg-canvas rounded-2xl border border-line text-xs"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2 ${
              m.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.sender === 'ai' && (
              <div className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center text-[10px] shrink-0 font-bold mt-0.5">
                AI
              </div>
            )}
            <div
              className={`p-2.5 rounded-2xl max-w-[85%] leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-brand text-white rounded-tr-none'
                  : 'bg-surface text-ink border border-line rounded-tl-none shadow-2xs'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center gap-2 text-muted text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-brand" />
            <span>Rigamart AI is typing...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-1.5">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => sendPrompt(prompt)}
            className="text-[10px] px-2.5 py-1 rounded-lg bg-canvas hover:bg-brand-soft border border-line hover:border-brand/40 text-ink transition-colors cursor-pointer"
          >
            &quot;{prompt}&quot;
          </button>
        ))}
      </div>

      {/* Input Row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendPrompt(inputText);
        }}
        className="flex items-center gap-2 pt-1"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask Rigamart AI about size, style, or orders..."
          className="flex-1 bg-canvas border border-line rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isThinking}
          className="p-2 bg-brand hover:bg-brand-dark text-white rounded-xl shadow-subtle disabled:opacity-40 transition-colors cursor-pointer"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
