import { useState } from "react";
import {
  Search, Plus, Minus, Trash2, User, CreditCard, Smartphone,
  Printer, X, ChevronDown, CheckCircle, Package, Barcode,
  Receipt, Clock, Banknote, ShoppingCart, UserPlus, Sparkles, ArrowRight
} from "lucide-react";
import { useApp, Product, CartItem } from "../context/AppContext";
import { toast } from "../components/Toast";

interface POSProps {
  lang: "en" | "bn";
  setScreen?: (s: string) => void;
}

const paymentMethods = [
  { id: "cash" as const, label: "Cash", labelBn: "নগদ", icon: Banknote, color: "bg-em-700 text-white" },
  { id: "bkash" as const, label: "bKash", labelBn: "বিকাশ", icon: Smartphone, color: "bg-pink-600 text-white" },
  { id: "nagad" as const, label: "Nagad", labelBn: "নগদ", icon: Smartphone, color: "bg-orange-500 text-white" },
  { id: "rocket" as const, label: "Rocket", labelBn: "রকেট", icon: Smartphone, color: "bg-purple-600 text-white" },
  { id: "card" as const, label: "Card", labelBn: "কার্ড", icon: CreditCard, color: "bg-blue-600 text-white" },
  { id: "due" as const, label: "Due", labelBn: "বাকিতে", icon: Receipt, color: "bg-red-500 text-white" },
];

export default function POS({ lang, setScreen }: POSProps) {
  const { products, customers, completeSale, addCustomer, setCurrentInvoice } = useApp();
  const isBn = lang === "bn";

  const [searchQ, setSearchQ] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [payment, setPayment] = useState<"cash" | "bkash" | "nagad" | "rocket" | "card" | "due">("cash");
  const [discount, setDiscount] = useState<number>(0);
  const [cashGiven, setCashGiven] = useState("");
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastCompletedSale, setLastCompletedSale] = useState<any>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showNewCustModal, setShowNewCustModal] = useState(false);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");

  // New Customer Form state
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustAddress, setNewCustAddress] = useState("");

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch =
      p.name.toLowerCase().includes(searchQ.toLowerCase()) ||
      p.nameBn.includes(searchQ) ||
      p.sku.toLowerCase().includes(searchQ.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchQ));
    return matchCat && matchSearch;
  });

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

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
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          toast({
            type: "warning",
            title: isBn ? "পর্যাপ্ত স্টক নেই" : "Stock Limit Reached",
            message: `Only ${product.stock} available in stock.`,
          });
          return prev;
        }
        return prev.map(i => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
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

  const updateQty = (id: number, delta: number) => {
    const prod = products.find(p => p.id === id);
    setCart(prev =>
      prev
        .map(i => {
          if (i.id === id) {
            const newQty = i.qty + delta;
            if (prod && newQty > prod.stock) {
              toast({
                type: "warning",
                title: isBn ? "সর্বোচ্চ স্টক" : "Max Stock",
                message: `Only ${prod.stock} items available.`,
              });
              return i;
            }
            return newQty > 0 ? { ...i, qty: newQty } : null;
          }
          return i;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeItem = (id: number) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const handleBarcodeScan = (code: string) => {
    const found = products.find(p => p.barcode === code || p.sku.toLowerCase() === code.toLowerCase());
    if (found) {
      addToCart(found);
      setShowBarcodeModal(false);
      setBarcodeInput("");
      toast({
        type: "success",
        title: isBn ? "বারকোড স্ক্যান সফল" : "Barcode Scanned",
        message: `${found.name} added to cart!`,
      });
    } else {
      toast({
        type: "error",
        title: isBn ? "পণ্য পাওয়া যায়নি" : "Barcode Not Found",
        message: `No product matching ${code}`,
      });
    }
  };

  const handleCreateCustomer = () => {
    if (!newCustName.trim() || !newCustPhone.trim()) {
      toast({
        type: "warning",
        title: isBn ? "নাম ও ফোন নম্বর দিন" : "Please provide name & phone",
      });
      return;
    }

    addCustomer({
      name: newCustName,
      nameBn: newCustName,
      phone: newCustPhone,
      address: newCustAddress,
      due: 0,
      status: "new",
    });

    const created = customers[0];
    if (created) setSelectedCustomerId(created.id);

    setShowNewCustModal(false);
    setShowCustomerModal(false);
    setNewCustName("");
    setNewCustPhone("");
    setNewCustAddress("");
  };

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty - i.discount, 0);
  const grandTotal = Math.max(0, subtotal - discount);
  const totalItemsCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const cashChange = cashGiven ? Math.max(0, parseFloat(cashGiven) - grandTotal) : 0;

  const handleCompleteSale = () => {
    if (cart.length === 0) return;

    if (payment === "due" && !selectedCustomer) {
      toast({
        type: "warning",
        title: isBn ? "গ্রাহক নির্বাচন করুন" : "Customer Required for Due Sale",
        message: isBn ? "বাকিতে বিক্রির জন্য গ্রাহকের নাম বা অ্যাকাউন্ট আবশ্যক।" : "Please select a registered customer to record due.",
      });
      setShowCustomerModal(true);
      return;
    }

    const saleItems = cart.map(i => ({
      name: i.name,
      nameBn: i.nameBn,
      qty: i.qty,
      price: i.price,
      buyPrice: i.buyPrice,
      discount: i.discount,
    }));

    const isDueSale = payment === "due";
    const paidAmount = isDueSale ? 0 : grandTotal;
    const dueAmount = isDueSale ? grandTotal : 0;

    const sale = completeSale({
      customer: selectedCustomer ? selectedCustomer.name : "Walk-in Customer",
      customerPhone: selectedCustomer?.phone,
      items: saleItems,
      subtotal,
      discount,
      vat: 0,
      grandTotal,
      paid: paidAmount,
      due: dueAmount,
      paymentMethod: payment,
      cashGiven: cashGiven ? parseFloat(cashGiven) : grandTotal,
      change: cashChange,
    });

    setLastCompletedSale(sale);
    setShowSuccessModal(true);
    setMobileCartOpen(false);
    setCart([]);
    setDiscount(0);
    setCashGiven("");
    setSelectedCustomerId(null);
  };

  const cartPanelContent = (
    <div className="flex flex-col h-full bg-white">
      {/* Cart Header */}
      <div className="p-4 border-b border-nv-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-em-700" />
            <h3 className="font-display font-bold text-nv-900 text-base">
              {isBn ? "বর্তমান অর্ডার" : "Current Order"}
            </h3>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 bg-em-50 text-em-800 rounded-full">
            {totalItemsCount} {isBn ? "টি পণ্য" : "items"}
          </span>
        </div>

        {/* Customer Selector Button */}
        <div className="relative">
          <button
            onClick={() => setShowCustomerModal(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-nv-50 hover:bg-nv-100 rounded-xl border border-nv-200 transition-fast text-left"
          >
            <div className="w-7 h-7 rounded-full bg-em-100 flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-em-800 font-bold" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-nv-800 truncate">
                {selectedCustomer ? (isBn ? selectedCustomer.nameBn : selectedCustomer.name) : (isBn ? "ওয়াক-ইন গ্রাহক" : "Walk-in Customer")}
              </div>
              {selectedCustomer && (
                <div className="text-[10px] text-nv-500">
                  {selectedCustomer.phone} {selectedCustomer.due > 0 && <span className="text-red-500 font-bold">· Due: ৳{selectedCustomer.due.toLocaleString()}</span>}
                </div>
              )}
            </div>
            <ChevronDown size={14} className="text-nv-400" />
          </button>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-nv-400 py-12">
            <div className="w-16 h-16 rounded-full bg-nv-100 flex items-center justify-center mb-3">
              <Receipt size={28} className="text-nv-300" />
            </div>
            <p className="text-sm font-semibold text-nv-600">
              {isBn ? "কার্ট খালি আছে" : "Cart is empty"}
            </p>
            <p className="text-xs text-nv-400 mt-0.5 text-center">
              {isBn ? "বিক্রয় শুরু করতে বাম পাশের পণ্য তালিকা থেকে ক্লিক করুন" : "Click on any product from the catalog to add"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-nv-100">
            {cart.map(item => (
              <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex flex-col gap-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-nv-900 truncate">
                      {isBn ? item.nameBn : item.name}
                    </p>
                    <p className="num text-[11px] text-nv-500 mt-0.5">
                      ৳{item.price} each
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-nv-300 hover:text-red-500 transition-fast p-1"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-1">
                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1 bg-nv-100 rounded-lg p-0.5">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="w-6 h-6 rounded-md bg-white hover:bg-nv-200 flex items-center justify-center text-nv-700 transition-fast shadow-2xs"
                    >
                      <Minus size={11} />
                    </button>
                    <span className="num text-xs font-bold text-nv-900 w-7 text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="w-6 h-6 rounded-md bg-white hover:bg-nv-200 flex items-center justify-center text-nv-700 transition-fast shadow-2xs"
                    >
                      <Plus size={11} />
                    </button>
                  </div>

                  <div className="num font-bold text-sm text-nv-900">
                    ৳{(item.price * item.qty - item.discount).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Summary & Payment Controls */}
      {cart.length > 0 && (
        <div className="border-t border-nv-200 p-4 space-y-3 bg-nv-50/50">
          {/* Calculations */}
          <div className="space-y-1.5 text-xs sm:text-sm">
            <div className="flex justify-between text-nv-500">
              <span>{isBn ? "সাবটোটাল" : "Subtotal"}</span>
              <span className="num font-semibold text-nv-700">৳{subtotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center text-nv-500">
              <span>{isBn ? "ডিসকাউন্ট" : "Discount"}</span>
              <div className="flex items-center gap-1">
                <span className="text-nv-400">-৳</span>
                <input
                  type="number"
                  min="0"
                  value={discount === 0 ? "" : discount}
                  placeholder="0"
                  onChange={e => setDiscount(Math.max(0, Number(e.target.value)))}
                  className="num w-16 text-right text-xs sm:text-sm border border-nv-200 rounded-lg px-2 py-0.5 bg-white focus:border-em-500"
                />
              </div>
            </div>

            <div className="flex justify-between text-base font-bold text-nv-900 border-t border-nv-200 pt-2 mt-1">
              <span>{isBn ? "মোট প্রদেয়" : "Grand Total"}</span>
              <span className="num text-em-700 text-lg">৳{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <p className="text-[11px] font-bold text-nv-500 uppercase tracking-wide mb-1.5">
              {isBn ? "পেমেন্ট মাধ্যম" : "Payment Method"}
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {paymentMethods.map(m => (
                <button
                  key={m.id}
                  onClick={() => setPayment(m.id)}
                  className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-1 border
                    ${payment === m.id ? `${m.color} border-transparent shadow-sm scale-102` : "bg-white border-nv-200 text-nv-700 hover:border-nv-300"}`}
                >
                  <m.icon size={14} />
                  <span className="text-[10px]">{isBn ? m.labelBn : m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cash calculator if cash selected */}
          {payment === "cash" && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-nv-600">
                  {isBn ? "নগদ গৃহীত টাকা" : "Cash Received"}
                </label>
                {cashChange > 0 && (
                  <span className="text-xs font-bold text-em-700">
                    {isBn ? `ফেরত: ৳${cashChange.toLocaleString()}` : `Change: ৳${cashChange.toLocaleString()}`}
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-nv-400 font-bold">৳</span>
                <input
                  type="number"
                  value={cashGiven}
                  onChange={e => setCashGiven(e.target.value)}
                  placeholder={`৳${grandTotal.toLocaleString()}`}
                  className="num w-full border border-nv-200 rounded-xl pl-7 pr-3 py-2 text-sm font-bold bg-white focus:border-em-500"
                />
              </div>
              {/* Quick Cash Buttons */}
              <div className="grid grid-cols-4 gap-1.5 mt-1">
                {[grandTotal, Math.ceil(grandTotal / 100) * 100, Math.ceil(grandTotal / 500) * 500, Math.ceil(grandTotal / 1000) * 1000]
                  .filter((v, i, a) => a.indexOf(v) === i)
                  .slice(0, 4)
                  .map(amt => (
                    <button
                      key={amt}
                      onClick={() => setCashGiven(amt.toString())}
                      className="py-1 rounded-lg bg-white border border-nv-200 hover:border-em-400 text-[11px] font-semibold text-nv-700 transition-fast"
                    >
                      ৳{amt}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Submit Sale Button */}
          <button
            onClick={handleCompleteSale}
            className="w-full py-3.5 bg-gradient-to-r from-em-600 to-em-500 hover:from-em-500 hover:to-em-400 text-white rounded-xl font-bold text-sm shadow-lg shadow-em-900/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <CheckCircle size={18} />
            <span>{isBn ? "বিক্রয় সম্পন্ন করুন" : "Complete Sale"} — <span className="num font-bold">৳{grandTotal.toLocaleString()}</span></span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)] overflow-hidden relative">
      {/* Product Catalog Panel (Left on desktop, Full width on mobile) */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-nv-200 bg-nv-50 min-w-0">
        {/* Search, Categories & Barcode Bar */}
        <div className="p-3 sm:p-4 bg-white border-b border-nv-200 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-nv-400" />
              <input
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                type="text"
                placeholder={isBn ? "পণ্যের নাম, SKU বা বারকোড দিয়ে খুঁজুন..." : "Search products by name, SKU or barcode..."}
                className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-nv-50 border border-nv-200 rounded-xl focus:bg-white focus:border-em-500 transition-fast"
              />
              {searchQ && (
                <button onClick={() => setSearchQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-nv-400">
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowBarcodeModal(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-nv-800 hover:bg-nv-900 text-white rounded-xl text-xs sm:text-sm font-semibold transition-fast flex-shrink-0"
            >
              <Barcode size={16} />
              <span className="hidden sm:inline">{isBn ? "স্ক্যানার" : "Scan"}</span>
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-fast
                  ${activeCategory === cat ? "bg-em-700 text-white shadow-xs" : "bg-nv-100 text-nv-600 hover:bg-nv-200"}`}
              >
                {cat === "All" ? (isBn ? "সব পণ্য" : "All Products") : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Catalog Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 pb-24 lg:pb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4">
            {filteredProducts.map(p => {
              const inCart = cart.find(i => i.id === p.id);
              const isOut = p.stock <= 0;
              const isLow = p.stock > 0 && p.stock <= p.min;

              return (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  disabled={isOut}
                  className={`bg-white rounded-2xl p-3 sm:p-4 text-left border transition-all relative flex flex-col justify-between group
                    ${inCart ? "border-em-500 shadow-md ring-2 ring-em-500/20" : "border-nv-200 hover:border-em-400 hover:shadow-md"}
                    ${isOut ? "opacity-60 cursor-not-allowed bg-nv-50" : ""}`}
                >
                  {/* Cart Quantity Badge */}
                  {inCart && (
                    <span className="absolute top-2.5 right-2.5 w-6 h-6 bg-em-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md animate-in zoom-in-50">
                      {inCart.qty}
                    </span>
                  )}

                  <div>
                    <div className="text-3xl sm:text-4xl mb-2 text-center select-none py-1 group-hover:scale-110 transition-transform">
                      {p.image || "📦"}
                    </div>
                    <div className="text-xs font-bold text-nv-800 line-clamp-2 min-h-[2rem]">
                      {isBn ? p.nameBn || p.name : p.name}
                    </div>
                    <div className="text-[10px] text-nv-400 font-mono mt-0.5">{p.sku}</div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-nv-100">
                    <span className="num font-bold text-em-700 text-sm sm:text-base">৳{p.sellPrice}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
                        ${isOut ? "bg-red-100 text-red-700" : isLow ? "bg-amber-100 text-amber-800" : "bg-nv-100 text-nv-600"}`}
                    >
                      {isOut ? (isBn ? "নেই" : "Out") : `${p.stock} ${isBn ? "টি" : "left"}`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-nv-400">
              <Package size={48} className="mb-3 opacity-30" />
              <p className="text-sm font-semibold">{isBn ? "কোনো পণ্য খুঁজে পাওয়া যায়নি" : "No products found"}</p>
            </div>
          )}
        </div>

        {/* Floating Bottom Cart Bar for Mobile/Tablet (< 1024px) */}
        {cart.length > 0 && (
          <div className="lg:hidden fixed bottom-16 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-nv-200 z-30 shadow-2xl">
            <button
              onClick={() => setMobileCartOpen(true)}
              className="w-full py-3.5 bg-gradient-to-r from-em-600 to-em-500 text-white rounded-2xl font-bold text-sm flex items-center justify-between px-5 shadow-lg shadow-em-900/30"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-white/25 rounded-lg flex items-center justify-center text-xs font-bold">
                  {totalItemsCount}
                </span>
                <span>{isBn ? "কার্ট দেখুন ও পেমেন্ট করুন" : "View Cart & Checkout"}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="num font-extrabold text-base">৳{grandTotal.toLocaleString()}</span>
                <ArrowRight size={16} />
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Desktop Cart & Checkout Panel (Right side, hidden on mobile/tablet) */}
      <div className="hidden lg:flex w-80 xl:w-96 flex-col bg-white flex-shrink-0 border-l border-nv-200">
        {cartPanelContent}
      </div>

      {/* Mobile Cart Drawer Modal (< 1024px) */}
      {mobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="flex-1" onClick={() => setMobileCartOpen(false)} />
          <div className="bg-white rounded-t-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border-t border-nv-200 animate-in slide-in-from-bottom duration-300">
            <div className="p-3 border-b border-nv-100 flex items-center justify-between px-4 bg-nv-50/50">
              <span className="font-display font-bold text-nv-900 text-base">
                {isBn ? "চেকআউট ও পেমেন্ট" : "Checkout & Payment"}
              </span>
              <button
                onClick={() => setMobileCartOpen(false)}
                className="w-8 h-8 rounded-full bg-nv-100 hover:bg-nv-200 flex items-center justify-center text-nv-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {cartPanelContent}
            </div>
          </div>
        </div>
      )}

      {/* Customer Selection Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-nv-200 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-nv-200 flex items-center justify-between">
              <h3 className="font-display font-bold text-nv-900 text-base">
                {isBn ? "গ্রাহক নির্বাচন করুন" : "Select Customer"}
              </h3>
              <button onClick={() => setShowCustomerModal(false)} className="text-nv-400 hover:text-nv-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-3 border-b border-nv-100 flex gap-2">
              <button
                onClick={() => {
                  setSelectedCustomerId(null);
                  setShowCustomerModal(false);
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-fast
                  ${selectedCustomerId === null ? "bg-em-700 text-white" : "bg-nv-100 text-nv-700 hover:bg-nv-200"}`}
              >
                {isBn ? "ওয়াক-ইন গ্রাহক" : "Walk-in Customer"}
              </button>
              <button
                onClick={() => setShowNewCustModal(true)}
                className="flex items-center gap-1.5 py-2 px-3 bg-em-50 text-em-800 hover:bg-em-100 rounded-xl text-xs font-bold transition-fast"
              >
                <UserPlus size={14} />
                <span>{isBn ? "নতুন গ্রাহক" : "New Customer"}</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1 divide-y divide-nv-100">
              {customers.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCustomerId(c.id);
                    setShowCustomerModal(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl hover:bg-nv-50 transition-fast text-left
                    ${selectedCustomerId === c.id ? "bg-em-50/60 border border-em-300" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-em-700 to-em-500 text-white font-bold flex items-center justify-center text-sm">
                      {c.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-nv-900">{isBn ? c.nameBn : c.name}</div>
                      <div className="text-xs text-nv-500">{c.phone}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    {c.due > 0 ? (
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                        Due: ৳{c.due.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-xs text-em-700 font-semibold">No Due</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Customer Modal */}
      {showNewCustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-nv-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-nv-100">
              <h3 className="font-bold text-nv-900 text-base">{isBn ? "নতুন গ্রাহক নিবন্ধন" : "Register Customer"}</h3>
              <button onClick={() => setShowNewCustModal(false)} className="text-nv-400 hover:text-nv-600">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-nv-700 mb-1">{isBn ? "নাম" : "Full Name"} *</label>
                <input
                  type="text"
                  value={newCustName}
                  onChange={e => setNewCustName(e.target.value)}
                  placeholder="e.g. Tanvir Hasan"
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
                />
              </div>
              <div>
                <label className="block font-medium text-nv-700 mb-1">{isBn ? "ফোন নম্বর" : "Phone Number"} *</label>
                <input
                  type="tel"
                  value={newCustPhone}
                  onChange={e => setNewCustPhone(e.target.value)}
                  placeholder="01712-000000"
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
                />
              </div>
              <div>
                <label className="block font-medium text-nv-700 mb-1">{isBn ? "ঠিকানা" : "Address"}</label>
                <input
                  type="text"
                  value={newCustAddress}
                  onChange={e => setNewCustAddress(e.target.value)}
                  placeholder="e.g. Dhanmondi, Dhaka"
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowNewCustModal(false)}
                className="flex-1 py-2.5 border border-nv-200 rounded-xl font-semibold text-nv-600 hover:bg-nv-50"
              >
                {isBn ? "বাতিল" : "Cancel"}
              </button>
              <button
                onClick={handleCreateCustomer}
                className="flex-1 py-2.5 bg-em-700 hover:bg-em-800 text-white rounded-xl font-semibold shadow-md"
              >
                {isBn ? "সংরক্ষণ করুন" : "Save & Select"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      {showBarcodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-nv-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-nv-100">
              <div className="flex items-center gap-2">
                <Barcode size={20} className="text-em-700" />
                <h3 className="font-bold text-nv-900 text-base">{isBn ? "বারকোড স্ক্যানার" : "Barcode Scanner"}</h3>
              </div>
              <button onClick={() => setShowBarcodeModal(false)} className="text-nv-400 hover:text-nv-600">
                <X size={18} />
              </button>
            </div>

            {/* Camera Viewfinder Simulation */}
            <div className="w-full aspect-video bg-nv-900 rounded-xl relative flex flex-col items-center justify-center overflow-hidden border border-nv-800">
              <div className="absolute inset-x-8 h-0.5 bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
              <Barcode size={64} className="text-white/40 mb-2" />
              <span className="text-white/70 text-xs font-mono">Simulating Optical Scanner</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-nv-600 mb-1.5">
                {isBn ? "বারকোড কোড লিখুন বা টেস্ট করুন" : "Enter or Paste Barcode / SKU"}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  autoFocus
                  value={barcodeInput}
                  onChange={e => setBarcodeInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleBarcodeScan(barcodeInput)}
                  placeholder="e.g. 89411000101"
                  className="flex-1 border border-nv-200 rounded-xl px-3 py-2 text-sm font-mono focus:border-em-500"
                />
                <button
                  onClick={() => handleBarcodeScan(barcodeInput)}
                  className="px-4 py-2 bg-em-700 text-white rounded-xl text-xs font-bold hover:bg-em-800"
                >
                  {isBn ? "স্ক্যান" : "Scan"}
                </button>
              </div>
            </div>

            {/* Quick test barcodes */}
            <div>
              <p className="text-[10px] text-nv-400 font-semibold mb-1">Click to test instant barcode match:</p>
              <div className="flex flex-wrap gap-1.5">
                {products.slice(0, 3).map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleBarcodeScan(p.barcode || p.sku)}
                    className="text-[11px] px-2 py-1 bg-nv-100 hover:bg-em-100 text-nv-700 rounded-lg font-mono"
                  >
                    {p.name.slice(0, 12)}...
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sale Success Overlay / Receipt Dialog */}
      {showSuccessModal && lastCompletedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl border border-nv-200 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-em-100 text-em-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <CheckCircle size={36} className="stroke-[2.5]" />
            </div>
            <h2 className="font-display text-xl font-bold text-nv-900 mb-1">
              {isBn ? "বিক্রয় সফলভাবে সম্পন্ন!" : "Sale Completed!"}
            </h2>
            <div className="num text-3xl font-extrabold text-em-700 mb-1">
              ৳{lastCompletedSale.grandTotal.toLocaleString()}
            </div>
            <p className="text-xs text-nv-500 mb-4">
              {lastCompletedSale.invoiceNo} · {lastCompletedSale.customer}
            </p>

            {lastCompletedSale.change > 0 && (
              <div className="bg-em-50 border border-em-200 rounded-xl p-3 mb-4">
                <p className="text-xs text-em-600 font-medium">{isBn ? "গ্রাহককে ফেরত দিন" : "Change to return"}</p>
                <p className="num text-lg font-bold text-em-800">৳{lastCompletedSale.change.toLocaleString()}</p>
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={() => {
                  setCurrentInvoice(lastCompletedSale);
                  setShowSuccessModal(false);
                  setScreen?.("invoice");
                }}
                className="w-full py-3 bg-nv-900 hover:bg-black text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-fast"
              >
                <Printer size={16} />
                <span>{isBn ? "রসিদ / ইনভয়েস প্রিন্ট করুন" : "Print Receipt / Invoice"}</span>
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-2.5 bg-nv-100 hover:bg-nv-200 text-nv-800 rounded-xl font-semibold text-xs transition-fast"
              >
                {isBn ? "নতুন বিক্রয় শুরু করুন" : "Start New Sale"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
