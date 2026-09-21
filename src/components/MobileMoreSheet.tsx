import {
  Box, BarChart2, FileText, Landmark, Truck, MessageSquare,
  Store, Globe2, ShieldAlert, UserCheck, Settings, X, LucideIcon
} from "lucide-react";
import { useApp } from "../context/AppContext";

export interface MobileServiceItem {
  id: string;
  icon: LucideIcon;
  label: string;
  labelBn: string;
  badge?: number;
  action?: () => void;
}

interface MobileMoreSheetProps {
  isOpen: boolean;
  onClose: () => void;
  setScreen: (screen: string) => void;
  lang: "en" | "bn";
}

export default function MobileMoreSheet({
  isOpen,
  onClose,
  setScreen,
  lang,
}: MobileMoreSheetProps) {
  const { products, tNum } = useApp();
  const isBn = lang === "bn";

  // Calculate urgent reorder or low-stock items for Buy Advisory badge
  const lowStockCount = products.filter(p => p.status === "low-stock" || p.status === "out-of-stock").length;
  const urgentCount = lowStockCount > 0 ? lowStockCount : 3;

  // Exactly the 12 features from the mobile drawer
  const moreServices: MobileServiceItem[] = [
    {
      id: "advisory",
      icon: Box,
      label: "Buy Advisory",
      labelBn: isBn ? "Afotu / Advisory" : "Buy Advisory",
      badge: urgentCount,
    },
    {
      id: "analytics",
      icon: BarChart2,
      label: "Analytics",
      labelBn: isBn ? "Nhwehwɛmu (Analytics)" : "Analytics",
    },
    {
      id: "reports",
      icon: FileText,
      label: "Financial Reports",
      labelBn: isBn ? "Sika Amanneɛbɔ" : "Financial Reports",
    },
    {
      id: "tax",
      icon: Landmark,
      label: "Tax & VAT",
      labelBn: isBn ? "GRA Tax & VAT" : "Tax & VAT",
    },
    {
      id: "delivery",
      icon: Truck,
      label: "Courier Hub",
      labelBn: isBn ? "Kɔmafoɔ Hub" : "Courier Hub",
    },
    {
      id: "marketing",
      icon: MessageSquare,
      label: "Marketing",
      labelBn: isBn ? "Dawubɔ (Marketing)" : "Marketing",
    },
    {
      id: "fintech",
      icon: Landmark,
      label: "Bank & Loans",
      labelBn: isBn ? "Sikakorabea & Bosea" : "Bank & Loans",
    },
    {
      id: "reselling",
      icon: Store,
      label: "Reselling",
      labelBn: isBn ? "Tɔ Na Tɔn" : "Reselling",
    },
    {
      id: "website",
      icon: Globe2,
      label: "Storefront",
      labelBn: isBn ? "Intanɛte Dukan" : "Storefront",
    },
    {
      id: "alerts",
      icon: ShieldAlert,
      label: "Alerts",
      labelBn: isBn ? "Kɔkɔbɔ (Alerts)" : "Alerts",
    },
    {
      id: "employees",
      icon: UserCheck,
      label: "Employees",
      labelBn: isBn ? "Adwumayɛfoɔ (Staff)" : "Employees",
    },
    {
      id: "settings",
      icon: Settings,
      label: "Settings",
      labelBn: isBn ? "Nhyehyɛeɛ (Settings)" : "Settings",
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/45 backdrop-blur-2xs pb-[calc(4rem+env(safe-area-inset-bottom,0px))]">
      <button
        type="button"
        className="flex-1 w-full cursor-default"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="bg-white rounded-t-[28px] p-5 max-h-[calc(85vh-5rem)] overflow-y-auto space-y-3 shadow-2xl border-t border-nv-200 animate-in slide-in-from-bottom duration-200">
        {/* Header with pill handle and circular close button */}
        <div className="relative flex items-center justify-center pt-0.5 pb-2">
          <div className="w-12 h-1 bg-nv-200 rounded-full" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-0 top-0 w-8 h-8 rounded-full bg-nv-100 flex items-center justify-center text-ink active:bg-nv-200 hover:bg-nv-150 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </div>

        {/* Direct Services Grid: 4 rows x 3 columns */}
        <div className="grid grid-cols-3 gap-y-5 gap-x-2 pt-1 pb-2">
          {moreServices.map(item => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setScreen(item.id);
                onClose();
              }}
              className="relative flex flex-col items-center justify-center gap-2 py-2 px-1 rounded-2xl active:bg-nv-100/60 active:scale-95 transition-all group cursor-pointer"
            >
              <div className="relative w-10 h-10 flex items-center justify-center text-ink group-hover:text-em-700 transition-colors">
                <item.icon size={26} strokeWidth={1.6} />
                {item.badge ? (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                    {tNum(item.badge)}
                  </span>
                ) : null}
              </div>
              <span className="text-[11px] font-medium text-ink text-center leading-tight">
                {isBn ? item.labelBn : item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
