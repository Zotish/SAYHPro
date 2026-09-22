import { useState } from "react";
import {
  Truck, Plus, Search, CheckCircle, MapPin,
  Phone, User, ArrowRight, ExternalLink, RefreshCw, Filter,
  DollarSign, AlertCircle, Navigation, ArrowLeft
} from "lucide-react";
import { useApp, CourierParcel } from "../context/AppContext";
import { toast } from "../components/Toast";

interface DeliveryAggregatorProps {
  lang: "en" | "bn";
  setScreen: (s: string) => void;
  onBack?: () => void;
}

export default function DeliveryAggregator({ lang, setScreen, onBack }: DeliveryAggregatorProps) {
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

  const deliveryFee = zone === "inside_dhaka" ? 20 : zone === "sub_dhaka" ? 30 : 45;

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
    { id: "all", name: "All Couriers", nameBn: "Nyinaa Kɔmafoɔ", logo: "📦" },
    { id: "steadfast", name: "Steadfast Courier", nameBn: "স্টেডফাস্ট", logo: "⚡", active: true },
    { id: "pathao", name: "Pathao Courier", nameBn: "পাঠাও Kɔmafoɔ", logo: "🛵", active: true },
    { id: "redx", name: "RedX Delivery", nameBn: "রেডএক্স", logo: "🔴", active: true },
    { id: "ecourier", name: "eCourier BD", nameBn: "ই-Kɔmafoɔ", logo: "🚚", active: true },
  ];

  const totalCodPending = courierParcels
    .filter(p => !p.codSettled)
    .reduce((sum, p) => sum + p.codAmount, 0);

  return (
    <div className="p-4 sm:p-6 space-y-6 pb-28 lg:pb-8">
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
          onClick={() => setShowBookModal(true)}
          className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-em-700 hover:bg-em-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-fast"
        >
          <Plus size={16} />
          <span>{isBn ? "Otɔfo Foforɔ পার্সেল বুক করুন" : "Book New Parcel"}</span>
        </button>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-nv-200">
          <div className="text-xs text-ink/70 font-medium mb-1">{isBn ? "Nyinaa পার্সেল" : "Total Parcels"}</div>
          <div className="num text-xl sm:text-2xl font-bold text-ink">
            {tNum(courierParcels.length)}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-nv-200">
          <div className="text-xs text-ink/70 font-medium mb-1">{isBn ? "Aka সিওডি" : "Pending COD"}</div>
          <div className="num text-xl sm:text-2xl font-bold text-ink">
            {formatTaka(totalCodPending)}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-nv-200">
          <div className="text-xs text-ink/70 font-medium mb-1">{isBn ? "Delivery রেট" : "Success Rate"}</div>
          <div className="num text-xl sm:text-2xl font-bold text-ink">
            {tNum("96.8")}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-nv-200">
          <div className="text-xs text-ink/70 font-medium mb-1">{isBn ? "Delivery সময়" : "Delivery Time"}</div>
          <div className="num text-xl sm:text-2xl font-bold text-ink">
            {tNum("24")}
          </div>
        </div>
      </div>

      {/* Courier Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-nv-200">
        {couriersList.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCourier(c.id)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all
              ${activeCourier === c.id ? "bg-em-700 text-white shadow-xs" : "bg-white border border-nv-200 text-ink hover:bg-nv-50"}`}
          >
            {isBn ? c.nameBn : c.name}
          </button>
        ))}
      </div>

      {/* Parcels List Table */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-nv-200 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-ink text-base">{isBn ? "ট্র্যাকিং" : "Tracking"}</h3>
          <span className="text-xs text-ink font-semibold">{tNum(filteredParcels.length)} {isBn ? "টি পার্সেল" : "parcels"}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-nv-50 border-b border-nv-200">
                <th className="px-4 py-3 font-bold text-ink">Tracking Code & Courier</th>
                <th className="px-4 py-3 font-bold text-ink">Customer & Destination</th>
                <th className="px-4 py-3 font-bold text-ink text-right">COD Amount</th>
                <th className="px-4 py-3 font-bold text-ink text-right">Delivery Fee</th>
                <th className="px-4 py-3 font-bold text-ink text-center">Status</th>
                <th className="px-4 py-3 font-bold text-ink text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nv-100">
              {filteredParcels.map(p => (
                <tr key={p.id} className="hover:bg-nv-50 transition-fast">
                  <td className="px-4 py-3 font-semibold text-ink">
                    <div className="font-mono font-bold">{p.trackingCode}</div>
                    <span className="text-[10px] uppercase font-bold text-ink bg-em-50 px-2 py-0.5 rounded-full">
                      {p.courier}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-ink">{p.customerName}</div>
                    <div className="text-[11px] text-ink flex items-center gap-1">
                      <MapPin size={11} /> {p.destination} ({p.customerPhone})
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-extrabold text-ink">
                    {formatTaka(p.codAmount)}
                  </td>
                  <td className="px-4 py-3 text-right text-ink font-bold">
                    {formatTaka(p.deliveryFee)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize
                      ${p.status === "delivered" ? "bg-em-50 text-ink" :
                        p.status === "in_transit" ? "bg-nv-50 text-ink" :
                        p.status === "picked_up" ? "bg-nv-50 text-ink" : "bg-ac-50 text-ink"}`}>
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
                <Truck size={20} className="text-ink" />
                <h3 className="font-display font-bold text-ink text-lg">{isBn ? "Kɔmafoɔ Parcel বুক করুন" : "Book Courier Parcel"}</h3>
              </div>
              <button onClick={() => setShowBookModal(false)} className="text-ink hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleBookParcel} className="space-y-3.5 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-ink mb-1">{isBn ? "Kɔmafoɔ সার্ভিস নির্বাচন" : "Select Courier"} *</label>
                  <select
                    value={courier}
                    onChange={e => setCourier(e.target.value as any)}
                    className="w-full border border-nv-200 rounded-xl px-3 py-2 bg-white font-semibold"
                  >
                    <option value="steadfast">Yango Delivery (Express COD)</option>
                    <option value="pathao">Bolt Courier Ghana</option>
                    <option value="redx">Glovo Business Logistics</option>
                    <option value="ecourier">Swift Ghana Delivery</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">{isBn ? "Kɔmafoɔ Beaeɛ" : "Delivery Zone"}</label>
                  <select
                    value={zone}
                    onChange={e => setZone(e.target.value as any)}
                    className="w-full border border-nv-200 rounded-xl px-3 py-2 bg-white font-medium"
                  >
                    <option value="inside_dhaka">Inside Accra (₵ 20)</option>
                    <option value="sub_dhaka">Greater Accra / Tema / Spintex (₵ 30)</option>
                    <option value="outside_dhaka">Upcountry / Kumasi / Takoradi (₵ 45)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">{isBn ? "Otɔfo Din" : "Customer Name"} *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="e.g. Kwame Mensah"
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">{isBn ? "Otɔfo Fon Nɔmba" : "Customer Phone"} *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="024 412 3456"
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">{isBn ? "Beaeɛ Pɔtee a Yɛde Bɛkɔ" : "Full Delivery Address"} *</label>
                <textarea
                  rows={2}
                  required
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  placeholder="House No, Street name, Area (e.g. Osu, East Legon, Cantonments, Accra)..."
                  className="w-full border border-nv-200 rounded-xl p-3 focus:border-em-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">{isBn ? "Cash on Delivery (COD) Sika Dodoɔ (₵) *" : "Cash on Delivery (COD) Amount (₵) *"}</label>
                <input
                  type="number"
                  required
                  value={codAmount}
                  onChange={e => setCodAmount(e.target.value)}
                  placeholder="e.g. 240"
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 font-bold text-ink text-base"
                />
              </div>

              <div className="p-3 bg-nv-50 rounded-2xl flex items-center justify-between text-xs font-semibold">
                <span>{isBn ? "Kɔmafoɔ Ka:" : "Courier Charge:"} {formatTaka(deliveryFee)}</span>
                <span className="text-ink">{isBn ? "SMS tracking bɛkɔ otɔfo nkyɛn" : "Auto SMS tracking enabled"}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="flex-1 py-2.5 border border-nv-200 rounded-xl font-semibold text-ink hover:bg-nv-50"
                >
                  {isBn ? "Gyae (Cancel)" : "Cancel"}
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
