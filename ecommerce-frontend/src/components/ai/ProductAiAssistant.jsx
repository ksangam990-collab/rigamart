import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Send,
  MessageSquare,
  User,
  RotateCcw,
  Minus,
  HelpCircle,
  Tag,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
  Loader2
} from 'lucide-react';
import api from '../../utils/api.js';

export default function ProductAiAssistant({ product, onAddToCart, onBuyNow }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [hasUnreadNotification, setHasUnreadNotification] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize welcome message and load suggested questions when product is present
  useEffect(() => {
    if (!product?._id) return;

    setMessages([
      {
        id: 'welcome_msg',
        sender: 'ai',
        text: `👋 Hi! I'm **Rigamart Product Concierge** for the **${product.name}**.\n\n` +
          `Ask me anything about **sizing & fit**, **materials**, **warranty**, or **coupon discounts**!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    // Fetch context-aware suggested questions
    api
      .get('/ai/suggested-questions', { params: { productId: product._id } })
      .then((res) => {
        if (res.data?.success && res.data.data?.questions) {
          setSuggestedQuestions(res.data.data.questions);
        }
      })
      .catch(() => {
        // Sensible fallback chips
        setSuggestedQuestions([
          '📏 What size should I pick?',
          '🧵 What material is this made of?',
          '💰 Any coupon code for this?',
          '🛡️ What is the 7-day return policy?'
        ]);
      });
  }, [product?._id]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setHasUnreadNotification(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query || isThinking) return;

    const userMessage = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsThinking(true);

    try {
      const historyPayload = messages.map((m) => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await api.post('/ai/ask-product', {
        productId: product._id,
        question: query,
        chatHistory: historyPayload
      });

      const answer = res.data?.data?.answer || "I'm sorry, I couldn't retrieve the details for that. Feel free to ask about sizing, materials, or delivery!";

      const aiMessage = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const fallbackMsg = {
        id: 'ai_err_' + Date.now(),
        sender: 'ai',
        text: `⚠️ I had trouble connecting to the AI service. Rigamart offers a **7-day return guarantee** and standard brand warranty on this ${product.name}!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome_reset',
        sender: 'ai',
        text: `Chat cleared! What else would you like to know about **${product.name}**?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Helper to format AI markdown text into styled React elements
  const renderFormattedText = (rawText) => {
    const lines = rawText.split('\n');
    return lines.map((line, lIdx) => {
      // Bullet point line
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
      const cleanLine = isBullet ? line.replace(/^[•\-]\s*/, '') : line;

      // Parse bold **text** and code `code`
      const parts = cleanLine.split(/(\*\*.*?\*\*|`.*?`)/g);

      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-bold text-ink">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code
              key={pIdx}
              className="bg-canvas border border-line text-brand px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={lIdx} className="flex items-start gap-1.5 my-1">
            <span className="text-brand font-bold text-xs shrink-0 mt-0.5">•</span>
            <div className="flex-1 leading-relaxed">{formattedLine}</div>
          </div>
        );
      }

      if (!cleanLine.trim()) {
        return <div key={lIdx} className="h-2" />;
      }

      return (
        <p key={lIdx} className="leading-relaxed my-0.5">
          {formattedLine}
        </p>
      );
    });
  };

  if (!product) return null;

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end">
        {/* Subtle pulsing badge notification when unopened */}
        <AnimatePresence>
          {!isOpen && hasUnreadNotification && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              onClick={() => setIsOpen(true)}
              className="mb-2 bg-surface/95 backdrop-blur-md border border-line shadow-lg rounded-2xl px-3.5 py-2 text-xs text-ink flex items-center gap-2 cursor-pointer hover:border-brand transition-all group"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
              </span>
              <span className="font-semibold group-hover:text-brand transition-colors">
                Ask AI about sizing & offers
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setHasUnreadNotification(false);
                }}
                className="text-muted hover:text-ink p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Pill Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all duration-300 ${
            isOpen
              ? 'bg-ink text-surface hover:opacity-90'
              : 'bg-brand hover:bg-brand-dark text-white ring-2 ring-brand/20 shadow-brand/20'
          }`}
          aria-label={isOpen ? 'Close Assistant' : 'Ask about this product'}
        >
          {isOpen ? (
            <>
              <X className="w-4 h-4" />
              <span className="text-xs font-bold hidden sm:inline">Close</span>
            </>
          ) : (
            <>
              <div className="relative">
                <Sparkles className="w-4 h-4 text-warning fill-warning/30" />
              </div>
              <span className="text-xs font-bold tracking-wide">
                Ask about this item
              </span>
            </>
          )}
        </motion.button>
      </div>

      {/* Floating Chat Modal / Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-4 sm:bottom-20 sm:right-6 z-50 w-[360px] sm:w-[410px] max-w-[calc(100vw-32px)] h-[560px] max-h-[calc(100vh-120px)] bg-surface rounded-3xl shadow-2xl border border-line flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-brand text-white p-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold tracking-tight text-white truncate">
                      Rigamart Concierge
                    </h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  </div>
                  <p className="text-[10px] text-white/80 truncate">
                    Product: {product.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleClearChat}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Clear conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Minimize"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Product Quick Snapshot Strip */}
            <div className="px-3.5 py-2 bg-canvas border-b border-line flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={
                    product.images?.[0]?.url ||
                    product.images?.[0] ||
                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'
                  }
                  alt={product.name}
                  className="w-6 h-6 rounded-md object-cover border border-line shrink-0"
                />
                <span className="font-bold text-ink truncate font-mono">
                  ₹{(product.variants?.[0]?.price || product.basePrice || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-muted">•</span>
                <span className="text-muted truncate">
                  {product.brand || 'Rigamart'}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-brand bg-brand-soft px-2 py-0.5 rounded-full border border-brand/20 shrink-0">
                7-Day Returns
              </span>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-canvas">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.18 }}
                    className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                        isUser
                          ? 'bg-ink text-surface'
                          : 'bg-brand text-white shadow-2xs'
                      }`}
                    >
                      {isUser ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed shadow-2xs ${
                        isUser
                          ? 'bg-ink text-surface rounded-tr-none'
                          : 'bg-surface text-ink border border-line rounded-tl-none'
                      }`}
                    >
                      {isUser ? (
                        <p>{msg.text}</p>
                      ) : (
                        <div className="space-y-1">{renderFormattedText(msg.text)}</div>
                      )}
                      <div
                        className={`text-[9px] mt-1 text-right ${
                          isUser ? 'text-surface/70' : 'text-muted'
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Thinking Indicator */}
              {isThinking && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2.5"
                >
                  <div className="w-7 h-7 rounded-xl bg-brand text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-surface border border-line rounded-2xl rounded-tl-none p-3 shadow-2xs flex items-center gap-2 text-xs text-muted">
                    <div className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce" />
                    </div>
                    <span className="text-[11px] font-medium text-brand">
                      Concierge is checking specifications...
                    </span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Starter Question Chips */}
            {suggestedQuestions.length > 0 && (
              <div className="px-3.5 py-2 bg-surface border-t border-line flex gap-1.5 overflow-x-auto no-scrollbar">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isThinking}
                    onClick={() => handleSendMessage(q)}
                    className="whitespace-nowrap px-2.5 py-1 bg-canvas hover:bg-brand-soft hover:text-brand border border-line hover:border-brand/30 rounded-lg text-[11px] font-medium text-muted hover:text-ink transition-colors disabled:opacity-50 shrink-0"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-surface border-t border-line flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about size, material, deals..."
                disabled={isThinking}
                className="flex-1 bg-canvas border border-line rounded-xl px-3.5 py-2.5 text-xs text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-all disabled:opacity-50"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isThinking || !inputText.trim()}
                className="p-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-xs"
                aria-label="Send message"
              >
                {isThinking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </motion.button>
            </form>

            {/* Disclaimer Footer */}
            <div className="py-1.5 px-3 bg-canvas border-t border-line text-center text-[10px] text-muted flex items-center justify-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-brand" />
              <span>Rigamart Concierge • Verified Specifications</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
