import { useState } from "react";
import { Search, Plus, Filter, Download, MoreVertical, Edit2, Trash2, CheckCircle, AlertTriangle, X, Package, Barcode, Grid, List } from "lucide-react";
import { useApp, Product } from "../context/AppContext";
import { toast } from "../components/Toast";

interface ProductsProps {
  lang: "en" | "bn";
  showAdd?: boolean;
  setScreen?: (s: string) => void;
}

const statusBadge = (status: Product["status"], isBn: boolean) => {
  const map = {
    "in-stock": { label: "In Stock", labelBn: "পর্যাপ্ত স্টক", cls: "bg-em-50 text-ink border border-em-200" },
    "low-stock": { label: "Low Stock", labelBn: "কম স্টক", cls: "bg-ac-50 text-ink border border-ac-200" },
    "out-of-stock": { label: "Out of Stock", labelBn: "স্টক শেষ", cls: "bg-red-50 text-ink border border-red-200" },
  };
  const m = map[status] || map["in-stock"];
  return (
    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${m.cls}`}>
      {isBn ? m.labelBn : m.label}
    </span>
  );
};

export default function Products({ lang, showAdd = false, setScreen }: ProductsProps) {
  const { products, addProduct, updateProduct, deleteProduct, tNum, formatTaka } = useApp();
  const isBn = lang === "bn";

  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modals
  const [showAddModal, setShowAddModal] = useState(showAdd);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [barcodePreviewProduct, setBarcodePreviewProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [nameBn, setNameBn] = useState("");
  const [category, setCategory] = useState("Grocery");
  const [buyPrice, setBuyPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [stock, setStock] = useState("");
  const [minStock, setMinStock] = useState("10");
  const [unit, setUnit] = useState("pcs");
  const [brand, setBrand] = useState("");
  const [icon, setIcon] = useState("📦");

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  const filtered = products.filter(p => {
    const matchCat = selectedCat === "All" || p.category === selectedCat;
    const matchStatus = selectedStatus === "All" || p.status === selectedStatus;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.nameBn.includes(search) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchStatus && matchSearch;
  });

  const totalValuation = products.reduce((s, p) => s + p.sellPrice * p.stock, 0);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sellPrice) return;

    addProduct({
      name,
      nameBn: nameBn || name,
      sku: `PRD-${Date.now().toString().slice(-4)}`,
      category,
      buyPrice: Number(buyPrice) || 0,
      sellPrice: Number(sellPrice),
      stock: Number(stock) || 0,
      min: Number(minStock) || 5,
      unit,
      brand,
      image: icon,
    });

    setShowAddModal(false);
    resetForm();
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    updateProduct(editingProduct.id, {
      name,
      nameBn: nameBn || name,
      category,
      buyPrice: Number(buyPrice) || 0,
      sellPrice: Number(sellPrice),
      stock: Number(stock) || 0,
      min: Number(minStock) || 5,
      unit,
      brand,
      image: icon,
    });

    setEditingProduct(null);
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setNameBn("");
    setCategory("Grocery");
    setBuyPrice("");
    setSellPrice("");
    setStock("");
    setMinStock("10");
    setUnit("pcs");
    setBrand("");
    setIcon("📦");
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setNameBn(p.nameBn);
    setCategory(p.category);
    setBuyPrice(p.buyPrice.toString());
    setSellPrice(p.sellPrice.toString());
    setStock(p.stock.toString());
    setMinStock(p.min.toString());
    setUnit(p.unit);
    setBrand(p.brand || "");
    setIcon(p.image || "📦");
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
    link.setAttribute("download", `DukanPro_Products_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      type: "success",
      title: isBn ? "পণ্য এক্সপোর্ট সম্পন্ন!" : "Products Exported!",
      message: `${products.length} products saved to CSV.`,
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">{isBn ? "পণ্য ও ক্যাটালগ" : "Products"}</h1>
          <p className="text-ink text-xs sm:text-sm mt-0.5">
            {tNum(products.length)} {isBn ? "টি পণ্য তালিকাভুক্ত · মোট স্টক মূল্য: " : "products registered · Total Stock Value: "}
            <span className="num font-bold text-ink">{formatTaka(totalValuation)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 border border-nv-200 rounded-xl text-xs sm:text-sm font-semibold text-ink bg-white hover:bg-nv-50 transition-fast"
          >
            <Download size={15} />
            <span>{isBn ? "এক্সপোর্ট" : "Export CSV"}</span>
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-em-700 hover:bg-em-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-fast"
          >
            <Plus size={16} />
            <span>{isBn ? "নতুন পণ্য যোগ করুন" : "Add Product"}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Products", labelBn: "মোট পণ্য", value: tNum(products.length), icon: Package, color: "bg-nv-100 text-ink" },
          { label: "In Stock Items", labelBn: "পর্যাপ্ত স্টক", value: tNum(products.filter(p => p.status === "in-stock").length), icon: CheckCircle, color: "bg-em-50 text-ink" },
          { label: "Low Stock Items", labelBn: "কম স্টক", value: tNum(products.filter(p => p.status === "low-stock").length), icon: AlertTriangle, color: "bg-ac-50 text-ink" },
          { label: "Out of Stock", labelBn: "স্টক শূন্য", value: tNum(products.filter(p => p.status === "out-of-stock").length), icon: X, color: "bg-red-50 text-ink" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-nv-200 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
              <s.icon size={18} />
            </div>
            <div>
              <div className="num text-lg sm:text-xl font-bold text-ink">{s.value}</div>
              <div className="text-[11px] text-ink">{isBn ? s.labelBn : s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-nv-200 shadow-2xs">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={isBn ? "নাম বা SKU দিয়ে খুঁজুন..." : "Search by product name or SKU..."}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-nv-50 border border-nv-200 rounded-xl focus:border-em-500 transition-fast"
            />
          </div>

          <select
            value={selectedCat}
            onChange={e => setSelectedCat(e.target.value)}
            className="text-xs font-semibold text-ink bg-nv-50 border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === "All" && isBn ? "সকল ক্যাটাগরি" : c}</option>
            ))}
          </select>
        </div>

        {/* View Mode & Status Filter */}
        <div className="flex items-center gap-2">
          <div className="flex bg-nv-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-fast ${viewMode === "table" ? "bg-white shadow-xs text-ink" : "text-ink"}`}
              title="Table View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-fast ${viewMode === "grid" ? "bg-white shadow-xs text-ink" : "text-ink"}`}
              title="Grid View"
            >
              <Grid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Product List: Table or Grid */}
      {viewMode === "table" ? (
        <div className="bg-white rounded-2xl shadow-sm border border-nv-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-nv-50 border-b border-nv-200">
                  <th className="px-4 py-3 font-bold text-ink whitespace-nowrap">{isBn ? "পণ্য" : "Product"}</th>
                  <th className="px-4 py-3 font-bold text-ink whitespace-nowrap">{isBn ? "ক্যাটাগরি" : "Category"}</th>
                  <th className="px-4 py-3 font-bold text-ink whitespace-nowrap">{isBn ? "বিক্রয় মূল্য" : "Sell Price"}</th>
                  <th className="px-4 py-3 font-bold text-ink whitespace-nowrap">{isBn ? "ক্রয় খরচ" : "Cost"}</th>
                  <th className="px-4 py-3 font-bold text-ink whitespace-nowrap">{isBn ? "স্টক" : "Stock"}</th>
                  <th className="px-4 py-3 font-bold text-ink whitespace-nowrap">{isBn ? "অবস্থা" : "Status"}</th>
                  <th className="px-4 py-3 font-bold text-ink whitespace-nowrap text-right">{isBn ? "অ্যাকশন" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nv-100">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-nv-50 transition-fast group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl flex-shrink-0">{p.image || "📦"}</span>
                        <div>
                          <div className="font-bold text-ink">{isBn ? p.nameBn : p.name}</div>
                          <div className="text-[10px] text-ink font-mono">{p.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink whitespace-nowrap">{p.category}</td>
                    <td className="px-4 py-3 num font-bold text-ink whitespace-nowrap">{formatTaka(p.sellPrice)}</td>
                    <td className="px-4 py-3 num text-ink whitespace-nowrap">{formatTaka(p.buyPrice)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="num font-semibold text-ink">{tNum(p.stock)} {p.unit.split("/")[0]}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{statusBadge(p.status, isBn)}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setBarcodePreviewProduct(p)}
                          className="p-1.5 rounded-lg text-ink hover:text-ink hover:bg-em-50 transition-fast"
                          title="Barcode"
                        >
                          <Barcode size={15} />
                        </button>
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 rounded-lg text-ink hover:text-ink hover:bg-nv-50 transition-fast"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="p-1.5 rounded-lg text-ink hover:text-ink hover:bg-red-50 transition-fast"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-ink text-xs">
                      {isBn ? "কোনো পণ্য খুঁজে পাওয়া যায়নি" : "No matching products found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filtered.map(p => (
            <div
              key={p.id}
              className="bg-white rounded-2xl p-4 border border-nv-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-fast"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-3xl">{p.image || "📦"}</span>
                  {statusBadge(p.status, isBn)}
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-ink line-clamp-2">{isBn ? p.nameBn : p.name}</h4>
                <div className="text-[10px] text-ink font-mono mt-0.5">{p.sku} · {p.category}</div>
              </div>

              <div className="mt-3 pt-2 border-t border-nv-100 flex items-center justify-between">
                <div>
                  <div className="num font-bold text-sm text-ink">{formatTaka(p.sellPrice)}</div>
                  <div className="text-[10px] text-ink">Stock: {tNum(p.stock)}</div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(p)} className="p-1 text-ink hover:text-ink">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => deleteProduct(p.id)} className="p-1 text-ink hover:text-ink">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {(showAddModal || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-nv-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-nv-100">
              <h3 className="font-display font-bold text-ink text-lg">
                {editingProduct ? (isBn ? "পণ্য সম্পাদনা করুন" : "Edit Product") : (isBn ? "নতুন পণ্য যোগ করুন" : "Add New Product")}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProduct(null);
                }}
                className="text-ink hover:text-ink"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink mb-1">{isBn ? "পণ্যের নাম (ইংরেজি)" : "Product Name (EN)"} *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Fresh Soybean Oil 5L"
                    className="w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">{isBn ? "পণ্যের নাম (বাংলা)" : "Product Name (Bangla)"}</label>
                  <input
                    type="text"
                    value={nameBn}
                    onChange={e => setNameBn(e.target.value)}
                    placeholder="যেমন: ফ্রেশ সয়াবিন তেল ৫লি"
                    className="w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500 font-bn"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">{isBn ? "ক্যাটাগরি" : "Category"}</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full border border-nv-200 rounded-xl px-3 py-2 bg-white focus:border-em-500"
                  >
                    <option value="Grocery">Grocery / মুদি</option>
                    <option value="Snacks & Bakery">Snacks & Bakery</option>
                    <option value="Beverages">Beverages / পানীয়</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Dairy & Eggs">Dairy & Eggs</option>
                    <option value="Household">Household</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">{isBn ? "আইকন / ছবি" : "Emoji Icon"}</label>
                  <div className="flex gap-2">
                    {["📦", "🌾", "🛢️", "🍪", "🥤", "🧼", "🧴", "🥫"].map(emo => (
                      <button
                        type="button"
                        key={emo}
                        onClick={() => setIcon(emo)}
                        className={`p-1.5 rounded-lg border text-lg ${icon === emo ? "border-em-500 bg-em-50" : "border-nv-200"}`}
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">{isBn ? "ক্রয় মূল্য (৳)" : "Buy Price (Cost)"} *</label>
                  <input
                    type="number"
                    required
                    value={buyPrice}
                    onChange={e => setBuyPrice(e.target.value)}
                    placeholder="0"
                    className="num w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">{isBn ? "বিক্রয় মূল্য (৳)" : "Selling Price"} *</label>
                  <input
                    type="number"
                    required
                    value={sellPrice}
                    onChange={e => setSellPrice(e.target.value)}
                    placeholder="0"
                    className="num w-full border border-nv-200 rounded-xl px-3 py-2 font-bold text-ink focus:border-em-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">{isBn ? "বর্তমান স্টক" : "Current Stock Quantity"} *</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={e => setStock(e.target.value)}
                    placeholder="0"
                    className="num w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">{isBn ? "কম স্টক সতর্কবার্তা সীমা" : "Low Stock Alert Limit"}</label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={e => setMinStock(e.target.value)}
                    placeholder="5"
                    className="num w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-nv-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProduct(null);
                  }}
                  className="flex-1 py-2.5 border border-nv-200 rounded-xl font-semibold text-ink hover:bg-nv-50"
                >
                  {isBn ? "বাতিল" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-em-700 hover:bg-em-800 text-white rounded-xl font-bold shadow-md"
                >
                  {editingProduct ? (isBn ? "আপডেট করুন" : "Update Product") : (isBn ? "সংরক্ষণ করুন" : "Save Product")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode Label Preview Modal */}
      {barcodePreviewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-xs shadow-2xl border border-nv-200 p-5 text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-nv-100">
              <h3 className="font-bold text-ink text-sm">{isBn ? "বারকোড স্টিকার" : "Barcode Label"}</h3>
              <button onClick={() => setBarcodePreviewProduct(null)} className="text-ink hover:text-ink">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 bg-white border border-nv-300 rounded-xl shadow-2xs font-mono space-y-1">
              <div className="font-bold text-xs text-ink">{barcodePreviewProduct.name}</div>
              <div className="py-2">
                <div className="h-10 bg-black w-full flex items-center justify-around px-2">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className={`h-full ${i % 3 === 0 ? "w-1 bg-white" : "w-0.5 bg-white"}`} />
                  ))}
                </div>
              </div>
              <div className="text-[11px] font-bold">{barcodePreviewProduct.sku}</div>
              <div className="num text-base font-extrabold text-ink pt-1">{formatTaka(barcodePreviewProduct.sellPrice)}</div>
            </div>

            <button
              onClick={() => {
                window.print();
              }}
              className="w-full py-2 bg-nv-900 hover:bg-black text-white rounded-xl text-xs font-bold"
            >
              {isBn ? "বারকোড প্রিন্ট করুন" : "Print Label"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
