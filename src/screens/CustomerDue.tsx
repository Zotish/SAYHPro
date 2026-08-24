import { useState } from "react";
import {
  Search, Plus, Phone, ChevronRight, ArrowLeft, MessageSquare,
  Calendar, Users, AlertCircle, CheckCircle,
  CreditCard, Clock, FileText, X, Send, DollarSign, Edit
} from "lucide-react";
import { useApp, Customer } from "../context/AppContext";
import { toast } from "../components/Toast";

interface CustomerDueProps {
  lang: "en" | "bn";
  showDetail?: boolean;
  setScreen: (s: string) => void;
}

export default function CustomerDue({ lang, showDetail, setScreen }: CustomerDueProps) {
  const { customers, recordCustomerPayment, addCustomerDue, accounts, settings, addCustomer } = useApp();
  const isBn = lang === "bn";

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "overdue" | "critical">("all");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  // Modals
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payAccountId, setPayAccountId] = useState("cash");

  const [showAddDueModal, setShowAddDueModal] = useState(false);
  const [addDueAmount, setAddDueAmount] = useState("");
  const [addDueNote, setAddDueNote] = useState("");

  const [showSmsModal, setShowSmsModal] = useState(false);
  const [smsMessage, setSmsMessage] = useState("");

  const [showNewCustModal, setShowNewCustModal] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustDue, setNewCustDue] = useState("");

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const dueCustomers = customers.filter(c => c.due > 0);
  const totalDueAmount = dueCustomers.reduce((sum, c) => sum + c.due, 0);

  const filtered = dueCustomers.filter(c => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.nameBn.includes(search) ||
      c.phone.includes(search);
    return matchSearch;
  });

  const handleCollectPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !payAmount || Number(payAmount) <= 0) return;

    recordCustomerPayment(selectedCustomer.id, Number(payAmount), payAccountId);
    setShowPayModal(false);
    setPayAmount("");
  };

  const handleAddDueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !addDueAmount || Number(addDueAmount) <= 0) return;

    addCustomerDue(selectedCustomer.id, Number(addDueAmount), addDueNote);
    setShowAddDueModal(false);
    setAddDueAmount("");
    setAddDueNote("");
  };

  const handleSendSms = () => {
    if (!selectedCustomer) return;
    toast({
      type: "success",
      title: isBn ? "এসএমএস সফলভাবে পাঠানো হয়েছে!" : "SMS Sent Successfully!",
      message: `Sent to ${selectedCustomer.phone}`,
    });
    setShowSmsModal(false);
  };

  const openSmsModalFor = (cust: Customer) => {
    setSelectedCustomerId(cust.id);
    const template = isBn
      ? `প্রিয় ${cust.nameBn || cust.name}, ${settings.shopName}-এ আপনার মোট বাকি ৳${cust.due.toLocaleString()} টাকা। অনুগ্রহ করে দ্রুত পরিশোধের অনুরোধ রইল। ধন্যবাদ!`
      : `Dear ${cust.name}, your outstanding due at ${settings.shopName} is ৳${cust.due.toLocaleString()}. Please pay at your earliest convenience. Thank you!`;
    setSmsMessage(template);
    setShowSmsModal(true);
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) return;

    addCustomer({
      name: newCustName,
      nameBn: newCustName,
      phone: newCustPhone,
      due: Number(newCustDue) || 0,
      status: Number(newCustDue) > 0 ? "due" : "new",
    });

    setShowNewCustModal(false);
    setNewCustName("");
    setNewCustPhone("");
    setNewCustDue("");
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-nv-900">{isBn ? "বাকির খাতা ও হিসাব" : "Customer Dues (Baki)"}</h1>
          <p className="text-nv-500 text-xs sm:text-sm mt-0.5">
            {dueCustomers.length} {isBn ? "জন গ্রাহকের কাছে মোট বাকি: " : "customers owe: "}
            <span className="num font-bold text-red-600">৳{totalDueAmount.toLocaleString()}</span>
          </p>
        </div>
        <button
          onClick={() => setShowNewCustModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-em-700 hover:bg-em-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md self-start sm:self-auto"
        >
          <Plus size={16} /> {isBn ? "নতুন বাকি এন্ট্রি" : "Add Due Entry"}
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Outstanding Due", labelBn: "মোট বকেয়া পাওনা", value: `৳${totalDueAmount.toLocaleString()}`, icon: AlertCircle, color: "bg-red-50 text-red-600" },
          { label: "Due Customers", labelBn: "বাকিদার গ্রাহক", value: `${dueCustomers.length} Persons`, icon: Users, color: "bg-amber-50 text-amber-700" },
          { label: "Collected Today", labelBn: "আজকে সংগৃহীত", value: "৳7,850", icon: CheckCircle, color: "bg-em-50 text-em-700" },
          { label: "Reminders Sent", labelBn: "এসএমএস নোটিশ পাঠানো", value: "14 SMS", icon: MessageSquare, color: "bg-blue-50 text-blue-700" },
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
          placeholder={isBn ? "নাম বা মোবাইল নম্বর খুঁজুন..." : "Search by name or mobile..."}
          className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-nv-200 rounded-xl focus:border-em-500"
        />
      </div>

      {/* Due Customer List Table / Cards */}
      <div className="bg-white rounded-2xl shadow-sm border border-nv-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-nv-50 border-b border-nv-200">
                <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "গ্রাহক" : "Customer"}</th>
                <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "মোবাইল" : "Mobile"}</th>
                <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "মোট বাকি" : "Total Due"}</th>
                <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "সর্বশেষ পরিশোধ" : "Last Payment"}</th>
                <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "বকেয়ার তারিখ" : "Due Since"}</th>
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
                        <div className="font-bold text-nv-900 text-xs sm:text-sm">{isBn ? c.nameBn : c.name}</div>
                        <div className="text-[10px] text-nv-400">{c.address || "Dhaka"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-nv-600">{c.phone}</td>
                  <td className="px-4 py-3">
                    <span className="num font-bold text-sm text-red-600">৳{c.due.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-nv-500">{c.lastPayment || "—"}</td>
                  <td className="px-4 py-3 text-xs text-nv-500">{c.dueSince || "Recent"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      <button
                        onClick={() => {
                          setSelectedCustomerId(c.id);
                          setPayAmount(c.due.toString());
                          setShowPayModal(true);
                        }}
                        className="px-3 py-1.5 bg-em-700 hover:bg-em-800 text-white rounded-lg text-xs font-bold transition-fast shadow-xs"
                      >
                        {isBn ? "টাকা জমা" : "Collect"}
                      </button>
                      <button
                        onClick={() => openSmsModalFor(c)}
                        className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-fast"
                        title="Send SMS"
                      >
                        <MessageSquare size={14} />
                      </button>
                      <a
                        href={`tel:${c.phone}`}
                        className="p-1.5 bg-nv-100 text-nv-700 hover:bg-nv-200 rounded-lg transition-fast"
                        title="Call Customer"
                      >
                        <Phone size={14} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-nv-400">
                    {isBn ? "কোনো বকেয়া বাকি পাওয়া যায়নি!" : "No outstanding customer dues found!"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Payment Modal */}
      {showPayModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-nv-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-nv-100">
              <div>
                <h3 className="font-bold text-nv-900 text-base">{isBn ? "বকেয়া টাকা গ্রহণ" : "Collect Due Payment"}</h3>
                <p className="text-xs text-nv-500">{selectedCustomer.name} · Due: ৳{selectedCustomer.due.toLocaleString()}</p>
              </div>
              <button onClick={() => setShowPayModal(false)} className="text-nv-400 hover:text-nv-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCollectPaymentSubmit} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-nv-700 mb-1">{isBn ? "গ্রহণের পরিমাণ" : "Amount to Collect"} (৳) *</label>
                <input
                  type="number"
                  required
                  autoFocus
                  max={selectedCustomer.due}
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  placeholder="0"
                  className="num w-full border border-nv-200 rounded-xl px-3 py-2 text-base font-bold text-em-700 focus:border-em-500"
                />
              </div>

              <div>
                <label className="block font-medium text-nv-700 mb-1">{isBn ? "জমা হবে যে অ্যাকাউন্টে" : "Deposit Account"}</label>
                <select
                  value={payAccountId}
                  onChange={e => setPayAccountId(e.target.value)}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 bg-white focus:border-em-500"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} (Current: ৳{a.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="flex-1 py-2.5 border border-nv-200 rounded-xl font-semibold text-nv-700 hover:bg-nv-50"
                >
                  {isBn ? "বাতিল" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-em-700 hover:bg-em-800 text-white rounded-xl font-bold shadow-md"
                >
                  {isBn ? "টাকা জমা নিশ্চিত করুন" : "Confirm Collection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SMS Reminder Modal */}
      {showSmsModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-nv-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-nv-100">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-blue-600" />
                <h3 className="font-bold text-nv-900 text-base">{isBn ? "এসএমএস রিমাইন্ডার পাঠান" : "Send SMS Reminder"}</h3>
              </div>
              <button onClick={() => setShowSmsModal(false)} className="text-nv-400 hover:text-nv-600">
                <X size={18} />
              </button>
            </div>

            <div className="text-xs text-nv-600 bg-nv-50 p-2.5 rounded-xl">
              <span>To: </span>
              <span className="font-bold text-nv-900">{selectedCustomer.name} ({selectedCustomer.phone})</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-nv-700 mb-1">{isBn ? "বার্তার বিষয়বস্তু" : "Message Body"}</label>
              <textarea
                rows={4}
                value={smsMessage}
                onChange={e => setSmsMessage(e.target.value)}
                className="w-full border border-nv-200 rounded-xl p-3 text-xs sm:text-sm focus:border-em-500 font-sans"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowSmsModal(false)}
                className="flex-1 py-2.5 border border-nv-200 rounded-xl font-semibold text-nv-700 hover:bg-nv-50"
              >
                {isBn ? "বাতিল" : "Cancel"}
              </button>
              <button
                onClick={handleSendSms}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md flex items-center justify-center gap-2"
              >
                <Send size={14} />
                <span>{isBn ? "এসএমএস পাঠান" : "Send SMS"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Customer / Due Modal */}
      {showNewCustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-nv-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-nv-100">
              <h3 className="font-bold text-nv-900 text-base">{isBn ? "নতুন বাকি এন্ট্রি" : "Add Due Entry"}</h3>
              <button onClick={() => setShowNewCustModal(false)} className="text-nv-400 hover:text-nv-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-nv-700 mb-1">{isBn ? "গ্রাহকের নাম" : "Customer Name"} *</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={e => setNewCustName(e.target.value)}
                  placeholder="e.g. Aslam Hossain"
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
                />
              </div>

              <div>
                <label className="block font-medium text-nv-700 mb-1">{isBn ? "মোবাইল নম্বর" : "Mobile Phone"} *</label>
                <input
                  type="tel"
                  required
                  value={newCustPhone}
                  onChange={e => setNewCustPhone(e.target.value)}
                  placeholder="01712-000000"
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
                />
              </div>

              <div>
                <label className="block font-medium text-nv-700 mb-1">{isBn ? "বাকির পরিমাণ" : "Due Amount"} (৳) *</label>
                <input
                  type="number"
                  required
                  value={newCustDue}
                  onChange={e => setNewCustDue(e.target.value)}
                  placeholder="0"
                  className="num w-full border border-nv-200 rounded-xl px-3 py-2 font-bold text-red-600 focus:border-em-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewCustModal(false)}
                  className="flex-1 py-2.5 border border-nv-200 rounded-xl font-semibold text-nv-700 hover:bg-nv-50"
                >
                  {isBn ? "বাতিল" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-em-700 hover:bg-em-800 text-white rounded-xl font-bold shadow-md"
                >
                  {isBn ? "সংরক্ষণ করুন" : "Save Due"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
