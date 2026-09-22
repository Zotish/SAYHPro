import { useState, useEffect } from "react";
import { Search, X, Package, Users, Receipt, LayoutDashboard, Scan, ShoppingCart, Truck, CreditCard, Wallet, UserCheck, BarChart2, Settings, ArrowRight, Sparkles, MessageSquare, Landmark, Store, Globe2, ShieldAlert } from "lucide-react";
import { useApp } from "../context/AppContext";
import ProductThumb from "./ProductThumb";

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
    { id: "dashboard", label: "Dashboard", labelBn: "Dwumadie Bea", icon: LayoutDashboard },
    { id: "marketing", label: "SMS & Facebook Marketing Hub", labelBn: "Dawubɔ & SMS Kampaen", icon: MessageSquare },
    { id: "delivery", label: "Delivery Aggregator (Ghana Post EMS, FedEx, DHL, Bolt)", labelBn: "Delivery & Nnoɔma Maneɛ", icon: Truck },
    { id: "fintech", label: "Banking, SME Loans & GhQR Digital Payments", labelBn: "Sikakorabea, Bosea & GhQR Tua Ka", icon: Landmark },
    { id: "reselling", label: "Reselling & Drop-Shipping Wholesale Catalog", labelBn: "Tɔn-Bio & Nnoɔma Dodoɔ Katalɔg", icon: Store },
    { id: "website", label: "No-Code Website & Online Storefront Builder", labelBn: "Intanɛte Dukan & Wɛbsaet Si", icon: Globe2 },
    { id: "alerts", label: "Monitoring & Smart Business Alert System", labelBn: "Nhwɛsoɔ & Dukan Ho Kɔkɔbɔ", icon: ShieldAlert },
    { id: "pos", label: "POS / New Sale", labelBn: "POS / Tɔn Nnoɔma", icon: Scan },
    { id: "inventory", label: "Stock / Inventory", labelBn: "Akorae (Stock)", icon: Package },
    { id: "dues", label: "Customer Dues", labelBn: "Atɔfoɔ Aka Nhoma", icon: CreditCard },
    { id: "expenses", label: "Expenses", labelBn: "Ka", icon: Receipt },
    { id: "purchases", label: "Purchases", labelBn: "Nnoɔma a Wɔatɔ", icon: Truck },
    { id: "customers", label: "Customers", labelBn: "Otɔfoɔ", icon: Users },
    { id: "cash", label: "Cash & Accounts", labelBn: "Sika & Akawnt", icon: Wallet },
    { id: "employees", label: "Employees", labelBn: "Adwumayɛfoɔ", icon: UserCheck },
    { id: "advisory", label: "Buy Advisory - What to Buy Next", labelBn: "Deɛ Ɛsɛ Sɛ Wotɔ (Advisory)", icon: Package },
    { id: "analytics", label: "Business Analytics & Insights", labelBn: "Dukan Akontaabuo Ntianso", icon: BarChart2 },
    { id: "reports", label: "Reports & Profit/Loss", labelBn: "Amanneɛbɔ", icon: BarChart2 },
    { id: "settings", label: "Settings", labelBn: "Nhyehyɛeɛ", icon: Settings },
  ].filter(item =>
    query.trim()
      ? item.label.toLowerCase().includes(query.toLowerCase()) || item.labelBn.includes(query)
      : true
  ).slice(0, query.trim() ? 5 : 8);

  const navigateTo = (screen: string) => {
    setScreen(screen);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-20 p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-nv-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Search Header */}
        <div className="p-4 border-b border-nv-200 flex items-center gap-3 bg-nv-50/50">
          <Search size={20} className="text-ink flex-shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={isBn ? "Hwehwɛ nnoɔma, atɔfoɔ, invois anaa nkratafa..." : "Search products, customers, invoices, or pages..."}
            className="flex-1 bg-transparent text-ink placeholder:text-ink text-base focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-ink hover:text-ink p-1">
              <X size={16} />
            </button>
          )}
          <button onClick={onClose} className="text-xs bg-nv-200 text-ink px-2 py-1 rounded-md font-mono hidden sm:inline">
            ESC
          </button>
          <button onClick={onClose} className="sm:hidden text-ink hover:text-ink">
            <X size={20} />
          </button>
        </div>

        {/* Search Results */}
        <div className="overflow-y-auto p-3 space-y-4 flex-1">
          {/* Products */}
          {filteredProducts.length > 0 && (
            <div>
              <p className="text-[11px] font-bold tracking-wider text-ink uppercase px-2 mb-1.5">
                {isBn ? "Nnoɔma" : "Products"}
              </p>
              <div className="space-y-1">
                {filteredProducts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => navigateTo("inventory")}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-nv-100 transition-fast text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <ProductThumb
                        src={p.image}
                        alt={p.name}
                        className="w-8 h-8 rounded-lg object-contain bg-nv-50 p-0.5 border border-nv-200/60 flex-shrink-0"
                        sizeClass="text-base"
                      />
                      <div>
                        <div className="text-sm font-semibold text-ink group-hover:text-ink">
                          {isBn ? p.nameBn : p.name}
                        </div>
                        <div className="text-xs text-ink font-mono">
                          {p.sku} · {p.category}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="num font-bold text-sm text-ink">{formatTaka(p.sellPrice)}</div>
                      <div className="text-xs text-ink">{tNum(p.stock)} {isBn ? "wɔ akorae" : "in stock"}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customers */}
          {filteredCustomers.length > 0 && (
            <div>
              <p className="text-[11px] font-bold tracking-wider text-ink uppercase px-2 mb-1.5">
                {isBn ? "Otɔfoɔ" : "Customers"}
              </p>
              <div className="space-y-1">
                {filteredCustomers.map(c => (
                  <button
                    key={c.id}
                    onClick={() => navigateTo("dues")}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-nv-100 transition-fast text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg text-ink font-bold flex items-center justify-center text-sm">
                        {c.avatar}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-ink group-hover:text-ink">
                          {isBn ? c.nameBn : c.name}
                        </div>
                        <div className="text-xs text-ink">{c.phone}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`num font-bold text-sm ${c.due > 0 ? "text-ink" : "text-ink"}`}>
                        {c.due > 0 ? `${formatTaka(c.due)} ${isBn ? "Aka" : "Due"}` : (isBn ? "Aka Biara Nni Hɔ" : "No Due")}
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
              <p className="text-[11px] font-bold tracking-wider text-ink uppercase px-2 mb-1.5">
                {isBn ? "Invois" : "Invoices"}
              </p>
              <div className="space-y-1">
                {filteredSales.map(s => (
                  <button
                    key={s.id}
                    onClick={() => navigateTo("invoice")}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-nv-100 transition-fast text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg text-ink flex items-center justify-center">
                        <Receipt size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-ink group-hover:text-ink">
                          {tNum(s.invoiceNo)} · {s.customer}
                        </div>
                        <div className="text-xs text-ink">{s.date} {tNum(s.time)}</div>
                      </div>
                    </div>
                    <div className="num font-bold text-sm text-ink">{formatTaka(s.grandTotal)}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pages & Navigation */}
          <div>
            <p className="text-[11px] font-bold tracking-wider text-ink uppercase px-2 mb-1.5">
              {isBn ? "Kwan & Nkratafa" : "Navigation & Pages"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {navigationItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-nv-100 transition-fast text-left group"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-ink group-hover:text-ink transition-fast">
                    <item.icon size={16} />
                  </div>
                  <span className="text-sm font-medium text-ink flex-1">
                    {isBn ? item.labelBn : item.label}
                  </span>
                  <ArrowRight size={13} className="text-ink transition-fast" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-nv-50 border-t border-nv-200 text-xs text-ink flex items-center justify-between">
          <span>{settings.shopName} · {settings.branch}</span>
          <span className="hidden sm:inline">Use ↑↓ keys to navigate</span>
        </div>
      </div>
    </div>
  );
}
