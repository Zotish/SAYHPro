import { useState } from "react";
import {
  MessageSquare, Share2, Send, Plus, Users, Sparkles, CheckCircle2,
  TrendingUp, RefreshCw, Smartphone, ExternalLink,
  Target, DollarSign, BarChart3, AlertCircle, ShoppingCart
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
}

export default function Marketing({ lang, setScreen }: MarketingProps) {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-ink">{isBn ? "মার্কেটিং ও প্রচারণা হাব" : "Marketing & Growth Hub"}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-nv-100 text-ink">SMS + Meta</span>
          </div>
          <p className="text-ink text-xs sm:text-sm mt-0.5">
            {isBn ? "গ্রাহকদের বাল্ক এসএমএস পাঠান এবং ফেসবুক শপ ক্যাটালগ ও পিক্সেল সিঙ্ক করুন" : "Target customers with high-converting SMS campaigns & Meta/Facebook Catalog sync"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowTopupModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-nv-200 rounded-xl text-xs sm:text-sm font-semibold text-ink bg-white hover:bg-nv-50 transition-fast shadow-2xs"
          >
            <Smartphone size={14} className="text-ink" />
            <span>{isBn ? "ব্যালেন্স: " : "SMS Balance: "} <strong className="text-ink">{tNum(smsBalance)}</strong></span>
          </button>

          <button
            onClick={() => setShowNewSmsModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-em-700 hover:bg-em-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-fast"
          >
            <Plus size={16} />
            <span>{isBn ? "নতুন ক্যাম্পেইন" : "New Campaign"}</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-nv-200">
          <div className="flex items-center justify-between text-ink mb-2">
            <span className="text-xs font-medium">{isBn ? "মোট প্রেরিত এসএমএস" : "Total SMS Sent"}</span>
            <div className="w-8 h-8 rounded-xl text-ink flex items-center justify-center">
              <MessageSquare size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-ink">
            {tNum(smsCampaigns.reduce((sum, c) => sum + c.recipientCount, 0))}
          </div>
          <div className="text-[11px] text-ink mt-0.5">{tNum(smsCampaigns.length)} {isBn ? "টি ক্যাম্পেইনে" : "campaigns"}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-nv-200">
          <div className="flex items-center justify-between text-ink mb-2">
            <span className="text-xs font-medium">{isBn ? "উপলব্ধ এসএমএস ক্রেডিট" : "Available SMS Credits"}</span>
            <div className="w-8 h-8 rounded-xl text-ink flex items-center justify-center">
              <Smartphone size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-ink">
            {tNum(smsBalance)} <span className="text-xs font-semibold text-ink">SMS</span>
          </div>
          <div className="text-[11px] text-ink mt-0.5">৳০.৪০ / {isBn ? "প্রতি এসএমএস" : "SMS rate"}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-nv-200">
          <div className="flex items-center justify-between text-ink mb-2">
            <span className="text-xs font-medium">{isBn ? "মেটা ক্যাটালগ সিঙ্ক" : "Facebook Catalog Sync"}</span>
            <div className="w-8 h-8 rounded-xl text-ink flex items-center justify-center">
              <FacebookIcon size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-ink">
            {tNum(products.length)} {isBn ? "টি পণ্য সিঙ্কড" : "Products"}
          </div>
          <div className="text-[11px] text-ink flex items-center gap-1 mt-0.5 font-bold">
            <CheckCircle2 size={12} /> {isBn ? "পিক্সেল সক্রিয়" : "Pixel Active"}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-nv-200">
          <div className="flex items-center justify-between text-ink mb-2">
            <span className="text-xs font-medium">{isBn ? "প্রচারণা থেকে রূপান্তর" : "Ad Conversions"}</span>
            <div className="w-8 h-8 rounded-xl text-ink flex items-center justify-center">
              <Target size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-ink">
            {tNum(metaAdSync.conversions)} {isBn ? "টি অর্ডার" : "Orders"}
          </div>
          <div className="text-[11px] text-ink font-bold mt-0.5">{tNum("4.8x")} ROI</div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-2 border-b border-nv-200 pb-1">
        <button
          onClick={() => setTab("sms")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all
            ${tab === "sms" ? "bg-em-700 text-white shadow-xs" : "bg-white border border-nv-200 text-ink hover:bg-nv-50"}`}
        >
          <MessageSquare size={16} />
          <span>{isBn ? "এসএমএস ক্যাম্পেইনসমূহ" : "SMS Campaigns"}</span>
        </button>

        <button
          onClick={() => setTab("facebook")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all
            ${tab === "facebook" ? "bg-em-700 text-white shadow-xs" : "bg-white border border-nv-200 text-ink hover:bg-nv-50"}`}
        >
          <FacebookIcon size={16} />
          <span>{isBn ? "ফেসবুক ও মেটা বিজ্ঞাপন" : "Facebook & Meta Marketing"}</span>
        </button>

        <button
          onClick={() => setTab("templates")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all
            ${tab === "templates" ? "bg-em-700 text-white shadow-xs" : "bg-white border border-nv-200 text-ink hover:bg-nv-50"}`}
        >
          <Sparkles size={16} />
          <span>{isBn ? "রেডি টেমপ্লেটস" : "Ready Templates"}</span>
        </button>
      </div>

      {/* TAB 1: SMS CAMPAIGNS */}
      {tab === "sms" && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-nv-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-ink text-base">{isBn ? "ক্যাম্পেইন ইতিহাস" : "Campaign Broadcast History"}</h3>
            <button
              onClick={() => setShowNewSmsModal(true)}
              className="text-xs text-ink font-bold hover:underline flex items-center gap-1"
            >
              <Plus size={14} /> {isBn ? "নতুন পাঠান" : "Broadcast New SMS"}
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
            <div className="flex items-center justify-between pb-3 border-b border-nv-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-nv-600 text-white flex items-center justify-center shadow-md">
                  <FacebookIcon size={20} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-ink text-base">{isBn ? "মেটা ক্যাটালগ ও পিক্সেল সিঙ্ক" : "Meta Pixel & Catalog Sync"}</h3>
                  <span className="text-xs text-ink font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} /> {isBn ? "স্বয়ংক্রিয় সিঙ্ক চালু" : "Auto-Sync Active"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => updateMetaSync({ catalogSynced: true })}
                className="px-3 py-1.5 bg-nv-100 hover:bg-nv-200 text-ink rounded-xl text-xs font-bold transition-fast flex items-center gap-1"
              >
                <RefreshCw size={12} /> {isBn ? "পুনরায় সিঙ্ক" : "Resync Catalog"}
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-3 bg-nv-50 rounded-2xl flex items-center justify-between">
                <span className="text-ink">{isBn ? "মেটা পিক্সেল আইডি" : "Meta Pixel ID"}</span>
                <span className="font-mono font-bold text-ink">{metaAdSync.pixelId}</span>
              </div>
              <div className="p-3 bg-nv-50 rounded-2xl flex items-center justify-between">
                <span className="text-ink">{isBn ? "সিঙ্ককৃত প্রোডাক্ট সংখ্যা" : "Synced Product Catalog"}</span>
                <span className="font-bold text-ink">{tNum(products.length)} {isBn ? "টি পণ্য লাইভ" : "Products Live on FB Shop"}</span>
              </div>
              <div className="p-3 bg-nv-50 rounded-2xl flex items-center justify-between">
                <span className="text-ink">{isBn ? "ফেসবুক শপ লিঙ্ক" : "Facebook Storefront Link"}</span>
                <a href="#" className="text-ink font-bold flex items-center gap-1 hover:underline">
                  fb.com/rahimstorebd <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>

          {/* Ad Campaign Booster */}
          <div className="bg-nv-900 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-nv-500/30 text-nv-200 text-xs font-bold mb-3 border border-nv-400/30">
                <Sparkles size={13} /> {isBn ? "স্মার্ট ফেসবুক বিজ্ঞাপন" : "Automated Meta Ads"}
              </div>
              <h3 className="font-display font-extrabold text-xl mb-2">{isBn ? "স্থানীয় কাস্টমারদের কাছে বিক্রয় বৃদ্ধি করুন" : "Boost Local Neighborhood Orders"}</h3>
              <p className="text-xs text-nv-100 leading-relaxed mb-4">
                {isBn
                  ? "ধানমন্ডি ও সংলগ্ন ২ কি.মি এলাকার সক্রিয় ফেসবুক ও ইনস্টাগ্রাম ব্যবহারকারীদের কাছে আপনার সেরা পণ্যের বিজ্ঞাপন পৌঁছান।"
                  : "Target active Facebook & Instagram consumers in your 2km radius to drive direct home delivery orders."}
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-nv-200 uppercase">{isBn ? "আনুমানিক রিচ" : "Estimated Reach"}</span>
                <div className="text-lg font-bold text-white">২৫,০০০ - ৫০,০০০ {isBn ? "জন" : "People"}</div>
              </div>
              <button
                onClick={() => toast({ type: "success", title: isBn ? "বিজ্ঞাপন চালু হয়েছে!" : "Campaign Launched!", message: "Meta Ad will go live after review." })}
                className="px-4 py-2.5 bg-nv-500 hover:bg-nv-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all"
              >
                {isBn ? "বিজ্ঞাপন বুস্ট করুন" : "Launch Local Ad"} →
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
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-em-50 text-ink">
                    {tpl.type.replace("_", " ")}
                  </span>
                  <Sparkles size={16} className="text-ink" />
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
