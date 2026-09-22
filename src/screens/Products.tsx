import { useState } from "react";
import { Search, Plus, Filter, Download, MoreVertical, Edit2, Trash2, CheckCircle, AlertTriangle, X, Barcode, Grid, List, ArrowLeft, Sparkles, ChevronRight, Upload } from "lucide-react";
import { useApp, Product } from "../context/AppContext";
import { toast } from "../components/Toast";
import AIProductScannerModal from "../components/AIProductScannerModal";
import ProductThumb from "../components/ProductThumb";

interface ProductsProps {
  lang: "en" | "bn";
  showAdd?: boolean;
  setScreen?: (s: string) => void;
  onBack?: () => void;
}

const statusBadge = (status: Product["status"], isBn: boolean) => {
  const map = {
    "in-stock": { label: "In Stock", labelBn: "Akorae Wɔ Hɔ", cls: "bg-em-50 text-ink border border-em-200" },
    "low-stock": { label: "Low Stock", labelBn: "Akorae Aka Kakra", cls: "bg-ac-50 text-ink border border-ac-200" },
    "out-of-stock": { label: "Out of Stock", labelBn: "Akorae Asa", cls: "bg-red-50 text-ink border border-red-200" },
  };
  const m = map[status] || map["in-stock"];
  return (
    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${m.cls}`}>
      {isBn ? m.labelBn : m.label}
    </span>
  );
};

export default function Products({ lang, showAdd = false, setScreen, onBack }: ProductsProps) {
  const { products, addProduct, updateProduct, deleteProduct, tNum, formatTaka } = useApp();
  const isBn = lang === "bn";

  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modals
  const [showAddModal, setShowAddModal] = useState(showAdd);
  const [showAIScanner, setShowAIScanner] = useState(false);
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
    link.setAttribute("download", `SAYHPro_Products_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      type: "success",
      title: isBn ? "Nnoɔma Export Awie!" : "Products Exported!",
      message: `${products.length} products saved to CSV.`,
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        {onBack ? (
          <button
            onClick={onBack}
            aria-label={isBn ? "San Kɔ Akyi" : "Go back"}
            className="lg:hidden flex-shrink-0 w-9 h-9 rounded-full bg-nv-100 flex items-center justify-center text-ink active:bg-nv-200"
          >
            <ArrowLeft size={18} />
          </button>
        ) : <div />}

        <div className="ml-auto flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 border border-nv-200 rounded-xl text-xs sm:text-sm font-semibold text-ink bg-white hover:bg-nv-50 transition-fast shrink-0"
          >
            <Download size={15} />
            <span>{isBn ? "Export" : "Export CSV"}</span>
          </button>

          {/* Unified Add Product Button with Integrated AI Camera Scan */}
          <div className="inline-flex items-stretch rounded-xl bg-em-700 hover:bg-em-800 text-white shadow-md transition-fast overflow-hidden shrink-0">
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold hover:bg-em-800 transition-fast cursor-pointer whitespace-nowrap"
            >
              <Plus size={16} />
              <span>{isBn ? "Otɔfo Foforɔ Fa Nnoɔma Ka Ho" : "Add Product"}</span>
            </button>
            <button
              onClick={() => setShowAIScanner(true)}
              className="px-2.5 py-2 bg-em-800/90 hover:bg-em-900 border-l border-white/20 transition-fast cursor-pointer flex items-center gap-1 text-amber-300"
              title={isBn ? "AI Mfonyin Nhwehwɛmu" : "AI Camera Scan"}
            >
              <Sparkles size={15} className="animate-pulse" />
              <span className="text-xs font-bold hidden sm:inline">{isBn ? "Scan" : "Scan"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Products", labelBn: "Nyinaa Nnoɔma", value: tNum(products.length) },
          { label: "In Stock Items", labelBn: "Akorae Wɔ Hɔ", value: tNum(products.filter(p => p.status === "in-stock").length) },
          { label: "Low Stock Items", labelBn: "Akorae Aka Kakra", value: tNum(products.filter(p => p.status === "low-stock").length) },
          { label: "Out of Stock", labelBn: "Akorae Asa", value: tNum(products.filter(p => p.status === "out-of-stock").length) },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-nv-200">
            <div className="text-xs text-ink/70 font-medium mb-1">{isBn ? s.labelBn : s.label}</div>
            <div className="num text-lg sm:text-xl font-bold text-ink">{s.value}</div>
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
              placeholder={isBn ? "Hwehwɛ nnoɔma din anaa SKU..." : "Search by product name or SKU..."}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-nv-50 border border-nv-200 rounded-xl focus:border-em-500 transition-fast"
            />
          </div>

          <select
            value={selectedCat}
            onChange={e => setSelectedCat(e.target.value)}
            className="text-xs font-semibold text-ink bg-nv-50 border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === "All" && isBn ? "Nkyekyɛmu Nyinaa" : c}</option>
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
                  <th className="px-4 py-3 font-bold text-ink whitespace-nowrap">{isBn ? "Nnoɔma" : "Product"}</th>
                  <th className="px-4 py-3 font-bold text-ink whitespace-nowrap">{isBn ? "Nkyekyɛmu" : "Category"}</th>
                  <th className="px-4 py-3 font-bold text-ink whitespace-nowrap">{isBn ? "Boɔ a Wɔtɔn" : "Sell Price"}</th>
                  <th className="px-4 py-3 font-bold text-ink whitespace-nowrap">{isBn ? "Nnoɔma a Wɔatɔ Ka" : "Cost"}</th>
                  <th className="px-4 py-3 font-bold text-ink whitespace-nowrap">{isBn ? "Akorae" : "Stock"}</th>
                  <th className="px-4 py-3 font-bold text-ink whitespace-nowrap">{isBn ? "Gyinabea" : "Status"}</th>
                  <th className="px-4 py-3 font-bold text-ink whitespace-nowrap text-right">{isBn ? "Nneyɛeɛ" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nv-100">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-nv-50 transition-fast group">
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
                      {isBn ? "Nnoɔma a wopɛ no biara nni hɔ" : "No matching products found"}
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
                  <ProductThumb
                    src={p.image}
                    alt={p.name}
                    className="w-14 h-14 rounded-2xl object-contain bg-nv-50 p-1 border border-nv-200/70 flex-shrink-0"
                    sizeClass="text-3xl"
                  />
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
                {editingProduct ? (isBn ? "Sesa Nnoɔma Ho Nsɛm" : "Edit Product") : (isBn ? "Otɔfo Foforɔ Fa Nnoɔma Ka Ho" : "Add New Product")}
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

            {/* AI Camera Quick Fill Banner */}
            {!editingProduct && (
              <div
                onClick={() => {
                  setShowAddModal(false);
                  setShowAIScanner(true);
                }}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-em-50 via-emerald-50/70 to-amber-50/40 border border-em-200 hover:border-em-500 hover:shadow-xs transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-em-600 to-emerald-700 text-white flex items-center justify-center shadow-xs flex-shrink-0">
                    <Sparkles size={17} className="text-amber-300 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-ink group-hover:text-em-800 flex items-center gap-1.5">
                      <span>{isBn ? "Fa AI Mfonyintwafoɔ Scan Nnoɔma" : "Scan Product with AI Camera"}</span>
                      <span className="text-[10px] bg-em-100 text-em-800 font-extrabold px-1.5 py-0.5 rounded-full">AI Smart</span>
                    </div>
                    <div className="text-[11px] text-ink/65 mt-0.5">
                      {isBn ? "Hunu din, mu duru, kuw ne dwa boɔ ntɛm" : "Auto-detects name, weight, category & market price"}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-em-700 flex items-center gap-1 flex-shrink-0 bg-white px-2.5 py-1.5 rounded-xl border border-em-200 shadow-2xs group-hover:bg-em-600 group-hover:text-white transition-colors">
                  {isBn ? "Scan Seesei" : "Scan Now"} <ChevronRight size={13} />
                </span>
              </div>
            )}

            <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink mb-1">{isBn ? "Nnoɔma Din (EN)" : "Product Name (EN)"} *</label>
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
                  <label className="block font-semibold text-ink mb-1">{isBn ? "Nnoɔma Din (Twi (Akan))" : "Product Name (Twi / Akan)"}</label>
                  <input
                    type="text"
                    value={nameBn}
                    onChange={e => setNameBn(e.target.value)}
                    placeholder="e.g. Frytol Nku 5L / Ideal Milk"
                    className="w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500 font-bn"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">{isBn ? "Nkyekyɛmu" : "Category"}</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full border border-nv-200 rounded-xl px-3 py-2 bg-white focus:border-em-500"
                  >
                    <option value="Grocery">Grocery / Nnuane</option>
                    <option value="Snacks & Bakery">Snacks & Bakery</option>
                    <option value="Beverages">Beverages / Nsa & Anonneɛ</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Dairy & Eggs">Dairy & Eggs</option>
                    <option value="Household">Household</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1.5">{isBn ? "Mfonyin / Ahyɛnsodeɛ" : "Product Photo / Icon"}</label>
                  <div className="flex items-center gap-3 mb-2.5">
                    <ProductThumb
                      src={icon}
                      alt="Selected"
                      className="w-14 h-14 rounded-xl object-contain bg-nv-50 p-1 border-2 border-em-500 shadow-xs flex-shrink-0"
                      sizeClass="text-2xl"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-ink truncate mb-1">
                        {icon?.startsWith("/") || icon?.startsWith("http") || icon?.startsWith("data:") ? icon : "Emoji Icon Selected"}
                      </div>
                      <label className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-em-700 bg-em-50 border border-em-200 rounded-lg hover:bg-em-100 cursor-pointer transition-fast">
                        <Upload size={13} />
                        <span>{isBn ? "Fa Mfonyin Gu So" : "Upload Photo"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = ev => {
                                if (ev.target?.result) {
                                  setIcon(ev.target.result as string);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Preset Store Photos */}
                  <div className="text-[11px] font-semibold text-ink/70 mb-1">{isBn ? "Mfonyin a Wɔasiesie" : "Preset Store Photos"}</div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1.5 mb-2.5 no-scrollbar">
                    {[
                      { path: "/products/potato.png", label: "Potato" },
                      { path: "/products/sunflower-oil.jpg", label: "Oil" },
                      { path: "/products/chanachur.jpg", label: "Indomie" },
                      { path: "/products/milk.jpg", label: "Milk" },
                      { path: "/products/tissue-box.jpg", label: "Tissue" },
                      { path: "/products/frooto.jpg", label: "Milo" },
                      { path: "/products/soap.jpg", label: "Soap" },
                      { path: "/products/salt.jpg", label: "Salt" },
                      { path: "/products/biscuit.jpg", label: "Choc" },
                      { path: "/products/juice.jpg", label: "Juice" },
                      { path: "/products/dove-soap.jpg", label: "Dove" },
                    ].map(img => (
                      <button
                        type="button"
                        key={img.path}
                        onClick={() => setIcon(img.path)}
                        className={`p-1 rounded-xl border flex-shrink-0 transition-fast ${icon === img.path ? "border-em-500 bg-em-50 shadow-xs ring-2 ring-em-500/20" : "border-nv-200 hover:border-nv-300 bg-white"}`}
                        title={img.label}
                      >
                        <img src={img.path} alt={img.label} className="w-8 h-8 rounded-lg object-contain bg-nv-50" />
                      </button>
                    ))}
                  </div>

                  {/* Or Emoji Icons */}
                  <div className="text-[11px] font-semibold text-ink/70 mb-1">{isBn ? "Anaasɛ Emoji" : "Or Emoji Icons"}</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {["📦", "🌾", "🛢️", "🍪", "🥤", "🧼", "🧴", "🥫"].map(emo => (
                      <button
                        type="button"
                        key={emo}
                        onClick={() => setIcon(emo)}
                        className={`p-1.5 rounded-lg border text-base ${icon === emo ? "border-em-500 bg-em-50 ring-2 ring-em-500/20" : "border-nv-200 hover:border-nv-300 bg-white"}`}
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">{isBn ? "Tɔ Boɔ (₵)" : "Buy Price (Cost)"} *</label>
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
                  <label className="block font-semibold text-ink mb-1">{isBn ? "Tɔn Boɔ (₵)" : "Selling Price (₵)"} *</label>
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
                  <label className="block font-semibold text-ink mb-1">{isBn ? "Akorae Dodoɔ a Ɛwɔ Hɔ" : "Current Stock Quantity"} *</label>
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
                  <label className="block font-semibold text-ink mb-1">{isBn ? "Akorae Fom Kɔkɔbɔ Hyeɛ" : "Low Stock Alert Limit"}</label>
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
                  {isBn ? "Gyae (Cancel)" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-em-700 hover:bg-em-800 text-white rounded-xl font-bold shadow-md"
                >
                  {editingProduct ? (isBn ? "Sesa Nnoɔma Nsɛm" : "Update Product") : (isBn ? "Kora Nnoɔma No So" : "Save Product")}
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
              <h3 className="font-bold text-ink text-sm">{isBn ? "Barcode Ahyɛnsodeɛ" : "Barcode Label"}</h3>
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
              {isBn ? "Tintim Ahyɛnsodeɛ" : "Print Label"}
            </button>
          </div>
        </div>
      )}

      {/* AI Product Scanner Modal */}
      <AIProductScannerModal
        isOpen={showAIScanner}
        onClose={() => setShowAIScanner(false)}
        lang={lang}
        mode="add-product"
      />
    </div>
  );
}
