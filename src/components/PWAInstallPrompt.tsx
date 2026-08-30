import { useState, useEffect } from "react";
import { Download, X, Smartphone, WifiOff, CheckCircle, Share, PlusSquare } from "lucide-react";
import { toast } from "./Toast";

interface PWAInstallPromptProps {
  lang?: "en" | "bn";
}

export default function PWAInstallPrompt({ lang = "en" }: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const isBn = lang === "bn";

  useEffect(() => {
    // Check if already installed / standalone
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Capture beforeinstallprompt for Android/Desktop
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Online / Offline listeners
    const handleOnline = () => {
      setIsOffline(false);
      toast({
        type: "success",
        title: isBn ? "ইন্টারনেট সংযুক্ত হয়েছে" : "Back Online",
        message: isBn ? "সিস্টেম ক্লাউডের সাথে সংযুক্ত আছে" : "Store data is now connected",
      });
    };
    const handleOffline = () => {
      setIsOffline(true);
      toast({
        type: "warning",
        title: isBn ? "অফলাইন মোড সক্রিয়" : "Offline Mode Active",
        message: isBn ? "আপনি অফলাইনেও নির্বিঘ্নে বিক্রয় ও হিসাব করতে পারবেন" : "You can continue working offline seamlessly",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [isBn]);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) {
      toast({
        type: "info",
        title: isBn ? "অ্যাপ ইনস্টল করুন" : "Install App",
        message: isBn ? "ব্রাউজারের থ্রি-ডট মেন্যু থেকে 'Install app' বা 'Add to Home screen' নির্বাচন করুন" : "Select 'Install app' or 'Add to Home screen' from your browser menu",
      });
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      toast({
        type: "success",
        title: isBn ? "ইনস্টল সম্পন্ন হয়েছে!" : "App Installed Successfully!",
      });
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <>
      {/* Offline Status Top Alert Strip */}
      {isOffline && (
        <div className="bg-ac-500 text-ink px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md z-50 sticky top-0 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <WifiOff size={16} className="animate-pulse" />
            <span>
              {isBn
                ? "অফলাইন মোড: ইন্টারনেট সংযোগ নেই, কিন্তু আপনার সব ডেটা লোকালি সংরক্ষিত হচ্ছে।"
                : "Offline Mode: No active connection, but all local sales and operations work seamlessly."}
            </span>
          </div>
        </div>
      )}

      {/* Floating PWA Install Banner */}
      {showInstallBanner && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 max-w-sm w-[calc(100%-2rem)] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-em-200 p-4 animate-in slide-in-from-bottom-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-em-600 flex items-center justify-center text-white flex-shrink-0 shadow-md">
              <Smartphone size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-display font-bold text-ink text-xs sm:text-sm">
                {isBn ? "SAYHPro অ্যাপ ইনস্টল করুন" : "Install SAYHPro App"}
              </h4>
              <p className="text-ink text-[11px] mt-0.5 leading-snug">
                {isBn
                  ? "হোম স্ক্রিনে সরাসরি অ্যাপের মতো দ্রুত ব্যবহার ও অফলাইন সুবিধা পান।"
                  : "Install on your home screen for quick 1-tap launch & full offline access."}
              </p>
              <div className="flex items-center gap-2 mt-2.5">
                <button
                  onClick={handleInstallClick}
                  className="px-3.5 py-1.5 bg-em-700 hover:bg-em-800 text-white rounded-xl text-xs font-bold shadow-md transition-fast flex items-center gap-1.5"
                >
                  <Download size={13} />
                  <span>{isBn ? "ইনস্টল করুন" : "Install"}</span>
                </button>
                <button
                  onClick={() => setShowInstallBanner(false)}
                  className="px-2.5 py-1.5 text-ink hover:text-ink text-xs font-semibold rounded-xl hover:bg-nv-100 transition-fast"
                >
                  {isBn ? "পরে" : "Later"}
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowInstallBanner(false)}
              className="text-ink hover:text-ink p-1"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* iOS Install Instruction Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-nv-200 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-nv-100">
              <h3 className="font-bold text-ink text-base flex items-center gap-2">
                <Smartphone size={18} className="text-ink" />
                <span>{isBn ? "iPhone / iPad এ ইনস্টল করুন" : "Install on iOS"}</span>
              </h3>
              <button onClick={() => setShowIOSModal(false)} className="text-ink hover:text-ink">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-ink leading-relaxed">
              <div className="flex items-start gap-2.5 p-2.5 bg-nv-50 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-em-700 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
                <div>
                  Safari ব্রাউজারের নিচের <span className="font-bold inline-flex items-center gap-1 text-ink"><Share size={13} /> Share</span> বাটনে চাপ দিন।
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-nv-50 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-em-700 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
                <div>
                  তালিকা থেকে <span className="font-bold inline-flex items-center gap-1 text-ink"><PlusSquare size={13} /> Add to Home Screen</span> বেছে নিন।
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-nv-50 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-em-700 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
                <div>
                  উপরের ডানদিকের <strong>Add</strong> চাপলেই অ্যাপটি আপনার ফোনে ইনস্টল হয়ে যাবে!
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-3 bg-em-700 hover:bg-em-800 text-white rounded-xl font-bold text-xs shadow-md transition-fast"
            >
              {isBn ? "বুঝেছি" : "Got it"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
