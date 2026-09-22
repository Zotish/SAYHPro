import { useState } from "react";
import { Plus, Search, ChevronDown, Calendar, Truck, CheckCircle, Clock, X, Trash2, ArrowRight } from "lucide-react";
import { useApp } from "../context/AppContext";

interface PurchasesProps {
  lang: "en" | "bn";
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

export default function Purchases({ lang }: PurchasesProps) {
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
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-4 py-2 bg-em-700 hover:bg-em-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md"
        >
          <Plus size={16} /> {isBn ? "Purchase Order Foforɔ" : "New Purchase"}
        </button>
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

      {/* New Purchase Modal / Card */}
      {showForm && (
        <div className="bg-white rounded-3xl shadow-xl border border-nv-200 p-5 sm:p-6 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-3 border-b border-nv-100 mb-4">
            <div className="flex items-center gap-2">
              <Truck size={20} className="text-ink" />
              <h3 className="font-display font-bold text-ink text-base">{isBn ? "Kyerɛw Nnoɔma a Wɔatɔ Invois" : "Record Purchase Order"}</h3>
            </div>
            <button onClick={() => setShowForm(false)} className="text-ink hover:text-ink">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleCreatePurchase} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-ink mb-1">{isBn ? "Agorɔfoɔ" : "Supplier"} *</label>
                <select
                  value={supplierName}
                  onChange={e => setSupplierName(e.target.value)}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 bg-white focus:border-em-500"
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
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 font-mono focus:border-em-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">{isBn ? "Da" : "Date"}</label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={e => setPurchaseDate(e.target.value)}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 bg-white focus:border-em-500"
                />
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2 pt-2 border-t border-nv-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink uppercase tracking-wider">{isBn ? "Nnoɔma (Bɛkɔ akorae mu ntɛm)" : "Products (Will auto-add to Stock)"}</span>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-xs font-bold text-ink hover:underline flex items-center gap-1"
                >
                  <Plus size={14} /> {isBn ? "Fa Nnoɔma Ka Ho" : "Add Item"}
                </button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-nv-50 p-2.5 rounded-xl border border-nv-200">
                    <select
                      value={item.product}
                      onChange={e => {
                        const val = e.target.value;
                        const matched = products.find(p => p.name === val);
                        setItems(prev => prev.map((it, i) => i === idx ? { ...it, product: val, cost: matched ? matched.buyPrice : it.cost } : it));
                      }}
                      className="flex-1 border border-nv-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:border-em-500"
                    >
                      {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </select>

                    <div className="flex items-center gap-1 w-24">
                      <span className="text-[11px] text-ink">Qty:</span>
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={e => setItems(prev => prev.map((it, i) => i === idx ? { ...it, qty: Number(e.target.value) } : it))}
                        className="num w-full border border-nv-200 rounded-lg px-2 py-1 text-xs text-center bg-white"
                      />
                    </div>

                    <div className="flex items-center gap-1 w-28">
                      <span className="text-[11px] text-ink">₵/pc:</span>
                      <input
                        type="number"
                        min="0"
                        value={item.cost}
                        onChange={e => setItems(prev => prev.map((it, i) => i === idx ? { ...it, cost: Number(e.target.value) } : it))}
                        className="num w-full border border-nv-200 rounded-lg px-2 py-1 text-xs text-right bg-white"
                      />
                    </div>

                    <div className="num font-bold text-xs text-ink w-20 text-right">
                      {formatTaka(item.qty * item.cost)}
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="text-ink hover:text-ink p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-nv-100 text-xs sm:text-sm bg-nv-50/50 p-3 rounded-2xl">
              <div>
                <span className="block text-ink">{isBn ? "Nyinaa Boɔ a Wɔtɔeɛ" : "Total Cost"}</span>
                <span className="num text-xl font-bold text-ink">{formatTaka(subtotal)}</span>
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">{isBn ? "Akatua a Wɔatua (₵)" : "Paid Amount (₵)"}</label>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={e => setPaidAmount(e.target.value)}
                  placeholder={`Full (${formatTaka(subtotal)})`}
                  className="num w-full border border-nv-200 rounded-xl px-3 py-1.5 bg-white font-bold text-ink"
                />
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">{isBn ? "Akatua Akawnt" : "Payment Account"}</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full border border-nv-200 rounded-xl px-3 py-1.5 bg-white"
                >
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({formatTaka(a.balance)})</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 border border-nv-200 rounded-xl font-semibold text-ink hover:bg-nv-50 text-xs sm:text-sm"
              >
                {isBn ? "Gyae (Cancel)" : "Cancel"}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-em-700 hover:bg-em-800 text-white rounded-xl font-bold shadow-md text-xs sm:text-sm"
              >
                {isBn ? "Si Ntɔdeɛ No So Dua" : "Confirm Purchase"}
              </button>
            </div>
          </form>
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
