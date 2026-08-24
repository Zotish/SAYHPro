import { useState } from "react";
import { Banknote, Smartphone, Building, ArrowUpRight, ArrowDownRight, ArrowRightLeft, Plus, X, Wallet, CheckCircle, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useApp } from "../context/AppContext";
import { toast } from "../components/Toast";

interface CashAccountsProps {
  lang: "en" | "bn";
}

const getAccountIcon = (id: string) => {
  if (id === "cash") return Banknote;
  if (id === "bank") return Building;
  return Smartphone;
};

export default function CashAccounts({ lang }: CashAccountsProps) {
  const { accounts, transactions, addCashDeposit, transferCash, tNum, formatTaka } = useApp();
  const isBn = lang === "bn";

  const [showModal, setShowModal] = useState<"add" | "transfer" | null>(null);

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
    { day: "Mon", dayBn: "সোম", in: 42000, out: 18000 },
    { day: "Tue", dayBn: "মঙ্গল", in: 38000, out: 22000 },
    { day: "Wed", dayBn: "বুধ", in: 55000, out: 15000 },
    { day: "Thu", dayBn: "বৃহঃ", in: 31000, out: 28000 },
    { day: "Fri", dayBn: "শুক্র", in: totalIn, out: totalOut },
  ];

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
        title: isBn ? "ভিন্ন অ্যাকাউন্ট নির্বাচন করুন" : "Select Different Accounts",
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-nv-900">{isBn ? "ক্যাশ ও হিসাব ব্যবস্থাপনা" : "Cash & Accounts"}</h1>
          <p className="text-nv-500 text-xs sm:text-sm mt-0.5">{isBn ? "সকল অ্যাকাউন্ট ও ট্রানজাকশন লেজার" : "Account balances and financial flow"}</p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowModal("transfer")}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-nv-200 rounded-xl text-xs sm:text-sm font-semibold text-nv-700 bg-white hover:bg-nv-50 transition-fast shadow-2xs"
          >
            <ArrowRightLeft size={14} /> {isBn ? "ট্রান্সফার" : "Transfer"}
          </button>
          <button
            onClick={() => setShowModal("add")}
            className="flex items-center gap-1.5 px-4 py-2 bg-em-700 hover:bg-em-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-fast"
          >
            <Plus size={16} /> {isBn ? "ক্যাশ জমা" : "Add Cash / Deposit"}
          </button>
        </div>
      </div>

      {/* Hero Balance Card */}
      <div className="sidebar-gradient rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-em-200 text-xs font-semibold uppercase tracking-wider mb-1">{isBn ? "মোট বর্তমান ব্যালেন্স" : "Total Combined Balance"}</p>
            <div className="num text-3xl sm:text-4xl font-extrabold tracking-tight">{formatTaka(totalBalance)}</div>
            <p className="text-white/60 text-xs mt-1">{tNum(accounts.length)} active accounts monitored</p>
          </div>

          <div className="flex items-center gap-6 sm:gap-8 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-white/10 md:pl-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-em-500/20 border border-em-400/30 flex items-center justify-center">
                <ArrowUpRight size={18} className="text-em-300 stroke-[2.5]" />
              </div>
              <div>
                <div className="text-xs text-em-200">{isBn ? "আজকের মোট জমা (In)" : "Total Cash In"}</div>
                <div className="num font-bold text-base sm:text-lg">{formatTaka(totalIn)}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-400/30 flex items-center justify-center">
                <ArrowDownRight size={18} className="text-red-300 stroke-[2.5]" />
              </div>
              <div>
                <div className="text-xs text-em-200">{isBn ? "আজকের মোট খরচ (Out)" : "Total Cash Out"}</div>
                <div className="num font-bold text-base sm:text-lg">{formatTaka(totalOut)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accounts List Grid */}
      <div>
        <h3 className="font-display font-bold text-nv-900 text-sm mb-3">{isBn ? "অ্যাকাউন্ট ব্যালেন্স" : "Account Balances"}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {accounts.map(acc => {
            const Icon = getAccountIcon(acc.id);
            return (
              <div
                key={acc.id}
                className="bg-white rounded-2xl p-4 border border-nv-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-fast"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-2xs" style={{ background: acc.bg, color: acc.color }}>
                    <Icon size={18} />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-nv-100 text-nv-600 font-mono">
                    {acc.id.toUpperCase()}
                  </span>
                </div>

                <div>
                  <div className="text-xs font-semibold text-nv-500">{isBn ? acc.nameBn : acc.name}</div>
                  <div className="num text-xl font-bold text-nv-900 mt-0.5">{formatTaka(acc.balance)}</div>
                </div>

                <div className="mt-3 pt-2 border-t border-nv-100 flex items-center justify-between text-[10px] text-nv-400">
                  <span className="text-em-700 font-semibold">+{formatTaka(acc.in)}</span>
                  <span className="text-red-600 font-semibold">-{formatTaka(acc.out)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transactions & Cash Flow Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Cash Flow Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-nv-200 p-5 flex flex-col justify-between">
          <h3 className="font-display font-bold text-nv-900 text-sm mb-3">
            {isBn ? "ক্যাশ ফ্লো (আয় বনাম ব্যয়)" : "Weekly Cash Flow"}
          </h3>

          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={flowData}>
                <XAxis dataKey={isBn ? "dayBn" : "day"} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} tickFormatter={(v) => tNum(v)} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: any) => [formatTaka(Number(v)), ""]} />
                <Bar dataKey="in" name="Cash In" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="out" name="Cash Out" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs font-semibold mt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-em-600" />
              <span className="text-nv-700">{isBn ? "জমা (Cash In)" : "Cash In"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-500" />
              <span className="text-nv-700">{isBn ? "খরচ (Cash Out)" : "Cash Out"}</span>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-nv-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-nv-100">
            <h3 className="font-display font-bold text-nv-900 text-sm">
              {isBn ? "সাম্প্রতিক ক্যাশ ট্রানজাকশন" : "Recent Account Transactions"}
            </h3>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-nv-50 border-b border-nv-200">
                  <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "বিবরণ" : "Description"}</th>
                  <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "অ্যাকাউন্ট" : "Account"}</th>
                  <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "পরিমাণ" : "Amount"}</th>
                  <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "সময়" : "Time"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nv-100">
                {transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-nv-50 transition-fast">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold
                          ${tx.type === "in" ? "bg-em-100 text-em-700" : tx.type === "out" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                          {tx.type === "in" ? "+" : tx.type === "out" ? "-" : "⇄"}
                        </div>
                        <span className="font-semibold text-nv-900">{isBn ? tx.descBn || tx.desc : tx.desc}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-nv-600">{tx.account}</td>
                    <td className="px-4 py-3">
                      <span className={`num font-bold ${tx.type === "in" ? "text-em-700" : tx.type === "out" ? "text-red-600" : "text-blue-700"}`}>
                        {tx.type === "in" ? "+" : tx.type === "out" ? "-" : ""}{formatTaka(tx.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-nv-400">{tNum(tx.time)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {showModal === "add" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-nv-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-nv-100">
              <h3 className="font-bold text-nv-900 text-base">{isBn ? "ক্যাশ জমা করুন" : "Add Cash / Deposit"}</h3>
              <button onClick={() => setShowModal(null)} className="text-nv-400 hover:text-nv-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-nv-700 mb-1">{isBn ? "অ্যাকাউন্ট বেছে নিন" : "Account"} *</label>
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
                <label className="block font-medium text-nv-700 mb-1">{isBn ? "জমার পরিমাণ" : "Deposit Amount"} (৳) *</label>
                <input
                  type="number"
                  required
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                  placeholder="0"
                  className="num w-full border border-nv-200 rounded-xl px-3 py-2 text-base font-bold text-em-700 focus:border-em-500"
                />
              </div>

              <div>
                <label className="block font-medium text-nv-700 mb-1">{isBn ? "বিবরণ / নোট" : "Note / Source"}</label>
                <input
                  type="text"
                  value={depositNote}
                  onChange={e => setDepositNote(e.target.value)}
                  placeholder={isBn ? "যেমন: ব্যাংকে নগদ জমা বা পার্সোনাল ক্যাশ..." : "e.g. Bank cash injection"}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(null)}
                  className="flex-1 py-2.5 border border-nv-200 rounded-xl font-semibold text-nv-700 hover:bg-nv-50"
                >
                  {isBn ? "বাতিল" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-em-700 hover:bg-em-800 text-white rounded-xl font-bold shadow-md"
                >
                  {isBn ? "জমা নিশ্চিত করুন" : "Confirm Deposit"}
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
              <h3 className="font-bold text-nv-900 text-base">{isBn ? "টাকা ট্রান্সফার করুন" : "Transfer Funds"}</h3>
              <button onClick={() => setShowModal(null)} className="text-nv-400 hover:text-nv-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-nv-700 mb-1">{isBn ? "উৎস অ্যাকাউন্ট (From)" : "From Account"} *</label>
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
                <label className="block font-medium text-nv-700 mb-1">{isBn ? "গন্তব্য অ্যাকাউন্ট (To)" : "To Account"} *</label>
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
                <label className="block font-medium text-nv-700 mb-1">{isBn ? "ট্রান্সফার পরিমাণ" : "Transfer Amount"} (৳) *</label>
                <input
                  type="number"
                  required
                  value={transferAmount}
                  onChange={e => setTransferAmount(e.target.value)}
                  placeholder="0"
                  className="num w-full border border-nv-200 rounded-xl px-3 py-2 text-base font-bold text-blue-600 focus:border-em-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(null)}
                  className="flex-1 py-2.5 border border-nv-200 rounded-xl font-semibold text-nv-700 hover:bg-nv-50"
                >
                  {isBn ? "বাতিল" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md"
                >
                  {isBn ? "ট্রান্সফার সম্পন্ন করুন" : "Execute Transfer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
