import { useState, useEffect } from "react";
import { ArrowRightLeft, Plus, X, Wallet, CheckCircle, TrendingUp, TrendingDown, ArrowLeft, Receipt, ChevronRight, Eye, Calendar, User, FileText, CheckCircle2, DollarSign, Sparkles } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useApp, Sale } from "../context/AppContext";
import { toast } from "../components/Toast";

interface CashAccountsProps {
  lang: "en" | "bn";
  onBack?: () => void;
  setScreen?: (screen: string) => void;
}

const incomeCategories = [
  { id: "Sales", label: "Product Sale", labelBn: "Nnoɔma Tɔn" },
  { id: "Service", label: "Service / Repair Fee", labelBn: "Ɔsom / Siesie Ka" },
  { id: "Commission", label: "Commission & Brokerage", labelBn: "Kɔmihyɛn & Akatua" },
  { id: "Delivery", label: "Delivery Charge", labelBn: "Delivery Ka" },
  { id: "Scrap", label: "Scrap / Waste Sales", labelBn: "Nnoɔma Dedaw Tɔn" },
  { id: "Other", label: "Other Business Income", labelBn: "Dukan Sika Foforɔ a Ɛba Mu" },
];

export default function CashAccounts({ lang, onBack, setScreen }: CashAccountsProps) {
  const { accounts, transactions, sales, setCurrentInvoice, addCashDeposit, transferCash, tNum, formatTaka, lastSaleIncome } = useApp();
  const isBn = lang === "bn";

  const [showModal, setShowModal] = useState<"add" | "transfer" | "income" | null>(null);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [activeTab, setActiveTab] = useState<"income" | "all">("income");

  // Income entry state
  const [incomeCategory, setIncomeCategory] = useState("Sales");
  const [incomeSource, setIncomeSource] = useState("");
  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomeAccountId, setIncomeAccountId] = useState(accounts[0]?.id || "cash");
  const [incomeNote, setIncomeNote] = useState("");

  // Flow structure auto-fill: When income modal opens, auto-fill from latest POS sale
  const openIncomeModal = () => {
    if (lastSaleIncome && lastSaleIncome > 0 && !incomeAmount) {
      setIncomeAmount(lastSaleIncome.toString());
      setIncomeSource(isBn ? "POS Nkitahodie Tɔn" : "POS Sale Income");
      setIncomeCategory("Sales");
    }
    setShowModal("income");
  };

  useEffect(() => {
    if (showModal === "income" && lastSaleIncome && lastSaleIncome > 0 && !incomeAmount) {
      setIncomeAmount(lastSaleIncome.toString());
      if (!incomeSource) {
        setIncomeSource(isBn ? "POS Nkitahodie Tɔn" : "POS Sale Income");
      }
    }
  }, [showModal, lastSaleIncome, isBn]);

  // Add deposit state
  const [depositAccId, setDepositAccId] = useState(accounts[0]?.id || "cash");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositNote, setDepositNote] = useState("");

  // Transfer state
  const [transferFromId, setTransferFromId] = useState("cash");
  const [transferToId, setTransferToId] = useState("bkash");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferNote, setTransferNote] = useState("");

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const totalIn = accounts.reduce((s, a) => s + a.in, 0);
  const totalOut = accounts.reduce((s, a) => s + a.out, 0);

  const flowData = [
    { day: "Mon", dayBn: "Dwo", in: 42000, out: 18000 },
    { day: "Tue", dayBn: "Bena", in: 38000, out: 22000 },
    { day: "Wed", dayBn: "Wuku", in: 55000, out: 15000 },
    { day: "Thu", dayBn: "Yawo", in: 31000, out: 28000 },
    { day: "Fri", dayBn: "Efi", in: totalIn, out: totalOut },
  ];

  const handleIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incomeAmount || Number(incomeAmount) <= 0) return;

    const catObj = incomeCategories.find(c => c.id === incomeCategory) || incomeCategories[0];
    const catName = isBn ? catObj.labelBn : catObj.label;
    const payerName = incomeSource.trim() || (isBn ? "Otɔfoɔ a Ɔba Dukan Mu" : "Walk-in Customer");
    const fullNote = `${catName} - ${payerName}${incomeNote ? ` (${incomeNote})` : ""}`;

    addCashDeposit(incomeAccountId, Number(incomeAmount), fullNote);
    setShowModal(null);
    setIncomeAmount("");
    setIncomeSource("");
    setIncomeNote("");
    toast({
      type: "success",
      title: isBn ? "Sika Kyerɛw No Akɔ Pɛpɛɛpɛ!" : "Income Entry Recorded!",
      message: `${payerName}: ₵ ${Number(incomeAmount).toLocaleString()}`,
    });
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || Number(depositAmount) <= 0) return;

    addCashDeposit(depositAccId, Number(depositAmount), depositNote);
    setShowModal(null);
    setDepositAmount("");
    setDepositNote("");
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferAmount || Number(transferAmount) <= 0) return;
    if (transferFromId === transferToId) {
      toast({
        type: "warning",
        title: isBn ? "Paw Akawnt Foforɔ" : "Select Different Accounts",
      });
      return;
    }

    transferCash(transferFromId, transferToId, Number(transferAmount), transferNote);
    setShowModal(null);
    setTransferAmount("");
    setTransferNote("");
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-24 lg:pb-8">
      {/* Header — the back arrow and the button group are real flex
          siblings on the same row (not overlaid), so neither can ever
          cover the other no matter how narrow the screen gets. */}
      <div className="flex items-start gap-3 sm:gap-4">
        {onBack && (
          <button
            onClick={onBack}
            aria-label={isBn ? "San Kɔ Akyi" : "Go back"}
            className="lg:hidden flex-shrink-0 w-9 h-9 rounded-full bg-nv-100 flex items-center justify-center text-ink active:bg-nv-200 self-start"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div className="ml-auto flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={openIncomeModal}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 bg-em-600 hover:bg-em-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-2xs transition-fast"
          >
            <Receipt size={14} /> {isBn ? "+ Sika Foforɔ Kyerɛw" : "+ Income Entry"}
          </button>
          <button
            onClick={() => setShowModal("transfer")}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 border border-nv-200 rounded-xl text-xs sm:text-sm font-semibold text-ink bg-white hover:bg-nv-50 transition-fast shadow-2xs"
          >
            <ArrowRightLeft size={14} /> {isBn ? "Mane Sika" : "Transfer"}
          </button>
          <button
            onClick={() => setShowModal("add")}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 bg-nv-100 hover:bg-nv-200 text-ink rounded-xl text-xs sm:text-sm font-semibold border border-nv-200 transition-fast"
          >
            <Plus size={16} /> {isBn ? "Hyɛ Sika Mu" : "Deposit"}
          </button>
        </div>
      </div>

      {/* Hero Balance Card */}
      <div className="bg-em-50 border border-em-100 rounded-3xl p-6 text-ink shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-ink text-xs font-semibold uppercase tracking-wider mb-1">{isBn ? "Akawnt Sika Nyinaa Dodow" : "Total Combined Balance"}</p>
            <div className="num text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">{formatTaka(totalBalance)}</div>
            <p className="text-ink text-xs mt-1">{tNum(accounts.length)} {isBn ? "akawnt a wɔhwɛ so seesei" : "active accounts monitored"}</p>
          </div>

          <div className="flex items-center gap-6 sm:gap-8 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-em-200 md:pl-8">
            <div>
              <div className="text-xs text-ink">{isBn ? "Sika Pɔtee Nyinaa a Aba Mu" : "Total Cash In"}</div>
              <div className="num font-bold text-base sm:text-lg text-ink">{formatTaka(totalIn)}</div>
            </div>

            <div>
              <div className="text-xs text-ink">{isBn ? "Sika Pɔtee Nyinaa a Afiri Mu" : "Total Cash Out"}</div>
              <div className="num font-bold text-base sm:text-lg text-ink">{formatTaka(totalOut)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Accounts List Grid */}
      <div>
        <h3 className="font-display font-bold text-ink text-sm mb-3">{isBn ? "Akawnt Sika Dodow" : "Account Balances"}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {accounts.map(acc => (
            <div
              key={acc.id}
              className="bg-white rounded-2xl p-4 border border-nv-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-fast"
            >
              <div>
                <div className="text-xs font-semibold text-ink">{isBn ? acc.nameBn : acc.name}</div>
                <div className="num text-xl font-bold text-ink mt-0.5">{formatTaka(acc.balance)}</div>
              </div>

              <div className="mt-3 pt-2 border-t border-nv-100 flex items-center justify-between text-[10px] text-ink">
                <span className="text-ink font-semibold">+{formatTaka(acc.in)}</span>
                <span className="text-ink font-semibold">-{formatTaka(acc.out)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions & Cash Flow Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Cash Flow Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-nv-200 p-5 flex flex-col justify-between">
          <h3 className="font-display font-bold text-ink text-sm mb-3">
            {isBn ? "Dapɛn Biara Sika Akɔneaba" : "Weekly Cash Flow"}
          </h3>

          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={flowData}>
                <XAxis dataKey={isBn ? "dayBn" : "day"} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} tickFormatter={(v) => tNum(v)} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: any) => [formatTaka(Number(v)), ""]} />
                <Bar dataKey="in" name="Cash In" fill="#16A34A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="out" name="Cash Out" fill="#FCA5A5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs font-semibold mt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-em-600" />
              <span className="text-ink">{isBn ? "Sika a Aba Mu" : "Cash In"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#FCA5A5]" />
              <span className="text-ink">{isBn ? "Ka (Cash Out)" : "Cash Out"}</span>
            </div>
          </div>
        </div>

        {/* Transactions & Income Table / Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-nv-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-nv-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-bold text-ink text-sm">
                {isBn ? "Sika Nsesaeɛ & Kyerɛw Nhoma" : "Transactions & Income Register"}
              </h3>
              <p className="text-xs text-ink/60 mt-0.5">
                {isBn ? "Da biara sika kyerɛw ne akawnt nsesaeɛ" : "Daily cash entries and account transactions"}
              </p>
            </div>

            <div className="inline-flex items-center p-1 bg-nv-100 border border-nv-200 rounded-xl self-start sm:self-auto">
              <button
                onClick={() => setActiveTab("income")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "income"
                    ? "bg-white text-ink shadow-xs"
                    : "text-ink/70 hover:text-ink"
                }`}
              >
                <Receipt size={14} />
                <span>{isBn ? "Sika Kyerɛw Nyinaa" : "Income Entries"}</span>
                <span className="num ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-em-100 text-em-800 font-bold">
                  {tNum(sales.length)}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "all"
                    ? "bg-white text-ink shadow-xs"
                    : "text-ink/70 hover:text-ink"
                }`}
              >
                <ArrowRightLeft size={14} />
                <span>{isBn ? "Sika Kyerɛw Nhoma" : "Cash Ledger"}</span>
                <span className="num ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-nv-200 text-ink font-bold">
                  {tNum(transactions.length)}
                </span>
              </button>
            </div>
          </div>

          {/* Tab 1: Income Entries List */}
          {activeTab === "income" ? (
            <div className="divide-y divide-nv-100 flex-1 overflow-y-auto max-h-[420px]">
              {sales.length === 0 ? (
                <div className="p-8 text-center text-ink/60 text-xs">
                  {isBn ? "Sika kyerɛw biara nni hɔ" : "No income entries found"}
                </div>
              ) : (
                sales.map(sale => (
                  <div
                    key={sale.id}
                    className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-nv-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-nv-100 border border-nv-200/80 flex items-center justify-center text-ink flex-shrink-0">
                        <Receipt size={19} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs sm:text-sm text-ink">
                            {isBn ? "Sika Kyerɛw" : "Income entry"}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-em-50 text-em-700 border border-em-200/70 font-semibold uppercase">
                            {sale.paymentMethod}
                          </span>
                          <span className="text-[11px] text-ink/50 font-mono hidden md:inline">
                            #{sale.invoiceNo}
                          </span>
                        </div>
                        <div className="text-xs text-ink/70 mt-0.5 truncate">
                          {tNum(sale.time)} · {sale.customer}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                      <div className="text-right">
                        <div className="num font-bold text-ink text-sm sm:text-base">
                          +{formatTaka(sale.grandTotal)}
                        </div>
                        <div className="text-[10px] text-ink/60">
                          {tNum(sale.date)}
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedSale(sale)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-ink hover:text-ink px-2.5 py-1.5 rounded-lg border border-nv-200 hover:bg-nv-100 active:bg-nv-200 transition-colors"
                      >
                        <span>{isBn ? "Hwɛ Ne Nyinaa" : "See more"}</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Tab 2: Manual Cash & Transfer Transactions */
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-nv-50 border-b border-nv-200">
                    <th className="px-4 py-3 font-bold text-ink whitespace-nowrap">{isBn ? "Nkyerɛkyerɛmu" : "Description"}</th>
                    <th className="px-4 py-3 font-bold text-ink whitespace-nowrap">{isBn ? "Akawnt" : "Account"}</th>
                    <th className="px-4 py-3 font-bold text-ink whitespace-nowrap">{isBn ? "Sika Dodoɔ" : "Amount"}</th>
                    <th className="px-4 py-3 font-bold text-ink whitespace-nowrap">{isBn ? "Bere" : "Time"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-nv-100">
                  {transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-nv-50 transition-fast">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold
                            ${tx.type === "in" ? "bg-em-100 text-ink" : tx.type === "out" ? "bg-red-100 text-ink" : "bg-nv-100 text-ink"}`}>
                            {tx.type === "in" ? "+" : tx.type === "out" ? "-" : "⇄"}
                          </div>
                          <span className="font-semibold text-ink">{isBn ? tx.descBn || tx.desc : tx.desc}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-ink">{tx.account}</td>
                      <td className="px-4 py-3">
                        <span className="num font-bold text-ink">
                          {tx.type === "in" ? "+" : tx.type === "out" ? "-" : ""}{formatTaka(tx.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-ink">{tNum(tx.time)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* New Income Entry Modal */}
      {showModal === "income" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-nv-200 p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-nv-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-em-100 text-em-700 flex items-center justify-center">
                  <Receipt size={17} />
                </div>
                <div>
                  <h3 className="font-bold text-ink text-base">{isBn ? "Sika Foforɔ a Wɔakyerɛw" : "New Income Entry"}</h3>
                  <p className="text-[11px] text-ink/60">{isBn ? "Kyerɛw dukan sika a ɛba mu ne kasaa" : "Record business revenue & cash receipts"}</p>
                </div>
              </div>
              <button onClick={() => setShowModal(null)} className="text-ink/60 hover:text-ink">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleIncomeSubmit} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-ink mb-1">{isBn ? "Sika Kyerɛw Kuw" : "Income Category"} *</label>
                <select
                  value={incomeCategory}
                  onChange={e => setIncomeCategory(e.target.value)}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 bg-white focus:border-em-500 font-medium text-ink"
                >
                  {incomeCategories.map(c => (
                    <option key={c.id} value={c.id}>
                      {isBn ? c.labelBn : c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">{isBn ? "Otɔfoɔ / Beaeɛ" : "Customer / Source"}</label>
                <input
                  type="text"
                  value={incomeSource}
                  onChange={e => setIncomeSource(e.target.value)}
                  placeholder={isBn ? "e.g. Kwame Mensah / Showroom Cash" : "e.g. Kwame Mensah / Showroom Cash"}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 text-ink focus:border-em-500"
                />
              </div>

              {/* Auto-fill banner from POS sale flowchart */}
              {lastSaleIncome && (
                <div className="flex items-center justify-between p-2.5 bg-em-50 border border-em-200 rounded-xl text-xs text-em-900">
                  <div className="flex items-center gap-1.5 min-w-0 font-medium">
                    <Sparkles size={14} className="text-em-700 flex-shrink-0" />
                    <span className="truncate">
                      {isBn
                        ? `POS Tɔn Nkitahodie Sika: ₵${tNum(lastSaleIncome)}`
                        : `Latest POS Sale Income: ₵${lastSaleIncome}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIncomeAmount(lastSaleIncome.toString());
                      if (!incomeSource) setIncomeSource(isBn ? "POS Nkitahodie Tɔn" : "POS Sale Income");
                    }}
                    className="text-[11px] font-bold text-em-800 bg-em-100 hover:bg-em-200 px-2 py-0.5 rounded-md cursor-pointer transition-colors flex-shrink-0"
                  >
                    {isBn ? "Fa Hyɛ Mu" : "Auto-fill"}
                  </button>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-medium text-ink">{isBn ? "Sika Dodoɔ (₵)" : "Income Amount (₵)"} *</label>
                  {lastSaleIncome && Number(incomeAmount) === lastSaleIncome && (
                    <span className="text-[10px] bg-em-100 text-em-800 font-bold px-1.5 py-0.5 rounded">
                      ✓ {isBn ? "Auto-filled" : "Auto-filled from POS"}
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  required
                  value={incomeAmount}
                  onChange={e => setIncomeAmount(e.target.value)}
                  placeholder="0"
                  className="num w-full border border-nv-200 rounded-xl px-3 py-2 text-base font-bold text-ink focus:border-em-500"
                />
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">{isBn ? "Fa Sika Gu Akawnt Mu" : "Deposit To Account"} *</label>
                <select
                  value={incomeAccountId}
                  onChange={e => setIncomeAccountId(e.target.value)}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 bg-white focus:border-em-500 font-medium text-ink"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatTaka(a.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">{isBn ? "Nsɛm / Nkyerɛkyerɛmu" : "Note / Remarks"}</label>
                <input
                  type="text"
                  value={incomeNote}
                  onChange={e => setIncomeNote(e.target.value)}
                  placeholder={isBn ? "Nsɛm foforɔ biara a wopɛ sɛ woka..." : "Any additional notes..."}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(null)}
                  className="flex-1 py-2.5 border border-nv-200 rounded-xl font-semibold text-ink hover:bg-nv-50"
                >
                  {isBn ? "Gyae (Cancel)" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-em-600 hover:bg-em-700 text-white rounded-xl font-bold shadow-md transition-fast"
                >
                  {isBn ? "Kora Sika Kyerɛw No So" : "Save Income Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Sale / Income Entry Details Modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-nv-200 p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-nv-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-em-50 border border-em-200 text-em-700 flex items-center justify-center">
                  <Receipt size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-ink text-base">{isBn ? "Sika Kasaa Ho Nsɛm" : "Income Receipt Details"}</h3>
                  <p className="text-[11px] text-ink/60 font-mono">#{selectedSale.invoiceNo} • {tNum(selectedSale.date)} {tNum(selectedSale.time)}</p>
                </div>
              </div>
              <button onClick={() => setSelectedSale(null)} className="text-ink/60 hover:text-ink">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              {/* Customer & Payment details */}
              <div className="p-3 bg-nv-50 rounded-xl border border-nv-200/70 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-ink/70">{isBn ? "Otɔfoɔ:" : "Customer:"}</span>
                  <span className="font-bold text-ink">{selectedSale.customer}</span>
                </div>
                {selectedSale.customerPhone && (
                  <div className="flex justify-between">
                    <span className="text-ink/70">{isBn ? "Telefon:" : "Phone:"}</span>
                    <span className="font-mono text-ink">{selectedSale.customerPhone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-ink/70">{isBn ? "Akatua Kwan:" : "Payment Method:"}</span>
                  <span className="font-semibold text-ink uppercase">{selectedSale.paymentMethod}</span>
                </div>
              </div>

              {/* Items breakdown */}
              <div>
                <div className="font-semibold text-ink mb-1.5">{isBn ? "Nnoɔma a Wɔatɔ:" : "Purchased Items:"}</div>
                <div className="divide-y divide-nv-100 border border-nv-200 rounded-xl overflow-hidden">
                  {selectedSale.items.map((item, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-medium text-ink">{isBn ? item.nameBn : item.name}</div>
                        <div className="text-[10px] text-ink/60">{formatTaka(item.price)} × {tNum(item.qty)}</div>
                      </div>
                      <div className="num font-bold text-ink">
                        {formatTaka(item.price * item.qty)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary table */}
              <div className="space-y-1.5 pt-1 border-t border-nv-100 text-xs">
                <div className="flex justify-between text-ink/70">
                  <span>{isBn ? "Nyinaa Nketewa:" : "Subtotal:"}</span>
                  <span className="num font-semibold">{formatTaka(selectedSale.subtotal)}</span>
                </div>
                {selectedSale.discount > 0 && (
                  <div className="flex justify-between text-ink/70">
                    <span>{isBn ? "Boɔ So Teɛ:" : "Discount:"}</span>
                    <span className="num font-semibold">-{formatTaka(selectedSale.discount)}</span>
                  </div>
                )}
                {selectedSale.vat > 0 && (
                  <div className="flex justify-between text-ink/70">
                    <span>{isBn ? "GRA VAT:" : "VAT:"}</span>
                    <span className="num font-semibold">+{formatTaka(selectedSale.vat)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-ink pt-2 border-t border-nv-200">
                  <span>{isBn ? "Nyinaa Ne Nyinaa:" : "Grand Total:"}</span>
                  <span className="num text-base font-extrabold text-em-700">+{formatTaka(selectedSale.grandTotal)}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSale(null)}
                  className="flex-1 py-2.5 border border-nv-200 rounded-xl font-semibold text-ink hover:bg-nv-50"
                >
                  {isBn ? "To Mu" : "Close"}
                </button>
                {setScreen && (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentInvoice(selectedSale);
                      setSelectedSale(null);
                      setScreen("invoice");
                    }}
                    className="flex-1 py-2.5 bg-ink text-white rounded-xl font-bold hover:bg-ink/90 flex items-center justify-center gap-1.5"
                  >
                    <FileText size={15} />
                    <span>{isBn ? "Hwɛ Invois No" : "View Invoice"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showModal === "add" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-nv-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-nv-100">
              <h3 className="font-bold text-ink text-base">{isBn ? "Fa Sika Gu Mu" : "Add Cash / Deposit"}</h3>
              <button onClick={() => setShowModal(null)} className="text-ink hover:text-ink">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-ink mb-1">{isBn ? "Akawnt" : "Account"} *</label>
                <select
                  value={depositAccId}
                  onChange={e => setDepositAccId(e.target.value)}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 bg-white focus:border-em-500"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatTaka(a.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">{isBn ? "Sika Dodoɔ a Wode Regu Mu (₵)" : "Deposit Amount (₵)"} *</label>
                <input
                  type="number"
                  required
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                  placeholder="0"
                  className="num w-full border border-nv-200 rounded-xl px-3 py-2 text-base font-bold text-ink focus:border-em-500"
                />
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">{isBn ? "Nsɛm / Beaeɛ" : "Note / Source"}</label>
                <input
                  type="text"
                  value={depositNote}
                  onChange={e => setDepositNote(e.target.value)}
                  placeholder={isBn ? "e.g. Sikakorabea sika a wɔde bae" : "e.g. Bank cash injection"}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(null)}
                  className="flex-1 py-2.5 border border-nv-200 rounded-xl font-semibold text-ink hover:bg-nv-50"
                >
                  {isBn ? "Gyae (Cancel)" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-em-700 hover:bg-em-800 text-white rounded-xl font-bold shadow-md"
                >
                  {isBn ? "Si Sika a Wode Regu Mu So Dua" : "Confirm Deposit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showModal === "transfer" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-nv-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-nv-100">
              <h3 className="font-bold text-ink text-base">{isBn ? "Mane Sika (Transfer)" : "Transfer Funds"}</h3>
              <button onClick={() => setShowModal(null)} className="text-ink hover:text-ink">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-ink mb-1">{isBn ? "Firi Akawnt" : "From Account"} *</label>
                <select
                  value={transferFromId}
                  onChange={e => setTransferFromId(e.target.value)}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 bg-white focus:border-em-500"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatTaka(a.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">{isBn ? "Kɔ Akawnt" : "To Account"} *</label>
                <select
                  value={transferToId}
                  onChange={e => setTransferToId(e.target.value)}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 bg-white focus:border-em-500"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatTaka(a.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">{isBn ? "Sika Dodoɔ a Wode Rekɔ (₵)" : "Transfer Amount (₵)"} *</label>
                <input
                  type="number"
                  required
                  value={transferAmount}
                  onChange={e => setTransferAmount(e.target.value)}
                  placeholder="0"
                  className="num w-full border border-nv-200 rounded-xl px-3 py-2 text-base font-bold text-ink focus:border-em-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(null)}
                  className="flex-1 py-2.5 border border-nv-200 rounded-xl font-semibold text-ink hover:bg-nv-50"
                >
                  {isBn ? "Gyae (Cancel)" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-nv-600 hover:bg-nv-700 text-white rounded-xl font-bold shadow-md"
                >
                  {isBn ? "Mane Sika No Seesei" : "Execute Transfer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
