import React from "react";
import { FaGlobe, FaExternalLinkAlt, FaBook } from "react-icons/fa";

function QuickLinks({ coin, TC, isLight }) {
  return (
    <div
      className={`order-5 rounded-xl md:rounded-2xl p-3 md:p-6 fade-in ${TC.bgCard}`}
      style={{ animationDelay: "0.5s" }}
    >
      <h3 className="text-sm md:text-lg font-bold mb-3 md:mb-4 flex items-center gap-2">
        <FaGlobe className="text-blue-500 text-xs md:text-base" />
        Quick Links
      </h3>
      <div className="flex flex-wrap gap-2 md:gap-3">
        {coin.links?.homepage?.[0] && (
          <a
            href={coin.links.homepage[0]}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm transition-all duration-200 hover:scale-105 ${isLight
              ? "bg-gray-100 text-blue-600 hover:bg-blue-50 font-medium"
              : "bg-gray-800 text-cyan-400 hover:bg-gray-700 font-medium"
              }`}
          >
            <FaExternalLinkAlt className="text-[10px] md:text-sm" />
            Website
          </a>
        )}
        {coin.links?.blockchain_site?.[0] && (
          <a
            href={coin.links.blockchain_site[0]}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm transition-all duration-200 hover:scale-105 ${isLight
              ? "bg-gray-100 text-blue-600 hover:bg-blue-50 font-medium"
              : "bg-gray-800 text-cyan-400 hover:bg-gray-700 font-medium"
              }`}
          >
            <FaExternalLinkAlt className="text-[10px] md:text-sm" />
            Explorer
          </a>
        )}
        {coin.links?.official_forum_url?.[0] && (
          <a
            href={coin.links.official_forum_url[0]}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm transition-all duration-200 hover:scale-105 ${isLight
              ? "bg-gray-100 text-blue-600 hover:bg-blue-50 font-medium"
              : "bg-gray-800 text-cyan-400 hover:bg-gray-700 font-medium"
              }`}
          >
            <FaBook className="text-[10px] md:text-sm" />
            Forum
          </a>
        )}
      </div>
    </div>
  );
}

export default QuickLinks;
