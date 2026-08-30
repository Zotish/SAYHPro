import { useState } from "react";
import { ArrowRightLeft, Plus, X, Wallet, CheckCircle, TrendingUp, TrendingDown, ArrowLeft } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useApp } from "../context/AppContext";
import { toast } from "../components/Toast";

interface CashAccountsProps {
  lang: "en" | "bn";
  onBack?: () => void;
}

export default function CashAccounts({ lang, onBack }: CashAccountsProps) {
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
      {/* Header — the back arrow and the button group are real flex
          siblings on the same row (not overlaid), so neither can ever
          cover the other no matter how narrow the screen gets. */}
      <div className="flex items-center gap-4">
        {onBack && (
          <button
            onClick={onBack}
            aria-label={isBn ? "পেছনে যান" : "Go back"}
            className="lg:hidden flex-shrink-0 w-9 h-9 rounded-full bg-nv-100 flex items-center justify-center text-ink active:bg-nv-200"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setShowModal("transfer")}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-nv-200 rounded-xl text-xs sm:text-sm font-semibold text-ink bg-white hover:bg-nv-50 transition-fast shadow-2xs"
          >
            <ArrowRightLeft size={14} /> {isBn ? "ট্রান্সফার" : "Transfer"}
          </button>
          <button
            onClick={() => setShowModal("add")}
            className="flex items-center gap-1.5 px-4 py-2 bg-em-700 hover:bg-em-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-fast"
          >
            <Plus size={16} /> {isBn ? "জমা" : "Deposit"}
          </button>
        </div>
      </div>

      {/* Hero Balance Card */}
      <div className="bg-em-50 border border-em-100 rounded-3xl p-6 text-ink shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-ink text-xs font-semibold uppercase tracking-wider mb-1">{isBn ? "মোট বর্তমান ব্যালেন্স" : "Total Combined Balance"}</p>
            <div className="num text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">{formatTaka(totalBalance)}</div>
            <p className="text-ink text-xs mt-1">{tNum(accounts.length)} active accounts monitored</p>
          </div>

          <div className="flex items-center gap-6 sm:gap-8 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-em-200 md:pl-8">
            <div>
              <div className="text-xs text-ink">{isBn ? "আজকের মোট জমা (In)" : "Total Cash In"}</div>
              <div className="num font-bold text-base sm:text-lg text-ink">{formatTaka(totalIn)}</div>
            </div>

            <div>
              <div className="text-xs text-ink">{isBn ? "আজকের মোট খরচ (Out)" : "Total Cash Out"}</div>
              <div className="num font-bold text-base sm:text-lg text-ink">{formatTaka(totalOut)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Accounts List Grid */}
      <div>
        <h3 className="font-display font-bold text-ink text-sm mb-3">{isBn ? "অ্যাকাউন্ট ব্যালেন্স" : "Account Balances"}</h3>
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
            {isBn ? "ক্যাশ ফ্লো (আয় বনাম ব্যয়)" : "Weekly Cash Flow"}
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
              <span className="text-ink">{isBn ? "জমা (Cash In)" : "Cash In"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#FCA5A5]" />
              <span className="text-ink">{isBn ? "খরচ (Cash Out)" : "Cash Out"}</span>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-nv-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-nv-100">
            <h3 className="font-display font-bold text-ink text-sm">
              {isBn ? "সাম্প্রতিক ক্যাশ ট্রানজাকশন" : "Recent Account Transactions"}
            </h3>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-nv-50 border-b border-nv-200">
                  <th className="px-4 py-3 font-bold text-ink whitespace-nowrap">{isBn ? "বিবরণ" : "Description"}</th>
                  <th className="px-4 py-3 font-bold text-ink whitespace-nowrap">{isBn ? "অ্যাকাউন্ট" : "Account"}</th>
                  <th className="px-4 py-3 font-bold text-ink whitespace-nowrap">{isBn ? "পরিমাণ" : "Amount"}</th>
                  <th className="px-4 py-3 font-bold text-ink whitespace-nowrap">{isBn ? "সময়" : "Time"}</th>
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
                      <span className={`num font-bold ${tx.type === "in" ? "text-ink" : tx.type === "out" ? "text-ink" : "text-ink"}`}>
                        {tx.type === "in" ? "+" : tx.type === "out" ? "-" : ""}{formatTaka(tx.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink">{tNum(tx.time)}</td>
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
              <h3 className="font-bold text-ink text-base">{isBn ? "ক্যাশ জমা করুন" : "Add Cash / Deposit"}</h3>
              <button onClick={() => setShowModal(null)} className="text-ink hover:text-ink">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-ink mb-1">{isBn ? "অ্যাকাউন্ট বেছে নিন" : "Account"} *</label>
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
                <label className="block font-medium text-ink mb-1">{isBn ? "জমার পরিমাণ" : "Deposit Amount"} (৳) *</label>
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
                <label className="block font-medium text-ink mb-1">{isBn ? "বিবরণ / নোট" : "Note / Source"}</label>
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
                  className="flex-1 py-2.5 border border-nv-200 rounded-xl font-semibold text-ink hover:bg-nv-50"
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
              <h3 className="font-bold text-ink text-base">{isBn ? "টাকা ট্রান্সফার করুন" : "Transfer Funds"}</h3>
              <button onClick={() => setShowModal(null)} className="text-ink hover:text-ink">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-ink mb-1">{isBn ? "উৎস অ্যাকাউন্ট (From)" : "From Account"} *</label>
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
                <label className="block font-medium text-ink mb-1">{isBn ? "গন্তব্য অ্যাকাউন্ট (To)" : "To Account"} *</label>
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
                <label className="block font-medium text-ink mb-1">{isBn ? "ট্রান্সফার পরিমাণ" : "Transfer Amount"} (৳) *</label>
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
                  {isBn ? "বাতিল" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-nv-600 hover:bg-nv-700 text-white rounded-xl font-bold shadow-md"
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
