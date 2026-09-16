import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PWAInstallBannerProps {
  shopName?: string;
  isBn?: boolean;
}

export default function PWAInstallBanner({ shopName = "Rahim Store", isBn = false }: PWAInstallBannerProps) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already installed in standalone mode
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(isIosDevice);

    const dismissed = localStorage.getItem("rahimstore_pwa_dismissed");
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) {
      return; // Dismissed within 7 days
    }

    const handler = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setInstallPrompt(promptEvent);
      (window as any).deferredPwaPrompt = promptEvent;
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // If deferredPrompt was already saved globally
    if ((window as any).deferredPwaPrompt) {
      setInstallPrompt((window as any).deferredPwaPrompt);
      setShowBanner(true);
    }

    // If on iOS and not dismissed, prompt after a short delay
    if (isIosDevice && !dismissed) {
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    const prompt = installPrompt || (typeof window !== "undefined" ? (window as any).deferredPwaPrompt : null);
    if (!prompt) return;

    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice && choice.outcome === "accepted") {
      setShowBanner(false);
      setInstallPrompt(null);
      if (typeof window !== "undefined") (window as any).deferredPwaPrompt = null;
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("rahimstore_pwa_dismissed", Date.now().toString());
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl p-3.5 sm:p-4 animate-in slide-in-from-bottom-5 duration-300">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#febd69] text-black flex items-center justify-center shrink-0 shadow-xs">
            <Smartphone className="text-black" size={20} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-[#111827]">
                {isBn ? `${shopName} অ্যাপ ইনস্টল করুন` : `Install ${shopName} App`}
              </h4>
              <button
                onClick={handleDismiss}
                className="text-[#9CA3AF] hover:text-[#111827] p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">
              {isBn
                ? "দ্রুত পণ্য অর্ডার, অফলাইন সুবিধা এবং সরাসরি মোবাইল অ্যাপ ব্যবহারের জন্য ইনস্টল করুন।"
                : `Install ${shopName} for full offline access, faster loading, and a native app experience on your phone.`}
            </p>

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleInstall}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#febd69] hover:bg-[#f08804] text-black text-xs font-black shadow-xs transition-colors cursor-pointer"
              >
                <Download size={14} />
                <span>{isIOS ? (isBn ? "কীভাবে ইনস্টল করবেন" : "How to Install") : (isBn ? "এখনই ডাউনলোড করুন" : "Install Now")}</span>
              </button>
              <button
                onClick={handleDismiss}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#6B7280] hover:text-[#111827] hover:bg-gray-100 transition-colors cursor-pointer"
              >
                {isBn ? "পরে" : "Maybe later"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* iOS Installation Instruction Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-[#E5E7EB] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#111827] text-base">Install on iOS (iPhone / iPad)</h3>
              <button onClick={() => setShowIOSGuide(false)} className="text-[#9CA3AF] hover:text-[#111827] cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="text-xs text-[#4B5563] space-y-3">
              <div className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-[#131921] text-white font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                <span>Tap the <strong>Share</strong> button in Safari (bottom toolbar).</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-[#131921] text-white font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                <span>Scroll down and tap <strong>Add to Home Screen</strong>.</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-[#131921] text-white font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                <span>Tap <strong>Add</strong> in the top-right corner.</span>
              </div>
            </div>
            <button
              onClick={() => {
                setShowIOSGuide(false);
                setShowBanner(false);
              }}
              className="w-full py-2 bg-[#febd69] hover:bg-[#f08804] text-black font-black text-xs rounded-xl transition-colors cursor-pointer"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
