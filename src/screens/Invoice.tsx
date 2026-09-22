import { useState } from "react";
import { Printer, Share2, Download, X, ArrowLeft, Phone, MapPin, CheckCircle, Smartphone, Send } from "lucide-react";
import { useApp, Sale } from "../context/AppContext";
import { toast } from "../components/Toast";

interface InvoiceProps {
  lang: "en" | "bn";
  setScreen: (s: string) => void;
}

export default function Invoice({ lang, setScreen }: InvoiceProps) {
  const { currentInvoice, sales, settings, setCurrentInvoice, tNum, formatTaka } = useApp();
  const isBn = lang === "bn";

  const [receiptType, setReceiptType] = useState<"thermal" | "a4">("thermal");
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharePhone, setSharePhone] = useState("");

  const activeSale: Sale = currentInvoice || sales[0] || {
    id: "demo",
    invoiceNo: "INV-1043",
    customer: "Kwame Mensah",
    customerPhone: "024 412 3456",
    items: [
      { name: "Frytol Cooking Oil 5L", nameBn: "Frytol Angwa 5L", qty: 2, price: 135, discount: 0 },
      { name: "Gino Jasmine Rice 5kg", nameBn: "Gino Ɛmo 5kg", qty: 1, price: 105, discount: 0 },
    ],
    subtotal: 375,
    discount: 0,
    vat: 0,
    grandTotal: 375,
    paid: 375,
    due: 0,
    paymentMethod: "cash",
    date: "December 13, 2024",
    time: "6:32 PM",
    status: "completed",
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    toast({
      type: "success",
      title: isBn ? "PDF No Atwe Awie!" : "PDF Downloaded!",
      message: `Invoice ${activeSale.invoiceNo} saved as PDF`,
    });
  };

  const handleShare = () => {
    toast({
      type: "success",
      title: isBn ? "Wɔamane Invois Link No!" : "Invoice Shared via SMS / WhatsApp!",
      message: `Sent to ${sharePhone || activeSale.customerPhone || "customer"}`,
    });
    setShowShareModal(false);
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto pb-24 lg:pb-8 space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setScreen("pos")}
            className="w-10 h-10 rounded-xl bg-white border border-nv-200 flex items-center justify-center hover:bg-nv-50 transition-fast shadow-2xs"
          >
            <ArrowLeft size={18} className="text-ink" />
          </button>
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-ink">
              {isBn ? "Tɔn Tekiti & Invois" : "Invoice & Receipt View"}
            </h1>
            <p className="text-ink text-xs sm:text-sm">{tNum(activeSale.invoiceNo)} · {activeSale.customer}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Format Switcher */}
          <div className="flex items-center bg-white border border-nv-200 rounded-xl p-1 shadow-2xs">
            <button
              onClick={() => setReceiptType("thermal")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-fast
                ${receiptType === "thermal" ? "bg-em-700 text-white" : "text-ink hover:bg-nv-100"}`}
            >
              80mm Thermal
            </button>
            <button
              onClick={() => setReceiptType("a4")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-fast
                ${receiptType === "a4" ? "bg-em-700 text-white" : "text-ink hover:bg-nv-100"}`}
            >
              Standard A4
            </button>
          </div>

          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1 px-3 py-2 border border-nv-200 rounded-xl text-xs font-semibold text-ink bg-white hover:bg-nv-50 transition-fast"
          >
            <Share2 size={14} /> {isBn ? "Kyɛ" : "Share"}
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1 px-3 py-2 border border-nv-200 rounded-xl text-xs font-semibold text-ink bg-white hover:bg-nv-50 transition-fast"
          >
            <Download size={14} /> {isBn ? "PDF" : "PDF"}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-nv-900 hover:bg-black text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-fast"
          >
            <Printer size={15} /> {isBn ? "Tintim Kasaa" : "Print Receipt"}
          </button>
        </div>
      </div>

      {/* Invoices Switcher Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-xs font-semibold text-ink whitespace-nowrap">{isBn ? "Invois a Ɛbaa Nkyɛeɛ:" : "Recent Invoices:"}</span>
        {sales.slice(0, 6).map(s => (
          <button
            key={s.id}
            onClick={() => setCurrentInvoice(s)}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-semibold transition-fast whitespace-nowrap
              ${activeSale.invoiceNo === s.invoiceNo ? "bg-em-700 text-white shadow-2xs" : "bg-white border border-nv-200 text-ink hover:bg-nv-100"}`}
          >
            {tNum(s.invoiceNo)} ({formatTaka(s.grandTotal)})
          </button>
        ))}
      </div>

      {/* Render Area */}
      {receiptType === "thermal" ? (
        /* 80mm POS Thermal Receipt */
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-nv-200 max-w-sm mx-auto font-mono text-xs text-ink leading-relaxed">
          {/* Header */}
          <div className="text-center pb-4 border-b border-dashed border-nv-300">
            <h2 className="font-bold text-lg text-ink">{isBn ? settings.shopNameBn || settings.shopName : settings.shopName}</h2>
            <div className="text-[11px] text-ink font-sans">{settings.address}</div>
            <div className="text-[11px] text-ink font-sans">Tel: {settings.phone}</div>
          </div>

          {/* Metadata */}
          <div className="py-3 border-b border-dashed border-nv-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>{isBn ? "Invois:" : "Invoice:"}</span>
              <span className="font-bold">{tNum(activeSale.invoiceNo)}</span>
            </div>
            <div className="flex justify-between">
              <span>{isBn ? "Da:" : "Date:"}</span>
              <span>{activeSale.date} {tNum(activeSale.time)}</span>
            </div>
            <div className="flex justify-between">
              <span>{isBn ? "Otɔfoɔ:" : "Customer:"}</span>
              <span className="font-bold">{activeSale.customer}</span>
            </div>
            <div className="flex justify-between">
              <span>{isBn ? "Akatua:" : "Payment:"}</span>
              <span className="uppercase font-bold">{activeSale.paymentMethod}</span>
            </div>
          </div>

          {/* Line items */}
          <div className="py-3 border-b border-dashed border-nv-300 space-y-2">
            <div className="flex justify-between font-bold text-[11px] pb-1 border-b border-nv-100">
              <span>{isBn ? "Nnoɔma & Dodoɔ" : "Item & Qty"}</span>
              <span>{isBn ? "Nyinaa" : "Total"}</span>
            </div>
            {activeSale.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="font-semibold text-ink">{isBn ? item.nameBn || item.name : item.name}</div>
                <div className="flex justify-between text-ink text-[11px]">
                  <span>{formatTaka(item.price)} × {tNum(item.qty)}</span>
                  <span className="font-bold text-ink">{formatTaka(item.price * item.qty - item.discount)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="py-3 border-b border-dashed border-nv-300 space-y-1 text-xs">
            <div className="flex justify-between">
              <span>{isBn ? "Nyinaa Nketewa:" : "Subtotal:"}</span>
              <span>{formatTaka(activeSale.subtotal)}</span>
            </div>
            {activeSale.discount > 0 && (
              <div className="flex justify-between text-ink">
                <span>{isBn ? "Boɔ So Teɛ:" : "Discount:"}</span>
                <span>-{formatTaka(activeSale.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-extrabold text-sm text-ink pt-1">
              <span>{isBn ? "NE NYINAA PƐPƐƐPƐ:" : "GRAND TOTAL:"}</span>
              <span>{formatTaka(activeSale.grandTotal)}</span>
            </div>
            <div className="flex justify-between text-ink pt-1">
              <span>{isBn ? "Wɔatua:" : "Paid:"}</span>
              <span>{formatTaka(activeSale.paid)}</span>
            </div>
            {activeSale.due > 0 && (
              <div className="flex justify-between font-bold text-ink">
                <span>{isBn ? "Aka Aka:" : "Due Amount:"}</span>
                <span>{formatTaka(activeSale.due)}</span>
              </div>
            )}
            {activeSale.change && activeSale.change > 0 ? (
              <div className="flex justify-between text-ink font-bold">
                <span>{isBn ? "Nsesaeɛ a Wɔde Ama:" : "Change Returned:"}</span>
                <span>{formatTaka(activeSale.change)}</span>
              </div>
            ) : null}
          </div>

          {/* Footer Note */}
          <div className="pt-4 text-center space-y-1 text-[10px] text-ink font-sans">
            <p className="font-semibold text-ink">{isBn ? "Medaase Pa Ara (Thank You)!" : "Thank you for shopping with us! Medaase!"}</p>
            <p>Software by SAYHPro Ghana</p>
          </div>
        </div>
      ) : (
        /* Standard A4 Formal Invoice */
        <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl border border-nv-200 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-nv-200">
            <div>
              <h2 className="font-display text-2xl font-bold text-ink">{isBn ? settings.shopNameBn || settings.shopName : settings.shopName}</h2>
              <p className="text-sm text-ink">{settings.businessType}</p>
              <p className="text-xs text-ink mt-1">{settings.address}</p>
              <p className="text-xs text-ink">Phone: {settings.phone}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-ink">{isBn ? "Invois" : "INVOICE"}</div>
              <div className="font-mono text-sm font-semibold text-ink">{tNum(activeSale.invoiceNo)}</div>
              <div className="text-xs text-ink mt-1">{isBn ? "Da:" : "Date:"} {activeSale.date}</div>
            </div>
          </div>

          {/* Bill To */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-bold text-ink uppercase tracking-wider mb-1">{isBn ? "Tua Ma" : "Bill To"}</p>
              <p className="font-bold text-ink">{activeSale.customer}</p>
              {activeSale.customerPhone && <p className="text-xs text-ink">{activeSale.customerPhone}</p>}
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-ink uppercase tracking-wider mb-1">{isBn ? "Akatua Gyinabea" : "Payment Status"}</p>
              <span className="inline-block px-3 py-1 bg-em-100 text-ink font-bold text-xs rounded-full uppercase">
                {activeSale.status} ({activeSale.paymentMethod})
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-nv-50 border-b border-nv-200">
                  <th className="p-3 font-bold text-ink">{isBn ? "Nnoɔma Ho Nkyerɛkyerɛmu" : "Item Description"}</th>
                  <th className="p-3 font-bold text-ink text-center">{isBn ? "Dodoɔ" : "Qty"}</th>
                  <th className="p-3 font-bold text-ink text-right">{isBn ? "Baako Boɔ" : "Unit Price"}</th>
                  <th className="p-3 font-bold text-ink text-right">{isBn ? "Nyinaa" : "Total"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nv-100">
                {activeSale.items.map((item, i) => (
                  <tr key={i}>
                    <td className="p-3 font-medium text-ink">{isBn ? item.nameBn || item.name : item.name}</td>
                    <td className="p-3 text-center num">{tNum(item.qty)}</td>
                    <td className="p-3 text-right num">{formatTaka(item.price)}</td>
                    <td className="p-3 text-right num font-bold">{formatTaka(item.price * item.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Totals */}
          <div className="flex justify-end pt-4 border-t border-nv-200">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between text-ink">
                <span>{isBn ? "Nyinaa Nketewa:" : "Subtotal:"}</span>
                <span className="num">{formatTaka(activeSale.subtotal)}</span>
              </div>
              {activeSale.discount > 0 && (
                <div className="flex justify-between text-ink">
                  <span>{isBn ? "Boɔ So Teɛ:" : "Discount:"}</span>
                  <span className="num">-{formatTaka(activeSale.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg text-ink border-t border-nv-200 pt-2">
                <span>{isBn ? "NE NYINAA PƐPƐƐPƐ:" : "Grand Total:"}</span>
                <span className="num text-ink">{formatTaka(activeSale.grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-nv-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-nv-100">
              <h3 className="font-bold text-ink text-base">{isBn ? "Kyɛ Invois No" : "Share Invoice"}</h3>
              <button onClick={() => setShowShareModal(false)} className="text-ink hover:text-ink">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-ink mb-1">{isBn ? "Mobile / WhatsApp" : "Mobile / WhatsApp"}</label>
                <input
                  type="tel"
                  defaultValue={activeSale.customerPhone || "01712-000000"}
                  onChange={e => setSharePhone(e.target.value)}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2"
                />
              </div>
              <div className="p-3 bg-nv-50 rounded-xl text-xs text-ink">
                A direct link to receipt #{tNum(activeSale.invoiceNo)} ({formatTaka(activeSale.grandTotal)}) will be dispatched.
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 py-2.5 border border-nv-200 rounded-xl font-semibold text-ink hover:bg-nv-50"
              >
                {isBn ? "Gyae (Cancel)" : "Cancel"}
              </button>
              <button
                onClick={handleShare}
                className="flex-1 py-2.5 bg-em-700 hover:bg-em-800 text-white rounded-xl font-bold shadow-md flex items-center justify-center gap-1.5"
              >
                <Send size={14} />
                <span>{isBn ? "Mane Seesei" : "Send Now"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
