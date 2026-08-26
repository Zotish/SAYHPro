import { useState } from "react";
import {
  Globe, Smartphone, Monitor, ExternalLink, QrCode, Sparkles,
  Save, Eye, ShoppingBag, MessageCircle, Check, Copy, Palette,
  Settings, ChevronRight, Share2, Plus, ArrowRight
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { toast } from "../components/Toast";

interface WebsiteBuilderProps {
  lang: "en" | "bn";
  setScreen: (s: string) => void;
}

export default function WebsiteBuilder({ lang, setScreen }: WebsiteBuilderProps) {
  const {
    storefront,
    updateStorefront,
    products,
    settings,
    tNum,
    formatTaka
  } = useApp();

  const isBn = lang === "bn";
  const [viewDevice, setViewDevice] = useState<"mobile" | "desktop">("mobile");
  const [activeTab, setActiveTab] = useState<"design" | "content" | "settings">("design");

  // Form State
  const [subdomain, setSubdomain] = useState(storefront.subdomain);
  const [headline, setHeadline] = useState(storefront.heroHeadline);
  const [headlineBn, setHeadlineBn] = useState(storefront.heroHeadlineBn);
  const [subheadline, setSubheadline] = useState(storefront.heroSubheadline);
  const [subheadlineBn, setSubheadlineBn] = useState(storefront.heroSubheadlineBn);
  const [themeColor, setThemeColor] = useState(storefront.themeColor);
  const [whatsAppNumber, setWhatsAppNumber] = useState(storefront.whatsAppNumber);
  const [showWhatsApp, setShowWhatsApp] = useState(storefront.showWhatsAppButton);
  const [allowCOD, setAllowCOD] = useState(storefront.allowCOD);
  const [showReviews, setShowReviews] = useState(storefront.showReviews);
  const [announcement, setAnnouncement] = useState(storefront.announcementText);
  const [announcementBn, setAnnouncementBn] = useState(storefront.announcementTextBn);

  const publicUrl = `https://${subdomain}.sayhpro.com`;

  const handleSave = () => {
    updateStorefront({
      subdomain,
      heroHeadline: headline,
      heroHeadlineBn: headlineBn,
      heroSubheadline: subheadline,
      heroSubheadlineBn: subheadlineBn,
      themeColor,
      whatsAppNumber,
      showWhatsAppButton: showWhatsApp,
      allowCOD,
      showReviews,
      announcementText: announcement,
      announcementTextBn: announcementBn,
    });
  };

  const colorThemes = [
    { name: "Emerald Pro", color: "#047857" },
    { name: "Royal Blue", color: "#1D4ED8" },
    { name: "Purple Elegance", color: "#7E22CE" },
    { name: "Ruby Red", color: "#B91C1C" },
    { name: "Slate Midnight", color: "#0F172A" },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 pb-28 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-nv-900">{isBn ? "নো-কোড ওয়েবসাইট ও অনলাইন স্টোর বিল্ডার" : "No-Code Website & Online Store"}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-em-100 text-em-700">1-Click Live</span>
          </div>
          <p className="text-nv-500 text-xs sm:text-sm mt-0.5">
            {isBn ? "কোনো কোডিং জ্ঞান ছাড়াই কয়েক মিনিটে নিজের দোকানের আধুনিক ই-কমার্স ওয়েবসাইট তৈরি করুন" : "Create and publish a professional mobile-first e-commerce store with zero coding in minutes"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 self-start sm:self-auto">
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => {
              e.preventDefault();
              toast({ type: "info", title: isBn ? "লাইভ প্রিভিউ সক্রিয়!" : "Live Storefront!", message: `${publicUrl} is active with POS integration.` });
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-nv-200 rounded-xl text-xs sm:text-sm font-semibold text-nv-700 bg-white hover:bg-nv-50 transition-fast shadow-2xs"
          >
            <Globe size={14} className="text-em-700" />
            <span className="font-mono">{subdomain}.sayhpro.com</span>
            <ExternalLink size={12} />
          </a>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-em-700 hover:bg-em-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-fast"
          >
            <Save size={16} />
            <span>{isBn ? "পরিবর্তন সংরক্ষণ করুন" : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* Main Builder Grid: Editor Sidebar + Live Interactive Device Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Controls Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-nv-200 space-y-5">
          {/* Sub-tabs */}
          <div className="flex gap-2 border-b border-nv-200 pb-2">
            {[
              { id: "design" as const, label: "Design & Theme", labelBn: "ডিজাইন ও থিম", icon: Palette },
              { id: "content" as const, label: "Content & Copy", labelBn: "লেখা ও ব্যানার", icon: MessageCircle },
              { id: "settings" as const, label: "Store Controls", labelBn: "সেটিংস", icon: Settings },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-fast
                  ${activeTab === t.id ? "bg-nv-900 text-white" : "bg-nv-100 text-nv-700 hover:bg-nv-200"}`}
              >
                <t.icon size={13} />
                <span>{isBn ? t.labelBn : t.label}</span>
              </button>
            ))}
          </div>

          {/* TAB 1: DESIGN */}
          {activeTab === "design" && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-nv-700 mb-1.5">{isBn ? "ব্র্যান্ড থিম কালার" : "Theme Color Palette"}</label>
                <div className="flex gap-2.5">
                  {colorThemes.map(ct => (
                    <button
                      key={ct.color}
                      onClick={() => setThemeColor(ct.color)}
                      style={{ backgroundColor: ct.color }}
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white transition-transform
                        ${themeColor === ct.color ? "scale-110 ring-2 ring-offset-2 ring-nv-900" : "hover:scale-105"}`}
                    >
                      {themeColor === ct.color && <Check size={14} className="stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-nv-700 mb-1">{isBn ? "স্টোর সাবডোমেন" : "Store URL Subdomain"} *</label>
                <div className="flex items-center border border-nv-200 rounded-xl px-3 py-2 bg-nv-50 focus-within:border-em-500 focus-within:bg-white">
                  <span className="text-nv-400 text-xs mr-1">https://</span>
                  <input
                    type="text"
                    value={subdomain}
                    onChange={e => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    className="bg-transparent font-bold text-nv-900 text-xs flex-1 outline-none"
                  />
                  <span className="text-nv-400 text-xs">.sayhpro.com</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-nv-700 mb-1">{isBn ? "অ্যানাউন্সমেন্ট বার নোটিশ" : "Top Announcement Ticker"}</label>
                <input
                  type="text"
                  value={isBn ? announcementBn : announcement}
                  onChange={e => isBn ? setAnnouncementBn(e.target.value) : setAnnouncement(e.target.value)}
                  placeholder="e.g. Free Home Delivery on all orders above ৳1000!"
                  className="w-full border border-nv-200 rounded-xl px-3 py-2"
                />
              </div>
            </div>
          )}

          {/* TAB 2: CONTENT */}
          {activeTab === "content" && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-nv-700 mb-1">{isBn ? "হেডলাইন (ইংরেজি)" : "Hero Headline (English)"}</label>
                <input
                  type="text"
                  value={headline}
                  onChange={e => setHeadline(e.target.value)}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-nv-700 mb-1">{isBn ? "হেডলাইন (বাংলা)" : "Hero Headline (Bangla)"}</label>
                <input
                  type="text"
                  value={headlineBn}
                  onChange={e => setHeadlineBn(e.target.value)}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 font-bn"
                />
              </div>

              <div>
                <label className="block font-semibold text-nv-700 mb-1">{isBn ? "সাব-হেডিং বিবরণ" : "Sub-headline Description"}</label>
                <textarea
                  rows={2}
                  value={isBn ? subheadlineBn : subheadline}
                  onChange={e => isBn ? setSubheadlineBn(e.target.value) : setSubheadline(e.target.value)}
                  className="w-full border border-nv-200 rounded-xl p-3"
                />
              </div>
            </div>
          )}

          {/* TAB 3: SETTINGS */}
          {activeTab === "settings" && (
            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between p-3 bg-nv-50 rounded-2xl">
                <div>
                  <div className="font-bold text-nv-900">{isBn ? "১-ক্লিক হোয়াটসঅ্যাপ অর্ডার বাটন" : "1-Click WhatsApp Ordering"}</div>
                  <span className="text-xs text-nv-500">{isBn ? "গ্রাহক সরাসরি হোয়াটসঅ্যাপে অর্ডার পাঠাতে পারবে" : "Direct customer order chat"}</span>
                </div>
                <input
                  type="checkbox"
                  checked={showWhatsApp}
                  onChange={e => setShowWhatsApp(e.target.checked)}
                  className="w-5 h-5 accent-em-600 rounded"
                />
              </div>

              {showWhatsApp && (
                <div>
                  <label className="block font-semibold text-nv-700 mb-1">{isBn ? "হোয়াটসঅ্যাপ নম্বর" : "WhatsApp Number"}</label>
                  <input
                    type="text"
                    value={whatsAppNumber}
                    onChange={e => setWhatsAppNumber(e.target.value)}
                    className="w-full border border-nv-200 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-nv-50 rounded-2xl">
                <div>
                  <div className="font-bold text-nv-900">{isBn ? "ক্যাশ অন ডেলিভারি (COD)" : "Cash On Delivery (COD)"}</div>
                  <span className="text-xs text-nv-500">{isBn ? "পণ্য হাতে পেয়ে মূল্য পরিশোধ" : "Enable COD checkout"}</span>
                </div>
                <input
                  type="checkbox"
                  checked={allowCOD}
                  onChange={e => setAllowCOD(e.target.checked)}
                  className="w-5 h-5 accent-em-600 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-nv-50 rounded-2xl">
                <div>
                  <div className="font-bold text-nv-900">{isBn ? "গ্রাহক রিভিউ ও রেটিং" : "Customer Reviews"}</div>
                  <span className="text-xs text-nv-500">{isBn ? "ওয়েবসাইটে স্টার রেটিং প্রদর্শন" : "Show social proof rating"}</span>
                </div>
                <input
                  type="checkbox"
                  checked={showReviews}
                  onChange={e => setShowReviews(e.target.checked)}
                  className="w-5 h-5 accent-em-600 rounded"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleSave}
              className="w-full py-3 bg-em-700 hover:bg-em-800 text-white rounded-2xl font-bold text-sm shadow-md transition-fast flex items-center justify-center gap-2"
            >
              <Save size={16} />
              <span>{isBn ? "ওয়েবসাইট আপডেট ও প্রকাশ করুন" : "Publish Live Website"}</span>
            </button>
          </div>
        </div>

        {/* Live Device Preview Frame (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          {/* Device Toggle */}
          <div className="inline-flex p-1 bg-white border border-nv-200 rounded-2xl mb-4 shadow-2xs">
            <button
              onClick={() => setViewDevice("mobile")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-fast
                ${viewDevice === "mobile" ? "bg-nv-900 text-white" : "text-nv-600 hover:bg-nv-100"}`}
            >
              <Smartphone size={14} /> Mobile View
            </button>
            <button
              onClick={() => setViewDevice("desktop")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-fast
                ${viewDevice === "desktop" ? "bg-nv-900 text-white" : "text-nv-600 hover:bg-nv-100"}`}
            >
              <Monitor size={14} /> Desktop View
            </button>
          </div>

          {/* Interactive Mockup Container */}
          <div
            className={`transition-all duration-300 rounded-[2.5rem] border-[6px] border-nv-800 bg-white shadow-2xl overflow-hidden flex flex-col
              ${viewDevice === "mobile" ? "w-full max-w-[360px] h-[640px]" : "w-full max-w-[650px] h-[640px]"}`}
          >
            {/* Top Bar / Notch */}
            <div className="bg-nv-900 text-white px-4 py-2 flex items-center justify-between text-[11px] font-mono">
              <span className="truncate">{subdomain}.sayhpro.com</span>
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>LIVE</span>
              </div>
            </div>

            {/* Simulated Live Storefront Body */}
            <div className="flex-1 overflow-y-auto select-none bg-nv-50/60 text-nv-900 text-left">
              {/* Announcement Bar */}
              <div style={{ backgroundColor: themeColor }} className="text-white text-[10px] font-bold text-center py-1.5 px-3">
                {isBn ? announcementBn : announcement}
              </div>

              {/* Store Navbar */}
              <div className="bg-white border-b border-nv-200 px-4 py-3 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <div style={{ backgroundColor: themeColor }} className="w-8 h-8 rounded-xl text-white font-extrabold flex items-center justify-center text-xs shadow-xs">
                    {storefront.logo}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs leading-none">{settings.shopName}</h4>
                    <span className="text-[9px] text-nv-400 font-medium">Verified Store</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-nv-100 p-1.5 rounded-full"><ShoppingBag size={14} /></span>
                </div>
              </div>

              {/* Hero Banner */}
              <div style={{ background: `linear-gradient(135deg, ${themeColor}, #0f172a)` }} className="p-5 text-white space-y-2">
                <span className="text-[10px] uppercase tracking-wider font-extrabold bg-white/20 px-2 py-0.5 rounded-full">
                  ONLINE STORE
                </span>
                <h3 className="font-display font-extrabold text-sm sm:text-base leading-tight">
                  {isBn ? headlineBn : headline}
                </h3>
                <p className="text-[10px] text-white/80 leading-relaxed">
                  {isBn ? subheadlineBn : subheadline}
                </p>
              </div>

              {/* Catalog Section */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-nv-900">{isBn ? "সেরা পণ্যসমূহ" : "Featured Products"}</h4>
                  <span className="text-[10px] text-nv-500">{tNum(products.length)} items</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {products.slice(0, 4).map(p => (
                    <div key={p.id} className="bg-white rounded-2xl p-2.5 border border-nv-200 shadow-2xs flex flex-col justify-between">
                      <div className="w-full h-16 rounded-xl bg-nv-50 flex items-center justify-center text-2xl mb-1.5">
                        {p.image}
                      </div>
                      <div className="font-bold text-[11px] text-nv-900 line-clamp-1">{isBn ? p.nameBn : p.name}</div>
                      <div className="text-[10px] font-extrabold text-em-700 mt-1">{formatTaka(p.sellPrice)}</div>
                      <button
                        onClick={() => toast({ type: "success", title: "Order Added!", message: `${p.name} added to online cart.` })}
                        style={{ backgroundColor: themeColor }}
                        className="w-full py-1 text-white text-[10px] font-bold rounded-lg mt-2 transition-transform active:scale-95"
                      >
                        {isBn ? "অর্ডার করুন" : "Order Now"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* WhatsApp Floating Pill in Preview */}
              {showWhatsApp && (
                <div className="p-4 pt-0">
                  <div className="bg-emerald-600 text-white rounded-2xl p-2.5 flex items-center justify-between text-xs shadow-md">
                    <div className="flex items-center gap-2">
                      <MessageCircle size={16} />
                      <span className="font-bold text-[11px]">Chat on WhatsApp</span>
                    </div>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">{whatsAppNumber}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
