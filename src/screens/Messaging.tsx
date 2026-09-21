import { useState, useRef, useEffect } from "react";
import {
  Search, Send, Phone, Paperclip, CheckCheck,
  Check, Users, Truck, UserCheck, Clock, Plus, ExternalLink,
  Receipt, FileText, ArrowLeft, MoreVertical, Smartphone, CheckCircle2,
  User
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { toast } from "../components/Toast";

interface MessagingProps {
  lang: "en" | "bn";
  setScreen: (s: string) => void;
  initialChatId?: string;
}

interface Message {
  id: string;
  sender: "me" | "them";
  text: string;
  time: string;
  status: "sent" | "delivered" | "read";
  channel: "chat" | "whatsapp" | "sms";
  attachment?: {
    type: "invoice" | "receipt" | "order";
    title: string;
    amount?: number;
  };
}

interface Conversation {
  id: string;
  type: "customer" | "supplier" | "other";
  name: string;
  nameBn: string;
  phone: string;
  roleOrTag: string;
  roleOrTagBn: string;
  avatar: string;
  online: boolean;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  channel: "chat" | "whatsapp" | "sms";
  messages: Message[];
}

const defaultConversations: Conversation[] = [
  // 1. Customers
  {
    id: "conv-c1",
    type: "customer",
    name: "Kwame Mensah",
    nameBn: "Kwame Mensah",
    phone: "024 412 3456",
    roleOrTag: "VIP Customer",
    roleOrTagBn: "Otɔfo Titiriw (VIP)",
    avatar: "KM",
    online: true,
    unreadCount: 2,
    lastMessage: "Is the fresh 5L Frytol cooking oil in stock today?",
    lastMessageTime: "10:45 AM",
    channel: "whatsapp",
    messages: [
      { id: "m1", sender: "them", text: "Hello Kofi, do you have fresh Frytol cooking oil 5L available?", time: "10:40 AM", status: "read", channel: "whatsapp" },
      { id: "m2", sender: "me", text: "Yes Kwame, fresh shipment of Frytol and Gino Jasmine rice arrived today!", time: "10:42 AM", status: "read", channel: "whatsapp" },
      { id: "m3", sender: "them", text: "Great! Please keep 1 gallon reserved for me, will pick up in evening.", time: "10:45 AM", status: "read", channel: "whatsapp" },
    ]
  },
  {
    id: "conv-c2",
    type: "customer",
    name: "Abena Osei",
    nameBn: "Abena Osei",
    phone: "055 987 6543",
    roleOrTag: "Due Customer",
    roleOrTagBn: "Otɔfo a Ɔde Ka (Due)",
    avatar: "AO",
    online: false,
    unreadCount: 0,
    lastMessage: "I will clear the GH₵ 1,450 balance via MTN MoMo by tomorrow.",
    lastMessageTime: "Yesterday",
    channel: "sms",
    messages: [
      { id: "m11", sender: "me", text: "Dear Abena, your store ledger shows pending balance of GH₵ 1,450.", time: "Yesterday, 3:00 PM", status: "read", channel: "sms", attachment: { type: "receipt", title: "Due Ledger Statement", amount: 1450 } },
      { id: "m12", sender: "them", text: "Received it Kofi. I will clear the GH₵ 1,450 balance via MTN MoMo by tomorrow.", time: "Yesterday, 3:20 PM", status: "read", channel: "sms" },
    ]
  },
  {
    id: "conv-c3",
    type: "customer",
    name: "Akosua Addo",
    nameBn: "Akosua Addo",
    phone: "020 345 6789",
    roleOrTag: "Regular Customer",
    roleOrTagBn: "Daa Tɔfoɔ",
    avatar: "AA",
    online: true,
    unreadCount: 0,
    lastMessage: "Thanks for delivering quickly to East Legon!",
    lastMessageTime: "2 days ago",
    channel: "chat",
    messages: [
      { id: "m21", sender: "me", text: "Your parcel has been handed to Yango Delivery. Tracking: YG-9941", time: "2 days ago", status: "read", channel: "chat", attachment: { type: "invoice", title: "Invoice #INV-1002", amount: 320 } },
      { id: "m22", sender: "them", text: "Thanks for delivering quickly to East Legon!", time: "2 days ago", status: "read", channel: "chat" }
    ]
  },

  // 2. Suppliers
  {
    id: "conv-s1",
    type: "supplier",
    name: "Nestlé Ghana Distribution",
    nameBn: "Nestlé Ghana Distribution",
    phone: "030 200 1122",
    roleOrTag: "Primary Supplier",
    roleOrTagBn: "Ɔgorɔfo Titiriw",
    avatar: "NG",
    online: true,
    unreadCount: 1,
    lastMessage: "Order dispatched with van to Osu today at 2 PM.",
    lastMessageTime: "11:15 AM",
    channel: "chat",
    messages: [
      { id: "s1", sender: "me", text: "Good morning, please confirm PO for 20 cartons Milo 400g and 10 cartons Ideal Milk.", time: "Yesterday", status: "read", channel: "chat", attachment: { type: "order", title: "Purchase Order #PO-882", amount: 4850 } },
      { id: "s2", sender: "them", text: "Confirmed! Order dispatched with van to Osu today at 2 PM.", time: "11:15 AM", status: "read", channel: "chat" }
    ]
  },
  {
    id: "conv-s2",
    type: "supplier",
    name: "Wilmar Africa (Frytol Ghana)",
    nameBn: "Wilmar Africa (Frytol Ghana)",
    phone: "030 399 8877",
    roleOrTag: "FMCG Supplier",
    roleOrTagBn: "FMCG Ɔgorɔfo",
    avatar: "WA",
    online: false,
    unreadCount: 0,
    lastMessage: "Updated wholesale price list for Frytol Vegetable Oil attached.",
    lastMessageTime: "3 days ago",
    channel: "whatsapp",
    messages: [
      { id: "sq1", sender: "them", text: "Updated wholesale price list for Frytol Vegetable Oil attached.", time: "3 days ago", status: "read", channel: "whatsapp" }
    ]
  },

  // 3. Team & Others
  {
    id: "conv-o1",
    type: "other",
    name: "Kofi Boateng (Cashier)",
    nameBn: "Kofi Boateng (Cashier)",
    phone: "024 112 2334",
    roleOrTag: "Store Staff",
    roleOrTagBn: "Dukan Adwumayɛfoɔ",
    avatar: "KB",
    online: true,
    unreadCount: 0,
    lastMessage: "Closing cash count matched with system POS.",
    lastMessageTime: "Yesterday",
    channel: "chat",
    messages: [
      { id: "o1", sender: "them", text: "Closing cash count matched with system POS. Total cash in drawer: GH₵ 4,235.", time: "Yesterday, 10:15 PM", status: "read", channel: "chat" },
      { id: "o2", sender: "me", text: "Well done Kofi, lock the safe.", time: "Yesterday, 10:20 PM", status: "read", channel: "chat" }
    ]
  },
  {
    id: "conv-o2",
    type: "other",
    name: "Yango Delivery Support",
    nameBn: "Yango Delivery Support",
    phone: "020 000 0999",
    roleOrTag: "Delivery Partner",
    roleOrTagBn: "Kɔmafoɔ Boafoɔ",
    avatar: "YD",
    online: true,
    unreadCount: 0,
    lastMessage: "Rider is picking up 8 parcels from your outlet at 1:30 PM.",
    lastMessageTime: "09:30 AM",
    channel: "chat",
    messages: [
      { id: "sf1", sender: "them", text: "Rider is picking up 8 parcels from your outlet at 1:30 PM.", time: "09:30 AM", status: "read", channel: "chat" }
    ]
  }
];

export default function Messaging({ lang, setScreen }: MessagingProps) {
  const { customers, suppliers, settings, tNum, formatTaka } = useApp();
  const isBn = lang === "bn";

  const [conversations, setConversations] = useState<Conversation[]>(defaultConversations);
  const [activeTab, setActiveTab] = useState<"all" | "customer" | "supplier" | "other">("all");
  const [activeConvId, setActiveConvId] = useState<string>(defaultConversations[0].id);
  const [search, setSearch] = useState("");
  const [inputText, setInputText] = useState("");
  const [activeChannel, setActiveChannel] = useState<"chat" | "whatsapp" | "sms">("chat");
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages]);

  const filteredConversations = conversations.filter(c => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.nameBn.includes(search) ||
      c.phone.includes(search);
    const matchTab = activeTab === "all" || c.type === activeTab;
    return matchSearch && matchTab;
  });

  const handleSendMessage = (textToSend?: string) => {
    const msg = textToSend || inputText;
    if (!msg.trim()) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "me",
      text: msg,
      time: new Date().toLocaleTimeString(isBn ? "bn-BD" : "en-US", { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
      channel: activeChannel,
    };

    setConversations(prev =>
      prev.map(c => {
        if (c.id === activeConvId) {
          return {
            ...c,
            lastMessage: msg,
            lastMessageTime: "Just now",
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    setInputText("");

    // Simulate partner response after 1.5s
    setTimeout(() => {
      setConversations(prev =>
        prev.map(c => {
          if (c.id === activeConvId) {
            const replyMsg: Message = {
              id: `msg-${Date.now() + 1}`,
              sender: "them",
              text: isBn ? "ধন্যবাদ, আমি আপনার বার্তা পেয়েছি এবং দ্রুত কনফার্ম করছি।" : "Thank you, received and confirming shortly!",
              time: new Date().toLocaleTimeString(isBn ? "bn-BD" : "en-US", { hour: "2-digit", minute: "2-digit" }),
              status: "read",
              channel: activeChannel,
            };
            return {
              ...c,
              lastMessage: replyMsg.text,
              lastMessageTime: "Just now",
              messages: [...c.messages, replyMsg],
            };
          }
          return c;
        })
      );
    }, 1200);
  };

  const handleSendDueReminder = () => {
    const reminder = isBn
      ? `সম্মানিত ${activeConv.nameBn}, ${settings.shopName} থেকে আপনার বকেয়া হিসাবের আপডেট। অনুগ্রহ করে সুবিধা মতো পরিশোধ করুন। ধন্যবাদ!`
      : `Dear ${activeConv.name}, polite reminder from ${settings.shopName} regarding your store due ledger. Please settle at your convenience.`;
    handleSendMessage(reminder);
  };

  const handleSendInvoiceLink = () => {
    const invoiceMsg = isBn
      ? `আপনার সর্বশেষ ক্রয়ের ডিজিটাল রসিদ: https://dukan.bd/invoice/INV-${Math.floor(1000 + Math.random() * 9000)}`
      : `Digital receipt for your latest purchase: https://dukan.bd/invoice/INV-${Math.floor(1000 + Math.random() * 9000)}`;
    handleSendMessage(invoiceMsg);
  };

  return (
    <div className="h-full flex-1 flex flex-col bg-nv-50 overflow-hidden">
      {/* Main Grid: Left Conversation List, Right Chat Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Conversation List */}
        <div className={`${mobileChatOpen ? "hidden sm:flex" : "flex"} w-full sm:w-80 md:w-96 border-r border-nv-200 bg-white flex-col flex-shrink-0`}>
          {/* Mobile Screen Header (List View) */}
          <div className="flex items-center gap-2.5 px-3.5 py-3 border-b border-nv-100 bg-white sm:hidden flex-shrink-0">
            <button
              onClick={() => setScreen("mobile-dashboard")}
              aria-label={isBn ? "হোমে ফিরে যান" : "Back to Home"}
              className="w-8 h-8 rounded-full bg-nv-100 flex items-center justify-center text-ink active:bg-nv-200 flex-shrink-0"
            >
              <ArrowLeft size={16} />
            </button>
            <h2 className="font-display font-bold text-base text-ink flex-1">
              {isBn ? "মেসেজিং ও চ্যাট" : "Messages & Chat"}
            </h2>
          </div>
          {/* Search & Tabs */}
          <div className="p-3 border-b border-nv-100 space-y-2.5">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-2.5 text-ink/40" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={isBn ? "নাম বা মোবাইল নম্বর খুঁজুন..." : "Search by name or phone..."}
                className="w-full pl-9 pr-3 py-1.5 bg-nv-50 border border-nv-200 rounded-xl text-xs text-ink placeholder:text-ink/40 focus:border-em-500"
              />
            </div>

            {/* Category Filter Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-0.5">
              {[
                { id: "all" as const, label: "All", labelBn: "সকল" },
                { id: "customer" as const, label: "Customers", labelBn: "গ্রাহক", icon: Users },
                { id: "supplier" as const, label: "Suppliers", labelBn: "সাপ্লায়ার", icon: Truck },
                { id: "other" as const, label: "Staff/Other", labelBn: "অন্যান্য", icon: UserCheck },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                    activeTab === tab.id
                      ? "bg-em-700 text-white shadow-xs"
                      : "bg-nv-50 text-ink/70 hover:bg-nv-100"
                  }`}
                >
                  {isBn ? tab.labelBn : tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations Scroll */}
          <div className="flex-1 overflow-y-auto divide-y divide-nv-100">
            {filteredConversations.map(c => {
              const isSelected = c.id === activeConvId;
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setActiveConvId(c.id);
                    setMobileChatOpen(true);
                    // Mark as read
                    setConversations(prev =>
                      prev.map(item => item.id === c.id ? { ...item, unreadCount: 0 } : item)
                    );
                  }}
                  className={`p-3 sm:p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                    isSelected ? "bg-em-50/50 border-l-4 border-em-600" : "hover:bg-nv-50/80"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-nv-200 text-ink font-bold flex items-center justify-center text-xs shadow-xs">
                      {c.avatar}
                    </div>
                    {c.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-em-600 ring-2 ring-white" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-xs sm:text-sm text-ink truncate">
                        {isBn ? c.nameBn : c.name}
                      </h4>
                      <span className="text-[10px] text-ink/50 flex-shrink-0 font-mono">
                        {c.lastMessageTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-nv-100 text-ink/70 font-medium">
                        {isBn ? c.roleOrTagBn : c.roleOrTag}
                      </span>
                      {c.channel === "whatsapp" && (
                        <span className="text-[10px] text-emerald-600 font-bold">WhatsApp</span>
                      )}
                      {c.channel === "sms" && (
                        <span className="text-[10px] text-blue-600 font-bold">SMS</span>
                      )}
                    </div>

                    <p className="text-xs text-ink/70 truncate mt-1">
                      {c.lastMessage}
                    </p>
                  </div>

                  {/* Unread Badge */}
                  {c.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-em-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {tNum(c.unreadCount)}
                    </span>
                  )}
                </div>
              );
            })}

            {filteredConversations.length === 0 && (
              <div className="p-8 text-center text-ink/50 text-xs">
                {isBn ? "কোনো চ্যাট পাওয়া যায়নি" : "No conversations found"}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Active Chat Thread */}
        <div className={`${mobileChatOpen ? "flex" : "hidden sm:flex"} flex-1 flex-col bg-nv-50/50 overflow-hidden`}>
          {/* Chat Partner Header */}
          <div className="bg-white border-b border-nv-200 px-3 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              {/* Mobile Back to List */}
              <button
                onClick={() => setMobileChatOpen(false)}
                className="sm:hidden w-8 h-8 rounded-full bg-nv-100 flex items-center justify-center text-ink active:bg-nv-200 flex-shrink-0"
                title={isBn ? "পেছনে যান" : "Back to chats"}
              >
                <ArrowLeft size={16} />
              </button>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-nv-100 border border-nv-200 text-ink flex items-center justify-center shadow-2xs flex-shrink-0">
                <User size={18} className="text-ink" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display font-bold text-sm sm:text-base text-ink truncate leading-tight">
                  {(isBn ? activeConv.nameBn : activeConv.name).split(" ")[0]}
                </h3>
                <p className="text-[11px] sm:text-xs text-ink/60 font-mono truncate mt-0.5">
                  {activeConv.phone}
                </p>
              </div>
            </div>

            {/* Quick Actions Header */}
            <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
              {activeConv.type === "customer" && (
                <>
                  <button
                    onClick={handleSendDueReminder}
                    className="px-2 sm:px-2.5 py-1 sm:py-1.5 bg-red-50 hover:bg-red-100 active:scale-95 text-red-700 border border-red-200 rounded-xl text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap"
                  >
                    {isBn ? "তাগাদা" : "Reminder"}
                  </button>
                  <button
                    onClick={handleSendInvoiceLink}
                    className="px-2 sm:px-2.5 py-1 sm:py-1.5 bg-nv-100 hover:bg-nv-200 active:scale-95 text-ink rounded-xl text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap"
                  >
                    {isBn ? "ইনভয়েস" : "Invoice"}
                  </button>
                </>
              )}

              {activeConv.type === "supplier" && (
                <button
                  onClick={() => setScreen("purchases")}
                  className="px-2.5 py-1 sm:py-1.5 bg-em-50 hover:bg-em-100 active:scale-95 text-em-800 border border-em-200 rounded-xl text-[11px] sm:text-xs font-semibold transition-all flex items-center gap-1 whitespace-nowrap"
                >
                  <Truck size={13} /> {isBn ? "অর্ডার" : "Order"}
                </button>
              )}

              <a
                href={`tel:${activeConv.phone}`}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-nv-200 hover:bg-nv-100 active:scale-95 flex items-center justify-center text-ink transition-all flex-shrink-0"
                title={isBn ? "কল করুন" : "Call phone"}
              >
                <Phone size={14} />
              </a>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
            <div className="flex justify-center">
              <span className="text-[10px] uppercase font-bold text-ink/40 bg-nv-100 px-3 py-1 rounded-full">
                {isBn ? "আজকের কথোপকথন" : "Conversation Today"}
              </span>
            </div>

            {activeConv.messages.map(msg => {
              const isMe = msg.sender === "me";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[80%] sm:max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isMe
                        ? "bg-em-700 text-white rounded-br-xs"
                        : "bg-white text-ink border border-nv-200 rounded-bl-xs"
                    }`}
                  >
                    {/* Attachment card if present */}
                    {msg.attachment && (
                      <div
                        className={`mb-2 p-2.5 rounded-xl flex items-center justify-between gap-3 text-xs ${
                          isMe ? "bg-white/10 text-white" : "bg-nv-50 border border-nv-200 text-ink"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Receipt size={16} />
                          <span className="font-semibold truncate">{msg.attachment.title}</span>
                        </div>
                        {msg.attachment.amount !== undefined && (
                          <span className="font-mono font-bold whitespace-nowrap">
                            {formatTaka(msg.attachment.amount)}
                          </span>
                        )}
                      </div>
                    )}

                    <p>{msg.text}</p>

                    {/* Metadata: time, channel, status */}
                    <div
                      className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                        isMe ? "text-white/70" : "text-ink/50"
                      }`}
                    >
                      <span className="font-mono">{msg.time}</span>
                      {msg.channel === "whatsapp" && <span>• WA</span>}
                      {msg.channel === "sms" && <span>• SMS</span>}
                      {isMe && (
                        <CheckCheck size={13} className="text-white" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Row */}
          <div className="px-4 py-2 bg-white/80 border-t border-nv-100 flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] font-semibold text-ink/60 whitespace-nowrap">
              {isBn ? "কুইক টেমপ্লেট:" : "Quick Replies:"}
            </span>
            {[
              isBn ? "আপনার অর্ডার প্রস্তুত আছে।" : "Your order is packed & ready.",
              isBn ? "বকেয়া টাকা ব্যাংকে/বিকাশে পেয়েছি।" : "Payment received, ledger updated.",
              isBn ? "নতুন স্টক আগামীকাল পৌঁছাবে।" : "New stock arrives tomorrow.",
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                className="px-2.5 py-1 rounded-lg bg-nv-100 hover:bg-nv-200 text-ink text-xs font-medium whitespace-nowrap transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 sm:p-4 bg-white border-t border-nv-200 flex-shrink-0 shadow-lg relative z-20 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {/* Channel Switcher */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-semibold text-ink/60">
                {isBn ? "চ্যানেল:" : "Send via:"}
              </span>
              {(["chat", "whatsapp", "sms"] as const).map(ch => (
                <button
                  key={ch}
                  onClick={() => setActiveChannel(ch)}
                  className={`px-2.5 py-0.5 rounded-md text-xs font-semibold capitalize transition-colors ${
                    activeChannel === ch
                      ? "bg-ink text-white"
                      : "bg-nv-100 text-ink/70 hover:bg-nv-200"
                  }`}
                >
                  {ch === "chat" ? (isBn ? "অ্যাপ চ্যাট" : "In-App") : ch}
                </button>
              ))}
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={() => {
                  toast({
                    type: "info",
                    title: isBn ? "ফাইল অ্যাটাচমেন্ট" : "Attach File",
                    message: "Select an Invoice, Product photo, or PDF document.",
                  });
                }}
                className="w-10 h-10 rounded-xl border border-nv-200 hover:bg-nv-100 flex items-center justify-center text-ink transition-colors flex-shrink-0"
                title={isBn ? "ফাইল সংযুক্ত করুন" : "Attach file"}
              >
                <Paperclip size={16} />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder={
                  activeChannel === "sms"
                    ? isBn ? "এসএমএস বার্তা লিখুন (১ ক্রেডিট)..." : "Type SMS message (1 credit)..."
                    : activeChannel === "whatsapp"
                    ? isBn ? "হোয়াটসঅ্যাপ বার্তা লিখুন..." : "Type WhatsApp message..."
                    : isBn ? "এখানে মেসেজ লিখুন..." : "Type a message here..."
                }
                className="flex-1 border-2 border-nv-200 focus:border-em-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm bg-white text-ink placeholder:text-ink/40 shadow-2xs transition-colors outline-none"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-10 h-10 rounded-xl bg-em-600 hover:bg-em-700 disabled:opacity-40 text-white flex items-center justify-center shadow-md transition-colors flex-shrink-0"
                title={isBn ? "পাঠান" : "Send"}
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
