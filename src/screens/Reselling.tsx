import { useState } from "react";
import {
  Plus, Check, Star, Search, Store, ArrowLeft
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { toast } from "../components/Toast";

interface ResellingProps {
  lang: "en" | "bn";
  setScreen: (s: string) => void;
  onBack?: () => void;
}

export default function Reselling({ lang, setScreen, onBack }: ResellingProps) {
  const {
    resellProducts,
    toggleResellProduct,
    tNum,
    formatTaka
  } = useApp();

  const isBn = lang === "bn";
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filterMode, setFilterMode] = useState<"all" | "added">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "all", name: "All Categories", nameBn: "সকল ক্যাটাগরি" },
    { id: "Electronics", name: "Electronics", nameBn: "ইলেকট্রনিক্স" },
    { id: "Grocery", name: "Organic Grocery", nameBn: "মুদি ও অর্গানিক" },
    { id: "Fashion", name: "Fashion & Lifestyle", nameBn: "ফ্যাশন" },
  ];

  const filtered = resellProducts.filter(p => {
    const matchCat = selectedCategory === "all" ? true : p.category === selectedCategory;
    const matchMode = filterMode === "all" ? true : p.isAddedToStore;
    const matchSearch = searchQuery.trim()
      ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.nameBn.includes(searchQuery)
      : true;
    return matchCat && matchMode && matchSearch;
  });

  const totalAddedCount = resellProducts.filter(p => p.isAddedToStore).length;
  const totalEstimatedProfit = resellProducts
    .filter(p => p.isAddedToStore)
    .reduce((sum, p) => sum + (p.myProfit || 0), 0);

  return (
    <div className="p-4 sm:p-6 space-y-6 pb-28 lg:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        {onBack ? (
          <button
            onClick={onBack}
            aria-label={isBn ? "পেছনে যান" : "Go back"}
            className="lg:hidden flex-shrink-0 w-9 h-9 rounded-full bg-nv-100 flex items-center justify-center text-ink active:bg-nv-200"
          >
            <ArrowLeft size={18} />
          </button>
        ) : <div />}

        <button
          onClick={() => setFilterMode(filterMode === "all" ? "added" : "all")}
          className={`ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-fast shadow-xs
            ${filterMode === "added" ? "bg-em-700 text-white" : "bg-white border border-nv-200 text-ink hover:bg-nv-50"}`}
        >
          <Store size={16} />
          <span>{isBn ? "আমার রিসেল স্টোর (" : "My Resell Store ("}{tNum(totalAddedCount)})</span>
        </button>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-nv-200">
          <div className="text-xs text-ink/70 font-medium mb-1">{isBn ? "দোকানে সক্রিয় রিসেল পণ্য" : "Active In Store"}</div>
          <div className="text-xl sm:text-2xl font-extrabold text-ink">
            {tNum(totalAddedCount)} {isBn ? "টি পণ্য" : "Products"}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-nv-200">
          <div className="text-xs text-ink/70 font-medium mb-1">{isBn ? "সম্ভাব্য মুনাফা মার্জিন" : "Potential Resell Margin"}</div>
          <div className="text-xl sm:text-2xl font-extrabold text-ink">
            {formatTaka(totalEstimatedProfit)}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-nv-200">
          <div className="text-xs text-ink/70 font-medium mb-1">{isBn ? "সাপ্লায়ার সরাসরি ডেলিভারি" : "Direct Drop-Ship"}</div>
          <div className="text-xl sm:text-2xl font-extrabold text-ink">
            {tNum("100%")}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-nv-200">
          <div className="text-xs text-ink/70 font-medium mb-1">{isBn ? "যাচাইকৃত পাইকারি রেট" : "Wholesale Guarantee"}</div>
          <div className="text-xl sm:text-2xl font-extrabold text-ink">
            {tNum("35-45%")}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-nv-200">
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-fast
                ${selectedCategory === c.id ? "bg-nv-900 text-white" : "bg-nv-100 text-ink hover:bg-nv-200"}`}
            >
              {isBn ? c.nameBn : c.name}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3 top-2.5 text-ink" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isBn ? "রিসেল পণ্য খুঁজুন..." : "Search wholesale catalog..."}
            className="w-full pl-8 pr-3 py-1.5 border border-nv-200 rounded-xl text-xs focus:border-em-500"
          />
        </div>
      </div>

      {/* Reseller Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="bg-white rounded-3xl p-5 shadow-sm border border-nv-200 hover:border-nv-300 transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-2xs border border-nv-100">
                  {p.image}
                </div>
                <div className="flex flex-col items-end">
                  <span className="flex items-center gap-1 text-xs font-bold text-ink bg-ac-50 px-2 py-0.5 rounded-full">
                    <Star size={12} className="fill-amber-500" /> {tNum(p.rating)}
                  </span>
                  <span className="text-[10px] text-ink mt-1 font-mono">{tNum(p.stock)} in wholesale</span>
                </div>
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider text-ink bg-nv-50 px-2 py-0.5 rounded-full">
                {p.category}
              </span>
              <h3 className="font-bold text-sm sm:text-base text-ink mt-1.5">{isBn ? p.nameBn : p.name}</h3>
              <p className="text-xs text-ink mt-0.5">Supplier: {p.supplier}</p>

              <div className="mt-4 p-3 bg-nv-50 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink">{isBn ? "পাইকারি মূল্য (Wholesale):" : "Wholesale Price:"}</span>
                  <span className="font-bold text-ink">{formatTaka(p.wholesalePrice)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink">{isBn ? "প্রস্তাবিত বিক্রয় মূল্য:" : "Suggested Retail:"}</span>
                  <span className="font-bold text-ink">{formatTaka(p.suggestedRetailPrice)}</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-nv-200/60">
                  <span className="font-semibold text-ink">{isBn ? "আপনার নিশ্চিত লাভ:" : "Your Profit Margin:"}</span>
                  <span className="font-extrabold text-ink text-sm">+{formatTaka(p.suggestedRetailPrice - p.wholesalePrice)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => toggleResellProduct(p.id)}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-fast shadow-sm
                ${p.isAddedToStore ? "bg-em-700 text-white" : "bg-nv-600 hover:bg-nv-700 text-white"}`}
            >
              {p.isAddedToStore ? (
                <>
                  <Check size={15} />
                  <span>{isBn ? "দোকানে সক্রিয় (Added)" : "Added to My Store"}</span>
                </>
              ) : (
                <>
                  <Plus size={15} />
                  <span>{isBn ? "দোকানে যোগ করুন (+মুনাফা)" : "Add to My Store"}</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
