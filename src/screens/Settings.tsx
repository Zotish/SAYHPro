import { useState } from "react";
import { Building2, Globe, Bell, Users, Shield, Printer, CreditCard, ChevronRight, Check, RotateCcw, Save } from "lucide-react";
import { useApp } from "../context/AppContext";

interface SettingsProps {
  lang: "en" | "bn";
  setLang: (l: "en" | "bn") => void;
}

const settingsSections = [
  { id: "shop", icon: Building2, label: "Shop Information", labelBn: "দোকানের তথ্য", color: "bg-em-50 text-em-700" },
  { id: "locale", icon: Globe, label: "Language & Region", labelBn: "ভাষা ও অঞ্চল", color: "bg-blue-50 text-blue-700" },
  { id: "notifications", icon: Bell, label: "Notifications & Alerts", labelBn: "বিজ্ঞপ্তি ও অ্যালার্ট", color: "bg-amber-50 text-amber-700" },
  { id: "print", icon: Printer, label: "Invoice & Print", labelBn: "ইনভয়েস ও প্রিন্ট", color: "bg-nv-100 text-nv-700" },
  { id: "system", icon: Shield, label: "System & Demo Data", labelBn: "সিস্টেম ও ডেটা", color: "bg-red-50 text-red-600" },
];

const businessTypes = [
  "Grocery / মুদি দোকান",
  "Clothing / কাপড়ের দোকান",
  "Electronics / ইলেকট্রনিক্স",
  "Pharmacy / ফার্মেসি",
  "Hardware & Sanitary",
  "Cosmetics / কসমেটিক্স",
  "Mobile & Gadgets Shop",
  "Wholesale / পাইকারি ব্যবসা",
  "Super Shop / ডিপার্টমেন্টাল",
];

export default function Settings({ lang, setLang }: SettingsProps) {
  const { settings, updateSettings, resetToDefaultData } = useApp();
  const isBn = lang === "bn";

  const [activeSection, setActiveSection] = useState("shop");

  // Local state for edits
  const [shopName, setShopName] = useState(settings.shopName);
  const [shopNameBn, setShopNameBn] = useState(settings.shopNameBn);
  const [ownerName, setOwnerName] = useState(settings.ownerName);
  const [businessType, setBusinessType] = useState(settings.businessType);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);
  const [taxRate, setTaxRate] = useState(settings.taxRate);
  const [currency, setCurrency] = useState(settings.currency);
  const [autoPrint, setAutoPrint] = useState(settings.autoPrint);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);

  const handleSaveShopInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      shopName,
      shopNameBn,
      ownerName,
      businessType,
      phone,
      address,
      taxRate: Number(taxRate) || 0,
      currency,
      autoPrint,
      soundEnabled,
    });
  };

  return (
    <div className="p-4 sm:p-6 pb-24 lg:pb-8 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-nv-900">{isBn ? "সিস্টেম ও দোকান সেটিংস" : "Shop & System Settings"}</h1>
        <p className="text-nv-500 text-xs sm:text-sm mt-0.5">{isBn ? "দোকানের প্রোফাইল, প্রিন্টার ও আঞ্চলিক পছন্দসমূহ কনফিগার করুন" : "Configure shop profile, printing, and regional preferences"}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation Menu */}
        <div className="bg-white rounded-2xl shadow-sm border border-nv-200 p-2.5 space-y-1 h-fit">
          {settingsSections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm transition-fast text-left
                ${activeSection === s.id ? "bg-em-700 text-white font-bold shadow-xs" : "text-nv-700 hover:bg-nv-50"}`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${activeSection === s.id ? "bg-white/20 text-white" : s.color}`}>
                <s.icon size={15} />
              </div>
              <span className="flex-1">{isBn ? s.labelBn : s.label}</span>
              {activeSection === s.id && <ChevronRight size={14} />}
            </button>
          ))}
        </div>

        {/* Settings Content Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Shop Information */}
          {activeSection === "shop" && (
            <div className="bg-white rounded-3xl shadow-sm border border-nv-200 p-6 space-y-5">
              <div className="border-b border-nv-100 pb-3">
                <h3 className="font-display font-bold text-nv-900 text-base">{isBn ? "দোকানের মূল তথ্য" : "Shop Information"}</h3>
                <p className="text-xs text-nv-500">This information appears on your invoices and customer receipts</p>
              </div>

              <form onSubmit={handleSaveShopInfo} className="space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-nv-700 mb-1.5">{isBn ? "দোকানের নাম (ইংরেজি)" : "Shop Name (English)"} *</label>
                    <input
                      type="text"
                      required
                      value={shopName}
                      onChange={e => setShopName(e.target.value)}
                      className="w-full border border-nv-200 rounded-xl px-3.5 py-2.5 focus:border-em-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-nv-700 mb-1.5">{isBn ? "দোকানের নাম (বাংলা)" : "Shop Name (Bangla)"}</label>
                    <input
                      type="text"
                      value={shopNameBn}
                      onChange={e => setShopNameBn(e.target.value)}
                      className="w-full border border-nv-200 rounded-xl px-3.5 py-2.5 focus:border-em-500 font-bn"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-nv-700 mb-1.5">{isBn ? "মালিকের নাম" : "Owner Name"} *</label>
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={e => setOwnerName(e.target.value)}
                      className="w-full border border-nv-200 rounded-xl px-3.5 py-2.5 focus:border-em-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-nv-700 mb-1.5">{isBn ? "ব্যবসার ধরণ" : "Business Type"}</label>
                    <select
                      value={businessType}
                      onChange={e => setBusinessType(e.target.value)}
                      className="w-full border border-nv-200 rounded-xl px-3.5 py-2.5 bg-white focus:border-em-500"
                    >
                      {businessTypes.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-nv-700 mb-1.5">{isBn ? "যোগাযোগ মোবাইল" : "Contact Phone"} *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full border border-nv-200 rounded-xl px-3.5 py-2.5 focus:border-em-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-nv-700 mb-1.5">{isBn ? "মুদ্রা" : "Currency"}</label>
                    <select
                      value={currency}
                      onChange={e => setCurrency(e.target.value)}
                      className="w-full border border-nv-200 rounded-xl px-3.5 py-2.5 bg-white focus:border-em-500"
                    >
                      <option value="BDT (৳)">BDT — Bangladeshi Taka (৳)</option>
                      <option value="USD ($)">USD ($)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-nv-700 mb-1.5">{isBn ? "ঠিকানা" : "Shop Address"}</label>
                    <textarea
                      rows={2}
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="w-full border border-nv-200 rounded-xl px-3.5 py-2 focus:border-em-500"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-nv-100 flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 bg-em-700 hover:bg-em-800 text-white rounded-xl font-bold shadow-md transition-fast"
                  >
                    <Save size={16} />
                    <span>{isBn ? "পরিবর্তন সংরক্ষণ করুন" : "Save Changes"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Language & Region */}
          {activeSection === "locale" && (
            <div className="bg-white rounded-3xl shadow-sm border border-nv-200 p-6 space-y-4">
              <div className="border-b border-nv-100 pb-3">
                <h3 className="font-display font-bold text-nv-900 text-base">{isBn ? "ভাষা ও ডিসপ্লে সেটিংস" : "Language & Locale Settings"}</h3>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLang("en")}
                    className={`p-4 rounded-2xl border-2 text-left transition-fast flex items-center justify-between
                      ${lang === "en" ? "border-em-500 bg-em-50/50 shadow-sm" : "border-nv-200 hover:border-nv-300"}`}
                  >
                    <div>
                      <div className="font-bold text-nv-900">English (US)</div>
                      <div className="text-xs text-nv-500">Default interface language</div>
                    </div>
                    {lang === "en" && <Check className="text-em-700" size={18} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setLang("bn")}
                    className={`p-4 rounded-2xl border-2 text-left transition-fast flex items-center justify-between
                      ${lang === "bn" ? "border-em-500 bg-em-50/50 shadow-sm" : "border-nv-200 hover:border-nv-300"}`}
                  >
                    <div>
                      <div className="font-bold text-nv-900 font-bn">বাংলা (Bengali)</div>
                      <div className="text-xs text-nv-500 font-bn">সম্পূর্ণ বাংলা ইন্টারফেস</div>
                    </div>
                    {lang === "bn" && <Check className="text-em-700" size={18} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeSection === "notifications" && (
            <div className="bg-white rounded-3xl shadow-sm border border-nv-200 p-6 space-y-4">
              <div className="border-b border-nv-100 pb-3">
                <h3 className="font-display font-bold text-nv-900 text-base">{isBn ? "বিজ্ঞপ্তি ও অ্যালার্ট" : "Alert Preferences"}</h3>
              </div>

              <div className="space-y-3">
                {[
                  { title: "Low Stock Warning Alerts", desc: "Notify when products reach or drop below minimum stock quantity", checked: true },
                  { title: "Customer Due Payment Reminders", desc: "Highlight accounts with dues overdue past 7 days", checked: true },
                  { title: "POS Sale Sound Chime", desc: "Play positive sound on successful checkout", checked: soundEnabled, toggle: () => setSoundEnabled(!soundEnabled) },
                ].map((n, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 bg-nv-50 rounded-2xl">
                    <div>
                      <div className="font-semibold text-xs sm:text-sm text-nv-900">{n.title}</div>
                      <div className="text-xs text-nv-500">{n.desc}</div>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked={n.checked}
                      onChange={n.toggle}
                      className="w-5 h-5 accent-em-600 rounded cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Printing & Invoices */}
          {activeSection === "print" && (
            <div className="bg-white rounded-3xl shadow-sm border border-nv-200 p-6 space-y-4">
              <div className="border-b border-nv-100 pb-3">
                <h3 className="font-display font-bold text-nv-900 text-base">{isBn ? "প্রিন্টিং ও ইনভয়েস প্রিফারেন্স" : "Printer Configuration"}</h3>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-center justify-between p-3.5 bg-nv-50 rounded-2xl">
                  <div>
                    <div className="font-semibold text-nv-900">{isBn ? "বিক্রয়ের পর অটো-প্রিন্ট" : "Auto-open Print dialog after POS sale"}</div>
                    <div className="text-xs text-nv-500">Automatically launches printer prompt on checkout completion</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoPrint}
                    onChange={e => setAutoPrint(e.target.checked)}
                    className="w-5 h-5 accent-em-600 rounded cursor-pointer"
                  />
                </div>

                <div className="p-3.5 bg-nv-50 rounded-2xl space-y-2">
                  <div className="font-semibold text-nv-900">{isBn ? "রসিদের নিচের টেক্সট (Footer Note)" : "Receipt Footer Message"}</div>
                  <input
                    type="text"
                    defaultValue="Thank you for shopping with us! Please come again."
                    className="w-full border border-nv-200 rounded-xl px-3 py-2 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* System & Demo Data Reset */}
          {activeSection === "system" && (
            <div className="bg-white rounded-3xl shadow-sm border border-nv-200 p-6 space-y-4">
              <div className="border-b border-nv-100 pb-3">
                <h3 className="font-display font-bold text-nv-900 text-base">{isBn ? "সিস্টেম ও ডেমো ডেটা রিসেট" : "Data Management"}</h3>
              </div>

              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-3">
                <div>
                  <h4 className="font-bold text-red-800 text-sm">{isBn ? "ফ্যাক্টরি রিসেট / ডেমো ডেটা পুনরুদ্ধার" : "Reset Data to Initial Demo State"}</h4>
                  <p className="text-xs text-red-600 mt-0.5">
                    {isBn ? "এটি সব বিক্রয়, নতুন পণ্য ও কাস্টমার রেকর্ড মুছে প্রাথমিক ডেমো অবস্থায় ফিরিয়ে আনবে।" : "This will reset all products, sales, accounts, and dues back to initial demo seeds."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetToDefaultData}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-fast shadow-sm flex items-center gap-1.5"
                >
                  <RotateCcw size={14} />
                  <span>{isBn ? "ডেমো ডেটা রিসেট করুন" : "Reset All Demo Data"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
