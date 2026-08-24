import { useState } from "react";
import { TrendingUp, Wallet, Users, ShoppingCart, Plus, ArrowUpRight, Package, CreditCard, Receipt, Truck, ChevronRight, Bell, ArrowLeft } from "lucide-react";
import { useApp } from "../context/AppContext";

interface MobileProps {
  lang: "en" | "bn";
  setScreen: (s: string) => void;
}

export default function MobileDashboard({ lang, setScreen }: MobileProps) {
  const { sales, products, customers, expenses, accounts, settings, notifications } = useApp();
  const isBn = lang === "bn";
  const [showFAB, setShowFAB] = useState(false);

  const totalSalesAmount = sales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalCashBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const totalCustomerDues = customers.reduce((sum, c) => sum + c.due, 0);
  const unreadNotifs = notifications.filter(n => !n.read).length;

  const quickActions = [
    { icon: ShoppingCart, label: "New Sale", labelBn: "বিক্রয় (POS)", color: "bg-em-700", screen: "pos" },
    { icon: Receipt, label: "Expense", labelBn: "খরচ", color: "bg-amber-500", screen: "expenses" },
    { icon: Package, label: "Products", labelBn: "পণ্য", color: "bg-blue-600", screen: "products" },
    { icon: CreditCard, label: "Collect Due", labelBn: "বাকি খাতা", color: "bg-red-500", screen: "dues" },
  ];

  return (
    <div className="bg-nv-50 min-h-screen pb-32 relative select-none">
      {/* Header */}
      <div className="sidebar-gradient px-5 pt-6 pb-16 text-white">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button onClick={() => setScreen("dashboard")} className="p-1 rounded-lg bg-white/10 text-white hover:bg-white/20">
              <ArrowLeft size={18} />
            </button>
            <div>
              <p className="text-em-200 text-xs">{isBn ? "শুভ সকাল," : "Good morning,"}</p>
              <h1 className="font-display text-lg font-bold text-white">{settings.ownerName} 👋</h1>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setScreen("notifications")}
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white"
            >
              <Bell size={18} />
            </button>
            {unreadNotifs > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {unreadNotifs}
              </span>
            )}
          </div>
        </div>

        {/* Main Live Balance Card */}
        <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-md border border-white/10 shadow-lg">
          <p className="text-em-200 text-xs mb-1 font-semibold">{isBn ? "আজকের মোট বিক্রয় (Live Sales)" : "Today's Total Sales"}</p>
          <div className="num text-3xl font-extrabold text-white mb-3">৳{totalSalesAmount.toLocaleString()}</div>
          <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-center">
            <div>
              <div className="num font-bold text-sm text-white">৳{(totalCashBalance / 1000).toFixed(1)}k</div>
              <div className="text-em-300 text-[10px] mt-0.5">{isBn ? "ক্যাশ ব্যালেন্স" : "Cash / Bank"}</div>
            </div>
            <div>
              <div className="num font-bold text-sm text-red-300">৳{(totalCustomerDues / 1000).toFixed(1)}k</div>
              <div className="text-red-200 text-[10px] mt-0.5">{isBn ? "বাকি পাওনা" : "Due Balance"}</div>
            </div>
            <div>
              <div className="num font-bold text-sm text-white">{products.length} pcs</div>
              <div className="text-em-300 text-[10px] mt-0.5">{isBn ? "মোট পণ্য" : "Products"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="px-5 -mt-8">
        <div className="bg-white rounded-2xl shadow-xl border border-nv-200 p-4">
          <p className="text-xs font-bold text-nv-500 uppercase tracking-wider mb-3">{isBn ? "দ্রুত কাজ" : "Quick Actions"}</p>
          <div className="grid grid-cols-4 gap-2">
            {quickActions.map(a => (
              <button
                key={a.label}
                onClick={() => setScreen(a.screen)}
                className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
              >
                <div className={`w-12 h-12 rounded-2xl ${a.color} flex items-center justify-center text-white shadow-md`}>
                  <a.icon size={20} />
                </div>
                <span className="text-[11px] font-semibold text-nv-700 text-center">{isBn ? a.labelBn : a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-5 mt-4 grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 border-l-4 border-em-500 shadow-sm">
          <div className="num text-xl font-bold text-nv-900">৳{totalSalesAmount.toLocaleString()}</div>
          <div className="text-xs text-nv-500 mt-0.5">{isBn ? "আজকের বিক্রয়" : "Today's Sales"}</div>
          <div className="text-[11px] font-bold text-em-700 mt-1">{sales.length} Invoices</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border-l-4 border-red-500 shadow-sm">
          <div className="num text-xl font-bold text-red-600">৳{totalCustomerDues.toLocaleString()}</div>
          <div className="text-xs text-nv-500 mt-0.5">{isBn ? "বাকি পাওনা" : "Customer Dues"}</div>
          <div className="text-[11px] font-bold text-red-600 mt-1">{customers.filter(c => c.due > 0).length} Customers</div>
        </div>
      </div>

      {/* Recent Sales List */}
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-nv-900 text-sm">{isBn ? "সাম্প্রতিক বিক্রয়" : "Recent Sales"}</h3>
          <button className="text-xs text-em-700 font-bold" onClick={() => setScreen("sales")}>
            {isBn ? "সব দেখুন" : "View All"} →
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-nv-200 divide-y divide-nv-100 overflow-hidden">
          {sales.slice(0, 4).map(s => (
            <div key={s.id} className="p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-em-50 text-em-700 flex items-center justify-center flex-shrink-0">
                  <ArrowUpRight size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-nv-900 truncate">{s.invoiceNo} · {s.customer}</div>
                  <div className="text-[10px] text-nv-400">{s.time} · {s.paymentMethod.toUpperCase()}</div>
                </div>
              </div>
              <div className="num font-bold text-sm text-em-700">৳{s.grandTotal.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
