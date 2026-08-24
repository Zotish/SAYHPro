import { useState } from "react";
import { Search, Plus, Phone, MessageSquare, AlertCircle, CreditCard, ChevronRight, CheckCircle, Clock, X, Send } from "lucide-react";
import { useApp, Customer } from "../context/AppContext";
import { toast } from "../components/Toast";

interface CustomerDueProps {
  lang: "en" | "bn";
  showDetail?: boolean;
  setScreen: (s: string) => void;
}

export default function CustomerDue({ lang, setScreen }: CustomerDueProps) {
  const { customers, recordCustomerPayment, addCustomerDue, accounts, tNum, formatTaka } = useApp();
  const isBn = lang === "bn";

  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [showAddDueModal, setShowAddDueModal] = useState(false);
  const [showSMSModal, setShowSMSModal] = useState(false);

  // Collect modal inputs
  const [collectAmount, setCollectAmount] = useState("");
  const [collectAccount, setCollectAccount] = useState("cash");
  const [collectNote, setCollectNote] = useState("");

  // Add due inputs
  const [dueTargetCustomer, setDueTargetCustomer] = useState(customers[0]?.id || 1);
  const [dueAmount, setDueAmount] = useState("");
  const [dueReason, setDueReason] = useState("");

  // SMS modal state
  const [smsMessage, setSmsMessage] = useState("");

  const customersWithDue = customers.filter(c => c.due > 0);
  const totalDueAmount = customers.reduce((sum, c) => sum + c.due, 0);

  const filtered = customers.filter(c => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.nameBn.includes(search) ||
      c.phone.includes(search);
    return matchSearch;
  });

  const handleOpenCollect = (c: Customer) => {
    setSelectedCustomer(c);
    setCollectAmount(c.due.toString());
    setShowCollectModal(true);
  };

  const handleOpenSMS = (c: Customer) => {
    setSelectedCustomer(c);
    const template = isBn
      ? `প্রিয় ${c.name}, রহিম স্টোরে আপনার বকেয়া ৳${tNum(c.due)} দ্রুত পরিশোধ করার জন্য বিনীত অনুরোধ করা হচ্ছে। ধন্যবাদ!`
      : `Dear ${c.name}, your outstanding due at Rahim Store is ৳${tNum(c.due)}. Please settle it at your earliest convenience. Thank you!`;
    setSmsMessage(template);
    setShowSMSModal(true);
  };

  const handleConfirmCollect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !collectAmount) return;

    recordCustomerPayment(selectedCustomer.id, Number(collectAmount), collectAccount, collectNote);
    setShowCollectModal(false);
    setCollectAmount("");
    setCollectNote("");
  };

  const handleConfirmAddDue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dueAmount || Number(dueAmount) <= 0) return;

    addCustomerDue(Number(dueTargetCustomer), Number(dueAmount), dueReason);
    setShowAddDueModal(false);
    setDueAmount("");
    setDueReason("");
  };

  const handleSendSMS = () => {
    toast({
      type: "success",
      title: isBn ? "এসএমএস পাঠানো হয়েছে!" : "SMS Reminder Sent!",
      message: `Sent to ${selectedCustomer?.phone}`,
    });
    setShowSMSModal(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-nv-900">{isBn ? "বাকির খাতা ও আদায়" : "Customer Due Ledger"}</h1>
          <p className="text-nv-500 text-xs sm:text-sm mt-0.5">
            {isBn ? "মোট গ্রাহক বাকি পাওনা: " : "Total Outstanding Receivables: "}
            <span className="num font-bold text-red-600">{formatTaka(totalDueAmount)}</span>
          </p>
        </div>
        <button
          onClick={() => setShowAddDueModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md self-start sm:self-auto transition-fast"
        >
          <Plus size={16} /> {isBn ? "নতুন বাকি এন্ট্রি" : "Add Due Entry"}
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Outstanding Due", labelBn: "মোট বাকি পাওনা", value: formatTaka(totalDueAmount), icon: AlertCircle, color: "bg-red-50 text-red-600" },
          { label: "Owing Customers", labelBn: "বাকিদার গ্রাহক", value: `${tNum(customersWithDue.length)} ${isBn ? "জন" : "Customers"}`, icon: Clock, color: "bg-amber-50 text-amber-700" },
          { label: "Total Customers", labelBn: "মোট গ্রাহক", value: `${tNum(customers.length)} ${isBn ? "জন" : "Registered"}`, icon: CreditCard, color: "bg-nv-100 text-nv-700" },
          { label: "Collection Account", labelBn: "ডিফল্ট জমা", value: "Cash (নগদ)", icon: CheckCircle, color: "bg-em-50 text-em-700" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-nv-200 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
              <s.icon size={18} />
            </div>
            <div>
              <div className="num text-lg sm:text-xl font-bold text-nv-900">{s.value}</div>
              <div className="text-[11px] text-nv-500">{isBn ? s.labelBn : s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-nv-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          type="text"
          placeholder={isBn ? "গ্রাহকের নাম বা ফোন দিয়ে খুঁজুন..." : "Search customers by name or phone..."}
          className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-nv-200 rounded-xl focus:border-em-500"
        />
      </div>

      {/* Dues Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-nv-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-nv-50 border-b border-nv-200">
                <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "গ্রাহক" : "Customer"}</th>
                <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "যোগাযোগ" : "Contact"}</th>
                <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "মোট ক্রয়" : "Total Purchases"}</th>
                <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "বকেয়া বাকি" : "Current Due"}</th>
                <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "অবস্থা" : "Status"}</th>
                <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap text-right">{isBn ? "অ্যাকশন" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nv-100">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-nv-50 transition-fast">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-em-700 to-em-500 text-white font-bold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                        {c.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-nv-900">{isBn ? c.nameBn : c.name}</div>
                        <div className="text-[10px] text-nv-400">{c.address || "Dhaka"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-nv-600">{c.phone}</td>
                  <td className="px-4 py-3 num font-semibold text-nv-800">{formatTaka(c.totalPurchases)}</td>
                  <td className="px-4 py-3">
                    <span className={`num font-bold text-sm ${c.due > 0 ? "text-red-600" : "text-em-700"}`}>
                      {c.due > 0 ? formatTaka(c.due) : "৳০"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${c.due > 0 ? "bg-red-50 text-red-700 border border-red-200" : "bg-em-50 text-em-700 border border-em-200"}`}>
                      {c.due > 0 ? (isBn ? "বাকি আছে" : "Has Due") : (isBn ? "পরিশোধিত" : "Clear")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {c.due > 0 && (
                        <>
                          <button
                            onClick={() => handleOpenCollect(c)}
                            className="px-3 py-1 bg-em-700 hover:bg-em-800 text-white rounded-lg text-xs font-bold transition-fast shadow-xs"
                          >
                            {isBn ? "জমা" : "Collect"}
                          </button>
                          <button
                            onClick={() => handleOpenSMS(c)}
                            className="p-1.5 bg-nv-100 text-nv-700 hover:bg-nv-200 rounded-lg transition-fast"
                            title="SMS Reminder"
                          >
                            <MessageSquare size={14} />
                          </button>
                        </>
                      )}
                      <a
                        href={`tel:${c.phone}`}
                        className="p-1.5 bg-nv-100 text-nv-700 hover:bg-nv-200 rounded-lg transition-fast"
                        title="Call"
                      >
                        <Phone size={14} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Payment Modal */}
      {showCollectModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-nv-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-nv-100">
              <h3 className="font-bold text-nv-900 text-base">{isBn ? "বাকি টাকা আদায়" : "Collect Due Payment"}</h3>
              <button onClick={() => setShowCollectModal(false)} className="text-nv-400 hover:text-nv-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmCollect} className="space-y-3 text-xs sm:text-sm">
              <div className="p-3 bg-nv-50 rounded-xl space-y-1">
                <div className="font-bold text-nv-900">{selectedCustomer.name}</div>
                <div className="text-xs text-nv-500">
                  {isBn ? "মোট বাকি: " : "Current Due: "}
                  <span className="num font-bold text-red-600">{formatTaka(selectedCustomer.due)}</span>
                </div>
              </div>

              <div>
                <label className="block font-medium text-nv-700 mb-1">{isBn ? "জমার পরিমাণ (৳)" : "Collected Amount (৳)"} *</label>
                <input
                  type="number"
                  required
                  value={collectAmount}
                  max={selectedCustomer.due}
                  onChange={e => setCollectAmount(e.target.value)}
                  className="num w-full border border-nv-200 rounded-xl px-3 py-2 text-base font-bold text-em-700 focus:border-em-500"
                />
              </div>

              <div>
                <label className="block font-medium text-nv-700 mb-1">{isBn ? "জমা অ্যাকাউন্ট" : "Deposit Account"}</label>
                <select
                  value={collectAccount}
                  onChange={e => setCollectAccount(e.target.value)}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 bg-white focus:border-em-500"
                >
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({formatTaka(a.balance)})</option>)}
                </select>
              </div>

              <div>
                <label className="block font-medium text-nv-700 mb-1">{isBn ? "মন্তব্য / বিবরণ" : "Note"}</label>
                <input
                  type="text"
                  value={collectNote}
                  onChange={e => setCollectNote(e.target.value)}
                  placeholder={isBn ? "যেমন: নগদ পরিশোধ" : "e.g. Cash settlement"}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCollectModal(false)}
                  className="flex-1 py-2.5 border border-nv-200 rounded-xl font-semibold text-nv-700 hover:bg-nv-50"
                >
                  {isBn ? "বাতিল" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-em-700 hover:bg-em-800 text-white rounded-xl font-bold shadow-md"
                >
                  {isBn ? "আদায় নিশ্চিত" : "Confirm Collection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Due Entry Modal */}
      {showAddDueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-nv-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-nv-100">
              <h3 className="font-bold text-nv-900 text-base">{isBn ? "নতুন বাকি যুক্ত করুন" : "Add Due Entry"}</h3>
              <button onClick={() => setShowAddDueModal(false)} className="text-nv-400 hover:text-nv-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmAddDue} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-nv-700 mb-1">{isBn ? "গ্রাহক নির্বাচন" : "Customer"} *</label>
                <select
                  value={dueTargetCustomer}
                  onChange={e => setDueTargetCustomer(Number(e.target.value))}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 bg-white focus:border-em-500"
                >
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                </select>
              </div>

              <div>
                <label className="block font-medium text-nv-700 mb-1">{isBn ? "বাকির পরিমাণ (৳)" : "Due Amount (৳)"} *</label>
                <input
                  type="number"
                  required
                  value={dueAmount}
                  onChange={e => setDueAmount(e.target.value)}
                  placeholder="0"
                  className="num w-full border border-nv-200 rounded-xl px-3 py-2 text-base font-bold text-red-600 focus:border-em-500"
                />
              </div>

              <div>
                <label className="block font-medium text-nv-700 mb-1">{isBn ? "কারণ / পণ্যের বিবরণ" : "Reason / Item description"}</label>
                <input
                  type="text"
                  value={dueReason}
                  onChange={e => setDueReason(e.target.value)}
                  placeholder={isBn ? "যেমন: মাসিক মুদি সদাই" : "e.g. Monthly grocery items"}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDueModal(false)}
                  className="flex-1 py-2.5 border border-nv-200 rounded-xl font-semibold text-nv-700 hover:bg-nv-50"
                >
                  {isBn ? "বাতিল" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-md"
                >
                  {isBn ? "বাকি সংরক্ষণ" : "Save Due"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SMS Reminder Modal */}
      {showSMSModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-nv-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-nv-100">
              <h3 className="font-bold text-nv-900 text-base">{isBn ? "এসএমএস রিমাইন্ডার" : "Send SMS Reminder"}</h3>
              <button onClick={() => setShowSMSModal(false)} className="text-nv-400 hover:text-nv-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-nv-700 mb-1">{isBn ? "প্রাপক" : "Recipient"}</label>
                <div className="font-bold text-nv-900">{selectedCustomer.name} ({selectedCustomer.phone})</div>
              </div>

              <div>
                <label className="block font-medium text-nv-700 mb-1">{isBn ? "মেসেজ টেমপ্লেট" : "Message Body"}</label>
                <textarea
                  rows={4}
                  value={smsMessage}
                  onChange={e => setSmsMessage(e.target.value)}
                  className="w-full border border-nv-200 rounded-xl p-3 text-xs leading-relaxed focus:border-em-500 font-bn"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowSMSModal(false)}
                className="flex-1 py-2.5 border border-nv-200 rounded-xl font-semibold text-nv-700 hover:bg-nv-50"
              >
                {isBn ? "বাতিল" : "Cancel"}
              </button>
              <button
                onClick={handleSendSMS}
                className="flex-1 py-2.5 bg-em-700 hover:bg-em-800 text-white rounded-xl font-bold shadow-md flex items-center justify-center gap-1.5"
              >
                <Send size={14} />
                <span>{isBn ? "পাঠান" : "Send SMS"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
