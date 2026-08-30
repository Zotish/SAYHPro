import { useState } from "react";
import {
  TrendingUp, ShoppingCart, Wallet, Truck, Receipt, AlertTriangle, Plus,
  CreditCard, BarChart2, ExternalLink,
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

  // Categorical palette: brand green stepping down, then accent amber.
  // No hue outside the brand system.
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
      {/* Header: title + period selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <h1 className="font-display text-base sm:text-lg font-semibold text-ink">
          {isBn ? "ব্যবসায়িক ওভারভিউ" : "Business Overview"}
        </h1>

        <div className="inline-flex items-center p-0.5 bg-nv-100 border border-nv-200 rounded-lg self-start sm:self-auto">
          {[
            { id: "today" as const, label: "Today", labelBn: "আজ" },
            { id: "week" as const, label: "This Week", labelBn: "এই সপ্তাহ" },
            { id: "month" as const, label: "This Month", labelBn: "এই মাস" },
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

      {/* KPI row — label above value, one accent per card at most */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            icon: ShoppingCart,
            label: isBn ? "আজকের মোট বিক্রয়" : "Total Sales",
            value: formatTaka(totalSalesAmount),
            // tNum() parses its argument as a number, so the sign and unit
            // have to sit outside it or they get stripped.
            meta: `+${tNum(14.2)}% ${isBn ? "গত সপ্তাহের তুলনায়" : "vs last week"}`,
            metaTone: "text-ink",
            valueTone: "text-ink",
          },
          {
            icon: TrendingUp,
            label: isBn ? "নিট লাভ" : "Net Profit",
            value: formatTaka(netProfit),
            meta: `${tNum(((netProfit / (totalSalesAmount || 1)) * 100).toFixed(0))}% ${isBn ? "মার্জিন" : "margin"}`,
            metaTone: "text-ink",
            valueTone: "text-ink",
          },
          {
            icon: Wallet,
            label: isBn ? "ক্যাশ ও ব্যাংক" : "Cash & Bank",
            value: formatTaka(totalCashBalance),
            meta: `${tNum(accounts.length)} ${isBn ? "টি অ্যাকাউন্ট" : "accounts"}`,
            metaTone: "text-ink",
            valueTone: "text-ink",
          },
          {
            icon: CreditCard,
            label: isBn ? "গ্রাহক বকেয়া" : "Customer Dues",
            value: formatTaka(totalCustomerDues),
            meta: `${tNum(customers.filter(c => c.due > 0).length)} ${isBn ? "জন বাকিদার" : "owing"}`,
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
          {isBn ? "দ্রুত কাজ" : "Quick Actions"}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {[
            { label: "New Sale", labelBn: "নতুন বিক্রয় (POS)", icon: ShoppingCart, screen: "pos" },
            { label: "Add Product", labelBn: "পণ্য যোগ করুন", icon: Plus, screen: "addproduct" },
            { label: "Collect Due", labelBn: "বাকি আদায়", icon: CreditCard, screen: "dues" },
            { label: "Marketing", labelBn: "মার্কেটিং ও SMS", icon: MessageSquare, screen: "marketing" },
            { label: "Courier Parcel", labelBn: "কুরিয়ার পার্সেল", icon: Truck, screen: "delivery" },
            { label: "Bank & Loans", labelBn: "ব্যাংক ও লোন", icon: Landmark, screen: "fintech" },
            { label: "Reselling", labelBn: "রিসেলিং মার্কেট", icon: Store, screen: "reselling" },
            { label: "Store Website", labelBn: "অনলাইন স্টোর", icon: Globe2, screen: "website" },
            { label: "Alerts", labelBn: "মনিটরিং অ্যালার্ট", icon: ShieldAlert, screen: "alerts" },
            { label: "Add Expense", labelBn: "খরচ এন্ট্রি", icon: Receipt, screen: "expenses" },
            { label: "Purchases", labelBn: "ক্রয় অর্ডার", icon: Truck, screen: "purchases" },
            { label: "Reports", labelBn: "লাভ-ক্ষতি রিপোর্ট", icon: BarChart2, screen: "reports" },
          ].map(action => (
            <button
              key={action.label}
              onClick={() => setScreen(action.screen)}
              className="p-3.5 bg-white hover:bg-nv-50 border border-nv-200 hover:border-nv-300 rounded-xl font-medium text-xs text-ink flex flex-col items-center justify-center gap-2 transition-colors"
            >
              <action.icon size={18} className="text-ink" />
              <span className="text-center leading-tight">{isBn ? action.labelBn : action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Charts (Sales Area & Category Pie) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-nv-200 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-ink text-sm">{isBn ? "বিক্রয় ও লাভের ট্রেন্ড" : "Sales & Profit Trend"}</h3>
            <div className="flex items-center gap-3 text-xs font-medium text-ink">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-em-600" /> {isBn ? "বিক্রয়" : "Sales"}</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-ac-600" /> {isBn ? "লাভ" : "Profit"}</span>
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
              <span className="text-[10px] text-ink font-medium">{tNum(products.length)} {isBn ? "টি পণ্য" : "Items"}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            {categoryPieData.slice(0, 4).map(c => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                  <span className="text-ink">{c.name}</span>
                </div>
                <span className="num font-semibold text-ink">{tNum(c.value)} {isBn ? "টি" : "pcs"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Sales & Low Stock Warning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Sales Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-nv-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-nv-100 flex items-center justify-between">
            <h3 className="font-display font-semibold text-ink text-sm sm:text-base">
              {isBn ? "সাম্প্রতিক বিক্রয় ও ইনভয়েস" : "Recent Sales & Invoices"}
            </h3>
            <button onClick={() => setScreen("pos")} className="text-xs font-medium text-ink hover:text-ink">
              {isBn ? "নতুন বিক্রয়" : "New Sale"} →
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-nv-50 border-b border-nv-200">
                  <th className="px-4 py-2.5 font-medium text-ink whitespace-nowrap">{isBn ? "ইনভয়েস" : "Invoice"}</th>
                  <th className="px-4 py-2.5 font-medium text-ink whitespace-nowrap">{isBn ? "গ্রাহক" : "Customer"}</th>
                  <th className="px-4 py-2.5 font-medium text-ink whitespace-nowrap">{isBn ? "আইটেম" : "Items"}</th>
                  <th className="px-4 py-2.5 font-medium text-ink whitespace-nowrap">{isBn ? "মোট টাকা" : "Total"}</th>
                  <th className="px-4 py-2.5 font-medium text-ink whitespace-nowrap">{isBn ? "মাধ্যম" : "Method"}</th>
                  <th className="px-4 py-2.5 font-medium text-ink whitespace-nowrap text-right">{isBn ? "রসিদ" : "Receipt"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nv-100">
                {sales.slice(0, 5).map(s => (
                  <tr key={s.id} className="hover:bg-nv-50 transition-fast">
                    <td className="px-4 py-3 font-mono text-ink whitespace-nowrap">{tNum(s.invoiceNo)}</td>
                    <td className="px-4 py-3 font-medium text-ink whitespace-nowrap">{s.customer}</td>
                    <td className="px-4 py-3 text-ink whitespace-nowrap">{tNum(s.items.length)} {isBn ? "টি" : "items"}</td>
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

        {/* Low Stock Box */}
        <div className="bg-white rounded-xl border border-nv-200 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-nv-100">
            <h3 className="font-display font-semibold text-ink text-sm">{isBn ? "কম স্টক অ্যালার্ট" : "Low Stock Alerts"}</h3>
            <button onClick={() => setScreen("inventory")} className="text-xs font-medium text-ink hover:text-ink">
              {isBn ? "সব দেখুন" : "View All"}
            </button>
          </div>

          <div className="divide-y divide-nv-100 my-2 overflow-y-auto max-h-56">
            {lowStockProducts.slice(0, 4).map(p => (
              <div key={p.id} className="py-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xl flex-shrink-0">{p.image || "📦"}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-ink truncate">{isBn ? p.nameBn : p.name}</div>
                    <div className="text-[10px] text-ink">Min: {tNum(p.min)} pcs</div>
                  </div>
                </div>
                <span className={`num font-semibold text-xs ${p.stock === 0 ? "text-ink" : "text-ink"}`}>
                  {tNum(p.stock)} {isBn ? "টি বাকি" : "left"}
                </span>
              </div>
            ))}
            {lowStockProducts.length === 0 && (
              <div className="py-8 text-center text-ink text-xs">
                {isBn ? "সকল পণ্যের স্টক পর্যাপ্ত আছে!" : "All stocks healthy!"}
              </div>
            )}
          </div>

          <button
            onClick={() => setScreen("purchases")}
            className="w-full py-2.5 bg-nv-50 hover:bg-nv-100 text-ink text-xs font-medium rounded-lg transition-colors text-center border border-nv-200"
          >
            {isBn ? "সাপ্লায়ার অর্ডার তৈরি করুন" : "Create Purchase Order"} →
          </button>
        </div>
      </div>
    </div>
  );
}
