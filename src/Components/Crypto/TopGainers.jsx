import { getTopGainers } from "@/api/coinApis";
import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaExclamationTriangle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function TopGainers() {
  const [gainers, setGainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getTopGainers();
        setGainers(data.slice(0, 5)); // Optional: show only top 5
      } catch (error) {
        console.error("Failed to fetch top gainers:", error);
        setGainers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="border-gray-700 border rounded-xl p-5 shadow-md fade-in" style={{ animationDelay: "0.4s" }}>
      <h2 className="text-lg font-semibold mb-4 text-white fade-in" style={{ animationDelay: "0.5s" }}>📈 Top Gainers</h2>

      {loading ? (
        <ul className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <li
              key={index}
              className="flex justify-between items-center text-sm fade-in"
              style={{ animationDelay: `${0.6 + (index * 0.1)}s` }}
            >
              <Skeleton
                width={120}
                height={16}
                baseColor="#2c303a"
                highlightColor="#3a3f4b"
              />
              <Skeleton
                width={80}
                height={16}
                baseColor="#2c303a"
                highlightColor="#3a3f4b"
              />
            </li>
          ))}
        </ul>
      ) : gainers.length > 0 ? (
        <ul className="space-y-3 text-white">
          {gainers.map((coin, index) => (
            <li
              key={coin.id}
              className="flex justify-between items-center text-sm border-b border-gray-700 last:border-b-0 pb-2 fade-in"
              style={{ animationDelay: `${0.6 + (index * 0.1)}s` }}
            >
              <span
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => navigate(`/coin/${coin.id}`)}
              >
                <img
                  src={coin.image}
                  alt={coin.name}
                  className="w-5 h-5 rounded-full object-contain"
                />
                {coin.name} ({coin.symbol.toUpperCase()})
              </span>

              <span className="text-green-400">
                ₹{Number(coin.current_price).toLocaleString("en-IN")} ( +
                {coin.price_change_percentage_24h?.toFixed(2)}%)
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center text-gray-400 mt-4 flex flex-col items-center justify-center gap-2 fade-in" style={{ animationDelay: "0.6s" }}>
          <FaExclamationTriangle className="text-3xl" />
          <p className="text-sm">
            Unable to load top gainers. Please try again later.
          </p>
        </div>
      )}
    </div>
  );
}

export default TopGainers;