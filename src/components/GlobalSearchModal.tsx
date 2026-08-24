import { useState, useEffect } from "react";
import { Search, X, Package, Users, Receipt, LayoutDashboard, Scan, ShoppingCart, Truck, CreditCard, Wallet, UserCheck, BarChart2, Settings, ArrowRight } from "lucide-react";
import { useApp } from "../context/AppContext";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  setScreen: (s: string) => void;
}

export default function GlobalSearchModal({ isOpen, onClose, setScreen }: GlobalSearchModalProps) {
  const { lang, products, customers, sales, settings, tNum, formatTaka } = useApp();
  const [query, setQuery] = useState("");
  const isBn = lang === "bn";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery("");
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredProducts = query.trim()
    ? products.filter(
        p =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.nameBn.includes(query) ||
          p.sku.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 4)
    : [];

  const filteredCustomers = query.trim()
    ? customers.filter(
        c =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.nameBn.includes(query) ||
          c.phone.includes(query)
      ).slice(0, 3)
    : [];

  const filteredSales = query.trim()
    ? sales.filter(
        s =>
          s.invoiceNo.toLowerCase().includes(query.toLowerCase()) ||
          s.customer.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 3)
    : [];

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", labelBn: "ড্যাশবোর্ড", icon: LayoutDashboard },
    { id: "pos", label: "POS / New Sale", labelBn: "বিক্রি করুন", icon: Scan },
    { id: "products", label: "Products Catalog", labelBn: "পণ্য তালিকা", icon: Package },
    { id: "dues", label: "Customer Dues", labelBn: "বাকির হিসাব", icon: CreditCard },
    { id: "inventory", label: "Inventory Stock", labelBn: "ইনভেন্টরি", icon: Package },
    { id: "expenses", label: "Expenses", labelBn: "খরচ", icon: Receipt },
    { id: "purchases", label: "Purchases", labelBn: "ক্রয়", icon: Truck },
    { id: "customers", label: "Customers", labelBn: "গ্রাহক", icon: Users },
    { id: "cash", label: "Cash & Accounts", labelBn: "ক্যাশ ও হিসাব", icon: Wallet },
    { id: "employees", label: "Employees", labelBn: "কর্মচারী", icon: UserCheck },
    { id: "reports", label: "Reports & Profit/Loss", labelBn: "রিপোর্ট", icon: BarChart2 },
    { id: "settings", label: "Settings", labelBn: "সেটিংস", icon: Settings },
  ].filter(item =>
    query.trim()
      ? item.label.toLowerCase().includes(query.toLowerCase()) || item.labelBn.includes(query)
      : true
  ).slice(0, query.trim() ? 4 : 6);

  const navigateTo = (screen: string) => {
    setScreen(screen);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-20 p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-nv-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Search Header */}
        <div className="p-4 border-b border-nv-200 flex items-center gap-3 bg-nv-50/50">
          <Search size={20} className="text-em-700 flex-shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={isBn ? "পণ্য, গ্রাহক, ইনভয়েস বা মেনু খুঁজুন..." : "Search products, customers, invoices, or pages..."}
            className="flex-1 bg-transparent text-nv-900 placeholder:text-nv-400 text-base focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-nv-400 hover:text-nv-600 p-1">
              <X size={16} />
            </button>
          )}
          <button onClick={onClose} className="text-xs bg-nv-200 text-nv-700 px-2 py-1 rounded-md font-mono hidden sm:inline">
            ESC
          </button>
          <button onClick={onClose} className="sm:hidden text-nv-500 hover:text-nv-900">
            <X size={20} />
          </button>
        </div>

        {/* Search Results */}
        <div className="overflow-y-auto p-3 space-y-4 flex-1">
          {/* Products */}
          {filteredProducts.length > 0 && (
            <div>
              <p className="text-[11px] font-bold tracking-wider text-nv-400 uppercase px-2 mb-1.5">
                {isBn ? "পণ্য" : "Products"}
              </p>
              <div className="space-y-1">
                {filteredProducts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => navigateTo("products")}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-nv-100 transition-fast text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-em-50 text-xl flex items-center justify-center">
                        {p.image || "📦"}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-nv-900 group-hover:text-em-700">
                          {isBn ? p.nameBn : p.name}
                        </div>
                        <div className="text-xs text-nv-400 font-mono">
                          {p.sku} · {p.category}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="num font-bold text-sm text-em-700">{formatTaka(p.sellPrice)}</div>
                      <div className="text-xs text-nv-500">{tNum(p.stock)} {isBn ? "টি বাকি" : "in stock"}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customers */}
          {filteredCustomers.length > 0 && (
            <div>
              <p className="text-[11px] font-bold tracking-wider text-nv-400 uppercase px-2 mb-1.5">
                {isBn ? "গ্রাহক" : "Customers"}
              </p>
              <div className="space-y-1">
                {filteredCustomers.map(c => (
                  <button
                    key={c.id}
                    onClick={() => navigateTo("dues")}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-nv-100 transition-fast text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-sm">
                        {c.avatar}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-nv-900 group-hover:text-blue-700">
                          {isBn ? c.nameBn : c.name}
                        </div>
                        <div className="text-xs text-nv-400">{c.phone}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`num font-bold text-sm ${c.due > 0 ? "text-red-600" : "text-em-700"}`}>
                        {c.due > 0 ? `${formatTaka(c.due)} ${isBn ? "বাকি" : "Due"}` : (isBn ? "বাকি নেই" : "No Due")}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sales / Invoices */}
          {filteredSales.length > 0 && (
            <div>
              <p className="text-[11px] font-bold tracking-wider text-nv-400 uppercase px-2 mb-1.5">
                {isBn ? "ইনভয়েস" : "Invoices"}
              </p>
              <div className="space-y-1">
                {filteredSales.map(s => (
                  <button
                    key={s.id}
                    onClick={() => navigateTo("invoice")}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-nv-100 transition-fast text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                        <Receipt size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-nv-900 group-hover:text-amber-700">
                          {tNum(s.invoiceNo)} · {s.customer}
                        </div>
                        <div className="text-xs text-nv-400">{s.date} {tNum(s.time)}</div>
                      </div>
                    </div>
                    <div className="num font-bold text-sm text-nv-900">{formatTaka(s.grandTotal)}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pages & Navigation */}
          <div>
            <p className="text-[11px] font-bold tracking-wider text-nv-400 uppercase px-2 mb-1.5">
              {isBn ? "দ্রুত মেনু" : "Navigation & Pages"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {navigationItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-nv-100 transition-fast text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-nv-100 group-hover:bg-em-100 flex items-center justify-center text-nv-600 group-hover:text-em-700 transition-fast">
                    <item.icon size={16} />
                  </div>
                  <span className="text-sm font-medium text-nv-800 flex-1">
                    {isBn ? item.labelBn : item.label}
                  </span>
                  <ArrowRight size={13} className="text-nv-300 group-hover:text-nv-600 transition-fast" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-nv-50 border-t border-nv-200 text-xs text-nv-500 flex items-center justify-between">
          <span>{settings.shopName} · {settings.branch}</span>
          <span className="hidden sm:inline">Use ↑↓ keys to navigate</span>
        </div>
      </div>
    </div>
  );
}
