import { useState } from "react";
import { AlertTriangle, ShoppingCart, CreditCard, Package, TrendingUp, Bell, CheckCircle, X, Truck, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";

interface NotificationsProps {
  lang: "en" | "bn";
}

const getNotifIcon = (type: string) => {
  switch (type) {
    case "sale": return ShoppingCart;
    case "due": return CreditCard;
    case "stock":
    case "alert": return AlertTriangle;
    case "supplier": return Truck;
    default: return Bell;
  }
};

export default function Notifications({ lang }: NotificationsProps) {
  const { notifications, markNotificationRead, markAllNotificationsRead, clearNotifications } = useApp();
  const isBn = lang === "bn";

  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter(n => !n.read).length;
  const filtered = filter === "unread" ? notifications.filter(n => !n.read) : notifications;

  return (
    <div className="p-4 sm:p-6 space-y-6 pb-24 lg:pb-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-nv-900 flex items-center gap-2.5">
            <span>{isBn ? "বিজ্ঞপ্তি ও সতর্কতা" : "Notifications & Alerts"}</span>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 bg-red-500 text-white rounded-full text-xs font-extrabold shadow-xs">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-nv-500 text-xs sm:text-sm mt-0.5">
            {unreadCount > 0
              ? (isBn ? `${unreadCount}টি অপঠিত নোটিফিকেশন রয়েছে` : `${unreadCount} unread alerts requiring attention`)
              : (isBn ? "সকল নোটিফিকেশন পড়া সম্পন্ন" : "All notifications are caught up")}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-nv-200 rounded-xl text-xs sm:text-sm font-semibold text-nv-700 bg-white hover:bg-nv-50 transition-fast"
            >
              <CheckCircle size={15} />
              <span>{isBn ? "সব পড়া হিসেবে চিহ্নিত" : "Mark all as read"}</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearNotifications}
              className="p-2 border border-nv-200 rounded-xl text-nv-500 hover:text-red-600 bg-white hover:bg-red-50 transition-fast"
              title="Clear all"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-fast
            ${filter === "all" ? "bg-em-700 text-white shadow-xs" : "bg-white border border-nv-200 text-nv-600 hover:border-nv-300"}`}
        >
          {isBn ? "সকল বিজ্ঞপ্তি" : "All"} ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-fast
            ${filter === "unread" ? "bg-em-700 text-white shadow-xs" : "bg-white border border-nv-200 text-nv-600 hover:border-nv-300"}`}
        >
          {isBn ? "অপঠিত" : "Unread"} ({unreadCount})
        </button>
      </div>

      {/* Notification List */}
      <div className="space-y-2.5">
        {filtered.map(n => {
          const Icon = getNotifIcon(n.type);
          return (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`bg-white rounded-2xl border p-4 flex items-start gap-3.5 cursor-pointer hover:shadow-md transition-all relative
                ${!n.read ? "border-em-300 shadow-em-50/50 ring-1 ring-em-500/20" : "border-nv-200 shadow-2xs"}`}
            >
              {!n.read && (
                <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-em-600 rounded-full shadow-xs" />
              )}

              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.color || "bg-em-50 text-em-700"}`}>
                <Icon size={18} />
              </div>

              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs sm:text-sm font-bold ${!n.read ? "text-nv-900" : "text-nv-700"}`}>
                    {isBn ? n.titleBn || n.title : n.title}
                  </h4>
                  <span className="text-[10px] text-nv-400">{n.time}</span>
                </div>
                <p className="text-xs text-nv-500 mt-1 leading-relaxed">
                  {isBn ? n.bodyBn || n.body : n.body}
                </p>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white rounded-3xl border border-nv-200 p-12 text-center shadow-sm">
            <Bell size={40} className="text-nv-200 mx-auto mb-3" />
            <h3 className="font-bold text-nv-800 text-sm">{isBn ? "কোনো বিজ্ঞপ্তি নেই" : "No notifications"}</h3>
            <p className="text-nv-400 text-xs mt-0.5">{isBn ? "আপনি আপ-টু-ডেট আছেন!" : "You're all caught up with your store alerts!"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
