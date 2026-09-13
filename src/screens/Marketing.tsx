import { useState } from "react";
import {
  MessageSquare, Share2, Send, Plus, Users, Sparkles, CheckCircle2,
  TrendingUp, RefreshCw, Smartphone, ExternalLink,
  DollarSign, BarChart3, AlertCircle, ShoppingCart, ArrowLeft
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { toast } from "../components/Toast";

const FacebookIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

interface MarketingProps {
  lang: "en" | "bn";
  setScreen: (s: string) => void;
  onBack?: () => void;
}

export default function Marketing({ lang, setScreen, onBack }: MarketingProps) {
  const {
    smsCampaigns,
    smsBalance,
    metaAdSync,
    sendSMSCampaign,
    updateMetaSync,
    topupSMSBalance,
    customers,
    products,
    tNum,
    formatTaka
  } = useApp();

  const isBn = lang === "bn";
  const [tab, setTab] = useState<"sms" | "facebook" | "templates">("sms");

  // New SMS Campaign Modal
  const [showNewSmsModal, setShowNewSmsModal] = useState(false);
  const [showTopupModal, setShowTopupModal] = useState(false);

  // Form State
  const [campaignTitle, setCampaignTitle] = useState("");
  const [campaignTitleBn, setCampaignTitleBn] = useState("");
  const [campaignType, setCampaignType] = useState<"promotional" | "due_reminder" | "festival" | "new_arrival">("promotional");
  const [targetAudience, setTargetAudience] = useState<"all" | "dues" | "vip">("all");
  const [smsText, setSmsText] = useState("");
  const [smsTextBn, setSmsTextBn] = useState("");

  const recipientCount = targetAudience === "all"
    ? Math.max(customers.length * 15, 120)
    : targetAudience === "dues"
    ? customers.filter(c => c.due > 0).length || 7
    : customers.filter(c => c.status === "vip").length || 15;

  const estimatedCost = (recipientCount * 0.40); // 40 paisa per SMS

  const handleSendCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsText.trim() && !smsTextBn.trim()) return;

    if (smsBalance < recipientCount) {
      toast({
        type: "error",
        title: isBn ? "অপর্যাপ্ত এসএমএস ব্যালেন্স" : "Insufficient SMS Balance",
        message: isBn ? "অনুগ্রহ করে এসএমএস ব্যালেন্স রিচার্জ করুন।" : "Please recharge your SMS credit balance.",
      });
      setShowTopupModal(true);
      return;
    }

    sendSMSCampaign({
      title: campaignTitle || "Promotional Broadcast",
      titleBn: campaignTitleBn || "প্রচারণামূলক এসএমএস",
      type: campaignType,
      recipientCount,
      message: smsText || smsTextBn,
      messageBn: smsTextBn || smsText,
      cost: estimatedCost,
    });

    setShowNewSmsModal(false);
    setCampaignTitle("");
    setCampaignTitleBn("");
    setSmsText("");
    setSmsTextBn("");
  };

  const templates = [
    {
      title: "Friday Discount Offer",
      titleBn: "শুক্রবার বিশেষ ছাড়",
      type: "promotional",
      en: "Dear Customer, Get 10% flat discount on all items this Friday at Rahim Store! Shop now.",
      bn: "সম্মানিত গ্রাহক, শুক্রবার রহিম স্টোরে সকল পণ্যে ১০% বিশেষ ছাড়! আজই আসুন।",
    },
    {
      title: "Due Payment Reminder",
      titleBn: "বাকি পরিশোধের তাগাদা",
      type: "due_reminder",
      en: "Dear Customer, your due balance at Rahim Store is pending. Please settle at your convenience. Thank you!",
      bn: "সম্মানিত গ্রাহক, রহিম স্টোরে আপনার বকেয়া পাওনা রয়েছে। সুবিধাজনক সময়ে পরিশোধের অনুরোধ রইল।",
    },
    {
      title: "Eid Mubarak Greetings",
      titleBn: "ঈদ মোবারক অফার",
      type: "festival",
      en: "Eid Mubarak! Enjoy special combo gifts on purchases above ৳2000 at Rahim Store.",
      bn: "রহিম স্টোরের পক্ষ থেকে ঈদ মোবারক! ২০০০ টাকার কেনাকাটায় আকর্ষণীয় কম্বো উপহার।",
    },
    {
      title: "Fresh Stock Arrival",
      titleBn: "নতুন পণ্যের আগমন",
      type: "new_arrival",
      en: "Fresh harvest mustard oil & premium basmati rice are now in stock at Rahim Store!",
      bn: "খাঁটি সরিষার তেল ও প্রিমিয়াম বাসমতি চালের নতুন চালান এখন রহিম স্টোরে উপলব্ধ!",
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 pb-28 lg:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 flex-nowrap w-full">
        <div className="flex-shrink-0">
          {onBack ? (
            <button
              onClick={onBack}
              aria-label={isBn ? "পেছনে যান" : "Go back"}
              className="lg:hidden flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-nv-100 flex items-center justify-center text-ink active:bg-nv-200"
            >
              <ArrowLeft size={18} />
            </button>
          ) : <div className="w-0" />}
        </div>

        {/* Center: SMS Balance */}
        <div className="flex-1 flex justify-center min-w-0">
          <button
            onClick={() => setShowTopupModal(true)}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 border border-nv-200 rounded-xl text-[11px] sm:text-xs font-semibold text-ink bg-white hover:bg-nv-50 transition-fast shadow-2xs whitespace-nowrap"
          >
            <Smartphone size={13} className="text-ink flex-shrink-0" />
            <span>{isBn ? "ব্যালেন্স: " : "SMS Balance: "} <strong className="text-ink">{tNum(smsBalance)}</strong></span>
          </button>
        </div>

        {/* Right: New Campaign */}
        <div className="flex-shrink-0">
          <button
            onClick={() => setShowNewSmsModal(true)}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-em-700 hover:bg-em-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-fast whitespace-nowrap"
          >
            <Plus size={15} />
            <span>{isBn ? "নতুন ক্যাম্পেইন" : "New Campaign"}</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-nv-200">
          <div className="text-xs text-ink/70 font-medium mb-1">{isBn ? "প্রেরিত এসএমএস" : "SMS Sent"}</div>
          <div className="text-xl sm:text-2xl font-extrabold text-ink">
            {tNum(smsCampaigns.reduce((sum, c) => sum + c.recipientCount, 0))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-nv-200">
          <div className="text-xs text-ink/70 font-medium mb-1">{isBn ? "এসএমএস ক্রেডিট" : "SMS Credits"}</div>
          <div className="text-xl sm:text-2xl font-extrabold text-ink">
            {tNum(smsBalance)}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-nv-200">
          <div className="text-xs text-ink/70 font-medium mb-1">{isBn ? "ক্যাটালগ সিঙ্ক" : "Catalog Sync"}</div>
          <div className="text-xl sm:text-2xl font-extrabold text-ink">
            {tNum(products.length)}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-nv-200">
          <div className="text-xs text-ink/70 font-medium mb-1">{isBn ? "বিজ্ঞাপনের অর্ডার" : "Ad Orders"}</div>
          <div className="text-xl sm:text-2xl font-extrabold text-ink">
            {tNum(metaAdSync.conversions)}
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-nv-200">
        <button
          onClick={() => setTab("sms")}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all
            ${tab === "sms" ? "bg-em-700 text-white shadow-xs" : "bg-white border border-nv-200 text-ink hover:bg-nv-50"}`}
        >
          <MessageSquare size={16} />
          <span>{isBn ? "এসএমএস" : "SMS"}</span>
        </button>

        <button
          onClick={() => setTab("facebook")}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all
            ${tab === "facebook" ? "bg-em-700 text-white shadow-xs" : "bg-white border border-nv-200 text-ink hover:bg-nv-50"}`}
        >
          <FacebookIcon size={16} />
          <span>{isBn ? "ফেসবুক" : "Facebook"}</span>
        </button>

        <button
          onClick={() => setTab("templates")}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all
            ${tab === "templates" ? "bg-em-700 text-white shadow-xs" : "bg-white border border-nv-200 text-ink hover:bg-nv-50"}`}
        >
          <Sparkles size={16} />
          <span>{isBn ? "টেমপ্লেট" : "Templates"}</span>
        </button>
      </div>

      {/* TAB 1: SMS CAMPAIGNS */}
      {tab === "sms" && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-nv-200 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display font-bold text-ink text-base whitespace-nowrap">{isBn ? "ক্যাম্পেইন ইতিহাস" : "Campaign History"}</h3>
            <button
              onClick={() => setShowNewSmsModal(true)}
              className="text-xs text-ink font-bold hover:underline flex items-center gap-1 whitespace-nowrap"
            >
              <Plus size={14} /> {isBn ? "এসএমএস পাঠান" : "Send SMS"}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-nv-50 border-b border-nv-200">
                  <th className="px-4 py-3 font-bold text-ink">Campaign ID & Title</th>
                  <th className="px-4 py-3 font-bold text-ink">Type</th>
                  <th className="px-4 py-3 font-bold text-ink">Message Snippet</th>
                  <th className="px-4 py-3 font-bold text-ink text-right">Recipients</th>
                  <th className="px-4 py-3 font-bold text-ink text-right">Cost</th>
                  <th className="px-4 py-3 font-bold text-ink text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nv-100">
                {smsCampaigns.map(c => (
                  <tr key={c.id} className="hover:bg-nv-50 transition-fast">
                    <td className="px-4 py-3 font-semibold text-ink">
                      <div>{isBn ? c.titleBn : c.title}</div>
                      <span className="text-[10px] text-ink font-mono">{tNum(c.id)} · {tNum(c.date)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-nv-100 text-ink">
                        {c.type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink max-w-xs truncate">
                      {isBn ? c.messageBn : c.message}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-ink">
                      {tNum(c.recipientCount)} {isBn ? "জন" : "users"}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-ink">
                      {formatTaka(c.cost)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold
                        ${c.status === "sent" ? "bg-em-50 text-ink" : "bg-ac-50 text-ink"}`}>
                        {c.status === "sent" ? (isBn ? "প্রেরিত" : "Sent") : (isBn ? "শিডিউলড" : "Scheduled")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: FACEBOOK & META ADS */}
      {tab === "facebook" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Meta Catalog & Pixel Integration */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-nv-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-nv-100 gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-nv-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
                  <FacebookIcon size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display font-bold text-ink text-base whitespace-nowrap">{isBn ? "ক্যাটালগ সিঙ্ক" : "Catalog Sync"}</h3>
                  <span className="text-xs text-ink font-semibold flex items-center gap-1 whitespace-nowrap">
                    <CheckCircle2 size={12} /> {isBn ? "সিঙ্ক সক্রিয়" : "Sync Active"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => updateMetaSync({ catalogSynced: true })}
                className="px-3 py-1.5 bg-nv-100 hover:bg-nv-200 text-ink rounded-xl text-xs font-bold transition-fast flex items-center gap-1 whitespace-nowrap flex-shrink-0"
              >
                <RefreshCw size={12} /> {isBn ? "পুনরায় সিঙ্ক" : "Resync"}
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-3 bg-nv-50 rounded-2xl flex items-center justify-between gap-3">
                <span className="text-ink whitespace-nowrap">{isBn ? "পিক্সেল আইডি" : "Pixel ID"}</span>
                <span className="font-mono font-bold text-ink whitespace-nowrap">{metaAdSync.pixelId}</span>
              </div>
              <div className="p-3 bg-nv-50 rounded-2xl flex items-center justify-between gap-3">
                <span className="text-ink whitespace-nowrap">{isBn ? "সিঙ্ক পণ্য" : "Synced Products"}</span>
                <span className="font-bold text-ink whitespace-nowrap">{tNum(products.length)} {isBn ? "টি পণ্য" : "Products"}</span>
              </div>
              <div className="p-3 bg-nv-50 rounded-2xl flex items-center justify-between gap-3">
                <span className="text-ink whitespace-nowrap">{isBn ? "শপ লিঙ্ক" : "Shop Link"}</span>
                <a href="#" className="text-ink font-bold flex items-center gap-1 hover:underline whitespace-nowrap">
                  fb.com/rahimstorebd <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>

          {/* Ad Campaign Booster */}
          <div className="bg-nv-900 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-nv-500/30 text-nv-200 text-xs font-bold mb-3 border border-nv-400/30">
                {isBn ? "মেটা বিজ্ঞাপন" : "Meta Ads"}
              </div>
              <h3 className="font-display font-extrabold text-xl mb-2">{isBn ? "আপনার পণ্য বুস্ট করুন" : "Boost Your Product"}</h3>
              <p className="text-xs text-nv-100 leading-relaxed mb-4">
                {isBn
                  ? "ফেসবুক ও ইনস্টাগ্রামে বিজ্ঞাপন দিয়ে বেশি কাস্টমার ও অর্ডার পান।"
                  : "Run Facebook & Instagram ads to get more customers and orders."}
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-nv-200 uppercase">{isBn ? "আনুমানিক রিচ" : "Estimated Reach"}</span>
                <div className="text-lg font-bold text-white">{isBn ? "২৫,০০০ - ৫০,০০০" : "25,000 - 50,000"}</div>
              </div>
              <button
                onClick={() => toast({ type: "success", title: isBn ? "বিজ্ঞাপন চালু হয়েছে!" : "Campaign Launched!", message: "Meta Ad will go live after review." })}
                className="px-4 py-2.5 bg-nv-500 hover:bg-nv-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all whitespace-nowrap"
              >
                {isBn ? "বিজ্ঞাপন বুস্ট করুন" : "Launch Ad"} →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: READY TEMPLATES */}
      {tab === "templates" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((tpl, i) => (
            <div key={i} className="bg-white rounded-3xl p-5 shadow-sm border border-nv-200 hover:border-em-400 transition-all flex flex-col justify-between space-y-3">
              <div>
                <div className="mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-em-50 text-ink">
                    {tpl.type.replace("_", " ")}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-ink mb-1">{isBn ? tpl.titleBn : tpl.title}</h4>
                <p className="text-xs text-ink bg-nv-50 p-3 rounded-2xl leading-relaxed">
                  "{isBn ? tpl.bn : tpl.en}"
                </p>
              </div>

              <button
                onClick={() => {
                  setCampaignTitle(tpl.title);
                  setCampaignTitleBn(tpl.titleBn);
                  setSmsText(tpl.en);
                  setSmsTextBn(tpl.bn);
                  setCampaignType(tpl.type as any);
                  setShowNewSmsModal(true);
                }}
                className="w-full py-2 bg-em-700 hover:bg-em-800 text-white rounded-xl text-xs font-bold transition-fast"
              >
                {isBn ? "এই টেমপ্লেট ব্যবহার করুন" : "Use This Template"} →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: New SMS Campaign */}
      {showNewSmsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-nv-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-nv-100">
              <div className="flex items-center gap-2">
                <MessageSquare size={20} className="text-ink" />
                <h3 className="font-display font-bold text-ink text-lg">{isBn ? "নতুন এসএমএস প্রচার" : "Broadcast SMS Campaign"}</h3>
              </div>
              <button onClick={() => setShowNewSmsModal(false)} className="text-ink hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleSendCampaign} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-ink mb-1">{isBn ? "ক্যাম্পেইন শিরোনাম" : "Campaign Title"} *</label>
                <input
                  type="text"
                  required
                  value={isBn ? campaignTitleBn : campaignTitle}
                  onChange={e => isBn ? setCampaignTitleBn(e.target.value) : setCampaignTitle(e.target.value)}
                  placeholder="e.g. Weekend Flash Sale Discount"
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-ink mb-1">{isBn ? "ক্যাম্পেইন টাইপ" : "Type"}</label>
                  <select
                    value={campaignType}
                    onChange={e => setCampaignType(e.target.value as any)}
                    className="w-full border border-nv-200 rounded-xl px-3 py-2 bg-white"
                  >
                    <option value="promotional">Promotional / অফার</option>
                    <option value="due_reminder">Due Reminder / বাকি তাগাদা</option>
                    <option value="festival">Festival / উৎসব</option>
                    <option value="new_arrival">New Arrival / নতুন পণ্য</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">{isBn ? "টার্গেট অডিয়েন্স" : "Target Audience"}</label>
                  <select
                    value={targetAudience}
                    onChange={e => setTargetAudience(e.target.value as any)}
                    className="w-full border border-nv-200 rounded-xl px-3 py-2 bg-white"
                  >
                    <option value="all">All Customers / সকল গ্রাহক ({tNum(Math.max(customers.length * 15, 120))})</option>
                    <option value="dues">Owing Due / বাকিদার গ্রাহক ({tNum(customers.filter(c => c.due > 0).length || 7)})</option>
                    <option value="vip">VIP Customers / ভিআইপি ({tNum(customers.filter(c => c.status === "vip").length || 15)})</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">{isBn ? "এসএমএস মেসেজ টেক্সট" : "SMS Text Content"} *</label>
                <textarea
                  rows={3}
                  required
                  value={isBn ? smsTextBn : smsText}
                  onChange={e => isBn ? setSmsTextBn(e.target.value) : setSmsText(e.target.value)}
                  placeholder={isBn ? "এখানে বাংলায় মেসেজ লিখুন..." : "Type your message here..."}
                  className="w-full border border-nv-200 rounded-xl p-3 focus:border-em-500 font-sans"
                />
                <div className="flex justify-between text-[11px] text-ink mt-1">
                  <span>1 SMS = 160 Chars</span>
                  <span>{((isBn ? smsTextBn : smsText).length)} chars</span>
                </div>
              </div>

              <div className="p-3 bg-em-50 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-ink font-semibold">{isBn ? "প্রাপক সংখ্যা: " : "Recipients: "} {tNum(recipientCount)}</span>
                  <div className="text-[11px] text-ink">{isBn ? "আনুমানিক খরচ: " : "Estimated Cost: "} {formatTaka(estimatedCost)}</div>
                </div>
                <div className="text-right">
                  <span className="text-ink">{isBn ? "বর্তমান ব্যালেন্স:" : "SMS Balance:"}</span>
                  <div className="font-extrabold text-ink">{tNum(smsBalance)} SMS</div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewSmsModal(false)}
                  className="flex-1 py-2.5 border border-nv-200 rounded-xl font-semibold text-ink hover:bg-nv-50"
                >
                  {isBn ? "বাতিল" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-em-700 hover:bg-em-800 text-white rounded-xl font-bold shadow-md flex items-center justify-center gap-1.5"
                >
                  <Send size={15} />
                  <span>{isBn ? "এসএমএস পাঠান" : "Broadcast SMS"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SMS Balance Topup */}
      {showTopupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-nv-200 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-nv-100">
              <div className="flex items-center gap-2">
                <Smartphone size={20} className="text-ink" />
                <h3 className="font-display font-bold text-ink text-lg">{isBn ? "এসএমএস ব্যালেন্স রিচার্জ" : "Recharge SMS Balance"}</h3>
              </div>
              <button onClick={() => setShowTopupModal(false)} className="text-ink hover:text-ink">✕</button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              {[
                { count: 500, price: 200, label: "Starter Pack" },
                { count: 1500, price: 550, label: "Business Value Pack", popular: true },
                { count: 5000, price: 1750, label: "Mega Enterprise Pack" },
              ].map(pkg => (
                <div
                  key={pkg.count}
                  onClick={() => {
                    topupSMSBalance(pkg.count);
                    setShowTopupModal(false);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between
                    ${pkg.popular ? "border-em-500 bg-em-50/50 shadow-xs" : "border-nv-200 hover:border-em-300"}`}
                >
                  <div>
                    <div className="font-bold text-ink text-base">{tNum(pkg.count)} SMS Credits</div>
                    <span className="text-xs text-ink">{pkg.label}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-ink text-base">{formatTaka(pkg.price)}</div>
                    <span className="text-[10px] text-ink">bKash / Nagad</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
