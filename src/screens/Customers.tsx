import { useState } from "react";
import { Search, Plus, Phone, ShoppingCart, CreditCard, ChevronRight, Users, Star, MessageSquare, Trash2, Edit, X, ArrowLeft } from "lucide-react";
import { useApp, Customer } from "../context/AppContext";

interface CustomersProps {
  lang: "en" | "bn";
  setScreen: (s: string) => void;
}

const statusConfig = {
  vip: { label: "VIP", labelBn: "ভিআইপি", cls: "bg-amber-50 text-amber-700 border border-amber-200" },
  regular: { label: "Regular", labelBn: "নিয়মিত", cls: "bg-em-50 text-em-700 border border-em-200" },
  new: { label: "New", labelBn: "নতুন", cls: "bg-blue-50 text-blue-700 border border-blue-200" },
  due: { label: "Has Due", labelBn: "বাকি আছে", cls: "bg-red-50 text-red-600 border border-red-200" },
};

export default function Customers({ lang, setScreen }: CustomersProps) {
  const { customers, addCustomer, updateCustomer, deleteCustomer, recordCustomerPayment, accounts, tNum, formatTaka } = useApp();
  const isBn = lang === "bn";

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [openingDue, setOpeningDue] = useState("");

  // Pay modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payAccountId, setPayAccountId] = useState("cash");

  const filtered = customers.filter(c => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.nameBn.includes(search) ||
      c.phone.includes(search);
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalDue = customers.reduce((s, c) => s + c.due, 0);
  const totalPurchases = customers.reduce((s, c) => s + c.totalPurchases, 0);
  const vipCount = customers.filter(c => c.status === "vip").length;

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    addCustomer({
      name,
      nameBn: name,
      phone,
      address,
      due: Number(openingDue) || 0,
      status: Number(openingDue) > 0 ? "due" : "new",
    });

    setShowAddModal(false);
    setName("");
    setPhone("");
    setAddress("");
    setOpeningDue("");
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !payAmount) return;

    recordCustomerPayment(selectedCustomer.id, Number(payAmount), payAccountId);
    setShowPayModal(false);
    setPayAmount("");
    const updated = customers.find(c => c.id === selectedCustomer.id);
    if (updated) setSelectedCustomer(updated);
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-nv-900">{isBn ? "গ্রাহক ব্যবস্থাপনা" : "Customers"}</h1>
          <p className="text-nv-500 text-xs sm:text-sm mt-0.5">{tNum(customers.length)} {isBn ? "জন নিবন্ধিত গ্রাহক" : "customers registered"}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-em-700 hover:bg-em-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md self-start sm:self-auto"
        >
          <Plus size={16} /> {isBn ? "গ্রাহক যোগ করুন" : "Add Customer"}
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Customers", labelBn: "মোট গ্রাহক", value: `${tNum(customers.length)} ${isBn ? "জন" : ""}`, icon: Users, color: "bg-blue-50 text-blue-600" },
          { label: "Total Purchases", labelBn: "মোট বিক্রয়", value: formatTaka(totalPurchases), icon: ShoppingCart, color: "bg-em-50 text-em-700" },
          { label: "Outstanding Dues", labelBn: "মোট বাকি", value: formatTaka(totalDue), icon: CreditCard, color: "bg-red-50 text-red-600" },
          { label: "VIP Customers", labelBn: "ভিআইপি গ্রাহক", value: `${tNum(vipCount)} ${isBn ? "জন" : ""}`, icon: Star, color: "bg-amber-50 text-amber-600" },
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

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-nv-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            type="text"
            placeholder={isBn ? "নাম বা ফোন নম্বর দিয়ে খুঁজুন..." : "Search by name or phone..."}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-nv-200 rounded-xl focus:border-em-500"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All", labelBn: "সব" },
            { id: "vip", label: "VIP", labelBn: "ভিআইপি" },
            { id: "due", label: "Has Due", labelBn: "বাকি আছে" },
            { id: "regular", label: "Regular", labelBn: "নিয়মিত" },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-fast flex-shrink-0
                ${filterStatus === f.id ? "bg-em-700 text-white shadow-2xs" : "bg-white border border-nv-200 text-nv-600 hover:border-nv-300"}`}
            >
              {isBn ? f.labelBn : f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-nv-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-nv-50 border-b border-nv-200">
                <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "গ্রাহক" : "Customer"}</th>
                <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "যোগাযোগ" : "Contact"}</th>
                <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "মোট ক্রয়" : "Total Purchases"}</th>
                <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "বর্তমান বাকি" : "Current Due"}</th>
                <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "ভিজিট সংখ্যা" : "Visits"}</th>
                <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "ক্যাটাগরি" : "Status"}</th>
                <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap text-right">{isBn ? "অ্যাকশন" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nv-100">
              {filtered.map(c => {
                const sc = statusConfig[c.status] || statusConfig.regular;
                return (
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
                    <td className="px-4 py-3 num font-semibold text-nv-800">{formatTaka(c.totalPurchases)}</td>
                    <td className="px-4 py-3">
                      <span className={`num font-bold ${c.due > 0 ? "text-red-600" : "text-em-700"}`}>
                        {c.due > 0 ? formatTaka(c.due) : "৳০"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-nv-600">{tNum(c.visits)} {isBn ? "বার" : "times"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${sc.cls}`}>
                        {isBn ? sc.labelBn : sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="px-2.5 py-1 bg-nv-100 hover:bg-nv-200 text-nv-700 rounded-lg text-xs font-semibold transition-fast"
                        >
                          {isBn ? "প্রোফাইল" : "View"}
                        </button>
                        <a
                          href={`tel:${c.phone}`}
                          className="p-1.5 bg-nv-100 text-nv-600 hover:bg-nv-200 rounded-lg transition-fast"
                          title="Call"
                        >
                          <Phone size={14} />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-nv-200 p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-nv-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-em-700 to-em-500 text-white font-bold text-xl flex items-center justify-center shadow-md">
                  {selectedCustomer.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-nv-900">{selectedCustomer.name}</h3>
                  <p className="text-xs text-nv-500">{selectedCustomer.phone} · {selectedCustomer.address}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-nv-400 hover:text-nv-600">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-nv-50 rounded-2xl text-center">
                <div className="text-[11px] text-nv-500">{isBn ? "মোট ক্রয়" : "Purchases"}</div>
                <div className="num font-bold text-base text-nv-900">{formatTaka(selectedCustomer.totalPurchases)}</div>
              </div>
              <div className="p-3 bg-red-50 rounded-2xl text-center">
                <div className="text-[11px] text-red-600">{isBn ? "বর্তমান বাকি" : "Current Due"}</div>
                <div className="num font-bold text-base text-red-700">{formatTaka(selectedCustomer.due)}</div>
              </div>
              <div className="p-3 bg-nv-50 rounded-2xl text-center">
                <div className="text-[11px] text-nv-500">{isBn ? "মোট ভিজিট" : "Visits"}</div>
                <div className="num font-bold text-base text-nv-900">{tNum(selectedCustomer.visits)}</div>
              </div>
            </div>

            <div className="flex gap-2">
              {selectedCustomer.due > 0 && (
                <button
                  onClick={() => {
                    setPayAmount(selectedCustomer.due.toString());
                    setShowPayModal(true);
                  }}
                  className="flex-1 py-2.5 bg-em-700 hover:bg-em-800 text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-1.5"
                >
                  <CreditCard size={15} />
                  <span>{isBn ? "বাকি টাকা জমা" : "Collect Due"}</span>
                </button>
              )}
              <a
                href={`tel:${selectedCustomer.phone}`}
                className="flex-1 py-2.5 bg-nv-100 hover:bg-nv-200 text-nv-800 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5"
              >
                <Phone size={14} />
                <span>{isBn ? "কল করুন" : "Call"}</span>
              </a>
            </div>

            <div className="pt-2 border-t border-nv-100 flex justify-between items-center">
              <button
                onClick={() => {
                  deleteCustomer(selectedCustomer.id);
                  setSelectedCustomer(null);
                }}
                className="text-xs text-red-600 hover:underline flex items-center gap-1"
              >
                <Trash2 size={13} /> {isBn ? "গ্রাহক মুছে ফেলুন" : "Delete Customer"}
              </button>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-1.5 bg-nv-100 text-nv-700 rounded-xl text-xs font-semibold"
              >
                {isBn ? "বন্ধ করুন" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collect Payment Dialog */}
      {showPayModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-nv-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-nv-100">
              <h3 className="font-bold text-nv-900 text-base">{isBn ? "বাকি পরিশোধ গ্রহণ" : "Collect Payment"}</h3>
              <button onClick={() => setShowPayModal(false)} className="text-nv-400 hover:text-nv-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePaySubmit} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-nv-700 mb-1">{isBn ? "পরিমাণ (৳)" : "Amount (৳)"} *</label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  className="num w-full border border-nv-200 rounded-xl px-3 py-2 text-base font-bold text-em-700 focus:border-em-500"
                />
              </div>

              <div>
                <label className="block font-medium text-nv-700 mb-1">{isBn ? "অ্যাকাউন্ট" : "Account"}</label>
                <select
                  value={payAccountId}
                  onChange={e => setPayAccountId(e.target.value)}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 bg-white focus:border-em-500"
                >
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
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
                  {isBn ? "জমা নিশ্চিত" : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
