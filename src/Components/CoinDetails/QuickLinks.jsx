import React from "react";
import { FaGlobe, FaExternalLinkAlt, FaBook } from "react-icons/fa";

function QuickLinks({ coin, TC, isLight }) {
  return (
    <div
      className={`order-5 rounded-2xl p-6 fade-in ${TC.bgCard}`}
      style={{ animationDelay: "0.5s" }}
    >
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <FaGlobe className="text-blue-500" />
        Quick Links
      </h3>
      <div className="flex flex-wrap gap-3">
        {coin.links?.homepage?.[0] && (
          <a
            href={coin.links.homepage[0]}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
              isLight
                ? "bg-gray-100 text-blue-600 hover:bg-blue-50"
                : "bg-gray-700 text-cyan-400 hover:bg-gray-600"
            }`}
          >
            <FaExternalLinkAlt className="text-sm" />
            Website
          </a>
        )}
        {coin.links?.blockchain_site?.[0] && (
          <a
            href={coin.links.blockchain_site[0]}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
              isLight
                ? "bg-gray-100 text-blue-600 hover:bg-blue-50"
                : "bg-gray-700 text-cyan-400 hover:bg-gray-600"
            }`}
          >
            <FaExternalLinkAlt className="text-sm" />
            Explorer
          </a>
        )}
        {coin.links?.official_forum_url?.[0] && (
          <a
            href={coin.links.official_forum_url[0]}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
              isLight
                ? "bg-gray-100 text-blue-600 hover:bg-blue-50"
                : "bg-gray-700 text-cyan-400 hover:bg-gray-600"
            }`}
          >
            <FaBook className="text-sm" />
            Forum
          </a>
        )}
      </div>
    </div>
  );
}

export default QuickLinks;
