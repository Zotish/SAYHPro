import { useState } from "react";
import { Search, Download, AlertTriangle, X, RotateCcw, Plus, Minus, ArrowRight, ArrowLeft, Sparkles, ChevronRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useApp, Product } from "../context/AppContext";
import AIProductScannerModal from "../components/AIProductScannerModal";
import ProductThumb from "../components/ProductThumb";
import { toast } from "../components/Toast";

interface InventoryProps {
  lang: "en" | "bn";
  onBack?: () => void;
}

export default function Inventory({ lang, onBack }: InventoryProps) {
  const { products, adjustStock, tNum, formatTaka } = useApp();
  const isBn = lang === "bn";

  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustType, setAdjustType] = useState<"in" | "damage" | "return">("in");
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustReason, setAdjustReason] = useState("");

  // Add Stock — a dedicated, simpler flow: pick any product and add quantity.
  // Reuses adjustStock rather than duplicating the adjustment logic.
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showAIScanner, setShowAIScanner] = useState(false);
  const [addStockProductId, setAddStockProductId] = useState(products[0]?.id ?? 0);
  const [addStockQty, setAddStockQty] = useState("");
  const [addStockReason, setAddStockReason] = useState("");

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

  const handleAddStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addStockQty || Number(addStockQty) <= 0) return;

    adjustStock(Number(addStockProductId), Number(addStockQty), addStockReason || "Manual Stock Addition");
    setShowAddStockModal(false);
    setAddStockQty("");
    setAddStockReason("");
  };

  const handleExportCSV = () => {
    const csvRows = [
      ["ID", "Name", "SKU", "Category", "Buy Price", "Sell Price", "Stock", "Unit", "Valuation"],
      ...products.map(p => [
        p.id,
        p.name,
        p.sku,
        p.category,
        p.buyPrice,
        p.sellPrice,
        p.stock,
        p.unit,
        p.sellPrice * p.stock,
      ]),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SAYHPro_Stock_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      type: "success",
      title: isBn ? "Akorae Export Awie!" : "Stock Exported!",
      message: `${products.length} items saved to CSV.`,
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-24 lg:pb-8">
      {/* Header — the back arrow and the valuation+button group are real
          flex siblings on the same row (not overlaid), so neither can ever
          cover the other no matter how narrow the screen or how long the
          amount gets. */}
      <div className="flex items-center gap-4">
        {onBack && (
          <button
            onClick={onBack}
            aria-label={isBn ? "San Kɔ Akyi" : "Go back"}
            className="lg:hidden flex-shrink-0 w-9 h-9 rounded-full bg-nv-100 flex items-center justify-center text-ink active:bg-nv-200"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div className="ml-auto flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Label truncates first if the row is tight; the amount itself
              never does — it's the one number on this row that matters. */}
          <div className="flex items-baseline gap-1 min-w-0">
            <span className="hidden sm:inline truncate text-ink text-xs sm:text-sm">
              {isBn ? "Nnoɔma Boɔ Nyinaa: " : "Total Valuation: "}
            </span>
            <span className="sm:hidden text-ink text-xs">
              {isBn ? "Boɔ: " : "Val: "}
            </span>
            <span className="num font-bold text-ink text-xs sm:text-sm flex-shrink-0 whitespace-nowrap">
              {formatTaka(totalValue)}
            </span>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 border border-nv-200 rounded-xl text-xs sm:text-sm font-semibold text-ink bg-white hover:bg-nv-50 transition-fast shrink-0 cursor-pointer"
          >
            <Download size={15} />
            <span>{isBn ? "Export" : "Export CSV"}</span>
          </button>
          <button
            onClick={() => setShowAIScanner(true)}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-em-600 hover:bg-em-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-em-600/40 transition-fast cursor-pointer whitespace-nowrap"
          >
            <Plus size={16} /> {isBn ? "Akorae Fa Ka Ho" : "Add Stock"}
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Products", labelBn: "Nyinaa Nnoɔma", value: tNum(products.length) },
          { label: "In Stock", labelBn: "Akorae Wɔ Hɔ", value: tNum(products.filter(i => i.status === "in-stock").length) },
          { label: "Low Stock Alert", labelBn: "Akorae Fom Kɔkɔbɔ", value: tNum(products.filter(i => i.status === "low-stock").length) },
          { label: "Out of Stock", labelBn: "Akorae Asa", value: tNum(products.filter(i => i.status === "out-of-stock").length) },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-nv-200">
            <div className="text-xs text-ink/70 font-medium mb-1">{isBn ? s.labelBn : s.label}</div>
            <div className="num text-lg sm:text-xl font-bold text-ink">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Stock Charts & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Category Stock Level Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-nv-200 p-5 flex flex-col justify-between">
          <h3 className="font-display font-bold text-ink text-sm mb-3">
            {isBn ? "Akorae Sɛdeɛ Nkyekyɛmu Teɛ" : "Stock by Category (Quantity)"}
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStockData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10, fill: "#94A3B8" }} tickFormatter={(v) => tNum(v)} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} width={80} />
                <Tooltip formatter={(v: any) => [`${tNum(v)} ${isBn ? "pcs" : "pcs"}`, ""]} />
                <Bar dataKey="value" fill="#16A34A" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-nv-200 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-nv-100">
            <h3 className="font-display font-bold text-ink text-sm">{isBn ? "Akorae Fom Kɔkɔbɔ" : "Low Stock Alerts"}</h3>
            <span className="text-xs font-bold px-2 py-0.5 bg-red-100 text-ink rounded-full">{tNum(lowItems.length)} {isBn ? "nnoɔma" : "items"}</span>
          </div>

          <div className="divide-y divide-nv-100 overflow-y-auto max-h-60">
            {lowItems.map(item => (
              <div key={item.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-nv-50 transition-fast">
                <div className="flex items-center gap-3">
                  <ProductThumb
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 rounded-xl object-contain bg-nv-50 p-1 border border-nv-200/70 flex-shrink-0"
                    sizeClass="text-2xl"
                  />
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-ink">{isBn ? item.nameBn : item.name}</div>
                    <div className="text-[10px] text-ink font-mono">Min limit: {tNum(item.min)} pcs</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`num font-bold text-sm ${item.stock === 0 ? "text-ink font-extrabold" : "text-ink"}`}>
                    {tNum(item.stock)} {isBn ? "pcs" : "pcs"}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedProduct(item);
                      setAdjustType("in");
                      setAdjustQty("20");
                    }}
                    className="px-3 py-1.5 bg-em-50 text-ink hover:bg-em-100 rounded-lg text-xs font-bold transition-fast shadow-2xs"
                  >
                    {isBn ? "Akorae Ka ho" : "Add Stock"}
                  </button>
                </div>
              </div>
            ))}
            {lowItems.length === 0 && (
              <div className="p-8 text-center text-ink text-xs font-medium">
                {isBn ? "Nnoɔma nyinaa dɔɔso wɔ akorae pɛpɛɛpɛ!" : "All products have adequate stock levels!"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Inventory Table with Adjust Button */}
      <div className="bg-white rounded-2xl shadow-sm border border-nv-200 overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-nv-100 flex items-center justify-between gap-3">
          <div className="relative max-w-sm flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              type="text"
              placeholder={isBn ? "Hwehwɛ akorae mu..." : "Search inventory..."}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-nv-50 border border-nv-200 rounded-xl focus:bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-nv-50 border-b border-nv-200">
                <th className="px-4 py-3 font-bold text-ink whitespace-nowrap">{isBn ? "Nnoɔma" : "Product"}</th>
                <th className="px-4 py-3 font-bold text-ink whitespace-nowrap">{isBn ? "Nkyekyɛmu" : "Category"}</th>
                <th className="px-4 py-3 font-bold text-ink whitespace-nowrap">{isBn ? "Akorae a Ɛwɔ Hɔ Seesei" : "Current Stock"}</th>
                <th className="px-4 py-3 font-bold text-ink whitespace-nowrap">{isBn ? "Baako Boɔ" : "Unit Price"}</th>
                <th className="px-4 py-3 font-bold text-ink whitespace-nowrap">{isBn ? "Nnoɔma Boɔ Nyinaa" : "Total Valuation"}</th>
                <th className="px-4 py-3 font-bold text-ink whitespace-nowrap text-right">{isBn ? "Dwumadie" : "Action"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nv-100">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-nv-50 transition-fast">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ProductThumb
                        src={p.image}
                        alt={p.name}
                        className="w-11 h-11 rounded-xl object-contain bg-nv-50 p-1 border border-nv-200/70 flex-shrink-0"
                        sizeClass="text-2xl"
                      />
                      <div>
                        <div className="font-bold text-ink">{isBn ? p.nameBn : p.name}</div>
                        <div className="text-[10px] text-ink font-mono">{p.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink">{p.category}</td>
                  <td className="px-4 py-3">
                    <span className={`num font-bold text-sm ${p.stock <= 0 ? "text-ink" : p.stock <= p.min ? "text-ink" : "text-ink"}`}>
                      {tNum(p.stock)} {p.unit.split("/")[0]}
                    </span>
                  </td>
                  <td className="px-4 py-3 num text-ink">{formatTaka(p.sellPrice)}</td>
                  <td className="px-4 py-3 num font-bold text-ink">{formatTaka(p.sellPrice * p.stock)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedProduct(p);
                        setAdjustType("in");
                        setAdjustQty("10");
                      }}
                      className="px-3 py-1.5 bg-nv-100 hover:bg-em-100 text-ink hover:text-ink rounded-lg text-xs font-semibold transition-fast"
                    >
                      {isBn ? "Siesie Nnoɔma Dodoɔ" : "Adjust Stock"}
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
              <h3 className="font-bold text-ink text-base">{isBn ? "Siesie Akorae Nnoɔma" : "Adjust Inventory"}</h3>
              <button onClick={() => setSelectedProduct(null)} className="text-ink hover:text-ink">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdjustStockSubmit} className="space-y-3 text-xs sm:text-sm">
              <div className="p-3 bg-nv-50 rounded-xl flex items-center gap-3">
                <ProductThumb
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-10 h-10 rounded-lg object-contain bg-white p-0.5 border border-nv-200 flex-shrink-0"
                  sizeClass="text-xl"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-ink truncate">{isBn ? selectedProduct.nameBn : selectedProduct.name}</div>
                  <div className="text-xs text-ink">Current Stock: <span className="num font-bold text-ink">{tNum(selectedProduct.stock)}</span></div>
                </div>
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">{isBn ? "Nsesaeɛ Ahosuo" : "Adjustment Type"}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType("in")}
                    className={`py-2 rounded-xl text-xs font-bold border transition-fast flex items-center justify-center gap-1
                      ${adjustType === "in" ? "bg-em-700 text-white border-transparent" : "border-nv-200 text-ink bg-white"}`}
                  >
                    <Plus size={14} /> {isBn ? "Akorae Ka ho (In)" : "Add Stock"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType("damage")}
                    className={`py-2 rounded-xl text-xs font-bold border transition-fast flex items-center justify-center gap-1
                      ${adjustType === "damage" ? "bg-red-600 text-white border-transparent" : "border-nv-200 text-ink bg-white"}`}
                  >
                    <Minus size={14} /> {isBn ? "Sɛee / Afiri Mu" : "Damage / Out"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">{isBn ? "Dodoɔ (Pcs)" : "Quantity"} *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={adjustQty}
                  onChange={e => setAdjustQty(e.target.value)}
                  placeholder="e.g. 10"
                  className="num w-full border border-nv-200 rounded-xl px-3 py-2 text-base font-bold text-ink focus:border-em-500"
                />
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">{isBn ? "Nteaseɛ / Nsɛm" : "Reason / Note"}</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  placeholder={isBn ? "e.g. Nnoɔma foforɔ bae" : "e.g. Received new shipment"}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 py-2.5 border border-nv-200 rounded-xl font-semibold text-ink hover:bg-nv-50"
                >
                  {isBn ? "Gyae (Cancel)" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-em-700 hover:bg-em-800 text-white rounded-xl font-bold shadow-md"
                >
                  {isBn ? "Kora Nsesaeɛ So" : "Save Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Stock Modal — a simpler, dedicated "always adding" flow */}
      {showAddStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-nv-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-nv-100">
              <h3 className="font-bold text-ink text-base">{isBn ? "Akorae Fa Ka Ho" : "Add Stock"}</h3>
              <button onClick={() => setShowAddStockModal(false)} className="text-ink hover:text-ink">
                <X size={18} />
              </button>
            </div>

            {/* AI Camera Quick Scan Banner */}
            <div
              onClick={() => {
                setShowAddStockModal(false);
                setShowAIScanner(true);
              }}
              className="p-2.5 rounded-xl bg-gradient-to-r from-em-50 to-white border border-em-200 flex items-center justify-between cursor-pointer hover:border-em-500 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-em-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
                  <Sparkles size={14} />
                </div>
                <div>
                  <div className="text-xs font-bold text-ink group-hover:text-em-700">
                    {isBn ? "Fa mfonyintwafoɔ scan nnoɔma" : "Scan packet with camera"}
                  </div>
                  <div className="text-[10px] text-ink/60">
                    {isBn ? "Hunu nnoɔma ntɛm & fa gu akorae" : "Instant product recognition & stock in"}
                  </div>
                </div>
              </div>
              <ChevronRight size={14} className="text-em-700 flex-shrink-0" />
            </div>

            <form onSubmit={handleAddStockSubmit} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-ink mb-1">{isBn ? "Nnoɔma" : "Product"} *</label>
                <select
                  value={addStockProductId}
                  onChange={e => setAddStockProductId(Number(e.target.value))}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 bg-white focus:border-em-500"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) — {tNum(p.stock)} {p.unit.split("/")[0]} {isBn ? "wɔ akorae" : "in stock"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">{isBn ? "Dodoɔ (Pcs)" : "Quantity to Add"} *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={addStockQty}
                  onChange={e => setAddStockQty(e.target.value)}
                  placeholder="e.g. 20"
                  className="num w-full border border-nv-200 rounded-xl px-3 py-2 text-base font-bold text-ink focus:border-em-500"
                />
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">{isBn ? "Nteaseɛ / Nsɛm" : "Reason / Note"}</label>
                <input
                  type="text"
                  value={addStockReason}
                  onChange={e => setAddStockReason(e.target.value)}
                  placeholder={isBn ? "e.g. Nnoɔma foforɔ bae" : "e.g. Received new shipment"}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStockModal(false)}
                  className="flex-1 py-2.5 border border-nv-200 rounded-xl font-semibold text-ink hover:bg-nv-50"
                >
                  {isBn ? "Gyae (Cancel)" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-em-600 hover:bg-em-700 text-white rounded-xl font-bold shadow-md"
                >
                  {isBn ? "Akorae Fa Ka Ho" : "Add Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Product / Stock Scanner Modal */}
      <AIProductScannerModal
        isOpen={showAIScanner}
        onClose={() => setShowAIScanner(false)}
        lang={lang}
        mode="add-stock"
      />
    </div>
  );
}
