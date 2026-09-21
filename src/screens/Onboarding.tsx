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
  { id: "pos", icon: ShoppingCart, label: "Mobile POS with inventory", labelBn: "Mobile POS & Akorae (Stock)" },
  { id: "dues", icon: CreditCard, label: "Due management", labelBn: "Aka / Bosea Sohwɛ (Dues)" },
  { id: "cash", icon: Wallet, label: "Accounting", labelBn: "Akontabuo (Accounting)" },
  { id: "marketing", icon: MessageSquare, label: "SMS & Facebook marketing", labelBn: "SMS & Social Dawubɔ" },
  { id: "delivery", icon: Truck, label: "Delivery aggregator", labelBn: "Kɔmafoɔ Nkabom (Delivery)" },
  { id: "alerts", icon: ShieldAlert, label: "Monitoring & alert system", labelBn: "Ahwɛsoɔ & Kɔkɔbɔ Nhyehyɛeɛ" },
  { id: "bank", icon: Landmark, label: "Bank account creation", labelBn: "Sikakorabea Akawnt Bue" },
  { id: "loan", icon: Banknote, label: "Loan & Working Capital", labelBn: "Sika Bosea (Loans)" },
  { id: "payments", icon: Smartphone, label: "Digital payment services (MoMo & GhQR)", labelBn: "MTN MoMo & GhQR Tua Ka" },
  { id: "reselling", icon: Store, label: "Reselling network", labelBn: "Tɔ Na Tɔn (Reselling)" },
  { id: "website", icon: Globe2, label: "Create website without any coding knowledge", labelBn: "Bue Wɔn Dukan Wɔ Intanɛte So" },
];

interface OnboardingProps {
  lang: "en" | "bn";
  setLang: (l: "en" | "bn") => void;
  onComplete: () => void;
}

const businessTypes = [
  { id: "grocery", emoji: "🛒", label: "Provisions & Grocery", labelBn: "Provisions & Nnuane" },
  { id: "clothing", emoji: "👕", label: "Clothing & Boutique", labelBn: "Atadeɛ & Ntomago" },
  { id: "electronics", emoji: "📱", label: "Electronics & Tech", labelBn: "Anyinam Nnoɔma" },
  { id: "pharmacy", emoji: "💊", label: "Pharmacy & Chemists", labelBn: "Aduro Dukan (Pharmacy)" },
  { id: "hardware", emoji: "🔧", label: "Hardware & Building", labelBn: "Nnoɔma Den & Hardware" },
  { id: "cosmetics", emoji: "💄", label: "Cosmetics & Beauty", labelBn: "Ahoɔfɛ Nnoɔma" },
  { id: "mobile", emoji: "📲", label: "Mobile Phones & MoMo", labelBn: "Fon Dukan & MoMo" },
  { id: "wholesale", emoji: "🏪", label: "Wholesale Depot", labelBn: "Bɔkisi So (Wholesale)" },
  { id: "other", emoji: "🏬", label: "General Merchant", labelBn: "Foforɔ (General)" },
];

export default function Onboarding({ lang, setLang, onComplete }: OnboardingProps) {
  const { updateSettings } = useApp();
  const [step, setStep] = useState(1);
  const [shopNameInput, setShopNameInput] = useState("Kofi Provisions & Retail Mart");
  const [phoneInput, setPhoneInput] = useState("024 412 3456");
  const [addressInput, setAddressInput] = useState("Oxford Street, Osu, Accra, Ghana");
  const [selectedType, setSelectedType] = useState("Provisions & Grocery");
  const isBn = lang === "bn";
  const totalSteps = 5;

  const stepLabels = isBn
    ? ["Akwaaba", "Dukan Nsɛm", "Adwuma Su", "Kasa & Sika", "W'awie!"]
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
              {isBn ? "Akwaaba kɔ SAYHPro! 🎉" : "Welcome to SAYHPro! 🎉"}
            </h1>
            <p className="text-em-200 text-xs sm:text-sm leading-relaxed">
              {isBn
                ? "Biribiara a wo dukan hia — tɔn, aka, akontabuo ne nea ɛkeka ho wɔ faako baako."
                : "Everything your shop needs — sales, dues, accounting, and mobile money — in one app."}
            </p>
          </div>

          <h2 className="font-display text-xl sm:text-2xl font-bold text-white mt-8 mb-4">
            {isBn ? "Fitinsedie (Features)" : "Features"}
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
            <span>{isBn ? "Firi Aseɛ (Get Started)" : "Get Started"}</span>
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
                <h3 className="font-display font-bold text-xl text-ink mb-1">{isBn ? "Wo Dukan Nsɛm" : "Your Shop Information"}</h3>
                <p className="text-xs text-ink">{isBn ? "Fa wo dukan din ne beaeɛ a ɛwɔ to hɔ" : "Enter store name and location"}</p>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div>
                  <label className="block font-semibold text-ink mb-1">{isBn ? "Dukan Din" : "Store Name"} *</label>
                  <input
                    type="text"
                    value={shopNameInput}
                    onChange={e => setShopNameInput(e.target.value)}
                    placeholder="e.g. Kofi Provisions & Mart"
                    className="w-full border border-nv-200 rounded-xl px-3.5 py-2.5 focus:border-em-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">{isBn ? "Fon Nɔmba" : "Contact Phone"} *</label>
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={e => setPhoneInput(e.target.value)}
                    placeholder="024 412 3456"
                    className="w-full border border-nv-200 rounded-xl px-3.5 py-2.5 focus:border-em-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">{isBn ? "Dukan Beaeɛ" : "Shop Address"}</label>
                  <input
                    type="text"
                    value={addressInput}
                    onChange={e => setAddressInput(e.target.value)}
                    placeholder="e.g. Oxford Street, Osu, Accra"
                    className="w-full border border-nv-200 rounded-xl px-3.5 py-2.5 focus:border-em-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-nv-200 rounded-xl font-semibold text-ink hover:bg-nv-50 text-xs sm:text-sm"
                >
                  {isBn ? "San Kɔ Akyi" : "Back"}
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 bg-em-700 hover:bg-em-800 text-white rounded-xl font-bold shadow-md text-xs sm:text-sm"
                >
                  {isBn ? "Toa So" : "Continue"}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Business Type */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-display font-bold text-xl text-ink mb-1">{isBn ? "Paw Adwuma Su" : "Select Business Category"}</h3>
                <p className="text-xs text-ink">{isBn ? "Yɛbɛsiesie nnoɔma ne akontabuo a ɛfata wo dukan" : "We'll configure relevant templates for your business"}</p>
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
                  {isBn ? "San Kɔ Akyi" : "Back"}
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 py-3 bg-em-700 hover:bg-em-800 text-white rounded-xl font-bold shadow-md text-xs sm:text-sm"
                >
                  {isBn ? "Toa So" : "Continue"}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Language & Locale */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-display font-bold text-xl text-ink mb-1">{isBn ? "Kasa & Sika Nhyehyɛeɛ" : "Language & Currency"}</h3>
                <p className="text-xs text-ink">{isBn ? "Paw kasa ne sika a wopɛ sɛ wode di dwuma" : "Choose default language and currency"}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setLang("en")}
                  className={`p-4 rounded-2xl border text-center transition-all
                    ${lang === "en" ? "bg-em-50 border-em-500 ring-2 ring-em-500/20" : "border-nv-200"}`}
                >
                  <div className="font-bold text-sm text-ink">English</div>
                  <div className="text-[11px] text-ink">Ghana Official / Retail</div>
                </button>

                <button
                  onClick={() => setLang("bn")}
                  className={`p-4 rounded-2xl border text-center transition-all
                    ${lang === "bn" ? "bg-em-50 border-em-500 ring-2 ring-em-500/20" : "border-nv-200"}`}
                >
                  <div className="font-bold text-sm text-ink">Twi (Akan)</div>
                  <div className="text-[11px] text-ink">Ghana Kasa (Local)</div>
                </button>
              </div>

              <div className="p-3 bg-nv-50 rounded-2xl text-xs text-ink">
                Default Currency: <span className="font-bold text-ink">GHS — Ghana Cedi (GH₵)</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 border border-nv-200 rounded-xl font-semibold text-ink hover:bg-nv-50 text-xs sm:text-sm"
                >
                  {isBn ? "San Kɔ Akyi" : "Back"}
                </button>
                <button
                  onClick={() => setStep(5)}
                  className="flex-1 py-3 bg-em-700 hover:bg-em-800 text-white rounded-xl font-bold shadow-md text-xs sm:text-sm"
                >
                  {isBn ? "Toa So" : "Continue"}
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
                {isBn ? "Wo dukan asiesie ne ho pɛpɛɛpɛ! 🚀" : "You're All Set! 🚀"}
              </h2>
              <p className="text-ink text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
                {isBn
                  ? "Yɛasiesie wo nnoɔma din, sika akontabuo ne POS terminal ama wo. Akwaaba kɔ SAYHPro!"
                  : "Your product catalog, cash accounts, and POS terminal are fully initialized. Welcome to SAYHPro!"}
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
                {isBn ? "Kɔ Dwumadibea" : "Go to Dashboard"} →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
