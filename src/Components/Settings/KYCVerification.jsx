import React, { useState, useEffect } from 'react';
import { FaIdCard, FaCheckCircle, FaTimesCircle, FaSpinner, FaUpload } from 'react-icons/fa';
import api from '@/api/axiosConfig';
import useUserContext from '@/hooks/useUserContext';
import toast from 'react-hot-toast';
import { useTheme } from '@/hooks/useTheme';

const KYCVerification = () => {
  const { user } = useUserContext();
  const { isDark } = useTheme();
  const [status, setStatus] = useState('loading');
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    address: '',
    idType: 'passport',
    idNumber: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStatus();
    }
  }, [user]);

  const fetchStatus = async () => {
    try {
      const res = await api.get(`/kyc/status/${user.id}`);
      if (res.data.success) {
        setStatus(res.data.kycStatus);
      }
    } catch (error) {
      console.error("Failed to fetch KYC status", error);
      setStatus('unverified');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/kyc/submit', {
        user_id: user.id,
        ...formData,
        documentImage: 'mock_image_url' // Mock image upload for now
      });
      if (res.data.success) {
        toast.success("KYC Submitted Successfully!");
        setStatus('pending');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to submit KYC");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Theme Classes
  const containerClass = `max-w-2xl mx-auto p-4 sm:p-6 rounded-2xl shadow-lg border ${
    isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
  }`;
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textLabel = isDark ? "text-gray-300" : "text-gray-700";
  const inputClass = `w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-cyan-500 ${
    isDark 
      ? "bg-gray-700 text-white border-gray-600" 
      : "bg-white text-gray-900 border-gray-300"
  }`;

  if (status === 'loading') return <div className="animate-pulse h-64 bg-gray-100 rounded-xl"></div>;

  return (
    <div className={containerClass}>
      <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${textPrimary}`}>
        <FaIdCard className="text-cyan-500" />
        Identity Verification (KYC)
      </h2>

      {status === 'verified' && (
        <div className={`border p-6 rounded-xl text-center ${isDark ? "bg-green-900/20 border-green-800" : "bg-green-50 border-green-200"}`}>
          <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-4" />
          <h3 className={`text-xl font-bold ${isDark ? "text-green-400" : "text-green-700"}`}>Verified</h3>
          <p className={`mt-2 ${isDark ? "text-green-300" : "text-green-600"}`}>Your identity has been verified. You have full access to all features.</p>
        </div>
      )}

      {status === 'pending' && (
        <div className={`border p-6 rounded-xl text-center ${isDark ? "bg-yellow-900/20 border-yellow-800" : "bg-yellow-50 border-yellow-200"}`}>
          <FaSpinner className="text-5xl text-yellow-500 mx-auto mb-4 animate-spin" />
          <h3 className={`text-xl font-bold ${isDark ? "text-yellow-400" : "text-yellow-700"}`}>Verification Pending</h3>
          <p className={`mt-2 ${isDark ? "text-yellow-300" : "text-yellow-600"}`}>Your documents are under review. This usually takes 24-48 hours.</p>
        </div>
      )}

      {(status === 'unverified' || status === 'rejected') && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {status === 'rejected' && (
             <div className={`border p-4 rounded-xl flex items-center gap-3 mb-4 ${isDark ? "bg-red-900/20 border-red-800 text-red-400" : "bg-red-50 border-red-200 text-red-700"}`}>
                <FaTimesCircle className="text-xl" />
                <div>
                    <p className="font-bold">Verification Rejected</p>
                    <p className="text-sm">Please check your details and try again.</p>
                </div>
             </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${textLabel}`}>Full Name</label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${textLabel}`}>Date of Birth</label>
              <input
                type="date"
                name="dob"
                required
                value={formData.dob}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${textLabel}`}>Address</label>
            <textarea
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              rows="2"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${textLabel}`}>ID Type</label>
              <select
                name="idType"
                value={formData.idType}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="passport">Passport</option>
                <option value="national_id">National ID</option>
                <option value="drivers_license">Driver's License</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${textLabel}`}>ID Number</label>
              <input
                type="text"
                name="idNumber"
                required
                value={formData.idNumber}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${isDark ? "border-gray-600 hover:bg-gray-700/50" : "border-gray-300 hover:bg-gray-50"}`}>
            <FaUpload className="text-3xl text-gray-400 mx-auto mb-2" />
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Click to upload ID Document</p>
            <p className="text-xs text-gray-400 mt-1">(Mock Upload - No file needed)</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
          </button>
        </form>
      )}
    </div>
  );
};

export default KYCVerification;
