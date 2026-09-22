import { useState } from "react";
import {
  Globe, Smartphone, Monitor, ExternalLink, QrCode, Sparkles,
  Save, Eye, ShoppingBag, MessageCircle, Check, Copy, Palette,
  Settings, ChevronRight, Share2, Plus, ArrowRight, X, Minus,
  Trash2, Star, ShieldCheck, Truck, CreditCard, Lock, CheckCircle
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
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [cart, setCart] = useState<{ id: number; name: string; nameBn?: string; price: number; qty: number; image: string }[]>([]);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bkash">("cod");

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

  const addToCart = (product: typeof products[0]) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { id: product.id, name: product.name, nameBn: product.nameBn, price: product.sellPrice, qty: 1, image: product.image || "📦" }];
    });
    toast({
      type: "success",
      title: isBn ? "কার্টে Ka ho হয়েছে!" : "Added to Cart!",
      message: `${isBn ? product.nameBn || product.name : product.name} ${isBn ? "কার্টে যুক্ত হয়েছে।" : "added to cart."}`,
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

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
    { name: "Brand Green", color: "#16A34A" },
    { name: "Amber", color: "#D97706" },
    { name: "Deep Green", color: "#166534" },
    { name: "Slate", color: "#334155" },
    { name: "Midnight", color: "#0F172A" },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 pb-28 lg:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
        <div className="min-w-0">
          <h1 className="font-display text-xl sm:text-2xl font-bold text-ink">{isBn ? "আপনার স্টোর চালু করুন" : "Launch Your Store"}</h1>
          <p className="text-ink/70 text-xs sm:text-sm mt-0.5">
            {isBn ? "কোডিং ছাড়াই সহজে আপনার Intanɛte Dukan তৈরি ও চালু করুন।" : "Publish your online store in minutes with zero coding."}
          </p>
        </div>

        <div className="ml-auto sm:ml-0 flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setScreen("storefront")}
            className="flex items-center gap-1.5 px-4 py-2 bg-em-600 hover:bg-em-700 active:bg-em-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            <Eye size={15} />
            <span>{isBn ? "অভ্যন্তরীণ প্রিভিউ" : "In-App Preview"}</span>
          </button>
          <button
            onClick={() => {
              const liveUrl = `${window.location.origin}/?screen=storefront`;
              window.open(liveUrl, "_blank");
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-em-300 bg-em-50 hover:bg-em-100 rounded-xl text-xs sm:text-sm font-bold text-em-800 transition-fast shadow-2xs whitespace-nowrap cursor-pointer"
            title={isBn ? "আসল ব্রাউজারে কাস্টমার স্টোর খুলুন (External Browser)" : "Open Live Storefront in Real Browser"}
          >
            <Globe size={14} className="text-em-700" />
            <span className="font-mono text-xs">{subdomain}.sayhpro.com</span>
            <ExternalLink size={12} />
          </button>
          <button
            onClick={() => {
              const liveUrl = `${window.location.origin}/?screen=storefront`;
              navigator.clipboard.writeText(liveUrl);
              toast({
                type: "success",
                title: isBn ? "কাস্টমার স্টোর লিংক কপি হয়েছে!" : "Storefront Link Copied!",
                message: liveUrl,
              });
            }}
            className="flex items-center gap-1.5 px-3 py-2 border border-nv-200 bg-white hover:bg-nv-50 rounded-xl text-xs sm:text-sm font-semibold text-ink transition-fast shadow-2xs cursor-pointer"
            title={isBn ? "কাস্টমারদের সাথে শেয়ার করতে লিংক কপি করুন" : "Copy Customer Store Link"}
          >
            <Copy size={13} />
            <span>{isBn ? "কপি লিংক" : "Copy Link"}</span>
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
              { id: "settings" as const, label: "Store Controls", labelBn: "Nhyehyɛeɛ", icon: Settings },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-fast
                  ${activeTab === t.id ? "bg-nv-900 text-white" : "bg-nv-100 text-ink hover:bg-nv-200"}`}
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
                <label className="block font-semibold text-ink mb-1.5">{isBn ? "ব্র্যান্ড থিম Ɔkyenaার" : "Theme Color Palette"}</label>
                <div className="flex gap-2.5">
                  {colorThemes.map(ct => (
                    <button
                      key={ct.color}
                      onClick={() => setThemeColor(ct.color)}
                      style={{ backgroundColor: ct.color }}
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white transition-transform
                        ${themeColor === ct.color ? "scale-110 ring-2 ring-offset-2 ring-nv-900" : ""}`}
                    >
                      {themeColor === ct.color && <Check size={14} className="stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">{isBn ? "স্টোর সাবডোমেন" : "Store URL Subdomain"} *</label>
                <div className="flex items-center border border-nv-200 rounded-xl px-3 py-2 bg-nv-50 focus-within:border-em-500 focus-within:bg-white">
                  <span className="text-ink text-xs mr-1">https://</span>
                  <input
                    type="text"
                    value={subdomain}
                    onChange={e => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    className="bg-transparent font-bold text-ink text-xs flex-1 outline-none"
                  />
                  <span className="text-ink text-xs">.sayhpro.com</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">{isBn ? "অ্যানাউন্সমেন্ট বার নোটিশ" : "Top Announcement Ticker"}</label>
                <input
                  type="text"
                  value={isBn ? announcementBn : announcement}
                  onChange={e => isBn ? setAnnouncementBn(e.target.value) : setAnnouncement(e.target.value)}
                  placeholder="e.g. Free Home Delivery on all orders above ₵ 100!"
                  className="w-full border border-nv-200 rounded-xl px-3 py-2"
                />
              </div>
            </div>
          )}

          {/* TAB 2: CONTENT */}
          {activeTab === "content" && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-ink mb-1">{isBn ? "হেডলাইন (ইংরেজি)" : "Hero Headline (English)"}</label>
                <input
                  type="text"
                  value={headline}
                  onChange={e => setHeadline(e.target.value)}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">{isBn ? "হেডলাইন (Twi (Akan))" : "Hero Headline (Bangla)"}</label>
                <input
                  type="text"
                  value={headlineBn}
                  onChange={e => setHeadlineBn(e.target.value)}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 font-bn"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">{isBn ? "সাব-হেডিং বিবরণ" : "Sub-headline Description"}</label>
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
                  <div className="font-bold text-ink">{isBn ? "১-ক্লিক হোয়াটসঅ্যাপ অর্ডার বাটন" : "1-Click WhatsApp Ordering"}</div>
                  <span className="text-xs text-ink">{isBn ? "Otɔfoɔ সরাসরি হোয়াটসঅ্যাপে অর্ডার পাঠাতে পারবে" : "Direct customer order chat"}</span>
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
                  <label className="block font-semibold text-ink mb-1">{isBn ? "হোয়াটসঅ্যাপ নম্বর" : "WhatsApp Number"}</label>
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
                  <div className="font-bold text-ink">{isBn ? "Sika (Cash) অন Delivery (COD)" : "Cash On Delivery (COD)"}</div>
                  <span className="text-xs text-ink">{isBn ? "Nnoɔma হাতে পেয়ে মূল্য পরিশোধ" : "Enable COD checkout"}</span>
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
                  <div className="font-bold text-ink">{isBn ? "Otɔfoɔ রিভিউ ও রেটিং" : "Customer Reviews"}</div>
                  <span className="text-xs text-ink">{isBn ? "ওয়েবসাইটে স্টার রেটিং প্রদর্শন" : "Show social proof rating"}</span>
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
              <span>{isBn ? "ওয়েবসাইট আপডেট ও Pae Mu Kyerɛ (Publish)" : "Publish Live Website"}</span>
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
                ${viewDevice === "mobile" ? "bg-nv-900 text-white" : "text-ink hover:bg-nv-100"}`}
            >
              <Smartphone size={14} /> Mobile View
            </button>
            <button
              onClick={() => setViewDevice("desktop")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-fast
                ${viewDevice === "desktop" ? "bg-nv-900 text-white" : "text-ink hover:bg-nv-100"}`}
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
                <span className="w-2 h-2 rounded-full bg-em-400" />
                <span>LIVE</span>
              </div>
            </div>

            {/* Simulated Live Storefront Body */}
            <div className="flex-1 overflow-y-auto select-none bg-nv-50/60 text-ink text-left">
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
                    <span className="text-[9px] text-ink font-medium">Verified Store</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-nv-100 p-1.5 rounded-full"><ShoppingBag size={14} /></span>
                </div>
              </div>

              {/* Hero Banner */}
              <div style={{ background: `${themeColor}` }} className="p-5 text-white space-y-2">
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
                  <h4 className="font-bold text-xs text-ink">{isBn ? "সেরা Nnoɔmaসমূহ" : "Featured Products"}</h4>
                  <span className="text-[10px] text-ink">{tNum(products.length)} items</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {products.slice(0, 4).map(p => (
                    <div key={p.id} className="bg-white rounded-2xl p-2.5 border border-nv-200 shadow-2xs flex flex-col justify-between">
                      <div className="w-full h-16 rounded-xl bg-nv-50 flex items-center justify-center text-2xl mb-1.5">
                        {p.image}
                      </div>
                      <div className="font-bold text-[11px] text-ink line-clamp-1">{isBn ? p.nameBn : p.name}</div>
                      <div className="text-[10px] font-extrabold text-ink mt-1">{formatTaka(p.sellPrice)}</div>
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
                  <div className="bg-em-600 text-white rounded-2xl p-2.5 flex items-center justify-between text-xs shadow-md">
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
      {/* ========================================================================= */}
      {/* FULL-SCREEN LIVE CUSTOMER STOREFRONT PREVIEW MODAL                        */}
      {/* ========================================================================= */}
      {showLiveModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-nv-300">
            {/* Browser Address Bar Header */}
            <div className="bg-nv-900 text-white px-4 py-3 flex items-center justify-between gap-3 border-b border-nv-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
              </div>

              {/* URL address pill */}
              <div className="flex-1 max-w-lg bg-nv-800 border border-nv-700 rounded-full px-4 py-1.5 flex items-center justify-center gap-2 text-xs font-mono text-nv-200">
                <Lock size={12} className="text-em-400" />
                <span className="text-white font-semibold">https://{subdomain}.sayhpro.com</span>
                <span className="px-2 py-0.2 bg-em-600/30 text-em-300 rounded-full text-[10px] font-bold">LIVE STORE</span>
              </div>

              <button
                onClick={() => setShowLiveModal(false)}
                className="w-8 h-8 rounded-full bg-nv-800 hover:bg-nv-700 text-white flex items-center justify-center transition-colors cursor-pointer"
                title={isBn ? "To Mu" : "Close Preview"}
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Live Customer Storefront Body */}
            <div className="flex-1 overflow-y-auto bg-nv-50/50 relative">
              {/* 1. Announcement Bar */}
              <div
                style={{ backgroundColor: themeColor }}
                className="text-white text-xs font-bold text-center py-2 px-4 shadow-xs flex items-center justify-center gap-2"
              >
                <span>{isBn ? announcementBn || announcement : announcement}</span>
              </div>

              {/* 2. Customer Navigation Header */}
              <header className="bg-white border-b border-nv-200 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div
                    style={{ backgroundColor: themeColor }}
                    className="w-10 h-10 rounded-2xl text-white font-extrabold flex items-center justify-center text-sm shadow-sm"
                  >
                    {storefront.logo || settings.shopName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="font-display font-bold text-sm sm:text-base text-ink leading-none">
                        {settings.shopName}
                      </h2>
                      <span className="inline-flex items-center gap-0.5 text-[10px] bg-em-50 text-em-800 font-bold px-1.5 py-0.5 rounded-full">
                        <ShieldCheck size={11} className="text-em-600" />
                        <span>Verified</span>
                      </span>
                    </div>
                    <span className="text-[11px] text-ink/60">
                      {isBn ? "বিশ্বস্ত Intanɛte শপ" : "Trusted Online Store"} • {settings.phone}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setShowCheckoutModal(true)}
                    className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl border border-nv-200 bg-nv-50 hover:bg-nv-100 text-ink font-bold text-xs transition-colors cursor-pointer"
                  >
                    <ShoppingBag size={17} className="text-ink" />
                    <span className="hidden sm:inline">{isBn ? "কার্ট" : "Cart"}</span>
                    {cartCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-em-600 text-white text-[10px] font-extrabold flex items-center justify-center">
                        {tNum(cartCount)}
                      </span>
                    )}
                  </button>
                </div>
              </header>

              {/* 3. Hero Section */}
              <div
                style={{ backgroundColor: themeColor }}
                className="px-5 py-8 sm:py-12 text-white space-y-3 relative overflow-hidden"
              >
                <div className="inline-block text-[11px] uppercase tracking-wider font-extrabold bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full">
                  {isBn ? "অফিসিয়াল Intanɛte Dukan" : "OFFICIAL ONLINE STORE"}
                </div>
                <h1 className="font-display font-extrabold text-xl sm:text-3xl leading-tight max-w-xl">
                  {isBn ? headlineBn || headline : headline}
                </h1>
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-lg">
                  {isBn ? subheadlineBn || subheadline : subheadline}
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <a
                    href="#products-section"
                    className="px-5 py-2.5 bg-white text-ink hover:bg-nv-50 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all inline-flex items-center gap-1.5"
                  >
                    <span>{isBn ? "এখনই কেনাকাটা করুন" : "Shop Featured Items"}</span>
                    <ArrowRight size={14} />
                  </a>
                </div>
              </div>

              {/* 4. Trust Pillars Strip */}
              <div className="bg-white border-b border-nv-200 px-4 py-3 grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-ink">
                <div className="flex items-center justify-center gap-1.5">
                  <Truck size={15} className="text-em-600" />
                  <span>{isBn ? "দ্রুত Delivery" : "Fast Delivery"}</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 border-x border-nv-100">
                  <CreditCard size={15} className="text-em-600" />
                  <span>{isBn ? "Sika (Cash) অন Delivery" : "Cash on Delivery"}</span>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <ShieldCheck size={15} className="text-em-600" />
                  <span>{isBn ? "১০০% খাঁnnoɔma" : "Authentic Goods"}</span>
                </div>
              </div>

              {/* 5. Product Catalog Grid */}
              <div id="products-section" className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-base sm:text-lg text-ink">
                      {isBn ? "আমাদের সেরা Nnoɔmaসমূহ" : "Featured Products"}
                    </h3>
                    <p className="text-xs text-ink/60">
                      {isBn ? "তাজা ও নির্ভরKa ho্য Nnoɔma সরাসরি আপনার ঠিকানায়" : "Quality items delivered straight to your door"}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-ink/70 bg-white px-2.5 py-1 rounded-lg border border-nv-200">
                    {tNum(products.length)} {isBn ? "nnoɔma" : "items"}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                  {products.map(p => (
                    <div
                      key={p.id}
                      className="bg-white rounded-2xl p-3 border border-nv-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="w-full h-28 rounded-xl bg-nv-50 flex items-center justify-center text-4xl mb-2.5 group-hover:scale-105 transition-transform">
                          {p.image}
                        </div>
                        <div className="font-bold text-xs sm:text-sm text-ink line-clamp-1">
                          {isBn ? p.nameBn || p.name : p.name}
                        </div>
                        <div className="text-[11px] text-ink/60 mt-0.5">
                          {isBn ? (p.unit === "Piece" ? "১ Pcs" : p.unit === "KG" ? "১ kg" : p.unit === "Liter" ? "১ L" : p.unit) : `1 ${p.unit}`}
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-nv-100 flex items-center justify-between gap-2">
                        <div className="num font-extrabold text-sm sm:text-base text-ink">
                          {formatTaka(p.sellPrice)}
                        </div>
                        <button
                          onClick={() => addToCart(p)}
                          style={{ backgroundColor: themeColor }}
                          className="px-3 py-1.5 text-white text-xs font-bold rounded-xl transition-transform active:scale-95 shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <Plus size={13} />
                          <span>{isBn ? "অর্ডার" : "Add"}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. Customer Reviews & Ratings */}
              {showReviews && (
                <div className="px-4 sm:px-6 py-6 bg-white border-t border-nv-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display font-bold text-sm sm:text-base text-ink">
                        {isBn ? "Otɔfoɔ সন্তুষ্টি ও রিভিউ" : "Customer Reviews & Ratings"}
                      </h4>
                      <p className="text-xs text-ink/60">
                        {isBn ? "১২০+ সন্তুষ্ট Otɔfoɔদের মতামত" : "Based on verified customer orders"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full text-xs font-extrabold">
                      <Star size={14} className="fill-amber-500 text-amber-500" />
                      <span>৪.৯ / ৫.০</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { name: isBn ? "তানভীর হোসেন" : "Tanvir Hossain", comment: isBn ? "Nnoɔma একদম খাঁটি ও দ্রুত Fie (Home) Delivery পেয়েছি!" : "Fast delivery and authentic goods!", time: "2 days ago" },
                      { name: isBn ? "নুসরাত জাহান" : "Nusrat Jahan", comment: isBn ? "Dukanদার খুব আন্তরিক এবং Sika (Cash) অন Delivery সুবিধা চমৎকার।" : "Courteous merchant & convenient COD.", time: "4 days ago" },
                      { name: isBn ? "রফিকুল ইসলাম" : "Rafiqul Islam", comment: isBn ? "হোয়াটসঅ্যাপে অর্ডার করেই দ্রুত নিশ্চিত হয়েছে।" : "Smooth 1-click WhatsApp order experience!", time: "1 week ago" },
                    ].map((r, idx) => (
                      <div key={idx} className="p-3 bg-nv-50 rounded-xl border border-nv-200/80 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-ink">{r.name}</span>
                          <span className="text-[10px] text-ink/50">{r.time}</span>
                        </div>
                        <div className="flex text-amber-500 text-[10px]">★★★★★</div>
                        <p className="text-xs text-ink/70 leading-relaxed">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. Store Footer */}
              <footer className="bg-nv-900 text-white px-4 sm:px-6 py-8 space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-nv-800 pb-6">
                  <div className="flex items-center gap-3">
                    <div
                      style={{ backgroundColor: themeColor }}
                      className="w-10 h-10 rounded-2xl text-white font-extrabold flex items-center justify-center text-sm"
                    >
                      {storefront.logo || settings.shopName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{settings.shopName}</h4>
                      <p className="text-xs text-nv-300">{settings.address || "Accra, Ghana"}</p>
                    </div>
                  </div>

                  <div className="text-center sm:text-right text-xs text-nv-300 space-y-1">
                    <div>{isBn ? "Customer Support" : "Customer Support"}: {whatsAppNumber || settings.phone}</div>
                    <div>{isBn ? "Cash on Delivery & Courier Shipping" : "Cash on Delivery & Courier Shipping"}</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-nv-400">
                  <span>© 2026 {settings.shopName}. Powered by SAYHPro.</span>
                  <div className="flex items-center gap-3">
                    <span>MTN MoMo</span>
                    <span>•</span>
                    <span>Telecel Cash</span>
                    <span>•</span>
                    <span>GhQR / Card</span>
                    <span>•</span>
                    <span>Cash on Delivery</span>
                  </div>
                </div>
              </footer>

              {/* Floating WhatsApp Chat Pill */}
              {showWhatsApp && (
                <div className="sticky bottom-4 right-4 flex justify-end px-4 pointer-events-none z-40">
                  <a
                    href={`https://wa.me/${whatsAppNumber.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => {
                      e.preventDefault();
                      toast({
                        type: "success",
                        title: "WhatsApp Chat Triggered!",
                        message: `Connecting to merchant WhatsApp: ${whatsAppNumber}`,
                      });
                    }}
                    className="pointer-events-auto flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white px-4 py-2.5 rounded-full shadow-lg font-bold text-xs transition-transform active:scale-95"
                  >
                    <MessageCircle size={18} />
                    <span>{isBn ? "হোয়াটসঅ্যাপে অর্ডার করুন" : "Chat on WhatsApp"}</span>
                  </a>
                </div>
              )}

              {/* Floating Bottom Cart Bar */}
              {cartCount > 0 && (
                <div className="sticky bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-nv-200 shadow-xl flex items-center justify-between gap-3 z-40">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-em-100 text-em-800 flex items-center justify-center font-bold text-xs">
                      {tNum(cartCount)}
                    </div>
                    <div>
                      <div className="text-xs text-ink/60">{isBn ? "Nyinaa বিল" : "Cart Total"}</div>
                      <div className="num font-extrabold text-sm text-ink">{formatTaka(cartTotal)}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowCheckoutModal(true)}
                    style={{ backgroundColor: themeColor }}
                    className="px-5 py-2.5 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                  >
                    <span>{isBn ? "অর্ডার সম্পন্ন করুন" : "Proceed to Checkout"}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Drawer / Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-nv-100">
              <h3 className="font-display font-bold text-base text-ink">
                {isBn ? "চেকআউট ও Delivery তথ্য" : "Checkout & Delivery"}
              </h3>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="w-8 h-8 rounded-full bg-nv-100 flex items-center justify-center text-ink hover:bg-nv-200"
              >
                <X size={16} />
              </button>
            </div>

            {/* Cart Items Summary */}
            <div className="space-y-2 max-h-40 overflow-y-auto divide-y divide-nv-100">
              {cart.map(item => (
                <div key={item.id} className="pt-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg">{item.image}</span>
                    <span className="font-semibold text-ink truncate">{isBn ? item.nameBn || item.name : item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-ink/60">× {tNum(item.qty)}</span>
                    <span className="num font-bold text-ink">{formatTaka(item.price * item.qty)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="p-3 bg-nv-50 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between text-ink/70">
                <span>{isBn ? "Nnoɔma Nyinaa মূল্য" : "Subtotal"}</span>
                <span className="num font-bold">{formatTaka(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-ink/70">
                <span>{isBn ? "Fie (Home) Delivery চার্জ" : "Delivery Charge"}</span>
                <span className="font-bold text-em-700">{isBn ? "ফ্রি" : "Free"}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-ink pt-1.5 border-t border-nv-200">
                <span>{isBn ? "সর্বNyinaa প্রদেয়" : "Grand Total"}</span>
                <span className="num text-em-700">{formatTaka(cartTotal)}</span>
              </div>
            </div>

            {/* Customer Inputs */}
            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block font-semibold text-ink mb-1">{isBn ? "আপনার নাম" : "Full Name"} *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder={isBn ? "যেমন: তানভীর আহমেদ" : "e.g. Tanvir Ahmed"}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">{isBn ? "মোবাইল নম্বর" : "Mobile Phone"} *</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">{isBn ? "Delivery ঠিকানা" : "Delivery Address"} *</label>
                <textarea
                  rows={2}
                  value={customerAddress}
                  onChange={e => setCustomerAddress(e.target.value)}
                  placeholder={isBn ? "বাসা নং, রোড নং, এলাকা, জেলা" : "House, road, area, district"}
                  className="w-full border border-nv-200 rounded-xl p-2.5 text-xs"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block font-semibold text-ink mb-1">{isBn ? "পেমেন্ট পদ্ধতি" : "Payment Method"}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cod")}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === "cod" ? "border-em-600 bg-em-50 text-em-900 font-bold" : "border-nv-200 text-ink"
                    }`}
                  >
                    💵 {isBn ? "Sika (Cash) অন Delivery" : "Cash on Delivery"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("bkash")}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === "bkash" ? "border-em-600 bg-em-50 text-em-900 font-bold" : "border-nv-200 text-ink"
                    }`}
                  >
                    📱 {isBn ? "MTN MoMo / Online" : "MTN MoMo / Online"}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (!customerName || !customerPhone || !customerAddress) {
                  toast({
                    type: "warning",
                    title: isBn ? "তথ্য অসম্পূর্ণ" : "Missing Details",
                    message: isBn ? "অনুগ্রহ করে আপনার নাম, ফোন নম্বর ও ঠিকানা পূরণ করুন।" : "Please enter your name, phone and address.",
                  });
                  return;
                }
                toast({
                  type: "success",
                  title: isBn ? "🎉 অর্ডার সফল হয়েছে!" : "🎉 Order Placed Successfully!",
                  message: isBn
                    ? `ধন্যবাদ ${customerName}, আপনার অর্ডারটি Dukanে নথিভুক্ত হয়েছে। Deliveryর সময় Ka hoাKa ho করা হবে।`
                    : `Thank you ${customerName}, your order has been received by ${settings.shopName}!`,
                });
                setCart([]);
                setShowCheckoutModal(false);
                setShowLiveModal(false);
              }}
              style={{ backgroundColor: themeColor }}
              className="w-full py-3 text-white rounded-2xl font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle size={16} />
              <span>{isBn ? "অর্ডার নিশ্চিত করুন" : "Confirm Order"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
