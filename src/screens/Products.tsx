import { useState } from "react";
import {
  Search, Plus, Download, Printer, Edit, Trash2,
  Package, AlertTriangle, CheckCircle, X, Upload,
  Barcode, Image, ArrowLeft, LayoutGrid, List, SlidersHorizontal
} from "lucide-react";
import { useApp, Product } from "../context/AppContext";
import { toast } from "../components/Toast";

interface ProductsProps {
  lang: "en" | "bn";
  showAdd?: boolean;
  setScreen: (s: string) => void;
}

const statusBadge = (status: string, isBn: boolean) => {
  const map: Record<string, { label: string; labelBn: string; cls: string }> = {
    "in-stock": { label: "In Stock", labelBn: "স্টকে আছে", cls: "bg-em-50 text-em-700 border border-em-200" },
    "low-stock": { label: "Low Stock", labelBn: "কম স্টক", cls: "bg-amber-50 text-amber-700 border border-amber-200" },
    "out-of-stock": { label: "Out of Stock", labelBn: "স্টক নেই", cls: "bg-red-50 text-red-600 border border-red-200" },
  };
  const m = map[status] || map["in-stock"];
  return <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${m.cls}`}>{isBn ? m.labelBn : m.label}</span>;
};

export default function Products({ lang, showAdd, setScreen }: ProductsProps) {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const isBn = lang === "bn";

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Edit modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [showBarcodePrintModal, setShowBarcodePrintModal] = useState<Product | null>(null);

  // New Product Form state
  const [name, setName] = useState("");
  const [nameBn, setNameBn] = useState("");
  const [category, setCategory] = useState("Grocery");
  const [unit, setUnit] = useState("Piece / পিস");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [buyPrice, setBuyPrice] = useState<number | "">("");
  const [sellPrice, setSellPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [minStock, setMinStock] = useState<number | "">(10);
  const [brand, setBrand] = useState("");
  const [imageEmoji, setImageEmoji] = useState("📦");

  const units = ["Piece / পিস", "KG", "Liter / লিটার", "Meter", "Packet / প্যাকেট", "Box / বক্স"];
  const categories = ["Grocery", "Snacks", "Dairy", "Beverages", "Personal Care", "Household", "Electronics"];

  const handleSaveNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || sellPrice === "" || stock === "") {
      toast({
        type: "warning",
        title: isBn ? "প্রয়োজনীয় তথ্য দিন" : "Missing Details",
        message: "Please provide product name, selling price, and opening stock.",
      });
      return;
    }

    const generatedSku = sku.trim() || `SKU-${Date.now().toString().slice(-4)}`;
    const generatedBarcode = barcode.trim() || `894${Date.now().toString().slice(-8)}`;

    addProduct({
      name,
      nameBn: nameBn || name,
      category,
      unit,
      sku: generatedSku,
      barcode: generatedBarcode,
      buyPrice: Number(buyPrice) || 0,
      sellPrice: Number(sellPrice),
      stock: Number(stock),
      min: Number(minStock) || 5,
      brand,
      image: imageEmoji,
    });

    setScreen("products");
  };

  const handleUpdateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    updateProduct(editingProduct.id, {
      name: editingProduct.name,
      nameBn: editingProduct.nameBn,
      category: editingProduct.category,
      unit: editingProduct.unit,
      sku: editingProduct.sku,
      buyPrice: editingProduct.buyPrice,
      sellPrice: editingProduct.sellPrice,
      stock: editingProduct.stock,
      min: editingProduct.min,
      brand: editingProduct.brand,
    });

    setEditingProduct(null);
  };

  const exportToCSV = () => {
    const headers = ["ID", "Name", "SKU", "Category", "Buy Price", "Sell Price", "Stock", "Status"];
    const rows = products.map(p => [p.id, `"${p.name}"`, p.sku, p.category, p.buyPrice, p.sellPrice, p.stock, p.status]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dukan_products_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      type: "success",
      title: isBn ? "এক্সপোর্ট সফল হয়েছে" : "Products Exported",
      message: `${products.length} products exported to CSV`,
    });
  };

  // Add Product Form View
  if (showAdd) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto pb-24 lg:pb-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setScreen("products")}
            className="w-10 h-10 rounded-xl bg-white border border-nv-200 flex items-center justify-center hover:bg-nv-50 transition-fast shadow-2xs"
          >
            <ArrowLeft size={18} className="text-nv-700" />
          </button>
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-nv-900">
              {isBn ? "নতুন পণ্য যোগ করুন" : "Add New Product"}
            </h1>
            <p className="text-nv-500 text-xs sm:text-sm">
              {isBn ? "পণ্যের তথ্য, মূল্য ও স্টক পূরণ করুন" : "Enter product details, pricing, and stock"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveNewProduct} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Image / Icon Selector */}
            <div className="lg:col-span-1 bg-white rounded-2xl border border-nv-200 p-5 shadow-sm space-y-4">
              <h3 className="font-semibold text-sm text-nv-800">{isBn ? "পণ্যের আইকন" : "Product Icon"}</h3>
              <div className="aspect-square rounded-2xl bg-nv-50 border-2 border-dashed border-nv-200 flex flex-col items-center justify-center gap-3 p-4">
                <span className="text-6xl select-none animate-bounce">{imageEmoji}</span>
                <p className="text-xs text-nv-500 text-center">
                  {isBn ? "নিচের তালিকা থেকে বেছে নিন" : "Pick an icon below"}
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-h-32 overflow-y-auto p-1">
                  {["🫙", "🍿", "🥛", "🧻", "🍹", "🧼", "🧂", "🧴", "🌾", "🍪", "🧃", "🍫", "🍞", "☕", "🥚", "📦", "🍎", "💊"].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setImageEmoji(emoji)}
                      className={`text-xl p-1.5 rounded-lg border transition-fast ${imageEmoji === emoji ? "bg-em-100 border-em-500 scale-110" : "border-transparent hover:bg-nv-100"}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="lg:col-span-2 space-y-4">
              {/* Basic Info */}
              <div className="bg-white rounded-2xl border border-nv-200 p-5 shadow-sm space-y-4">
                <h3 className="font-semibold text-sm text-nv-800">{isBn ? "মূল বিবরণ" : "Basic Information"}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-nv-700 mb-1.5">
                      {isBn ? "পণ্যের নাম (ইংরেজি)" : "Product Name (English)"} *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Fresh Sunflower Oil 5L"
                      className="w-full border border-nv-200 rounded-xl px-3.5 py-2.5 text-sm focus:border-em-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-nv-700 mb-1.5">
                      {isBn ? "পণ্যের নাম (বাংলা)" : "Product Name (Bangla)"}
                    </label>
                    <input
                      type="text"
                      value={nameBn}
                      onChange={e => setNameBn(e.target.value)}
                      placeholder="যেমন: ফ্রেশ সানফ্লাওয়ার অয়েল"
                      className="w-full border border-nv-200 rounded-xl px-3.5 py-2.5 text-sm focus:border-em-500 font-bn"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-nv-700 mb-1.5">
                      {isBn ? "ব্র্যান্ড" : "Brand"}
                    </label>
                    <input
                      type="text"
                      value={brand}
                      onChange={e => setBrand(e.target.value)}
                      placeholder="e.g. Fresh, Pran, Unilever"
                      className="w-full border border-nv-200 rounded-xl px-3.5 py-2.5 text-sm focus:border-em-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-nv-700 mb-1.5">
                      {isBn ? "বিভাগ" : "Category"} *
                    </label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full border border-nv-200 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:border-em-500"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-nv-700 mb-1.5">
                      {isBn ? "একক" : "Unit"}
                    </label>
                    <select
                      value={unit}
                      onChange={e => setUnit(e.target.value)}
                      className="w-full border border-nv-200 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:border-em-500"
                    >
                      {units.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="bg-white rounded-2xl border border-nv-200 p-5 shadow-sm space-y-4">
                <h3 className="font-semibold text-sm text-nv-800">{isBn ? "মূল্য ও স্টক" : "Pricing & Stock"}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-nv-700 mb-1.5">
                      {isBn ? "ক্রয় মূল্য (৳)" : "Purchase Price (৳)"}
                    </label>
                    <input
                      type="number"
                      value={buyPrice}
                      onChange={e => setBuyPrice(e.target.value ? Number(e.target.value) : "")}
                      placeholder="0"
                      className="num w-full border border-nv-200 rounded-xl px-3.5 py-2.5 text-sm focus:border-em-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-nv-700 mb-1.5">
                      {isBn ? "বিক্রয় মূল্য (৳)" : "Selling Price (৳)"} *
                    </label>
                    <input
                      type="number"
                      required
                      value={sellPrice}
                      onChange={e => setSellPrice(e.target.value ? Number(e.target.value) : "")}
                      placeholder="0"
                      className="num w-full border border-nv-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-em-700 focus:border-em-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-nv-700 mb-1.5">
                      {isBn ? "প্রারম্ভিক স্টক" : "Opening Stock"} *
                    </label>
                    <input
                      type="number"
                      required
                      value={stock}
                      onChange={e => setStock(e.target.value ? Number(e.target.value) : "")}
                      placeholder="0"
                      className="num w-full border border-nv-200 rounded-xl px-3.5 py-2.5 text-sm focus:border-em-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-nv-700 mb-1.5">
                      {isBn ? "সর্বনিম্ন স্টক সতর্কতা" : "Low Stock Alert Limit"}
                    </label>
                    <input
                      type="number"
                      value={minStock}
                      onChange={e => setMinStock(e.target.value ? Number(e.target.value) : "")}
                      placeholder="10"
                      className="num w-full border border-nv-200 rounded-xl px-3.5 py-2.5 text-sm focus:border-em-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setScreen("products")}
                  className="flex-1 py-3 border border-nv-200 rounded-xl text-sm font-semibold text-nv-700 hover:bg-nv-100 transition-fast"
                >
                  {isBn ? "বাতিল" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-em-700 hover:bg-em-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-em-900/20 transition-fast"
                >
                  {isBn ? "পণ্য সংরক্ষণ করুন" : "Save Product"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // Filtered Products
  const filtered = products.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.nameBn.includes(search) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    const matchCategory = filterCategory === "all" || p.category === filterCategory;
    return matchSearch && matchStatus && matchCategory;
  });

  const stats = {
    total: products.length,
    inStock: products.filter(p => p.status === "in-stock").length,
    lowStock: products.filter(p => p.status === "low-stock").length,
    outOfStock: products.filter(p => p.status === "out-of-stock").length,
    totalValuation: products.reduce((sum, p) => sum + p.sellPrice * p.stock, 0),
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-nv-900">{isBn ? "পণ্য তালিকা" : "Products"}</h1>
          <p className="text-nv-500 text-xs sm:text-sm mt-0.5">
            {stats.total} {isBn ? "টি পণ্য ক্যাটালগে আছে" : "products in catalog"} · {isBn ? "মোট স্টক মূল্য: " : "Valuation: "}
            <span className="num font-bold text-em-700">৳{stats.totalValuation.toLocaleString()}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-nv-200 rounded-xl text-xs sm:text-sm font-semibold text-nv-700 bg-white hover:bg-nv-50 transition-fast shadow-2xs"
          >
            <Download size={14} /> {isBn ? "এক্সপোর্ট" : "Export CSV"}
          </button>
          <button
            onClick={() => setScreen("addproduct")}
            className="flex items-center gap-1.5 px-4 py-2 bg-em-700 hover:bg-em-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-fast shadow-md shadow-em-900/20"
          >
            <Plus size={16} /> {isBn ? "নতুন পণ্য" : "Add Product"}
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Products", labelBn: "মোট পণ্য", value: stats.total, icon: Package, color: "text-nv-700", bg: "bg-nv-100" },
          { label: "In Stock", labelBn: "স্টকে আছে", value: stats.inStock, icon: CheckCircle, color: "text-em-700", bg: "bg-em-50" },
          { label: "Low Stock", labelBn: "কম স্টক", value: stats.lowStock, icon: AlertTriangle, color: "text-amber-700", bg: "bg-amber-50" },
          { label: "Out of Stock", labelBn: "স্টক নেই", value: stats.outOfStock, icon: X, color: "text-red-600", bg: "bg-red-50" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border border-nv-200 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
              <s.icon size={18} className={s.color} />
            </div>
            <div>
              <div className="num text-lg sm:text-xl font-bold text-nv-900">{s.value}</div>
              <div className="text-[11px] text-nv-500">{isBn ? s.labelBn : s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter and View Mode Switcher */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-nv-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            type="text"
            placeholder={isBn ? "নাম বা SKU দিয়ে খুঁজুন..." : "Search by name or SKU..."}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-nv-200 rounded-xl focus:border-em-500"
          />
        </div>

        {/* Status Filters & View switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All", labelBn: "সব" },
            { id: "in-stock", label: "In Stock", labelBn: "স্টকে" },
            { id: "low-stock", label: "Low Stock", labelBn: "কম স্টক" },
            { id: "out-of-stock", label: "Out of Stock", labelBn: "নেই" },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-fast flex-shrink-0
                ${filterStatus === f.id ? "bg-em-700 text-white shadow-2xs" : "bg-white border border-nv-200 text-nv-600 hover:border-nv-300"}`}
            >
              {isBn ? f.labelBn : f.label}
            </button>
          ))}

          {/* Toggle View Mode (Table / Grid) */}
          <div className="flex items-center bg-white border border-nv-200 rounded-xl p-0.5 ml-auto">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-fast ${viewMode === "table" ? "bg-nv-100 text-nv-900" : "text-nv-400 hover:text-nv-700"}`}
              title="Table View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-fast ${viewMode === "grid" ? "bg-nv-100 text-nv-900" : "text-nv-400 hover:text-nv-700"}`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Mode */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filtered.map(p => (
            <div
              key={p.id}
              className="bg-white rounded-2xl p-4 border border-nv-200 shadow-sm flex flex-col justify-between hover:border-em-400 transition-fast"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-3xl">{p.image || "📦"}</span>
                  {statusBadge(p.status, isBn)}
                </div>
                <h4 className="font-bold text-sm text-nv-900 line-clamp-2">{isBn ? p.nameBn : p.name}</h4>
                <p className="text-xs text-nv-400 font-mono mt-0.5">{p.sku} · {p.category}</p>
              </div>

              <div className="mt-3 pt-3 border-t border-nv-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-nv-400 block">{isBn ? "বিক্রয় মূল্য" : "Price"}</span>
                  <span className="num font-bold text-em-700 text-sm">৳{p.sellPrice}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingProduct(p)}
                    className="p-1.5 rounded-lg bg-nv-100 hover:bg-em-100 text-nv-600 hover:text-em-800"
                    title="Edit"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(p.id)}
                    className="p-1.5 rounded-lg bg-nv-100 hover:bg-red-100 text-nv-600 hover:text-red-700"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table Mode (Responsive horizontal scrolling) */
        <div className="bg-white rounded-2xl shadow-sm border border-nv-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-nv-50 border-b border-nv-200">
                  <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "পণ্য" : "Product"}</th>
                  <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">SKU</th>
                  <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "বিভাগ" : "Category"}</th>
                  <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "ক্রয় মূল্য" : "Buy Price"}</th>
                  <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "বিক্রয় মূল্য" : "Sell Price"}</th>
                  <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "স্টক" : "Stock"}</th>
                  <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "স্টক মূল্য" : "Total Value"}</th>
                  <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "অবস্থা" : "Status"}</th>
                  <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap text-right">{isBn ? "অ্যাকশন" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nv-100">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-nv-50 transition-fast">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl flex-shrink-0">{p.image || "📦"}</span>
                        <div>
                          <div className="font-bold text-nv-900 text-xs sm:text-sm">{isBn ? p.nameBn : p.name}</div>
                          {p.brand && <div className="text-[10px] text-nv-400">{p.brand}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-nv-500">{p.sku}</td>
                    <td className="px-4 py-3 text-xs text-nv-600">{p.category}</td>
                    <td className="px-4 py-3 num text-nv-600">৳{p.buyPrice}</td>
                    <td className="px-4 py-3 num font-bold text-em-700">৳{p.sellPrice}</td>
                    <td className="px-4 py-3">
                      <span className={`num font-bold ${p.stock <= 0 ? "text-red-600" : p.stock <= p.min ? "text-amber-700" : "text-nv-800"}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 num font-semibold text-nv-700">৳{(p.sellPrice * p.stock).toLocaleString()}</td>
                    <td className="px-4 py-3">{statusBadge(p.status, isBn)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setShowBarcodePrintModal(p)}
                          className="p-1.5 rounded-lg bg-nv-100 hover:bg-nv-200 text-nv-600 transition-fast"
                          title="Barcode"
                        >
                          <Barcode size={14} />
                        </button>
                        <button
                          onClick={() => setEditingProduct(p)}
                          className="p-1.5 rounded-lg bg-nv-100 hover:bg-em-100 text-nv-600 hover:text-em-800 transition-fast"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(p.id)}
                          className="p-1.5 rounded-lg bg-nv-100 hover:bg-red-100 text-nv-600 hover:text-red-700 transition-fast"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-nv-50 border-t border-nv-200 text-xs text-nv-500 flex items-center justify-between">
            <span>{isBn ? `মোট ${filtered.length}টি পণ্য প্রদর্শিত` : `Showing ${filtered.length} products`}</span>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-nv-200 p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-nv-100">
              <h3 className="font-bold text-nv-900 text-base">{isBn ? "পণ্য সম্পাদন করুন" : "Edit Product"}</h3>
              <button onClick={() => setEditingProduct(null)} className="text-nv-400 hover:text-nv-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateProductSubmit} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-nv-700 mb-1">{isBn ? "নাম" : "Product Name"} *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-nv-700 mb-1">{isBn ? "ক্রয় মূল্য" : "Buy Price"} (৳)</label>
                  <input
                    type="number"
                    value={editingProduct.buyPrice}
                    onChange={e => setEditingProduct({ ...editingProduct, buyPrice: Number(e.target.value) })}
                    className="w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-nv-700 mb-1">{isBn ? "বিক্রয় মূল্য" : "Sell Price"} (৳) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.sellPrice}
                    onChange={e => setEditingProduct({ ...editingProduct, sellPrice: Number(e.target.value) })}
                    className="w-full border border-nv-200 rounded-xl px-3 py-2 font-bold text-em-700 focus:border-em-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-nv-700 mb-1">{isBn ? "বর্তমান স্টক" : "Current Stock"}</label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={e => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-nv-700 mb-1">{isBn ? "সর্বনিম্ন স্টক" : "Min Alert Stock"}</label>
                  <input
                    type="number"
                    value={editingProduct.min}
                    onChange={e => setEditingProduct({ ...editingProduct, min: Number(e.target.value) })}
                    className="w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-nv-100">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-2.5 border border-nv-200 rounded-xl font-semibold text-nv-700 hover:bg-nv-50"
                >
                  {isBn ? "বাতিল" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-em-700 hover:bg-em-800 text-white rounded-xl font-bold shadow-md"
                >
                  {isBn ? "পরিবর্তন সংরক্ষণ" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-nv-200 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="font-bold text-base text-nv-900">{isBn ? "পণ্যটি মুছে ফেলতে চান?" : "Delete Product?"}</h3>
              <p className="text-xs text-nv-500 mt-1">
                {isBn ? "এটি ক্যাটালগ থেকে সম্পূর্ণ অপসারণ করা হবে।" : "This item will be permanently removed from your catalog."}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 border border-nv-200 rounded-xl font-semibold text-nv-700 hover:bg-nv-50"
              >
                {isBn ? "না" : "Cancel"}
              </button>
              <button
                onClick={() => {
                  deleteProduct(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
              >
                {isBn ? "মুছে ফেলুন" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Print Preview Modal */}
      {showBarcodePrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-nv-200 p-6 space-y-4 text-center">
            <div className="flex items-center justify-between pb-2 border-b border-nv-100">
              <h3 className="font-bold text-nv-900 text-base">{isBn ? "বারকোড প্রিন্ট" : "Barcode Label"}</h3>
              <button onClick={() => setShowBarcodePrintModal(null)} className="text-nv-400 hover:text-nv-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 bg-nv-50 border border-nv-200 rounded-xl space-y-2">
              <div className="font-bold text-xs text-nv-800">{showBarcodePrintModal.name}</div>
              <div className="py-2 flex flex-col items-center">
                <Barcode size={80} className="text-nv-900" />
                <span className="font-mono text-xs tracking-widest text-nv-700">{showBarcodePrintModal.barcode || showBarcodePrintModal.sku}</span>
              </div>
              <div className="num font-bold text-em-700 text-sm">৳{showBarcodePrintModal.sellPrice}</div>
            </div>

            <button
              onClick={() => {
                toast({ type: "success", title: "Barcode Sent to Label Printer" });
                setShowBarcodePrintModal(null);
              }}
              className="w-full py-2.5 bg-nv-900 text-white rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <Printer size={16} />
              <span>{isBn ? "প্রিন্ট করুন" : "Print Label"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
