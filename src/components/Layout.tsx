import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard, Scan, ShoppingCart, QrCode, Package, Boxes, Users, Truck,
  CreditCard, Receipt, Wallet, UserCheck, BarChart2, Bell, Settings,
  Search, Globe, LogOut, Menu, X, Home, ArrowLeft,
  Plus, ChevronDown, Check,
  MessageSquare, Landmark, Store, Globe2, ShieldAlert
} from "lucide-react";
import { useApp } from "../context/AppContext";
import GlobalSearchModal from "./GlobalSearchModal";

type Screen = string;

/** Screens whose header row is a bare right-aligned action button with
 *  nothing on the left (CustomerDue's "Add Due Entry", Inventory's "Add
 *  Stock") — the mobile back arrow overlays into that empty space instead
 *  of taking its own row, so it lines up with the button. */
const screensWithInlineBack = ["dues", "inventory", "cash"];

interface LayoutProps {
  currentScreen: Screen;
  setScreen: (s: string) => void;
  children: React.ReactNode;
  onLogout?: () => void;
  onBack?: () => void;
}

export default function Layout({ currentScreen, setScreen, children, onLogout, onBack }: LayoutProps) {
  const {
    lang,
    setLang,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    settings,
    updateSettings,
    products,
    customers,
    tNum,
  } = useApp();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const shopRef = useRef<HTMLDivElement>(null);

  const isBn = lang === "bn";
  const unreadNotifs = notifications.filter(n => !n.read);
  const lowStockCount = products.filter(p => p.status === "low-stock" || p.status === "out-of-stock").length;
  const dueCustomersCount = customers.filter(c => c.due > 0).length;

  const today = new Date().toLocaleDateString(isBn ? "bn-BD" : "en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (shopRef.current && !shopRef.current.contains(e.target as Node)) setShopMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", labelBn: "ড্যাশবোর্ড" },
    { id: "pos", icon: Scan, label: "POS / New Sale", labelBn: "বিক্রি করুন", highlight: true },
    { id: "marketing", icon: MessageSquare, label: "Marketing (SMS & FB)", labelBn: "মার্কেটিং ও এসএমএস" },
    { id: "delivery", icon: Truck, label: "Delivery Aggregator", labelBn: "কুরিয়ার পার্সেল" },
    { id: "fintech", icon: Landmark, label: "Banking & Loans", labelBn: "ব্যাংকিং ও লোন" },
    { id: "reselling", icon: Store, label: "Reselling Network", labelBn: "রিসেলিং মার্কেট" },
    { id: "website", icon: Globe2, label: "Online Storefront", labelBn: "অনলাইন ওয়েবসাইট" },
    { id: "alerts", icon: ShieldAlert, label: "Monitoring & Alerts", labelBn: "মনিটরিং ও অ্যালার্ট" },
    { id: "products", icon: Package, label: "Products", labelBn: "পণ্য", badge: products.length },
    { id: "inventory", icon: Boxes, label: "Inventory", labelBn: "ইনভেন্টরি", badge: lowStockCount > 0 ? lowStockCount : undefined, badgeColor: "bg-ac-600" },
    { id: "customers", icon: Users, label: "Customers", labelBn: "গ্রাহক", badge: customers.length },
    { id: "dues", icon: CreditCard, label: "Customer Dues", labelBn: "বাকির হিসাব", badge: dueCustomersCount > 0 ? dueCustomersCount : undefined, badgeColor: "bg-red-600" },
    { id: "expenses", icon: Receipt, label: "Expenses", labelBn: "খরচ" },
    { id: "cash", icon: Wallet, label: "Cash & Accounts", labelBn: "ক্যাশ ও হিসাব" },
    { id: "purchases", icon: Truck, label: "Purchases", labelBn: "ক্রয়" },
    { id: "suppliers", icon: Users, label: "Suppliers", labelBn: "সাপ্লায়ার" },
    { id: "employees", icon: UserCheck, label: "Employees", labelBn: "কর্মচারী" },
    { id: "reports", icon: BarChart2, label: "Reports & P&L", labelBn: "রিপোর্ট" },
    { id: "notifications", icon: Bell, label: "Notifications", labelBn: "বিজ্ঞপ্তি", badge: unreadNotifs.length > 0 ? unreadNotifs.length : undefined, badgeColor: "bg-red-600" },
    { id: "settings", icon: Settings, label: "Settings", labelBn: "সেটিংস" },
  ];

  // Kept in step with the mobile home screen's own nav so the bar does not
  // change shape when you leave the home screen.
  const mobileNavItems = [
    { id: "dashboard", icon: Home, label: "Home", labelBn: "হোম" },
    { id: "pos", icon: ShoppingCart, label: "Sell", labelBn: "বেচা-বিক্রি" },
    { id: "fintech", icon: QrCode, label: "My QR", labelBn: "আমার QR" },
    { id: "dues", icon: CreditCard, label: "Dues", labelBn: "দেনা-পে" },
  ];

  const branches = [
    "Main Branch (Dhanmondi)",
    "Mirpur Outlet",
    "Uttara Branch",
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-nv-50 select-none">
      {/* Global Search / Command Palette Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        setScreen={setScreen}
      />

      {/* Sidebar overlay for Mobile & Tablet */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 w-64 sm:w-72 lg:w-64 flex flex-col sidebar-gradient
          transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Shop Selector Dropdown */}
        <div className="relative px-3 pt-3 flex items-center gap-2" ref={shopRef}>
          <button
            onClick={() => setShopMenuOpen(!shopMenuOpen)}
            className="flex-1 flex items-center gap-2.5 p-2.5 rounded-xl bg-white/10 hover:bg-white/15 transition-fast text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-em-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold shadow-inner">
              {settings.shopName.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-semibold truncate">
                {isBn ? settings.shopNameBn || settings.shopName : settings.shopName}
              </div>
              <div className="text-white/50 text-[11px] truncate">{settings.branch}</div>
            </div>
            <ChevronDown
              size={14}
              className={`text-white/50 transition-transform ${shopMenuOpen ? "rotate-180" : ""}`}
            />
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/70 hover:text-white p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-fast flex-shrink-0"
            title="Close menu"
          >
            <X size={18} />
          </button>

          {shopMenuOpen && (
            <div className="absolute top-full left-3 right-3 mt-1.5 bg-nv-900 border border-white/20 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
              <div className="text-[10px] font-semibold text-white/40 uppercase px-2 py-1">
                {isBn ? "শাখা পরিবর্তন" : "Select Branch"}
              </div>
              {branches.map(branch => (
                <button
                  key={branch}
                  onClick={() => {
                    updateSettings({ branch });
                    setShopMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-fast text-left
                    ${settings.branch === branch ? "bg-em-600 text-white font-semibold" : "text-white/80 hover:bg-white/10"}`}
                >
                  <span className="truncate">{branch}</span>
                  {settings.branch === branch && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* New Sale Button */}
        <div className="px-3 mt-3">
          <button
            onClick={() => {
              setScreen("pos");
              setSidebarOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-em-600 hover:bg-em-700 text-white font-semibold text-sm transition-colors"
          >
            <Plus size={17} />
            <span>{isBn ? "নতুন বিক্রয় (POS)" : "New Sale (POS)"}</span>
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 mt-1 scrollbar-none">
          {navItems.map(item => {
            const isActive =
              currentScreen === item.id ||
              (item.id === "products" && currentScreen === "addproduct") ||
              (item.id === "dues" && currentScreen === "customerdetail") ||
              (item.id === "reports" && currentScreen === "profitloss") ||
              (item.id === "pos" && currentScreen === "invoice");

            return (
              <button
                key={item.id}
                onClick={() => {
                  setScreen(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors group text-left
                  ${isActive
                    ? "bg-white/10 text-white font-semibold"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                  }
                `}
              >
                <item.icon size={17} className={`flex-shrink-0 group-hover:text-em-400 ${isActive ? "text-white" : "text-white/50"}`} />
                <span className="flex-1 truncate">{isBn ? item.labelBn : item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded text-white ${item.badgeColor || "bg-white/15 text-white/70"}`}
                  >
                    {tNum(item.badge)}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Demo Shortcuts */}
          <div className="pt-3 mt-3 border-t border-white/10">
            <p className="text-white/40 text-[11px] font-semibold px-3 mb-1.5 uppercase tracking-wider">
              {isBn ? "অন্যান্য ভিউ" : "Special Views"}
            </p>
            {[
              { id: "invoice", label: "Invoice & Receipt", labelBn: "ইনভয়েস ভিউ" },
                            { id: "mobile-pos", label: "Mobile POS View", labelBn: "মোবাইল বিক্রয়" },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setScreen(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-fast text-left
                  ${currentScreen === item.id ? "text-white font-semibold bg-white/10" : "text-white/50 hover:text-white hover:bg-white/5"}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                <span className="truncate">{isBn ? item.labelBn : item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer User */}
        <div className="p-3 border-t border-white/10 bg-black/20">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="w-8 h-8 rounded-full bg-em-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-sm">
              {settings.ownerName.slice(0, 1)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-semibold truncate">{settings.ownerName}</div>
              <div className="text-white/50 text-[10px]">Owner / Admin</div>
            </div>
            <button
              onClick={() => onLogout?.()}
              title={isBn ? "লগআউট" : "Logout"}
              className="text-white/50 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/10 transition-fast"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header
            Hidden below `lg`: on a phone, the only screen that renders inside
            Layout's own header is a non-Home screen (Home bypasses Layout
            entirely for its own header+nav), and navigation there runs through
            the bottom nav / More sheet, not this bar. */}
        <header className="hidden lg:flex h-16 bg-white border-b border-nv-200 items-center gap-4 px-6 flex-shrink-0 z-30 shadow-xs">
          {/* Global Search Bar (Trigger) */}
          <button
            onClick={() => setSearchModalOpen(true)}
            className="flex-1 max-w-sm flex items-center gap-2 px-3 py-2 bg-nv-50 hover:bg-nv-100 border border-nv-200 rounded-xl text-left text-sm text-ink transition-fast"
          >
            <Search size={15} className="text-ink flex-shrink-0" />
            <span className="flex-1 truncate">{isBn ? "পণ্য বা গ্রাহক খুঁজুন..." : "Search anything..."}</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white border border-nv-200 text-ink rounded">
              ⌘K
            </kbd>
          </button>

          <div className="flex-1" />

          {/* Date Indicator (Tablet/Desktop) */}
          <span className="text-xs font-medium text-ink hidden md:block">{today}</span>

          {/* Language Switcher */}
          <button
            onClick={() => setLang(isBn ? "en" : "bn")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-nv-200 text-xs font-medium text-ink hover:bg-nv-50 hover:text-ink bg-white transition-colors"
          >
            <Globe size={14} className="text-ink" />
            <span>{isBn ? "English" : "বাংলা"}</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-nv-100 text-ink transition-fast border border-nv-200"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {tNum(unreadNotifs.length)}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-nv-200 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-nv-100 px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-bold text-ink text-sm">{isBn ? "বিজ্ঞপ্তি" : "Notifications"}</span>
                    {unreadNotifs.length > 0 && (
                      <span className="px-1.5 py-0.2 text-[10px] bg-red-100 text-ink rounded-full font-bold">
                        {tNum(unreadNotifs.length)}
                      </span>
                    )}
                  </div>
                  {unreadNotifs.length > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-xs text-ink font-semibold hover:underline"
                    >
                      {isBn ? "সব পড়া হয়েছে" : "Mark all read"}
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-nv-100 my-1">
                  {notifications.slice(0, 5).map(n => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-2.5 rounded-xl transition-fast cursor-pointer hover:bg-nv-50 ${!n.read ? "bg-em-50/40 font-medium" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className={`text-xs font-semibold ${!n.read ? "text-ink" : "text-ink"}`}>
                          {isBn ? n.titleBn : n.title}
                        </span>
                        <span className="text-[10px] text-ink flex-shrink-0">{n.time}</span>
                      </div>
                      <p className="text-xs text-ink mt-0.5 line-clamp-2">{isBn ? n.bodyBn : n.body}</p>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="py-6 text-center text-ink text-xs">
                      {isBn ? "কোনো নতুন বিজ্ঞপ্তি নেই" : "No notifications"}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setScreen("notifications");
                    setNotifOpen(false);
                  }}
                  className="w-full mt-2 py-2 bg-nv-50 hover:bg-nv-100 text-ink text-xs font-semibold rounded-xl text-center transition-fast"
                >
                  {isBn ? "সব বিজ্ঞপ্তি দেখুন" : "View all notifications"} →
                </button>
              </div>
            )}
          </div>

          {/* Profile Menu Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-nv-100 transition-fast"
            >
              <div className="w-8 h-8 rounded-full bg-em-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                {settings.ownerName.slice(0, 1)}
              </div>
              <span className="text-xs font-semibold text-ink hidden sm:inline">{settings.ownerName}</span>
              <ChevronDown size={14} className="text-ink hidden sm:inline" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-nv-200 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-nv-100">
                  <div className="font-semibold text-sm text-ink">{settings.ownerName}</div>
                  <div className="text-xs text-ink">{settings.phone}</div>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setScreen("settings");
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-ink hover:bg-nv-50 transition-fast text-left"
                  >
                    <Settings size={14} />
                    <span>{isBn ? "দোকান সেটিংস" : "Shop Settings"}</span>
                  </button>
                  <button
                    onClick={() => {
                      setScreen("reports");
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-ink hover:bg-nv-50 transition-fast text-left"
                  >
                    <BarChart2 size={14} />
                    <span>{isBn ? "রিপোর্ট ও লাভ-ক্ষতি" : "Financial Reports"}</span>
                  </button>
                  <button
                    onClick={() => {
                      onLogout?.();
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-ink hover:bg-red-50 transition-fast text-left mt-1 border-t border-nv-100 pt-2"
                  >
                    <LogOut size={14} />
                    <span>{isBn ? "লগআউট" : "Logout"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-nv-50">
          {/* Back button — mobile only. Desktop keeps the full sidebar as its
              nav model and doesn't need a "back", but on a phone this is the
              only way out of a feature screen since the header is hidden.

              Screens in screensWithInlineBack render this arrow themselves,
              as a real flex sibling inside their own header row (so it can
              never overlap that row's own content) — Layout stays out of
              their way entirely. Every other screen gets the arrow here,
              on its own row above whatever the screen renders. */}
          {onBack && !screensWithInlineBack.includes(currentScreen) && (
            <div className="lg:hidden px-4 sm:px-6 pt-3">
              <button
                onClick={onBack}
                aria-label={isBn ? "পেছনে যান" : "Go back"}
                className="w-9 h-9 rounded-full bg-nv-100 flex items-center justify-center text-ink active:bg-nv-200"
              >
                <ArrowLeft size={18} />
              </button>
            </div>
          )}
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Screens < 1024px) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-nv-200 z-30 lg:hidden shadow-lg">
        <div className="flex items-center justify-around h-16 px-1">
          {mobileNavItems.map(item => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setScreen(item.id)}
                // Matches the mobile home nav: every label is full-strength
                // black and bold, and stroke weight alone marks the active tab.
                className="flex-1 flex flex-col items-center justify-center py-1 gap-0.5 text-ink touch-manipulation"
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
                <span className={`text-[10px] leading-tight text-center ${isActive ? "font-extrabold" : "font-semibold"}`}>
                  {isBn ? item.labelBn : item.label}
                </span>
              </button>
            );
          })}

          {/* More Menu Trigger */}
          <button
            onClick={() => setMobileMoreOpen(true)}
            className="flex-1 flex flex-col items-center justify-center py-1 gap-0.5 text-ink touch-manipulation"
          >
            <Menu size={20} strokeWidth={mobileMoreOpen ? 2.5 : 1.75} />
            <span className={`text-[10px] leading-tight text-center ${mobileMoreOpen ? "font-extrabold" : "font-semibold"}`}>
              {isBn ? "মেনু" : "Menu"}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile More Sheet / Drawer */}
      {mobileMoreOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 lg:hidden">
          <div
            className="flex-1"
            onClick={() => setMobileMoreOpen(false)}
          />
          <div className="bg-white rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto shadow-2xl border-t border-nv-200 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-nv-100 mb-4">
              <span className="font-display font-semibold text-ink text-base">
                {isBn ? "সকল মডিউল ও মেনু" : "All Modules"}
              </span>
              <button
                onClick={() => setMobileMoreOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-ink hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
              {[
                // Colour is reserved: brand = selling, accent = stock attention,
                // red = money owed. Everything else stays neutral.
                { id: "pos", icon: Scan, label: "POS Sale", labelBn: "বিক্রয়", color: "bg-em-50 text-ink" },
                { id: "dues", icon: CreditCard, label: "Dues", labelBn: "বাকির হিসাব", color: "bg-red-50 text-ink" },
                { id: "inventory", icon: Boxes, label: "Inventory", labelBn: "ইনভেন্টরি", color: "bg-ac-50 text-ink" },
                { id: "products", icon: Package, label: "Products", labelBn: "পণ্য" },
                { id: "customers", icon: Users, label: "Customers", labelBn: "গ্রাহক" },
                { id: "marketing", icon: MessageSquare, label: "Marketing", labelBn: "মার্কেটিং" },
                { id: "delivery", icon: Truck, label: "Courier Hub", labelBn: "কুরিয়ার" },
                { id: "fintech", icon: Landmark, label: "Bank & Loans", labelBn: "ব্যাংক ও লোন" },
                { id: "reselling", icon: Store, label: "Reselling", labelBn: "রিসেলিং" },
                { id: "website", icon: Globe2, label: "Store Website", labelBn: "অনলাইন স্টোর" },
                { id: "alerts", icon: ShieldAlert, label: "Alerts", labelBn: "অ্যালার্ট" },
                { id: "expenses", icon: Receipt, label: "Expenses", labelBn: "খরচ" },
                { id: "purchases", icon: Truck, label: "Purchases", labelBn: "ক্রয়" },
                { id: "cash", icon: Wallet, label: "Accounts", labelBn: "ক্যাশ হিসাব" },
                { id: "suppliers", icon: Users, label: "Suppliers", labelBn: "সাপ্লায়ার" },
                { id: "employees", icon: UserCheck, label: "Employees", labelBn: "কর্মচারী" },
                { id: "reports", icon: BarChart2, label: "Reports", labelBn: "রিপোর্ট" },
                { id: "settings", icon: Settings, label: "Settings", labelBn: "সেটিংস" },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setScreen(item.id);
                    setMobileMoreOpen(false);
                  }}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-nv-200 hover:border-nv-300 bg-white transition-colors text-center"
                >
                  <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${item.color || "bg-nv-100 text-ink"}`}>
                    <item.icon size={20} />
                  </div>
                  <span className="text-xs font-medium text-ink line-clamp-1">{isBn ? item.labelBn : item.label}</span>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-nv-100 flex items-center justify-between text-xs text-ink">
              <span>{settings.shopName}</span>
              <button onClick={() => { onLogout?.(); setMobileMoreOpen(false); }} className="text-ink font-semibold flex items-center gap-1">
                <LogOut size={13} /> {isBn ? "লগআউট" : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
