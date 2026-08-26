import { useState } from "react";
import {
  Sparkles, ShieldCheck, ArrowRightLeft, Share2, Award, Zap,
  Plus, Users, Truck, ShoppingCart, RefreshCw, Send, Lock,
  TrendingUp, CheckCircle, ExternalLink, HelpCircle, Layers,
  Activity, ArrowUpRight, ArrowDownRight, Globe, BarChart3, Database
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { useApp, VGOContribution, VGOWallet } from "../context/AppContext";
import { toast } from "../components/Toast";

interface VGOHubProps {
  lang: "en" | "bn";
  setScreen: (s: string) => void;
}

type PillarTab = "overview" | "record" | "recognize" | "move" | "share";

const categoryColors: Record<string, string> = {
  transaction: "#10B981",
  loyalty: "#3B82F6",
  logistics: "#8B5CF6",
  governance: "#F59E0B",
  collaboration: "#EC4899",
};

export default function VGOHub({ lang, setScreen }: VGOHubProps) {
  const {
    vgoContributions,
    vgoWallets,
    vgoPool,
    recordVgoContribution,
    transferVgoValue,
    distributeVgoPool,
    stakeVgoTokens,
    customers,
    suppliers,
    employees,
    settings,
    tNum,
    formatTaka
  } = useApp();

  const isBn = lang === "bn";
  const [activeTab, setActiveTab] = useState<PillarTab>("overview");

  // Modals
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showDistributeModal, setShowDistributeModal] = useState(false);

  // Form State: Record Contribution
  const [contributorName, setContributorName] = useState(customers[0]?.name || "Rahim Mia");
  const [contributorType, setContributorType] = useState<"customer" | "supplier" | "employee" | "store">("customer");
  const [actionDesc, setActionDesc] = useState("");
  const [actionDescBn, setActionDescBn] = useState("");
  const [category, setCategory] = useState<VGOContribution["category"]>("transaction");
  const [impactUnits, setImpactUnits] = useState("100");
  const [vgoRewarded, setVgoRewarded] = useState("20");

  // Form State: Transfer Value
  const [fromWalletId, setFromWalletId] = useState(vgoWallets[0]?.id || "W-STORE");
  const [toWalletId, setToWalletId] = useState(vgoWallets[1]?.id || "W-01");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferNote, setTransferNote] = useState("");

  // Form State: Distribute Pool
  const [distributeAmount, setDistributeAmount] = useState("500");
  const [distributeType, setDistributeType] = useState("Community Dividends");

  // Dynamic calculations
  const totalImpactRecorded = vgoContributions.reduce((sum, c) => sum + c.impactUnits, 0);
  const totalVgoCirculating = vgoWallets.reduce((sum, w) => sum + w.balanceVGO, 0);
  const totalVgoStaked = vgoWallets.reduce((sum, w) => sum + w.stakedVGO, 0);

  const velocityData = [
    { hour: "08:00", hourBn: "সকাল ৮টা", velocity: 4.2, recorded: 12 },
    { hour: "11:00", hourBn: "সকাল ১১টা", velocity: 7.8, recorded: 38 },
    { hour: "14:00", hourBn: "দুপুর ২টা", velocity: 6.5, recorded: 29 },
    { hour: "17:00", hourBn: "বিকাল ৫টা", velocity: 9.4, recorded: 54 },
    { hour: "20:00", hourBn: "রাত ৮টা", velocity: 8.6, recorded: 42 },
  ];

  const categoryDistribution = [
    { name: "Transaction", nameBn: "লেনদেন", value: vgoContributions.filter(c => c.category === "transaction").length || 3, color: "#10B981" },
    { name: "Logistics", nameBn: "লজিস্টিকস", value: vgoContributions.filter(c => c.category === "logistics").length || 2, color: "#8B5CF6" },
    { name: "Loyalty", nameBn: "লয়্যালটি", value: vgoContributions.filter(c => c.category === "loyalty").length || 2, color: "#3B82F6" },
    { name: "Collaboration", nameBn: "সহযোগিতা", value: vgoContributions.filter(c => c.category === "collaboration").length || 2, color: "#EC4899" },
    { name: "Governance", nameBn: "গভর্ন্যান্স", value: vgoContributions.filter(c => c.category === "governance").length || 1, color: "#F59E0B" },
  ];

  const handleCreateContribution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionDesc.trim()) return;

    recordVgoContribution({
      contributor: contributorName,
      contributorType,
      action: actionDesc,
      actionBn: actionDescBn || actionDesc,
      category,
      impactUnits: Number(impactUnits) || 50,
      vgoRewarded: Number(vgoRewarded) || 10,
    });

    setShowRecordModal(false);
    setActionDesc("");
    setActionDescBn("");
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferAmount || Number(transferAmount) <= 0) return;

    transferVgoValue(fromWalletId, toWalletId, Number(transferAmount), transferNote);
    setShowTransferModal(false);
    setTransferAmount("");
    setTransferNote("");
  };

  const handleExecuteDistribution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!distributeAmount || Number(distributeAmount) <= 0) return;

    distributeVgoPool(Number(distributeAmount), distributeType);
    setShowDistributeModal(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 pb-28 lg:pb-8">
      {/* VGO Hero Header */}
      <div className="sidebar-gradient rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-em-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-em-500/20 via-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-em-500/20 border border-em-400/30 text-em-300 text-xs font-bold tracking-wide">
              <Sparkles size={14} className="text-em-400 animate-pulse" />
              <span>VGO VALUE ECONOMY · WEB3 CONSUMER NETWORK</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isBn ? "ভিজিও ভ্যালু ইকোনমি মডেল" : "The VGO Value Economy"}
            </h1>
            <p className="text-sm sm:text-base text-em-100 font-medium leading-relaxed">
              <span className="font-bold text-white">Record. Recognize. Move. Share.</span>{" "}
              {isBn
                ? "— চারটি মূল সক্ষমতা। একটি সংযুক্ত অর্থনীতি যেখানে প্রতিটি অংশগ্রহণই পরিমাপযোগ্য মূল্যে রূপান্তরিত হয়।"
                : "— Four capabilities. One connected economy where participation becomes measurable value."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 self-start lg:self-auto">
            <button
              onClick={() => setShowRecordModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-em-500 to-em-400 hover:from-em-400 hover:to-em-300 text-em-950 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-em-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus size={16} className="stroke-[2.5]" />
              <span>{isBn ? "অবদান রেকর্ড করুন" : "Record Contribution"}</span>
            </button>
            <button
              onClick={() => setShowTransferModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-bold text-xs sm:text-sm transition-all"
            >
              <ArrowRightLeft size={16} />
              <span>{isBn ? "ভ্যালু মুভ / ট্রান্সফার" : "Move Value"}</span>
            </button>
          </div>
        </div>

        {/* Live VGO Network Metric Indicators */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
            <div className="text-[11px] text-em-200 uppercase font-semibold flex items-center gap-1.5">
              <Database size={13} /> {isBn ? "রেকর্ডকৃত ইমপ্যাক্ট ইউনিট" : "Recorded Impact Units"}
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-white mt-1">
              {tNum(totalImpactRecorded.toLocaleString())}
            </div>
            <div className="text-[10px] text-em-300 mt-0.5">{tNum(vgoContributions.length)} {isBn ? "টি সক্রিয় কন্ট্রিবিউশন" : "verified actions"}</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
            <div className="text-[11px] text-em-200 uppercase font-semibold flex items-center gap-1.5">
              <Zap size={13} /> {isBn ? "সার্কুলেটিং ভিজিও ভ্যালু" : "Circulating VGO Value"}
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-300 mt-1">
              {tNum(totalVgoCirculating.toLocaleString())} <span className="text-xs font-semibold text-white/70">VGO</span>
            </div>
            <div className="text-[10px] text-emerald-200 mt-0.5">{isBn ? "তরল ব্যবহারযোগ্য ক্রেডিট" : "Liquid circulating value"}</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
            <div className="text-[11px] text-em-200 uppercase font-semibold flex items-center gap-1.5">
              <Lock size={13} /> {isBn ? "স্ট্যাকড নেটওয়ার্ক পুল" : "Staked Pool Yield"}
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-blue-300 mt-1">
              {tNum(totalVgoStaked.toLocaleString())} <span className="text-xs font-semibold text-white/70">VGO</span>
            </div>
            <div className="text-[10px] text-blue-200 mt-0.5">{tNum(vgoPool.communityDividendsRate)}% {isBn ? "বার্ষিক কমিউনিটি ডিভিডেন্ড" : "dividend yield rate"}</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
            <div className="text-[11px] text-em-200 uppercase font-semibold flex items-center gap-1.5">
              <Globe size={13} /> {isBn ? "কানেক্টেড নেটওয়ার্ক নোডস" : "Connected Network Nodes"}
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-white mt-1">
              {tNum(vgoPool.activeNetworkNodes.toLocaleString())}
            </div>
            <div className="text-[10px] text-em-300 mt-0.5">{isBn ? "খুচরা দোকান ও গ্রাহক হাব" : "Active retail nodes"}</div>
          </div>
        </div>
      </div>

      {/* 4 Pillars Navigation Bar */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-nv-200">
        {[
          { id: "overview" as const, label: "Overview", labelBn: "সারসংক্ষেপ", icon: Layers },
          { id: "record" as const, label: "1. Record", labelBn: "১. রেকর্ড (অবদান)", icon: Database },
          { id: "recognize" as const, label: "2. Recognize", labelBn: "২. স্বীকৃতি (ইমপ্যাক্ট)", icon: Award },
          { id: "move" as const, label: "3. Move", labelBn: "৩. মুভ (ভ্যালু লেনদেন)", icon: ArrowRightLeft },
          { id: "share" as const, label: "4. Share", labelBn: "৪. শেয়ার (নেটওয়ার্ক পুল)", icon: Share2 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all
              ${activeTab === tab.id ? "bg-em-700 text-white shadow-sm" : "bg-white border border-nv-200 text-nv-700 hover:border-nv-300"}`}
          >
            <tab.icon size={16} />
            <span>{isBn ? tab.labelBn : tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* 4-Pillars Concept Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                step: "01",
                title: "Record Contribution",
                titleBn: "অবদান রেকর্ড",
                desc: "Capture every value-creating activity: purchases, on-time payments, reviews, and eco-initiatives with cryptographic proof.",
                descBn: "ক্রয়, সময়মতো পরিশোধ, রিভিউ এবং পরিবেশবান্ধব প্রতিটি কাজের নির্ভুল ডিজিটাল প্রুফ সংরক্ষণ।",
                color: "border-emerald-500/40 bg-emerald-50/40 text-emerald-900",
                icon: Database,
                tab: "record" as const,
              },
              {
                step: "02",
                title: "Recognize Impact",
                titleBn: "ইমপ্যাক্ট স্বীকৃতি",
                desc: "Translate verified actions into quantifiable reputation scores, contributor tier badges, and proof-of-impact multipliers.",
                descBn: "যাচাইকৃত অবদানগুলোকে রেপুটেশন স্কোর, ব্যাজ এবং পরিমাপযোগ্য মূল্যে রূপান্তর।",
                color: "border-blue-500/40 bg-blue-50/40 text-blue-900",
                icon: Award,
                tab: "recognize" as const,
              },
              {
                step: "03",
                title: "Move Value",
                titleBn: "ভ্যালু সঞ্চালন",
                desc: "Frictionless liquidity: seamless transfer of VGO value units between customers, suppliers, staff, and store treasuries.",
                descBn: "সহজ ও স্বচ্ছ উপায়ে গ্রাহক, সাপ্লায়ার ও কর্মচারীদের মধ্যে ডিজিটাল ভ্যালু স্থানান্তর।",
                color: "border-purple-500/40 bg-purple-50/40 text-purple-900",
                icon: ArrowRightLeft,
                tab: "move" as const,
              },
              {
                step: "04",
                title: "Share Network",
                titleBn: "নেটওয়ার্কে শেয়ার",
                desc: "Collective prosperity: distribute automated community dividends and volume rewards across all active network nodes.",
                descBn: "কমিউনিটি ডিভিডেন্ড ও যৌথ নেটওয়ার্ক মুনাফা সক্রিয় স্টোরগুলোর মাঝে বণ্টন।",
                color: "border-amber-500/40 bg-amber-50/40 text-amber-900",
                icon: Share2,
                tab: "share" as const,
              },
            ].map(p => (
              <div
                key={p.step}
                onClick={() => setActiveTab(p.tab)}
                className={`p-5 rounded-3xl border ${p.color} cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold opacity-60">PHASE {p.step}</span>
                    <p.icon size={20} className="opacity-80" />
                  </div>
                  <h3 className="font-bold text-base mb-1.5">{isBn ? p.titleBn : p.title}</h3>
                  <p className="text-xs leading-relaxed opacity-80">{isBn ? p.descBn : p.desc}</p>
                </div>
                <div className="pt-4 mt-2 border-t border-current/10 text-xs font-bold flex items-center justify-between">
                  <span>{isBn ? "বিশদ দেখুন" : "Explore Pillar"}</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>

          {/* Velocity & Category Breakdown Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Value Velocity Area Chart */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-5 shadow-sm border border-nv-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display font-bold text-nv-900 text-base">{isBn ? "ভ্যালু সঞ্চালন বেগ (Velocity Index)" : "Network Value Velocity & Flow"}</h3>
                  <p className="text-xs text-nv-500">{isBn ? "প্রতি ঘণ্টায় ভ্যালু মুভমেন্ট ও অবদান রেকর্ড" : "Hourly token circulation and contribution frequency"}</p>
                </div>
                <span className="px-2.5 py-1 bg-em-50 text-em-700 text-xs font-bold rounded-full">
                  {tNum("8.4x")} Velocity
                </span>
              </div>

              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={velocityData}>
                    <defs>
                      <linearGradient id="vgoGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey={isBn ? "hourBn" : "hour"} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} tickFormatter={(v) => tNum(v)} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v: any) => [`${tNum(v)} units`, ""]} />
                    <Area type="monotone" dataKey="recorded" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#vgoGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Pie Chart */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-nv-200 flex flex-col justify-between">
              <h3 className="font-display font-bold text-nv-900 text-base mb-2">
                {isBn ? "অবদানের বিভাগসমূহ" : "Contribution Categories"}
              </h3>

              <div className="h-44 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryDistribution} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={3} dataKey="value">
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5">
                {categoryDistribution.map(c => (
                  <div key={c.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                      <span className="text-nv-700">{isBn ? c.nameBn : c.name}</span>
                    </div>
                    <span className="font-bold text-nv-900">{tNum(c.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 1. RECORD (Record Contribution) */}
      {activeTab === "record" && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-nv-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-nv-100">
            <div>
              <h3 className="font-display font-bold text-nv-900 text-lg flex items-center gap-2">
                <Database className="text-em-700" size={20} />
                <span>{isBn ? "১. অবদান রেকর্ড বুক (Immutable Contribution Log)" : "1. Verified Contribution Log"}</span>
              </h3>
              <p className="text-xs text-nv-500">All consumer & partner participation is recorded with proof-hashes.</p>
            </div>
            <button
              onClick={() => setShowRecordModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-em-700 hover:bg-em-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all self-start sm:self-auto"
            >
              <Plus size={15} />
              <span>{isBn ? "নতুন অবদান রেকর্ড করুন" : "Record Action"}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-nv-50 border-b border-nv-200">
                  <th className="px-4 py-3 font-bold text-nv-600">ID & Hash</th>
                  <th className="px-4 py-3 font-bold text-nv-600">Contributor</th>
                  <th className="px-4 py-3 font-bold text-nv-600">Value-Creating Action</th>
                  <th className="px-4 py-3 font-bold text-nv-600">Category</th>
                  <th className="px-4 py-3 font-bold text-nv-600 text-right">Impact Units</th>
                  <th className="px-4 py-3 font-bold text-nv-600 text-right">VGO Rewarded</th>
                  <th className="px-4 py-3 font-bold text-nv-600 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nv-100">
                {vgoContributions.map(c => (
                  <tr key={c.id} className="hover:bg-nv-50 transition-fast">
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-nv-900">{tNum(c.id)}</div>
                      <div className="font-mono text-[10px] text-nv-400">{c.proofHash}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-nv-800">
                      <div>{c.contributor}</div>
                      <span className="text-[10px] uppercase font-bold text-nv-400">{c.contributorType}</span>
                    </td>
                    <td className="px-4 py-3 text-nv-800">
                      <div>{isBn ? c.actionBn : c.action}</div>
                      <div className="text-[10px] text-nv-400">{tNum(c.timestamp)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase" style={{ background: `${categoryColors[c.category] || "#10B981"}15`, color: categoryColors[c.category] || "#10B981" }}>
                        {c.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-nv-900">
                      +{tNum(c.impactUnits)} pts
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-em-700">
                      +{tNum(c.vgoRewarded)} VGO
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-em-50 text-em-700 font-bold">
                        <ShieldCheck size={12} /> {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: 2. RECOGNIZE (Recognize Impact) */}
      {activeTab === "recognize" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-nv-200">
            <h3 className="font-display font-bold text-nv-900 text-lg flex items-center gap-2 mb-1">
              <Award className="text-blue-600" size={20} />
              <span>{isBn ? "২. ইমপ্যাক্ট লিডারবোর্ড ও রেপুটেশন স্কোর" : "2. Impact & Reputation Leaderboard"}</span>
            </h3>
            <p className="text-xs text-nv-500 mb-4">Recognizing verified network contributors with reputation badges and value rewards.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vgoWallets.map(w => (
                <div key={w.id} className="p-4 rounded-2xl bg-nv-50 border border-nv-200 hover:border-blue-400 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {w.impactBadge}
                      </span>
                      <span className="text-xs font-mono font-bold text-nv-400">{w.id}</span>
                    </div>
                    <h4 className="font-bold text-base text-nv-900">{w.ownerName}</h4>
                    <span className="text-xs text-nv-500 capitalize">{w.ownerType.replace("_", " ")}</span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-nv-200/60 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-nv-400">{isBn ? "রেপুটেশন স্কোর" : "Reputation Score"}</span>
                      <div className="font-extrabold text-sm text-blue-700">{tNum(w.reputationScore)} / {tNum(1000)}</div>
                    </div>
                    <div>
                      <span className="text-nv-400">{isBn ? "মোট অর্জিত" : "Total Earned"}</span>
                      <div className="font-extrabold text-sm text-em-700">{tNum(w.totalEarned.toLocaleString())} VGO</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: 3. MOVE (Move Value) */}
      {activeTab === "move" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-nv-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-nv-100 mb-4">
              <div>
                <h3 className="font-display font-bold text-nv-900 text-lg flex items-center gap-2">
                  <ArrowRightLeft className="text-purple-600" size={20} />
                  <span>{isBn ? "৩. ভ্যালু মুভ ও ট্রান্সফার লেজার" : "3. Value Mobility & Wallets Ledger"}</span>
                </h3>
                <p className="text-xs text-nv-500">Fluid transfer of value units across consumer, employee, and supplier wallets.</p>
              </div>
              <button
                onClick={() => setShowTransferModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all self-start sm:self-auto"
              >
                <ArrowRightLeft size={15} />
                <span>{isBn ? "ভ্যালু ট্রান্সফার করুন" : "Move Value Now"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {vgoWallets.map(w => (
                <div key={w.id} className="p-4 rounded-2xl border border-nv-200 bg-white shadow-2xs hover:shadow-sm transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-nv-900">{w.ownerName}</h4>
                      <span className="text-[10px] text-nv-400 font-mono">{w.id}</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      {w.impactBadge}
                    </span>
                  </div>

                  <div className="bg-nv-50 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-nv-500 uppercase font-semibold">{isBn ? "উপলব্ধ ব্যালেন্স" : "Available"}</span>
                      <div className="font-extrabold text-base text-em-700">{tNum(w.balanceVGO.toLocaleString())} VGO</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-nv-500 uppercase font-semibold">{isBn ? "স্ট্যাকড পুল" : "Staked"}</span>
                      <div className="font-bold text-xs text-blue-600">{tNum(w.stakedVGO.toLocaleString())} VGO</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setFromWalletId(w.id);
                      setShowTransferModal(true);
                    }}
                    className="w-full py-2 bg-nv-100 hover:bg-purple-50 hover:text-purple-800 text-nv-700 rounded-xl text-xs font-bold transition-fast"
                  >
                    {isBn ? "এই ওয়ালেট থেকে ট্রান্সফার" : "Transfer From Here"} →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: 4. SHARE (Share Across Network) */}
      {activeTab === "share" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-nv-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-nv-100">
              <div>
                <h3 className="font-display font-bold text-nv-900 text-lg flex items-center gap-2">
                  <Share2 className="text-amber-600" size={20} />
                  <span>{isBn ? "৪. নেটওয়ার্ক পুল ও কমিউনিটি ডিভিডেন্ড" : "4. Shared Network Pool & Dividends"}</span>
                </h3>
                <p className="text-xs text-nv-500">Collective ecosystem sharing: automated distribution across all participating nodes.</p>
              </div>
              <button
                onClick={() => setShowDistributeModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all self-start sm:self-auto"
              >
                <Share2 size={15} />
                <span>{isBn ? "ডিভিডেন্ড বণ্টন করুন" : "Distribute Pool"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200">
                <span className="text-xs text-amber-800 font-bold">{isBn ? "মোট শেয়ারিং পুল" : "Total Shared Pool"}</span>
                <div className="text-2xl font-extrabold text-amber-900 mt-1">{tNum(vgoPool.totalPoolVGO.toLocaleString())} VGO</div>
                <p className="text-[11px] text-amber-700 mt-1">Ready for network dividend distribution</p>
              </div>

              <div className="p-5 rounded-2xl bg-em-50/60 border border-em-200">
                <span className="text-xs text-em-800 font-bold">{isBn ? "আজকের বণ্টন" : "Distributed Today"}</span>
                <div className="text-2xl font-extrabold text-em-900 mt-1">+{tNum(vgoPool.distributedToday.toLocaleString())} VGO</div>
                <p className="text-[11px] text-em-700 mt-1">Shared across active member wallets</p>
              </div>

              <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200">
                <span className="text-xs text-blue-800 font-bold">{isBn ? "কানেক্টেড নোড শেয়ার" : "Active Node Share"}</span>
                <div className="text-2xl font-extrabold text-blue-900 mt-1">{tNum(vgoPool.activeNetworkNodes)} Nodes</div>
                <p className="text-[11px] text-blue-700 mt-1">Consumers, Retailers, Suppliers connected</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Record Contribution */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-nv-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-nv-100">
              <div className="flex items-center gap-2">
                <Database size={20} className="text-em-700" />
                <h3 className="font-display font-bold text-nv-900 text-lg">{isBn ? "অবদান রেকর্ড করুন" : "Record Value Contribution"}</h3>
              </div>
              <button onClick={() => setShowRecordModal(false)} className="text-nv-400 hover:text-nv-600">✕</button>
            </div>

            <form onSubmit={handleCreateContribution} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-nv-700 mb-1">{isBn ? "অবদানকারীর নাম" : "Contributor Name"} *</label>
                <input
                  type="text"
                  required
                  value={contributorName}
                  onChange={e => setContributorName(e.target.value)}
                  placeholder="e.g. Rahim Mia / Akij Group"
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-nv-700 mb-1">{isBn ? "ধরণ" : "Contributor Type"}</label>
                  <select
                    value={contributorType}
                    onChange={e => setContributorType(e.target.value as any)}
                    className="w-full border border-nv-200 rounded-xl px-3 py-2 bg-white"
                  >
                    <option value="customer">Customer / গ্রাহক</option>
                    <option value="supplier">Supplier / সাপ্লায়ার</option>
                    <option value="employee">Employee / কর্মচারী</option>
                    <option value="store">Store / স্টোর হাব</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-nv-700 mb-1">{isBn ? "ক্যাটাগরি" : "Category"}</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full border border-nv-200 rounded-xl px-3 py-2 bg-white"
                  >
                    <option value="transaction">Transaction / লেনদেন</option>
                    <option value="loyalty">Loyalty / লয়্যালটি</option>
                    <option value="logistics">Logistics / সাপ্লাই চেইন</option>
                    <option value="collaboration">Collaboration / রেফারেল</option>
                    <option value="governance">Governance / কোয়ালিটি</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-nv-700 mb-1">{isBn ? "অবদানের বিবরণ (ইংরেজি)" : "Contribution Action"} *</label>
                <input
                  type="text"
                  required
                  value={actionDesc}
                  onChange={e => setActionDesc(e.target.value)}
                  placeholder="e.g. Completed bulk purchase & on-time payment"
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 focus:border-em-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-nv-700 mb-1">{isBn ? "অবদানের বিবরণ (বাংলা)" : "Bangla Translation"}</label>
                <input
                  type="text"
                  value={actionDescBn}
                  onChange={e => setActionDescBn(e.target.value)}
                  placeholder="যেমন: দ্রুত পেমেন্ট ও পণ্য ক্রয় সম্পন্ন"
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 font-bn focus:border-em-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-nv-700 mb-1">{isBn ? "ইমপ্যাক্ট পয়েন্টস" : "Impact Points"}</label>
                  <input
                    type="number"
                    value={impactUnits}
                    onChange={e => setImpactUnits(e.target.value)}
                    className="w-full border border-nv-200 rounded-xl px-3 py-2 font-bold text-nv-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-nv-700 mb-1">{isBn ? "রিওয়ার্ডেড VGO" : "VGO Reward"}</label>
                  <input
                    type="number"
                    value={vgoRewarded}
                    onChange={e => setVgoRewarded(e.target.value)}
                    className="w-full border border-nv-200 rounded-xl px-3 py-2 font-bold text-em-700"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="flex-1 py-2.5 border border-nv-200 rounded-xl font-semibold text-nv-700 hover:bg-nv-50"
                >
                  {isBn ? "বাতিল" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-em-700 hover:bg-em-800 text-white rounded-xl font-bold shadow-md"
                >
                  {isBn ? "রেকর্ড ও স্বীকৃতি নিশ্চিত" : "Record & Mint"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Move Value */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-nv-200 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-nv-100">
              <div className="flex items-center gap-2">
                <ArrowRightLeft size={20} className="text-purple-600" />
                <h3 className="font-display font-bold text-nv-900 text-lg">{isBn ? "ভ্যালু ট্রান্সফার (Move Value)" : "Move VGO Value"}</h3>
              </div>
              <button onClick={() => setShowTransferModal(false)} className="text-nv-400 hover:text-nv-600">✕</button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-nv-700 mb-1">{isBn ? "উৎস ওয়ালেট (From)" : "From Wallet"} *</label>
                <select
                  value={fromWalletId}
                  onChange={e => setFromWalletId(e.target.value)}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 bg-white"
                >
                  {vgoWallets.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.ownerName} ({tNum(w.balanceVGO)} VGO)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-nv-700 mb-1">{isBn ? "গন্তব্য ওয়ালেট (To)" : "To Wallet"} *</label>
                <select
                  value={toWalletId}
                  onChange={e => setToWalletId(e.target.value)}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 bg-white"
                >
                  {vgoWallets.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.ownerName} ({tNum(w.balanceVGO)} VGO)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-nv-700 mb-1">{isBn ? "পরিমাণ (VGO Units)" : "Amount in VGO"} *</label>
                <input
                  type="number"
                  required
                  value={transferAmount}
                  onChange={e => setTransferAmount(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 font-bold text-purple-700 text-base"
                />
              </div>

              <div>
                <label className="block font-semibold text-nv-700 mb-1">{isBn ? "নোট / ট্রানজাকশন বিবরণ" : "Settlement Note"}</label>
                <input
                  type="text"
                  value={transferNote}
                  onChange={e => setTransferNote(e.target.value)}
                  placeholder="e.g. Supplier settlement / Customer loyalty reward"
                  className="w-full border border-nv-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 py-2.5 border border-nv-200 rounded-xl font-semibold text-nv-700 hover:bg-nv-50"
                >
                  {isBn ? "বাতিল" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md"
                >
                  {isBn ? "ট্রান্সফার নিশ্চিত করুন" : "Move Value Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Distribute Pool */}
      {showDistributeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-nv-200 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-nv-100">
              <div className="flex items-center gap-2">
                <Share2 size={20} className="text-amber-600" />
                <h3 className="font-display font-bold text-nv-900 text-lg">{isBn ? "নেটওয়ার্ক ডিভিডেন্ড বণ্টন" : "Distribute Network Pool"}</h3>
              </div>
              <button onClick={() => setShowDistributeModal(false)} className="text-nv-400 hover:text-nv-600">✕</button>
            </div>

            <form onSubmit={handleExecuteDistribution} className="space-y-3.5 text-xs sm:text-sm">
              <div className="p-3 bg-amber-50 rounded-xl text-amber-900 text-xs">
                Available Shared Pool: <span className="font-bold">{tNum(vgoPool.totalPoolVGO)} VGO</span> across {tNum(vgoPool.activeNetworkNodes)} connected nodes.
              </div>

              <div>
                <label className="block font-semibold text-nv-700 mb-1">{isBn ? "বণ্টন পরিমাণ (VGO)" : "Distribution Amount (VGO)"} *</label>
                <input
                  type="number"
                  required
                  value={distributeAmount}
                  onChange={e => setDistributeAmount(e.target.value)}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 font-bold text-amber-700 text-base"
                />
              </div>

              <div>
                <label className="block font-semibold text-nv-700 mb-1">{isBn ? "বণ্টনের ধরণ" : "Distribution Pool Type"}</label>
                <select
                  value={distributeType}
                  onChange={e => setDistributeType(e.target.value)}
                  className="w-full border border-nv-200 rounded-xl px-3 py-2 bg-white"
                >
                  <option value="Community Dividends">Community Dividends / লভ্যাংশ</option>
                  <option value="Supplier Volume Rebate">Supplier Volume Rebate / সাপ্লায়ার রিবেট</option>
                  <option value="Eco-Participation Staking">Eco-Participation Staking / ইকো-স্ট্যাকিং</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDistributeModal(false)}
                  className="flex-1 py-2.5 border border-nv-200 rounded-xl font-semibold text-nv-700 hover:bg-nv-50"
                >
                  {isBn ? "বাতিল" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md"
                >
                  {isBn ? "বণ্টন সম্পন্ন করুন" : "Share Across Network"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
