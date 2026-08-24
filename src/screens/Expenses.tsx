import { useState } from "react";
import { Plus, Receipt, Home, Zap, Users, Truck, Coffee, Wrench, Megaphone, Grid, Trash2, X, Search, DollarSign } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useApp } from "../context/AppContext";

interface ExpensesProps {
  lang: "en" | "bn";
}

const expenseCategories = [
  { id: "Shop Rent", label: "Shop Rent", labelBn: "দোকান ভাড়া", icon: Home, color: "#3B82F6" },
  { id: "Electricity", label: "Electricity", labelBn: "বিদ্যুৎ", icon: Zap, color: "#F59E0B" },
  { id: "Salary", label: "Salary", labelBn: "বেতন", icon: Users, color: "#8B5CF6" },
  { id: "Transport", label: "Transport", labelBn: "পরিবহন", icon: Truck, color: "#06B6D4" },
  { id: "Food", label: "Food", labelBn: "খাবার", icon: Coffee, color: "#EC4899" },
  { id: "Maintenance", label: "Maintenance", labelBn: "রক্ষণাবেক্ষণ", icon: Wrench, color: "#F97316" },
  { id: "Marketing", label: "Marketing", labelBn: "মার্কেটিং", icon: Megaphone, color: "#10B981" },
  { id: "Miscellaneous", label: "Miscellaneous", labelBn: "বিবিধ", icon: Grid, color: "#94A3B8" },
];

export default function Expenses({ lang }: ExpensesProps) {
  const { expenses, addExpense, deleteExpense, accounts, tNum, formatTaka } = useApp();
  const isBn = lang === "bn";

  const [showForm, setShowForm] = useState(false);
  const [selectedCat, setSelectedCat] = useState("Shop Rent");
  const [amount, setAmount] = useState("");
  const [paidFrom, setPaidFrom] = useState("Cash");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [search, setSearch] = useState("");

  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);

  // Group by category for pie chart
  const categoryTotals = expenseCategories.map(cat => {
    const sum = expenses
      .filter(e => e.category.toLowerCase() === cat.id.toLowerCase())
      .reduce((s, e) => s + e.amount, 0);
    return {
      name: isBn ? cat.labelBn : cat.label,
      value: sum,
      color: cat.color,
    };
  }).filter(c => c.value > 0);

  const filtered = expenses.filter(e =>
    e.category.toLowerCase().includes(search.toLowerCase()) ||
    e.note.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    const catObj = expenseCategories.find(c => c.id === selectedCat) || expenseCategories[0];

    addExpense({
      category: catObj.label,
      categoryBn: catObj.labelBn,
      amount: Number(amount),
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      paidFrom,
      note,
    });

    setShowForm(false);
    setAmount("");
    setNote("");
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-nv-900">{isBn ? "খরচ ব্যবস্থাপনা" : "Expense Management"}</h1>
          <p className="text-nv-500 text-xs sm:text-sm mt-0.5">
            {isBn ? "মোট মাসিক খরচ: " : "Total Expenses: "}
            <span className="num font-bold text-red-600">{formatTaka(totalExpense)}</span>
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-4 py-2 bg-em-700 hover:bg-em-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md self-start sm:self-auto"
        >
          <Plus size={16} /> {isBn ? "নতুন খরচ যোগ করুন" : "Add Expense"}
        </button>
      </div>

      {/* Add Expense Modal / Inline Card */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-md border border-nv-200 p-5 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-3 border-b border-nv-100 mb-4">
            <h3 className="font-display font-bold text-nv-900 text-base">{isBn ? "নতুন খরচ এন্ট্রি" : "Record New Expense"}</h3>
            <button onClick={() => setShowForm(false)} className="text-nv-400 hover:text-nv-600">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleCreateExpense} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-nv-700 mb-1">{isBn ? "খরচের বিভাগ" : "Category"} *</label>
                <select
                  value={selectedCat}
                  onChange={e => setSelectedCat(e.target.value)}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2.5 bg-white focus:border-em-500"
                >
                  {expenseCategories.map(c => (
                    <option key={c.id} value={c.id}>
                      {isBn ? c.labelBn : c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-nv-700 mb-1">{isBn ? "পরিমাণ (৳)" : "Amount (৳)"} *</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0"
                  className="num w-full border border-nv-200 rounded-xl px-3 py-2.5 font-bold text-red-600 focus:border-em-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-nv-700 mb-1">{isBn ? "পরিশোধ মাধ্যম" : "Paid From Account"}</label>
                <select
                  value={paidFrom}
                  onChange={e => setPaidFrom(e.target.value)}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2.5 bg-white focus:border-em-500"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.name}>
                      {a.name} ({formatTaka(a.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-nv-700 mb-1">{isBn ? "তারিখ" : "Date"}</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2.5 bg-white focus:border-em-500"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-4">
                <label className="block font-semibold text-nv-700 mb-1">{isBn ? "সংক্ষিপ্ত বিবরণ / নোট" : "Description / Note"}</label>
                <input
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder={isBn ? "যেমন: জানুয়ারি মাসের দোকান ভাড়া বা বিদ্যুৎ বিল..." : "e.g. Electricity bill or staff lunch..."}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2.5 focus:border-em-500"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-nv-100">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2 border border-nv-200 rounded-xl font-semibold text-nv-700 hover:bg-nv-50"
              >
                {isBn ? "বাতিল" : "Cancel"}
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-em-700 hover:bg-em-800 text-white rounded-xl font-bold shadow-md"
              >
                {isBn ? "খরচ সংরক্ষণ করুন" : "Save Expense"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid: Breakdown Chart & Expense Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Category Breakdown Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-nv-200 p-5 flex flex-col justify-between">
          <h3 className="font-display font-bold text-nv-900 text-sm mb-3">
            {isBn ? "বিভাগ অনুযায়ী খরচ" : "Expenses by Category"}
          </h3>

          <div className="h-52 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryTotals.length > 0 ? categoryTotals : [{ name: "None", value: 1, color: "#E2E8F0" }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryTotals.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => [formatTaka(Number(v)), ""]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="num text-xs text-nv-400">{isBn ? "মোট" : "Total"}</span>
              <span className="num text-base font-bold text-nv-900">{formatTaka(totalExpense)}</span>
            </div>
          </div>

          <div className="space-y-1.5 mt-2">
            {categoryTotals.map(c => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                  <span className="text-nv-700">{c.name}</span>
                </div>
                <span className="num font-bold text-nv-900">{formatTaka(c.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-nv-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-nv-100 flex items-center justify-between gap-3">
            <h3 className="font-display font-bold text-nv-900 text-sm">
              {isBn ? "খরচের তালিকা" : "Expense Transactions"}
            </h3>
            <div className="relative max-w-xs flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-nv-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                type="text"
                placeholder={isBn ? "খুঁজুন..." : "Search expenses..."}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-nv-50 border border-nv-200 rounded-xl"
              />
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-nv-50 border-b border-nv-200">
                  <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "বিভাগ" : "Category"}</th>
                  <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "পরিমাণ" : "Amount"}</th>
                  <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "পরিশোধ" : "Account"}</th>
                  <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "তারিখ" : "Date"}</th>
                  <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap">{isBn ? "নোট" : "Note"}</th>
                  <th className="px-4 py-3 font-bold text-nv-600 whitespace-nowrap text-right">{isBn ? "কাজ" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nv-100">
                {filtered.map(e => (
                  <tr key={e.id} className="hover:bg-nv-50 transition-fast">
                    <td className="px-4 py-3 font-bold text-nv-900 whitespace-nowrap">
                      {isBn ? e.categoryBn || e.category : e.category}
                    </td>
                    <td className="px-4 py-3 num font-bold text-red-600 whitespace-nowrap">{formatTaka(e.amount)}</td>
                    <td className="px-4 py-3 text-xs text-nv-600 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-nv-100 rounded-md font-mono">{e.paidFrom}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-nv-500 whitespace-nowrap">{e.date}</td>
                    <td className="px-4 py-3 text-xs text-nv-600 max-w-xs truncate">{e.note || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => deleteExpense(e.id)}
                        className="p-1 rounded-lg text-nv-400 hover:text-red-600 hover:bg-red-50 transition-fast"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-nv-400">
                      {isBn ? "কোনো খরচ পাওয়া যায়নি" : "No expense records found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
