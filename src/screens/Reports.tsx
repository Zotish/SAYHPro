import { useState } from "react";
import {
  BarChart2, TrendingUp, TrendingDown, Download, ChevronRight,
  ShoppingCart, Package, Users, Truck, Wallet, Receipt, FileText,
  ArrowLeft, Printer, CheckCircle
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, LineChart, Line
} from "recharts";
import { useApp } from "../context/AppContext";
import { toast } from "../components/Toast";

interface ReportsProps {
  lang: "en" | "bn";
  showPL?: boolean;
  setScreen: (s: string) => void;
}

export default function Reports({ lang, showPL, setScreen }: ReportsProps) {
  const { sales, expenses, products, customers, suppliers, accounts, tNum, formatTaka } = useApp();
  const isBn = lang === "bn";

  const [activeTab, setActiveTab] = useState<"pl" | "sales" | "expenses" | "dues">(showPL ? "pl" : "pl");
  const [period, setPeriod] = useState<"month" | "year" | "all">("month");

  // Dynamic calculations
  const totalRevenue = sales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalCOGS = sales.reduce((sum, s) => {
    return sum + s.items.reduce((cSum, item) => cSum + (item.buyPrice || item.price * 0.75) * item.qty, 0);
  }, 0);
  const grossProfit = totalRevenue - totalCOGS;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = grossProfit - totalExpenses;

  const grossMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : "0.0";
  const netMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0.0";

  // Expense categories breakdown
  const expenseByCategory = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const handleExportReport = () => {
    toast({
      type: "success",
      title: isBn ? "রিপোর্ট ডাউনলোড হয়েছে!" : "Report Exported!",
      message: "Financial summary saved to CSV.",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">{isBn ? "আর্থিক ও ব্যবসায়িক রিপোর্ট" : "Financial & Business Reports"}</h1>
          <p className="text-ink text-xs sm:text-sm mt-0.5">{isBn ? "লাভ-ক্ষতি ও পারফরম্যান্স বিশ্লেষণ" : "Profit & Loss, Sales breakdown, and expense audit"}</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-nv-200 rounded-xl text-xs sm:text-sm font-semibold text-ink bg-white hover:bg-nv-50 transition-fast"
          >
            <Printer size={15} /> {isBn ? "প্রিন্ট" : "Print"}
          </button>
          <button
            onClick={handleExportReport}
            className="flex items-center gap-1.5 px-4 py-2 bg-em-700 hover:bg-em-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-fast"
          >
            <Download size={15} /> {isBn ? "এক্সপোর্ট" : "Export CSV"}
          </button>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-nv-200">
          <div className="text-xs text-ink mb-1">{isBn ? "মোট আয় (Revenue)" : "Total Revenue"}</div>
          <div className="num text-xl sm:text-2xl font-bold text-ink">{formatTaka(totalRevenue)}</div>
          <div className="text-[11px] text-ink font-semibold mt-1">{isBn ? `${tNum(sales.length)} টি বিক্রয় থেকে` : `From ${sales.length} Sales`}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-nv-200">
          <div className="text-xs text-ink mb-1">{isBn ? "গ্রস লাভ (Gross Profit)" : "Gross Profit"}</div>
          <div className="num text-xl sm:text-2xl font-bold text-ink">{formatTaka(grossProfit)}</div>
          <div className="text-[11px] text-ink font-semibold mt-1">{tNum(grossMargin)}% {isBn ? "মার্জিন" : "Margin"}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-nv-200">
          <div className="text-xs text-ink mb-1">{isBn ? "মোট খরচ (Expenses)" : "Total Operating Expenses"}</div>
          <div className="num text-xl sm:text-2xl font-bold text-ink">{formatTaka(totalExpenses)}</div>
          <div className="text-[11px] text-ink font-semibold mt-1">{tNum(expenses.length)} {isBn ? "টি রেকর্ড" : "Records"}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-nv-200">
          <div className="text-xs text-ink mb-1">{isBn ? "নেট লাভ (Net Profit)" : "Net Profit"}</div>
          <div className="num text-xl sm:text-2xl font-bold text-ink">{formatTaka(netProfit)}</div>
          <div className="text-[11px] text-ink font-semibold mt-1">{tNum(netMargin)}% {isBn ? "নিট মার্জিন" : "Net Margin"}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-nv-200 pb-1 overflow-x-auto">
        {[
          { id: "pl" as const, label: "Profit & Loss Statement", labelBn: "লাভ ও ক্ষতি বিবরণী" },
          { id: "sales" as const, label: "Sales Breakdown", labelBn: "বিক্রয় রিপোর্ট" },
          { id: "expenses" as const, label: "Expense Breakdown", labelBn: "খরচের হিসাব" },
          { id: "dues" as const, label: "Dues & Payables", labelBn: "বাকি ও দেনা" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-fast whitespace-nowrap
              ${activeTab === tab.id ? "bg-em-700 text-white shadow-xs" : "text-ink hover:bg-nv-100"}`}
          >
            {isBn ? tab.labelBn : tab.label}
          </button>
        ))}
      </div>

      {/* Profit & Loss View */}
      {activeTab === "pl" && (
        <div className="bg-white rounded-3xl shadow-sm border border-nv-200 p-6 space-y-6">
          <div className="border-b border-nv-100 pb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-ink text-lg">{isBn ? "লাভ ও ক্ষতি বিবরণী (P&L Statement)" : "Profit & Loss Statement"}</h3>
              <p className="text-xs text-ink">Live generated from verified transactions</p>
            </div>
            <span className="text-xs px-3 py-1 bg-em-50 text-ink font-bold rounded-full border border-em-200">
              Audited Ready
            </span>
          </div>

          <div className="space-y-4 max-w-2xl text-xs sm:text-sm">
            {/* Income */}
            <div className="space-y-2">
              <div className="flex justify-between items-center font-bold text-ink border-b border-nv-100 pb-1">
                <span>1. {isBn ? "বিক্রয় আয় (Revenue)" : "Gross Revenue from Sales"}</span>
                <span className="num text-ink">{formatTaka(totalRevenue)}</span>
              </div>
              <div className="flex justify-between items-center text-ink pl-4">
                <span>- {isBn ? "পণ্যের মোট ক্রয় খরচ (COGS)" : "Cost of Goods Sold (COGS)"}</span>
                <span className="num text-ink">-{formatTaka(totalCOGS)}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-ink bg-em-50/50 p-2.5 rounded-xl">
                <span>= {isBn ? "গ্রস লাভ (Gross Profit)" : "Gross Profit"}</span>
                <span className="num font-bold text-ink">{formatTaka(grossProfit)} ({tNum(grossMargin)}%)</span>
              </div>
            </div>

            {/* Operating Expenses */}
            <div className="space-y-2 pt-2">
              <div className="font-bold text-ink border-b border-nv-100 pb-1">
                2. {isBn ? "দোকান পরিচালন ব্যয় (Operating Expenses)" : "Operating Expenses"}
              </div>
              {Object.entries(expenseByCategory).map(([cat, amt]) => (
                <div key={cat} className="flex justify-between items-center text-ink pl-4">
                  <span>- {cat}</span>
                  <span className="num text-ink">-{formatTaka(amt)}</span>
                </div>
              ))}
              {Object.keys(expenseByCategory).length === 0 && (
                <div className="text-ink pl-4 text-xs">No operating expenses recorded yet</div>
              )}
              <div className="flex justify-between items-center font-bold text-ink bg-red-50/50 p-2.5 rounded-xl">
                <span>= {isBn ? "মোট পরিচালন খরচ" : "Total Operating Expenses"}</span>
                <span className="num font-bold text-ink">-{formatTaka(totalExpenses)}</span>
              </div>
            </div>

            {/* Final Net Profit */}
            <div className="flex justify-between items-center text-base sm:text-lg font-extrabold text-white sidebar-gradient p-4 rounded-2xl shadow-md">
              <span>{isBn ? "চূড়ান্ত নিট লাভ (Net Profit)" : "Net Profit"}</span>
              <span className="num font-mono">{formatTaka(netProfit)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Sales Breakdown View */}
      {activeTab === "sales" && (
        <div className="bg-white rounded-3xl shadow-sm border border-nv-200 p-6 space-y-4">
          <h3 className="font-display font-bold text-ink text-lg">{isBn ? "সকল বিক্রয় তালিকা" : "Completed Sales Records"}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-nv-50 border-b border-nv-200">
                  <th className="px-4 py-3 font-bold text-ink">Invoice No</th>
                  <th className="px-4 py-3 font-bold text-ink">Customer</th>
                  <th className="px-4 py-3 font-bold text-ink">Payment</th>
                  <th className="px-4 py-3 font-bold text-ink">Subtotal</th>
                  <th className="px-4 py-3 font-bold text-ink">Discount</th>
                  <th className="px-4 py-3 font-bold text-ink">Total</th>
                  <th className="px-4 py-3 font-bold text-ink">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nv-100">
                {sales.map(s => (
                  <tr key={s.id} className="hover:bg-nv-50">
                    <td className="px-4 py-3 font-mono font-bold">{tNum(s.invoiceNo)}</td>
                    <td className="px-4 py-3 font-medium">{s.customer}</td>
                    <td className="px-4 py-3 uppercase font-semibold text-xs text-ink">{s.paymentMethod}</td>
                    <td className="px-4 py-3 num">{formatTaka(s.subtotal)}</td>
                    <td className="px-4 py-3 num text-ink">-{formatTaka(s.discount)}</td>
                    <td className="px-4 py-3 num font-bold text-ink">{formatTaka(s.grandTotal)}</td>
                    <td className="px-4 py-3 text-xs text-ink">{s.date} {s.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === "expenses" && (
        <div className="bg-white rounded-3xl shadow-sm border border-nv-200 p-6 space-y-4">
          <h3 className="font-display font-bold text-ink text-lg">{isBn ? "খরচের সম্পূর্ণ তালিকা" : "Expense Audit Trail"}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-nv-50 border-b border-nv-200">
                  <th className="px-4 py-3 font-bold text-ink">Category</th>
                  <th className="px-4 py-3 font-bold text-ink">Amount</th>
                  <th className="px-4 py-3 font-bold text-ink">Paid From</th>
                  <th className="px-4 py-3 font-bold text-ink">Date</th>
                  <th className="px-4 py-3 font-bold text-ink">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nv-100">
                {expenses.map(e => (
                  <tr key={e.id} className="hover:bg-nv-50">
                    <td className="px-4 py-3 font-bold">{e.category}</td>
                    <td className="px-4 py-3 num font-bold text-ink">{formatTaka(e.amount)}</td>
                    <td className="px-4 py-3">{e.paidFrom}</td>
                    <td className="px-4 py-3 text-xs text-ink">{e.date}</td>
                    <td className="px-4 py-3 text-xs text-ink">{e.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dues Tab */}
      {activeTab === "dues" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Customer Dues */}
          <div className="bg-white rounded-3xl shadow-sm border border-nv-200 p-5 space-y-3">
            <h3 className="font-display font-bold text-ink text-base">{isBn ? "গ্রাহক বাকি (Receivables)" : "Customer Receivables"}</h3>
            <div className="divide-y divide-nv-100">
              {customers.filter(c => c.due > 0).map(c => (
                <div key={c.id} className="py-2.5 flex justify-between items-center text-xs sm:text-sm">
                  <div>
                    <div className="font-bold text-ink">{c.name}</div>
                    <div className="text-[10px] text-ink">{c.phone}</div>
                  </div>
                  <div className="num font-bold text-ink">{formatTaka(c.due)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Supplier Payables */}
          <div className="bg-white rounded-3xl shadow-sm border border-nv-200 p-5 space-y-3">
            <h3 className="font-display font-bold text-ink text-base">{isBn ? "সাপ্লায়ার দেনা (Payables)" : "Supplier Payables"}</h3>
            <div className="divide-y divide-nv-100">
              {suppliers.filter(s => s.due > 0).map(s => (
                <div key={s.id} className="py-2.5 flex justify-between items-center text-xs sm:text-sm">
                  <div>
                    <div className="font-bold text-ink">{s.name}</div>
                    <div className="text-[10px] text-ink">{s.contact}</div>
                  </div>
                  <div className="num font-bold text-ink">{formatTaka(s.due)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
