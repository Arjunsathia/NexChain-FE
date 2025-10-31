import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

function PurchaseDetails({ coinName = "Bitcoin", amount = 1 }) {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/portfolio");
  };

  return (
    <div className="h-100 flex flex-fill justify-center">
      <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-lg max-w-md w-full text-center space-y-4">
        <CheckCircle className="mx-auto text-green-500 w-14 h-14" />
        <h2 className="text-2xl font-semibold">Purchase Successful</h2>
        <p className="text-sm text-gray-300">
          You have successfully purchased <strong>{amount}</strong> unit's of{" "}
          <strong>{coinName}</strong>.
        </p>

        <button
          onClick={handleGoBack}
          className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition"
        >
          Go to Portfolio
        </button>
      </div>
    </div>
  );
}

export default PurchaseDetails;
