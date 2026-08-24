import { useState } from "react";
import { Search, Plus, Phone, Truck, AlertCircle, CheckCircle, Calendar, X, CreditCard } from "lucide-react";
import { useApp, Supplier } from "../context/AppContext";

interface SuppliersProps {
  lang: "en" | "bn";
}

export default function Suppliers({ lang }: SuppliersProps) {
  const { suppliers, addSupplier, recordSupplierPayment, accounts, tNum, formatTaka } = useApp();
  const isBn = lang === "bn";

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Add form
  const [name, setName] = useState("");
  const [nameBn, setNameBn] = useState("");
  const [contact, setContact] = useState("");
  const [category, setCategory] = useState("Food & FMCG");
  const [openingDue, setOpeningDue] = useState("");
  const [nextPayment, setNextPayment] = useState("");

  // Pay modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payAccountId, setPayAccountId] = useState("cash");

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.nameBn.includes(search) ||
    s.contact.includes(search)
  );

  const totalDue = suppliers.reduce((s, sup) => s + sup.due, 0);
  const totalPurchases = suppliers.reduce((s, sup) => s + sup.totalPurchases, 0);
  const totalPaid = suppliers.reduce((s, sup) => s + sup.paid, 0);

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim()) return;

    addSupplier({
      name,
      nameBn: nameBn || name,
      contact,
      category,
      due: Number(openingDue) || 0,
      nextPayment: nextPayment || "Dec 30",
    });

    setShowAddModal(false);
    setName("");
    setNameBn("");
    setContact("");
    setOpeningDue("");
  };

  const handlePaySupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || !payAmount || Number(payAmount) <= 0) return;

    recordSupplierPayment(selectedSupplier.id, Number(payAmount), payAccountId);
    setShowPayModal(false);
    setPayAmount("");
    setSelectedSupplier(null);
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-nv-900">{isBn ? "সাপ্লায়ার ব্যবস্থাপনা" : "Suppliers Directory"}</h1>
          <p className="text-nv-500 text-xs sm:text-sm mt-0.5">{tNum(suppliers.length)} {isBn ? "জন রেজিস্টার্ড সাপ্লায়ার" : "registered suppliers"}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-em-700 hover:bg-em-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md self-start sm:self-auto"
        >
          <Plus size={16} /> {isBn ? "সাপ্লায়ার যোগ করুন" : "Add Supplier"}
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Payable Due", labelBn: "মোট সাপ্লায়ার দেনা", value: formatTaka(totalDue), icon: AlertCircle, color: "bg-red-50 text-red-600" },
          { label: "Total Purchases", labelBn: "মোট ক্রয়", value: formatTaka(totalPurchases), icon: Truck, color: "bg-blue-50 text-blue-700" },
          { label: "Total Paid", labelBn: "মোট পরিশোধ", value: formatTaka(totalPaid), icon: CheckCircle, color: "bg-em-50 text-em-700" },
          { label: "Active Suppliers", labelBn: "সাপ্লায়ার সংখ্যা", value: `${tNum(suppliers.length)} ${isBn ? "টি" : "Companies"}`, icon: Calendar, color: "bg-amber-50 text-amber-700" },
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
          placeholder={isBn ? "সাপ্লায়ার বা ফোন দিয়ে খুঁজুন..." : "Search suppliers by name or phone..."}
          className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-nv-200 rounded-xl focus:border-em-500"
        />
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-nv-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-nv-50 border-b border-nv-200">
                <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "সাপ্লায়ার" : "Supplier"}</th>
                <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "যোগাযোগ" : "Contact"}</th>
                <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "মোট ক্রয়" : "Total Purchases"}</th>
                <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "পরিশোধিত" : "Paid"}</th>
                <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "বাকি দেনা" : "Due"}</th>
                <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap text-right">{isBn ? "অ্যাকশন" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nv-100">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-nv-50 transition-fast">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-nv-800 text-white font-bold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                        {s.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-nv-900 text-xs sm:text-sm">{isBn ? s.nameBn : s.name}</div>
                        <div className="text-[10px] text-nv-400">{s.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-nv-600">{s.contact}</td>
                  <td className="px-4 py-3 num font-semibold text-nv-800">{formatTaka(s.totalPurchases)}</td>
                  <td className="px-4 py-3 num font-semibold text-em-700">{formatTaka(s.paid)}</td>
                  <td className="px-4 py-3">
                    <span className={`num font-bold ${s.due > 0 ? "text-red-600" : "text-em-700"}`}>
                      {s.due > 0 ? formatTaka(s.due) : "৳০"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {s.due > 0 && (
                        <button
                          onClick={() => {
                            setSelectedSupplier(s);
                            setPayAmount(s.due.toString());
                            setShowPayModal(true);
                          }}
                          className="px-3 py-1 bg-em-700 hover:bg-em-800 text-white rounded-lg text-xs font-bold transition-fast shadow-xs"
                        >
                          {isBn ? "পরিশোধ" : "Pay Due"}
                        </button>
                      )}
                      <a
                        href={`tel:${s.contact}`}
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

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-nv-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-nv-100">
              <h3 className="font-bold text-nv-900 text-base">{isBn ? "নতুন সাপ্লায়ার যোগ করুন" : "Add Supplier"}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-nv-400 hover:text-nv-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-nv-700 mb-1">{isBn ? "কোম্পানি / নাম" : "Company / Name"} *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Akij Group"
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
                />
              </div>

              <div>
                <label className="block font-medium text-nv-700 mb-1">{isBn ? "যোগাযোগ নম্বর" : "Contact Phone"} *</label>
                <input
                  type="tel"
                  required
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  placeholder="01711-000000"
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
                />
              </div>

              <div>
                <label className="block font-medium text-nv-700 mb-1">{isBn ? "পণ্যের ধরণ" : "Category"}</label>
                <input
                  type="text"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  placeholder="e.g. Food, FMCG, Beverage"
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
                />
              </div>

              <div>
                <label className="block font-medium text-nv-700 mb-1">{isBn ? "প্রারম্ভিক দেনা (যদি থাকে)" : "Opening Payable (৳)"}</label>
                <input
                  type="number"
                  value={openingDue}
                  onChange={e => setOpeningDue(e.target.value)}
                  placeholder="0"
                  className="num w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-nv-200 rounded-xl font-semibold text-nv-700 hover:bg-nv-50"
                >
                  {isBn ? "বাতিল" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-em-700 hover:bg-em-800 text-white rounded-xl font-bold shadow-md"
                >
                  {isBn ? "সংরক্ষণ করুন" : "Save Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Supplier Modal */}
      {showPayModal && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-nv-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-nv-100">
              <h3 className="font-bold text-nv-900 text-base">{isBn ? "সাপ্লায়ারকে পরিশোধ" : "Pay Supplier"}</h3>
              <button onClick={() => setShowPayModal(false)} className="text-nv-400 hover:text-nv-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePaySupplierSubmit} className="space-y-3 text-xs sm:text-sm">
              <p className="text-xs text-nv-600">
                Pay to <span className="font-bold text-nv-900">{selectedSupplier.name}</span> (Due: {formatTaka(selectedSupplier.due)})
              </p>

              <div>
                <label className="block font-medium text-nv-700 mb-1">{isBn ? "পরিশোধের পরিমাণ (৳)" : "Payment Amount (৳)"} *</label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  max={selectedSupplier.due}
                  onChange={e => setPayAmount(e.target.value)}
                  className="num w-full border border-nv-200 rounded-xl px-3 py-2 text-base font-bold text-em-700 focus:border-em-500"
                />
              </div>

              <div>
                <label className="block font-medium text-nv-700 mb-1">{isBn ? "পরিশোধ অ্যাকাউন্ট" : "Paid From Account"}</label>
                <select
                  value={payAccountId}
                  onChange={e => setPayAccountId(e.target.value)}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 bg-white focus:border-em-500"
                >
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({formatTaka(a.balance)})</option>)}
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
                  {isBn ? "পরিশোধ নিশ্চিত করুন" : "Confirm Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
