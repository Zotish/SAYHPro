import { useState } from "react";
import {
  BarChart2, TrendingUp, TrendingDown, Download, ChevronRight,
  ShoppingCart, Package, Users, Truck, Wallet, Receipt, FileText,
  ArrowLeft, Printer, CheckCircle, ShieldCheck, Landmark,
  AlertTriangle, ArrowRight, Sparkles, Filter, X, CreditCard, Check,
  AlertCircle
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer
} from "recharts";
import { useApp, Product } from "../context/AppContext";
import { toast } from "../components/Toast";
import ProductThumb from "../components/ProductThumb";

interface ReportsProps {
  lang: "en" | "bn";
  showPL?: boolean;
  showTax?: boolean;
  setScreen: (s: string) => void;
  onBack?: () => void;
}

interface TaxMonthRecord {
  id: string;
  month: string;
  monthBn: string;
  year: number;
  turnover: number;
  outputVat: number;
  inputRebate: number;
  netPayable: number;
  status: "paid" | "due";
  challanNo?: string;
  paidDate?: string;
  paymentMethod?: string;
}

const initialTaxRecords: TaxMonthRecord[] = [
  {
    id: "TAX-2026-09",
    month: "September",
    monthBn: "Ɛbɔ (September)",
    year: 2026,
    turnover: 320000,
    outputVat: 16000,
    inputRebate: 6800,
    netPayable: 9200,
    status: "due",
  },
  {
    id: "TAX-2026-08",
    month: "August",
    monthBn: "Ɔsannaa (August)",
    year: 2026,
    turnover: 410000,
    outputVat: 20500,
    inputRebate: 8200,
    netPayable: 12300,
    status: "paid",
    challanNo: "A-CHL-8829104",
    paidDate: "Aug 14, 2026",
    paymentMethod: "NBR A-Challan (Sonali Bank)",
  },
  {
    id: "TAX-2026-07",
    month: "July",
    monthBn: "Kitawonsa (July)",
    year: 2026,
    turnover: 385000,
    outputVat: 19250,
    inputRebate: 7700,
    netPayable: 11550,
    status: "paid",
    challanNo: "GRA-CHL-7719201",
    paidDate: "Jul 12, 2026",
    paymentMethod: "MTN MoMo GRA e-Payment",
  },
  {
    id: "TAX-2026-06",
    month: "June",
    monthBn: "June",
    year: 2026,
    turnover: 350000,
    outputVat: 17500,
    inputRebate: 7000,
    netPayable: 10500,
    status: "paid",
    challanNo: "GRA-CHL-6610382",
    paidDate: "Jun 11, 2026",
    paymentMethod: "Bank of Ghana / Ecobank GRA Gateway",
  },
];

export default function Reports({ lang, showPL, showTax, setScreen, onBack }: ReportsProps) {
  const { sales, expenses, products, customers, suppliers, accounts, settings, tNum, formatTaka } = useApp();
  const isBn = lang === "bn";

  const [activeTab, setActiveTab] = useState<"pl" | "sales" | "expenses" | "dues" | "tax" | "advisory">(
    showPL ? "pl" : showTax ? "tax" : "pl"
  );
  const [advisoryFilter, setAdvisoryFilter] = useState<"all" | "urgent" | "soon" | "safe" | "slow">("all");

  // Tax records state
  const [taxRecords, setTaxRecords] = useState<TaxMonthRecord[]>(initialTaxRecords);
  const [showTaxPayModal, setShowTaxPayModal] = useState(false);
  const [selectedTaxMonth, setSelectedTaxMonth] = useState<TaxMonthRecord | null>(null);
  const [taxPayChannel, setTaxPayChannel] = useState("a-challan");
  const [taxChallanInput, setTaxChallanInput] = useState("");

  // Dynamic P&L calculations
  const totalRevenue = sales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalCOGS = sales.reduce((sum, s) => {
    return sum + s.items.reduce((cSum, item) => cSum + (item.buyPrice || item.price * 0.75) * item.qty, 0);
  }, 0);
  const grossProfit = totalRevenue - totalCOGS;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = grossProfit - totalExpenses;

  const grossMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : "0.0";
  const netMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0.0";

  // Tax calculations
  const defaultTaxRate = settings.taxRate || 5;
  const totalSalesVatCollected = Math.round(totalRevenue * (defaultTaxRate / 100));
  const totalInputVatRebate = Math.round(totalCOGS * 0.03); // 3% input credit
  const currentNetVatPayable = Math.max(0, totalSalesVatCollected - totalInputVatRebate);
  const totalTaxPaidThisYear = taxRecords.filter(t => t.status === "paid").reduce((sum, t) => sum + t.netPayable, 0);

  // Expense categories breakdown
  const expenseByCategory = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  // Stock Buy Advisory: Color Coded Calculations
  // Analyzes turnover & stock velocity
  const productSalesQty = sales.reduce((acc, s) => {
    s.items.forEach(i => {
      acc[i.name] = (acc[i.name] || 0) + i.qty;
    });
    return acc;
  }, {} as Record<string, number>);

  const buyAdvisoryList = products.map(p => {
    const soldQty = productSalesQty[p.name] || (p.stock > 0 ? 12 : 25);
    const weeklyRate = Math.max(1, Math.round(soldQty / 4));
    const daysOfStockLeft = weeklyRate > 0 ? Math.round((p.stock / weeklyRate) * 7) : 999;

    let tier: "urgent" | "soon" | "safe" | "slow";
    let colorName: string;
    let badgeText: string;
    let badgeTextBn: string;
    let explanation: string;
    let explanationBn: string;
    let recommendedBuyQty: number;

    if (p.stock === 0 || p.stock <= p.min) {
      // 🔴 RED: Urgent restock!
      tier = "urgent";
      colorName = "red";
      badgeText = "Urgent Buy / Restock";
      badgeTextBn = "Tɔ Ntɛm Pa Ara (Akorae Asa / Asiane)";
      explanation = "Stock is critically low while demand is high. Restock immediately to prevent losing customers and profits.";
      explanationBn = "Akorae afom koraa anaa asa, nanso atɔfoɔ rehia pa ara. Tɔ ntɛm na atɔfoɔ ansan.";
      recommendedBuyQty = Math.max(20, p.min * 2 - p.stock);
    } else if (p.stock <= p.min * 1.6 || daysOfStockLeft <= 7) {
      // 🟡 YELLOW: Reorder soon
      tier = "soon";
      colorName = "yellow";
      badgeText = "Reorder Soon (3-7 Days)";
      badgeTextBn = "Ɛrensa Ntɛm (Nna 3-7)";
      explanation = "Approaching reorder point. Plan order in next supplier shipment batch.";
      explanationBn = "Ɛbɛsa wɔ nna kakra mu. Fa ka adwumawuranom ntɔdeɛ a ɛreba no ho.";
      recommendedBuyQty = Math.max(12, Math.round(p.min * 1.5 - p.stock));
    } else if (daysOfStockLeft <= 45) {
      // 🟢 GREEN: Optimal safe stock
      tier = "safe";
      colorName = "green";
      badgeText = "Optimal / Safe (Do Not Buy)";
      badgeTextBn = "Akorae Wɔ Hɔ (Ɛnhia sɛ wotɔ seesei)";
      explanation = "Healthy stock level with sufficient buffer. Cash flow is safely preserved.";
      explanationBn = "Nnoɔma dɔɔso wɔ dukan mu. Ɛnhia sɛ wode sika pɔtee to nnoɔma so seesei.";
      recommendedBuyQty = 0;
    } else {
      // ⚪ / 🔵 GRAY: Slow moving / Overstock
      tier = "slow";
      colorName = "gray";
      badgeText = "Slow Moving / Overstocked";
      badgeTextBn = "Tɔn Rekɔ Brɛoo / Akorae Dɔɔso Dodo (Nntɔ bi bio)";
      explanation = "Low sales turnover. Do not purchase more units; prioritize clearing current inventory.";
      explanationBn = "Nnoɔma yi tɔn kɔ brɛoo na ɛwɔ hɔ pii. Mfa sika nsie bio, tɔn nea ɛwɔ hɔ no ansa.";
      recommendedBuyQty = 0;
    }

    const estimatedBudget = recommendedBuyQty * p.buyPrice;

    return {
      product: p,
      tier,
      colorName,
      badgeText,
      badgeTextBn,
      explanation,
      explanationBn,
      weeklyRate,
      daysOfStockLeft,
      recommendedBuyQty,
      estimatedBudget,
    };
  });

  const filteredAdvisory = buyAdvisoryList.filter(item => {
    if (advisoryFilter === "all") return true;
    return item.tier === advisoryFilter;
  });

  const urgentCount = buyAdvisoryList.filter(i => i.tier === "urgent").length;
  const soonCount = buyAdvisoryList.filter(i => i.tier === "soon").length;
  const safeCount = buyAdvisoryList.filter(i => i.tier === "safe").length;
  const slowCount = buyAdvisoryList.filter(i => i.tier === "slow").length;
  const totalRecommendedBudget = buyAdvisoryList.reduce((s, i) => s + i.estimatedBudget, 0);

  const handleExportReport = () => {
    toast({
      type: "success",
      title: isBn ? "Amanneɛbɔ No Akɔ Pɛpɛɛpɛ!" : "Report Exported!",
      message: "Financial and tax audit report saved to CSV.",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleTaxPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaxMonth) return;

    const generatedChallan = taxChallanInput || `A-CHL-${Date.now().toString().slice(-7)}`;

    setTaxRecords(prev =>
      prev.map(t =>
        t.id === selectedTaxMonth.id
          ? {
              ...t,
              status: "paid",
              challanNo: generatedChallan,
              paidDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
              paymentMethod: taxPayChannel === "a-challan" ? "GRA Ghana.gov Portal" : "MTN MoMo GRA e-Payment",
            }
          : t
      )
    );

    setShowTaxPayModal(false);
    setTaxChallanInput("");
    toast({
      type: "success",
      title: isBn ? "Takisi Tua No Akɔ Pɛpɛɛpɛ!" : "Tax Payment Recorded!",
      message: isBn
        ? `Challan Nɔma ${generatedChallan} akɔ GRA nhyehyɛeɛ mu pɛpɛɛpɛ.`
        : `Challan No. ${generatedChallan} successfully linked to NBR return.`,
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 pb-24 lg:pb-8">
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

        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-nv-200 rounded-xl text-xs sm:text-sm font-semibold text-ink bg-white hover:bg-nv-50 transition-fast"
          >
            <Printer size={15} /> {isBn ? "Tintim" : "Print"}
          </button>
          <button
            onClick={handleExportReport}
            className="flex items-center gap-1.5 px-4 py-2 bg-em-700 hover:bg-em-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-fast"
          >
            <Download size={15} /> {isBn ? "Export" : "Export CSV"}
          </button>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-nv-200">
          <div className="text-xs text-ink mb-1">{isBn ? "Sika Nyinaa a Ɛba Mu" : "Total Revenue"}</div>
          <div className="num text-xl sm:text-2xl font-bold text-ink">{formatTaka(totalRevenue)}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-nv-200">
          <div className="text-xs text-ink mb-1">{isBn ? "Mfasoɔ Nyinaa" : "Gross Profit"}</div>
          <div className="num text-xl sm:text-2xl font-bold text-ink">{formatTaka(grossProfit)}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-nv-200">
          <div className="text-xs text-ink mb-1">{isBn ? "Mfasoɔ Pɔtee (Net Profit)" : "Net Profit"}</div>
          <div className="num text-xl sm:text-2xl font-bold text-ink">{formatTaka(netProfit)}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-nv-200">
          <div className="text-xs text-ink mb-1">{isBn ? "Takisi / GRA VAT a Ɛsɛ sɛ Wotua" : "Net Tax / VAT Due"}</div>
          <div className="num text-xl sm:text-2xl font-bold text-em-700">{formatTaka(currentNetVatPayable)}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-nv-200 pb-1 overflow-x-auto">
        {[
          { id: "pl" as const, label: "Profit & Loss", labelBn: "Mfasoɔ & Nkogu Kyerɛw" },
          { id: "tax" as const, label: "Tax Report & Payment", labelBn: "GRA Takisi Amanneɛbɔ & Tua Ka", highlight: true },
          { id: "advisory" as const, label: "Stock Buy Advisory (Color Coded)", labelBn: "Deɛ Ɛsɛ Sɛ Wotɔ (Advisory)", highlight: true },
          { id: "sales" as const, label: "Sales Audit", labelBn: "Tɔn Amanneɛbɔ" },
          { id: "expenses" as const, label: "Expenses", labelBn: "Dukan Ka Kyerɛw" },
          { id: "dues" as const, label: "Dues & Payables", labelBn: "Aka & Bosea Nyinaa" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-fast whitespace-nowrap flex items-center gap-1.5
              ${activeTab === tab.id
                ? "bg-em-700 text-white shadow-xs"
                : "text-ink hover:bg-nv-100"
              }`}
          >
            {tab.highlight && <Sparkles size={13} />}
            <span>{isBn ? tab.labelBn : tab.label}</span>
          </button>
        ))}
      </div>

      {/* 1. Tax Report and Payment Tab */}
      {activeTab === "tax" && (
        <div className="space-y-6">
          {/* Tax KPIs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-nv-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-ink/70 mb-1">
                <span>{isBn ? "Tɔn a Takisi Wɔ Ho" : "Taxable Sales Turnover"}</span>
                <Receipt size={15} className="text-ink/50" />
              </div>
              <div className="num text-xl font-bold text-ink">{formatTaka(totalRevenue)}</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-nv-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-ink/70 mb-1">
                <span>{isBn ? "GRA Output VAT a Wɔagye" : "Output VAT Collected"}</span>
                <Landmark size={15} className="text-ink/50" />
              </div>
              <div className="num text-xl font-bold text-ink">{formatTaka(totalSalesVatCollected)}</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-nv-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-ink/70 mb-1">
                <span>{isBn ? "GRA Input VAT Sanba" : "Input VAT Rebate"}</span>
                <ShieldCheck size={15} className="text-em-600" />
              </div>
              <div className="num text-xl font-bold text-em-700">-{formatTaka(totalInputVatRebate)}</div>
            </div>

            <div className="bg-gradient-to-br from-em-50 via-white to-amber-50 rounded-2xl p-4 border border-em-300 shadow-xs">
              <div className="flex items-center justify-between text-xs font-semibold text-ink mb-1">
                <span>{isBn ? "GRA Takisi a Ɛsɛ sɛ Wotua" : "Net Tax Payable (Govt)"}</span>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              </div>
              <div className="num text-2xl font-black text-ink">{formatTaka(currentNetVatPayable)}</div>
            </div>
          </div>

          {/* Tax Compliance & Payment Actions */}
          <div className="bg-white rounded-3xl shadow-sm border border-nv-200 p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-nv-100">
              <div>
                <h3 className="font-display font-bold text-ink text-base sm:text-lg">
                  {isBn ? "GRA Bosome Biara VAT Amanneɛbɔ" : "NBR Monthly VAT Returns"}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const dueRecord = taxRecords.find(t => t.status === "due") || taxRecords[0];
                    setSelectedTaxMonth(dueRecord);
                    setShowTaxPayModal(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-em-600 hover:bg-em-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-colors"
                >
                  <CreditCard size={15} />
                  {isBn ? "Tua GRA Takisi wɔ Intanɛte So" : "Pay Tax Online"}
                </button>
              </div>
            </div>

            {/* Tax Months Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-nv-50 border-b border-nv-200">
                    <th className="px-4 py-3 font-bold text-ink">{isBn ? "Takisi Bere" : "Tax Period"}</th>
                    <th className="px-4 py-3 font-bold text-ink">{isBn ? "Tɔn Nyinaa Dodow" : "Sales Turnover"}</th>
                    <th className="px-4 py-3 font-bold text-ink">{isBn ? "Output VAT" : "Output VAT"}</th>
                    <th className="px-4 py-3 font-bold text-ink">{isBn ? "GRA Input VAT Mfasoɔ" : "Input Rebate"}</th>
                    <th className="px-4 py-3 font-bold text-ink">{isBn ? "Takisi a Ɛsɛ sɛ Wotua" : "Net Tax Payable"}</th>
                    <th className="px-4 py-3 font-bold text-ink">{isBn ? "Gyinabea & GRA Krataa" : "Status & Challan"}</th>
                    <th className="px-4 py-3 font-bold text-ink text-right">{isBn ? "Dwumadie" : "Action"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-nv-100">
                  {taxRecords.map(rec => (
                    <tr key={rec.id} className="hover:bg-nv-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-ink">
                        {isBn ? `${rec.monthBn} ${tNum(rec.year)}` : `${rec.month} ${rec.year}`}
                      </td>
                      <td className="px-4 py-3 num">{formatTaka(rec.turnover)}</td>
                      <td className="px-4 py-3 num text-ink">{formatTaka(rec.outputVat)}</td>
                      <td className="px-4 py-3 num text-em-700">-{formatTaka(rec.inputRebate)}</td>
                      <td className="px-4 py-3 num font-bold text-ink">{formatTaka(rec.netPayable)}</td>
                      <td className="px-4 py-3">
                        {rec.status === "paid" ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-em-50 text-em-800 border border-em-200">
                              <Check size={12} /> {isBn ? "Wɔatua Pɛpɛɛpɛ" : "Paid"}
                            </span>
                            <div className="text-[10px] font-mono text-ink/60 mt-0.5">{rec.challanNo}</div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <AlertCircle size={12} /> {isBn ? "Akatua a Ɛsɛ sɛ Wotua" : "Payment Due"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {rec.status === "due" ? (
                          <button
                            onClick={() => {
                              setSelectedTaxMonth(rec);
                              setShowTaxPayModal(true);
                            }}
                            className="px-3 py-1.5 bg-em-700 hover:bg-em-800 text-white rounded-lg font-bold text-xs shadow-xs transition-colors"
                          >
                            {isBn ? "Tua Seesei" : "Pay Now"}
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              toast({
                                type: "success",
                                title: isBn ? "Tax Krataa Atwe Aba!" : "Challan Voucher Downloaded!",
                                message: `Voucher for ${rec.challanNo} saved.`,
                              });
                            }}
                            className="px-3 py-1.5 bg-nv-100 hover:bg-nv-200 text-ink rounded-lg font-semibold text-xs transition-colors"
                          >
                            {isBn ? "GRA Tax Krataa PDF" : "Challan PDF"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Stock Buy Advisory (Deɛ Ɛsɛ Sɛ Wotɔ (Advisory) - Color Coded) */}
      {activeTab === "advisory" && (
        <div className="space-y-6">
          {/* Top Explanation Banner */}
          <div className="bg-white rounded-3xl border border-nv-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-lg text-ink flex items-center gap-2">
                  <Package className="text-em-700" size={20} />
                  {isBn ? "Deɛ Ɛsɛ sɛ Wotɔ Bio — Ntɔdeɛ Afotusɛm" : "What to Buy Next — Purchasing Advisory"}
                </h3>
                <p className="text-xs text-ink/70">
                  {isBn
                    ? "Nnoɔma tɔn ntɛmntɛm ne akorae dodoɔ ho akwankyerɛ a ahosuo wom: deɛ ɛsɛ sɛ wotɔ seesei ne deɛ ɛnsɛ sɛ wotɔ gu hɔ"
                    : "Color-coded inventory demand analytics recommending exactly what to reorder vs what to avoid"}
                </p>
              </div>

              <button
                onClick={() => setScreen("purchases")}
                className="flex items-center gap-1.5 px-4 py-2 bg-em-600 hover:bg-em-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-colors self-start sm:self-auto"
              >
                <ShoppingCart size={15} />
                {isBn ? "Bue Ntɔdeɛ Invois" : "Open Purchase Order"}
              </button>
            </div>

            {/* 4 Color Explanation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Red */}
              <div
                onClick={() => setAdvisoryFilter(advisoryFilter === "urgent" ? "all" : "urgent")}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  advisoryFilter === "urgent"
                    ? "border-red-500 bg-red-50 shadow-sm"
                    : "border-red-200 bg-red-50/40 hover:bg-red-50/70"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                    {isBn ? "🔴 Tɔ Ntɛm Pa Ara" : "🔴 Urgent Buy"}
                  </span>
                  <span className="num font-bold text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                    {tNum(urgentCount)} {isBn ? "nnoɔma" : "items"}
                  </span>
                </div>
                <p className="text-[11px] text-ink/70 leading-snug">
                  {isBn
                    ? "Akorae asa anaa ɛrekɔ fom, nanso atɔfoɔ pɛ pa ara. Fa ba ntɛm na tɔn ankɔ fam."
                    : "Critically low stock with active demand. High lost sales risk!"}
                </p>
              </div>

              {/* Yellow */}
              <div
                onClick={() => setAdvisoryFilter(advisoryFilter === "soon" ? "all" : "soon")}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  advisoryFilter === "soon"
                    ? "border-amber-500 bg-amber-50 shadow-sm"
                    : "border-amber-200 bg-amber-50/40 hover:bg-amber-50/70"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    {isBn ? "🟡 Ɛrensa Ntɛm" : "🟡 Reorder Soon"}
                  </span>
                  <span className="num font-bold text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    {tNum(soonCount)} {isBn ? "nnoɔma" : "items"}
                  </span>
                </div>
                <p className="text-[11px] text-ink/70 leading-snug">
                  {isBn
                    ? "Ɛbɛsa wɔ nna 3 kɔsi 7 ntam. Fa ka adwumawura ntɔdeɛ a ɛreba ho."
                    : "Will run out in 3-7 days. Include in upcoming purchase batch."}
                </p>
              </div>

              {/* Green */}
              <div
                onClick={() => setAdvisoryFilter(advisoryFilter === "safe" ? "all" : "safe")}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  advisoryFilter === "safe"
                    ? "border-emerald-500 bg-emerald-50 shadow-sm"
                    : "border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/70"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    {isBn ? "🟢 Ɛyɛ Pɛpɛɛpɛ / Ɛdɔɔso" : "🟢 Safe / Optimal"}
                  </span>
                  <span className="num font-bold text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {tNum(safeCount)} {isBn ? "nnoɔma" : "items"}
                  </span>
                </div>
                <p className="text-[11px] text-ink/70 leading-snug">
                  {isBn
                    ? "Nna 15-45 akorae wɔ hɔ. Ɛnhia sɛ wotɔ bio seesei; sika pɔtee wɔ hɔ pɛpɛɛpɛ."
                    : "Healthy buffer (15-45 days). No purchase needed; preserves cash."}
                </p>
              </div>

              {/* Gray / Blue */}
              <div
                onClick={() => setAdvisoryFilter(advisoryFilter === "slow" ? "all" : "slow")}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  advisoryFilter === "slow"
                    ? "border-slate-500 bg-slate-100 shadow-sm"
                    : "border-slate-200 bg-slate-50/60 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    {isBn ? "⚪ Mmfa Nnoɔma Ngu Hɔ Nkyɛ Dodo" : "⚪ Avoid Overstock"}
                  </span>
                  <span className="num font-bold text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full">
                    {tNum(slowCount)} {isBn ? "nnoɔma" : "items"}
                  </span>
                </div>
                <p className="text-[11px] text-ink/70 leading-snug">
                  {isBn
                    ? "Tɔn rekɔ brɛoo. Ntɔ gu hɔ bio na sika antoto fam."
                    : "Slow mover / excess inventory. Avoid purchasing more units."}
                </p>
              </div>
            </div>
          </div>

          {/* Filter Bar & Total Recommended Budget */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-nv-200">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-ink mr-1 flex items-center gap-1">
                <Filter size={13} /> {isBn ? "Yi Mu:" : "Filter:"}
              </span>
              <button
                onClick={() => setAdvisoryFilter("all")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  advisoryFilter === "all" ? "bg-ink text-white" : "bg-nv-100 text-ink hover:bg-nv-200"
                }`}
              >
                {isBn ? "Nyinaa Nnoɔma" : "All Products"} ({tNum(buyAdvisoryList.length)})
              </button>
              <button
                onClick={() => setAdvisoryFilter("urgent")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  advisoryFilter === "urgent" ? "bg-red-600 text-white" : "bg-red-50 text-red-700 hover:bg-red-100"
                }`}
              >
                🔴 {isBn ? "Ntɛmntɛm" : "Urgent"} ({tNum(urgentCount)})
              </button>
              <button
                onClick={() => setAdvisoryFilter("soon")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  advisoryFilter === "soon" ? "bg-amber-600 text-white" : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                }`}
              >
                🟡 {isBn ? "Ɛrensa Ntɛm" : "Soon"} ({tNum(soonCount)})
              </button>
              <button
                onClick={() => setAdvisoryFilter("safe")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  advisoryFilter === "safe" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                🟢 {isBn ? "Ɛyɛ Pɛpɛɛpɛ" : "Safe"} ({tNum(safeCount)})
              </button>
              <button
                onClick={() => setAdvisoryFilter("slow")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  advisoryFilter === "slow" ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                ⚪ {isBn ? "Tɔn Ntoasoɔ Brɛoo" : "Slow"} ({tNum(slowCount)})
              </button>
            </div>

            <div className="text-xs text-ink flex items-center gap-1.5 self-start sm:self-auto">
              <span className="text-ink/60">{isBn ? "Ntɔdeɛ Sika a Wɔahyɛ Da:" : "Suggested Buy Budget:"}</span>
              <span className="num font-bold text-em-700 text-sm">{formatTaka(totalRecommendedBudget)}</span>
            </div>
          </div>

          {/* Color Coded Products List */}
          <div className="bg-white rounded-3xl border border-nv-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-nv-50 border-b border-nv-200">
                    <th className="px-4 py-3 font-bold text-ink">{isBn ? "Nnoɔma & Kuw" : "Product & Category"}</th>
                    <th className="px-4 py-3 font-bold text-ink">{isBn ? "Ntɔdeɛ Ho Kɔkɔbɔ" : "Color Buy Advisory"}</th>
                    <th className="px-4 py-3 font-bold text-ink">{isBn ? "Akorae a Ɛwɔ Hɔ Seesei" : "Current Stock"}</th>
                    <th className="px-4 py-3 font-bold text-ink">{isBn ? "Sɛdeɛ Nnoɔma Rekɔ Ntɛmntɛm" : "Sales Burn Rate"}</th>
                    <th className="px-4 py-3 font-bold text-ink">{isBn ? "Nna a Aka" : "Days Left"}</th>
                    <th className="px-4 py-3 font-bold text-ink">{isBn ? "Dodoɔ a Wɔahyɛ Da" : "Suggested Qty"}</th>
                    <th className="px-4 py-3 font-bold text-ink">{isBn ? "Boɔ a Wɔabu" : "Est. Cost"}</th>
                    <th className="px-4 py-3 font-bold text-ink text-right">{isBn ? "Dwumadie" : "Action"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-nv-100">
                  {filteredAdvisory.map(({ product: p, tier, badgeText, badgeTextBn, explanation, explanationBn, weeklyRate, daysOfStockLeft, recommendedBuyQty, estimatedBudget }) => {
                    const isUrgent = tier === "urgent";
                    const isSoon = tier === "soon";
                    const isSafe = tier === "safe";

                    return (
                      <tr
                        key={p.id}
                        className={`transition-colors ${
                          isUrgent ? "bg-red-50/20 hover:bg-red-50/40" : isSoon ? "bg-amber-50/20 hover:bg-amber-50/40" : "hover:bg-nv-50"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <ProductThumb
                              src={p.image}
                              alt={p.name}
                              className="w-9 h-9 rounded-xl object-contain bg-nv-50 p-0.5 border border-nv-200/60 flex-shrink-0"
                              sizeClass="text-base"
                            />
                            <div>
                              <div className="font-bold text-ink">{isBn ? p.nameBn : p.name}</div>
                              <div className="text-[10px] text-ink/60 font-mono">
                                {p.sku} • {p.category}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap ${
                              isUrgent
                                ? "bg-red-100 text-red-800 border border-red-300"
                                : isSoon
                                ? "bg-amber-100 text-amber-800 border border-amber-300"
                                : isSafe
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : "bg-slate-100 text-slate-700 border border-slate-300"
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isUrgent ? "bg-red-600" : isSoon ? "bg-amber-500" : isSafe ? "bg-emerald-500" : "bg-slate-400"
                              }`}
                            />
                            {isBn ? badgeTextBn : badgeText}
                          </span>
                          <div className="text-[10px] text-ink/60 mt-0.5 line-clamp-1 max-w-xs">
                            {isBn ? explanationBn : explanation}
                          </div>
                        </td>

                        <td className="px-4 py-3 font-semibold num">
                          <span className={p.stock <= p.min ? "text-red-700 font-bold" : "text-ink"}>
                            {tNum(p.stock)} {p.unit.split("/")[0]}
                          </span>
                          <div className="text-[10px] text-ink/50">Min: {tNum(p.min)}</div>
                        </td>

                        <td className="px-4 py-3 num">
                          ~{tNum(weeklyRate)} {isBn ? "Pcs/Dapɛn" : "pcs/wk"}
                        </td>

                        <td className="px-4 py-3 num">
                          <span
                            className={`font-semibold ${
                              daysOfStockLeft <= 3 ? "text-red-700 font-bold" : daysOfStockLeft <= 7 ? "text-amber-700" : "text-ink"
                            }`}
                          >
                            {daysOfStockLeft > 90 ? "90+ days" : `${tNum(daysOfStockLeft)} ${isBn ? "Nna" : "days"}`}
                          </span>
                        </td>

                        <td className="px-4 py-3 num font-bold">
                          {recommendedBuyQty > 0 ? (
                            <span className="text-em-700 font-bold">+{tNum(recommendedBuyQty)} pcs</span>
                          ) : (
                            <span className="text-ink/40 font-normal">0 {isBn ? "pcs" : "pcs"}</span>
                          )}
                        </td>

                        <td className="px-4 py-3 num font-bold">
                          {estimatedBudget > 0 ? formatTaka(estimatedBudget) : "—"}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {recommendedBuyQty > 0 ? (
                            <button
                              onClick={() => setScreen("purchases")}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-xs ${
                                isUrgent
                                  ? "bg-red-600 hover:bg-red-700 text-white"
                                  : "bg-em-600 hover:bg-em-700 text-white"
                              }`}
                            >
                              {isBn ? "Tɔ Seesei Ara" : "Buy Now"}
                            </button>
                          ) : (
                            <span className="text-[11px] text-ink/40 font-medium">
                              {isBn ? "Ntɔdeɛ biara nni hɔ" : "No order"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Profit & Loss Statement */}
      {activeTab === "pl" && (
        <div className="bg-white rounded-3xl shadow-sm border border-nv-200 p-6 space-y-6">
          <div className="border-b border-nv-100 pb-4">
            <h3 className="font-display font-bold text-ink text-lg">
              {isBn ? "Mfasoɔ & Nkogu Kyerɛw" : "Profit & Loss Statement"}
            </h3>
          </div>

          <div className="space-y-4 max-w-2xl text-xs sm:text-sm">
            {/* Income */}
            <div className="space-y-2">
              <div className="flex justify-between items-center font-bold text-ink border-b border-nv-100 pb-1">
                <span>1. {isBn ? "Tɔn Mu Sika Nyinaa" : "Gross Revenue from Sales"}</span>
                <span className="num text-ink">{formatTaka(totalRevenue)}</span>
              </div>
              <div className="flex justify-between items-center text-ink pl-4">
                <span>- {isBn ? "Nnoɔma Nnoɔma a Wɔatɔ Nyinaa Ka (COGS)" : "Cost of Goods Sold (COGS)"}</span>
                <span className="num text-ink">-{formatTaka(totalCOGS)}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-ink bg-em-50/50 p-2.5 rounded-xl">
                <span>= {isBn ? "Mfasoɔ Nyinaa" : "Gross Profit"}</span>
                <span className="num font-bold text-ink">{formatTaka(grossProfit)} ({tNum(grossMargin)}%)</span>
              </div>
            </div>

            {/* Operating Expenses */}
            <div className="space-y-2 pt-2">
              <div className="font-bold text-ink border-b border-nv-100 pb-1">
                2. {isBn ? "Dukan Adwumayɛ Ka" : "Operating Expenses"}
              </div>
              {Object.entries(expenseByCategory).map(([cat, amt]) => (
                <div key={cat} className="flex justify-between items-center text-ink pl-4">
                  <span>- {cat}</span>
                  <span className="num text-ink">-{formatTaka(amt)}</span>
                </div>
              ))}
              {Object.keys(expenseByCategory).length === 0 && (
                <div className="text-ink pl-4 text-xs">No operating expenses recorded yet</div>
              )}
              <div className="flex justify-between items-center font-bold text-ink bg-red-50/50 p-2.5 rounded-xl">
                <span>= {isBn ? "Adwumayɛ Ka Nyinaa" : "Total Operating Expenses"}</span>
                <span className="num font-bold text-ink">-{formatTaka(totalExpenses)}</span>
              </div>
            </div>

            {/* Final Net Profit */}
            <div className="flex justify-between items-center text-base sm:text-lg font-extrabold text-white sidebar-gradient p-4 rounded-2xl shadow-md">
              <span>{isBn ? "Mfasoɔ Pɔtee" : "Net Profit"}</span>
              <span className="num font-mono">{formatTaka(netProfit)}</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Sales Breakdown View */}
      {activeTab === "sales" && (
        <div className="bg-white rounded-3xl shadow-sm border border-nv-200 p-6 space-y-4">
          <h3 className="font-display font-bold text-ink text-lg">{isBn ? "Nnoɔma a Wɔatɔn Awie Kyerɛw" : "Completed Sales Records"}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-nv-50 border-b border-nv-200">
                  <th className="px-4 py-3 font-bold text-ink">Invoice No</th>
                  <th className="px-4 py-3 font-bold text-ink">Customer</th>
                  <th className="px-4 py-3 font-bold text-ink">Payment</th>
                  <th className="px-4 py-3 font-bold text-ink">Subtotal</th>
                  <th className="px-4 py-3 font-bold text-ink">Discount</th>
                  <th className="px-4 py-3 font-bold text-ink">Total</th>
                  <th className="px-4 py-3 font-bold text-ink">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nv-100">
                {sales.map(s => (
                  <tr key={s.id} className="hover:bg-nv-50">
                    <td className="px-4 py-3 font-mono font-bold">{tNum(s.invoiceNo)}</td>
                    <td className="px-4 py-3 font-medium">{s.customer}</td>
                    <td className="px-4 py-3 uppercase font-semibold text-xs text-ink">{s.paymentMethod}</td>
                    <td className="px-4 py-3 num">{formatTaka(s.subtotal)}</td>
                    <td className="px-4 py-3 num text-ink">-{formatTaka(s.discount)}</td>
                    <td className="px-4 py-3 num font-bold text-ink">{formatTaka(s.grandTotal)}</td>
                    <td className="px-4 py-3 text-xs text-ink">{s.date} {s.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Expenses Tab */}
      {activeTab === "expenses" && (
        <div className="bg-white rounded-3xl shadow-sm border border-nv-200 p-6 space-y-4">
          <h3 className="font-display font-bold text-ink text-lg">{isBn ? "Ka a Wɔabɔ Nhwehwɛmu" : "Expense Audit Trail"}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-nv-50 border-b border-nv-200">
                  <th className="px-4 py-3 font-bold text-ink">Category</th>
                  <th className="px-4 py-3 font-bold text-ink">Amount</th>
                  <th className="px-4 py-3 font-bold text-ink">Paid From</th>
                  <th className="px-4 py-3 font-bold text-ink">Date</th>
                  <th className="px-4 py-3 font-bold text-ink">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nv-100">
                {expenses.map(e => (
                  <tr key={e.id} className="hover:bg-nv-50">
                    <td className="px-4 py-3 font-bold">{e.category}</td>
                    <td className="px-4 py-3 num font-bold text-ink">{formatTaka(e.amount)}</td>
                    <td className="px-4 py-3">{e.paidFrom}</td>
                    <td className="px-4 py-3 text-xs text-ink">{e.date}</td>
                    <td className="px-4 py-3 text-xs text-ink">{e.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Dues Tab */}
      {activeTab === "dues" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-3xl shadow-sm border border-nv-200 p-5 space-y-3">
            <h3 className="font-display font-bold text-ink text-base">{isBn ? "Otɔfoɔ Aka (Receivables)" : "Customer Receivables"}</h3>
            <div className="divide-y divide-nv-100">
              {customers.filter(c => c.due > 0).map(c => (
                <div key={c.id} className="py-2.5 flex justify-between items-center text-xs sm:text-sm">
                  <div>
                    <div className="font-bold text-ink">{c.name}</div>
                    <div className="text-[10px] text-ink">{c.phone}</div>
                  </div>
                  <div className="num font-bold text-ink">{formatTaka(c.due)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-nv-200 p-5 space-y-3">
            <h3 className="font-display font-bold text-ink text-base">{isBn ? "Agorɔfoɔ Aka (Payables)" : "Supplier Payables"}</h3>
            <div className="divide-y divide-nv-100">
              {suppliers.filter(s => s.due > 0).map(s => (
                <div key={s.id} className="py-2.5 flex justify-between items-center text-xs sm:text-sm">
                  <div>
                    <div className="font-bold text-ink">{s.name}</div>
                    <div className="text-[10px] text-ink">{s.contact}</div>
                  </div>
                  <div className="num font-bold text-ink">{formatTaka(s.due)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Tax Payment Modal */}
      {showTaxPayModal && selectedTaxMonth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-nv-200 space-y-4 animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-nv-100">
              <div className="flex items-center gap-2">
                <Landmark className="text-em-700" size={20} />
                <h3 className="font-display font-bold text-ink text-base">
                  {isBn ? "Intanɛte GRA Tax & VAT Tua" : "NBR Tax & VAT e-Payment"}
                </h3>
              </div>
              <button
                onClick={() => setShowTaxPayModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-ink/70 hover:text-ink hover:bg-nv-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleTaxPaymentSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="p-3 bg-nv-50 rounded-2xl border border-nv-200 space-y-1">
                <div className="text-xs text-ink/60">{isBn ? "Takisi Bere:" : "Tax Period:"}</div>
                <div className="font-bold text-sm text-ink">
                  {isBn
                    ? `${selectedTaxMonth.monthBn} ${tNum(selectedTaxMonth.year)} (GRA e-VAT)`
                    : `${selectedTaxMonth.month} ${selectedTaxMonth.year} (Mushak 9.1)`}
                </div>
                <div className="flex justify-between items-center pt-2 mt-1 border-t border-nv-200">
                  <span className="text-ink/70 font-semibold">{isBn ? "Sika Pɔtee a Ɛsɛ sɛ Wotua:" : "Net Payable Amount:"}</span>
                  <span className="num text-base font-bold text-em-700">{formatTaka(selectedTaxMonth.netPayable)}</span>
                </div>
              </div>

              {/* Channel Selector */}
              <div>
                <label className="block font-semibold text-ink mb-1.5">
                  {isBn ? "Paw Akatua Kwan" : "Select Payment Gateway"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "a-challan", label: "GRA Ghana.gov", sub: "GCB / BoG Portal" },
                    { id: "bkash", label: "MTN MoMo GRA", sub: "e-Tax Direct" },
                  ].map(ch => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setTaxPayChannel(ch.id)}
                      className={`p-2.5 rounded-xl border text-left transition-colors ${
                        taxPayChannel === ch.id
                          ? "border-em-600 bg-em-50/50 text-ink font-bold"
                          : "border-nv-200 bg-white text-ink/70 hover:bg-nv-50"
                      }`}
                    >
                      <div className="text-xs">{ch.label}</div>
                      <div className="text-[10px] text-ink/50">{ch.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Challan No / Trx ID */}
              <div>
                <label className="block font-semibold text-ink mb-1">
                  {isBn ? "GRA Challan / MoMo Reference No." : "GRA Challan / MoMo Reference No."}
                </label>
                <input
                  type="text"
                  value={taxChallanInput}
                  onChange={e => setTaxChallanInput(e.target.value)}
                  placeholder="e.g. GRA-CHL-9982710 or MOMO-GRA"
                  className="w-full border border-nv-200 rounded-xl px-3.5 py-2 font-mono text-xs focus:border-em-500 bg-white"
                />
                <span className="text-[10px] text-ink/50 mt-1 block">
                  {isBn ? "Kora no afie sɛ wobɛnya GRA Tax Receipt ID automatic." : "Leave blank to auto-generate a valid GRA Tax Receipt ID."}
                </span>
              </div>

              <div className="flex gap-2 pt-2 border-t border-nv-100">
                <button
                  type="button"
                  onClick={() => setShowTaxPayModal(false)}
                  className="flex-1 py-2.5 border border-nv-200 rounded-xl text-ink font-semibold hover:bg-nv-50"
                >
                  {isBn ? "Gyae (Cancel)" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-em-600 hover:bg-em-700 text-white rounded-xl font-bold shadow-md transition-colors"
                >
                  {isBn ? "Si Takisi Tua No So Dua" : "Confirm Tax Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
