import { useState } from "react";
import {
  Landmark, QrCode, CreditCard, DollarSign, CheckCircle2,
  Plus, ArrowRight, Copy, ExternalLink, Sparkles,
  Percent, FileText, Building2, Send, Smartphone, Clock, ArrowLeft
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { toast } from "../components/Toast";

interface FintechBankingProps {
  lang: "en" | "bn";
  setScreen: (s: string) => void;
  onBack?: () => void;
}

export default function FintechBanking({ lang, setScreen, onBack }: FintechBankingProps) {
  const {
    bankApplications,
    smeLoanOffers,
    digitalPayments,
    paymentLinks,
    applyBankKYC,
    applySMELoan,
    createPaymentLink,
    updatePaymentConfig,
    sales,
    tNum,
    formatTaka
  } = useApp();

  const isBn = lang === "bn";
  const [activeTab, setActiveTab] = useState<"banking" | "loans" | "payments">("banking");

  // Modals
  const [showKycModal, setShowKycModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedLoanOffer, setSelectedLoanOffer] = useState(smeLoanOffers[0]);

  // Form State: Bank KYC
  const [bankName, setBankName] = useState("BRAC Bank Digital Merchant");
  const [accountType, setAccountType] = useState<"current" | "merchant_wallet" | "islamic_business">("current");
  const [nidNumber, setNidNumber] = useState("");
  const [tradeLicense, setTradeLicense] = useState("");

  // Form State: Payment Link
  const [custName, setCustName] = useState("");
  const [linkAmount, setLinkAmount] = useState("");
  const [linkPurpose, setLinkPurpose] = useState("");

  const monthlyTurnover = sales.reduce((sum, s) => sum + s.grandTotal, 0) * 12; // annualized estimate

  const handleCreateBankKYC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nidNumber || !tradeLicense) return;

    applyBankKYC(bankName, accountType, nidNumber, tradeLicense);
    setShowKycModal(false);
    setNidNumber("");
    setTradeLicense("");
  };

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !linkAmount) return;

    createPaymentLink(custName, Number(linkAmount), linkPurpose || "Store Order");
    setShowLinkModal(false);
    setCustName("");
    setLinkAmount("");
    setLinkPurpose("");
  };

  const handleConfirmLoan = () => {
    if (!selectedLoanOffer) return;
    applySMELoan(selectedLoanOffer.id, selectedLoanOffer.eligibleAmount);
    setShowLoanModal(false);
  };

  const getShortBankName = (name: string) => {
    if (name.includes("Ecobank")) return isBn ? "Ecobank Ghana" : "Ecobank Ghana";
    if (name.includes("MTN MoMo")) return isBn ? "MTN MoMo Enterprise" : "MTN MoMo Enterprise";
    if (name.includes("GCB")) return isBn ? "GCB Bank" : "GCB Bank";
    return name;
  };

  const formatAccountType = (type: string) => {
    if (type === "current") return isBn ? "Current Account" : "Current";
    if (type === "merchant_wallet") return isBn ? "Merchant MoMo Wallet" : "Merchant Wallet";
    if (type === "islamic_business") return isBn ? "Commercial Business" : "Islamic Business";
    return type.replace("_", " ");
  };

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

        <div className="ml-auto flex items-center gap-2">
          {activeTab === "banking" && (
            <button
              onClick={() => setShowKycModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-em-700 hover:bg-em-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-fast whitespace-nowrap"
            >
              <Plus size={16} />
              <span>{isBn ? "Bue Sikakorabea Akawnt Foforɔ" : "Open Bank Account"}</span>
            </button>
          )}

          {activeTab === "payments" && (
            <button
              onClick={() => setShowLinkModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-em-700 hover:bg-em-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-fast whitespace-nowrap"
            >
              <Plus size={16} />
              <span>{isBn ? "পেমেন্ট লিঙ্ক তৈরি করুন" : "Create Payment Link"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-nv-200">
        <button
          onClick={() => setActiveTab("banking")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all
            ${activeTab === "banking" ? "bg-em-700 text-white shadow-xs" : "bg-white border border-nv-200 text-ink hover:bg-nv-50"}`}
        >
          <span>{isBn ? "Sikakorabeaিং" : "Banking"}</span>
        </button>

        <button
          onClick={() => setActiveTab("loans")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all
            ${activeTab === "loans" ? "bg-em-700 text-white shadow-xs" : "bg-white border border-nv-200 text-ink hover:bg-nv-50"}`}
        >
          <span>{isBn ? "লোন" : "Loans"}</span>
        </button>

        <button
          onClick={() => setActiveTab("payments")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all
            ${activeTab === "payments" ? "bg-em-700 text-white shadow-xs" : "bg-white border border-nv-200 text-ink hover:bg-nv-50"}`}
        >
          <span>{isBn ? "পেমেন্ট" : "Payments"}</span>
        </button>
      </div>

      {/* TAB 1: BANK ACCOUNT CREATION */}
      {activeTab === "banking" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bankApplications.map(app => (
              <div key={app.id} className="bg-white rounded-3xl p-5 shadow-sm border border-nv-200 space-y-4 hover:border-em-400 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-base text-ink">{getShortBankName(app.bankName)}</h3>
                      <span className="text-xs text-ink/70 capitalize block mt-0.5">{formatAccountType(app.accountType)}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-em-50 text-ink flex items-center gap-1 flex-shrink-0">
                      <CheckCircle2 size={12} /> {isBn ? (app.status === "active" ? "সক্রিয়" : "অনুমোদিত") : app.status}
                    </span>
                  </div>

                  <div className="mt-4 p-3 bg-nv-50 rounded-2xl space-y-1">
                    <span className="text-[10px] text-ink/70 uppercase font-semibold">{isBn ? "অ্যাকাউন্ট নং" : "Account No"}</span>
                    <div className="font-mono font-bold text-sm text-ink">{app.accountNumber}</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-nv-100 flex items-center justify-between text-xs">
                  <span className="text-ink/70">{isBn ? "কেওয়াইসি:" : "KYC:"}</span>
                  <span className="font-bold text-ink">{isBn ? "১০০% ভেরিফাইড" : "100% Verified"}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-nv-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <h3 className="font-display font-extrabold text-xl">{isBn ? "Sikakorabea অ্যাকাউন্ট খুলুন" : "Open Bank Account"}</h3>
              <p className="text-xs text-nv-100 max-w-xl leading-relaxed">
                {isBn
                  ? "এনআইডি ও ট্রেড লাইসেন্স দিয়ে দ্রুত অ্যাকাউন্ট চালু করুন।"
                  : "Upload NID and trade license to activate your account instantly."}
              </p>
            </div>

            <button
              onClick={() => setShowKycModal(true)}
              className="self-start md:self-auto px-5 py-3 bg-em-700 hover:bg-em-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all whitespace-nowrap"
            >
              {isBn ? "আবেদন করুন" : "Apply Now"} →
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: SME LOANS */}
      {activeTab === "loans" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {smeLoanOffers.map(loan => (
              <div key={loan.id} className="bg-white rounded-3xl p-5 shadow-sm border border-nv-200 hover:border-nv-400 transition-all flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-nv-50 text-ink">
                      {loan.status === "disbursed" ? (isBn ? "বিতরণকৃত" : "Active Disbursed") : (isBn ? "প্রাক-অনুমোদিত" : "Pre-Approved")}
                    </span>
                    <span className="text-xs font-mono font-bold text-ink">{loan.interestRate}% Interest</span>
                  </div>

                  <h3 className="font-bold text-base text-ink mt-3">{loan.bankPartner}</h3>
                  <div className="text-2xl font-extrabold text-ink mt-1">
                    {formatTaka(loan.eligibleAmount)}
                  </div>

                  <div className="mt-4 pt-3 border-t border-nv-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-ink/70">{isBn ? "মেয়াদ" : "Tenure"}</span>
                      <div className="font-bold text-ink text-sm mt-0.5">{tNum(loan.tenureMonths)} {isBn ? "Bosome" : "Months"}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-ink/70">{isBn ? "Bosomeিক কিস্তি" : "Monthly EMI"}</span>
                      <div className="font-bold text-ink text-sm mt-0.5">{formatTaka(loan.monthlyEMI)}</div>
                    </div>
                  </div>
                </div>

                <button
                  disabled={loan.status === "disbursed"}
                  onClick={() => {
                    setSelectedLoanOffer(loan);
                    setShowLoanModal(true);
                  }}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-fast
                    ${loan.status === "disbursed" ? "bg-nv-100 text-ink cursor-not-allowed" : "bg-em-700 hover:bg-em-800 text-white shadow-md"}`}
                >
                  {loan.status === "disbursed" ? (isBn ? "ঋণ সক্রিয় রয়েছে" : "Loan Active") : (isBn ? "ঋণের জন্য আবেদন করুন" : "Apply Instantly")}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DIGITAL PAYMENTS & BANGLA QR */}
      {activeTab === "payments" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dynamic Bangla QR Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-nv-200 flex flex-col items-center text-center space-y-4">
            <div className="inline-flex items-center px-3 py-0.5 rounded-full bg-white border border-nv-200 text-ink text-xs font-bold">
              BANGLA QR
            </div>

            {/* QR Visual */}
            <div className="p-4 bg-white border-2 border-dashed border-em-300 rounded-3xl shadow-sm flex flex-col items-center">
              <div className="w-48 h-48 bg-nv-900 rounded-2xl flex items-center justify-center p-3 text-white">
                <div className="w-full h-full border-4 border-white rounded-xl flex items-center justify-center font-mono text-[10px] text-center p-2 bg-nv-900">
                  <div className="space-y-1">
                    <QrCode size={64} className="mx-auto text-em-400" />
                    <span className="font-bold text-white tracking-widest">GhQR</span>
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-ink mt-2">Kofi Provisions Mart (GhQR Merchant ID: 89410)</span>
            </div>

            <button
              onClick={() => toast({ type: "success", title: isBn ? "GhQR Print Asiesie!" : "Print Ready!", message: "GhQR downloaded for store counter display." })}
              className="px-4 py-2 border border-nv-200 hover:bg-nv-50 text-ink rounded-xl text-xs font-bold transition-fast"
            >
              {isBn ? "Tintim GhQR Standee" : "Download GhQR Standee Print"}
            </button>
          </div>

          {/* Payment Links List */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-nv-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-nv-100">
              <h3 className="font-display font-bold text-ink text-base">{isBn ? "পেমেন্ট লিঙ্কসমূহ" : "Active Payment Links"}</h3>
              <button
                onClick={() => setShowLinkModal(true)}
                className="text-xs text-ink font-bold hover:underline flex items-center gap-1"
              >
                <Plus size={14} /> {isBn ? "Otɔfo Foforɔ লিঙ্ক" : "Create Link"}
              </button>
            </div>

            <div className="space-y-3">
              {paymentLinks.map(link => (
                <div
                  key={link.id}
                  className="p-4 rounded-2xl bg-nv-50 border border-nv-200/60 flex items-center justify-between gap-3 sm:gap-4"
                >
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="font-bold text-sm text-ink truncate">{link.customerName}</div>
                    <div className="text-xs text-ink/70 truncate">{link.purpose} ({tNum(link.createdDate)})</div>
                    <div className="font-mono text-[11px] text-ink mt-1 flex items-center gap-1.5 min-w-0">
                      <span className="truncate">{link.linkUrl}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(link.linkUrl);
                          toast({ type: "success", title: "Copied!", message: "Link copied to clipboard" });
                        }}
                        className="cursor-pointer text-ink/60 hover:text-ink flex-shrink-0"
                        title="Copy link"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 flex flex-col items-end justify-center">
                    <div className="font-extrabold text-base text-ink whitespace-nowrap">{formatTaka(link.amount)}</div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase inline-block mt-0.5 whitespace-nowrap
                      ${link.status === "paid" ? "bg-em-50 text-ink" : "bg-ac-50 text-ink"}`}>
                      {link.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Bank Account KYC */}
      {showKycModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-nv-200 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-nv-100">
              <div className="flex items-center gap-2">
                <Landmark size={20} className="text-ink" />
                <h3 className="font-display font-bold text-ink text-lg">{isBn ? "ডিজিটাল Sikakorabea অ্যাকাউন্ট খুলুন" : "Open Digital Bank Account"}</h3>
              </div>
              <button onClick={() => setShowKycModal(false)} className="text-ink hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleCreateBankKYC} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-ink mb-1">{isBn ? "Paw Sikakorabea" : "Select Bank / Partner"} *</label>
                <select
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 bg-white font-medium"
                >
                  <option value="Ecobank Ghana Business Account">Ecobank Ghana Business Account</option>
                  <option value="GCB Bank SME Account">GCB Bank SME Account</option>
                  <option value="MTN MoMo Enterprise Wallet">MTN MoMo Enterprise Wallet</option>
                  <option value="Telecel Cash Merchant Wallet">Telecel Cash Merchant Wallet</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">{isBn ? "Ghana Card PIN (GHA-...)" : "Ghana Card PIN (GHA-...)"} *</label>
                <input
                  type="text"
                  required
                  value={nidNumber}
                  onChange={e => setNidNumber(e.target.value)}
                  placeholder="e.g. GHA-721094821-4"
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">{isBn ? "RGD Adwuma Krataa Nɔmba" : "RGD Business Registration No."} *</label>
                <input
                  type="text"
                  required
                  value={tradeLicense}
                  onChange={e => setTradeLicense(e.target.value)}
                  placeholder="e.g. CS-99412-2024"
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKycModal(false)}
                  className="flex-1 py-2.5 border border-nv-200 rounded-xl font-semibold text-ink hover:bg-nv-50"
                >
                  {isBn ? "Gyae (Cancel)" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-em-700 hover:bg-em-800 text-white rounded-xl font-bold shadow-md"
                >
                  {isBn ? "সাবমিট ও অ্যাক্টিভ করুন" : "Submit KYC"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Apply SME Loan */}
      {showLoanModal && selectedLoanOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-nv-200 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-nv-100">
              <div className="flex items-center gap-2">
                <Percent size={20} className="text-ink" />
                <h3 className="font-display font-bold text-ink text-lg">{isBn ? "এসএমই লোন অনুমোদন" : "Instant SME Loan Disbursal"}</h3>
              </div>
              <button onClick={() => setShowLoanModal(false)} className="text-ink hover:text-ink">✕</button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-4 bg-em-50 rounded-2xl space-y-1">
                <span className="text-xs text-ink font-semibold">{selectedLoanOffer.bankPartner}</span>
                <div className="text-2xl font-extrabold text-ink">{formatTaka(selectedLoanOffer.eligibleAmount)}</div>
                <p className="text-[11px] text-ink">Pre-approved based on Rahim Store POS turnover</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-nv-50 rounded-xl">
                  <span className="text-ink">Monthly EMI</span>
                  <div className="font-bold text-sm text-ink">{formatTaka(selectedLoanOffer.monthlyEMI)}</div>
                </div>
                <div className="p-3 bg-nv-50 rounded-xl">
                  <span className="text-ink">Tenure</span>
                  <div className="font-bold text-sm text-ink">{tNum(selectedLoanOffer.tenureMonths)} Months</div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLoanModal(false)}
                  className="flex-1 py-2.5 border border-nv-200 rounded-xl font-semibold text-ink hover:bg-nv-50"
                >
                  {isBn ? "Gyae (Cancel)" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLoan}
                  className="flex-1 py-2.5 bg-em-700 hover:bg-em-800 text-white rounded-xl font-bold shadow-md"
                >
                  {isBn ? "Gye Sika No Wɔ Sikakorabea" : "Disburse to Bank"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Payment Link */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-nv-200 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-nv-100">
              <div className="flex items-center gap-2">
                <QrCode size={20} className="text-ink" />
                <h3 className="font-display font-bold text-ink text-lg">{isBn ? "পেমেন্ট লিঙ্ক তৈরি করুন" : "Create Payment Link"}</h3>
              </div>
              <button onClick={() => setShowLinkModal(false)} className="text-ink hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleCreateLink} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-ink mb-1">{isBn ? "Otɔfoɔের নাম" : "Customer Name"} *</label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={e => setCustName(e.target.value)}
                  placeholder="e.g. Kwame Mensah"
                  className="w-full border border-nv-200 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">{isBn ? "Sika Dodoɔ (₵)" : "Amount (₵)"} *</label>
                <input
                  type="number"
                  required
                  value={linkAmount}
                  onChange={e => setLinkAmount(e.target.value)}
                  placeholder="e.g. 250"
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 font-bold text-ink text-base"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">{isBn ? "বিবরণ / উদ্দেশ্য" : "Payment Purpose"}</label>
                <input
                  type="text"
                  value={linkPurpose}
                  onChange={e => setLinkPurpose(e.target.value)}
                  placeholder="e.g. Grocery Delivery Settlement"
                  className="w-full border border-nv-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="flex-1 py-2.5 border border-nv-200 rounded-xl font-semibold text-ink hover:bg-nv-50"
                >
                  {isBn ? "Gyae (Cancel)" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-em-700 hover:bg-em-800 text-white rounded-xl font-bold shadow-md"
                >
                  {isBn ? "লিঙ্ক তৈরি করুন" : "Generate Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
