import { useState, useEffect, Fragment } from "react";
import {
  Dialog,
  Transition,
  TransitionChild,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { ShieldCheck, Lock, X } from "lucide-react";
import { TwoFactorEvent } from "../../../utils/twoFactorEvent";
import useThemeCheck from "../../../hooks/useThemeCheck";

const TC = {
  bgBackdrop: "bg-gray-900/50",
  bgPanel: "bg-white dark:bg-gray-800",
  textTitle: "text-gray-900 dark:text-white",
  textDesc: "text-gray-500 dark:text-gray-400",
  inputBg: "bg-gray-50 dark:bg-gray-900/50",
  inputBorder: "border-gray-200 dark:border-gray-700",
  inputText: "text-gray-900 dark:text-white",
  btnSubmit:
    "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white",
  btnCancel:
    "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800",
};

const Admin2FAModal = () => {
  const isLight = useThemeCheck();
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [request, setRequest] = useState(null);

  useEffect(() => {
    const unsubscribe = TwoFactorEvent.subscribe((data) => {
      setRequest(data);
      setIsOpen(true);
      setCode("");
      setError("");
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    if (request) {
      request.resolve(code);
      setIsOpen(false);
      setRequest(null);
    }
  };

  const handleClose = () => {
    if (request) {
      request.reject(new Error("2FA Challenge Cancelled"));
      setIsOpen(false);
      setRequest(null);
    }
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[1000000]" onClose={handleClose}>
        <TransitionChild
          as={Fragment}
          enter="animate-in fade-in duration-300"
          leave="animate-out fade-out duration-200"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="animate-in zoom-in duration-300"
              leave="animate-out zoom-out duration-200"
            >
              <DialogPanel
                className={`w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all ${isLight ? "bg-white" : "bg-[#0f172a] border border-white/10"}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-full bg-cyan-500/10">
                    <ShieldCheck className="w-6 h-6 text-cyan-500" />
                  </div>
                  <div>
                    <DialogTitle
                      as="h3"
                      className={`text-lg font-bold ${TC.textTitle}`}
                    >
                      Security Verification
                    </DialogTitle>
                    <p className="text-sm text-gray-500">
                      Admin privileges required
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="ml-auto text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-2">
                  <p className={`text-sm ${TC.textDesc}`}>
                    This action requires 2-Step Verification. Please enter the
                    code from your Authenticator app.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        maxLength="6"
                        value={code}
                        onChange={(e) =>
                          setCode(e.target.value.replace(/\D/g, ""))
                        }
                        className={`block w-full pl-11 pr-4 py-4 sm:text-2xl font-mono tracking-[0.5em] text-center rounded-xl border focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all outline-none ${isLight ? "bg-gray-50 border-gray-200 text-gray-900" : "bg-black/50 border-white/10 text-white placeholder-gray-600"}`}
                        placeholder="000000"
                        autoFocus
                      />
                    </div>
                    {error && (
                      <p className="text-red-500 text-sm text-center font-medium">
                        {error}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className={`flex-1 px-4 py-3 rounded-xl border font-medium transition-colors ${isLight ? "border-gray-200 hover:bg-gray-50 text-gray-700" : "border-white/10 hover:bg-white/5 text-gray-300"}`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={code.length !== 6}
                      className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Verify
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Admin2FAModal;
