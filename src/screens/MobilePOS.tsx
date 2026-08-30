import { useState } from "react";
import {
  Search, Plus, Minus, Trash2, CheckCircle, X, Barcode,
  User, ChevronDown, Receipt, Smartphone, Banknote, CreditCard, ArrowLeft, ArrowRight
} from "lucide-react";
import { useApp, Product, CartItem } from "../context/AppContext";
import { toast } from "../components/Toast";

interface MobilePOSProps {
  lang: "en" | "bn";
  setScreen: (s: string) => void;
}

const payMethods = [
  { id: "cash" as const, label: "Cash", labelBn: "নগদ", icon: Banknote, color: "#16A34A" },
  { id: "bkash" as const, label: "bKash", labelBn: "বিকাশ", icon: Smartphone, color: "#E91E8C" },
  { id: "nagad" as const, label: "Nagad", labelBn: "নগদ", icon: Smartphone, color: "#D97706" },
  { id: "card" as const, label: "Card", labelBn: "কার্ড", icon: CreditCard, color: "#475569" },
  { id: "due" as const, label: "Due", labelBn: "বাকিতে", icon: Receipt, color: "#DC2626" },
];

type MobileView = "products" | "cart" | "payment" | "success";

export default function MobilePOS({ lang, setScreen }: MobilePOSProps) {
  const { products, customers, completeSale, setCurrentInvoice, tNum, formatTaka } = useApp();
  const isBn = lang === "bn";

  const [view, setView] = useState<MobileView>("products");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [payment, setPayment] = useState<"cash" | "bkash" | "nagad" | "card" | "due">("cash");
  const [cashGiven, setCashGiven] = useState("");
  const [lastSale, setLastSale] = useState<any>(null);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.nameBn.includes(search) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (p: Product) => {
    if (p.stock <= 0) {
      toast({ type: "error", title: "Out of Stock" });
      return;
    }

    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) {
        if (ex.qty >= p.stock) return prev;
        return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { id: p.id, name: p.name, nameBn: p.nameBn, price: p.sellPrice, buyPrice: p.buyPrice, qty: 1, discount: 0, image: p.image }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    const prod = products.find(p => p.id === id);
    setCart(prev =>
      prev
        .map(i => {
          if (i.id === id) {
            const newQty = i.qty + delta;
            if (prod && newQty > prod.stock) return i;
            return newQty > 0 ? { ...i, qty: newQty } : null;
          }
          return i;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const change = cashGiven ? Math.max(0, parseFloat(cashGiven) - total) : 0;
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const handleFinishSale = () => {
    const saleItems = cart.map(i => ({
      name: i.name,
      nameBn: i.nameBn,
      qty: i.qty,
      price: i.price,
      buyPrice: i.buyPrice,
      discount: 0,
    }));

    const isDue = payment === "due";
    const res = completeSale({
      customer: "Walk-in Customer",
      items: saleItems,
      subtotal: total,
      discount: 0,
      vat: 0,
      grandTotal: total,
      paid: isDue ? 0 : total,
      due: isDue ? total : 0,
      paymentMethod: payment,
      cashGiven: cashGiven ? parseFloat(cashGiven) : total,
      change,
    });

    setLastSale(res);
    setView("success");
  };

  return (
    <div className="h-screen bg-nv-50 flex flex-col overflow-hidden select-none">
      {/* Success View */}
      {view === "success" && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 text-ink shadow-sm">
            <CheckCircle size={44} className="stroke-[2.5]" />
          </div>
          <h2 className="font-display text-2xl font-bold text-ink mb-1">
            {isBn ? "বিক্রয় সফলভাবে সম্পন্ন!" : "Sale Completed!"}
          </h2>
          <div className="num text-4xl font-extrabold text-ink mb-1">{formatTaka(total)}</div>
          <p className="text-ink text-xs mb-4">{tNum(lastSale?.invoiceNo || "INV-1044")} · Walk-in Customer</p>

          {change > 0 && (
            <div className="bg-em-50 border border-em-200 rounded-2xl px-6 py-2.5 mb-6">
              <p className="text-ink font-bold text-base">
                {isBn ? `ফেরত: ${formatTaka(change)}` : `Change: ${formatTaka(change)}`}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2.5 w-full max-w-xs">
            <button
              onClick={() => {
                if (lastSale) setCurrentInvoice(lastSale);
                setScreen("invoice");
              }}
              className="w-full py-3.5 bg-nv-900 text-white rounded-2xl text-sm font-bold shadow-md"
            >
              {isBn ? "রসিদ দেখুন / প্রিন্ট" : "View Invoice"}
            </button>
            <button
              onClick={() => {
                setCart([]);
                setCashGiven("");
                setView("products");
              }}
              className="w-full py-3 bg-nv-100 hover:bg-nv-200 text-ink rounded-2xl text-sm font-bold"
            >
              {isBn ? "নতুন বিক্রয় করুন" : "Start New Sale"}
            </button>
          </div>
        </div>
      )}

      {/* Catalog View */}
      {view === "products" && (
        <>
          <div className="sidebar-gradient px-4 pt-6 pb-4 flex-shrink-0 text-white shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <button onClick={() => setScreen("mobile-dashboard")} className="p-1 rounded-lg bg-white/10">
                  <ArrowLeft size={20} />
                </button>
                <h1 className="font-display font-bold text-lg">{isBn ? "মোবাইল বিক্রয় (POS)" : "Mobile POS"}</h1>
              </div>
              {cartCount > 0 && (
                <button
                  onClick={() => setView("cart")}
                  className="relative p-2 bg-em-600 text-white font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <Receipt size={18} />
                  <span className="text-xs">{tNum(cartCount)}</span>
                </button>
              )}
            </div>
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                type="text"
                placeholder={isBn ? "পণ্য খুঁজুন..." : "Search products..."}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white text-ink placeholder:text-ink text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 pb-24 space-y-2">
            <div className="grid grid-cols-2 gap-2.5">
              {filtered.map(p => {
                const inCart = cart.find(i => i.id === p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className={`bg-white rounded-2xl p-3.5 text-left border transition-all relative flex flex-col justify-between shadow-2xs
                      ${inCart ? "border-em-500 ring-2 ring-em-500/20" : "border-nv-200"}`}
                  >
                    {inCart && (
                      <span className="absolute top-2 right-2 w-5 h-5 bg-em-700 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                        {tNum(inCart.qty)}
                      </span>
                    )}
                    <div>
                      <div className="text-3xl text-center py-1">{p.image || "📦"}</div>
                      <div className="text-xs font-bold text-ink line-clamp-2 min-h-[2rem]">{isBn ? p.nameBn : p.name}</div>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-nv-100">
                      <span className="num font-bold text-ink text-sm">{formatTaka(p.sellPrice)}</span>
                      <span className="text-[10px] text-ink font-medium">{tNum(p.stock)} left</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Bar */}
          {cartCount > 0 && (
            <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-nv-200 shadow-2xl">
              <button
                onClick={() => setView("cart")}
                className="w-full py-3.5 bg-em-600 text-white rounded-2xl font-bold text-sm flex items-center justify-between px-5 shadow-lg"
              >
                <span className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center text-xs font-bold">{tNum(cartCount)}</span>
                <span>{isBn ? "কার্ট দেখুন ও পেমেন্ট" : "View Cart & Pay"}</span>
                <span className="num font-extrabold text-base">{formatTaka(total)}</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* Cart View */}
      {view === "cart" && (
        <>
          <div className="sidebar-gradient px-4 pt-6 pb-4 flex items-center gap-3 text-white flex-shrink-0">
            <button onClick={() => setView("products")} className="p-1 rounded-lg bg-white/10">
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-display font-bold text-lg">{isBn ? "কার্ট পর্যালোচনা" : "Order Cart"}</h1>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-2xl border border-nv-200 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-2xl">{item.image || "📦"}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-ink truncate">{isBn ? item.nameBn : item.name}</div>
                    <div className="num text-[11px] text-ink">{formatTaka(item.price)} each</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-nv-100 rounded-lg p-0.5">
                    <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
                      <Minus size={11} />
                    </button>
                    <span className="num font-bold text-xs w-6 text-center">{tNum(item.qty)}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
                      <Plus size={11} />
                    </button>
                  </div>
                  <span className="num font-bold text-xs w-14 text-right text-ink">{formatTaka(item.price * item.qty)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-white border-t border-nv-200 space-y-3">
            <div className="flex justify-between items-center text-sm font-bold text-ink">
              <span>{isBn ? "মোট পরিমাণ" : "Total Amount"}</span>
              <span className="num text-xl text-ink">{formatTaka(total)}</span>
            </div>
            <button
              onClick={() => setView("payment")}
              className="w-full py-4 bg-em-700 text-white rounded-2xl font-bold text-base shadow-lg"
            >
              {isBn ? "পেমেন্ট নির্বাচন করুন" : "Proceed to Payment"} →
            </button>
          </div>
        </>
      )}

      {/* Payment View */}
      {view === "payment" && (
        <>
          <div className="sidebar-gradient px-4 pt-6 pb-4 flex items-center gap-3 text-white flex-shrink-0">
            <button onClick={() => setView("cart")} className="p-1 rounded-lg bg-white/10">
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-display font-bold text-lg">{isBn ? "পেমেন্ট মাধ্যম" : "Payment"}</h1>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="bg-white rounded-3xl p-6 text-center border border-nv-200 shadow-sm">
              <p className="text-xs font-semibold text-ink">{isBn ? "পরিশোধযোগ্য টাকা" : "Grand Total Due"}</p>
              <div className="num text-4xl font-extrabold text-ink mt-1">{formatTaka(total)}</div>
            </div>

            <div>
              <p className="text-xs font-bold text-ink uppercase tracking-wider mb-2">{isBn ? "পদ্ধতি নির্বাচন" : "Select Payment Method"}</p>
              <div className="grid grid-cols-3 gap-2">
                {payMethods.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setPayment(m.id)}
                    className={`py-3 rounded-2xl flex flex-col items-center gap-1 text-xs font-bold border-2 transition-all
                      ${payment === m.id ? "border-transparent text-white shadow-md scale-102" : "border-nv-200 bg-white text-ink"}`}
                    style={payment === m.id ? { background: m.color } : {}}
                  >
                    <m.icon size={18} />
                    <span>{isBn ? m.labelBn : m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {payment === "cash" && (
              <div className="bg-white rounded-2xl p-4 border border-nv-200 space-y-2">
                <label className="text-xs font-semibold text-ink">{isBn ? "নগদ গৃহীত টাকা" : "Cash Given"}</label>
                <input
                  type="number"
                  value={cashGiven}
                  onChange={e => setCashGiven(e.target.value)}
                  placeholder={formatTaka(total)}
                  className="num w-full border border-nv-200 rounded-xl px-3 py-2.5 text-lg font-bold text-ink"
                />
                {change > 0 && (
                  <p className="text-xs font-bold text-ink">
                    {isBn ? `ফেরত দিতে হবে: ${formatTaka(change)}` : `Change: ${formatTaka(change)}`}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-nv-200">
            <button
              onClick={handleFinishSale}
              className="w-full py-4 bg-em-600 text-white rounded-2xl font-bold text-base shadow-xl flex items-center justify-center gap-2"
            >
              <CheckCircle size={20} />
              <span>{isBn ? "বিক্রয় সম্পন্ন করুন" : "Complete Sale"}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
