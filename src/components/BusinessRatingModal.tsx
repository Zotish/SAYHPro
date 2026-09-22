import { useState } from "react";
import { Star, ShieldCheck, CheckCircle2, MessageSquare, Send, X, ExternalLink, Award, Sparkles, Filter, ThumbsUp, Heart } from "lucide-react";
import { useApp } from "../context/AppContext";
import { toast } from "./Toast";

interface BusinessRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: "en" | "bn";
}

interface ReviewItem {
  id: string;
  customerName: string;
  customerPhone: string;
  rating: number;
  date: string;
  comment: string;
  commentBn: string;
  tags: string[];
  channel: "in-store" | "online" | "google";
  helpfulCount: number;
  reply?: string;
}

const initialReviews: ReviewItem[] = [
  {
    id: "REV-101",
    customerName: "Kwame Mensah",
    customerPhone: "024 412 3456",
    rating: 5,
    date: "Yesterday",
    comment: "Excellent service! Products are 100% original and the POS receipt had clear GhQR code. Will shop again.",
    commentBn: "Ɔsom pa paa! Nnoɔma no nyinaa yɛ papa na risiti no nso wɔ GhQR code a emu da hɔ.",
    tags: ["Original Quality", "Fast Checkout"],
    channel: "in-store",
    helpfulCount: 14,
    reply: "Medaase Kwame! Yɛn anigyeɛ ne sɛ yɛbɛsom wo yie daa."
  },
  {
    id: "REV-102",
    customerName: "Abena Osei",
    customerPhone: "055 987 6543",
    rating: 5,
    date: "2 days ago",
    comment: "Home delivery to East Legon arrived within 30 minutes. Frytol oil and rice packaging was flawless.",
    commentBn: "Kɔmafoɔ no duu East Legon ntɛm pa ara. Ngo ne ɛmo no nso hyɛɛ bɔkisi mu yie.",
    tags: ["Super Fast Delivery", "Great Packaging"],
    channel: "online",
    helpfulCount: 9,
  },
  {
    id: "REV-103",
    customerName: "Dr. Kofi Annan",
    customerPhone: "020 345 6789",
    rating: 4,
    date: "4 days ago",
    comment: "Very polite shopkeeper and accurate digital scale measurement. Highly recommended.",
    commentBn: "Dukanwura a ɔwɔ abotare ne nsenia a ɛntwitwa nkontompo koraa. Mede kyerɛ obiara.",
    tags: ["Accurate Weight", "Polite Staff"],
    channel: "google",
    helpfulCount: 6,
    reply: "Thank you Dr. Annan for trusting our shop!"
  },
  {
    id: "REV-104",
    customerName: "Nana Yaw Boateng",
    customerPhone: "024 555 1234",
    rating: 5,
    date: "1 week ago",
    comment: "Fair wholesale rates and instant MTN MoMo payment confirmation. Best neighborhood shop in Osu.",
    commentBn: "Boɔ a ɛyɛ pɛ ne ntɛmntɛm MTN MoMo tua ka. Dukan pa paa wɔ Osu.",
    tags: ["Fair Price", "Digital Payment"],
    channel: "in-store",
    helpfulCount: 12,
  },
  {
    id: "REV-105",
    customerName: "Akua Serwaa",
    customerPhone: "054 678 9012",
    rating: 5,
    date: "1 week ago",
    comment: "Clean shop, well organized shelves and digital customer ledger is very transparent.",
    commentBn: "Dukan a ɛho tew, nnoɔma asiesie ne ho pɛpɛɛpɛ na aka nso mu da hɔ pefee.",
    tags: ["Transparent Ledger", "Clean"],
    channel: "in-store",
    helpfulCount: 8,
  }
];

export default function BusinessRatingModal({ isOpen, onClose, lang }: BusinessRatingModalProps) {
  const { settings, tNum } = useApp();
  const isBn = lang === "bn";

  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [filterRating, setFilterRating] = useState<number | "all">("all");
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalReviewsCount = 384;
  const averageRating = 4.9;

  const ratingCounts = {
    5: 320,
    4: 48,
    3: 12,
    2: 3,
    1: 1,
  };

  const handleSendReply = (revId: string) => {
    const text = replyText[revId];
    if (!text || !text.trim()) return;

    setReviews(prev =>
      prev.map(r => (r.id === revId ? { ...r, reply: text } : r))
    );
    setReplyText(prev => ({ ...prev, [revId]: "" }));
    setActiveReplyId(null);
    toast({
      type: "success",
      title: isBn ? "Mmuaeɛ No Akɔ!" : "Reply Published!",
      message: isBn ? "Otɔfoɔ no betumi ahwɛ mmuaeɛ no." : "Customer can view your official response.",
    });
  };

  const handleSendReviewRequest = () => {
    toast({
      type: "success",
      title: isBn ? "Review Link No Akɔ!" : "Review Request Dispatched!",
      message: isBn ? "Wɔamane review link no akɔ nnɛ atɔfoɔ fon so." : "SMS review invite sent to today's customers with a discount voucher.",
    });
  };

  const filteredReviews = reviews.filter(r => {
    if (filterRating === "all") return true;
    return r.rating === filterRating;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-nv-200 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-nv-100 flex items-center justify-between bg-nv-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
              <Award size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg sm:text-xl font-bold text-ink">
                  {isBn ? "Adwuma Gyinabea & Abodin" : "Business Rating & Reviews"}
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-em-50 text-em-800 border border-em-200 font-semibold">
                  <ShieldCheck size={12} />
                  {isBn ? "Dukan a Wɔagye Atom" : "Verified Store"}
                </span>
              </div>
              <p className="text-xs text-ink/70">
                {isBn ? "Atɔfoɔ adwene, gyinabea ne ahotosoɔ amanneɛbɔ" : "Live customer satisfaction and merchant reputation audit"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-nv-200 hover:bg-nv-100 text-ink flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* Main Rating Overview Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 bg-gradient-to-br from-amber-50/50 via-white to-em-50/30 border border-amber-200/80 rounded-2xl p-4 sm:p-5">
            {/* Score & Stars */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center text-center sm:border-r border-nv-200 sm:pr-4">
              <div className="text-4xl sm:text-5xl font-black font-display text-ink tracking-tight flex items-baseline gap-1">
                <span>{tNum(averageRating)}</span>
                <span className="text-base text-ink/40 font-normal">/ {tNum(5)}</span>
              </div>
              <div className="flex items-center gap-1 my-1.5 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="text-xs font-semibold text-ink">
                {isBn ? `${tNum(totalReviewsCount)} atɔfoɔ nsɛm a wɔagye atom` : `Based on ${totalReviewsCount} verified reviews`}
              </div>
              <div className="mt-2 text-[11px] text-em-700 bg-em-50 border border-em-200 px-2.5 py-0.5 rounded-full font-bold">
                {isBn ? "98.7% Atɔfoɔ Ani Agye" : "98.7% Satisfaction Rate"}
              </div>
            </div>

            {/* Breakdown Bars */}
            <div className="sm:col-span-7 flex flex-col justify-center space-y-1.5">
              {[5, 4, 3, 2, 1].map(stars => {
                const count = ratingCounts[stars as keyof typeof ratingCounts];
                const pct = Math.round((count / totalReviewsCount) * 100);
                return (
                  <button
                    key={stars}
                    onClick={() => setFilterRating(filterRating === stars ? "all" : stars)}
                    className="flex items-center gap-2 text-xs group hover:opacity-90 transition-opacity text-left w-full"
                  >
                    <span className="w-9 font-mono font-medium text-ink flex items-center gap-0.5">
                      {tNum(stars)} <Star size={11} className="fill-amber-400 text-amber-400" />
                    </span>
                    <div className="flex-1 h-2 bg-nv-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 group-hover:bg-amber-500 transition-all rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-[11px] text-ink/70 font-mono">
                      {tNum(count)} ({tNum(pct)}%)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Trust Badges Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { label: isBn ? "Digital Kɛseɛ Pɛpɛɛpɛ" : "100% Accurate Measure", sub: isBn ? "Mmara Kwan So Ahyɛnsodeɛ" : "Standard Certified", icon: Sparkles },
              { label: isBn ? "Kɔmafoɔ a Wɔba Pɛpɛɛpɛ" : "99.4% On-Time Dispatch", sub: isBn ? "Ntɛmntɛm & Ahotosoɔ" : "Fast & Reliable", icon: CheckCircle2 },
              { label: isBn ? "Aka Kyerɛwtohɔ a Emu Da Hɔ" : "Instant SMS Confirmation", sub: isBn ? "Intanɛte So Kasaa" : "Digital Receipts", icon: MessageSquare },
              { label: isBn ? "GRA Tax Mmara Pɛpɛɛpɛ" : "NBR Tax Compliant", sub: isBn ? "GRA VAT Invois Asiesie" : "Mushak 6.3 Ready", icon: ShieldCheck },
            ].map((badge, idx) => (
              <div key={idx} className="p-2.5 rounded-xl border border-nv-200 bg-nv-50/50 flex flex-col justify-between">
                <badge.icon size={16} className="text-em-700 mb-1" />
                <div>
                  <div className="text-xs font-bold text-ink leading-tight">{badge.label}</div>
                  <div className="text-[10px] text-ink/60">{badge.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-semibold text-ink flex items-center gap-1 mr-1">
                <Filter size={13} /> {isBn ? "Yi Mu:" : "Filter:"}
              </span>
              <button
                onClick={() => setFilterRating("all")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  filterRating === "all" ? "bg-ink text-white" : "bg-nv-100 text-ink hover:bg-nv-200"
                }`}
              >
                {isBn ? "Nyinaa" : "All"}
              </button>
              {[5, 4, 3].map(st => (
                <button
                  key={st}
                  onClick={() => setFilterRating(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                    filterRating === st ? "bg-amber-500 text-white" : "bg-nv-100 text-ink hover:bg-nv-200"
                  }`}
                >
                  {tNum(st)} ★
                </button>
              ))}
            </div>

            <button
              onClick={handleSendReviewRequest}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-em-600 hover:bg-em-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
            >
              <Send size={13} />
              {isBn ? "Bisa Review Wɔ SMS So" : "Request Reviews via SMS"}
            </button>
          </div>

          {/* Reviews List */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-ink uppercase tracking-wider">
              {isBn ? "Atɔfoɔ Nsɛm a Wɔaka Nnansa Yi" : "Recent Customer Feedback"}
            </div>

            {filteredReviews.map(rev => (
              <div
                key={rev.id}
                className="bg-white border border-nv-200 rounded-2xl p-3.5 sm:p-4 space-y-2.5 hover:border-nv-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-ink">{rev.customerName}</span>
                      <span className="text-[10px] text-ink/50 font-mono">{rev.customerPhone}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-nv-100 text-ink font-medium capitalize">
                        {rev.channel}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400 mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          className={i < rev.rating ? "fill-amber-400 text-amber-400" : "text-nv-200"}
                        />
                      ))}
                      <span className="text-[11px] text-ink/60 ml-1">{rev.date}</span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] text-ink/70">
                    <ThumbsUp size={12} /> {tNum(rev.helpfulCount)}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-ink leading-relaxed">
                  {isBn ? rev.commentBn : rev.comment}
                </p>

                {/* Tags */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {rev.tags.map(t => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-nv-100 font-medium text-ink"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Owner Reply if exists */}
                {rev.reply && (
                  <div className="mt-2 bg-nv-50 border-l-2 border-em-600 pl-3 py-2 rounded-r-xl text-xs space-y-0.5">
                    <span className="font-bold text-ink flex items-center gap-1 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-em-600" />
                      {settings.shopName} ({isBn ? "Wura Mmuaeɛ" : "Owner Response"}):
                    </span>
                    <p className="text-ink/80 italic">{rev.reply}</p>
                  </div>
                )}

                {/* Reply Form Trigger */}
                {!rev.reply && (
                  <div>
                    {activeReplyId === rev.id ? (
                      <div className="mt-2 pt-2 border-t border-nv-100 space-y-2">
                        <textarea
                          rows={2}
                          value={replyText[rev.id] || ""}
                          onChange={e => setReplyText({ ...replyText, [rev.id]: e.target.value })}
                          placeholder={isBn ? "Kyerɛw mmuaeɛ kɔma otɔfoɔ no..." : "Write official reply to customer..."}
                          className="w-full border border-nv-200 rounded-xl p-2 text-xs focus:border-em-500 bg-white"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setActiveReplyId(null)}
                            className="px-2.5 py-1 text-xs text-ink/70 hover:text-ink"
                          >
                            {isBn ? "Gyae (Cancel)" : "Cancel"}
                          </button>
                          <button
                            onClick={() => handleSendReply(rev.id)}
                            className="px-3 py-1 bg-em-600 hover:bg-em-700 text-white rounded-lg text-xs font-bold"
                          >
                            {isBn ? "Pae Mu Kyerɛ (Publish)" : "Publish Reply"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveReplyId(rev.id)}
                        className="text-[11px] font-semibold text-em-700 hover:underline flex items-center gap-1 mt-1"
                      >
                        <MessageSquare size={12} /> {isBn ? "Bua Review No" : "Reply to review"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-nv-100 bg-nv-50/60 flex items-center justify-between text-xs text-ink/70">
          <span>{settings.shopName} • Rating Score Verified</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-nv-200 hover:bg-nv-100 rounded-xl text-ink font-semibold"
          >
            {isBn ? "To Mu" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
