import useThemeCheck from '@/hooks/useThemeCheck';
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Wallet, X } from "lucide-react";
import Confetti from "react-confetti";



const PurchaseSuccessModal = ({ show, onClose, data, isFirstPurchase = false }) => {
  const navigate = useNavigate();
  const isLight = useThemeCheck();
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!show || !data) return null;

  const {
    type = "buy",
    coinName = "Bitcoin",
    symbol = "BTC",
    amount = 0,
    price = 0,
    total = 0,
  } = data;

  const isBuy = type === "buy";

  const handleGoToPortfolio = () => {
    onClose();
    navigate("/portfolio");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300">
      {isFirstPurchase && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.15}
          style={{ zIndex: 61 }}
        />
      )}

      <div
        className={`relative w-full max-w-md mx-4 rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 ${
          isLight
            ? "bg-white"
            : "bg-gray-800/90 backdrop-blur-xl border border-gray-700"
        }`}
      >
        {}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
            isLight
              ? "hover:bg-gray-100 text-gray-500"
              : "hover:bg-gray-700 text-gray-400"
          }`}
        >
          <X size={20} />
        </button>

        <div className="p-8 text-center space-y-6">
          {}
          <div className="relative inline-block">
            <div
              className={`absolute inset-0 rounded-full blur-xl opacity-50 ${
                isBuy ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <CheckCircle
              className={`relative z-10 w-20 h-20 mx-auto ${
                isBuy ? "text-green-500" : "text-red-500"
              }`}
            />
          </div>

          {}
          <div>
            <h2
              className={`text-3xl font-bold mb-2 ${
                isLight ? "text-gray-900" : "text-white"
              }`}
            >
              {isBuy ? "Purchase Successful!" : "Sale Successful!"}
            </h2>
            <p
              className={`text-sm ${
                isLight ? "text-gray-500" : "text-gray-400"
              }`}
            >
              Your transaction has been processed successfully.
            </p>
          </div>

          {}
          <div
            className={`rounded-2xl p-6 space-y-4 ${
              isLight ? "bg-gray-50" : "bg-gray-700/30"
            }`}
          >
            <div className="flex justify-between items-center">
              <span
                className={`text-sm ${
                  isLight ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Coin
              </span>
              <span
                className={`font-bold flex items-center gap-2 ${
                  isLight ? "text-gray-900" : "text-white"
                }`}
              >
                {coinName}{" "}
                <span className="text-xs opacity-70">({symbol})</span>
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span
                className={`text-sm ${
                  isLight ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Amount
              </span>
              <span
                className={`font-bold ${
                  isBuy ? "text-green-500" : "text-red-500"
                }`}
              >
                {isBuy ? "+" : "-"}
                {Number(amount).toFixed(6)} {symbol}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span
                className={`text-sm ${
                  isLight ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Price per coin
              </span>
              <span
                className={`font-semibold ${
                  isLight ? "text-gray-900" : "text-white"
                }`}
              >
                ${Number(price).toLocaleString()}
              </span>
            </div>
            <div
              className={`h-px w-full ${
                isLight ? "bg-gray-200" : "bg-gray-600"
              }`}
            ></div>
            <div className="flex justify-between items-center text-lg">
              <span
                className={`font-bold ${
                  isLight ? "text-gray-900" : "text-white"
                }`}
              >
                Total
              </span>
              <span className="font-bold text-cyan-500">
                ${Number(total).toLocaleString()}
              </span>
            </div>
          </div>

          {}
          <div className="space-y-3 pt-4">
            <button
              onClick={handleGoToPortfolio}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Wallet className="w-5 h-5" />
              Go to Portfolio
            </button>

            <button
              onClick={onClose}
              className={`w-full py-3.5 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                isLight
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              Back to Trading
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessModal;
