import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

function PurchaseDetails({ coinName = "Bitcoin", amount = 1 }) {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/portfolio");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 fade-in" style={{ animationDelay: "0.1s" }}>
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 text-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center space-y-6 fade-in" style={{ animationDelay: "0.2s" }}>
        {/* Success Icon */}
        <div className="fade-in" style={{ animationDelay: "0.3s" }}>
          <CheckCircle className="mx-auto text-green-500 w-16 h-16 mb-2" />
        </div>
        
        {/* Title */}
        <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent fade-in" style={{ animationDelay: "0.4s" }}>
          Purchase Successful
        </h2>
        
        {/* Message */}
        <p className="text-gray-300 leading-relaxed fade-in" style={{ animationDelay: "0.5s" }}>
          You have successfully purchased <strong className="text-cyan-400">{amount}</strong> unit{amount !== 1 ? 's' : ''} of{" "}
          <strong className="text-cyan-400">{coinName}</strong>.
        </p>

        {/* Action Button */}
        <button
          onClick={handleGoBack}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 fade-in"
          style={{ animationDelay: "0.6s" }}
        >
          Go to Portfolio
        </button>

        {/* Additional Info */}
        <div className="pt-4 border-t border-gray-700 fade-in" style={{ animationDelay: "0.7s" }}>
          <p className="text-xs text-gray-500">
            Your transaction has been processed successfully
          </p>
        </div>
      </div>
    </div>
  );
}

export default PurchaseDetails;