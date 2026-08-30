import { useState } from "react";
import {
  Search, Plus, Minus, Trash2, CheckCircle, X, Barcode,
  User, CreditCard, Banknote, Smartphone, Receipt, ChevronDown, RefreshCw, ShoppingCart
} from "lucide-react";
import { useApp, Product, CartItem } from "../context/AppContext";
import { toast } from "../components/Toast";

interface POSProps {
  lang: "en" | "bn";
  setScreen: (s: string) => void;
}

const paymentMethods = [
  { id: "cash" as const, label: "Cash", labelBn: "নগদ", icon: Banknote, color: "bg-em-50 text-ink border-em-300" },
  { id: "bkash" as const, label: "bKash", labelBn: "বিকাশ", icon: Smartphone, color: "bg-nv-50 text-ink border-nv-300" },
  { id: "nagad" as const, label: "Nagad", labelBn: "নগদ", icon: Smartphone, color: "bg-ac-50 text-ink border-ac-300" },
  { id: "card" as const, label: "Card", labelBn: "কার্ড", icon: CreditCard, color: "bg-nv-50 text-ink border-nv-300" },
  { id: "due" as const, label: "Due", labelBn: "বাকিতে বিক্রয়", icon: Receipt, color: "bg-red-50 text-ink border-red-300" },
];

export default function POS({ lang, setScreen }: POSProps) {
  const { products, customers, completeSale, setCurrentInvoice, addCustomer, tNum, formatTaka } = useApp();
  const isBn = lang === "bn";

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState(customers[0]?.name || "Walk-in Customer");
  const [customerPhone, setCustomerPhone] = useState(customers[0]?.phone || "");
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bkash" | "nagad" | "rocket" | "card" | "due">("cash");
  const [cashGiven, setCashGiven] = useState<string>("");

  // Modals
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showSaleCompletedModal, setShowSaleCompletedModal] = useState(false);
  const [completedSaleData, setCompletedSaleData] = useState<any>(null);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  // New Customer Form
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.nameBn.includes(search) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast({
        type: "error",
        title: isBn ? "স্টক শেষ!" : "Out of Stock!",
        message: `${product.name} is currently out of stock.`,
      });
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          toast({
            type: "warning",
            title: isBn ? "সর্বোচ্চ স্টক সীমা" : "Stock Limit Reached",
            message: `Only ${product.stock} pcs available.`,
          });
          return prev;
        }
        return prev.map(item =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          nameBn: product.nameBn,
          price: product.sellPrice,
          buyPrice: product.buyPrice,
          qty: 1,
          discount: 0,
          image: product.image,
        },
      ];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    const prod = products.find(p => p.id === id);
    setCart(prev =>
      prev
        .map(item => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            if (prod && newQty > prod.stock) {
              toast({
                type: "warning",
                title: isBn ? "স্টক সীমা" : "Stock Limit",
                message: `Max ${prod.stock} pcs in stock`,
              });
              return item;
            }
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const grandTotal = Math.max(0, subtotal - discount);
  const cashNum = cashGiven ? parseFloat(cashGiven) : 0;
  const change = paymentMethod === "cash" && cashNum >= grandTotal ? cashNum - grandTotal : 0;
  const isDue = paymentMethod === "due";

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) return;

    addCustomer({
      name: newCustName,
      nameBn: newCustName,
      phone: newCustPhone,
      due: 0,
      status: "new",
    });

    setSelectedCustomer(newCustName);
    setCustomerPhone(newCustPhone);
    setShowAddCustomerModal(false);
    setNewCustName("");
    setNewCustPhone("");
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        type: "warning",
        title: isBn ? "কার্ট খালি!" : "Cart is empty!",
        message: "Please add products to cart before checkout.",
      });
      return;
    }

    const saleItems = cart.map(item => ({
      name: item.name,
      nameBn: item.nameBn,
      qty: item.qty,
      price: item.price,
      buyPrice: item.buyPrice,
      discount: item.discount || 0,
    }));

    const saleResult = completeSale({
      customer: selectedCustomer,
      customerPhone,
      items: saleItems,
      subtotal,
      discount,
      vat: 0,
      grandTotal,
      paid: isDue ? 0 : grandTotal,
      due: isDue ? grandTotal : 0,
      paymentMethod,
      cashGiven: paymentMethod === "cash" && cashNum > 0 ? cashNum : grandTotal,
      change,
    });

    setCompletedSaleData(saleResult);
    setShowSaleCompletedModal(true);
    setCart([]);
    setDiscount(0);
    setCashGiven("");
    setMobileCartOpen(false);
  };

  return (
    <div className="p-3 sm:p-6 pb-28 lg:pb-8 flex flex-col lg:flex-row gap-5 h-[calc(100vh-4.5rem)] overflow-hidden">
      {/* LEFT COLUMN: Catalog & Products Grid */}
      <div className="flex-1 flex flex-col min-w-0 bg-white rounded-3xl shadow-sm border border-nv-200 p-4 sm:p-5 overflow-hidden">
        {/* Search, Scanner & Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={isBn ? "পণ্য বা SKU খুঁজুন..." : "Search products by name or SKU..."}
              className="w-full pl-10 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm bg-nv-50 border border-nv-200 rounded-xl focus:border-em-500 transition-fast"
            />
          </div>
          <button
            onClick={() => setShowBarcodeScanner(true)}
            className="flex items-center gap-1.5 px-3 py-2 sm:py-2.5 bg-nv-100 hover:bg-nv-200 text-ink rounded-xl text-xs sm:text-sm font-semibold transition-fast"
            title="Scan Barcode"
          >
            <Barcode size={18} />
            <span className="hidden sm:inline">{isBn ? "স্ক্যান" : "Scan"}</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-fast
                ${selectedCategory === cat ? "bg-em-700 text-white shadow-2xs" : "bg-nv-50 hover:bg-nv-100 text-ink"}`}
            >
              {cat === "All" && isBn ? "সকল পণ্য" : cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3.5">
            {filteredProducts.map(p => {
              const inCart = cart.find(c => c.id === p.id);
              const isOutOfStock = p.stock <= 0;

              return (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  disabled={isOutOfStock}
                  className={`
                    relative p-3 rounded-2xl border text-left flex flex-col justify-between transition-all group
                    ${isOutOfStock ? "opacity-50 cursor-not-allowed bg-nv-50 border-nv-200" : "bg-white hover:border-em-500 hover:shadow-md border-nv-200"}
                    ${inCart ? "ring-2 ring-em-500 border-transparent bg-em-50/20" : ""}
                  `}
                >
                  {inCart && (
                    <span className="absolute top-2 right-2 w-5 h-5 bg-em-700 text-white font-bold rounded-full text-[10px] flex items-center justify-center shadow-xs">
                      {tNum(inCart.qty)}
                    </span>
                  )}

                  <div>
                    <div className="text-3xl text-center py-1.5 group-hover:scale-110 transition-transform">
                      {p.image || "📦"}
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-ink line-clamp-2 min-h-[2rem]">
                      {isBn ? p.nameBn : p.name}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-nv-100">
                    <span className="num font-bold text-ink text-sm sm:text-base">
                      {formatTaka(p.sellPrice)}
                    </span>
                    <span className={`text-[10px] font-semibold ${isOutOfStock ? "text-ink" : p.stock <= p.min ? "text-ink" : "text-ink"}`}>
                      {isOutOfStock ? (isBn ? "স্টক শেষ" : "Stock 0") : `${tNum(p.stock)} ${isBn ? "টি বাকি" : "left"}`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: POS Cart & Checkout Panel (Desktop) */}
      <div className="hidden lg:flex w-96 flex-col bg-white rounded-3xl shadow-sm border border-nv-200 p-5 overflow-hidden">
        {/* Customer Select / Add */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-nv-100 mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <User size={18} className="text-ink flex-shrink-0" />
            <select
              value={selectedCustomer}
              onChange={e => {
                const name = e.target.value;
                setSelectedCustomer(name);
                const found = customers.find(c => c.name === name);
                if (found) setCustomerPhone(found.phone);
              }}
              className="text-xs font-semibold text-ink bg-nv-50 border border-nv-200 rounded-xl px-2 py-1.5 w-full truncate focus:border-em-500"
            >
              {customers.map(c => (
                <option key={c.id} value={c.name}>
                  {c.name} {c.due > 0 ? `(Due: ৳${tNum(c.due)})` : ""}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowAddCustomerModal(true)}
            className="p-1.5 bg-nv-100 hover:bg-nv-200 text-ink rounded-xl transition-fast"
            title="Add New Customer"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[12rem]">
          {cart.map(item => (
            <div key={item.id} className="flex items-center justify-between p-2.5 bg-nv-50 rounded-2xl border border-nv-100">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl">{item.image || "📦"}</span>
                <div className="min-w-0">
                  <h5 className="font-bold text-xs text-ink truncate">{isBn ? item.nameBn : item.name}</h5>
                  <div className="num text-[11px] text-ink">{formatTaka(item.price)} each</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white border border-nv-200 rounded-lg p-0.5 shadow-2xs">
                  <button onClick={() => updateQuantity(item.id, -1)} className="w-5 h-5 flex items-center justify-center text-ink hover:bg-nv-100 rounded">
                    <Minus size={11} />
                  </button>
                  <span className="num font-bold text-xs w-5 text-center">{tNum(item.qty)}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="w-5 h-5 flex items-center justify-center text-ink hover:bg-nv-100 rounded">
                    <Plus size={11} />
                  </button>
                </div>
                <span className="num font-bold text-xs text-ink w-14 text-right">
                  {formatTaka(item.price * item.qty)}
                </span>
              </div>
            </div>
          ))}

          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-ink py-10">
              <ShoppingCart size={36} className="text-ink mb-2 stroke-[1.5]" />
              <p className="text-xs">{isBn ? "কার্টে পণ্য যোগ করুন" : "No items in cart"}</p>
            </div>
          )}
        </div>

        {/* Payment & Calculation */}
        <div className="pt-3 border-t border-nv-100 space-y-3 mt-2">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-ink">
              <span>{isBn ? "সাবটোটাল" : "Subtotal"}:</span>
              <span className="num font-semibold">{formatTaka(subtotal)}</span>
            </div>

            <div className="flex justify-between items-center text-ink">
              <span>{isBn ? "ডিসকাউন্ট (৳)" : "Discount (৳)"}:</span>
              <input
                type="number"
                min="0"
                value={discount || ""}
                onChange={e => setDiscount(Math.max(0, Number(e.target.value)))}
                placeholder="0"
                className="num w-20 text-right py-0.5 px-2 bg-nv-50 border border-nv-200 rounded-lg text-xs font-semibold focus:border-em-500"
              />
            </div>

            <div className="flex justify-between items-center text-sm font-bold text-ink pt-1 border-t border-nv-100">
              <span>{isBn ? "সর্বমোট টাকা" : "Grand Total"}:</span>
              <span className="num text-lg text-ink">{formatTaka(grandTotal)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <span className="block text-[11px] font-bold text-ink uppercase tracking-wider mb-1.5">
              {isBn ? "পেমেন্ট মাধ্যম" : "Payment Method"}
            </span>
            <div className="grid grid-cols-5 gap-1">
              {paymentMethods.map(m => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`py-2 rounded-xl text-[11px] font-bold border transition-fast flex flex-col items-center gap-1
                    ${paymentMethod === m.id ? `${m.color} ring-2 ring-current shadow-xs` : "border-nv-200 text-ink hover:bg-nv-50"}`}
                >
                  <m.icon size={15} />
                  <span>{isBn ? m.labelBn : m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cash Change Calculator */}
          {paymentMethod === "cash" && (
            <div className="bg-nv-50 p-2.5 rounded-2xl border border-nv-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-ink">
                <span>{isBn ? "নগদ গৃহীত (Cash Given):" : "Cash Received:"}</span>
                <input
                  type="number"
                  value={cashGiven}
                  onChange={e => setCashGiven(e.target.value)}
                  placeholder={formatTaka(grandTotal)}
                  className="num w-28 text-right py-1 px-2.5 bg-white border border-nv-200 rounded-lg font-bold text-xs"
                />
              </div>
              {change > 0 && (
                <div className="flex justify-between text-xs font-bold text-ink pt-1 border-t border-nv-200/50">
                  <span>{isBn ? "ফেরত দিতে হবে (Change):" : "Change to return:"}</span>
                  <span className="num text-sm">{formatTaka(change)}</span>
                </div>
              )}
            </div>
          )}

          {/* Complete Sale Button */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all
              ${cart.length > 0 ? "bg-em-600 hover:bg-em-700 text-white" : "bg-nv-200 text-ink cursor-not-allowed"}`}
          >
            <CheckCircle size={18} />
            <span>{isBn ? `বিক্রয় সম্পন্ন (${formatTaka(grandTotal)})` : `Complete Sale (${formatTaka(grandTotal)})`}</span>
          </button>
        </div>
      </div>

      {/* MOBILE FLOATING BOTTOM CART PILL */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-16 left-3 right-3 z-30">
          <button
            onClick={() => setMobileCartOpen(true)}
            className="w-full py-3 px-4 bg-em-700 text-white rounded-2xl font-bold text-sm shadow-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                {tNum(cart.reduce((s, i) => s + i.qty, 0))}
              </span>
              <span>{isBn ? "কার্ট দেখুন" : "View Cart"}</span>
            </div>
            <div className="num font-extrabold text-base">{formatTaka(grandTotal)}</div>
          </button>
        </div>
      )}

      {/* MOBILE SLIDING CART SHEET */}
      {mobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl p-5 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-nv-100">
              <h3 className="font-bold text-base text-ink">{isBn ? "অর্ডার কার্ট" : "Order Cart"}</h3>
              <button onClick={() => setMobileCartOpen(false)} className="text-ink hover:text-ink">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 py-3">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2.5 bg-nv-50 rounded-2xl">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl">{item.image || "📦"}</span>
                    <div className="min-w-0">
                      <h5 className="font-bold text-xs text-ink truncate">{isBn ? item.nameBn : item.name}</h5>
                      <div className="num text-[11px] text-ink">{formatTaka(item.price)} each</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-white border border-nv-200 rounded-lg p-0.5">
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-5 h-5 flex items-center justify-center">
                        <Minus size={11} />
                      </button>
                      <span className="num font-bold text-xs w-5 text-center">{tNum(item.qty)}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-5 h-5 flex items-center justify-center">
                        <Plus size={11} />
                      </button>
                    </div>
                    <span className="num font-bold text-xs text-ink w-14 text-right">
                      {formatTaka(item.price * item.qty)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-nv-100 space-y-3">
              <div className="flex justify-between items-center font-bold text-base text-ink">
                <span>{isBn ? "মোট টাকা" : "Total"}:</span>
                <span className="num text-xl text-ink">{formatTaka(grandTotal)}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full py-4 bg-em-700 hover:bg-em-800 text-white rounded-2xl font-bold text-base shadow-lg"
              >
                {isBn ? "বিক্রয় সম্পন্ন করুন" : "Complete Checkout"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Sale Completed & Receipt Ready */}
      {showSaleCompletedModal && completedSaleData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-nv-200 p-6 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 text-ink rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle size={36} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-ink">
                {isBn ? "বিক্রয় সফলভাবে সম্পন্ন!" : "Sale Completed!"}
              </h3>
              <p className="text-xs text-ink mt-1">
                {isBn ? `চালান নং: ${tNum(completedSaleData.invoiceNo)}` : `Invoice: ${completedSaleData.invoiceNo}`}
              </p>
            </div>

            <div className="bg-nv-50 p-4 rounded-2xl space-y-1 border border-nv-200">
              <div className="text-xs text-ink">{isBn ? "মোট মূল্য" : "Grand Total"}</div>
              <div className="num text-3xl font-extrabold text-ink">{formatTaka(completedSaleData.grandTotal)}</div>
              {completedSaleData.change > 0 && (
                <div className="text-xs font-bold text-ink pt-1 border-t border-nv-200">
                  {isBn ? `ফেরত: ${formatTaka(completedSaleData.change)}` : `Change: ${formatTaka(completedSaleData.change)}`}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  setCurrentInvoice(completedSaleData);
                  setShowSaleCompletedModal(false);
                  setScreen("invoice");
                }}
                className="w-full py-3 bg-nv-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-md transition-fast"
              >
                {isBn ? "রসিদ দেখুন / প্রিন্ট" : "Print Receipt / Invoice"}
              </button>
              <button
                onClick={() => setShowSaleCompletedModal(false)}
                className="w-full py-2.5 border border-nv-200 hover:bg-nv-50 text-ink rounded-xl text-xs font-semibold transition-fast"
              >
                {isBn ? "নতুন বিক্রয় করুন" : "Next Sale"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add Customer */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-nv-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-nv-100">
              <h3 className="font-bold text-ink text-base">{isBn ? "নতুন গ্রাহক যুক্ত করুন" : "Add Customer"}</h3>
              <button onClick={() => setShowAddCustomerModal(false)} className="text-ink hover:text-ink">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-ink mb-1">{isBn ? "গ্রাহকের নাম" : "Customer Name"} *</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={e => setNewCustName(e.target.value)}
                  placeholder="e.g. Kamal Hossain"
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
                />
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">{isBn ? "মোবাইল নম্বর" : "Mobile Phone"} *</label>
                <input
                  type="tel"
                  required
                  value={newCustPhone}
                  onChange={e => setNewCustPhone(e.target.value)}
                  placeholder="01712-000000"
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="flex-1 py-2 border border-nv-200 rounded-xl font-semibold text-ink hover:bg-nv-50"
                >
                  {isBn ? "বাতিল" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-em-700 hover:bg-em-800 text-white rounded-xl font-bold shadow-md"
                >
                  {isBn ? "যুক্ত করুন" : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Barcode Scanner Simulation */}
      {showBarcodeScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-nv-200 p-5 text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-nv-100">
              <h3 className="font-bold text-ink text-sm">{isBn ? "বারকোড স্ক্যানার" : "Barcode Scanner"}</h3>
              <button onClick={() => setShowBarcodeScanner(false)} className="text-ink hover:text-ink">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 bg-nv-900 rounded-2xl relative overflow-hidden border border-nv-800">
              <div className="w-full h-32 border-2 border-dashed border-em-400/60 rounded-xl flex items-center justify-center">
                <div className="w-full h-0.5 bg-red-500 shadow-lg shadow-red-500 animate-bounce" />
              </div>
              <p className="text-white/60 text-xs mt-3">{isBn ? "পণ্যের বারকোড ক্যামেরার সামনে ধরুন" : "Point barcode at camera scanner"}</p>
            </div>

            <div className="text-xs text-ink">
              {isBn ? "দ্রুত টেস্ট করতে একটি পণ্যে চাপুন:" : "Or quick scan sample item:"}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  addToCart(products[0]);
                  setShowBarcodeScanner(false);
                }}
                className="flex-1 py-2 bg-em-50 hover:bg-em-100 text-ink rounded-xl text-xs font-bold"
              >
                Scan Item 1
              </button>
              <button
                onClick={() => {
                  addToCart(products[1]);
                  setShowBarcodeScanner(false);
                }}
                className="flex-1 py-2 bg-em-50 hover:bg-em-100 text-ink rounded-xl text-xs font-bold"
              >
                Scan Item 2
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
