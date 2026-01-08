import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaTwitter,
  FaGithub,
  FaDiscord,
  FaTelegramPlane,
  FaArrowRight
} from "react-icons/fa";
import SiteLogo from '../../assets/Img/hero_globe_premium-removebg-preview.png';

const CTASection = React.memo(({ sectionVariants, navigate }) => {

  const footerLinks = useMemo(() => [
    {
      title: "Platform",
      links: [
        { name: "Markets", path: "/markets" },
        { name: "Exchange", path: "/exchange" },
        { name: "Earn", path: "/earn" },
        { name: "Wallet", path: "/wallet" },
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", path: "/help" },
        { name: "API Documentation", path: "/api" },
        { name: "Fees", path: "/fees" },
        { name: "Security", path: "/security" },
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About Us", path: "/about" },
        { name: "Careers", path: "/careers" },
        { name: "Blog", path: "/blog" },
        { name: "Contact", path: "/contact" },
      ]
    }
  ], []);

  const socialLinks = useMemo(() => [
    { icon: FaTwitter, href: "#", color: "hover:text-cyan-400" },
    { icon: FaGithub, href: "#", color: "hover:text-white" },
    { icon: FaDiscord, href: "#", color: "hover:text-indigo-400" },
    { icon: FaTelegramPlane, href: "#", color: "hover:text-blue-400" },
  ], []);

  return (
    <motion.section
      className="relative pt-12 md:pt-20 pb-10 overflow-hidden font-manrope"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={sectionVariants}
    >
      {/* 1. Main CTA Card - Glass Style */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-16 md:mb-24">
        <div className="
           relative rounded-[2.5rem] p-8 md:p-16 overflow-hidden
           bg-slate-900/20 backdrop-blur-xl
           border border-white/10
           shadow-[0_0_50px_-10px_rgba(79,205,218,0.1)]
           group
        ">
          {/* Dynamic Background Sheen */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#4fcdda]/5 via-transparent to-[#233784]/10 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 text-center md:text-left">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4 text-white tracking-tight">
                Ready to start your journey?
              </h2>
              <p className="text-base md:text-lg text-slate-400 font-light">
                Join millions of users worldwide and trade with confidence on the most secure platform.
              </p>
            </div>

            <div className="flex-shrink-0 w-full md:w-auto">
              {/* Premium Button */}
              <button
                onClick={() => navigate("/auth")}
                className="
                  group relative 
                  w-full md:w-auto
                  px-10 py-4
                  rounded-full 
                  font-bold text-sm md:text-base tracking-wide text-white 
                  transition-all duration-300 
                  overflow-hidden
                  backdrop-blur-md
                  shadow-[0_0_20px_-5px_rgba(79,205,218,0.5)] 
                  shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),inset_0_-2px_0_0_rgba(79,205,218,1)]
                  border border-cyan-400/30
                  hover:scale-105
                "
              >
                {/* 1. EXACT GRADIENT BACKGROUND */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#4fcdda]/85 via-[#364abe]/85 to-[#233784]/95" />

                {/* 2. SURFACE SHEEN */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/5 to-transparent opacity-80" />

                {/* 3. CONTENT */}
                <span className="relative flex items-center justify-center gap-2 drop-shadow-sm z-10">
                  Get Started Now
                  <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Footer Links Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-6 gap-8 md:gap-12 lg:gap-8 mb-12 md:mb-16">

          {/* Brand Column */}
          <div className="md:col-span-2 lg:col-span-2 space-y-4 md:space-y-6 flex flex-col items-center text-center md:items-start md:text-left">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <img src={SiteLogo} alt="NextChain" className="w-full h-full object-contain drop-shadow-sm" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">NexChain</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400 max-w-xs mx-auto md:mx-0">
              The next generation of crypto trading. Fast, secure, and built for everyone. Experience the future of finance today.
            </p>
            <div className="flex gap-3 justify-center md:justify-start">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  className={`p-2.5 rounded-xl bg-slate-900/50 border border-white/5 hover:bg-white/10 hover:border-cyan-400/30 transition-all duration-300 ${social.color} text-slate-400`}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns - Horizontal on Mobile (3 cols) */}
          <div className="md:col-span-3 lg:col-span-3 grid grid-cols-3 gap-4 text-center md:text-left">
            {footerLinks.map((column, idx) => (
              <div key={idx} className="flex flex-col items-center md:items-start">
                <h4 className="font-bold mb-4 text-white text-sm md:text-base">{column.title}</h4>
                <ul className="space-y-3">
                  {column.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <Link
                        to={link.path}
                        className="text-xs md:text-sm text-slate-400 hover:text-[#4fcdda] transition-colors duration-200 block"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter Column */}
          <div className="md:col-span-1 lg:col-span-1 flex flex-col items-center md:items-start text-center md:text-left">
            <h4 className="font-bold mb-4 text-white text-sm md:text-base">Stay Updated</h4>
            <div className="space-y-4 max-w-xs mx-auto md:mx-0">
              <p className="text-xs text-slate-400">
                Subscribe to our newsletter for the latest market updates.
              </p>
              <div className="relative group w-full">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none bg-slate-900/40 border border-white/10 text-white placeholder-slate-500 focus:border-[#4fcdda]/50 focus:bg-slate-900/60 transition-all"
                />
                <button className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-[#4fcdda] text-white hover:bg-[#364abe] transition-colors shadow-lg shadow-cyan-500/20">
                  <FaArrowRight size={10} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-xs md:text-sm text-slate-500">
            © {new Date().getFullYear()} NexChain. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#" className="text-xs md:text-sm text-slate-500 hover:text-[#4fcdda] transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs md:text-sm text-slate-500 hover:text-[#4fcdda] transition-colors">Terms of Service</a>
            <a href="#" className="text-xs md:text-sm text-slate-500 hover:text-[#4fcdda] transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </motion.section>
  );
});

CTASection.displayName = "CTASection";

export default CTASection;