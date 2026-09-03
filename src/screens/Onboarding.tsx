import { useState } from "react";
import {
  Check, ArrowRight, Smartphone, Sparkles,
  ShoppingCart, CreditCard, Wallet, MessageSquare, Truck, ShieldAlert, Landmark,
  Banknote, Store, Globe2,
} from "lucide-react";
import { useApp } from "../context/AppContext";

// Mirrors the app's real module list one-to-one — this is a feature summary,
// not marketing copy for capabilities that don't exist.
const featureList = [
  { id: "pos", icon: ShoppingCart, label: "Mobile POS with inventory", labelBn: "মোবাইল POS ও ইনভেন্টরি" },
  { id: "dues", icon: CreditCard, label: "Due management", labelBn: "বাকি ব্যবস্থাপনা" },
  { id: "cash", icon: Wallet, label: "Accounting", labelBn: "হিসাবরক্ষণ" },
  { id: "marketing", icon: MessageSquare, label: "SMS & Facebook marketing", labelBn: "এসএমএস ও ফেসবুক মার্কেটিং" },
  { id: "delivery", icon: Truck, label: "Delivery aggregator", labelBn: "ডেলিভারি এগ্রিগেটর" },
  { id: "alerts", icon: ShieldAlert, label: "Monitoring & alert system", labelBn: "মনিটরিং ও অ্যালার্ট সিস্টেম" },
  { id: "bank", icon: Landmark, label: "Bank account creation", labelBn: "ব্যাংক অ্যাকাউন্ট খোলা" },
  { id: "loan", icon: Banknote, label: "Loan", labelBn: "লোন" },
  { id: "payments", icon: Smartphone, label: "Digital payment services", labelBn: "ডিজিটাল পেমেন্ট সেবা" },
  { id: "reselling", icon: Store, label: "Reselling", labelBn: "রিসেলিং" },
  { id: "website", icon: Globe2, label: "Create website without any coding knowledge", labelBn: "কোনো কোডিং ছাড়াই ওয়েবসাইট তৈরি" },
];

interface OnboardingProps {
  lang: "en" | "bn";
  setLang: (l: "en" | "bn") => void;
  onComplete: () => void;
}

const businessTypes = [
  { id: "grocery", emoji: "🛒", label: "Grocery", labelBn: "মুদি দোকান" },
  { id: "clothing", emoji: "👕", label: "Clothing", labelBn: "কাপড়ের দোকান" },
  { id: "electronics", emoji: "📱", label: "Electronics", labelBn: "ইলেকট্রনিক্স" },
  { id: "pharmacy", emoji: "💊", label: "Pharmacy", labelBn: "ফার্মেসি" },
  { id: "hardware", emoji: "🔧", label: "Hardware", labelBn: "হার্ডওয়্যার" },
  { id: "cosmetics", emoji: "💄", label: "Cosmetics", labelBn: "কসমেটিক্স" },
  { id: "mobile", emoji: "📲", label: "Mobile Shop", labelBn: "মোবাইল শপ" },
  { id: "wholesale", emoji: "🏪", label: "Wholesale", labelBn: "পাইকারি" },
  { id: "other", emoji: "🏬", label: "Other", labelBn: "অন্যান্য" },
];

export default function Onboarding({ lang, setLang, onComplete }: OnboardingProps) {
  const { updateSettings } = useApp();
  const [step, setStep] = useState(1);
  const [shopNameInput, setShopNameInput] = useState("Rahim Store");
  const [phoneInput, setPhoneInput] = useState("01712-345678");
  const [addressInput, setAddressInput] = useState("House 42, Main Road, Dhanmondi, Dhaka");
  const [selectedType, setSelectedType] = useState("Grocery");
  const isBn = lang === "bn";
  const totalSteps = 5;

  const stepLabels = isBn
    ? ["স্বাগতম", "দোকানের তথ্য", "ব্যবসার ধরন", "ভাষা ও মুদ্রা", "প্রস্তুত!"]
    : ["Welcome", "Shop Setup", "Business Type", "Language & Currency", "Ready!"];

  const handleFinish = () => {
    updateSettings({
      shopName: shopNameInput,
      phone: phoneInput,
      address: addressInput,
      businessType: selectedType,
    });
    onComplete();
  };

  // Step 1 is a full-bleed features pitch, not the boxed wizard the later
  // steps use — it has its own layout entirely, then hands off to step 2.
  if (step === 1) {
    return (
      <div className="min-h-screen flex flex-col p-6 sm:p-8" style={{ background: "#0F172A" }}>
        <div className="w-full max-w-lg mx-auto flex-1 flex flex-col">
          <div className="pt-4">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-1.5">
              {isBn ? "DukanPro তে স্বাগতম! 🎉" : "Welcome to DukanPro! 🎉"}
            </h1>
            <p className="text-em-200 text-xs sm:text-sm leading-relaxed">
              {isBn
                ? "একটি অ্যাপে আপনার দোকানের সব কিছু — বিক্রি, বাকি, হিসাব ও আরও অনেক কিছু।"
                : "Everything your shop needs — sales, dues, accounting, and more — in one app."}
            </p>
          </div>

          <h2 className="font-display text-xl sm:text-2xl font-bold text-white mt-8 mb-4">
            {isBn ? "ফিচারসমূহ" : "Features"}
          </h2>

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {featureList.map(f => (
              <div key={f.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-em-600 flex items-center justify-center flex-shrink-0">
                  <f.icon size={16} className="text-white" />
                </div>
                <span className="text-sm sm:text-base font-medium text-white leading-snug">
                  {isBn ? f.labelBn : f.label}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full py-3.5 bg-em-600 hover:bg-em-700 text-white rounded-xl font-bold text-sm shadow-md transition-fast flex items-center justify-center gap-2 mt-6 flex-shrink-0"
          >
            <span>{isBn ? "শুরু করুন" : "Get Started"}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6" style={{ background: "#0F172A" }}>
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Progress header */}
        <div className="bg-nv-50 px-6 sm:px-8 pt-6 pb-4 border-b border-nv-100">
          <div className="flex items-center gap-2 mb-3">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all
                  ${i + 1 < step ? "bg-em-700 text-white" : i + 1 === step ? "bg-em-700 text-white ring-4 ring-em-100" : "bg-nv-200 text-ink"}`}>
                  {i + 1 < step ? <Check size={13} /> : i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div className={`flex-1 h-0.5 rounded-full transition-all ${i + 1 < step ? "bg-em-600" : "bg-nv-200"}`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-ink">
            {isBn ? `ধাপ ${step} এর ${totalSteps}` : `Step ${step} of ${totalSteps}`}: <span className="font-bold text-ink">{stepLabels[step - 1]}</span>
          </p>
        </div>

        <div className="p-6 sm:p-8">
          {/* Step 2: Shop Info */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-display font-bold text-xl text-ink mb-1">{isBn ? "দোকানের মূল বিবরণ" : "Your Shop Information"}</h3>
                <p className="text-xs text-ink">{isBn ? "আপনার দোকানের নাম ও ঠিকানা দিন" : "Enter store name and location"}</p>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div>
                  <label className="block font-semibold text-ink mb-1">{isBn ? "দোকানের নাম" : "Store Name"} *</label>
                  <input
                    type="text"
                    value={shopNameInput}
                    onChange={e => setShopNameInput(e.target.value)}
                    placeholder="e.g. Rahim Store"
                    className="w-full border border-nv-200 rounded-xl px-3.5 py-2.5 focus:border-em-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">{isBn ? "মোবাইল নম্বর" : "Contact Phone"} *</label>
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={e => setPhoneInput(e.target.value)}
                    placeholder="01712-345678"
                    className="w-full border border-nv-200 rounded-xl px-3.5 py-2.5 focus:border-em-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">{isBn ? "দোকানের ঠিকানা" : "Shop Address"}</label>
                  <input
                    type="text"
                    value={addressInput}
                    onChange={e => setAddressInput(e.target.value)}
                    placeholder="e.g. Dhanmondi, Dhaka"
                    className="w-full border border-nv-200 rounded-xl px-3.5 py-2.5 focus:border-em-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-nv-200 rounded-xl font-semibold text-ink hover:bg-nv-50 text-xs sm:text-sm"
                >
                  {isBn ? "পূর্ববর্তী" : "Back"}
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 bg-em-700 hover:bg-em-800 text-white rounded-xl font-bold shadow-md text-xs sm:text-sm"
                >
                  {isBn ? "পরবর্তী" : "Continue"}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Business Type */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-display font-bold text-xl text-ink mb-1">{isBn ? "ব্যবসার ধরন বেছে নিন" : "Select Business Category"}</h3>
                <p className="text-xs text-ink">{isBn ? "আপনার ধরন অনুযায়ী আমরা প্রিসেট প্রোডাক্ট রেডি করব" : "We'll configure relevant templates for your business"}</p>
              </div>

              <div className="grid grid-cols-3 gap-2.5 max-h-60 overflow-y-auto p-1">
                {businessTypes.map(bt => (
                  <button
                    key={bt.id}
                    onClick={() => setSelectedType(bt.label)}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5
                      ${selectedType === bt.label ? "bg-em-50 border-em-500 ring-2 ring-em-500/20 shadow-xs" : "border-nv-200 hover:border-nv-300"}`}
                  >
                    <span className="text-2xl">{bt.emoji}</span>
                    <span className="text-xs font-bold text-ink line-clamp-1">{isBn ? bt.labelBn : bt.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 border border-nv-200 rounded-xl font-semibold text-ink hover:bg-nv-50 text-xs sm:text-sm"
                >
                  {isBn ? "পূর্ববর্তী" : "Back"}
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 py-3 bg-em-700 hover:bg-em-800 text-white rounded-xl font-bold shadow-md text-xs sm:text-sm"
                >
                  {isBn ? "পরবর্তী" : "Continue"}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Language & Locale */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-display font-bold text-xl text-ink mb-1">{isBn ? "ভাষা ও মুদ্রা পছন্দ" : "Language & Currency"}</h3>
                <p className="text-xs text-ink">{isBn ? "যে ভাষায় আপনি অ্যাপটি ব্যবহার করতে চান" : "Choose default language and currency"}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setLang("en")}
                  className={`p-4 rounded-2xl border text-center transition-all
                    ${lang === "en" ? "bg-em-50 border-em-500 ring-2 ring-em-500/20" : "border-nv-200"}`}
                >
                  <div className="font-bold text-sm text-ink">English</div>
                  <div className="text-[11px] text-ink">Default (English)</div>
                </button>

                <button
                  onClick={() => setLang("bn")}
                  className={`p-4 rounded-2xl border text-center transition-all
                    ${lang === "bn" ? "bg-em-50 border-em-500 ring-2 ring-em-500/20" : "border-nv-200"}`}
                >
                  <div className="font-bold text-sm text-ink font-bn">বাংলা</div>
                  <div className="text-[11px] text-ink font-bn">বাংলা ইন্টারফেস</div>
                </button>
              </div>

              <div className="p-3 bg-nv-50 rounded-2xl text-xs text-ink">
                Default Currency: <span className="font-bold text-ink">BDT — Bangladeshi Taka (৳)</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 border border-nv-200 rounded-xl font-semibold text-ink hover:bg-nv-50 text-xs sm:text-sm"
                >
                  {isBn ? "পূর্ববর্তী" : "Back"}
                </button>
                <button
                  onClick={() => setStep(5)}
                  className="flex-1 py-3 bg-em-700 hover:bg-em-800 text-white rounded-xl font-bold shadow-md text-xs sm:text-sm"
                >
                  {isBn ? "পরবর্তী" : "Continue"}
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Ready */}
          {step === 5 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto text-ink shadow-md">
                <Sparkles size={32} />
              </div>
              <h2 className="font-display text-2xl font-bold text-ink">
                {isBn ? "আপনার দোকান সম্পূর্ণ প্রস্তুত! 🚀" : "You're All Set! 🚀"}
              </h2>
              <p className="text-ink text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
                {isBn
                  ? "আমরা আপনার জন্য প্রোডাক্ট ক্যাটালগ ও হিসাব প্রস্তুত করেছি। ড্যাশবোর্ডে প্রবেশ করুন।"
                  : "Your product catalog, cash accounts, and POS terminal are fully initialized. Welcome to DukanPro!"}
              </p>

              <div className="bg-nv-50 p-4 rounded-2xl text-left text-xs space-y-1.5 border border-nv-200">
                <div className="flex justify-between">
                  <span className="text-ink">Store:</span>
                  <span className="font-bold text-ink">{shopNameInput}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink">Category:</span>
                  <span className="font-bold text-ink">{selectedType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink">Phone:</span>
                  <span className="font-mono text-ink">{phoneInput}</span>
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="w-full py-4 bg-em-600 hover:bg-em-700 text-white rounded-xl font-bold text-base shadow-xl transition-all"
              >
                {isBn ? "ড্যাশবোর্ডে যান" : "Go to Dashboard"} →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
