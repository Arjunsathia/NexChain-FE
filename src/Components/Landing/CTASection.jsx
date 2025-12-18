import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FaTwitter, 
  FaGithub, 
  FaDiscord, 
  FaTelegramPlane, 
  FaArrowRight,
  FaEnvelope,
  FaMapMarkerAlt
} from "react-icons/fa";

const CTASection = React.memo(({ TC, sectionVariants, navigate }) => {
  
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
    { icon: FaTwitter, href: "#", color: "hover:text-blue-400" },
    { icon: FaGithub, href: "#", color: "hover:text-white" },
    { icon: FaDiscord, href: "#", color: "hover:text-indigo-400" },
    { icon: FaTelegramPlane, href: "#", color: "hover:text-sky-400" },
  ], []);

  return (
    <motion.section 
      className="relative pt-12 md:pt-20 pb-10 overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={sectionVariants}
    >
      {/* Top CTA Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-12 md:mb-20">
        <div className={`rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-16 relative overflow-hidden ${TC.bgCTA || 'bg-gradient-to-br from-indigo-900/60 to-slate-900/60 border border-white/5 backdrop-blur-md'}`}>
          {/* Background Glows REMOVED for smoother scroll performance as requested */}

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 text-center md:text-left">
            <div className="max-w-2xl">
              <h2 className={`text-2xl md:text-5xl font-extrabold mb-4 md:mb-6 ${TC.textPrimary} font-manrope tracking-tight`}>
                Ready to start your journey?
              </h2>
              <p className={`text-sm md:text-lg ${TC.textSecondary} mb-0`}>
                Join millions of users worldwide and trade with confidence on the most secure platform.
              </p>
            </div>
            <div className="flex-shrink-0 w-full md:w-auto">
              <button
                onClick={() => navigate("/auth")}
                className={`group w-full md:w-auto px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-lg transition-all transform hover:scale-105 shadow-xl flex items-center justify-center gap-3 ${TC.btnPrimary}`}
              >
                <span>Get Started Now</span>
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-6 gap-4 md:gap-12 lg:gap-8 mb-12 md:mb-16">
          
          {/* Brand Column */}
          <div className="col-span-3 md:col-span-2 lg:col-span-2 space-y-3 md:space-y-6 flex flex-col items-center text-center md:items-start md:text-left">
            <div className="flex items-center gap-2">
               {/* Logo Placeholder */}
               <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <span className="text-white font-bold text-lg md:text-xl">N</span>
               </div>
               <span className={`text-xl md:text-2xl font-bold ${TC.textPrimary} tracking-tight`}>NexChain</span>
            </div>
            <p className={`text-sm leading-relaxed ${TC.textSecondary} max-w-xs mx-auto md:mx-0`}>
              The next generation of crypto trading. Fast, secure, and built for everyone. Experience the future of finance today.
            </p>
            <div className="flex gap-4 pt-2 justify-center md:justify-start">
              {socialLinks.map((social, idx) => (
                <a 
                  key={idx} 
                  href={social.href} 
                  className={`p-2 md:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 ${social.color} ${TC.textSecondary}`}
                >
                  <social.icon size={16} className="md:w-[18px] md:h-[18px]" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {footerLinks.map((column, idx) => (
            <div key={idx} className="col-span-1 text-center md:text-left">
              <h4 className={`font-bold mb-3 md:mb-6 text-sm md:text-base ${TC.textPrimary}`}>{column.title}</h4>
              <ul className="space-y-2 md:space-y-4">
                {column.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link 
                      to={link.path} 
                      className={`text-[10px] md:text-sm ${TC.textSecondary} hover:text-cyan-400 transition-colors duration-200 block`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter Column */}
          <div className="col-span-3 md:col-span-2 lg:col-span-1 text-center md:text-left">
            <h4 className={`font-bold mb-3 md:mb-6 text-sm md:text-base ${TC.textPrimary}`}>Stay Updated</h4>
            <div className="space-y-3 md:space-y-4 max-w-xs mx-auto md:mx-0">
              <p className={`text-[10px] md:text-sm ${TC.textSecondary}`}>
                Subscribe to our newsletter for the latest market updates.
              </p>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className={`w-full px-3 py-1.5 md:px-4 md:py-3 rounded-lg md:rounded-xl text-[10px] md:text-sm outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all ${TC.isLight ? 'bg-gray-100 text-gray-900' : 'bg-white/5 text-white border border-white/10'}`}
                />
                <button className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 md:p-1.5 rounded-md md:rounded-lg bg-cyan-500 text-white hover:bg-cyan-400 transition-colors">
                  <FaArrowRight size={8} className="md:w-3 md:h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`pt-6 md:pt-8 border-t ${TC.isLight ? 'border-gray-200' : 'border-white/5'} flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left`}>
          <p className={`text-xs md:text-sm ${TC.textSecondary}`}>
            © {new Date().getFullYear()} NexChain. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <a href="#" className={`text-xs md:text-sm ${TC.textSecondary} hover:text-cyan-400 transition-colors`}>Privacy Policy</a>
            <a href="#" className={`text-xs md:text-sm ${TC.textSecondary} hover:text-cyan-400 transition-colors`}>Terms of Service</a>
            <a href="#" className={`text-xs md:text-sm ${TC.textSecondary} hover:text-cyan-400 transition-colors`}>Cookie Policy</a>
          </div>
        </div>
      </div>
    </motion.section>
  );
});

export default CTASection;
