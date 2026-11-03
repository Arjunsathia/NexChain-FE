import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, RotateCcw, Sparkles, X } from "lucide-react";
import api from "@/api/axiosConfig";
import { cn } from "@/utils/utils";

const WELCOME = "Hi! I'm the NexChain assistant. Ask me anything about crypto, charts or how trading works here.";
const SUGGESTIONS = ["How do I read a candlestick chart?", "What's the difference between a limit and a market order?", "What does market cap tell me?"];
// Long enough for the server to fall back to a second model when one is busy
const TIMEOUT_MS = 45_000;
const MAX_LENGTH = 500; // the API rejects longer questions

let nextId = 0;
const message = (text, sender, extra) => ({ id: ++nextId, text, sender, timestamp: new Date(), ...extra });
const fmtTime = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" });

// Same offset from the corner on every page, clear of the phone's home indicator
const CORNER = {
  right: "max(1rem, calc(env(safe-area-inset-right) + 1rem))",
  bottom: "max(1rem, calc(env(safe-area-inset-bottom) + 1rem))",
};

const Bold = ({ text }) =>
  text.split(/(\*\*.*?\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong> : part,
  );

/** The assistant writes light markdown: **bold** and "* " / "- " bullet lines */
const RichText = ({ text }) =>
  text.split("\n").map((line, i, lines) => {
    const bullet = /^\s*[*-]\s+(.*)$/.exec(line);
    if (bullet) {
      return (
        <span key={i} className="flex gap-2 pl-1">
          <span className="text-fg-subtle" aria-hidden="true">•</span>
          <span className="min-w-0 flex-1"><Bold text={bullet[1]} /></span>
        </span>
      );
    }
    return (
      <React.Fragment key={i}>
        <Bold text={line} />
        {i < lines.length - 1 && !/^\s*[*-]\s+/.test(lines[i + 1]) && "\n"}
      </React.Fragment>
    );
  });

const Bubble = ({ msg }) => {
  const mine = msg.sender === "user";
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap",
          mine
            ? "rounded-br-md bg-brand text-brand-fg"
            : msg.isError
              ? "rounded-bl-md bg-down-soft text-down"
              : "rounded-bl-md border border-line bg-surface text-fg",
        )}
      >
        <RichText text={msg.text} />
        {msg.disclaimer && <p className="mt-2 border-t border-line pt-1.5 text-[11px] leading-snug text-fg-subtle italic">{msg.disclaimer}</p>}
        <p className={cn("mt-1 text-right text-[10px]", mine ? "text-brand-fg/70" : "text-fg-subtle")}>{fmtTime.format(msg.timestamp)}</p>
      </div>
    </motion.div>
  );
};

/** Floating "Ask AI" button and the learning-assistant chat panel */
const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => [message(WELCOME, "bot", { greeting: true })]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  // null until checked; false when the server has no AI key
  const [available, setAvailable] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const launcherRef = useRef(null);

  const closeAssistant = () => {
    setIsOpen(false);
    // The launcher remounts as the panel closes; focus it once it's back
    setTimeout(() => launcherRef.current?.focus({ preventScroll: true }), 0);
  };

  // Ask once, the first time the panel opens
  useEffect(() => {
    if (!isOpen || available !== null) return;
    api
      .get("/chat/status")
      .then((res) => setAvailable(res.data?.available !== false))
      .catch(() => setAvailable(true)); // unknown: let a real question find out
  }, [isOpen, available]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const timer = setTimeout(() => inputRef.current?.focus(), 200);
    const escape = (event) => event.key === "Escape" && closeAssistant();
    window.addEventListener("keydown", escape);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", escape);
    };
  }, [isOpen]);

  const send = async (text) => {
    const userText = (text ?? inputValue).trim();
    if (!userText || isTyping) return;

    // Real turns only: the greeting and error bubbles would confuse the model
    const history = messages
      .filter((msg) => !msg.greeting && !msg.isError)
      .slice(-6)
      .map((msg) => ({ role: msg.sender === "user" ? "user" : "model", content: msg.text }));
    setMessages((prev) => [...prev, message(userText, "user")]);
    setInputValue("");
    setIsTyping(true);

    try {
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), TIMEOUT_MS));
      const response = await Promise.race([api.post("/chat", { message: userText, history }), timeout]);
      const { response: botText, disclaimer } = response.data;
      setMessages((prev) => [...prev, message(botText, "bot", { disclaimer })]);
    } catch (error) {
      if (error.response?.data?.code === "AI_NOT_CONFIGURED") setAvailable(false);
      const text =
        error.message === "Request timed out"
          ? "That took too long. Please try asking again."
          : error.response?.data?.message || "I can't reach the assistant right now. Please try again in a moment.";
      setMessages((prev) => [...prev, message(text, "bot", { isError: true })]);
    } finally {
      setIsTyping(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const reset = () => setMessages([message(WELCOME, "bot", { greeting: true })]);
  const fresh = messages.length === 1;
  const offline = available === false;

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="launcher"
            ref={launcherRef}
            type="button"
            aria-label="Open the NexChain assistant"
            aria-expanded={false}
            onClick={() => setIsOpen(true)}
            style={CORNER}
            className="group fixed z-[1001] flex h-12 min-w-12 items-center justify-center rounded-full bg-brand px-3.5 text-brand-fg shadow-pop ring-1 ring-black/5 transition-shadow hover:shadow-[0_12px_32px_-6px_color-mix(in_oklab,var(--brand)_55%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 26 }}
          >
            <Sparkles size={20} className="shrink-0" />
            {/* Icon only at rest, so it covers less of the page; the label slides out on hover or focus */}
            <span className="max-w-0 overflow-hidden text-sm font-semibold whitespace-nowrap opacity-0 transition-all duration-200 group-hover:ml-2 group-hover:max-w-20 group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:max-w-20 group-focus-visible:opacity-100">
              Ask AI
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Phones get a dimmed backdrop behind the bottom sheet */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeAssistant}
              className="fixed inset-0 z-[1000] bg-black/45 sm:hidden"
            />

            <motion.div
              key="panel"
              role="dialog"
              aria-label="NexChain assistant"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              style={{ "--chat-right": CORNER.right, "--chat-bottom": CORNER.bottom }}
              className={cn(
                "fixed z-[1001] flex origin-bottom-right flex-col overflow-hidden border border-line bg-surface shadow-pop",
                // Phone: bottom sheet. Larger: card in the corner that never reaches under the top bar
                "inset-x-0 bottom-0 h-[85dvh] rounded-t-2xl pb-[env(safe-area-inset-bottom)]",
                "sm:inset-x-auto sm:right-[var(--chat-right)] sm:bottom-[var(--chat-bottom)] sm:h-[min(620px,calc(100dvh-var(--topbar-h)-2.5rem))] sm:w-[400px] sm:rounded-2xl sm:pb-0",
              )}
            >
              <header className="flex items-center gap-3 border-b border-line px-4 py-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                  <Sparkles size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-semibold text-fg">NexChain assistant</h2>
                  <p className="flex items-center gap-1.5 text-[11px] text-fg-subtle">
                    <span className={cn("size-1.5 rounded-full", offline ? "bg-fg-subtle" : "bg-up")} aria-hidden="true" />
                    {offline ? "Offline" : "Learning help · not financial advice"}
                  </p>
                </div>
                {!fresh && (
                  <button
                    type="button"
                    onClick={reset}
                    aria-label="Start a new conversation"
                    title="New conversation"
                    className="grid size-8 place-items-center rounded-lg text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg"
                  >
                    <RotateCcw size={15} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeAssistant}
                  aria-label="Close assistant"
                  className="grid size-8 place-items-center rounded-lg text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg"
                >
                  <X size={17} />
                </button>
              </header>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-canvas/60 px-4 py-4" data-lenis-prevent>
                {messages.map((msg) => (
                  <Bubble key={msg.id} msg={msg} />
                ))}

                {offline && (
                  <div className="rounded-xl border border-line bg-surface px-3.5 py-3 text-[13px] leading-relaxed text-fg-muted" role="status">
                    <p className="font-semibold text-fg">The assistant is offline</p>
                    <p className="mt-0.5">
                      It hasn&apos;t been set up on this server yet. In the meantime, the Learn section covers charts, orders and
                      market basics.
                    </p>
                  </div>
                )}

                {fresh && !offline && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-medium text-fg-subtle">Try asking</p>
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => send(s)}
                        className="block w-full rounded-xl border border-line bg-surface px-3 py-2 text-left text-[13px] text-fg transition-colors hover:border-brand/50 hover:bg-brand-soft"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {isTyping && (
                  <div className="flex justify-start" role="status" aria-label="Assistant is typing">
                    <div className="flex gap-1 rounded-2xl rounded-bl-md border border-line bg-surface px-3.5 py-3">
                      {[0, 150, 300].map((d) => (
                        <span key={d} className="size-1.5 animate-bounce rounded-full bg-fg-subtle" style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-line p-3">
                <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-2 py-1 pr-1 pl-3 transition-colors focus-within:border-brand">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={onKeyDown}
                    aria-label="Message the assistant"
                    placeholder={offline ? "The assistant is offline" : "Ask about crypto or trading…"}
                    disabled={isTyping || offline}
                    maxLength={MAX_LENGTH}
                    // The wrapper shows focus with its border; the global input outline would double it
                    style={{ outline: "none" }}
                    className="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-fg outline-none placeholder:text-fg-subtle disabled:opacity-60"
                  />
                  <button
                    type="button"
                    aria-label="Send message"
                    onClick={() => send()}
                    disabled={!inputValue.trim() || isTyping || offline}
                    className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand text-brand-fg transition-opacity disabled:opacity-40"
                  >
                    <ArrowUp size={16} />
                  </button>
                </div>
                {inputValue.length > MAX_LENGTH - 100 && (
                  <p className={cn("tabular mt-1 text-right text-[11px]", inputValue.length >= MAX_LENGTH ? "text-down" : "text-fg-subtle")}>
                    {inputValue.length}/{MAX_LENGTH}
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotWidget;
