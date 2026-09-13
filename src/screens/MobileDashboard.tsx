import { useState, useEffect, useRef } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bell, Headphones, User, ArrowRight, ArrowLeft, X,
  ShoppingCart, ShoppingBag, CreditCard, Boxes, Wallet, Receipt, Package, Users,
  Truck, BarChart2, Home, QrCode, Menu, TrendingUp, TrendingDown,
  Landmark, MessageSquare, Store, Globe2, ShieldAlert, UserCheck, Settings,
  Star, ShieldCheck, MessageCircle, AlertTriangle, Sparkles, ChevronRight,
  FileText, Building2, Camera
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useApp, toBnDigits } from "../context/AppContext";
import BusinessRatingModal from "../components/BusinessRatingModal";
import AIProductScannerModal from "../components/AIProductScannerModal";

interface MobileProps {
  lang: "en" | "bn";
  setScreen: (s: string) => void;
}

interface ServiceItem {
  id: string;
  icon: LucideIcon;
  label: string;
  labelBn: string;
  badge?: number;
}

/** Most recent calendar date present in a list, so "day" means the latest
 *  business day on record rather than a wall-clock date the seed data
 *  never matches. */
const latestDate = <T extends { date: string }>(rows: T[]): number =>
  rows.reduce((max, r) => Math.max(max, new Date(r.date).getTime() || 0), 0);

const sameDay = (date: string, stamp: number) =>
  new Date(date).getTime() === stamp;

const DAY_MS = 24 * 60 * 60 * 1000;
const withinWeek = (date: string, stamp: number) => {
  const t = new Date(date).getTime();
  return t <= stamp && t > stamp - 7 * DAY_MS;
};

export default function MobileDashboard({ lang, setScreen }: MobileProps) {
  const { sales, customers, expenses, products, settings, notifications, tNum, formatTaka } = useApp();
  const isBn = lang === "bn";

  const [period, setPeriod] = useState<"day" | "week" | "month">("day");
  const [showAIScanner, setShowAIScanner] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [moreSubView, setMoreSubView] = useState<"advisory" | "analytics" | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [advisoryTab, setAdvisoryTab] = useState<"urgent" | "soon">("urgent");

  // Promo carousel
  const [promoIndex, setPromoIndex] = useState(0);
  const touchStartXRef = useRef<number | null>(null);

  const unreadNotifs = notifications.filter(n => !n.read).length;

  const expenseDay = latestDate(expenses);
  const periodExpenses =
    period === "day" ? expenses.filter(e => sameDay(e.date, expenseDay)) :
    period === "week" ? expenses.filter(e => withinWeek(e.date, expenseDay)) :
    expenses;

  const income = sales.reduce((sum, s) => sum + s.grandTotal, 0);
  const expense = periodExpenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = income - expense;
  const inProfit = profit >= 0;

  const totalDues = customers.reduce((sum, c) => sum + c.due, 0);
  const dueCount = customers.filter(c => c.due > 0).length;

  // Smart Stock Buy Advisory (Color Coded: কোনটি কেনা উচিত)
  const buyAdvisoryItems = products.map(p => {
    const soldQty = sales.reduce((acc, s) => {
      const item = s.items.find(i => i.name === p.name);
      return acc + (item ? item.qty : 0);
    }, 0) || (p.stock > 0 ? 10 : 25);

    const weeklyRate = Math.max(1, Math.round(soldQty / 4));
    const daysOfStockLeft = weeklyRate > 0 ? Math.round((p.stock / weeklyRate) * 7) : 999;

    let tier: "urgent" | "soon" | "safe" | "slow" = "safe";
    if (p.stock === 0 || p.stock <= p.min) {
      tier = "urgent";
    } else if (p.stock <= p.min * 1.6 || daysOfStockLeft <= 7) {
      tier = "soon";
    } else if (daysOfStockLeft <= 45) {
      tier = "safe";
    } else {
      tier = "slow";
    }

    const suggestedBuyQty = tier === "urgent" ? Math.max(20, p.min * 2 - p.stock) : tier === "soon" ? Math.max(12, Math.round(p.min * 1.5 - p.stock)) : 0;

    return { product: p, tier, weeklyRate, daysOfStockLeft, suggestedBuyQty };
  });

  const urgentAdvisory = buyAdvisoryItems.filter(i => i.tier === "urgent");
  const soonAdvisory = buyAdvisoryItems.filter(i => i.tier === "soon");

  // Analytics helper metrics
  const salesTrendData = [
    { day: "Mon", dayBn: "সোম", sales: 42000, profit: 12000 },
    { day: "Tue", dayBn: "মঙ্গল", sales: 38000, profit: 10500 },
    { day: "Wed", dayBn: "বুধ", sales: 55000, profit: 18000 },
    { day: "Thu", dayBn: "বৃহঃ", sales: 31000, profit: 8900 },
    { day: "Fri", dayBn: "শুক্র", sales: 62000, profit: 21000 },
    { day: "Sat", dayBn: "শনি", sales: 48000, profit: 15400 },
    { day: "Sun", dayBn: "রবি", sales: income || 51200, profit: Math.abs(profit) || 16200 },
  ];

  const categoryAnalytics = [
    { name: isBn ? "মুদি ও খাদ্যপণ্য" : "Grocery & Staples", percent: 45, color: "bg-em-600" },
    { name: isBn ? "প্রসাধন ও স্বাস্থ্য" : "Personal Care", percent: 28, color: "bg-amber-500" },
    { name: isBn ? "দুগ্ধজাত ও পানীয়" : "Dairy & Beverages", percent: 27, color: "bg-ac-600" },
  ];

  const topProducts = products.slice(0, 3).map((p, idx) => ({
    ...p,
    rank: idx + 1,
    soldQty: (idx + 1) * 24 + 18,
    revenue: ((idx + 1) * 24 + 18) * (p.sellPrice || 0),
  }));

  // Core services: The 6 highest-frequency, most critical daily operations for merchants
  const services: ServiceItem[] = [
    { id: "purchases", icon: ShoppingBag, label: "Purchases", labelBn: "ক্রয়" },
    { id: "products", icon: Package, label: "Products", labelBn: "পণ্য তালিকা" },
    { id: "cash", icon: Wallet, label: "Cash Book", labelBn: "হিসাব খাতা" },
    { id: "expenses", icon: Receipt, label: "Expenses", labelBn: "খরচের খাতা" },
    { id: "customers", icon: Users, label: "Customers", labelBn: "গ্রাহক তালিকা" },
    { id: "suppliers", icon: Building2, label: "Suppliers", labelBn: "সাপ্লায়ার" },
  ];

  const moreServices: ServiceItem[] = [
    { id: "advisory", icon: Package, label: "Buy Advisory", labelBn: "কোনটি কেনা উচিত", badge: urgentAdvisory.length > 0 ? urgentAdvisory.length : undefined },
    { id: "analytics", icon: BarChart2, label: "Analytics", labelBn: "অ্যানালিটিক্স" },
    { id: "reports", icon: FileText, label: "Financial Reports", labelBn: "লাভ-ক্ষতি রিপোর্ট" },
    { id: "reports", icon: Landmark, label: "Tax & VAT", labelBn: "কর ও ভ্যাট" },
    { id: "delivery", icon: Truck, label: "Courier Hub", labelBn: "কুরিয়ার" },
    { id: "marketing", icon: MessageSquare, label: "Marketing", labelBn: "মার্কেটিং" },
    { id: "fintech", icon: Landmark, label: "Bank & Loans", labelBn: "ব্যাংক ও লোন" },
    { id: "reselling", icon: Store, label: "Reselling", labelBn: "রিসেলিং" },
    { id: "website", icon: Globe2, label: "Storefront", labelBn: "অনলাইন স্টোর" },
    { id: "alerts", icon: ShieldAlert, label: "Alerts", labelBn: "অ্যালার্ট" },
    { id: "employees", icon: UserCheck, label: "Employees", labelBn: "কর্মচারী" },
    { id: "settings", icon: Settings, label: "Settings", labelBn: "সেটিংস" },
  ];

  const bottomNav: ServiceItem[] = [
    { id: "home", icon: Home, label: "Home", labelBn: "হোম" },
    { id: "pos", icon: ShoppingCart, label: "Sell", labelBn: "বেচা-বিক্রি" },
    { id: "inventory", icon: Boxes, label: "Stock", labelBn: "স্টক" },
    { id: "dues", icon: CreditCard, label: "Dues", labelBn: "দেনা-পে" },
    { id: "more", icon: Menu, label: "More", labelBn: "আরও" },
  ];

  const promoSlides = [
    <button
      key="due-reminder"
      onClick={() => setScreen("dues")}
      className="w-full text-left bg-em-900 rounded-xl px-4 py-4 relative overflow-hidden active:bg-em-950 transition-colors"
    >
      <span
        aria-hidden
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[92px] leading-none font-extrabold text-ac-400 select-none"
      >
        ?
      </span>
      <div className="relative max-w-[66%]">
        <div className="font-display text-[17px] font-semibold text-white leading-snug">
          {isBn ? (
            <>কার কাছে কত <span className="text-ac-300">বাকি</span>,<br />মনে পড়ছে না?</>
          ) : (
            <>Can't recall who <span className="text-ac-300">owes</span> what?</>
          )}
        </div>
        <p className="text-[11px] text-em-200 mt-1.5 leading-snug">
          {isBn
            ? `${tNum(dueCount)} জন গ্রাহকের কাছে মোট ${formatTaka(totalDues)} বাকি আছে।`
            : `${tNum(dueCount)} customers owe you ${formatTaka(totalDues)} in total.`}
        </p>
        <span className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 rounded-lg bg-ac-400 text-ink text-xs font-semibold">
          {isBn ? "বাকির খাতা দেখুন" : "Open due ledger"}
          <ArrowRight size={13} />
        </span>
      </div>
    </button>,

    <div
      key="ad-slot"
      className="w-full bg-nv-50 border-2 border-dashed border-nv-300 rounded-xl px-4 py-4 flex flex-col items-center justify-center gap-1 text-center min-h-[132px]"
    >
      <span className="text-xs font-semibold text-ink">
        {isBn ? "বিজ্ঞাপন / ব্যানার / প্রচার প্রচারণা" : "Ad, banner, or campaign slot"}
      </span>
      <span className="text-[11px] text-ink/70">
        {isBn ? "আপনার অফার বা নতুন পণ্যের খবর এখানে দিন" : "Promote new arrivals or seasonal discounts here"}
      </span>
    </div>,
  ];

  useEffect(() => {
    if (promoSlides.length <= 1) return;
    const id = setInterval(() => {
      setPromoIndex(i => (i + 1) % promoSlides.length);
    }, 5000);
    return () => clearInterval(id);
  }, [promoSlides.length]);

  return (
    <div className="h-screen overflow-hidden bg-white flex flex-col relative select-none">
      {/* Business Rating Modal */}
      <BusinessRatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        lang={lang}
      />

      {/* ---------- Header ---------- */}
      <header className="flex-shrink-0 bg-white border-b border-nv-200 px-4 py-3">
        <div className="flex items-center gap-3">
          {/* User/Profile Avatar on the Left (Replaced RA square) */}
          <button
            onClick={() => setScreen("settings")}
            aria-label={isBn ? "প্রোফাইল সেটিংস" : "Profile Settings"}
            className="w-10 h-10 rounded-full bg-nv-100 flex items-center justify-center text-ink active:scale-95 hover:bg-nv-150 transition-all flex-shrink-0 border border-nv-200 shadow-2xs"
          >
            <User size={20} className="text-ink" />
          </button>

          {/* User Name with Twitter-style Gold Verified Tick */}
          <div className="min-w-0 flex-1 flex items-center gap-1.5">
            <span className="font-display text-[16px] font-bold text-ink truncate leading-tight">
              {settings.ownerName}
            </span>
            {/* Golden Circular Verified Badge */}
            <span
              className="inline-flex items-center justify-center flex-shrink-0"
              title={isBn ? "ভেরিফায়েড অ্যাকাউন্ট" : "Verified Account"}
            >
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] drop-shadow-2xs">
                <circle cx="12" cy="12" r="11" fill="#D97706" />
                <path
                  d="M7.5 12l3.2 3.5 6-6.5"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </span>
          </div>

          {/* 3 Action Icons on the Right */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Messaging Quick Button */}
            <button
              onClick={() => setScreen("messages")}
              aria-label={isBn ? "মেসেজিং" : "Messages"}
              className="relative w-9 h-9 rounded-full flex items-center justify-center text-ink active:bg-nv-100 transition-colors"
            >
              <MessageCircle size={18} />
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-em-600 text-white text-[10px] font-semibold rounded-full flex items-center justify-center shadow-xs">
                {tNum(3)}
              </span>
            </button>

            {/* Support */}
            <button
              onClick={() => setScreen("alerts")}
              aria-label={isBn ? "সহায়তা" : "Support"}
              className="w-9 h-9 rounded-full flex items-center justify-center text-ink active:bg-nv-100 transition-colors"
            >
              <Headphones size={18} />
            </button>

            {/* Notification */}
            <button
              onClick={() => setScreen("notifications")}
              aria-label={isBn ? "বিজ্ঞপ্তি" : "Notifications"}
              className="relative w-9 h-9 rounded-full flex items-center justify-center text-ink active:bg-nv-100 transition-colors"
            >
              <Bell size={18} />
              {unreadNotifs > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-red-600 text-white text-[10px] font-semibold rounded-full flex items-center justify-center shadow-xs">
                  {tNum(unreadNotifs)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-3.5 pb-24 space-y-4 bg-white">
        {/* ---------- Business Rating & Trust Banner (Mobile) ---------- */}
        <div className="bg-gradient-to-r from-amber-50/50 via-white to-em-50/40 rounded-xl border border-amber-200/80 p-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-100/70 border border-amber-300 flex items-center justify-center text-amber-600 flex-shrink-0">
              <Star size={18} className="fill-amber-400 text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-xs text-ink">{isBn ? "ব্যবসায়িক রেটিং:" : "Rating:"}</span>
                <span className="num font-black text-amber-600 text-xs">{tNum(4.9)}/৫</span>
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-ink/60 truncate">
                {isBn ? "৩৮৪ টি রিভিউ • ৯৮.৭% সন্তুষ্ট গ্রাহক" : "384 reviews • 98.7% satisfaction rate"}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowRatingModal(true)}
            className="px-2.5 py-1 bg-white active:bg-nv-100 border border-nv-200 text-ink rounded-lg text-xs font-semibold flex-shrink-0 shadow-2xs"
          >
            {isBn ? "রিভিউ" : "Reviews"} →
          </button>
        </div>

        {/* ---------- Today's update ---------- */}
        <section className="bg-white rounded-xl border border-nv-200">
          <div className="flex items-center justify-between px-4 pt-3.5 pb-3">
            <h2 className="font-display text-[15px] font-semibold text-ink">
              {isBn ? "আপডেট" : "Update"}
            </h2>
            <div className="inline-flex items-center p-0.5 bg-nv-100 border border-nv-200 rounded-lg">
              {[
                { id: "day" as const, label: "Day", labelBn: "দিন" },
                { id: "week" as const, label: "Week", labelBn: "সপ্তাহ" },
                { id: "month" as const, label: "Month", labelBn: "মাস" },
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={`px-3 py-1 rounded-md text-xs transition-colors ${
                    period === p.id
                      ? "bg-white text-ink font-semibold shadow-xs"
                      : "text-ink font-medium"
                  }`}
                >
                  {isBn ? p.labelBn : p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 border-y border-nv-100 divide-x divide-nv-100">
            <button
              onClick={() => setScreen("cash")}
              className="px-3 py-3 text-left hover:bg-nv-50 active:bg-nv-100 transition-colors group cursor-pointer"
            >
              <div className="text-[11px] text-ink mb-1 leading-tight flex items-center justify-between">
                <span>{isBn ? "আজকের আয়" : "Income"}</span>
                <span className="text-[10px] text-ink/40 group-hover:text-ink transition-colors">→</span>
              </div>
              <div className="num text-base font-semibold text-ink">{formatTaka(income)}</div>
            </button>
            <button
              onClick={() => setScreen("expenses")}
              className="px-3 py-3 text-left hover:bg-nv-50 active:bg-nv-100 transition-colors group cursor-pointer"
            >
              <div className="text-[11px] text-ink mb-1 leading-tight flex items-center justify-between">
                <span>{isBn ? "আজকের ব্যয়" : "Expense"}</span>
                <span className="text-[10px] text-ink/40 group-hover:text-ink transition-colors">→</span>
              </div>
              <div className="num text-base font-semibold text-ink">{formatTaka(expense)}</div>
            </button>
            <button
              onClick={() => setScreen("reports")}
              className="px-3 py-3 text-left hover:bg-nv-50 active:bg-nv-100 transition-colors group cursor-pointer"
            >
              <div className="text-[11px] text-ink mb-1 leading-tight flex items-center justify-between">
                <span>{isBn ? "লাভ/ক্ষতি" : "Profit / Loss"}</span>
                <span className="text-[10px] text-ink/40 group-hover:text-ink transition-colors">→</span>
              </div>
              <div
                className={`num text-base font-semibold flex items-center gap-1 ${
                  inProfit ? "text-ink" : "text-ink"
                }`}
              >
                {inProfit ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {formatTaka(Math.abs(profit))}
              </div>
            </button>
          </div>
        </section>

        {/* ---------- Promo carousel ---------- */}
        <div className="relative">
          <div
            className="overflow-hidden rounded-xl"
            onTouchStart={e => { touchStartXRef.current = e.touches[0].clientX; }}
            onTouchEnd={e => {
              if (touchStartXRef.current === null) return;
              const delta = e.changedTouches[0].clientX - touchStartXRef.current;
              const SWIPE_PX = 40;
              if (delta > SWIPE_PX) {
                setPromoIndex(i => (i - 1 + promoSlides.length) % promoSlides.length);
              } else if (delta < -SWIPE_PX) {
                setPromoIndex(i => (i + 1) % promoSlides.length);
              }
              touchStartXRef.current = null;
            }}
          >
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${promoIndex * 100}%)` }}
            >
              {promoSlides.map((slide, i) => (
                <div key={i} className="w-full flex-shrink-0">
                  {slide}
                </div>
              ))}
            </div>
          </div>

          {promoSlides.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-2.5">
              {promoSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPromoIndex(i)}
                  aria-label={`${isBn ? "স্লাইড" : "Slide"} ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === promoIndex ? "w-4 bg-em-700" : "w-1.5 bg-nv-300"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ---------- AI Packet Scanner Quick Banner ---------- */}
        <div
          onClick={() => setShowAIScanner(true)}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-em-900 via-em-800 to-nv-900 text-white flex items-center justify-between cursor-pointer active:scale-98 transition-all shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-em-500 to-ac-400 flex items-center justify-center text-white shadow-inner flex-shrink-0">
              <Camera size={20} />
            </div>
            <div>
              <div className="font-display text-xs sm:text-sm font-bold flex items-center gap-1.5">
                <span>{isBn ? "স্মার্ট এআই প্যাকেট স্ক্যানার" : "Smart AI Packet Scanner"}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-ac-400 text-nv-900 font-extrabold uppercase">
                  {isBn ? "নতুন" : "NEW"}
                </span>
              </div>
              <p className="text-[11px] text-em-200 leading-tight mt-0.5">
                {isBn ? "ক্যামেরা দিয়ে পণ্যের ছবি তুললেই নাম ও দাম সহ সেভ হবে" : "Point camera at any packet to auto-detect & add"}
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
            <Sparkles size={16} className="text-ac-300" />
          </div>
        </div>

        {/* ---------- Services ---------- */}
        <section className="grid grid-cols-3 gap-2 py-1">
          {services.map(s => (
            <button
              key={s.id}
              onClick={() => setScreen(s.id)}
              className="flex flex-col items-center justify-center gap-1.5 py-3 px-1 rounded-2xl active:bg-nv-100/60 active:scale-95 transition-all relative group"
            >
              {s.badge && (
                <span className="absolute top-1 right-3 w-4 h-4 rounded-full bg-em-600 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                  {tNum(s.badge)}
                </span>
              )}
              <div className="w-10 h-10 flex items-center justify-center text-ink group-hover:text-em-700 transition-colors">
                <s.icon size={26} strokeWidth={1.6} />
              </div>
              <span className="text-[12px] font-medium text-ink text-center leading-tight">
                {isBn ? s.labelBn : s.label}
              </span>
            </button>
          ))}
        </section>
      </main>

      {/* ---------- Bottom navigation ---------- */}
      <nav className="flex-shrink-0 bg-white border-t border-nv-200 pb-[env(safe-area-inset-bottom)] relative z-50">
        <div className="flex items-stretch h-16">
          {bottomNav.map(item => {
            const isActive = moreOpen ? item.id === "more" : item.id === "home";
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === "more") {
                    if (moreOpen) {
                      setMoreOpen(false);
                      setMoreSubView(null);
                    } else {
                      setMoreSubView(null);
                      setMoreOpen(true);
                    }
                  } else if (item.id === "home") {
                    if (moreOpen) {
                      setMoreOpen(false);
                      setMoreSubView(null);
                    }
                  } else {
                    if (moreOpen) {
                      setMoreOpen(false);
                      setMoreSubView(null);
                    }
                    setScreen(item.id);
                  }
                }}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 px-1 relative transition-colors ${
                  isActive ? "text-em-700" : "text-ink"
                }`}
              >
                {item.badge && (
                  <span className="absolute top-1.5 right-4 w-3.5 h-3.5 rounded-full bg-em-600 text-white text-[8px] font-bold flex items-center justify-center">
                    {tNum(item.badge)}
                  </span>
                )}
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
                <span
                  className={`text-[10px] leading-tight text-center ${
                    isActive ? "font-extrabold" : "font-semibold"
                  }`}
                >
                  {isBn ? item.labelBn : item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ---------- More sheet ---------- */}
      {moreOpen && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/60 backdrop-blur-2xs pb-[calc(4rem+env(safe-area-inset-bottom,0px))]">
          <button
            className="flex-1"
            aria-label={isBn ? "বন্ধ করুন" : "Close"}
            onClick={() => {
              setMoreOpen(false);
              setMoreSubView(null);
            }}
          />
          <div className="bg-white rounded-t-3xl p-4 sm:p-5 max-h-[calc(85vh-5rem)] overflow-y-auto space-y-3.5 shadow-2xl border-t border-nv-200">
            {/* Header */}
            {moreSubView === null ? (
              <div className="relative flex items-center justify-center pt-0.5 pb-1">
                <div className="w-10 h-1 bg-nv-200 rounded-full" />
                <button
                  onClick={() => {
                    setMoreOpen(false);
                    setMoreSubView(null);
                  }}
                  className="absolute right-0 top-0 w-8 h-8 rounded-full bg-nv-100 flex items-center justify-center text-ink active:bg-nv-200 hover:bg-nv-150 transition-colors"
                  aria-label={isBn ? "বন্ধ করুন" : "Close"}
                >
                  <X size={17} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between pb-2 border-b border-nv-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMoreSubView(null)}
                    className="w-8 h-8 rounded-xl bg-nv-100 flex items-center justify-center text-ink active:bg-nv-200 hover:bg-nv-150 transition-colors"
                    title={isBn ? "সেবা তালিকায় ফিরুন" : "Back to Services"}
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div>
                    <span className="font-display font-semibold text-ink text-base">
                      {moreSubView === "advisory"
                        ? (isBn ? "কোনটি কেনা উচিত" : "Buy Advisory")
                        : (isBn ? "ব্যবসায়িক অ্যানালিটিক্স" : "Business Analytics")}
                    </span>
                    <p className="text-[11px] text-ink/60">
                      {moreSubView === "advisory"
                        ? (isBn ? "স্মার্ট স্টক কেনাকাটার পরামর্শ" : "Stock replenishment advisory")
                        : (isBn ? "বিক্রয় ট্রেন্ড ও পারফরম্যান্স বিশ্লেষণ" : "Revenue, trends & performance insights")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMoreOpen(false);
                    setMoreSubView(null);
                  }}
                  className="w-8 h-8 rounded-full bg-nv-100 flex items-center justify-center text-ink active:bg-nv-200"
                >
                  <X size={17} />
                </button>
              </div>
            )}

            {/* If moreSubView is null: Direct Services Grid (No top tabs) */}
            {moreSubView === null ? (
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                {moreServices.map(item => (
                  <button
                    key={item.id + item.label}
                    onClick={() => {
                      if (item.id === "advisory") {
                        setMoreSubView("advisory");
                      } else if (item.id === "analytics") {
                        setMoreSubView("analytics");
                      } else {
                        setScreen(item.id);
                        setMoreOpen(false);
                      }
                    }}
                    className="relative flex flex-col items-center justify-center gap-1.5 py-3 px-1 rounded-2xl active:bg-nv-100/60 active:scale-95 transition-all group"
                  >
                    {item.badge ? (
                      <span className="absolute top-1 right-3 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                        {tNum(item.badge)}
                      </span>
                    ) : null}
                    <div className="w-10 h-10 flex items-center justify-center text-ink group-hover:text-em-700 transition-colors">
                      <item.icon size={24} strokeWidth={1.6} />
                    </div>
                    <span className="text-[11px] font-medium text-ink text-center leading-tight">
                      {isBn ? item.labelBn : item.label}
                    </span>
                  </button>
                ))}
              </div>
            ) : moreSubView === "advisory" ? (
              <div className="space-y-3">
                <div className="bg-white rounded-2xl border border-nv-200 p-3.5 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Package size={18} className="text-em-700" />
                      <h3 className="font-display text-sm font-semibold text-ink">
                        {isBn ? "কোনটি কেনা উচিত (ক্রয় পরামর্শ)" : "What to Buy Next (Advisory)"}
                      </h3>
                    </div>
                    <button
                      onClick={() => setMoreSubView("analytics")}
                      className="text-[11px] font-bold text-em-700 hover:underline flex items-center gap-0.5"
                    >
                      {isBn ? "অ্যানালিটিক্স" : "Analytics"} →
                    </button>
                  </div>

                  {/* Color Tiers Mini Strip */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setAdvisoryTab("urgent")}
                      className={`p-2.5 rounded-xl border text-left transition-colors ${
                        advisoryTab === "urgent"
                          ? "border-red-500 bg-red-50 text-red-900 shadow-2xs"
                          : "border-red-200 bg-red-50/40 text-red-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">🔴 {isBn ? "জরুরি কিনুন" : "Urgent Buy"}</span>
                        <span className="num text-[10px] font-bold px-1.5 py-0.2 bg-red-200 text-red-900 rounded-full">
                          {tNum(urgentAdvisory.length)}
                        </span>
                      </div>
                      <div className="text-[10px] text-ink/70 mt-0.5 truncate">
                        {isBn ? "স্টক শেষ / ব্যাপক চাহিদা" : "Out of stock / high demand"}
                      </div>
                    </button>

                    <button
                      onClick={() => setAdvisoryTab("soon")}
                      className={`p-2.5 rounded-xl border text-left transition-colors ${
                        advisoryTab === "soon"
                          ? "border-amber-500 bg-amber-50 text-amber-900 shadow-2xs"
                          : "border-amber-200 bg-amber-50/40 text-amber-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">🟡 {isBn ? "শীঘ্রই কিনুন" : "Buy Soon"}</span>
                        <span className="num text-[10px] font-bold px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded-full">
                          {tNum(soonAdvisory.length)}
                        </span>
                      </div>
                      <div className="text-[10px] text-ink/70 mt-0.5 truncate">
                        {isBn ? "৭ দিনের মধ্যে ফুরিয়ে যাবে" : "Runs out within 7 days"}
                      </div>
                    </button>
                  </div>

                  {/* Product Cards */}
                  <div className="space-y-2">
                    {(advisoryTab === "urgent" ? urgentAdvisory : soonAdvisory).map(({ product: p, daysOfStockLeft, suggestedBuyQty, tier }) => (
                      <div
                        key={p.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                          tier === "urgent"
                            ? "bg-red-50/60 border-red-200"
                            : "bg-amber-50/60 border-amber-200"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-ink text-xs truncate">
                            {p.name}
                          </div>
                          <div className="text-[11px] text-ink/70 flex items-center gap-1.5 mt-0.5">
                            <span className="num font-bold text-ink">{tNum(p.stock)} {p.unit}</span>
                            <span>•</span>
                            <span className={`font-semibold ${tier === "urgent" ? "text-red-700" : "text-amber-700"}`}>
                              {isBn ? `${tNum(daysOfStockLeft)} দিনের মজুদ বাকি` : `${tNum(daysOfStockLeft)}d stock left`}
                            </span>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <div className="text-[10px] text-ink/60">{isBn ? "প্রস্তাবিত ক্রয়" : "Suggested"}</div>
                          <div className="num font-bold text-xs text-em-800">
                            +{tNum(suggestedBuyQty)} {p.unit}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setMoreSubView(null)}
                      className="flex-1 py-2.5 bg-nv-100 active:bg-nv-200 border border-nv-200 rounded-xl text-xs font-semibold text-ink text-center flex items-center justify-center gap-1 transition-colors"
                    >
                      <ArrowLeft size={14} />
                      <span>{isBn ? "সকল সেবা" : "All Services"}</span>
                    </button>
                    <button
                      onClick={() => {
                        setScreen("purchases");
                        setMoreOpen(false);
                        setMoreSubView(null);
                      }}
                      className="flex-2 py-2.5 bg-em-700 active:bg-em-800 text-white rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1 transition-colors shadow-2xs"
                    >
                      <span>{isBn ? "সাপ্লায়ার অর্ডার এন্ট্রি করুন" : "Order from Supplier"}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                {/* Analytics Header Card */}
                <div className="bg-gradient-to-r from-em-50/80 via-white to-amber-50/50 p-3.5 rounded-2xl border border-em-200/90 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-em-100 border border-em-200 text-em-800 flex items-center justify-center flex-shrink-0">
                        <BarChart2 size={18} />
                      </div>
                      <div>
                        <h3 className="font-display text-sm font-bold text-ink">
                          {isBn ? "ব্যবসায়িক অ্যানালিটিক্স ও পারফরম্যান্স" : "Business Analytics & Insights"}
                        </h3>
                        <p className="text-[10px] text-ink/60">
                          {isBn ? "বিক্রয় ট্রেন্ড, লাভের মার্জিন ও ক্যাটাগরি বিশ্লেষণ" : "Sales velocity, profit margins & category trends"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Period filter buttons */}
                  <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-em-100">
                    <span className="text-[10px] font-semibold text-ink/70 mr-1">{isBn ? "সময়কাল:" : "Period:"}</span>
                    {[
                      { id: "day" as const, label: "Today", labelBn: "আজ" },
                      { id: "week" as const, label: "7 Days", labelBn: "৭ দিন" },
                      { id: "month" as const, label: "30 Days", labelBn: "৩০ দিন" },
                    ].map(p => (
                      <button
                        key={p.id}
                        onClick={() => setPeriod(p.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                          period === p.id
                            ? "bg-em-700 text-white shadow-2xs"
                            : "bg-white text-ink border border-nv-200"
                        }`}
                      >
                        {isBn ? p.labelBn : p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4 KPI Metrics Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 bg-white rounded-xl border border-nv-200 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px] text-ink/70 mb-1">
                      <span>{isBn ? "মোট বিক্রয়" : "Total Revenue"}</span>
                      <span className="text-[10px] font-bold text-em-700 bg-em-50 px-1.5 py-0.2 rounded-md">+১৮.৪%</span>
                    </div>
                    <div className="num text-base font-extrabold text-ink">{formatTaka(income)}</div>
                    <div className="text-[10px] text-ink/50 mt-0.5">{tNum(sales.length)} {isBn ? "টি সফল চালান" : "completed sales"}</div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-nv-200 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px] text-ink/70 mb-1">
                      <span>{isBn ? "নিট মুনাফা" : "Net Profit"}</span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-md">{tNum(32.5)}%</span>
                    </div>
                    <div className="num text-base font-extrabold text-ink">{formatTaka(Math.abs(profit))}</div>
                    <div className="text-[10px] text-ink/50 mt-0.5">{inProfit ? (isBn ? "লাভজনক অবস্থানে" : "Positive margin") : (isBn ? "ব্যয় সমন্বয় প্রয়োজন" : "Deficit")}</div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-nv-200 shadow-2xs">
                    <div className="text-[11px] text-ink/70 mb-1">{isBn ? "গড় অর্ডার মূল্য" : "Avg Order Value"}</div>
                    <div className="num text-base font-extrabold text-ink">
                      {formatTaka(Math.round(income / Math.max(1, sales.length)))}
                    </div>
                    <div className="text-[10px] text-ink/50 mt-0.5">{isBn ? "প্রতি ক্রয়ে গড় বিক্রয়" : "Per transaction"}</div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-nv-200 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px] text-ink/70 mb-1">
                      <span>{isBn ? "বাকি অনুপাত" : "Dues Ratio"}</span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded-md">৮৪% আদায়</span>
                    </div>
                    <div className="num text-base font-extrabold text-ink">{formatTaka(totalDues)}</div>
                    <div className="text-[10px] text-ink/50 mt-0.5">{tNum(dueCount)} {isBn ? "জন গ্রাহকের বাকি" : "customers with due"}</div>
                  </div>
                </div>

                {/* Mini Weekly Sales Bar Chart */}
                <div className="bg-white p-3.5 rounded-2xl border border-nv-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-xs font-bold text-ink">
                      {isBn ? "সাপ্তাহিক বিক্রয় ট্রেন্ড (৳)" : "Weekly Revenue Trend (৳)"}
                    </span>
                    <span className="text-[10px] text-ink/60 font-medium">
                      {isBn ? "গত ৭ দিনের রেকর্ড" : "Last 7 days"}
                    </span>
                  </div>

                  <div className="h-40 w-full pt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesTrendData}>
                        <XAxis dataKey={isBn ? "dayBn" : "day"} tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: "#64748B" }} tickFormatter={v => tNum(v)} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(v: any) => [formatTaka(Number(v)), isBn ? "বিক্রয়" : "Sales"]} />
                        <Bar dataKey="sales" fill="#16A34A" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Category Share Progress */}
                <div className="bg-white p-3.5 rounded-2xl border border-nv-200 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-xs font-bold text-ink">
                      {isBn ? "ক্যাটাগরি অনুযায়ী বিক্রয় অবদান" : "Category Sales Contribution"}
                    </span>
                    <span className="text-[10px] text-em-700 font-semibold">{tNum(100)}%</span>
                  </div>

                  <div className="space-y-2">
                    {categoryAnalytics.map(cat => (
                      <div key={cat.name} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-medium text-ink">{cat.name}</span>
                          <span className="num font-bold text-ink">{tNum(cat.percent)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-nv-100 rounded-full overflow-hidden">
                          <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Selling Products */}
                <div className="bg-white p-3.5 rounded-2xl border border-nv-200 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-xs font-bold text-ink">
                      {isBn ? "শীর্ষ বিক্রিত পণ্যসমূহ" : "Top Performing Products"}
                    </span>
                    <span className="text-[10px] text-ink/60">{isBn ? "চাহিদা অনুযায়ী" : "By volume"}</span>
                  </div>

                  <div className="divide-y divide-nv-100">
                    {topProducts.map(tp => (
                      <div key={tp.id} className="py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-nv-100 text-ink text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                            #{tNum(tp.rank)}
                          </span>
                          <div className="min-w-0">
                            <div className="text-xs font-medium text-ink truncate">{isBn ? tp.nameBn : tp.name}</div>
                            <div className="text-[10px] text-ink/60">{tNum(tp.soldQty)} {isBn ? "টি বিক্রি হয়েছে" : "units sold"}</div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="num font-bold text-xs text-ink">{formatTaka(tp.revenue)}</div>
                          <span className="text-[9px] text-em-700 font-semibold">{isBn ? "শীর্ষ আয়" : "High revenue"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons at bottom */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setMoreSubView(null)}
                    className="flex-1 py-2.5 bg-nv-100 active:bg-nv-200 border border-nv-200 rounded-xl text-xs font-semibold text-ink text-center flex items-center justify-center gap-1 transition-colors"
                  >
                    <ArrowLeft size={14} />
                    <span>{isBn ? "সকল সেবা" : "All Services"}</span>
                  </button>
                  <button
                    onClick={() => {
                      setScreen("reports");
                      setMoreOpen(false);
                      setMoreSubView(null);
                    }}
                    className="flex-2 py-2.5 bg-ink text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 hover:bg-ink/90 transition-colors shadow-sm"
                  >
                    <BarChart2 size={15} />
                    <span>{isBn ? "পূর্ণাঙ্গ P&L রিপোর্ট" : "View Full Report"}</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Product Scanner Modal */}
      <AIProductScannerModal
        isOpen={showAIScanner}
        onClose={() => setShowAIScanner(false)}
        lang={lang}
        mode="add-product"
      />
    </div>
  );
}
