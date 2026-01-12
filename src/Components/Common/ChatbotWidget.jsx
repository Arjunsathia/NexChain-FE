import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageCircle } from "lucide-react";
import useThemeCheck from "@/hooks/useThemeCheck";

const CustomBotIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2C13.1046 2 14 2.89543 14 4V6H10V4C10 2.89543 10.8954 2 12 2Z" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3 10C3 7.79086 4.79086 6 7 6H17C19.2091 6 21 7.79086 21 10V18C21 20.2091 19.2091 22 17 22H7C4.79086 22 3 20.2091 3 18V10ZM7 12C7.55228 12 8 12.4477 8 13C8 13.5523 7.55228 14 7 14C6.44772 14 6 13.5523 6 13C6 12.4477 6.44772 12 7 12ZM17 12C17.5523 12 18 12.4477 18 13C18 13.5523 17.5523 14 17 14C16.4477 14 16 13.5523 16 13C16 12.4477 16.4477 12 17 12ZM12 17C14.2091 17 16 16.1046 16 15H8C8 16.1046 9.79086 17 12 17Z"
    />
    <path d="M22 10H24V14H22V10Z" />
    <path d="M0 10H2V14H0V10Z" />
    <path d="M12 22L12 24L8 24L10.5 22H12Z" transform="translate(4,0)" />
  </svg>
);

const RobotIcon = ({ className }) => (
  <svg
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    { }
    <circle cx="50" cy="15" r="6" />
    <rect x="48" y="15" width="4" height="15" rx="1" />
    { }
    <path d="M12 45 H18 V65 H12 C10 65 8 63 8 61 V49 C8 47 10 45 12 45 Z" />
    <path d="M82 45 H88 C90 45 92 47 92 49 V61 C92 63 90 65 88 65 H82 V45 Z" />
    { }
    <rect x="18" y="28" width="64" height="50" rx="12" />
    { }
    <circle cx="38" cy="48" r="6" fill="white" />
    { }
    <circle
      cx="38"
      cy="48"
      r="6"
      fill="#000000"
      fillOpacity="0"
      className="text-current opacity-0"
    />{" "}
    { }
    { }
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="
       M50 10 A6 6 0 1 1 50 22 A6 6 0 0 1 50 10 Z 
       M48 22 H52 V28 H48 V22 Z
       M18 40 C18 33.37 23.37 28 30 28 H70 C76.63 28 82 33.37 82 40 V66 C82 72.63 76.63 78 70 78 H50 L35 90 V78 H30 C23.37 78 18 72.63 18 66 V40 Z
       M12 48 H18 V62 H12 C10.9 62 10 61.1 10 60 V50 C10 48.9 10.9 48 12 48 Z
       M82 48 H88 C89.1 48 90 48.9 90 50 V60 C90 61.1 89.1 62 88 62 H82 V48 Z
       
       M38 54 A6 6 0 1 0 38 42 A6 6 0 0 0 38 54 Z
       M62 54 A6 6 0 1 0 62 42 A6 6 0 0 0 62 54 Z
       M35 62 Q50 72 65 62 L65 65 Q50 75 35 65 Z 
       "
    />
  </svg>
);

const SmartBotIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    { }
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 4C12.55 4 13 4.45 13 5V6H18C20.21 6 22 7.79 22 10V17C22 19.21 20.21 21 18 21H14L10 24V21H6C3.79 21 2 19.21 2 17V10C2 7.79 3.79 6 6 6H11V5C11 4.45 11.45 4 12 4ZM8.5 13C9.33 13 10 12.33 10 11.5C10 10.67 9.33 10 8.5 10C7.67 10 7 10.67 7 11.5C7 12.33 7.67 13 8.5 13ZM15.5 13C16.33 13 17 12.33 17 11.5C17 10.67 16.33 10 15.5 10C14.67 10 14 10.67 14 11.5C14 12.33 14.67 13 15.5 13ZM8 15.5C8 15.5 10 18.5 12 18.5C14 18.5 16 15.5 16 15.5H8Z"
    />
    { }
    <circle cx="12" cy="2.5" r="1.5" />
    { }
    <path d="M22 11H23C23.55 11 24 11.45 24 12V15C24 15.55 23.55 16 23 16H22V11Z" />
    <path d="M2 11H1C0.45 11 0 11.45 0 12V15C0 15.55 0.45 16 1 16H2V11Z" />
  </svg>
);

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your NexChain Learning Assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const isLight = useThemeCheck();

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputValue("");

    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: "Thanks for your question! I'm here to help you learn about cryptocurrency trading. What would you like to know?",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Cool Modern Chatbot Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50
          w-12 h-12 sm:w-14 sm:h-14 rounded-full
          bg-gradient-to-tr from-blue-600 to-cyan-400
          text-white
          flex items-center justify-center
          shadow-lg shadow-blue-500/30
          ring-2 ring-white/20 ring-offset-2 ring-offset-transparent
          backdrop-blur-sm
          ${isOpen ? "scale-0" : "scale-100"}
        `}
        whileHover={{
          y: -5,
          scale: 1.05,
          boxShadow:
            "0 20px 25px -5px rgba(59, 130, 246, 0.5), 0 8px 10px -6px rgba(59, 130, 246, 0.5)", // Stronger blue glow
        }}
        whileTap={{ scale: 0.95, y: 0 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: isOpen ? 0 : 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <motion.div
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          whileHover={{ rotate: 15, scale: 1.1 }}
        >
          <SmartBotIcon className="w-7 h-7 drop-shadow-md" />
        </motion.div>
      </motion.button>

      { }
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`
              fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50
              w-[calc(100vw-32px)] sm:w-[400px] max-w-[400px]
              h-[calc(100%-100px)] sm:h-[600px] max-h-[80vh]
              rounded-2xl shadow-2xl
              ${isLight
                ? "bg-white border border-gray-200"
                : "bg-gray-900 border border-gray-700"
              }
              flex flex-col overflow-hidden
            `}
          >
            { }
            <div className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <SmartBotIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">
                    Learning Assistant
                  </h3>
                  <p className="text-white/80 text-xs">Always here to help</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            { }
            <div
              className={`
              flex-1 overflow-y-auto p-4 space-y-4
              ${isLight ? "bg-gray-50" : "bg-gray-800/50"}
            `}
            >
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`
                      max-w-[80%] rounded-2xl px-4 py-2.5
                      ${message.sender === "user"
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                        : isLight
                          ? "bg-white border border-gray-200 text-gray-900"
                          : "bg-gray-700 border border-gray-600 text-white"
                      }
                    `}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${message.sender === "user" ? "text-white/70" : isLight ? "text-gray-500" : "text-gray-400"}`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            { }
            <div
              className={`
              p-4 border-t
              ${isLight ? "bg-white border-gray-200" : "bg-gray-900 border-gray-700"}
            `}
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className={`
                    flex-1 px-4 py-2.5 rounded-xl
                    outline-none focus:ring-2 focus:ring-cyan-500/50
                    transition-all
                    ${isLight
                      ? "bg-gray-100 text-gray-900 placeholder-gray-500"
                      : "bg-gray-800 text-white placeholder-gray-400 border border-gray-700"
                    }
                  `}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className={`
                    w-10 h-10 rounded-xl
                    bg-gradient-to-r from-cyan-500 to-blue-600
                    flex items-center justify-center
                    transition-all
                    ${inputValue.trim()
                      ? "opacity-100 hover:shadow-lg hover:shadow-cyan-500/50"
                      : "opacity-50 cursor-not-allowed"
                    }
                  `}
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotWidget;
