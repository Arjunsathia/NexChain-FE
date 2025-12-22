import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaRocket, FaBars, FaTimes } from "react-icons/fa";

const LandingHeader = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50); 
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToContact = () => {
     document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ 
          y: scrolled ? -100 : 0, 
          opacity: scrolled ? 0 : 1 
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className={`fixed top-0 left-0 right-0 z-50 py-6 transition-all duration-300 pointer-events-none ${scrolled ? '' : 'pointer-events-auto'}`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-3 cursor-pointer group pointer-events-auto"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform duration-300">
              <FaRocket className="text-white text-sm" />
            </div>
            <span className="text-xl font-bold text-gray-200 font-outfit tracking-tight flex items-baseline">
              Ne
              <span className="text-3xl mx-px font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                X
              </span>
              Chain
            </span>
          </div>

          {}
          <div className="hidden md:block pointer-events-auto">
            <button
              onClick={scrollToContact}
              className="px-5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold transition-all duration-300 hover:scale-105 hover:border-cyan-500/30 active:scale-95 flex items-center gap-2 group"
            >
              Contact
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 group-hover:shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all" />
            </button>
          </div>

          {}
          <button 
            className="md:hidden text-gray-300 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(true)}
          >
            <FaBars className="text-xl" />
          </button>
        </div>
      </motion.header>

      {}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-[#0B0E14] md:hidden flex flex-col"
          >
            <div className="p-6 flex items-center justify-between border-b border-white/10">
              <span className="text-xl font-bold text-white font-outfit">Menu</span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>

            <div className="flex-1 flex flex-col p-8 gap-6 justify-center items-center">
              <button
                onClick={() => {
                  scrollToContact();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-lg shadow-lg shadow-cyan-900/20"
              >
                Contact Us
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LandingHeader;
