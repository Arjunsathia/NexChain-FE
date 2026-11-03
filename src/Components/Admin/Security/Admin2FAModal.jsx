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
  bgBackdrop: "bg-surface",
  bgPanel: "bg-surface dark:bg-surface-2",
  textTitle: "text-fg dark:text-fg",
  textDesc: "text-fg-muted dark:text-fg-muted",
  inputBg: "bg-surface-2 dark:bg-surface",
  inputBorder: "border-line dark:border-line",
  inputText: "text-fg dark:text-fg",
  btnSubmit:
    "button-primary text-white",
  btnCancel:
    "border-line dark:border-line text-fg dark:text-fg-subtle hover:bg-surface-2 dark:hover:bg-surface-2",
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
          <div className="fixed inset-0 bg-black/60 " />
        </TransitionChild>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="animate-in zoom-in duration-300"
              leave="animate-out zoom-out duration-200"
            >
              <DialogPanel
                className={`w-full max-w-md transform overflow-hidden rounded-xl p-6 text-left align-middle shadow-card transition-all ${isLight ? "bg-surface" : "surface-panel bg-surface border border-line"}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-full bg-brand-soft">
                    <ShieldCheck className="w-6 h-6 text-brand" />
                  </div>
                  <div>
                    <DialogTitle
                      as="h3"
                      className={`text-lg font-semibold ${TC.textTitle}`}
                    >
                      Security Verification
                    </DialogTitle>
                    <p className="text-sm text-fg-muted">
                      Admin privileges required
                    </p>
                  </div>
                  <button
                    aria-label="Close"
                    onClick={handleClose}
                    className="ml-auto text-fg-muted hover:text-fg-muted"
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
                        <Lock className="h-5 w-5 text-fg-muted" />
                      </div>
                      <input
                        type="text"
                        maxLength="6"
                        value={code}
                        onChange={(e) =>
                          setCode(e.target.value.replace(/\D/g, ""))
                        }
                        className={`block w-full pl-11 pr-4 py-4 sm:text-2xl font-mono tracking-[0.5em] text-center rounded-xl border focus:ring-2 focus:ring-brand focus:border-transparent transition-all outline-none ${isLight ? "bg-surface-2 border-line text-fg" : "bg-black/50 border-line text-fg placeholder-fg-muted"}`}
                        placeholder="000000"
                        autoFocus
                      />
                    </div>
                    {error && (
                      <p className="text-down text-sm text-center font-medium">
                        {error}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className={`flex-1 px-4 py-3 rounded-xl border font-medium transition-colors ${isLight ? "border-line hover:bg-surface-2 text-fg" : "border-line hover:bg-surface text-fg-subtle"}`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={code.length !== 6}
                      className="flex-1 px-4 py-3 rounded-xl button-primary text-white font-semibold shadow-card shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
