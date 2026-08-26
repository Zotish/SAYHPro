import { useState } from "react";
import {
  Truck, Package, Plus, Search, CheckCircle, Clock, MapPin,
  Phone, User, ArrowRight, ExternalLink, RefreshCw, Filter,
  DollarSign, AlertCircle, Navigation
} from "lucide-react";
import { useApp, CourierParcel } from "../context/AppContext";
import { toast } from "../components/Toast";

interface DeliveryAggregatorProps {
  lang: "en" | "bn";
  setScreen: (s: string) => void;
}

export default function DeliveryAggregator({ lang, setScreen }: DeliveryAggregatorProps) {
  const {
    courierParcels,
    bookCourierParcel,
    updateParcelStatus,
    sales,
    tNum,
    formatTaka
  } = useApp();

  const isBn = lang === "bn";
  const [activeCourier, setActiveCourier] = useState<string>("all");
  const [showBookModal, setShowBookModal] = useState(false);

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [destination, setDestination] = useState("");
  const [courier, setCourier] = useState<"steadfast" | "pathao" | "redx" | "ecourier">("steadfast");
  const [codAmount, setCodAmount] = useState("");
  const [zone, setZone] = useState<"inside_dhaka" | "sub_dhaka" | "outside_dhaka">("inside_dhaka");

  const deliveryFee = zone === "inside_dhaka" ? 60 : zone === "sub_dhaka" ? 100 : 130;

  const handleBookParcel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !destination) return;

    bookCourierParcel({
      customerName,
      customerPhone,
      destination,
      courier,
      codAmount: Number(codAmount) || 0,
      deliveryFee,
      invoiceNo: `INV-${Date.now().toString().slice(-4)}`,
    });

    setShowBookModal(false);
    setCustomerName("");
    setCustomerPhone("");
    setDestination("");
    setCodAmount("");
  };

  const filteredParcels = courierParcels.filter(p =>
    activeCourier === "all" ? true : p.courier === activeCourier
  );

  const couriersList = [
    { id: "all", name: "All Couriers", nameBn: "সকল কুরিয়ার", logo: "📦" },
    { id: "steadfast", name: "Steadfast Courier", nameBn: "স্টেডফাস্ট", logo: "⚡", active: true },
    { id: "pathao", name: "Pathao Courier", nameBn: "পাঠাও কুরিয়ার", logo: "🛵", active: true },
    { id: "redx", name: "RedX Delivery", nameBn: "রেডএক্স", logo: "🔴", active: true },
    { id: "ecourier", name: "eCourier BD", nameBn: "ই-কুরিয়ার", logo: "🚚", active: true },
  ];

  const totalCodPending = courierParcels
    .filter(p => !p.codSettled)
    .reduce((sum, p) => sum + p.codAmount, 0);

  const totalDelivered = courierParcels.filter(p => p.status === "delivered").length;

  return (
    <div className="p-4 sm:p-6 space-y-6 pb-28 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-nv-900">{isBn ? "কুরিয়ার ও ডেলিভারি এগ্রিগেটর" : "Delivery Aggregator Hub"}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-em-100 text-em-700">4 Couriers Connected</span>
          </div>
          <p className="text-nv-500 text-xs sm:text-sm mt-0.5">
            {isBn ? "Steadfast, Pathao, RedX ও eCourier এর মাধ্যমে ১-ক্লিকে পার্সেল বুকিং ও ট্র্যাকিং" : "1-Click multi-courier parcel booking, automated COD reconciliation & live tracking"}
          </p>
        </div>

        <div className="flex gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowBookModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-em-700 hover:bg-em-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-fast"
          >
            <Plus size={16} />
            <span>{isBn ? "নতুন পার্সেল বুক করুন" : "Book New Parcel"}</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-nv-200">
          <div className="flex items-center justify-between text-nv-400 mb-2">
            <span className="text-xs font-semibold uppercase">{isBn ? "মোট বুককৃত পার্সেল" : "Total Parcels"}</span>
            <div className="w-8 h-8 rounded-xl bg-em-50 text-em-700 flex items-center justify-center">
              <Package size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-nv-900">
            {tNum(courierParcels.length)} {isBn ? "টি" : "Parcels"}
          </div>
          <div className="text-[11px] text-nv-500 mt-0.5">{tNum(totalDelivered)} {isBn ? "টি সফল ডেলিভারি" : "delivered"}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-nv-200">
          <div className="flex items-center justify-between text-nv-400 mb-2">
            <span className="text-xs font-semibold uppercase">{isBn ? "অপেক্ষমান সিওডি কালেকশন" : "Pending COD Remittance"}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-700">
            {formatTaka(totalCodPending)}
          </div>
          <div className="text-[11px] text-nv-500 mt-0.5">{isBn ? "কুরিয়ারের কাছ থেকে পাওনা" : "Receivable from couriers"}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-nv-200">
          <div className="flex items-center justify-between text-nv-400 mb-2">
            <span className="text-xs font-semibold uppercase">{isBn ? "ডেলিভারি সাকসেস রেট" : "Success Delivery Rate"}</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <CheckCircle size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-blue-700">
            {tNum("96.8%")}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-0.5">{isBn ? "০.২% রিটার্ন রেট" : "Ultra-low return rate"}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-nv-200">
          <div className="flex items-center justify-between text-nv-400 mb-2">
            <span className="text-xs font-semibold uppercase">{isBn ? "গড় ডেলিভারি সময়" : "Avg Delivery Time"}</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-purple-700">
            {tNum("24")} {isBn ? "ঘণ্টা" : "Hours"}
          </div>
          <div className="text-[11px] text-nv-500 mt-0.5">{isBn ? "ঢাকায় দ্রুততম সার্ভিস" : "Next-day nationwide"}</div>
        </div>
      </div>

      {/* Courier Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-nv-200">
        {couriersList.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCourier(c.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all
              ${activeCourier === c.id ? "bg-em-700 text-white shadow-xs" : "bg-white border border-nv-200 text-nv-700 hover:bg-nv-50"}`}
          >
            <span>{c.logo}</span>
            <span>{isBn ? c.nameBn : c.name}</span>
          </button>
        ))}
      </div>

      {/* Parcels List Table */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-nv-200 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-nv-900 text-base">{isBn ? "পার্সেল ট্র্যাকিং ও বুকিং তালিকা" : "Live Parcels & Tracking Dispatch"}</h3>
          <span className="text-xs text-nv-400 font-semibold">{tNum(filteredParcels.length)} {isBn ? "টি পার্সেল" : "parcels"}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-nv-50 border-b border-nv-200">
                <th className="px-4 py-3 font-bold text-nv-600">Tracking Code & Courier</th>
                <th className="px-4 py-3 font-bold text-nv-600">Customer & Destination</th>
                <th className="px-4 py-3 font-bold text-nv-600 text-right">COD Amount</th>
                <th className="px-4 py-3 font-bold text-nv-600 text-right">Delivery Fee</th>
                <th className="px-4 py-3 font-bold text-nv-600 text-center">Status</th>
                <th className="px-4 py-3 font-bold text-nv-600 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nv-100">
              {filteredParcels.map(p => (
                <tr key={p.id} className="hover:bg-nv-50 transition-fast">
                  <td className="px-4 py-3 font-semibold text-nv-900">
                    <div className="font-mono font-bold">{p.trackingCode}</div>
                    <span className="text-[10px] uppercase font-bold text-em-700 bg-em-50 px-2 py-0.5 rounded-full">
                      {p.courier}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-nv-900">{p.customerName}</div>
                    <div className="text-[11px] text-nv-500 flex items-center gap-1">
                      <MapPin size={11} /> {p.destination} ({p.customerPhone})
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-extrabold text-nv-900">
                    {formatTaka(p.codAmount)}
                  </td>
                  <td className="px-4 py-3 text-right text-nv-600 font-bold">
                    {formatTaka(p.deliveryFee)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize
                      ${p.status === "delivered" ? "bg-em-50 text-em-700" :
                        p.status === "in_transit" ? "bg-blue-50 text-blue-700" :
                        p.status === "picked_up" ? "bg-purple-50 text-purple-700" : "bg-amber-50 text-amber-700"}`}>
                      {p.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <select
                      value={p.status}
                      onChange={e => updateParcelStatus(p.id, e.target.value as any)}
                      className="border border-nv-200 rounded-lg text-xs px-2 py-1 bg-white font-semibold"
                    >
                      <option value="booked">Booked</option>
                      <option value="picked_up">Picked Up</option>
                      <option value="in_transit">In Transit</option>
                      <option value="delivered">Delivered</option>
                      <option value="returned">Returned</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Book Courier Parcel */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-nv-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-nv-100">
              <div className="flex items-center gap-2">
                <Truck size={20} className="text-em-700" />
                <h3 className="font-display font-bold text-nv-900 text-lg">{isBn ? "কুরিয়ার পার্সেল বুক করুন" : "Book Courier Parcel"}</h3>
              </div>
              <button onClick={() => setShowBookModal(false)} className="text-nv-400 hover:text-nv-600">✕</button>
            </div>

            <form onSubmit={handleBookParcel} className="space-y-3.5 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-nv-700 mb-1">{isBn ? "কুরিয়ার সার্ভিস নির্বাচন" : "Select Courier"} *</label>
                  <select
                    value={courier}
                    onChange={e => setCourier(e.target.value as any)}
                    className="w-full border border-nv-200 rounded-xl px-3 py-2 bg-white font-semibold"
                  >
                    <option value="steadfast">Steadfast Courier (Fastest COD)</option>
                    <option value="pathao">Pathao Courier</option>
                    <option value="redx">RedX Delivery</option>
                    <option value="ecourier">eCourier BD</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-nv-700 mb-1">{isBn ? "ডেলিভারি জোন" : "Delivery Zone"}</label>
                  <select
                    value={zone}
                    onChange={e => setZone(e.target.value as any)}
                    className="w-full border border-nv-200 rounded-xl px-3 py-2 bg-white"
                  >
                    <option value="inside_dhaka">Inside Dhaka (৳60)</option>
                    <option value="sub_dhaka">Sub-Dhaka / Savar / Gazipur (৳100)</option>
                    <option value="outside_dhaka">Outside Dhaka (৳130)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-nv-700 mb-1">{isBn ? "গ্রাহকের নাম" : "Customer Name"} *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="e.g. Tanvir Hasan"
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-nv-700 mb-1">{isBn ? "গ্রাহকের মোবাইল নম্বর" : "Customer Phone"} *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="01711-XXXXXX"
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-nv-700 mb-1">{isBn ? "সম্পূর্ণ ডেলিভারি ঠিকানা" : "Full Delivery Address"} *</label>
                <textarea
                  rows={2}
                  required
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  placeholder="House, Road, Area, Thana, District..."
                  className="w-full border border-nv-200 rounded-xl p-3 focus:border-em-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-nv-700 mb-1">{isBn ? "ক্যাশ অন ডেলিভারি (COD) পরিমাণ" : "Cash on Delivery (COD) Amount"} (৳) *</label>
                <input
                  type="number"
                  required
                  value={codAmount}
                  onChange={e => setCodAmount(e.target.value)}
                  placeholder="e.g. 1850"
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 font-bold text-em-700 text-base"
                />
              </div>

              <div className="p-3 bg-nv-50 rounded-2xl flex items-center justify-between text-xs font-semibold">
                <span>{isBn ? "ডেলিভারি চার্জ:" : "Courier Charge:"} {formatTaka(deliveryFee)}</span>
                <span className="text-em-700">{isBn ? "অটোমেটিক ট্র্যাকিং এসএমএস পাঠানো হবে" : "Auto SMS tracking enabled"}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="flex-1 py-2.5 border border-nv-200 rounded-xl font-semibold text-nv-700 hover:bg-nv-50"
                >
                  {isBn ? "বাতিল" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-em-700 hover:bg-em-800 text-white rounded-xl font-bold shadow-md"
                >
                  {isBn ? "পার্সেল বুকিং নিশ্চিত করুন" : "Confirm Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
