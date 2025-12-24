import React, { useState, useEffect } from 'react';
import { FaIdCard, FaCheckCircle, FaTimesCircle, FaSpinner, FaUpload } from 'react-icons/fa';
import api from '@/api/axiosConfig';
import useUserContext from '@/hooks/useUserContext';
import toast from 'react-hot-toast';


const KYCVerification = ({ TC, isLight }) => {
  const { user } = useUserContext();
  const isDark = !isLight;
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

    if (user) {
      fetchStatus();
    }
  }, [user]);

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
        documentImage: 'mock_image_url'
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

  if (status === 'loading') return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-6"></div>
      <div className="h-64 w-full bg-gray-100 dark:bg-gray-800/50 rounded-xl"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <h2 className={`text-lg font-bold mb-5 flex items-center gap-2 ${TC.textPrimary} tracking-tight`}>
        <FaIdCard className="text-cyan-500" />
        Identity Verification (KYC)
      </h2>

      {status === 'verified' && (
        <div className={`border p-8 rounded-2xl text-center flex flex-col items-center justify-center ${isDark ? "bg-green-900/10 border-green-500/20" : "bg-green-50 border-green-200"}`}>
          <div className="p-4 rounded-full bg-green-500/10 mb-4">
            <FaCheckCircle className="text-4xl text-green-500" />
          </div>
          <h3 className={`text-xl font-bold mb-2 ${isDark ? "text-green-400" : "text-green-700"}`}>Identity Verified</h3>
          <p className={`text-sm ${isDark ? "text-green-300/80" : "text-green-600"}`}>Your identity has been verified. You have full access to all features.</p>
        </div>
      )}

      {status === 'pending' && (
        <div className={`border p-8 rounded-2xl text-center flex flex-col items-center justify-center ${isDark ? "bg-yellow-900/10 border-yellow-500/20" : "bg-yellow-50 border-yellow-200"}`}>
          <div className="p-4 rounded-full bg-yellow-500/10 mb-4">
            <FaSpinner className="text-4xl text-yellow-500 animate-spin" />
          </div>
          <h3 className={`text-xl font-bold mb-2 ${isDark ? "text-yellow-400" : "text-yellow-700"}`}>Verification Pending</h3>
          <p className={`text-sm ${isDark ? "text-yellow-300/80" : "text-yellow-600"}`}>Your documents are under review. This usually takes 24-48 hours.</p>
        </div>
      )}

      {(status === 'unverified' || status === 'rejected') && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {status === 'rejected' && (
            <div className={`border p-4 rounded-xl flex items-center gap-3 mb-6 ${isDark ? "bg-red-900/10 border-red-500/20 text-red-400" : "bg-red-50 border-red-200 text-red-700"}`}>
              <FaTimesCircle className="text-xl shrink-0" />
              <div>
                <p className="font-bold text-sm">Verification Rejected</p>
                <p className="text-xs opacity-90">Please check your details and try again.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className={`text-xs font-bold uppercase tracking-wider ${TC.textSecondary} ml-1`}>Full Name</label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${TC.bgInput} ${TC.textPrimary}`}
                placeholder="As per ID document"
              />
            </div>
            <div className="space-y-1.5">
              <label className={`text-xs font-bold uppercase tracking-wider ${TC.textSecondary} ml-1`}>Date of Birth</label>
              <input
                type="date"
                name="dob"
                required
                value={formData.dob}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${TC.bgInput} ${TC.textPrimary}`}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={`text-xs font-bold uppercase tracking-wider ${TC.textSecondary} ml-1`}>Address</label>
            <textarea
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              rows="2"
              className={`w-full px-4 py-3 rounded-xl border outline-none transition-all resize-none ${TC.bgInput} ${TC.textPrimary}`}
              placeholder="Your residential address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className={`text-xs font-bold uppercase tracking-wider ${TC.textSecondary} ml-1`}>ID Type</label>
              <select
                name="idType"
                value={formData.idType}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${TC.bgInput} ${TC.textPrimary}`}
              >
                <option value="passport">Passport</option>
                <option value="national_id">National ID</option>
                <option value="drivers_license">Driver&apos;s License</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={`text-xs font-bold uppercase tracking-wider ${TC.textSecondary} ml-1`}>ID Number</label>
              <input
                type="text"
                name="idNumber"
                required
                value={formData.idNumber}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${TC.bgInput} ${TC.textPrimary}`}
                placeholder="Document Number"
              />
            </div>
          </div>

          <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer group ${isDark ? "border-gray-700 hover:border-cyan-500/50 hover:bg-gray-800" : "border-gray-300 hover:border-cyan-500 hover:bg-gray-50"}`}>
            <FaUpload className={`text-3xl mx-auto mb-3 transition-colors ${isDark ? "text-gray-600 group-hover:text-cyan-500" : "text-gray-400 group-hover:text-cyan-500"}`} />
            <p className={`text-sm font-medium ${TC.textPrimary}`}>Click to upload ID Document</p>
            <p className={`text-xs mt-1 ${TC.textSecondary}`}>(Mock Upload - No file needed)</p>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={TC.btnPrimary}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2 justify-center">
                  <FaSpinner className="animate-spin" /> Submitting...
                </span>
              ) : (
                'Submit Verification'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default KYCVerification;
