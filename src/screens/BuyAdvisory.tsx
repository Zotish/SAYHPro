import { useState } from "react";
import {
  Package, ArrowLeft, ArrowRight, X, AlertTriangle, CheckCircle,
  Clock, TrendingUp, Sparkles, Filter, ShoppingBag, BarChart2
} from "lucide-react";
import { useApp, Product } from "../context/AppContext";

interface BuyAdvisoryProps {
  lang: "en" | "bn";
  setScreen: (s: string) => void;
  onBack?: () => void;
}

export default function BuyAdvisory({ lang, setScreen, onBack }: BuyAdvisoryProps) {
  const { products, sales, tNum, formatTaka } = useApp();
  const isBn = lang === "bn";

  const [advisoryTab, setAdvisoryTab] = useState<"urgent" | "soon" | "all">("urgent");

  // Calculate stock velocity and replenishment advisory
  const buyAdvisoryItems = products.map(p => {
    const soldQty = sales.reduce((acc, s) => {
      const item = s.items.find(i => i.name === p.name);
      return acc + (item ? item.qty : 0);
    }, 0) || (p.stock > 0 ? 10 : 25);

    const weeklyRate = Math.max(1, Math.round(soldQty / 4));
    const daysOfStockLeft = weeklyRate > 0 ? Math.round((p.stock / weeklyRate) * 7) : 999;

    let tier: "urgent" | "soon" | "safe" | "slow" = "safe";
    if (p.stock === 0 || p.stock <= p.min) {
      tier = "urgent";
    } else if (p.stock <= p.min * 1.6 || daysOfStockLeft <= 7) {
      tier = "soon";
    } else if (daysOfStockLeft <= 45) {
      tier = "safe";
    } else {
      tier = "slow";
    }

    const suggestedBuyQty =
      tier === "urgent"
        ? Math.max(20, p.min * 2 - p.stock)
        : tier === "soon"
        ? Math.max(12, Math.round(p.min * 1.5 - p.stock))
        : 0;

    const estimatedBudget = suggestedBuyQty * (p.buyPrice || 0);

    return { product: p, tier, weeklyRate, daysOfStockLeft, suggestedBuyQty, estimatedBudget };
  });

  const urgentAdvisory = buyAdvisoryItems.filter(i => i.tier === "urgent");
  const soonAdvisory = buyAdvisoryItems.filter(i => i.tier === "soon");

  const displayedList =
    advisoryTab === "urgent"
      ? urgentAdvisory
      : advisoryTab === "soon"
      ? soonAdvisory
      : buyAdvisoryItems.filter(i => i.tier === "urgent" || i.tier === "soon");

  const handleBack = () => {
    if (onBack) onBack();
    else setScreen("dashboard");
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4 pb-28 lg:pb-10 select-none">
      {/* Page Header: only left and right icon buttons */}
      <div className="flex items-center justify-between bg-white p-2.5 sm:p-3 rounded-2xl border border-nv-200 shadow-xs">
        <button
          onClick={handleBack}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-nv-100 hover:bg-nv-200 active:bg-nv-300 flex items-center justify-center text-ink transition-colors flex-shrink-0 cursor-pointer"
          title={isBn ? "San Kɔ Akyi" : "Go Back"}
          aria-label={isBn ? "San Kɔ Akyi" : "Go Back"}
        >
          <ArrowLeft size={20} />
        </button>

        <button
          onClick={handleBack}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-nv-100 hover:bg-nv-200 active:bg-nv-300 flex items-center justify-center text-ink transition-colors flex-shrink-0 cursor-pointer"
          title={isBn ? "To Mu" : "Close"}
          aria-label={isBn ? "To Mu" : "Close"}
        >
          <X size={19} />
        </button>
      </div>

      {/* Main Advisory Container Card */}
      <div className="bg-white rounded-2xl border border-nv-200 p-4 sm:p-5 space-y-4 shadow-xs">
        {/* Banner Section with What to Buy Next + Analytics link */}
        <div className="bg-gradient-to-r from-em-50/90 via-white to-em-50/50 p-3.5 sm:p-4 rounded-2xl border border-em-200/90 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-em-100 border border-em-200 text-em-800 flex items-center justify-center flex-shrink-0">
              <Package size={20} />
            </div>
            <div>
              <h2 className="font-display text-sm sm:text-base font-bold text-ink">
                {isBn ? "Deɛ Ɛsɛ Sɛ Wotɔ (Advisory)" : "What to Buy Next (Advisory)"}
              </h2>
            </div>
          </div>
        </div>

        {/* Color Tiers Mini Strip Tabs */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setAdvisoryTab("urgent")}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              advisoryTab === "urgent"
                ? "border-em-600 bg-em-50 text-ink shadow-xs ring-1 ring-em-500"
                : "border-nv-200 bg-white text-ink hover:bg-em-50/40 hover:border-em-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-ink">
                {isBn ? "Tɔ Ntɛmntɛm (Urgent)" : "Urgent Buy"}
              </span>
              <span className="num text-xs sm:text-sm font-bold text-ink">
                {tNum(urgentAdvisory.length)}
              </span>
            </div>
            <div className="text-[11px] text-ink/70 mt-1 truncate">
              {isBn ? "Akorae asa / Atɔfoɔ pɛ pa ara" : "Out of stock / high demand"}
            </div>
          </button>

          <button
            onClick={() => setAdvisoryTab("soon")}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              advisoryTab === "soon"
                ? "border-em-600 bg-em-50 text-ink shadow-xs ring-1 ring-em-500"
                : "border-nv-200 bg-white text-ink hover:bg-em-50/40 hover:border-em-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-ink">
                {isBn ? "Tɔ Bi Ntɛm" : "Buy Soon"}
              </span>
              <span className="num text-xs sm:text-sm font-bold text-ink">
                {tNum(soonAdvisory.length)}
              </span>
            </div>
            <div className="text-[11px] text-ink/70 mt-1 truncate">
              {isBn ? "Bɛsa wɔ nna 7 mu" : "Runs out within 7 days"}
            </div>
          </button>
        </div>

        {/* Product Cards List with Brand Color Background */}
        <div className="space-y-2.5">
          {displayedList.length === 0 ? (
            <div className="py-12 text-center text-ink/60 bg-em-50/30 rounded-xl border border-dashed border-em-200">
              <CheckCircle size={32} className="mx-auto text-em-600 mb-2" />
              <p className="font-semibold text-sm">
                {isBn ? "Nnoɔma biara nni ha seesei" : "No products in this tier right now"}
              </p>
              <p className="text-xs text-ink/50 mt-1">
                {isBn ? "Seesei akorae nnoɔma dɔɔso pɛpɛɛpɛ" : "Current inventory levels are adequate"}
              </p>
            </div>
          ) : (
            displayedList.map(({ product: p, daysOfStockLeft, suggestedBuyQty, tier, estimatedBudget }) => (
              <div
                key={p.id}
                className="p-3 sm:p-3.5 rounded-xl border border-em-200 bg-em-50/70 hover:bg-em-100/60 hover:border-em-300 flex items-center justify-between gap-3 transition-all shadow-2xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-ink text-xs sm:text-sm truncate">
                    {isBn ? p.nameBn || p.name : p.name}
                  </div>
                  <div className="text-[11px] sm:text-xs text-ink/70 flex items-center gap-2 mt-1 flex-wrap">
                    <span className="num font-bold text-ink">
                      {tNum(p.stock)} {isBn ? (p.unit === "Piece" ? "Pcs" : p.unit === "KG" ? "kg" : p.unit === "Liter" ? "L" : p.unit) : p.unit}
                    </span>
                    <span className="text-ink/30">•</span>
                    <span className="font-semibold text-ink text-[11px] sm:text-xs">
                      {daysOfStockLeft === 0
                        ? (isBn ? "0 nna nnoɔma aka (Asa)" : "0d stock left")
                        : (isBn ? `${tNum(daysOfStockLeft)} nna nnoɔma aka` : `${tNum(daysOfStockLeft)}d stock left`)}
                    </span>
                    {p.buyPrice > 0 && (
                      <>
                        <span className="text-ink/30 hidden sm:inline">•</span>
                        <span className="text-ink/60 text-[11px] hidden sm:inline">
                          {isBn ? "Boɔ" : "Cost"}: {formatTaka(p.buyPrice)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-[10px] sm:text-[11px] text-ink/60">
                    {isBn ? "Deɛ Yɛkamfo Kyerɛ" : "Suggested"}
                  </div>
                  <div className="num font-extrabold text-xs sm:text-sm text-em-800">
                    +{tNum(suggestedBuyQty)} {isBn ? (p.unit === "Piece" ? "Pcs" : p.unit === "KG" ? "kg" : p.unit === "Liter" ? "L" : p.unit) : p.unit}
                  </div>
                  {estimatedBudget > 0 && (
                    <div className="text-[10px] text-ink/50 mt-0.5">
                      ≈ {formatTaka(estimatedBudget)}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
