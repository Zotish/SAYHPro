import { useState } from "react";
import {
  Bell, Headphones, User, ChevronRight, ArrowRight, Plus, X,
  ShoppingCart, ShoppingBag, CreditCard, Boxes, Wallet, Receipt, Package, Users,
  Truck, BarChart2, Home, QrCode, Menu, TrendingUp, TrendingDown,
  Landmark, MessageSquare, Store, Globe2, ShieldAlert, UserCheck, Settings,
} from "lucide-react";
import { useApp, toBnDigits } from "../context/AppContext";

interface MobileProps {
  lang: "en" | "bn";
  setScreen: (s: string) => void;
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
  const { sales, customers, expenses, settings, notifications, tNum, formatTaka } = useApp();
  const isBn = lang === "bn";

  const [period, setPeriod] = useState<"day" | "week" | "month">("day");
  const [moreOpen, setMoreOpen] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.read).length;

  // Income is a single day of invoices in the seed set, so it reads the same
  // either way; expenses are a month-long ledger and genuinely narrow down.
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

  const lastSale = sales[0];

  // Most important services lead the grid.
  const services = [
    { id: "pos", icon: ShoppingCart, label: "New Sale", labelBn: "বিক্রি করুন" },
    { id: "dues", icon: CreditCard, label: "Due Ledger", labelBn: "বাকির খাতা" },
    { id: "inventory", icon: Boxes, label: "Stock", labelBn: "স্টক" },
    { id: "cash", icon: Wallet, label: "Cash Book", labelBn: "হিসাব খাতা" },
    { id: "expenses", icon: Receipt, label: "Expenses", labelBn: "খরচের খাতা" },
    { id: "purchases", icon: ShoppingBag, label: "Purchases", labelBn: "ক্রয়" },
    { id: "customers", icon: Users, label: "Customers", labelBn: "গ্রাহক তালিকা" },
    { id: "delivery", icon: Truck, label: "Courier", labelBn: "কুরিয়ার" },
    { id: "reports", icon: BarChart2, label: "Reports", labelBn: "রিপোর্ট" },
  ];

  const moreServices = [
    { id: "marketing", icon: MessageSquare, label: "Marketing", labelBn: "মার্কেটিং" },
    { id: "fintech", icon: Landmark, label: "Bank & Loans", labelBn: "ব্যাংক ও লোন" },
    { id: "reselling", icon: Store, label: "Reselling", labelBn: "রিসেলিং" },
    { id: "website", icon: Globe2, label: "Storefront", labelBn: "অনলাইন স্টোর" },
    { id: "alerts", icon: ShieldAlert, label: "Alerts", labelBn: "অ্যালার্ট" },
    { id: "products", icon: Package, label: "Products", labelBn: "পণ্য তালিকা" },
    { id: "suppliers", icon: Users, label: "Suppliers", labelBn: "সাপ্লায়ার" },
    { id: "employees", icon: UserCheck, label: "Employees", labelBn: "কর্মচারী" },
    { id: "settings", icon: Settings, label: "Settings", labelBn: "সেটিংস" },
  ];

  const bottomNav = [
    { id: "home", icon: Home, label: "Home", labelBn: "হোম" },
    { id: "pos", icon: ShoppingCart, label: "Sell", labelBn: "বেচা-বিক্রি" },
    { id: "fintech", icon: QrCode, label: "My QR", labelBn: "আমার QR" },
    { id: "dues", icon: CreditCard, label: "Dues", labelBn: "দেনা-পে" },
    { id: "more", icon: Menu, label: "More", labelBn: "আরও" },
  ];

  return (
    // The shell owns the scroll rather than the document, so the fixed nav
    // can never sit on top of the last row of tiles.
    <div className="h-screen overflow-hidden bg-white flex flex-col relative select-none">
      {/* ---------- Header ---------- */}
      <header className="flex-shrink-0 bg-white border-b border-nv-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-em-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {settings.shopName.slice(0, 2).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <div className="font-display text-[15px] font-semibold text-ink truncate leading-tight">
              {settings.ownerName}
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => setScreen("notifications")}
              aria-label={isBn ? "বিজ্ঞপ্তি" : "Notifications"}
              className="relative w-9 h-9 rounded-full flex items-center justify-center text-ink active:bg-nv-200"
            >
              <Bell size={17} />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-red-600 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                  {tNum(unreadNotifs)}
                </span>
              )}
            </button>
            <button
              onClick={() => setScreen("alerts")}
              aria-label={isBn ? "সহায়তা" : "Support"}
              className="w-9 h-9 rounded-full flex items-center justify-center text-ink active:bg-nv-200"
            >
              <Headphones size={17} />
            </button>
            <button
              onClick={() => setScreen("settings")}
              aria-label={isBn ? "প্রোফাইল" : "Profile"}
              className="w-9 h-9 rounded-full flex items-center justify-center text-ink active:bg-nv-200"
            >
              <User size={17} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-24 space-y-4 bg-white">
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
            <div className="px-3 py-3">
              <div className="text-[11px] text-ink mb-1 leading-tight">
                {isBn ? "আজকের আয়" : "Income"}
              </div>
              <div className="num text-base font-semibold text-ink">{formatTaka(income)}</div>
            </div>
            <div className="px-3 py-3">
              <div className="text-[11px] text-ink mb-1 leading-tight">
                {isBn ? "আজকের ব্যয়" : "Expense"}
              </div>
              <div className="num text-base font-semibold text-ink">{formatTaka(expense)}</div>
            </div>
            <div className="px-3 py-3">
              <div className="text-[11px] text-ink mb-1 leading-tight">
                {isBn ? "লাভ/ক্ষতি" : "Profit / Loss"}
              </div>
              <div
                className={`num text-base font-semibold flex items-center gap-1 ${
                  inProfit ? "text-ink" : "text-ink"
                }`}
              >
                {inProfit ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {formatTaka(Math.abs(profit))}
              </div>
            </div>
          </div>

          {/* Latest entry */}
          {lastSale && (
            <button
              onClick={() => setScreen("dashboard")}
              className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-nv-50"
            >
              <div className="w-9 h-9 rounded-lg text-ink flex items-center justify-center flex-shrink-0">
                <Receipt size={17} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-ink truncate">
                  {isBn ? "ইনকাম এন্ট্রি" : "Income entry"}
                </div>
                <div className="text-[11px] text-ink mt-0.5">
                  {isBn ? toBnDigits(lastSale.time) : lastSale.time} · {lastSale.customer}
                </div>
              </div>
              <div className="num text-sm font-semibold text-ink flex-shrink-0">
                {formatTaka(lastSale.grandTotal)}
              </div>
            </button>
          )}

          <button
            onClick={() => setScreen("dashboard")}
            className="w-full flex items-center justify-center gap-1 py-2.5 border-t border-nv-100 text-xs font-medium text-ink active:bg-nv-50"
          >
            {isBn ? "আরও দেখুন" : "See more"}
            <ChevronRight size={14} />
          </button>
        </section>

        {/* ---------- Promo / dues prompt ---------- */}
        <button
          onClick={() => setScreen("dues")}
          className="w-full text-left bg-em-900 rounded-xl px-4 py-4 relative overflow-hidden active:bg-em-950 transition-colors"
        >
          {/* Oversized amber "?" is the reference banner's whole visual hook */}
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
        </button>

        {/* ---------- Services ---------- */}
        {/* gap-px over a grey backing paints the reference's hairline grid,
            so the tiles read as one panel instead of nine floating cards */}
        <section className="grid grid-cols-3 gap-px bg-nv-200 border border-nv-200 rounded-xl overflow-hidden">
          {services.map(s => (
            <button
              key={s.id}
              onClick={() => setScreen(s.id)}
              className="bg-white flex flex-col items-center gap-2 py-4 px-1.5 active:bg-nv-50 transition-colors"
            >
              <div className="w-13 h-13 flex items-center justify-center text-ink">
                <s.icon size={26} strokeWidth={1.75} />
              </div>
              <span className="text-[11px] font-medium text-ink text-center leading-tight">
                {isBn ? s.labelBn : s.label}
              </span>
            </button>
          ))}
        </section>
      </main>

      {/* ---------- Floating new-sale button ---------- */}
      <button
        onClick={() => setScreen("pos")}
        aria-label={isBn ? "নতুন বিক্রয়" : "New sale"}
        className="absolute right-4 bottom-20 z-40 w-12 h-12 rounded-xl bg-em-600 text-white flex items-center justify-center shadow-xl active:bg-em-700"
      >
        <Plus size={22} />
      </button>

      {/* ---------- Bottom navigation ---------- */}
      {/* pb keeps the labels clear of the iPhone home indicator */}
      <nav className="flex-shrink-0 bg-white border-t border-nv-200 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-stretch h-16">
          {bottomNav.map(item => {
            const isActive = item.id === "home";
            return (
              <button
                key={item.id}
                onClick={() => (item.id === "more" ? setMoreOpen(true) : item.id !== "home" && setScreen(item.id))}
                // Every label is full-strength black and bold so it stays
                // readable; the active tab is marked by stroke weight alone.
                className="flex-1 flex flex-col items-center justify-center gap-0.5 px-1 text-ink"
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
                {/* leading-tight, not leading-none: Bangla descenders clip otherwise */}
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
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50">
          <button
            className="flex-1"
            aria-label={isBn ? "বন্ধ করুন" : "Close"}
            onClick={() => setMoreOpen(false)}
          />
          <div className="bg-white rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-nv-100">
              <span className="font-display font-semibold text-ink text-base">
                {isBn ? "সকল সেবা" : "All Services"}
              </span>
              <button
                onClick={() => setMoreOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-ink"
              >
                <X size={17} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {moreServices.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setScreen(item.id);
                    setMoreOpen(false);
                  }}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-nv-200 active:bg-nv-50"
                >
                  <div className="w-11 h-11 rounded-lg text-ink flex items-center justify-center">
                    <item.icon size={20} />
                  </div>
                  <span className="text-[11px] font-medium text-ink text-center leading-tight">
                    {isBn ? item.labelBn : item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
