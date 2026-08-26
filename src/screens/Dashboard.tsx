import { useState } from "react";
import {
  TrendingUp, TrendingDown, ShoppingCart, Wallet, Users, Truck,
  Receipt, ArrowUpRight, ArrowDownRight, AlertTriangle, Plus,
  Package, CreditCard, RefreshCw, ChevronRight, Zap, CheckCircle, ExternalLink, Sparkles,
  MessageSquare, Landmark, Store, Globe2, ShieldAlert
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { useApp } from "../context/AppContext";

interface DashboardProps {
  lang: "en" | "bn";
  setScreen: (s: string) => void;
}

export default function Dashboard({ lang, setScreen }: DashboardProps) {
  const { sales, products, customers, expenses, accounts, settings, setCurrentInvoice, tNum, formatTaka } = useApp();
  const isBn = lang === "bn";

  const [period, setPeriod] = useState<"today" | "week" | "month">("today");

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

  const salesTrendData = [
    { day: "Mon", dayBn: "সোম", sales: 32000, profit: 5800 },
    { day: "Tue", dayBn: "মঙ্গল", sales: 41000, profit: 7200 },
    { day: "Wed", dayBn: "বুধ", sales: 28000, profit: 4900 },
    { day: "Thu", dayBn: "বৃহঃ", sales: 55000, profit: 9800 },
    { day: "Fri", dayBn: "শুক্র", sales: 48250, profit: 8420 },
    { day: "Sat", dayBn: "শনি", sales: 62000, profit: 11200 },
    { day: "Today", dayBn: "আজ", sales: totalSalesAmount, profit: Math.max(0, grossProfit) },
  ];

  const categoryPieData = Array.from(new Set(products.map(p => p.category))).map((cat, idx) => {
    const colors = ["#059669", "#3B82F6", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4"];
    const count = products.filter(p => p.category === cat).length;
    return {
      name: cat,
      value: count,
      color: colors[idx % colors.length],
    };
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 pb-24 lg:pb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-nv-900">
            {isBn ? `শুভ সকাল, ${settings.ownerName} 👋` : `Welcome back, ${settings.ownerName} 👋`}
          </h1>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1 bg-white border border-nv-200 p-1 rounded-2xl shadow-2xs self-start sm:self-auto">
          {[
            { id: "today" as const, label: "Today", labelBn: "আজ" },
            { id: "week" as const, label: "This Week", labelBn: "এই সপ্তাহ" },
            { id: "month" as const, label: "This Month", labelBn: "এই মাস" },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-fast
                ${period === p.id ? "bg-em-700 text-white shadow-xs" : "text-nv-600 hover:bg-nv-100"}`}
            >
              {isBn ? p.labelBn : p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Metrics KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Sales Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-nv-200 card-lift relative overflow-hidden">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-em-50 text-em-700 flex items-center justify-center">
              <ShoppingCart size={20} />
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-em-50 text-em-700">
              <TrendingUp size={12} /> {tNum("+14.2%")}
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-nv-900">{formatTaka(totalSalesAmount)}</div>
          <div className="text-xs text-nv-500 mt-0.5">{isBn ? "আজকের মোট বিক্রয়" : "Total Sales"}</div>
        </div>

        {/* Profit Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-nv-200 card-lift relative overflow-hidden">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              {tNum(((netProfit / (totalSalesAmount || 1)) * 100).toFixed(0))}% {isBn ? "মার্জিন" : "Margin"}
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-blue-700">{formatTaka(netProfit)}</div>
          <div className="text-xs text-nv-500 mt-0.5">{isBn ? "নিট লাভ (লাভ - খরচ)" : "Net Estimated Profit"}</div>
        </div>

        {/* Cash Balance Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-nv-200 card-lift relative overflow-hidden">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Wallet size={20} />
            </div>
            <div className="text-[11px] font-bold text-nv-500 bg-nv-100 px-2 py-0.5 rounded-full">
              {tNum(accounts.length)} {isBn ? "টি অ্যাকাউন্ট" : "Accounts"}
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-nv-900">{formatTaka(totalCashBalance)}</div>
          <div className="text-xs text-nv-500 mt-0.5">{isBn ? "ক্যাশ ও ব্যাংক ব্যালেন্স" : "Combined Cash & Bank"}</div>
        </div>

        {/* Customer Due Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-nv-200 card-lift relative overflow-hidden">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <CreditCard size={20} />
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600">
              {tNum(customers.filter(c => c.due > 0).length)} {isBn ? "জন বাকিদার" : "Owing"}
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-red-600">{formatTaka(totalCustomerDues)}</div>
          <div className="text-xs text-nv-500 mt-0.5">{isBn ? "গ্রাহক বকেয়া পাওনা" : "Customer Dues (Baki)"}</div>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-nv-900 text-sm">{isBn ? "ব্যবসার সকল প্রয়োজনীয় টুলস" : "All Business Tools & Actions"}</h3>
          <span className="text-xs text-nv-400 font-semibold">{isBn ? "১২টি সমন্বিত ফিচার" : "12 Unified Modules"}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {[
            { label: "New Sale", labelBn: "নতুন বিক্রয় (POS)", icon: ShoppingCart, screen: "pos" },
            { label: "Add Product", labelBn: "পণ্য যোগ করুন", icon: Plus, screen: "addproduct" },
            { label: "Collect Due", labelBn: "বাকি আদায়", icon: CreditCard, screen: "dues" },
            { label: "SMS & FB Ads", labelBn: "মার্কেটিং ও SMS", icon: MessageSquare, screen: "marketing", badge: "SMS" },
            { label: "Courier Parcel", labelBn: "কুরিয়ার পার্সেল", icon: Truck, screen: "delivery", badge: "Fast" },
            { label: "Bank & Loans", labelBn: "ব্যাংক ও লোন", icon: Landmark, screen: "fintech", badge: "SME" },
            { label: "Resell Market", labelBn: "রিসেলিং মার্কেট", icon: Store, screen: "reselling", badge: "Wholesale" },
            { label: "Store Website", labelBn: "অনলাইন স্টোর", icon: Globe2, screen: "website", badge: "Live" },
            { label: "Smart Alerts", labelBn: "মনিটরিং অ্যালার্ট", icon: ShieldAlert, screen: "alerts" },
            { label: "Add Expense", labelBn: "খরচ এন্ট্রি", icon: Receipt, screen: "expenses" },
            { label: "Purchases", labelBn: "ক্রয় অর্ডার", icon: Truck, screen: "purchases" },
            { label: "Reports", labelBn: "লাভ-ক্ষতি রিপোর্ট", icon: Zap, screen: "reports" },
          ].map(action => (
            <button
              key={action.label}
              onClick={() => setScreen(action.screen)}
              className="p-3.5 bg-white hover:bg-nv-50 border border-nv-200 hover:border-nv-300 rounded-2xl font-semibold text-xs text-nv-800 flex flex-col items-center justify-center gap-2 shadow-2xs hover:shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] group relative"
            >
              {action.badge && (
                <span className="absolute top-2 right-2 px-1.5 py-0.2 text-[9px] font-extrabold uppercase rounded-full bg-em-50 text-em-700 border border-em-200">
                  {action.badge}
                </span>
              )}
              <div className="w-8 h-8 rounded-xl bg-nv-100 text-nv-700 flex items-center justify-center group-hover:bg-nv-200 group-hover:text-nv-900 transition-fast">
                <action.icon size={18} />
              </div>
              <span className="text-center">{isBn ? action.labelBn : action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Charts (Sales Area & Category Pie) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-nv-200 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-nv-900 text-base">{isBn ? "বিক্রয় ট্রেন্ড ও লাভ" : "Sales & Profit Trend"}</h3>
              <p className="text-xs text-nv-500">{isBn ? "সাপ্তাহিক বিক্রয় পারফরম্যান্স" : "Weekly financial performance"}</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-em-600" /> {isBn ? "বিক্রয়" : "Sales"}</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> {isBn ? "লাভ" : "Profit"}</span>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrendData}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey={isBn ? "dayBn" : "day"} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} tickFormatter={(v) => tNum(v)} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: any) => [formatTaka(Number(v)), ""]} />
                <Area type="monotone" dataKey="sales" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" />
                <Area type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#profitGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-nv-200 p-5 flex flex-col justify-between">
          <h3 className="font-display font-bold text-nv-900 text-base mb-2">
            {isBn ? "বিভাগ ভিত্তিক পণ্য" : "Category Breakdown"}
          </h3>

          <div className="h-52 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryPieData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => [`${tNum(v)} ${isBn ? "টি পণ্য" : "products"}`, ""]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-nv-400 font-bold">{tNum(products.length)} {isBn ? "টি পণ্য" : "Items"}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            {categoryPieData.slice(0, 4).map(c => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                  <span className="text-nv-700">{c.name}</span>
                </div>
                <span className="num font-bold text-nv-900">{tNum(c.value)} {isBn ? "টি" : "pcs"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Sales & Low Stock Warning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Sales Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-nv-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-nv-100 flex items-center justify-between">
            <h3 className="font-display font-bold text-nv-900 text-sm sm:text-base">
              {isBn ? "সাম্প্রতিক বিক্রয় ও ইনভয়েস" : "Recent Sales & Invoices"}
            </h3>
            <button onClick={() => setScreen("pos")} className="text-xs font-bold text-em-700 hover:underline">
              {isBn ? "নতুন বিক্রয়" : "New Sale"} →
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-nv-50 border-b border-nv-200">
                  <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "ইনভয়েস" : "Invoice"}</th>
                  <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "গ্রাহক" : "Customer"}</th>
                  <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "আইটেম" : "Items"}</th>
                  <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "মোট টাকা" : "Total"}</th>
                  <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "মাধ্যম" : "Method"}</th>
                  <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap text-right">{isBn ? "রসিদ" : "Receipt"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nv-100">
                {sales.slice(0, 5).map(s => (
                  <tr key={s.id} className="hover:bg-nv-50 transition-fast">
                    <td className="px-4 py-3 font-mono font-bold text-nv-900 whitespace-nowrap">{tNum(s.invoiceNo)}</td>
                    <td className="px-4 py-3 font-medium text-nv-800 whitespace-nowrap">{s.customer}</td>
                    <td className="px-4 py-3 text-nv-600 whitespace-nowrap">{tNum(s.items.length)} {isBn ? "টি" : "items"}</td>
                    <td className="px-4 py-3 num font-bold text-em-700 whitespace-nowrap">{formatTaka(s.grandTotal)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase
                        ${s.paymentMethod === "bkash" ? "bg-pink-100 text-pink-700" : s.paymentMethod === "due" ? "bg-red-100 text-red-700" : "bg-em-100 text-em-800"}`}>
                        {s.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setCurrentInvoice(s);
                          setScreen("invoice");
                        }}
                        className="p-1 rounded-lg hover:bg-nv-100 text-nv-600 hover:text-em-700 transition-fast inline-flex items-center gap-1"
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

        {/* Low Stock Box */}
        <div className="bg-white rounded-2xl shadow-sm border border-nv-200 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-nv-100">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              <h3 className="font-display font-bold text-nv-900 text-sm">{isBn ? "কম স্টক অ্যালার্ট" : "Low Stock Alerts"}</h3>
            </div>
            <button onClick={() => setScreen("inventory")} className="text-xs text-em-700 font-bold hover:underline">
              {isBn ? "সব দেখুন" : "View All"}
            </button>
          </div>

          <div className="divide-y divide-nv-100 my-2 overflow-y-auto max-h-56">
            {lowStockProducts.slice(0, 4).map(p => (
              <div key={p.id} className="py-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xl flex-shrink-0">{p.image || "📦"}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-nv-900 truncate">{isBn ? p.nameBn : p.name}</div>
                    <div className="text-[10px] text-nv-400">Min: {tNum(p.min)} pcs</div>
                  </div>
                </div>
                <span className={`num font-bold text-xs ${p.stock === 0 ? "text-red-600" : "text-amber-700"}`}>
                  {tNum(p.stock)} {isBn ? "টি বাকি" : "left"}
                </span>
              </div>
            ))}
            {lowStockProducts.length === 0 && (
              <div className="py-8 text-center text-nv-400 text-xs">
                {isBn ? "সকল পণ্যের স্টক পর্যাপ্ত আছে!" : "All stocks healthy!"}
              </div>
            )}
          </div>

          <button
            onClick={() => setScreen("purchases")}
            className="w-full py-2.5 bg-nv-50 hover:bg-nv-100 text-nv-800 text-xs font-bold rounded-xl transition-fast text-center"
          >
            {isBn ? "সাপ্লায়ার অর্ডার তৈরি করুন" : "Create Purchase Order"} →
          </button>
        </div>
      </div>
    </div>
  );
}
