import { useState } from "react";
import { Plus, Phone, TrendingUp, Edit, Trash2, X, CreditCard, ArrowLeft, User, Camera } from "lucide-react";
import { useApp, Employee } from "../context/AppContext";

interface EmployeesProps {
  lang: "en" | "bn";
  onBack?: () => void;
}

const roleColors: Record<string, string> = {
  "Store Manager": "bg-nv-50 text-ink border border-nv-200",
  "Cashier": "bg-em-50 text-ink border border-em-200",
  "Sales Staff": "bg-nv-50 text-ink border border-nv-200",
  "Inventory Staff": "bg-ac-50 text-ink border border-ac-200",
};

export default function Employees({ lang, onBack }: EmployeesProps) {
  const { employees, addEmployee, updateEmployee, deleteEmployee, paySalary, accounts, tNum, formatTaka } = useApp();
  const isBn = lang === "bn";

  const [showAddModal, setShowAddModal] = useState(false);
  const [payingEmployee, setPayingEmployee] = useState<Employee | null>(null);
  const [payAccountId, setPayAccountId] = useState("cash");

  // Add form state
  const [name, setName] = useState("");
  const [nameBn, setNameBn] = useState("");
  const [role, setRole] = useState("Sales Staff");
  const [phone, setPhone] = useState("");
  const [salary, setSalary] = useState("");
  const [joined, setJoined] = useState("Today");
  const [photo, setPhoto] = useState("");

  const totalSalary = employees.reduce((s, e) => s + e.salary, 0);

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !salary) return;

    addEmployee({
      name,
      nameBn: nameBn || name,
      role,
      roleBn: role === "Cashier" ? "Cashier" : role === "Store Manager" ? "Store Manager" : "Staff",
      phone,
      salary: Number(salary),
      joined: joined || "Dec 2024",
      photo: photo || undefined,
    });

    setShowAddModal(false);
    setName("");
    setNameBn("");
    setPhone("");
    setSalary("");
    setPhoto("");
  };

  const handlePaySalarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingEmployee) return;

    paySalary(payingEmployee.id, payAccountId);
    setPayingEmployee(null);
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-24 lg:pb-8">
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

        <button
          onClick={() => setShowAddModal(true)}
          className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-em-700 hover:bg-em-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-fast"
        >
          <Plus size={16} /> {isBn ? "Fa Adwumayɛfoɔ Foforɔ Ka Ho" : "Add Employee"}
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Staff", labelBn: "Adwumayɛfoɔ Nyinaa", value: tNum(employees.length) },
          { label: "Monthly Payroll", labelBn: "Akatua Nyinaa Bosome Biara", value: formatTaka(totalSalary) },
          { label: "Active Roles", labelBn: "সক্রিয় Dibea", value: tNum(4) },
          { label: "Status", labelBn: "স্ট্যাটাস", value: isBn ? "Nyinaaাই সক্রিয়" : "All Active" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-nv-200">
            <div className="text-xs text-ink/70 font-medium mb-1">{isBn ? s.labelBn : s.label}</div>
            <div className="num text-lg sm:text-xl font-bold text-ink">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {employees.map(emp => {
          const roleColor = roleColors[emp.role] || "bg-nv-100 text-ink";
          return (
            <div
              key={emp.id}
              className="bg-white rounded-2xl border border-nv-200 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-fast"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative group flex-shrink-0">
                      {emp.photo ? (
                        <img
                          src={emp.photo}
                          alt={emp.name}
                          className="w-12 h-12 rounded-2xl object-cover shadow-xs border border-nv-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl border border-nv-200 flex items-center justify-center text-ink">
                          <User size={22} />
                        </div>
                      )}
                      <label
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-nv-200 shadow-xs flex items-center justify-center text-ink cursor-pointer hover:bg-nv-50 transition-fast"
                        title={isBn ? "ছবি পরিবর্তন / আপলোড করুন" : "Upload / change photo"}
                      >
                        <Camera size={11} className="text-ink" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                updateEmployee(emp.id, { photo: reader.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-ink">{isBn ? emp.nameBn : emp.name}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${roleColor}`}>
                        {isBn ? emp.roleBn : emp.role}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteEmployee(emp.id)}
                    className="p-1.5 rounded-lg text-ink hover:text-ink hover:bg-red-50 transition-fast"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-nv-50 p-3 rounded-xl text-center my-3">
                  <div>
                    <div className="text-[10px] text-ink">{isBn ? "Bosome Akatua" : "Salary"}</div>
                    <div className="num font-bold text-sm text-ink">{formatTaka(emp.salary)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-ink">{isBn ? "মোবাইল" : "Contact"}</div>
                    <div className="text-xs font-mono text-ink truncate">{emp.phone}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-ink">{isBn ? "Ka hoদান" : "Joined"}</div>
                    <div className="text-xs text-ink">{emp.joined}</div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-nv-100 flex items-center justify-between gap-2">
                <span className="text-xs text-ink">
                  Last Paid: <span className="font-semibold text-ink">{emp.lastPaid || "This Month"}</span>
                </span>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${emp.phone}`}
                    className="p-2 rounded-xl bg-nv-100 hover:bg-nv-200 text-ink transition-fast"
                    title="Call"
                  >
                    <Phone size={14} />
                  </a>
                  <button
                    onClick={() => setPayingEmployee(emp)}
                    className="px-4 py-2 bg-em-700 hover:bg-em-800 text-white rounded-xl text-xs font-bold shadow-xs transition-fast"
                  >
                    {isBn ? "Akatua (Salary) Nna" : "Pay Salary"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-nv-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-nv-100">
              <h3 className="font-bold text-ink text-base">{isBn ? "Fa Adwumayɛfoɔ Foforɔ Ka Ho যুক্ত করুন" : "Add Employee"}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-ink hover:text-ink">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-ink mb-1">{isBn ? "নাম" : "Full Name"} *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Mahfuzur Rahman"
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
                />
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">{isBn ? "Dibea / দায়িত্ব" : "Role / Position"} *</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 bg-white focus:border-em-500"
                >
                  <option value="Cashier">Cashier / Cashier</option>
                  <option value="Sales Staff">Sales Staff / Tɔn কর্মী</option>
                  <option value="Store Manager">Store Manager / ম্যানেজার</option>
                  <option value="Inventory Staff">Inventory Staff / Akorae Staff</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">{isBn ? "মোবাইল নম্বর" : "Mobile Phone"} *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="024 000 0000"
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">{isBn ? "Akatua / Bosome (₵)" : "Monthly Salary (₵)"} *</label>
                <input
                  type="number"
                  required
                  value={salary}
                  onChange={e => setSalary(e.target.value)}
                  placeholder="1200"
                  className="num w-full border border-nv-200 rounded-xl px-3 py-2 font-bold text-ink focus:border-em-500"
                />
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">{isBn ? "Adwumayɛfoɔর ছবি (ঐচ্ছিক)" : "Employee Photo (Optional)"}</label>
                <div className="flex items-center gap-3">
                  {photo ? (
                    <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-nv-200 shadow-xs flex-shrink-0">
                      <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhoto("")}
                        className="absolute top-0 right-0 bg-black/60 text-white p-0.5 rounded-bl-lg hover:bg-black/80"
                        title="Remove"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-2xl border border-nv-200 flex items-center justify-center text-ink flex-shrink-0">
                      <User size={22} />
                    </div>
                  )}
                  <label className="cursor-pointer px-3 py-2 border border-nv-200 rounded-xl text-xs font-semibold text-ink bg-white hover:bg-nv-50 flex items-center gap-1.5 transition-fast shadow-2xs">
                    <Camera size={13} className="text-ink/70" />
                    <span>{photo ? (isBn ? "ছবি পরিবর্তন" : "Change Photo") : (isBn ? "Fa Mfoni Gu So করুন" : "Upload Photo")}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setPhoto(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-nv-200 rounded-xl font-semibold text-ink hover:bg-nv-50"
                >
                  {isBn ? "Gyae (Cancel)" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-em-700 hover:bg-em-800 text-white rounded-xl font-bold shadow-md"
                >
                  {isBn ? "Kora so করুন" : "Save Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Salary Modal */}
      {payingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-nv-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-nv-100">
              <h3 className="font-bold text-ink text-base">{isBn ? "Tua Akatua" : "Pay Salary"}</h3>
              <button onClick={() => setPayingEmployee(null)} className="text-ink hover:text-ink">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePaySalarySubmit} className="space-y-3 text-xs sm:text-sm">
              <div className="p-3 bg-nv-50 rounded-xl space-y-1">
                <div className="font-bold text-ink">{payingEmployee.name} ({payingEmployee.role})</div>
                <div className="text-xs text-ink">Salary Amount: <span className="num font-bold text-ink">{formatTaka(payingEmployee.salary)}</span></div>
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">{isBn ? "পরিশোধ Kwan a Wɔfaa So (Account)" : "Payment Account"}</label>
                <select
                  value={payAccountId}
                  onChange={e => setPayAccountId(e.target.value)}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 bg-white focus:border-em-500"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatTaka(a.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayingEmployee(null)}
                  className="flex-1 py-2.5 border border-nv-200 rounded-xl font-semibold text-ink hover:bg-nv-50"
                >
                  {isBn ? "Gyae (Cancel)" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-em-700 hover:bg-em-800 text-white rounded-xl font-bold shadow-md"
                >
                  {isBn ? "Akatua (Salary) নিশ্চিত করুন" : "Confirm Payout"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
