import { useState } from "react";
import {
  Search, Plus, Minus, Trash2, CheckCircle, X, Barcode,
  User, CreditCard, Banknote, Smartphone, Receipt, ChevronDown, RefreshCw, ShoppingCart, ArrowRight,
  Tag, Calculator, TrendingDown, TrendingUp, Sparkles, Edit3, Wallet
} from "lucide-react";
import { useApp, Product, CartItem, cleanProductName, cleanProductNameBn } from "../context/AppContext";
import { toast } from "../components/Toast";
import ProductThumb from "../components/ProductThumb";

interface POSProps {
  lang: "en" | "bn";
  setScreen: (s: string) => void;
}

const paymentMethods = [
  { id: "cash" as const, label: "Cash", labelBn: "Sika Pɔtee", icon: Banknote, color: "bg-em-50 text-ink border-em-300" },
  { id: "bkash" as const, label: "MTN MoMo", labelBn: "MTN MoMo", icon: Smartphone, color: "bg-amber-50 text-amber-900 border-amber-300" },
  { id: "nagad" as const, label: "Telecel Cash", labelBn: "Telecel Cash", icon: Smartphone, color: "bg-red-50 text-red-800 border-red-300" },
  { id: "card" as const, label: "Card / GhQR", labelBn: "Card / GhQR", icon: CreditCard, color: "bg-nv-50 text-ink border-nv-300" },
  { id: "due" as const, label: "Credit / Due", labelBn: "Aka (Credit)", icon: Receipt, color: "bg-red-50 text-ink border-red-300" },
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

  // Bargaining & Quantity Flow Structure State (photoclick -> price -> amount/quantity -> predicted vs barg total -> income)
  const [bargainModalOpen, setBargainModalOpen] = useState(false);
  const [bargainingProduct, setBargainingProduct] = useState<Product | null>(null);
  const [bargainOriginalPrice, setBargainOriginalPrice] = useState<number>(0);
  const [bargainPriceInput, setBargainPriceInput] = useState<string>("");
  const [bargainQty, setBargainQty] = useState<number>(1);
  const [isEditingExistingCart, setIsEditingExistingCart] = useState<boolean>(false);

  // New Customer Form
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
    const cleanName = cleanProductName(p.name).toLowerCase();
    const cleanNameBn = cleanProductNameBn(p.nameBn);
    const searchLower = search.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(searchLower) ||
      cleanName.includes(searchLower) ||
      p.nameBn.includes(search) ||
      cleanNameBn.includes(search) ||
      p.sku.toLowerCase().includes(searchLower);
    return matchesCat && matchesSearch;
  });

  // Flow structure: photoclick -> open modal with original price & bargaining price & quantity
  const openBargainModal = (product: Product, existingItem?: CartItem) => {
    if (product.stock <= 0) {
      toast({
        type: "error",
        title: isBn ? "Akorae Asa!" : "Out of Stock!",
        message: `${cleanProductName(product.name)} is currently out of stock.`,
      });
      return;
    }

    setBargainingProduct(product);
    setBargainOriginalPrice(product.sellPrice);

    if (existingItem) {
      setBargainPriceInput(existingItem.price.toString());
      setBargainQty(existingItem.qty);
      setIsEditingExistingCart(true);
    } else {
      const inCart = cart.find(c => c.id === product.id);
      if (inCart) {
        setBargainPriceInput(inCart.price.toString());
        setBargainQty(inCart.qty);
        setIsEditingExistingCart(true);
      } else {
        setBargainPriceInput(product.sellPrice.toString());
        setBargainQty(1);
        setIsEditingExistingCart(false);
      }
    }
    setBargainModalOpen(true);
  };

  const handleConfirmBargain = () => {
    if (!bargainingProduct) return;
    const qty = Math.max(1, Math.min(bargainingProduct.stock, bargainQty));
    const parsedPrice = bargainPriceInput === "" ? 0 : parseFloat(bargainPriceInput);
    const unitPrice = isNaN(parsedPrice) || parsedPrice < 0 ? bargainingProduct.sellPrice : parsedPrice;

    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.id === bargainingProduct.id);
      const updatedItem: CartItem = {
        id: bargainingProduct.id,
        name: cleanProductName(bargainingProduct.name),
        nameBn: cleanProductNameBn(bargainingProduct.nameBn),
        originalPrice: bargainingProduct.sellPrice,
        price: unitPrice,
        buyPrice: bargainingProduct.buyPrice,
        qty,
        discount: Math.max(0, bargainingProduct.sellPrice - unitPrice) * qty,
        image: bargainingProduct.image,
      };

      if (existingIdx >= 0) {
        const nextCart = [...prev];
        nextCart[existingIdx] = updatedItem;
        return nextCart;
      }
      return [...prev, updatedItem];
    });

    setBargainModalOpen(false);
    toast({
      type: "success",
      title: isBn ? "Wɔde Nnoɔma Gu Kɛntɛn Mu" : "Cart Updated",
      message: `${cleanProductName(bargainingProduct.name)}: ${qty} pcs @ ₵${unitPrice}`,
    });
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast({
        type: "error",
        title: isBn ? "Akorae Asa!" : "Out of Stock!",
        message: `${cleanProductName(product.name)} is currently out of stock.`,
      });
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          toast({
            type: "warning",
            title: isBn ? "Akorae Boro So" : "Stock Limit Reached",
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
          name: cleanProductName(product.name),
          nameBn: cleanProductNameBn(product.nameBn),
          originalPrice: product.sellPrice,
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
                title: isBn ? "Akorae Gyinabea" : "Stock Limit",
                message: `Max ${prod.stock} pcs in stock`,
              });
              return item;
            }
            if (newQty <= 0) return null;
            const orig = item.originalPrice ?? item.price;
            return {
              ...item,
              qty: newQty,
              discount: Math.max(0, orig - item.price) * newQty,
            };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  // Math Flow Calculations:
  // predictedSubtotal = original price * amount/quantity
  // subtotal = total sell in bargain (bargaining price * amount/quantity)
  // bargainSavings = predicted sell total - total sell in bargain
  const predictedSubtotal = cart.reduce((sum, item) => sum + (item.originalPrice ?? item.price) * item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const bargainSavings = Math.max(0, predictedSubtotal - subtotal);
  const bargainExtra = Math.max(0, subtotal - predictedSubtotal);
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
        title: isBn ? "Kɛntɛn No Da Mpan!" : "Cart is empty!",
        message: "Please add products to cart before checkout.",
      });
      return;
    }

    const saleItems = cart.map(item => ({
      name: item.name,
      nameBn: item.nameBn,
      qty: item.qty,
      price: item.price,
      originalPrice: item.originalPrice ?? item.price,
      buyPrice: item.buyPrice,
      discount: (item.discount || 0) + Math.max(0, ((item.originalPrice ?? item.price) - item.price) * item.qty),
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
              placeholder={isBn ? "Hwehwɛ nnoɔma din anaa SKU..." : "Search products by name or SKU..."}
              className="w-full pl-10 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm bg-nv-50 border border-nv-200 rounded-xl focus:border-em-500 transition-fast"
            />
          </div>
          <button
            onClick={() => setShowBarcodeScanner(true)}
            className="flex items-center gap-1.5 px-3 py-2 sm:py-2.5 bg-nv-100 hover:bg-nv-200 text-ink rounded-xl text-xs sm:text-sm font-semibold transition-fast"
            title="Scan Barcode"
          >
            <Barcode size={18} />
            <span className="hidden sm:inline">{isBn ? "Scan" : "Scan"}</span>
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
              {cat === "All" && isBn ? "Nyinaa Nnoɔma" : cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className={`flex-1 overflow-y-auto pr-1 ${cart.length > 0 ? "pb-24 lg:pb-2" : "pb-2"}`}>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3.5">
            {filteredProducts.map(p => {
              const inCart = cart.find(c => c.id === p.id);
              const isOutOfStock = p.stock <= 0;

              return (
                <button
                  key={p.id}
                  onClick={() => openBargainModal(p)}
                  disabled={isOutOfStock}
                  className={`
                    relative p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl border text-left flex flex-col justify-between transition-all group cursor-pointer
                    ${isOutOfStock ? "opacity-50 cursor-not-allowed bg-nv-50 border-nv-200" : "bg-white hover:border-em-500 hover:shadow-md border-nv-200"}
                    ${inCart ? "ring-2 ring-em-500 border-em-500 bg-em-50/15" : ""}
                  `}
                >
                  {inCart && (
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-em-700 text-white font-bold rounded-full text-xs flex items-center justify-center shadow-xs z-10">
                      {tNum(inCart.qty)}
                    </span>
                  )}

                  <div className="w-full">
                    {/* Image Area - Much bigger photo size + flowchart photoclick visual hint */}
                    <div className="w-full h-36 sm:h-44 flex items-center justify-center mb-2 bg-white rounded-xl overflow-hidden p-1 relative">
                      {p.image?.startsWith("/") || p.image?.startsWith("http") || p.image?.startsWith("data:") ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-contain max-h-40 group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-7xl sm:text-8xl select-none leading-none group-hover:scale-110 transition-transform filter drop-shadow-sm">
                          {p.image || "📦"}
                        </span>
                      )}
                      {/* Flowchart photoclick tag */}
                      <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 bg-ink/80 backdrop-blur-xs text-white text-[10px] font-semibold rounded-lg flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xs">
                        <Tag size={10} />
                        <span>{isBn ? "Bargain / Tɔn" : "Bargain / Sell"}</span>
                      </span>
                    </div>

                    {/* Product Name - Smaller size as requested */}
                    <h4 className="font-bold text-xs sm:text-[13px] text-ink line-clamp-1 leading-snug">
                      {isBn ? cleanProductNameBn(p.nameBn) : cleanProductName(p.name)}
                    </h4>
                  </div>

                  {/* Price & Stock Section */}
                  <div className="w-full flex items-center justify-between mt-2 pt-2 border-t border-nv-100">
                    <span className="num font-bold text-ink text-xs sm:text-[13px]">
                      {formatTaka(p.sellPrice)}
                    </span>
                    <span className={`text-[11px] sm:text-xs font-semibold ${isOutOfStock ? "text-red-500 font-bold" : p.stock <= p.min ? "text-amber-600 font-bold" : "text-nv-600"}`}>
                      {isOutOfStock ? (isBn ? "Akorae Asa" : "Stock 0") : `${tNum(p.stock)} ${isBn ? "aka" : "left"}`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: POS Cart & Checkout Panel (Desktop) */}
      <div className="hidden lg:flex w-96 flex-col bg-white rounded-3xl shadow-sm border border-nv-200 p-4 sm:p-5 overflow-y-auto max-h-full">
        {/* Customer Select / Add */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-nv-100 mb-2 flex-shrink-0">
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
                  {c.name} {c.due > 0 ? `(Due: ₵${tNum(c.due)})` : ""}
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
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
          {cart.map(item => (
            <div key={item.id} className="flex items-center justify-between p-2.5 bg-nv-50 rounded-2xl border border-nv-100">
              <div className="flex items-center gap-2 min-w-0">
                <ProductThumb
                  src={item.image}
                  alt={item.name}
                  className="w-8 h-8 rounded-lg object-contain bg-white p-0.5 border border-nv-200/60 flex-shrink-0"
                  sizeClass="text-base"
                />
                <div className="min-w-0">
                  <h5 className="font-bold text-xs text-ink truncate">{isBn ? cleanProductNameBn(item.nameBn) : cleanProductName(item.name)}</h5>
                  <div className="flex items-center gap-1 flex-wrap">
                    {item.originalPrice && item.originalPrice > item.price ? (
                      <>
                        <span className="line-through text-ink/40 text-[10px]">{formatTaka(item.originalPrice)}</span>
                        <span className="num text-[11px] font-bold text-em-700">{formatTaka(item.price)}</span>
                        <span className="text-[9px] bg-amber-100 text-amber-900 font-semibold px-1 rounded">Bargain</span>
                      </>
                    ) : item.originalPrice && item.originalPrice < item.price ? (
                      <>
                        <span className="line-through text-ink/40 text-[10px]">{formatTaka(item.originalPrice)}</span>
                        <span className="num text-[11px] font-bold text-em-700">{formatTaka(item.price)}</span>
                        <span className="text-[9px] bg-em-100 text-em-900 font-semibold px-1 rounded">Extra</span>
                      </>
                    ) : (
                      <div className="num text-[11px] text-ink">{formatTaka(item.price)} each</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const prod = products.find(p => p.id === item.id);
                    if (prod) openBargainModal(prod, item);
                  }}
                  className="w-6 h-6 flex items-center justify-center text-ink/50 hover:text-em-700 hover:bg-em-50 rounded transition-colors cursor-pointer"
                  title={isBn ? "Sesa Nkitahodie Boɔ" : "Edit Bargain / Qty"}
                >
                  <Edit3 size={12} />
                </button>
                <div className="flex items-center gap-1 bg-white border border-nv-200 rounded-lg p-0.5 shadow-2xs">
                  <button onClick={() => updateQuantity(item.id, -1)} className="w-5 h-5 flex items-center justify-center text-ink hover:bg-nv-100 rounded cursor-pointer">
                    <Minus size={11} />
                  </button>
                  <span className="num font-bold text-xs w-5 text-center">{tNum(item.qty)}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="w-5 h-5 flex items-center justify-center text-ink hover:bg-nv-100 rounded cursor-pointer">
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
              <p className="text-xs">{isBn ? "Nnoɔma biara nni kɛntɛn mu" : "No items in cart"}</p>
            </div>
          )}
        </div>

        {/* Payment & Calculation */}
        <div className="pt-3 border-t border-nv-100 space-y-3 mt-2">
          <div className="space-y-1.5 text-xs">
            {bargainSavings > 0 && (
              <div className="flex justify-between text-ink/70">
                <span>{isBn ? "Boɔ Pɔtee Dodow" : "Predicted Sell Total"}:</span>
                <span className="num font-semibold line-through">{formatTaka(predictedSubtotal)}</span>
              </div>
            )}

            <div className="flex justify-between text-ink">
              <span>{isBn ? "Nyinaa Nketewa (Bargained)" : "Subtotal (Bargained)"}:</span>
              <span className="num font-semibold">{formatTaka(subtotal)}</span>
            </div>

            {bargainSavings > 0 && (
              <div className="flex justify-between items-center text-amber-800 bg-amber-50 px-2 py-1 rounded-lg">
                <span className="flex items-center gap-1 font-medium">
                  <TrendingDown size={13} />
                  {isBn ? "Nkitahodie So Teɛ (-):" : "Bargain Savings (-):"}
                </span>
                <span className="num font-bold">-{formatTaka(bargainSavings)}</span>
              </div>
            )}
            {bargainExtra > 0 && (
              <div className="flex justify-between items-center text-em-700 bg-em-50 px-2 py-1 rounded-lg">
                <span className="flex items-center gap-1 font-medium">
                  <TrendingUp size={13} />
                  {isBn ? "Nkabom (+):" : "Extra (+):"}
                </span>
                <span className="num font-bold">+{formatTaka(bargainExtra)}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-ink">
              <span>{isBn ? "Discount (₵)" : "Discount (₵)"}:</span>
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
              <div>
                <span>{isBn ? "Ne Nyinaa (Income)" : "Grand Total (Income)"}:</span>
                <span className="block text-[10px] font-normal text-em-700">
                  {isBn ? "Ɛbɛkɔ sika kyerɛw mu" : "Syncs to Income Entry"}
                </span>
              </div>
              <span className="num text-lg text-ink">{formatTaka(grandTotal)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <span className="block text-[11px] font-bold text-ink uppercase tracking-wider mb-1.5">
              {isBn ? "Kwan a Wɔfaa So Tuae" : "Payment Method"}
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
                <span>{isBn ? "Sika a Wɔagye:" : "Cash Received:"}</span>
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
                  <span>{isBn ? "Nsesaeɛ a Ɛsɛ sɛ Wode Ma:" : "Change to return:"}</span>
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
            <span>{isBn ? `Wie Tɔn No (${formatTaka(grandTotal)})` : `Complete Sale (${formatTaka(grandTotal)})`}</span>
          </button>
        </div>
      </div>

      {/* MOBILE FLOATING BOTTOM CART PILL */}
      {cart.length > 0 && !mobileCartOpen && (
        <div className="lg:hidden fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md z-40 animate-in slide-in-from-bottom">
          <button
            onClick={() => setMobileCartOpen(true)}
            className="w-full py-3 px-4 bg-em-700 hover:bg-em-800 active:bg-em-900 text-white rounded-2xl font-bold text-sm shadow-xl flex items-center justify-between transition-transform active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center text-xs font-bold">
                {tNum(cart.reduce((s, i) => s + i.qty, 0))}
              </span>
              <span className="font-bold">{isBn ? "Hwɛ Kɛntɛn No Mu" : "View Cart"}</span>
            </div>
            <div className="num font-extrabold text-base">{formatTaka(grandTotal)}</div>
          </button>
        </div>
      )}

      {/* MOBILE SLIDING CART SHEET */}
      {mobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs pb-[calc(4rem+env(safe-area-inset-bottom,0px))] animate-in fade-in duration-200">
          {/* Backdrop click dismiss */}
          <button
            type="button"
            className="flex-1 w-full cursor-default"
            aria-label="Close cart"
            onClick={() => setMobileCartOpen(false)}
          />

          <div className="bg-white rounded-t-3xl sm:rounded-3xl sm:mb-4 sm:mx-auto sm:max-w-lg w-full p-4 sm:p-5 max-h-[calc(85vh-4.5rem)] flex flex-col shadow-2xl border-t sm:border border-nv-200 animate-in slide-in-from-bottom duration-200">
            {/* Pill drag handle */}
            <div className="w-12 h-1 bg-nv-200 rounded-full mx-auto mb-2 flex-shrink-0" />

            <div className="flex items-center justify-between pb-3 border-b border-nv-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-ink">{isBn ? "Ntɔdeɛ Kɛntɛn" : "Order Cart"}</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-em-50 text-em-800">
                  {tNum(cart.reduce((s, i) => s + i.qty, 0))} {isBn ? "nnoɔma" : "items"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileCartOpen(false)}
                className="w-8 h-8 rounded-full bg-nv-100 hover:bg-nv-200 active:bg-nv-300 flex items-center justify-center text-ink transition-colors cursor-pointer"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Cart Items List */}
            <div className="flex-1 overflow-y-auto min-h-0 space-y-2 py-3">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2.5 bg-nv-50 rounded-2xl border border-nv-100">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ProductThumb
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 border border-nv-200/60 flex-shrink-0"
                      sizeClass="text-lg"
                    />
                    <div className="min-w-0">
                      <h5 className="font-bold text-xs text-ink truncate">{isBn ? cleanProductNameBn(item.nameBn) : cleanProductName(item.name)}</h5>
                      <div className="flex items-center gap-1 flex-wrap">
                        {item.originalPrice && item.originalPrice > item.price ? (
                          <>
                            <span className="line-through text-ink/40 text-[10px]">{formatTaka(item.originalPrice)}</span>
                            <span className="num text-[11px] font-bold text-em-700">{formatTaka(item.price)}</span>
                            <span className="text-[9px] bg-amber-100 text-amber-900 font-semibold px-1 rounded">Bargain</span>
                          </>
                        ) : item.originalPrice && item.originalPrice < item.price ? (
                          <>
                            <span className="line-through text-ink/40 text-[10px]">{formatTaka(item.originalPrice)}</span>
                            <span className="num text-[11px] font-bold text-em-700">{formatTaka(item.price)}</span>
                            <span className="text-[9px] bg-em-100 text-em-900 font-semibold px-1 rounded">Extra</span>
                          </>
                        ) : (
                          <div className="num text-[11px] text-ink/70">{formatTaka(item.price)} each</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const prod = products.find(p => p.id === item.id);
                        if (prod) openBargainModal(prod, item);
                      }}
                      className="w-6 h-6 flex items-center justify-center text-ink/50 hover:text-em-700 hover:bg-em-50 rounded transition-colors cursor-pointer"
                      title={isBn ? "Sesa Nkitahodie Boɔ" : "Edit Bargain / Qty"}
                    >
                      <Edit3 size={12} />
                    </button>
                    <div className="flex items-center gap-1 bg-white border border-nv-200 rounded-lg p-0.5 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 flex items-center justify-center text-ink hover:bg-nv-100 rounded cursor-pointer"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="num font-bold text-xs w-6 text-center">{tNum(item.qty)}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 flex items-center justify-center text-ink hover:bg-nv-100 rounded cursor-pointer"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="num font-bold text-xs text-ink w-14 text-right">
                      {formatTaka(item.price * item.qty)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Sticky/Fixed Footer — NEVER Clipped, always fully visible on all devices */}
            <div className="pt-3 border-t border-nv-100 space-y-2 flex-shrink-0 bg-white">
              {bargainSavings > 0 && (
                <div className="flex justify-between items-center text-xs text-amber-800 bg-amber-50 px-2 py-1 rounded-lg">
                  <span className="flex items-center gap-1 font-medium">
                    <TrendingDown size={13} />
                    {isBn ? "Nkitahodie So Teɛ (-):" : "Bargain Savings (-):"}
                  </span>
                  <span className="num font-bold">-{formatTaka(bargainSavings)}</span>
                </div>
              )}
              {bargainExtra > 0 && (
                <div className="flex justify-between items-center text-xs text-em-700 bg-em-50 px-2 py-1 rounded-lg">
                  <span className="flex items-center gap-1 font-medium">
                    <TrendingUp size={13} />
                    {isBn ? "Nkabom (+):" : "Extra (+):"}
                  </span>
                  <span className="num font-bold">+{formatTaka(bargainExtra)}</span>
                </div>
              )}
              <div className="flex justify-between items-center font-bold text-base text-ink">
                <div>
                  <span>{isBn ? "Ne Nyinaa (Income)" : "Total (Income)"}:</span>
                  <span className="block text-[10px] font-normal text-em-700">
                    {isBn ? "Ɛbɛkɔ sika kyerɛw mu" : "Syncs to Income Entry"}
                  </span>
                </div>
                <span className="num text-xl text-ink font-extrabold">{formatTaka(grandTotal)}</span>
              </div>
              <button
                type="button"
                onClick={handleCheckout}
                className="w-full py-3.5 bg-em-700 hover:bg-em-800 active:bg-em-900 text-white rounded-2xl font-bold text-base shadow-lg shadow-em-700/25 transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
              >
                <CheckCircle size={18} />
                <span>{isBn ? "Wie Tua Ka No" : "Complete Checkout"}</span>
                <ArrowRight size={18} />
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
                {isBn ? "Tɔn No Awie Pɛpɛɛpɛ!" : "Sale Completed!"}
              </h3>
              <p className="text-xs text-ink mt-1">
                {isBn ? `Invois: ${completedSaleData.invoiceNo}` : `Invoice: ${completedSaleData.invoiceNo}`}
              </p>
            </div>

            <div className="bg-nv-50 p-4 rounded-2xl space-y-1 border border-nv-200">
              <div className="text-xs text-ink">{isBn ? "Nyinaa Ne Nyinaa" : "Grand Total"}</div>
              <div className="num text-3xl font-extrabold text-ink">{formatTaka(completedSaleData.grandTotal)}</div>
              {completedSaleData.change > 0 && (
                <div className="text-xs font-bold text-ink pt-1 border-t border-nv-200">
                  {isBn ? `Nsakyerae: ${formatTaka(completedSaleData.change)}` : `Change: ${formatTaka(completedSaleData.change)}`}
                </div>
              )}
            </div>

            {/* Auto Income Entry Sync Badge (Flow Diagram realization) */}
            <div className="bg-em-50 border border-em-200 rounded-2xl p-3 text-left flex items-start gap-2.5">
              <Sparkles size={16} className="text-em-700 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-em-900">
                <span className="font-bold block">
                  {isBn ? "Wɔde Sika Guu Sika Kyerɛw Mu:" : "Income Auto-Added to Accounts:"}
                </span>
                <span className="text-[11px] text-em-800">
                  {isBn
                    ? `₵${formatTaka(completedSaleData.grandTotal)} abɛka dukan sika kyerɛw nhyehyɛe ho pɛpɛɛpɛ.`
                    : `₵${completedSaleData.grandTotal} is ready in Cash Accounts & automatically prefilled in the + Income Entry form.`}
                </span>
              </div>
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
                {isBn ? "Tintim Kasaa / Invois" : "Print Receipt / Invoice"}
              </button>
              <button
                onClick={() => {
                  setShowSaleCompletedModal(false);
                  setScreen("cash");
                }}
                className="w-full py-2.5 bg-em-50 hover:bg-em-100 text-em-900 border border-em-300 rounded-xl text-xs font-bold transition-fast flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Wallet size={14} />
                <span>{isBn ? "Hwɛ Sika & Akawnt Kyerɛw" : "Open Cash & Income Register"}</span>
              </button>
              <button
                onClick={() => setShowSaleCompletedModal(false)}
                className="w-full py-2.5 border border-nv-200 hover:bg-nv-50 text-ink rounded-xl text-xs font-semibold transition-fast"
              >
                {isBn ? "Yɛ Tɔn Foforɔ" : "Next Sale"}
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
              <h3 className="font-bold text-ink text-base">{isBn ? "Fa Otɔfoɔ Ka Ho" : "Add Customer"}</h3>
              <button onClick={() => setShowAddCustomerModal(false)} className="text-ink hover:text-ink">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-ink mb-1">{isBn ? "Otɔfoɔ Din" : "Customer Name"} *</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={e => setNewCustName(e.target.value)}
                  placeholder="e.g. Kwame Mensah"
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
                />
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">{isBn ? "Mobile Fon" : "Mobile Phone"} *</label>
                <input
                  type="tel"
                  required
                  value={newCustPhone}
                  onChange={e => setNewCustPhone(e.target.value)}
                  placeholder="024 412 3456"
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="flex-1 py-2 border border-nv-200 rounded-xl font-semibold text-ink hover:bg-nv-50"
                >
                  {isBn ? "Gyae (Cancel)" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-em-700 hover:bg-em-800 text-white rounded-xl font-bold shadow-md"
                >
                  {isBn ? "Kora Otɔfoɔ Nsɛm So" : "Save Customer"}
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
              <h3 className="font-bold text-ink text-sm">{isBn ? "Barcode Scanfoɔ" : "Barcode Scanner"}</h3>
              <button onClick={() => setShowBarcodeScanner(false)} className="text-ink hover:text-ink">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 bg-nv-900 rounded-2xl relative overflow-hidden border border-nv-800">
              <div className="w-full h-32 border-2 border-dashed border-em-400/60 rounded-xl flex items-center justify-center">
                <div className="w-full h-0.5 bg-red-500 shadow-lg shadow-red-500 animate-bounce" />
              </div>
              <p className="text-white/60 text-xs mt-3">{isBn ? "Kyerɛ barcode kɔ mfonyintwafoɔ no anim" : "Point barcode at camera scanner"}</p>
            </div>

            <div className="text-xs text-ink">
              {isBn ? "Anaa scan nnoɔma ntɛm:" : "Or quick scan sample item:"}
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

      {/* MODAL: Bargaining & Quantity Flow Structure (Flow: photoclick -> price [orig vs barg] -> qty -> predicted vs barg total -> income) */}
      {bargainModalOpen && bargainingProduct && (() => {
        const parsedBargain = bargainPriceInput === "" ? 0 : parseFloat(bargainPriceInput);
        const validBargain = isNaN(parsedBargain) || parsedBargain < 0 ? 0 : parsedBargain;
        const modalPredictedTotal = bargainOriginalPrice * bargainQty;
        const modalBargainTotal = validBargain * bargainQty;
        const modalBargainDiff = modalPredictedTotal - modalBargainTotal;
        const modalIncome = modalBargainTotal;

        return (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-4 pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] sm:pb-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-nv-200 max-h-[calc(100vh-5.5rem-env(safe-area-inset-bottom,0px))] sm:max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
              {/* Modal Body */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
                {/* Product Information Header */}
                <div className="flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-nv-50 border border-nv-200">
                  <div className="w-16 h-16 rounded-xl bg-white p-1 border border-nv-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {bargainingProduct.image?.startsWith("/") || bargainingProduct.image?.startsWith("http") || bargainingProduct.image?.startsWith("data:") ? (
                      <img
                        src={bargainingProduct.image}
                        alt={bargainingProduct.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-3xl select-none">{bargainingProduct.image || "📦"}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-em-700 uppercase tracking-wider block">
                      {bargainingProduct.category} • SKU: {bargainingProduct.sku}
                    </span>
                    <h4 className="font-bold text-sm sm:text-base text-ink truncate">
                      {isBn ? cleanProductNameBn(bargainingProduct.nameBn) : cleanProductName(bargainingProduct.name)}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-ink/70">
                        {isBn ? "Akorae a Ɛwɔ Hɔ:" : "Available Stock:"} <strong className="text-ink">{tNum(bargainingProduct.stock)} pcs</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Step 2: [price] -> Original Price vs Bargaining Price (Always side-by-side left & right) */}
                <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                  {/* Original Price (Left) */}
                  <div className="p-2 sm:p-2.5 bg-nv-50 rounded-xl sm:rounded-2xl border border-nv-200 flex flex-col justify-center">
                    <div>
                      <div className="mb-0.5">
                        <span className="text-xs font-semibold text-ink/70">
                          {isBn ? "Boɔ Pɔtee" : "Original Price"}
                        </span>
                      </div>
                      <div className="num text-base font-bold text-ink mt-0.5 h-[34px] flex items-center">
                        {formatTaka(bargainOriginalPrice)}
                      </div>
                    </div>
                  </div>

                  {/* Bargaining Price Input (Right) */}
                  <div className="p-2 sm:p-2.5 bg-em-50/50 rounded-xl sm:rounded-2xl border-2 border-em-500/40 flex flex-col justify-center">
                    <div>
                      <div className="mb-0.5">
                        <span className="text-xs font-bold text-em-900 block truncate">
                          {isBn ? "Nkitahodie Boɔ" : "Bargaining Price"}
                        </span>
                      </div>
                      <div className="relative mt-0.5">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-base font-bold text-ink pointer-events-none">
                          ₵
                        </span>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={bargainPriceInput}
                          onChange={e => setBargainPriceInput(e.target.value)}
                          placeholder={bargainOriginalPrice.toString()}
                          className="num w-full pl-6 pr-2 py-1 bg-white border border-em-300 rounded-lg sm:rounded-xl font-bold text-base text-ink focus:border-em-600 focus:ring-1 focus:ring-em-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3: [amount / quantity] -> total */}
                <div className="p-2 sm:p-2.5 bg-nv-50 rounded-xl sm:rounded-2xl border border-nv-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-ink">
                      {isBn ? "Dodow (Amount):" : "Amount:"}
                    </label>
                    <span className="text-[11px] text-ink/70">
                      Max: {tNum(bargainingProduct.stock)} pcs
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-1 bg-white border border-nv-200 rounded-lg sm:rounded-xl p-0.5 sm:p-1 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setBargainQty(Math.max(1, bargainQty - 1))}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-ink hover:bg-nv-100 rounded-lg cursor-pointer"
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={bargainingProduct.stock}
                        value={bargainQty}
                        onChange={e => setBargainQty(Math.max(1, Math.min(bargainingProduct.stock, parseInt(e.target.value) || 1)))}
                        className="num w-12 sm:w-14 text-center font-bold text-sm bg-transparent border-0 focus:ring-0"
                      />
                      <button
                        type="button"
                        onClick={() => setBargainQty(Math.min(bargainingProduct.stock, bargainQty + 1))}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-ink hover:bg-nv-100 rounded-lg cursor-pointer"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBargainQty(bargainingProduct.stock)}
                      className={`px-3 py-1 sm:py-1.5 text-xs font-bold rounded-lg sm:rounded-xl border cursor-pointer transition-fast shadow-2xs
                        ${bargainQty === bargainingProduct.stock
                          ? "bg-em-700 text-white border-em-700"
                          : "bg-white text-ink border-nv-200 hover:bg-nv-100"}`}
                    >
                      Max
                    </button>
                  </div>
                </div>

                {/* Step 4 & 5: Live Flow Calculation Card (Diagram matching) */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-nv-50 to-em-50/40 border-2 border-dashed border-em-300 space-y-2.5">
                  <div className="space-y-1.5 text-xs">
                    {/* Original Total */}
                    <div className="flex justify-between items-center text-ink">
                      <span className="font-medium">
                        {isBn ? "Boɔ Pɔtee Nyinaa:" : "Original Total:"}
                      </span>
                      <span className="num font-semibold text-ink">
                        {formatTaka(bargainOriginalPrice)} × {bargainQty} = <strong className="text-ink">{formatTaka(modalPredictedTotal)}</strong>
                      </span>
                    </div>

                    {/* Bargaining Total */}
                    <div className="flex justify-between items-center text-ink">
                      <span className="font-medium">
                        {isBn ? "Nkitahodie Nyinaa:" : "Bargaining Total:"}
                      </span>
                      <span className="num font-semibold text-ink">
                        {formatTaka(validBargain)} × {bargainQty} = <strong className="text-ink">{formatTaka(modalBargainTotal)}</strong>
                      </span>
                    </div>

                    {/* Bargain Difference */}
                    {modalBargainDiff > 0 && (
                      <div className="flex justify-between items-center text-amber-800">
                        <span className="font-medium">
                          {isBn ? "So Teɛ:" : "Discount:"}
                        </span>
                        <span className="num font-bold">
                          -{formatTaka(modalBargainDiff)}
                        </span>
                      </div>
                    )}
                    {modalBargainDiff < 0 && (
                      <div className="flex justify-between items-center text-em-700">
                        <span className="font-medium">
                          {isBn ? "Nkabom:" : "Extra:"}
                        </span>
                        <span className="num font-bold">
                          +{formatTaka(Math.abs(modalBargainDiff))}
                        </span>
                      </div>
                    )}

                    {/* Final Income & Auto-fill Notice */}
                    {/* Final Total */}
                    <div className="pt-2 border-t border-nv-200/80 flex justify-between items-center">
                      <span className="text-xs font-bold text-ink">
                        {isBn ? "Nea Ɛbɛka Nyinaa:" : "Final Total:"}
                      </span>
                      <div className="num text-xl font-extrabold text-em-700">
                        {formatTaka(modalIncome)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="p-3.5 sm:p-4 border-t border-nv-100 flex gap-2.5 bg-nv-50/50 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setBargainModalOpen(false)}
                  className="flex-1 h-11 py-2.5 border border-nv-200 rounded-xl font-semibold text-xs sm:text-sm text-ink hover:bg-nv-100 transition-fast cursor-pointer"
                >
                  {isBn ? "Gyae (Cancel)" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBargain}
                  className="flex-[2] h-11 py-2.5 bg-em-600 hover:bg-em-700 active:bg-em-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle size={16} />
                  <span>
                    {isEditingExistingCart
                      ? (isBn ? `Sesa Kɛntɛn No Mu (${formatTaka(modalIncome)})` : `Update Cart Item (${formatTaka(modalIncome)})`)
                      : (isBn ? `Fa Gu Kɛntɛn Mu (${formatTaka(modalIncome)})` : `Add to Cart (${formatTaka(modalIncome)})`)}
                  </span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
