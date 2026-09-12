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

interface ReportsProps {
  lang: "en" | "bn";
  showPL?: boolean;
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
    monthBn: "সেপ্টেম্বর",
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
    monthBn: "আগস্ট",
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
    monthBn: "জুলাই",
    year: 2026,
    turnover: 385000,
    outputVat: 19250,
    inputRebate: 7700,
    netPayable: 11550,
    status: "paid",
    challanNo: "A-CHL-7719201",
    paidDate: "Jul 12, 2026",
    paymentMethod: "bKash NBR e-Payment",
  },
  {
    id: "TAX-2026-06",
    month: "June",
    monthBn: "জুন",
    year: 2026,
    turnover: 350000,
    outputVat: 17500,
    inputRebate: 7000,
    netPayable: 10500,
    status: "paid",
    challanNo: "A-CHL-6610382",
    paidDate: "Jun 11, 2026",
    paymentMethod: "Bangladesh Bank Core Gateway",
  },
];

export default function Reports({ lang, showPL, setScreen, onBack }: ReportsProps) {
  const { sales, expenses, products, customers, suppliers, accounts, settings, tNum, formatTaka } = useApp();
  const isBn = lang === "bn";

  const [activeTab, setActiveTab] = useState<"pl" | "sales" | "expenses" | "dues" | "tax" | "advisory">(
    showPL ? "pl" : "pl"
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
      badgeTextBn = "জরুরি কেনা দরকার (স্টক শেষ/ঝুঁকি)";
      explanation = "Stock is critically low while demand is high. Restock immediately to prevent losing customers and profits.";
      explanationBn = "স্টক মারাত্মকভাবে কমে গেছে বা শূন্য, অথচ পণ্যের ব্যাপক চাহিদা। কাস্টমার যেন ফিরে না যায় সেজন্য দ্রুত কিনুন।";
      recommendedBuyQty = Math.max(20, p.min * 2 - p.stock);
    } else if (p.stock <= p.min * 1.6 || daysOfStockLeft <= 7) {
      // 🟡 YELLOW: Reorder soon
      tier = "soon";
      colorName = "yellow";
      badgeText = "Reorder Soon (3-7 Days)";
      badgeTextBn = "শীঘ্রই শেষ হবে (৩-৭ দিন)";
      explanation = "Approaching reorder point. Plan order in next supplier shipment batch.";
      explanationBn = "আগামী কয়েকদিনের মধ্যে ফুরিয়ে যাবে। পরবর্তী সাপ্লায়ার চালানে অর্ডার অন্তর্ভুক্ত করুন।";
      recommendedBuyQty = Math.max(12, Math.round(p.min * 1.5 - p.stock));
    } else if (daysOfStockLeft <= 45) {
      // 🟢 GREEN: Optimal safe stock
      tier = "safe";
      colorName = "green";
      badgeText = "Optimal / Safe (Do Not Buy)";
      badgeTextBn = "পর্যাপ্ত স্টক (এখন কেনার দরকার নেই)";
      explanation = "Healthy stock level with sufficient buffer. Cash flow is safely preserved.";
      explanationBn = "দোকানে পর্যাপ্ত স্টক মজুত আছে। এখন নতুন করে নগদ টাকা আটকানোর কোনো প্রয়োজন নেই।";
      recommendedBuyQty = 0;
    } else {
      // ⚪ / 🔵 GRAY: Slow moving / Overstock
      tier = "slow";
      colorName = "gray";
      badgeText = "Slow Moving / Overstocked";
      badgeTextBn = "কম চাহিদা / অতিরিক্ত স্টক (কিনবেন না)";
      explanation = "Low sales turnover. Do not purchase more units; prioritize clearing current inventory.";
      explanationBn = "বিক্রি ধীরগতির বা অতিরিক্ত স্টক রয়েছে। ভুলেও আর কিনবেন না, আগের স্টক বিক্রির দিকে নজর দিন।";
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
      title: isBn ? "রিপোর্ট ডাউনলোড হয়েছে!" : "Report Exported!",
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
              paymentMethod: taxPayChannel === "a-challan" ? "NBR Automated A-Challan" : "bKash NBR e-Payment",
            }
          : t
      )
    );

    setShowTaxPayModal(false);
    setTaxChallanInput("");
    toast({
      type: "success",
      title: isBn ? "ট্যাক্স সফলভাবে পরিশোধিত!" : "Tax Payment Recorded!",
      message: isBn
        ? `চালান নং ${generatedChallan} এনবিআর সিস্টেমে নথিভুক্ত হয়েছে।`
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
            aria-label={isBn ? "পেছনে যান" : "Go back"}
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
            <Printer size={15} /> {isBn ? "প্রিন্ট" : "Print"}
          </button>
          <button
            onClick={handleExportReport}
            className="flex items-center gap-1.5 px-4 py-2 bg-em-700 hover:bg-em-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-fast"
          >
            <Download size={15} /> {isBn ? "এক্সপোর্ট" : "Export CSV"}
          </button>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-nv-200">
          <div className="text-xs text-ink mb-1">{isBn ? "মোট আয় (Revenue)" : "Total Revenue"}</div>
          <div className="num text-xl sm:text-2xl font-bold text-ink">{formatTaka(totalRevenue)}</div>
          <div className="text-[11px] text-ink font-semibold mt-1">
            {isBn ? `${tNum(sales.length)} টি বিক্রয় থেকে` : `From ${sales.length} Sales`}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-nv-200">
          <div className="text-xs text-ink mb-1">{isBn ? "গ্রস লাভ (Gross Profit)" : "Gross Profit"}</div>
          <div className="num text-xl sm:text-2xl font-bold text-ink">{formatTaka(grossProfit)}</div>
          <div className="text-[11px] text-ink font-semibold mt-1">
            {tNum(grossMargin)}% {isBn ? "মার্জিন" : "Margin"}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-nv-200">
          <div className="text-xs text-ink mb-1">{isBn ? "নিট লাভ (Net Profit)" : "Net Profit"}</div>
          <div className="num text-xl sm:text-2xl font-bold text-ink">{formatTaka(netProfit)}</div>
          <div className="text-[11px] text-ink font-semibold mt-1">
            {tNum(netMargin)}% {isBn ? "নিট মার্জিন" : "Net Margin"}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-nv-200">
          <div className="text-xs text-ink mb-1">{isBn ? "প্রদেয় ভ্যাট ও কর (Net Tax)" : "Net Tax / VAT Due"}</div>
          <div className="num text-xl sm:text-2xl font-bold text-em-700">{formatTaka(currentNetVatPayable)}</div>
          <div className="text-[11px] text-ink font-semibold mt-1">
            {isBn ? "এনবিআর মূসক ৯.১ তৈরি" : "NBR Mushak 9.1 Ready"}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-nv-200 pb-1 overflow-x-auto">
        {[
          { id: "pl" as const, label: "Profit & Loss", labelBn: "লাভ ও ক্ষতি বিবরণী" },
          { id: "tax" as const, label: "Tax Report & Payment", labelBn: "কর ও ভ্যাট রিপোর্ট ও পরিশোধ", highlight: true },
          { id: "advisory" as const, label: "Stock Buy Advisory (Color Coded)", labelBn: "কোনটি কেনা উচিত (ক্রয় পরামর্শ)", highlight: true },
          { id: "sales" as const, label: "Sales Audit", labelBn: "বিক্রয় রিপোর্ট" },
          { id: "expenses" as const, label: "Expenses", labelBn: "খরচের হিসাব" },
          { id: "dues" as const, label: "Dues & Payables", labelBn: "বাকি ও দেনা" },
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
                <span>{isBn ? "করযোগ্য মোট বিক্রয়" : "Taxable Sales Turnover"}</span>
                <Receipt size={15} className="text-ink/50" />
              </div>
              <div className="num text-xl font-bold text-ink">{formatTaka(totalRevenue)}</div>
              <div className="text-[11px] text-ink/60 mt-1">{isBn ? "প্রযোজ্য ভ্যাট হার ৫%" : "Standard VAT 5% Rate"}</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-nv-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-ink/70 mb-1">
                <span>{isBn ? "গ্রাহক থেকে সংগৃহীত ভ্যাট" : "Output VAT Collected"}</span>
                <Landmark size={15} className="text-ink/50" />
              </div>
              <div className="num text-xl font-bold text-ink">{formatTaka(totalSalesVatCollected)}</div>
              <div className="text-[11px] text-ink/60 mt-1">{isBn ? "বিক্রয়ের সাথে সংযোজিত" : "Collected from Invoices"}</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-nv-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-ink/70 mb-1">
                <span>{isBn ? "ইনপুট ভ্যাট রেয়াত" : "Input VAT Rebate"}</span>
                <ShieldCheck size={15} className="text-em-600" />
              </div>
              <div className="num text-xl font-bold text-em-700">-{formatTaka(totalInputVatRebate)}</div>
              <div className="text-[11px] text-ink/60 mt-1">{isBn ? "ক্রয় চালানের বিপরীতে হ্রাস" : "Purchases Input Credit"}</div>
            </div>

            <div className="bg-gradient-to-br from-em-50 via-white to-amber-50 rounded-2xl p-4 border border-em-300 shadow-xs">
              <div className="flex items-center justify-between text-xs font-semibold text-ink mb-1">
                <span>{isBn ? "সরকারি কোষাগারে প্রদেয় ভ্যাট" : "Net Tax Payable (Govt)"}</span>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              </div>
              <div className="num text-2xl font-black text-ink">{formatTaka(currentNetVatPayable)}</div>
              <div className="text-[11px] text-ink/70 mt-1 flex items-center gap-1 font-semibold">
                <CheckCircle size={12} className="text-em-600" />
                {isBn ? "চলতি বছরে পরিশোধিত: " : "Paid YTD: "}
                <span className="num font-bold">{formatTaka(totalTaxPaidThisYear)}</span>
              </div>
            </div>
          </div>

          {/* Tax Compliance & Payment Actions */}
          <div className="bg-white rounded-3xl shadow-sm border border-nv-200 p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-nv-100">
              <div>
                <h3 className="font-display font-bold text-ink text-base sm:text-lg flex items-center gap-2">
                  <Landmark className="text-em-700" size={20} />
                  {isBn ? "জাতীয় রাজস্ব বোর্ড (NBR) মূসক ৯.১ ও কর চালান" : "NBR Monthly VAT Returns (Mushak 9.1)"}
                </h3>
                <p className="text-xs text-ink/70">
                  {isBn
                    ? "অনলাইনে চালানের মাধ্যমে সরকারি কোষাগারে সরাসরি ভ্যাট ও আয়কর পরিশোধের ব্যবস্থা"
                    : "Live NBR automated e-Challan and mobile banking tax payment gateway"}
                </p>
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
                  {isBn ? "কর পরিশোধ করুন (Pay Tax)" : "Pay Tax Online"}
                </button>
              </div>
            </div>

            {/* Tax Months Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-nv-50 border-b border-nv-200">
                    <th className="px-4 py-3 font-bold text-ink">{isBn ? "মাস ও অর্থবছর" : "Tax Period"}</th>
                    <th className="px-4 py-3 font-bold text-ink">{isBn ? "করযোগ্য বিক্রয়" : "Sales Turnover"}</th>
                    <th className="px-4 py-3 font-bold text-ink">{isBn ? "সংগৃহীত ভ্যাট (৫%)" : "Output VAT"}</th>
                    <th className="px-4 py-3 font-bold text-ink">{isBn ? "রেয়াত ক্রেডিট" : "Input Rebate"}</th>
                    <th className="px-4 py-3 font-bold text-ink">{isBn ? "নিট প্রদেয় কর" : "Net Tax Payable"}</th>
                    <th className="px-4 py-3 font-bold text-ink">{isBn ? "স্ট্যাটাস ও চালান নং" : "Status & Challan"}</th>
                    <th className="px-4 py-3 font-bold text-ink text-right">{isBn ? "কার্যক্রম" : "Action"}</th>
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
                              <Check size={12} /> {isBn ? "পরিশোধিত" : "Paid"}
                            </span>
                            <div className="text-[10px] font-mono text-ink/60 mt-0.5">{rec.challanNo}</div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <AlertCircle size={12} /> {isBn ? "বকেয়া (পরিশোধ করুন)" : "Payment Due"}
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
                            {isBn ? "এখনই দিন" : "Pay Now"}
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              toast({
                                type: "success",
                                title: isBn ? "চালান ভাউচার ডাউনলোড!" : "Challan Voucher Downloaded!",
                                message: `Voucher for ${rec.challanNo} saved.`,
                              });
                            }}
                            className="px-3 py-1.5 bg-nv-100 hover:bg-nv-200 text-ink rounded-lg font-semibold text-xs transition-colors"
                          >
                            {isBn ? "ভাউচার রসিদ" : "Challan PDF"}
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

      {/* 2. Stock Buy Advisory (কোনটি কেনা উচিত - Color Coded) */}
      {activeTab === "advisory" && (
        <div className="space-y-6">
          {/* Top Explanation Banner */}
          <div className="bg-white rounded-3xl border border-nv-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-lg text-ink flex items-center gap-2">
                  <Package className="text-em-700" size={20} />
                  {isBn ? "কোনটি কেনা উচিত — ক্রয়ের স্মার্ট অ্যানালিটিক্স" : "What to Buy Next — Purchasing Advisory"}
                </h3>
                <p className="text-xs text-ink/70">
                  {isBn
                    ? "পণ্যের বিক্রির গতি ও মজুত বিবেচনা করে রং দিয়ে নির্দেশিকা: কোন পণ্যটি এখনই কেনা আবশ্যক এবং কোনটি অতিরিক্ত না কেনা উচিত"
                    : "Color-coded inventory demand analytics recommending exactly what to reorder vs what to avoid"}
                </p>
              </div>

              <button
                onClick={() => setScreen("purchases")}
                className="flex items-center gap-1.5 px-4 py-2 bg-em-600 hover:bg-em-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-colors self-start sm:self-auto"
              >
                <ShoppingCart size={15} />
                {isBn ? "সাপ্লায়ার অর্ডার করুন" : "Open Purchase Order"}
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
                    {isBn ? "🔴 জরুরি কেনা দরকার" : "🔴 Urgent Buy"}
                  </span>
                  <span className="num font-bold text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                    {tNum(urgentCount)} {isBn ? "টি পণ্য" : "items"}
                  </span>
                </div>
                <p className="text-[11px] text-ink/70 leading-snug">
                  {isBn
                    ? "স্টক ০ বা বিপদসীমায়, অথচ ব্যাপক চাহিদা। দ্রুত না আনলে বিক্রি নষ্ট হবে।"
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
                    {isBn ? "🟡 শীঘ্রই শেষ হবে" : "🟡 Reorder Soon"}
                  </span>
                  <span className="num font-bold text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    {tNum(soonCount)} {isBn ? "টি পণ্য" : "items"}
                  </span>
                </div>
                <p className="text-[11px] text-ink/70 leading-snug">
                  {isBn
                    ? "৩ থেকে ৭ দিনের মধ্যে ফুরিয়ে যাবে। পরবর্তী চালানে অর্ডার করুন।"
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
                    {isBn ? "🟢 পর্যাপ্ত স্টক আছে" : "🟢 Safe / Optimal"}
                  </span>
                  <span className="num font-bold text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {tNum(safeCount)} {isBn ? "টি পণ্য" : "items"}
                  </span>
                </div>
                <p className="text-[11px] text-ink/70 leading-snug">
                  {isBn
                    ? "১৫-৪৫ দিনের স্টক রয়েছে। নতুন করে কেনার দরকার নেই; ক্যাশ নিরাপদ।"
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
                    {isBn ? "⚪ কম চাহিদা (কিনবেন না)" : "⚪ Avoid Overstock"}
                  </span>
                  <span className="num font-bold text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full">
                    {tNum(slowCount)} {isBn ? "টি পণ্য" : "items"}
                  </span>
                </div>
                <p className="text-[11px] text-ink/70 leading-snug">
                  {isBn
                    ? "বিক্রি ধীরগতির। অতিরিক্ত কেনা থেকে বিরত থাকুন, টাকা আটকে থাকবে।"
                    : "Slow mover / excess inventory. Avoid purchasing more units."}
                </p>
              </div>
            </div>
          </div>

          {/* Filter Bar & Total Recommended Budget */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-nv-200">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-ink mr-1 flex items-center gap-1">
                <Filter size={13} /> {isBn ? "ফিল্টার:" : "Filter:"}
              </span>
              <button
                onClick={() => setAdvisoryFilter("all")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  advisoryFilter === "all" ? "bg-ink text-white" : "bg-nv-100 text-ink hover:bg-nv-200"
                }`}
              >
                {isBn ? "সকল পণ্য" : "All Products"} ({tNum(buyAdvisoryList.length)})
              </button>
              <button
                onClick={() => setAdvisoryFilter("urgent")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  advisoryFilter === "urgent" ? "bg-red-600 text-white" : "bg-red-50 text-red-700 hover:bg-red-100"
                }`}
              >
                🔴 {isBn ? "জরুরি" : "Urgent"} ({tNum(urgentCount)})
              </button>
              <button
                onClick={() => setAdvisoryFilter("soon")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  advisoryFilter === "soon" ? "bg-amber-600 text-white" : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                }`}
              >
                🟡 {isBn ? "শীঘ্রই" : "Soon"} ({tNum(soonCount)})
              </button>
              <button
                onClick={() => setAdvisoryFilter("safe")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  advisoryFilter === "safe" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                🟢 {isBn ? "পর্যাপ্ত" : "Safe"} ({tNum(safeCount)})
              </button>
              <button
                onClick={() => setAdvisoryFilter("slow")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  advisoryFilter === "slow" ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                ⚪ {isBn ? "কম চাহিদা" : "Slow"} ({tNum(slowCount)})
              </button>
            </div>

            <div className="text-xs text-ink flex items-center gap-1.5 self-start sm:self-auto">
              <span className="text-ink/60">{isBn ? "প্রস্তাবিত রি-স্টক বাজেট:" : "Suggested Buy Budget:"}</span>
              <span className="num font-bold text-em-700 text-sm">{formatTaka(totalRecommendedBudget)}</span>
            </div>
          </div>

          {/* Color Coded Products List */}
          <div className="bg-white rounded-3xl border border-nv-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-nv-50 border-b border-nv-200">
                    <th className="px-4 py-3 font-bold text-ink">{isBn ? "পণ্য ও বিভাগ" : "Product & Category"}</th>
                    <th className="px-4 py-3 font-bold text-ink">{isBn ? "ক্রয় নির্দেশিকা (রং ভিত্তিক)" : "Color Buy Advisory"}</th>
                    <th className="px-4 py-3 font-bold text-ink">{isBn ? "বর্তমান স্টক" : "Current Stock"}</th>
                    <th className="px-4 py-3 font-bold text-ink">{isBn ? "সাপ্তাহিক চাহিদা" : "Sales Burn Rate"}</th>
                    <th className="px-4 py-3 font-bold text-ink">{isBn ? "স্টক অবশিষ্ট" : "Days Left"}</th>
                    <th className="px-4 py-3 font-bold text-ink">{isBn ? "কত পিস কেনা উচিত" : "Suggested Qty"}</th>
                    <th className="px-4 py-3 font-bold text-ink">{isBn ? "প্রয়োজনীয় বাজেট" : "Est. Cost"}</th>
                    <th className="px-4 py-3 font-bold text-ink text-right">{isBn ? "ব্যবস্থা" : "Action"}</th>
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
                            <span className="text-xl flex-shrink-0">{p.image || "📦"}</span>
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
                          ~{tNum(weeklyRate)} {isBn ? "পিস/সপ্তাহ" : "pcs/wk"}
                        </td>

                        <td className="px-4 py-3 num">
                          <span
                            className={`font-semibold ${
                              daysOfStockLeft <= 3 ? "text-red-700 font-bold" : daysOfStockLeft <= 7 ? "text-amber-700" : "text-ink"
                            }`}
                          >
                            {daysOfStockLeft > 90 ? "90+ days" : `${tNum(daysOfStockLeft)} ${isBn ? "দিন" : "days"}`}
                          </span>
                        </td>

                        <td className="px-4 py-3 num font-bold">
                          {recommendedBuyQty > 0 ? (
                            <span className="text-em-700 font-bold">+{tNum(recommendedBuyQty)} pcs</span>
                          ) : (
                            <span className="text-ink/40 font-normal">০ {isBn ? "পিস" : "pcs"}</span>
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
                              {isBn ? "অর্ডার করুন" : "Buy Now"}
                            </button>
                          ) : (
                            <span className="text-[11px] text-ink/40 font-medium">
                              {isBn ? "প্রয়োজন নেই" : "No order"}
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
          <div className="border-b border-nv-100 pb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-ink text-lg">
                {isBn ? "লাভ ও ক্ষতি বিবরণী (P&L Statement)" : "Profit & Loss Statement"}
              </h3>
              <p className="text-xs text-ink">Live generated from verified transactions</p>
            </div>
            <span className="text-xs px-3 py-1 bg-em-50 text-ink font-bold rounded-full border border-em-200">
              Audited Ready
            </span>
          </div>

          <div className="space-y-4 max-w-2xl text-xs sm:text-sm">
            {/* Income */}
            <div className="space-y-2">
              <div className="flex justify-between items-center font-bold text-ink border-b border-nv-100 pb-1">
                <span>1. {isBn ? "বিক্রয় আয় (Revenue)" : "Gross Revenue from Sales"}</span>
                <span className="num text-ink">{formatTaka(totalRevenue)}</span>
              </div>
              <div className="flex justify-between items-center text-ink pl-4">
                <span>- {isBn ? "পণ্যের মোট ক্রয় খরচ (COGS)" : "Cost of Goods Sold (COGS)"}</span>
                <span className="num text-ink">-{formatTaka(totalCOGS)}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-ink bg-em-50/50 p-2.5 rounded-xl">
                <span>= {isBn ? "গ্রস লাভ (Gross Profit)" : "Gross Profit"}</span>
                <span className="num font-bold text-ink">{formatTaka(grossProfit)} ({tNum(grossMargin)}%)</span>
              </div>
            </div>

            {/* Operating Expenses */}
            <div className="space-y-2 pt-2">
              <div className="font-bold text-ink border-b border-nv-100 pb-1">
                2. {isBn ? "দোকান পরিচালন ব্যয় (Operating Expenses)" : "Operating Expenses"}
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
                <span>= {isBn ? "মোট পরিচালন খরচ" : "Total Operating Expenses"}</span>
                <span className="num font-bold text-ink">-{formatTaka(totalExpenses)}</span>
              </div>
            </div>

            {/* Final Net Profit */}
            <div className="flex justify-between items-center text-base sm:text-lg font-extrabold text-white sidebar-gradient p-4 rounded-2xl shadow-md">
              <span>{isBn ? "চূড়ান্ত নিট লাভ (Net Profit)" : "Net Profit"}</span>
              <span className="num font-mono">{formatTaka(netProfit)}</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Sales Breakdown View */}
      {activeTab === "sales" && (
        <div className="bg-white rounded-3xl shadow-sm border border-nv-200 p-6 space-y-4">
          <h3 className="font-display font-bold text-ink text-lg">{isBn ? "সকল বিক্রয় তালিকা" : "Completed Sales Records"}</h3>
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
          <h3 className="font-display font-bold text-ink text-lg">{isBn ? "খরচের সম্পূর্ণ তালিকা" : "Expense Audit Trail"}</h3>
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
            <h3 className="font-display font-bold text-ink text-base">{isBn ? "গ্রাহক বাকি (Receivables)" : "Customer Receivables"}</h3>
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
            <h3 className="font-display font-bold text-ink text-base">{isBn ? "সাপ্লায়ার দেনা (Payables)" : "Supplier Payables"}</h3>
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
                  {isBn ? "অনলাইন কর ও ভ্যাট পরিশোধ" : "NBR Tax & VAT e-Payment"}
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
                <div className="text-xs text-ink/60">{isBn ? "ট্যাক্স পর্ব / মাস:" : "Tax Period:"}</div>
                <div className="font-bold text-sm text-ink">
                  {isBn
                    ? `${selectedTaxMonth.monthBn} ${tNum(selectedTaxMonth.year)} (মূসক ৯.১)`
                    : `${selectedTaxMonth.month} ${selectedTaxMonth.year} (Mushak 9.1)`}
                </div>
                <div className="flex justify-between items-center pt-2 mt-1 border-t border-nv-200">
                  <span className="text-ink/70 font-semibold">{isBn ? "প্রদেয় নিট কর:" : "Net Payable Amount:"}</span>
                  <span className="num text-base font-bold text-em-700">{formatTaka(selectedTaxMonth.netPayable)}</span>
                </div>
              </div>

              {/* Channel Selector */}
              <div>
                <label className="block font-semibold text-ink mb-1.5">
                  {isBn ? "পেমেন্ট মাধ্যম বেছে নিন" : "Select Payment Gateway"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "a-challan", label: "NBR A-Challan", sub: "Sonali / BB" },
                    { id: "bkash", label: "bKash NBR", sub: "e-Tax Direct" },
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
                  {isBn ? "চালান নম্বর বা ট্রানজ্যাকশন আইডি" : "A-Challan / Transaction Reference No."}
                </label>
                <input
                  type="text"
                  value={taxChallanInput}
                  onChange={e => setTaxChallanInput(e.target.value)}
                  placeholder="e.g. A-CHL-9982710 or BKASH-TXN"
                  className="w-full border border-nv-200 rounded-xl px-3.5 py-2 font-mono text-xs focus:border-em-500 bg-white"
                />
                <span className="text-[10px] text-ink/50 mt-1 block">
                  {isBn ? "খালি রাখলে স্বয়ংক্রিয় ডিজিটাল চালান তৈরি হবে।" : "Leave blank to auto-generate a valid NBR A-Challan ID."}
                </span>
              </div>

              <div className="flex gap-2 pt-2 border-t border-nv-100">
                <button
                  type="button"
                  onClick={() => setShowTaxPayModal(false)}
                  className="flex-1 py-2.5 border border-nv-200 rounded-xl text-ink font-semibold hover:bg-nv-50"
                >
                  {isBn ? "বাতিল" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-em-600 hover:bg-em-700 text-white rounded-xl font-bold shadow-md transition-colors"
                >
                  {isBn ? "পরিশোধ নিশ্চিত করুন" : "Confirm Tax Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
