import { useState } from "react";
import { Plus, Search, ChevronDown, Calendar, Truck, CheckCircle, Clock, X, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import { useApp } from "../context/AppContext";
import { toast } from "../components/Toast";

interface PurchasesProps {
  lang: "en" | "bn";
  onBack?: () => void;
}

const statusBadge = (status: string, isBn: boolean) => {
  const map: Record<string, { label: string; labelBn: string; cls: string; icon: React.ElementType }> = {
    paid: { label: "Paid", labelBn: "Wɔatua Pɛpɛɛpɛ", cls: "bg-em-50 text-ink border border-em-200", icon: CheckCircle },
    partial: { label: "Partial", labelBn: "Wɔatua Fa Bi", cls: "bg-ac-50 text-ink border border-ac-200", icon: Clock },
    credit: { label: "Credit / Due", labelBn: "Tɔ wɔ Aka So", cls: "bg-red-50 text-ink border border-red-200", icon: X },
  };
  const m = map[status] || map.paid;
  return (
    <span className={`flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-semibold w-fit ${m.cls}`}>
      <m.icon size={11} />
      {isBn ? m.labelBn : m.label}
    </span>
  );
};

export default function Purchases({ lang, onBack }: PurchasesProps) {
  const { purchases, addPurchase, suppliers, products, accounts, tNum, formatTaka } = useApp();
  const isBn = lang === "bn";

  const [showForm, setShowForm] = useState(false);
  const [supplierName, setSupplierName] = useState(suppliers[0]?.name || "Pran-RFL Group");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paidAmount, setPaidAmount] = useState<string>("");
  const [items, setItems] = useState<{ product: string; qty: number; cost: number }[]>([
    { product: products[0]?.name || "Sunflower Oil 5L", qty: 10, cost: 250 },
  ]);
  const [search, setSearch] = useState("");

  const addItem = () => {
    setItems(prev => [...prev, { product: products[0]?.name || "Item", qty: 1, cost: 100 }]);
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, i) => sum + i.qty * i.cost, 0);

  const handleCreatePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || subtotal <= 0) return;

    const actualPaid = paidAmount === "" ? subtotal : Number(paidAmount);

    addPurchase({
      supplier: supplierName,
      invoiceNo: invoiceNo || `SUP-${Date.now().toString().slice(-4)}`,
      date: new Date(purchaseDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      items: items.map(i => ({ product: i.product, qty: Number(i.qty), cost: Number(i.cost) })),
      paid: actualPaid,
      paymentMethod,
    });

    setShowForm(false);
    setPaidAmount("");
    setInvoiceNo("");

    toast({
      type: "success",
      title: isBn ? "Ntɔdeɛ No Akɔ!" : "Purchase Order Recorded!",
      message: isBn ? `${items.length} nnoɔma aka akorae mu.` : `${items.length} item(s) added to inventory stock.`,
    });
  };

  const filtered = purchases.filter(p =>
    p.supplier.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  const totalPurchasesAmount = purchases.reduce((s, p) => s + p.total, 0);
  const totalDueToSuppliers = purchases.reduce((s, p) => s + p.due, 0);

  const urgentCount = products.filter(p => p.status === "low-stock" || p.status === "out-of-stock").length;

  const handleAutoFillUrgent = () => {
    const urgentItems = products.filter(p => p.status === "low-stock" || p.status === "out-of-stock");
    if (urgentItems.length > 0) {
      setItems(
        urgentItems.map(p => ({
          product: p.name,
          qty: Math.max(15, p.min * 2 - p.stock),
          cost: p.buyPrice,
        }))
      );
      setShowForm(true);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        {onBack && (
          <button
            onClick={onBack}
            aria-label={isBn ? "San Kɔ Akyi" : "Go back"}
            className="lg:hidden flex-shrink-0 w-9 h-9 rounded-full bg-nv-100 flex items-center justify-center text-ink active:bg-nv-200 cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div className="ml-auto">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-em-700 hover:bg-em-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md cursor-pointer transition-colors"
          >
            <Plus size={16} /> {isBn ? "Purchase Order Foforɔ" : "New Purchase"}
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Purchases", labelBn: "Nnoɔma a Wɔatɔ Nyinaa", value: formatTaka(totalPurchasesAmount) },
          { label: "Payable to Suppliers", labelBn: "Agorɔfoɔ Aka", value: formatTaka(totalDueToSuppliers) },
          { label: "Total Orders", labelBn: "Ntɔdeɛ Nyinaa", value: tNum(purchases.length) },
          { label: "Active Suppliers", labelBn: "Adwumawuranom Dodoɔ", value: tNum(suppliers.length) },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-nv-200">
            <div className="text-xs text-ink/70 font-medium mb-1">{isBn ? s.labelBn : s.label}</div>
            <div className="num text-lg sm:text-xl font-bold text-ink">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Color-Coded Purchasing Advisory Strip */}
      <div className="bg-gradient-to-r from-em-50/60 via-nv-50/30 to-white border border-em-200 rounded-2xl p-4 flex flex-col gap-2.5 shadow-2xs">
        <div className="font-bold text-xs sm:text-sm text-ink">
          {isBn ? "Nyansa Ntɔdeɛ Afotusɛm:" : "Smart Purchasing Advisory:"}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleAutoFillUrgent}
            className="px-3 py-1.5 bg-em-700 hover:bg-em-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>{tNum(urgentCount)} {isBn ? "Ntɛmntɛm Pa Ara" : "Urgent"}</span>
          </button>

          <button
            onClick={handleAutoFillUrgent}
            className="px-3 py-1.5 bg-em-700 hover:bg-em-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} />
            <span>{isBn ? "Hyehyɛ No Ntɛm" : "Auto-Fill"}</span>
          </button>
        </div>
      </div>

      {/* New Purchase Modal Popup */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setShowForm(false)}
            aria-hidden="true"
          />
          <div
            className="relative bg-white rounded-3xl shadow-2xl border border-nv-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 my-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 sm:px-6 border-b border-nv-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <Truck size={20} className="text-ink" />
                <h3 className="font-display font-bold text-ink text-base sm:text-lg leading-tight">
                  {isBn ? "Kyerɛw Nnoɔma a Wɔatɔ Invois" : "Record Purchase Order"}
                </h3>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-full bg-nv-100 hover:bg-nv-200 flex items-center justify-center text-ink transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleCreatePurchase} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
                <div>
                  <label className="block font-semibold text-ink mb-1">{isBn ? "Agorɔfoɔ" : "Supplier"} *</label>
                  <select
                    value={supplierName}
                    onChange={e => setSupplierName(e.target.value)}
                    className="w-full border border-nv-200 rounded-xl px-3 py-2 bg-white focus:border-em-500 text-xs sm:text-sm"
                  >
                    {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">{isBn ? "Nnoɔma Wura Invois Nɔma" : "Supplier Invoice No."}</label>
                  <input
                    type="text"
                    value={invoiceNo}
                    onChange={e => setInvoiceNo(e.target.value)}
                    placeholder="e.g. PRAN-9921"
                    className="w-full border border-nv-200 rounded-xl px-3 py-2 font-mono focus:border-em-500 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">{isBn ? "Da" : "Date"}</label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={e => setPurchaseDate(e.target.value)}
                    className="w-full border border-nv-200 rounded-xl px-3 py-2 bg-white focus:border-em-500 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-2.5 pt-2 border-t border-nv-100">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs font-bold text-ink uppercase tracking-wider">
                    {isBn ? "Nnoɔma (Bɛkɔ akorae mu ntɛm)" : "Products (Will auto-add to Stock)"}
                  </span>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-xs font-bold text-em-700 hover:text-em-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} /> {isBn ? "Fa Nnoɔma Ka Ho" : "Add Item"}
                  </button>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {items.map((item, idx) => (
                    <div key={idx} className="bg-nv-50/80 p-2.5 sm:p-3 rounded-2xl border border-nv-200 space-y-2">
                      <div className="flex items-center gap-2">
                        <select
                          value={item.product}
                          onChange={e => {
                            const val = e.target.value;
                            const matched = products.find(p => p.name === val);
                            setItems(prev => prev.map((it, i) => i === idx ? { ...it, product: val, cost: matched ? matched.buyPrice : it.cost } : it));
                          }}
                          className="flex-1 border border-nv-200 rounded-xl px-3 py-2 text-xs sm:text-sm bg-white font-medium text-ink focus:border-em-500"
                        >
                          {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                        </select>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer"
                            title={isBn ? "Yi Fi Mu" : "Remove item"}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 items-center">
                        <div>
                          <span className="text-[10px] font-semibold text-ink/70 block mb-0.5">Qty</span>
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={e => setItems(prev => prev.map((it, i) => i === idx ? { ...it, qty: Number(e.target.value) } : it))}
                            className="num w-full border border-nv-200 rounded-lg px-2.5 py-1.5 text-xs text-center bg-white font-semibold focus:border-em-500"
                          />
                        </div>

                        <div>
                          <span className="text-[10px] font-semibold text-ink/70 block mb-0.5">Cost (₵/pc)</span>
                          <input
                            type="number"
                            min="0"
                            value={item.cost}
                            onChange={e => setItems(prev => prev.map((it, i) => i === idx ? { ...it, cost: Number(e.target.value) } : it))}
                            className="num w-full border border-nv-200 rounded-lg px-2.5 py-1.5 text-xs text-right bg-white font-semibold focus:border-em-500"
                          />
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-semibold text-ink/70 block mb-0.5">Subtotal</span>
                          <span className="num font-bold text-xs sm:text-sm text-ink block py-1">
                            {formatTaka(item.qty * item.cost)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-nv-50/90 rounded-2xl border border-nv-200 text-xs sm:text-sm">
                <div>
                  <span className="block text-ink/70 text-[11px] font-medium">{isBn ? "Nyinaa Boɔ a Wɔtɔeɛ" : "Total Cost"}</span>
                  <span className="num text-xl font-black text-ink">{formatTaka(subtotal)}</span>
                </div>

                <div>
                  <label className="block font-semibold text-ink text-[11px] mb-1">{isBn ? "Akatua a Wɔatua (₵)" : "Paid Amount (₵)"}</label>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={e => setPaidAmount(e.target.value)}
                    placeholder={`Full (${formatTaka(subtotal)})`}
                    className="num w-full border border-nv-200 rounded-xl px-3 py-1.5 bg-white font-bold text-ink focus:border-em-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink text-[11px] mb-1">{isBn ? "Akatua Akawnt" : "Payment Account"}</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="w-full border border-nv-200 rounded-xl px-3 py-1.5 bg-white font-medium focus:border-em-500"
                  >
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({formatTaka(a.balance)})</option>)}
                  </select>
                </div>
              </div>

              {/* Modal Footer / Actions */}
              <div className="flex gap-2.5 justify-end pt-3 border-t border-nv-100">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 sm:px-5 py-2.5 border border-nv-200 rounded-xl font-semibold text-ink hover:bg-nv-100 text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  {isBn ? "Gyae (Cancel)" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 sm:px-6 py-2.5 bg-em-700 hover:bg-em-800 text-white rounded-xl font-bold shadow-md text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  {isBn ? "Si Ntɔdeɛ No So Dua" : "Confirm Purchase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search & Purchases Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-nv-200 overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-nv-100 flex items-center justify-between gap-3">
          <div className="relative max-w-sm flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              type="text"
              placeholder={isBn ? "Hwehwɛ adwumawura anaa order ID..." : "Search by supplier or order ID..."}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-nv-50 border border-nv-200 rounded-xl focus:bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-nv-50 border-b border-nv-200">
                <th className="px-4 py-3 font-bold text-ink whitespace-nowrap">{isBn ? "Ntɔdeɛ Nɔma" : "Order ID"}</th>
                <th className="px-4 py-3 font-bold text-ink whitespace-nowrap">{isBn ? "Agorɔfoɔ" : "Supplier"}</th>
                <th className="px-4 py-3 font-bold text-ink whitespace-nowrap">{isBn ? "Da" : "Date"}</th>
                <th className="px-4 py-3 font-bold text-ink whitespace-nowrap">{isBn ? "Ne Nyinaa" : "Total"}</th>
                <th className="px-4 py-3 font-bold text-ink whitespace-nowrap">{isBn ? "Wɔatua Pɛpɛɛpɛ" : "Paid"}</th>
                <th className="px-4 py-3 font-bold text-ink whitespace-nowrap">{isBn ? "Aka" : "Due"}</th>
                <th className="px-4 py-3 font-bold text-ink whitespace-nowrap">{isBn ? "Gyinabea" : "Status"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nv-100">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-nv-50 transition-fast">
                  <td className="px-4 py-3 font-mono font-bold text-ink whitespace-nowrap">{tNum(p.id)}</td>
                  <td className="px-4 py-3 font-semibold text-ink whitespace-nowrap">{p.supplier}</td>
                  <td className="px-4 py-3 text-xs text-ink whitespace-nowrap">{p.date}</td>
                  <td className="px-4 py-3 num font-bold text-ink whitespace-nowrap">{formatTaka(p.total)}</td>
                  <td className="px-4 py-3 num font-semibold text-ink whitespace-nowrap">{formatTaka(p.paid)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`num font-bold ${p.due > 0 ? "text-ink" : "text-ink"}`}>
                      {p.due > 0 ? formatTaka(p.due) : "₵ 0"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{statusBadge(p.status, isBn)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
