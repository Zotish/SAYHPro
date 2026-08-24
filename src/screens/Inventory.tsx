import { useState } from "react";
import { Search, Download, AlertTriangle, Package, CheckCircle, X, RotateCcw, Plus, Minus, ArrowRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useApp, Product } from "../context/AppContext";
import { toast } from "../components/Toast";

interface InventoryProps {
  lang: "en" | "bn";
}

export default function Inventory({ lang }: InventoryProps) {
  const { products, adjustStock } = useApp();
  const isBn = lang === "bn";

  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustType, setAdjustType] = useState<"in" | "damage" | "return">("in");
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustReason, setAdjustReason] = useState("");

  const totalValue = products.reduce((s, i) => s + i.sellPrice * i.stock, 0);
  const lowItems = products.filter(i => i.status === "low-stock" || i.status === "out-of-stock");

  // Group by category for chart
  const categoryStockData = Array.from(new Set(products.map(p => p.category))).map(cat => {
    const sum = products.filter(p => p.category === cat).reduce((s, p) => s + p.stock, 0);
    return { name: cat, value: sum };
  });

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.nameBn.includes(search) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdjustStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !adjustQty || Number(adjustQty) <= 0) return;

    const delta = adjustType === "in" ? Number(adjustQty) : -Number(adjustQty);
    const reasonText = adjustReason || (adjustType === "in" ? "Manual Stock Addition" : "Damage / Wastage Write-off");

    adjustStock(selectedProduct.id, delta, reasonText);
    setSelectedProduct(null);
    setAdjustQty("");
    setAdjustReason("");
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-nv-900">{isBn ? "ইনভেন্টরি ও স্টক লেজার" : "Inventory & Stock"}</h1>
          <p className="text-nv-500 text-xs sm:text-sm mt-0.5">
            {isBn ? "মোট ইনভেন্টরি মূল্যমান: " : "Total Stock Valuation: "}
            <span className="num font-bold text-em-700">৳{totalValue.toLocaleString()}</span>
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Products", labelBn: "মোট পণ্য", value: products.length, icon: Package, color: "bg-nv-100 text-nv-700" },
          { label: "In Stock", labelBn: "পর্যাপ্ত স্টক", value: products.filter(i => i.status === "in-stock").length, icon: CheckCircle, color: "bg-em-50 text-em-700" },
          { label: "Low Stock Alert", labelBn: "কম স্টক সতর্কতা", value: products.filter(i => i.status === "low-stock").length, icon: AlertTriangle, color: "bg-amber-50 text-amber-700" },
          { label: "Out of Stock", labelBn: "স্টক শূন্য", value: products.filter(i => i.status === "out-of-stock").length, icon: X, color: "bg-red-50 text-red-600" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-nv-200 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon size={18} />
            </div>
            <div>
              <div className="num text-lg sm:text-xl font-bold text-nv-900">{s.value}</div>
              <div className="text-[11px] text-nv-500">{isBn ? s.labelBn : s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Stock Charts & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Category Stock Level Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-nv-200 p-5 flex flex-col justify-between">
          <h3 className="font-display font-bold text-nv-900 text-sm mb-3">
            {isBn ? "ক্যাটাগরি অনুযায়ী স্টক পরিমাণ" : "Stock by Category (Quantity)"}
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStockData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} width={80} />
                <Tooltip formatter={(v: any) => `${v} pcs`} />
                <Bar dataKey="value" fill="#059669" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-nv-200 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-nv-100">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              <h3 className="font-display font-bold text-nv-900 text-sm">{isBn ? "জরুরি স্টক সতর্কতা" : "Low Stock Alerts"}</h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 bg-red-100 text-red-700 rounded-full">{lowItems.length} items</span>
          </div>

          <div className="divide-y divide-nv-100 overflow-y-auto max-h-60">
            {lowItems.map(item => (
              <div key={item.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-nv-50 transition-fast">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.image || "📦"}</span>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-nv-900">{isBn ? item.nameBn : item.name}</div>
                    <div className="text-[10px] text-nv-400 font-mono">Min limit: {item.min} pcs</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`num font-bold text-sm ${item.stock === 0 ? "text-red-600 font-extrabold" : "text-amber-700"}`}>
                    {item.stock} {isBn ? "টি বাকি" : "pcs"}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedProduct(item);
                      setAdjustType("in");
                      setAdjustQty("20");
                    }}
                    className="px-3 py-1.5 bg-em-50 text-em-800 hover:bg-em-100 rounded-lg text-xs font-bold transition-fast shadow-2xs"
                  >
                    {isBn ? "স্টক যোগ" : "Add Stock"}
                  </button>
                </div>
              </div>
            ))}
            {lowItems.length === 0 && (
              <div className="p-8 text-center text-nv-400 text-xs font-medium">
                {isBn ? "সব পণ্যের স্টক পর্যাপ্ত আছে!" : "All products have adequate stock levels!"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Inventory Table with Adjust Button */}
      <div className="bg-white rounded-2xl shadow-sm border border-nv-200 overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-nv-100 flex items-center justify-between gap-3">
          <div className="relative max-w-sm flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-nv-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              type="text"
              placeholder={isBn ? "পণ্য বা SKU দিয়ে খুঁজুন..." : "Search inventory..."}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-nv-50 border border-nv-200 rounded-xl focus:bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-nv-50 border-b border-nv-200">
                <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "পণ্য" : "Product"}</th>
                <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "ক্যাটাগরি" : "Category"}</th>
                <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "বর্তমান স্টক" : "Current Stock"}</th>
                <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "একক মূল্য" : "Unit Price"}</th>
                <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "স্টক মূল্যায়ন" : "Total Valuation"}</th>
                <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap text-right">{isBn ? "স্টক সমন্বয়" : "Action"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nv-100">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-nv-50 transition-fast">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{p.image || "📦"}</span>
                      <div>
                        <div className="font-bold text-nv-900">{isBn ? p.nameBn : p.name}</div>
                        <div className="text-[10px] text-nv-400 font-mono">{p.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-nv-600">{p.category}</td>
                  <td className="px-4 py-3">
                    <span className={`num font-bold text-sm ${p.stock <= 0 ? "text-red-600" : p.stock <= p.min ? "text-amber-700" : "text-nv-900"}`}>
                      {p.stock} {p.unit.split("/")[0]}
                    </span>
                  </td>
                  <td className="px-4 py-3 num text-nv-700">৳{p.sellPrice}</td>
                  <td className="px-4 py-3 num font-bold text-em-700">৳{(p.sellPrice * p.stock).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedProduct(p);
                        setAdjustType("in");
                        setAdjustQty("10");
                      }}
                      className="px-3 py-1.5 bg-nv-100 hover:bg-em-100 text-nv-800 hover:text-em-800 rounded-lg text-xs font-semibold transition-fast"
                    >
                      {isBn ? "স্টক সমন্বয়" : "Adjust Stock"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-nv-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-nv-100">
              <h3 className="font-bold text-nv-900 text-base">{isBn ? "স্টক সমন্বয়" : "Adjust Inventory"}</h3>
              <button onClick={() => setSelectedProduct(null)} className="text-nv-400 hover:text-nv-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdjustStockSubmit} className="space-y-3 text-xs sm:text-sm">
              <div className="p-3 bg-nv-50 rounded-xl">
                <div className="font-bold text-nv-900">{selectedProduct.name}</div>
                <div className="text-xs text-nv-500">Current Stock: <span className="num font-bold text-em-700">{selectedProduct.stock}</span></div>
              </div>

              <div>
                <label className="block font-medium text-nv-700 mb-1">{isBn ? "সমন্বয়ের ধরণ" : "Adjustment Type"}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType("in")}
                    className={`py-2 rounded-xl text-xs font-bold border transition-fast flex items-center justify-center gap-1
                      ${adjustType === "in" ? "bg-em-700 text-white border-transparent" : "border-nv-200 text-nv-700 bg-white"}`}
                  >
                    <Plus size={14} /> {isBn ? "স্টক যোগ (In)" : "Add Stock"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType("damage")}
                    className={`py-2 rounded-xl text-xs font-bold border transition-fast flex items-center justify-center gap-1
                      ${adjustType === "damage" ? "bg-red-600 text-white border-transparent" : "border-nv-200 text-nv-700 bg-white"}`}
                  >
                    <Minus size={14} /> {isBn ? "নষ্ট / ক্ষতি (Damage)" : "Damage / Out"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-medium text-nv-700 mb-1">{isBn ? "পরিমাণ (পিস)" : "Quantity"} *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={adjustQty}
                  onChange={e => setAdjustQty(e.target.value)}
                  placeholder="e.g. 10"
                  className="num w-full border border-nv-200 rounded-xl px-3 py-2 text-base font-bold text-nv-900 focus:border-em-500"
                />
              </div>

              <div>
                <label className="block font-medium text-nv-700 mb-1">{isBn ? "কারণ / নোট" : "Reason / Note"}</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  placeholder={isBn ? "যেমন: নতুন চালান বা মেয়াদোত্তীর্ণ..." : "e.g. Received new shipment"}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 py-2.5 border border-nv-200 rounded-xl font-semibold text-nv-700 hover:bg-nv-50"
                >
                  {isBn ? "বাতিল" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-em-700 hover:bg-em-800 text-white rounded-xl font-bold shadow-md"
                >
                  {isBn ? "নিশ্চিত করুন" : "Save Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
