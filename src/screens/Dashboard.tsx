import { useState } from "react";
import {
  TrendingUp, ShoppingCart, Wallet, Truck, Receipt, AlertTriangle, Plus,
  CreditCard, BarChart2, ExternalLink,
  MessageSquare, Landmark, Store, Globe2, ShieldAlert,
  Star, ShieldCheck, MessageCircle, Award, Sparkles, Package, CheckCircle
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { useApp } from "../context/AppContext";
import BusinessRatingModal from "../components/BusinessRatingModal";

interface DashboardProps {
  lang: "en" | "bn";
  setScreen: (s: string) => void;
}

export default function Dashboard({ lang, setScreen }: DashboardProps) {
  const { sales, products, customers, expenses, accounts, settings, setCurrentInvoice, tNum, formatTaka } = useApp();
  const isBn = lang === "bn";

  const [period, setPeriod] = useState<"today" | "week" | "month">("today");
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [advisorySubTab, setAdvisorySubTab] = useState<"urgent" | "soon">("urgent");

  // Dynamic calculations from central store
  const totalSalesAmount = sales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalExpensesAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalCashBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const totalCustomerDues = customers.reduce((sum, c) => sum + c.due, 0);

  const grossProfit = sales.reduce((sum, s) => {
    const cost = s.items.reduce((cSum, i) => cSum + (i.buyPrice || i.price * 0.75) * i.qty, 0);
    return sum + (s.grandTotal - cost);
  }, 0);
  const netProfit = grossProfit - totalExpensesAmount;

  const lowStockProducts = products.filter(p => p.status === "low-stock" || p.status === "out-of-stock");

  // Smart Purchasing / Stock Buy Advisory (Color-Coded: Deɛ Ɛsɛ Sɛ Wotɔ (Advisory))
  const buyAdvisoryItems = products.map(p => {
    const soldQty = sales.reduce((acc, s) => {
      const item = s.items.find(i => i.name === p.name);
      return acc + (item ? item.qty : 0);
    }, 0) || (p.stock > 0 ? 10 : 24);

    const weeklyRate = Math.max(1, Math.round(soldQty / 4));
    const daysOfStockLeft = weeklyRate > 0 ? Math.round((p.stock / weeklyRate) * 7) : 999;

    let tier: "urgent" | "soon" | "safe" | "slow" = "safe";
    let colorName = "green";
    let badgeText = "Safe / Optimal";
    let badgeTextBn = "Akorae Wɔ Hɔ";

    if (p.stock === 0 || p.stock <= p.min) {
      tier = "urgent";
      colorName = "red";
      badgeText = "🔴 Urgent Buy";
      badgeTextBn = "🔴 Tɔ Ntɛmntɛm (Urgent)";
    } else if (p.stock <= p.min * 1.6 || daysOfStockLeft <= 7) {
      tier = "soon";
      colorName = "yellow";
      badgeText = "🟡 Reorder Soon";
      badgeTextBn = "🟡 Ɛrensa Ntɛm";
    } else if (daysOfStockLeft <= 45) {
      tier = "safe";
      colorName = "green";
      badgeText = "🟢 Safe Stock";
      badgeTextBn = "🟢 Akorae Wɔ Hɔ";
    } else {
      tier = "slow";
      colorName = "gray";
      badgeText = "⚪ Slow Mover";
      badgeTextBn = "⚪ Tɔn Ntoasoɔ Brɛoo";
    }

    const suggestedBuyQty = tier === "urgent" ? Math.max(20, p.min * 2 - p.stock) : tier === "soon" ? Math.max(12, Math.round(p.min * 1.5 - p.stock)) : 0;

    return { product: p, tier, colorName, badgeText, badgeTextBn, weeklyRate, daysOfStockLeft, suggestedBuyQty };
  });

  const urgentAdvisory = buyAdvisoryItems.filter(i => i.tier === "urgent");
  const soonAdvisory = buyAdvisoryItems.filter(i => i.tier === "soon");

  const salesTrendData = [
    { day: "Mon", dayBn: "Dwo", sales: 32000, profit: 5800 },
    { day: "Tue", dayBn: "Bena", sales: 41000, profit: 7200 },
    { day: "Wed", dayBn: "Wuku", sales: 28000, profit: 4900 },
    { day: "Thu", dayBn: "Yawo", sales: 55000, profit: 9800 },
    { day: "Fri", dayBn: "Efi", sales: 48250, profit: 8420 },
    { day: "Sat", dayBn: "Meme", sales: 62000, profit: 11200 },
    { day: "Today", dayBn: "Ɛnnɛ", sales: totalSalesAmount, profit: Math.max(0, grossProfit) },
  ];

  const categoryPieData = Array.from(new Set(products.map(p => p.category))).map((cat, idx) => {
    const colors = ["#16A34A", "#4ADE80", "#D97706", "#FBBF24", "#475569", "#94A3B8"];
    const count = products.filter(p => p.category === cat).length;
    return {
      name: cat,
      value: count,
      color: colors[idx % colors.length],
    };
  });

  return (
    <div className="px-4 sm:px-6 pt-4 sm:pt-5 space-y-4 sm:space-y-5 pb-24 lg:pb-8">
      {/* Business Rating Modal */}
      <BusinessRatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        lang={lang}
      />

      {/* Header: title + period selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <h1 className="font-display text-base sm:text-lg font-semibold text-ink">
          {isBn ? "Adwumayɛ Nhwɛso (Overview)" : "Business Overview"}
        </h1>

        <div className="inline-flex items-center p-0.5 bg-nv-100 border border-nv-200 rounded-lg self-start sm:self-auto">
          {[
            { id: "today" as const, label: "Today", labelBn: "Ɛnnɛ" },
            { id: "week" as const, label: "This Week", labelBn: "Dapɛn Yi" },
            { id: "month" as const, label: "This Month", labelBn: "Bosome Yi" },
          ].map(p => {
            const isSelected = period === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                  ${isSelected
                    ? "bg-white text-ink shadow-xs font-semibold"
                    : "text-ink hover:text-ink"}`}
              >
                {isBn ? p.labelBn : p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Business Rating & Trust Banner */}
      <div className="bg-white rounded-xl border border-nv-200 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 flex-shrink-0">
            <Star size={20} className="fill-amber-400 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs sm:text-sm text-ink">{isBn ? "Adwuma Gyinabea:" : "Business Rating:"}</span>
              <span className="num font-black text-amber-600 text-sm">{tNum(4.9)} / {tNum(5)}</span>
              <div className="flex items-center gap-0.5 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-em-50 text-em-800 border border-em-200 font-bold">
                {isBn ? "Dukan a Wɔgye Di Pa Ara" : "Top Rated Store"}
              </span>
            </div>
            <p className="text-xs text-ink/60 mt-0.5">
              {isBn
                ? `Nkratoɔ ${tNum(384)} a wɔahwɛ mu • 98.7% atɔfoɔ anigyeɛ`
                : "Based on 384 verified customer reviews • 98.7% satisfaction rate"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-nv-50 text-ink border border-nv-200 font-semibold hidden md:inline-flex items-center gap-1">
            <ShieldCheck size={13} className="text-em-600" />
            {isBn ? "GRA Tax Compliant" : "NBR Tax Compliant"}
          </span>
          <button
            onClick={() => setShowRatingModal(true)}
            className="px-3.5 py-1.5 bg-nv-50 hover:bg-nv-100 border border-nv-200 text-ink rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
          >
            {isBn ? "Hwɛ Nsɛm a Wɔaka" : "View Ratings & Reviews"} →
          </button>
        </div>
      </div>

      {/* KPI row — label above value, one accent per card at most */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            icon: ShoppingCart,
            label: isBn ? "Ɛnnɛ Tɔn Nyinaa" : "Total Sales",
            value: formatTaka(totalSalesAmount),
            meta: `+${tNum(14.2)}% ${isBn ? "sen dapɛn a ɛtwaam" : "vs last week"}`,
            metaTone: "text-ink",
            valueTone: "text-ink",
          },
          {
            icon: TrendingUp,
            label: isBn ? "Mfasoɔ Pɔtee" : "Net Profit",
            value: formatTaka(netProfit),
            meta: `${tNum(((netProfit / (totalSalesAmount || 1)) * 100).toFixed(0))}% ${isBn ? "Mfasoɔ %" : "margin"}`,
            metaTone: "text-ink",
            valueTone: "text-ink",
          },
          {
            icon: Wallet,
            label: isBn ? "Sika & Sikakorabea" : "Cash & Bank",
            value: formatTaka(totalCashBalance),
            meta: `${tNum(accounts.length)} ${isBn ? "akawnt" : "accounts"}`,
            metaTone: "text-ink",
            valueTone: "text-ink",
          },
          {
            icon: CreditCard,
            label: isBn ? "Kastamafoɔ Aka" : "Customer Dues",
            value: formatTaka(totalCustomerDues),
            meta: `${tNum(customers.filter(c => c.due > 0).length)} ${isBn ? "atɔfoɔ a wɔde aka" : "owing"}`,
            metaTone: "text-ink",
            valueTone: "text-ink",
          },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl p-4 sm:p-5 border border-nv-200 card-lift">
            <div className="flex items-center gap-2 mb-3">
              <kpi.icon size={15} className="text-ink" />
              <span className="text-xs font-medium text-ink truncate">{kpi.label}</span>
            </div>
            <div className={`num text-lg sm:text-xl font-semibold ${kpi.valueTone}`}>{kpi.value}</div>
            <div className={`text-xs mt-1 font-medium ${kpi.metaTone}`}>{kpi.meta}</div>
          </div>
        ))}
      </div>

      {/* Quick Action Bar */}
      <div>
        <h3 className="font-display font-semibold text-ink text-sm mb-3">
          {isBn ? "Nnwuma Ntɛmntɛm" : "Quick Actions"}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {[
            { label: "New Sale", labelBn: "Tua Ka / POS Foforɔ", icon: ShoppingCart, screen: "pos" },
            { label: "Messaging", labelBn: "Nkitahodie & Nkɔmbɔ", icon: MessageCircle, screen: "messages", badge: "Live" },
            { label: "Add Product", labelBn: "Fa Nnoɔma Ka Ho", icon: Plus, screen: "addproduct" },
            { label: "Collect Due", labelBn: "Gye Aka No", icon: CreditCard, screen: "dues" },
            { label: "Tax & VAT Pay", labelBn: "GRA Tax & VAT Tua", icon: Landmark, screen: "reports" },
            { label: "Buy Advisory", labelBn: "Deɛ Ɛsɛ Sɛ Wotɔ (Advisory)", icon: Package, screen: "reports" },
            { label: "Business Rating", labelBn: "Gyinabea & Nsɛm", icon: Star, onClick: () => setShowRatingModal(true) },
            { label: "Marketing", labelBn: "Dawubɔ & SMS", icon: MessageSquare, screen: "marketing" },
            { label: "Courier Parcel", labelBn: "Kɔmafoɔ Parcel", icon: Truck, screen: "delivery" },
            { label: "Bank & Loans", labelBn: "Sikakorabea & Bosea", icon: Landmark, screen: "fintech" },
            { label: "Store Website", labelBn: "Intanɛte Dukan", icon: Globe2, screen: "website" },
            { label: "Reports & P&L", labelBn: "Mfasoɔ & Amanneɛbɔ", icon: BarChart2, screen: "reports" },
          ].map(action => (
            <button
              key={action.label}
              onClick={() => {
                if (action.onClick) action.onClick();
                else if (action.screen) setScreen(action.screen);
              }}
              className="p-3.5 bg-white hover:bg-nv-50 border border-nv-200 hover:border-nv-300 rounded-xl font-medium text-xs text-ink flex flex-col items-center justify-center gap-2 transition-colors relative"
            >
              <action.icon size={18} className="text-ink" />
              <span className="text-center leading-tight">{isBn ? action.labelBn : action.label}</span>
              {action.badge && (
                <span className="absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0.2 rounded-full bg-em-600 text-white font-bold">
                  {action.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Charts (Sales Area & Category Pie) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-nv-200 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-ink text-sm">{isBn ? "Tɔn & Mfasoɔ Akwankyerɛ" : "Sales & Profit Trend"}</h3>
            <div className="flex items-center gap-3 text-xs font-medium text-ink">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-em-600" /> {isBn ? "Tɔn" : "Sales"}</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-ac-600" /> {isBn ? "Mfasoɔ" : "Profit"}</span>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrendData}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D97706" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#D97706" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey={isBn ? "dayBn" : "day"} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} tickFormatter={(v) => tNum(v)} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: any) => [formatTaka(Number(v)), ""]} />
                <Area type="monotone" dataKey="sales" stroke="#16A34A" strokeWidth={2} fillOpacity={1} fill="url(#salesGrad)" />
                <Area type="monotone" dataKey="profit" stroke="#D97706" strokeWidth={2} fillOpacity={1} fill="url(#profitGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="bg-white rounded-xl border border-nv-200 p-5 flex flex-col justify-between">
          <h3 className="font-display font-semibold text-ink text-base mb-2">
            {isBn ? "Nkyekyɛmu Nnoɔma" : "Category Breakdown"}
          </h3>

          <div className="h-52 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryPieData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => [`${tNum(v)} ${isBn ? "nnoɔma" : "products"}`, ""]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-ink font-medium">{tNum(products.length)} {isBn ? "nnoɔma" : "Items"}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            {categoryPieData.slice(0, 4).map(c => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                  <span className="text-ink">{c.name}</span>
                </div>
                <span className="num font-semibold text-ink">{tNum(c.value)} {isBn ? "pcs" : "pcs"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Sales & Smart Buy Advisory Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Sales Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-nv-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-nv-100 flex items-center justify-between">
            <h3 className="font-display font-semibold text-ink text-sm sm:text-base">
              {isBn ? "Tɔn a Wɔayɛ Nnansa Yi" : "Recent Sales & Invoices"}
            </h3>
            <button onClick={() => setScreen("pos")} className="text-xs font-medium text-ink hover:text-ink">
              {isBn ? "Tɔn Foforɔ" : "New Sale"} →
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-nv-50 border-b border-nv-200">
                  <th className="px-4 py-2.5 font-medium text-ink whitespace-nowrap">{isBn ? "Invois" : "Invoice"}</th>
                  <th className="px-4 py-2.5 font-medium text-ink whitespace-nowrap">{isBn ? "Otɔfoɔ" : "Customer"}</th>
                  <th className="px-4 py-2.5 font-medium text-ink whitespace-nowrap">{isBn ? "Nnoɔma" : "Items"}</th>
                  <th className="px-4 py-2.5 font-medium text-ink whitespace-nowrap">{isBn ? "Ne Nyinaa" : "Total"}</th>
                  <th className="px-4 py-2.5 font-medium text-ink whitespace-nowrap">{isBn ? "Kwan a Wɔfaa So" : "Method"}</th>
                  <th className="px-4 py-2.5 font-medium text-ink whitespace-nowrap text-right">{isBn ? "Kasaa (Receipt)" : "Receipt"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nv-100">
                {sales.slice(0, 5).map(s => (
                  <tr key={s.id} className="hover:bg-nv-50 transition-fast">
                    <td className="px-4 py-3 font-mono text-ink whitespace-nowrap">{tNum(s.invoiceNo)}</td>
                    <td className="px-4 py-3 font-medium text-ink whitespace-nowrap">{s.customer}</td>
                    <td className="px-4 py-3 text-ink whitespace-nowrap">{tNum(s.items.length)} {isBn ? "nnoɔma" : "items"}</td>
                    <td className="px-4 py-3 num font-semibold text-ink whitespace-nowrap">{formatTaka(s.grandTotal)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase
                        ${s.paymentMethod === "due" ? "bg-red-50 text-ink" : "bg-nv-100 text-ink"}`}>
                        {s.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setCurrentInvoice(s);
                          setScreen("invoice");
                        }}
                        className="p-1 rounded-lg hover:bg-nv-100 text-ink hover:text-ink transition-fast inline-flex items-center gap-1"
                        title="View Invoice"
                      >
                        <ExternalLink size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Smart Buy Advisory: Color Coded Widget (Deɛ Ɛsɛ Sɛ Wotɔ (Advisory)) */}
        <div className="bg-white rounded-xl border border-nv-200 p-5 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-nv-100">
              <div className="flex items-center gap-1.5">
                <Package size={17} className="text-em-700" />
                <h3 className="font-display font-semibold text-ink text-sm">
                  {isBn ? "Deɛ Ɛsɛ Sɛ Wotɔ (Advisory)" : "What to Buy Next (Advisory)"}
                </h3>
              </div>
              <button
                onClick={() => setScreen("reports")}
                className="text-xs font-medium text-ink hover:text-ink"
              >
                {isBn ? "Hwɛ Ne Nyinaa" : "Full Report"} →
              </button>
            </div>

            {/* Sub-tabs: 🔴 Urgent vs 🟡 Soon */}
            <div className="flex gap-1.5 my-2.5">
              <button
                onClick={() => setAdvisorySubTab("urgent")}
                className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 ${
                  advisorySubTab === "urgent"
                    ? "bg-red-600 text-white shadow-xs"
                    : "bg-red-50 text-red-800 hover:bg-red-100"
                }`}
              >
                <span>🔴 {isBn ? "Tɔ Ntɛmntɛm (Urgent)" : "Urgent"}</span>
                <span className="text-[10px] px-1.5 py-0.1 rounded-full bg-white/20">
                  {tNum(urgentAdvisory.length)}
                </span>
              </button>
              <button
                onClick={() => setAdvisorySubTab("soon")}
                className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 ${
                  advisorySubTab === "soon"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                }`}
              >
                <span>🟡 {isBn ? "Tɔ Bi Ntɛm" : "Reorder Soon"}</span>
                <span className="text-[10px] px-1.5 py-0.1 rounded-full bg-white/20">
                  {tNum(soonAdvisory.length)}
                </span>
              </button>
            </div>

            {/* Items List */}
            <div className="divide-y divide-nv-100 max-h-56 overflow-y-auto">
              {(advisorySubTab === "urgent" ? urgentAdvisory : soonAdvisory).map(({ product: p, daysOfStockLeft, suggestedBuyQty, tier }) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl flex-shrink-0">{p.image || "📦"}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-ink truncate">{isBn ? p.nameBn : p.name}</div>
                      <div className="text-[10px] text-ink/60">
                        {isBn ? `Akorae: ${tNum(p.stock)} Pcs • Aka: ${tNum(daysOfStockLeft)} Nna` : `Stock: ${p.stock} pcs • ${daysOfStockLeft}d left`}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-bold text-em-700 num">
                      +{tNum(suggestedBuyQty)} pcs
                    </div>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                        tier === "urgent" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {tier === "urgent" ? (isBn ? "Ntɛmntɛm" : "Must Buy") : (isBn ? "Ɛrensa Ntɛm" : "Reorder")}
                    </span>
                  </div>
                </div>
              ))}

              {(advisorySubTab === "urgent" ? urgentAdvisory : soonAdvisory).length === 0 && (
                <div className="py-8 text-center text-ink/50 text-xs">
                  {isBn ? "Nnoɔma biara nhia akorae foforɔ ha!" : "No items need restocking here!"}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setScreen("purchases")}
            className="w-full mt-3 py-2.5 bg-nv-50 hover:bg-nv-100 text-ink text-xs font-medium rounded-lg transition-colors text-center border border-nv-200"
          >
            {isBn ? "Yɛ Agorɔfoɔ Order" : "Create Purchase Order"} →
          </button>
        </div>
      </div>
    </div>
  );
}
