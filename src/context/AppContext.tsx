import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "../components/Toast";

export const toBnDigits = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null) return "";
  const numMap: Record<string, string> = {
    "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
    "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯"
  };
  return val.toString().replace(/[0-9]/g, (digit) => numMap[digit] || digit);
};

export const formatNum = (val: number | string | undefined | null, lang: "en" | "bn" = "en"): string => {
  if (val === undefined || val === null) return "";
  const num = typeof val === "number" ? val : parseFloat(val.toString());
  const str = !isNaN(num) ? num.toLocaleString("en-US") : val.toString();
  return lang === "bn" ? toBnDigits(str) : str;
};

export const formatTaka = (val: number | string | undefined | null, lang: "en" | "bn" = "en"): string => {
  if (val === undefined || val === null) return "";
  const num = typeof val === "number" ? val : parseFloat(val.toString()) || 0;
  const isNeg = num < 0;
  const rounded = Math.round(Math.abs(num));
  const absStr = rounded.toLocaleString("en-US");
  const formattedStr = lang === "bn" ? toBnDigits(absStr) : absStr;
  return isNeg ? `-৳${formattedStr}` : `৳${formattedStr}`;
};

export interface Product {
  id: number;
  name: string;
  nameBn: string;
  sku: string;
  category: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  min: number;
  unit: string;
  status: "in-stock" | "low-stock" | "out-of-stock";
  brand?: string;
  image?: string;
  barcode?: string;
}

export interface CartItem {
  id: number;
  name: string;
  nameBn: string;
  price: number;
  buyPrice?: number;
  qty: number;
  discount: number;
  image?: string;
}

export interface SaleItem {
  name: string;
  nameBn: string;
  qty: number;
  price: number;
  buyPrice?: number;
  discount: number;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  customer: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  vat: number;
  grandTotal: number;
  paid: number;
  due: number;
  paymentMethod: "cash" | "bkash" | "nagad" | "rocket" | "card" | "due";
  cashGiven?: number;
  change?: number;
  date: string;
  time: string;
  status: "completed" | "due" | "partial";
}

export interface Customer {
  id: number;
  name: string;
  nameBn: string;
  phone: string;
  address?: string;
  totalPurchases: number;
  due: number;
  visits: number;
  lastVisit: string;
  lastPayment?: string;
  dueSince?: string;
  status: "vip" | "regular" | "due" | "new";
  rating: number;
  avatar: string;
}

export interface Supplier {
  id: number;
  name: string;
  nameBn: string;
  contact: string;
  totalPurchases: number;
  paid: number;
  due: number;
  nextPayment: string;
  avatar: string;
  category: string;
}

export interface PurchaseItem {
  product: string;
  qty: number;
  cost: number;
}

export interface Purchase {
  id: string;
  supplier: string;
  date: string;
  items: PurchaseItem[];
  itemCount: number;
  total: number;
  paid: number;
  due: number;
  status: "paid" | "partial" | "credit";
  invoiceNo?: string;
}

export interface Expense {
  id: string;
  category: string;
  categoryBn: string;
  amount: number;
  date: string;
  paidFrom: string;
  note: string;
}

export interface CashAccount {
  id: string;
  name: string;
  nameBn: string;
  balance: number;
  color: string;
  bg: string;
  in: number;
  out: number;
}

export interface CashTransaction {
  id: string;
  type: "in" | "out" | "transfer";
  desc: string;
  descBn: string;
  account: string;
  amount: number;
  time: string;
  date?: string;
}

export interface Employee {
  id: number;
  name: string;
  nameBn: string;
  role: string;
  roleBn: string;
  phone: string;
  salary: number;
  salesThisMonth: number;
  joined: string;
  avatar: string;
  status: "active" | "inactive";
  lastPaid?: string;
}

export interface NotificationItem {
  id: number;
  type: "alert" | "sale" | "due" | "stock" | "supplier" | "system";
  title: string;
  titleBn: string;
  body: string;
  bodyBn: string;
  time: string;
  read: boolean;
  color: string;
  badge: string;
}

export interface ShopSettings {
  shopName: string;
  shopNameBn: string;
  ownerName: string;
  businessType: string;
  phone: string;
  address: string;
  currency: string;
  taxRate: number;
  autoPrint: boolean;
  soundEnabled: boolean;
  smsReminderTemplate: string;
  branch: string;
}

// VGO Value Economy Models (Record. Recognize. Move. Share.)
export interface VGOContribution {
  id: string;
  contributor: string;
  contributorType: "customer" | "supplier" | "employee" | "store";
  action: string;
  actionBn: string;
  category: "transaction" | "loyalty" | "logistics" | "governance" | "collaboration";
  impactUnits: number;
  vgoRewarded: number;
  proofHash: string;
  timestamp: string;
  status: "verified" | "minted" | "shared";
}

export interface VGOWallet {
  id: string;
  ownerName: string;
  ownerType: "customer" | "supplier" | "employee" | "store_treasury";
  balanceVGO: number;
  stakedVGO: number;
  totalEarned: number;
  reputationScore: number;
  impactBadge: string;
}

export interface VGONetworkPool {
  totalPoolVGO: number;
  distributedToday: number;
  activeNetworkNodes: number;
  communityDividendsRate: number;
  networkVelocity: number;
  lastDistributionTime: string;
}

// 1. Marketing Models (SMS & Facebook / Meta)
export interface SMSCampaign {
  id: string;
  title: string;
  titleBn: string;
  type: "promotional" | "due_reminder" | "festival" | "new_arrival";
  recipientCount: number;
  message: string;
  messageBn: string;
  date: string;
  status: "sent" | "scheduled" | "draft";
  cost: number;
}

export interface MetaAdSync {
  catalogSynced: boolean;
  syncedProductsCount: number;
  pixelId: string;
  pixelActive: boolean;
  adSpend: number;
  conversions: number;
}

// 2. Delivery Aggregator Models (Steadfast, Pathao, RedX, eCourier)
export interface CourierParcel {
  id: string;
  trackingCode: string;
  courier: "steadfast" | "pathao" | "redx" | "ecourier";
  customerName: string;
  customerPhone: string;
  destination: string;
  invoiceNo: string;
  codAmount: number;
  deliveryFee: number;
  status: "booked" | "picked_up" | "in_transit" | "delivered" | "returned";
  date: string;
  codSettled: boolean;
}

// 3. Fintech, Banking & SME Loan Models
export interface BankAccountApplication {
  id: string;
  bankName: string;
  bankLogo: string;
  accountType: "current" | "merchant_wallet" | "islamic_business";
  accountNumber?: string;
  status: "active" | "pending_kyc" | "approved";
  nidNumber: string;
  tradeLicense: string;
  kycProgress: number;
}

export interface SMELoanOffer {
  id: string;
  bankPartner: string;
  eligibleAmount: number;
  interestRate: number;
  tenureMonths: number;
  monthlyEMI: number;
  status: "pre_approved" | "applied" | "disbursed" | "none";
  activeLoanAmount?: number;
  paidInstallments?: number;
  totalInstallments?: number;
}

export interface DigitalPaymentConfig {
  banglaQRActive: boolean;
  merchantQrString: string;
  bkashMerchantNumber: string;
  nagadMerchantNumber: string;
  paymentGatewayActive: boolean;
}

export interface PaymentLinkItem {
  id: string;
  customerName: string;
  amount: number;
  linkUrl: string;
  purpose: string;
  createdDate: string;
  status: "paid" | "pending" | "expired";
}

// 4. Reselling & Drop-Shipping Models
export interface ResellProduct {
  id: string;
  name: string;
  nameBn: string;
  category: string;
  wholesalePrice: number;
  suggestedRetailPrice: number;
  stock: number;
  image: string;
  supplier: string;
  rating: number;
  isAddedToStore: boolean;
  mySellingPrice?: number;
  myProfit?: number;
}

// 5. No-Code Website Builder Models
export interface StorefrontConfig {
  subdomain: string;
  customDomain?: string;
  heroHeadline: string;
  heroHeadlineBn: string;
  heroSubheadline: string;
  heroSubheadlineBn: string;
  themeColor: string;
  bannerImage: string;
  logo: string;
  announcementText: string;
  announcementTextBn: string;
  showWhatsAppButton: boolean;
  whatsAppNumber: string;
  allowCOD: boolean;
  showReviews: boolean;
  featuredProductIds: number[];
  published: boolean;
}

// 6. Monitoring & Alert System Models
export interface MonitoringRule {
  id: string;
  name: string;
  nameBn: string;
  type: "low_stock" | "high_due" | "cash_discrepancy" | "daily_profit_sms";
  enabled: boolean;
  thresholdValue: number;
  channel: "sms" | "push" | "whatsapp" | "email";
  lastTriggered?: string;
}

export interface BusinessAlert {
  id: string;
  ruleType: string;
  title: string;
  titleBn: string;
  message: string;
  messageBn: string;
  severity: "critical" | "warning" | "info";
  time: string;
  resolved: boolean;
}

interface AppContextType {
  lang: "en" | "bn";
  setLang: (l: "en" | "bn") => void;
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, "id" | "status">) => void;
  updateProduct: (id: number, product: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  adjustStock: (id: number, qtyDelta: number, reason: string) => void;

  // Sales
  sales: Sale[];
  currentInvoice: Sale | null;
  setCurrentInvoice: (sale: Sale | null) => void;
  completeSale: (saleData: Omit<Sale, "id" | "invoiceNo" | "date" | "time" | "status">) => Sale;

  // Customers
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, "id" | "totalPurchases" | "visits" | "lastVisit" | "rating" | "avatar"> & { totalPurchases?: number }) => void;
  updateCustomer: (id: number, customer: Partial<Customer>) => void;
  deleteCustomer: (id: number) => void;
  recordCustomerPayment: (customerId: number, amount: number, accountId: string, note?: string) => void;
  addCustomerDue: (customerId: number, amount: number, note?: string) => void;

  // Suppliers
  suppliers: Supplier[];
  addSupplier: (sup: Omit<Supplier, "id" | "totalPurchases" | "paid" | "avatar">) => void;
  recordSupplierPayment: (supplierId: number, amount: number, accountId: string) => void;

  // Purchases
  purchases: Purchase[];
  addPurchase: (purchase: { supplier: string; invoiceNo?: string; date: string; items: PurchaseItem[]; paid: number; paymentMethod: string }) => void;

  // Expenses
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, "id">) => void;
  deleteExpense: (id: string) => void;

  // Cash & Accounts
  accounts: CashAccount[];
  transactions: CashTransaction[];
  addCashDeposit: (accountId: string, amount: number, note: string) => void;
  transferCash: (fromId: string, toId: string, amount: number, note?: string) => void;

  // Employees
  employees: Employee[];
  addEmployee: (emp: Omit<Employee, "id" | "salesThisMonth" | "avatar" | "status">) => void;
  updateEmployee: (id: number, emp: Partial<Employee>) => void;
  deleteEmployee: (id: number) => void;
  paySalary: (empId: number, accountId: string) => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationRead: (id: number) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  addNotification: (item: Omit<NotificationItem, "id" | "time" | "read">) => void;

  // Settings
  settings: ShopSettings;
  updateSettings: (s: Partial<ShopSettings>) => void;

  // Global search modal
  isSearchOpen: boolean;
  setIsSearchOpen: (v: boolean) => void;
  
  // Quick action modal
  quickModal: string | null;
  setQuickModal: (m: string | null) => void;

  // VGO Value Economy (Record, Recognize, Move, Share)
  vgoContributions: VGOContribution[];
  vgoWallets: VGOWallet[];
  vgoPool: VGONetworkPool;
  recordVgoContribution: (c: Omit<VGOContribution, "id" | "proofHash" | "timestamp" | "status">) => void;
  transferVgoValue: (fromWalletId: string, toWalletId: string, amount: number, note?: string) => void;
  stakeVgoTokens: (walletId: string, amount: number) => void;
  distributeVgoPool: (amount: number, poolType?: string) => void;

  // 1. Marketing
  smsCampaigns: SMSCampaign[];
  smsBalance: number;
  metaAdSync: MetaAdSync;
  sendSMSCampaign: (c: Omit<SMSCampaign, "id" | "date" | "status">) => void;
  updateMetaSync: (sync: Partial<MetaAdSync>) => void;
  topupSMSBalance: (amountCredits: number) => void;

  // 2. Delivery Aggregator
  courierParcels: CourierParcel[];
  bookCourierParcel: (parcel: Omit<CourierParcel, "id" | "trackingCode" | "date" | "status" | "codSettled">) => void;
  updateParcelStatus: (id: string, status: CourierParcel["status"]) => void;

  // 3. Fintech, Banking & Loans
  bankApplications: BankAccountApplication[];
  smeLoanOffers: SMELoanOffer[];
  digitalPayments: DigitalPaymentConfig;
  paymentLinks: PaymentLinkItem[];
  applyBankKYC: (bankName: string, accountType: BankAccountApplication["accountType"], nid: string, tradeLicense: string) => void;
  applySMELoan: (offerId: string, amount: number) => void;
  createPaymentLink: (customerName: string, amount: number, purpose: string) => void;
  updatePaymentConfig: (config: Partial<DigitalPaymentConfig>) => void;

  // 4. Reselling & Drop-Shipping
  resellProducts: ResellProduct[];
  toggleResellProduct: (id: string, mySellingPrice?: number) => void;

  // 5. No-Code Website Builder
  storefront: StorefrontConfig;
  updateStorefront: (s: Partial<StorefrontConfig>) => void;

  // 6. Monitoring & Alerts
  monitoringRules: MonitoringRule[];
  businessAlerts: BusinessAlert[];
  toggleMonitoringRule: (id: string) => void;
  resolveBusinessAlert: (id: string) => void;

  // Number & Currency Translation Helpers
  tNum: (val: number | string | undefined | null) => string;
  formatTaka: (val: number | string | undefined | null) => string;

  // Reset demo data
  resetToDefaultData: () => void;
}

const initialProducts: Product[] = [
  { id: 1, name: "Fresh Sunflower Oil 5L", nameBn: "ফ্রেশ সানফ্লাওয়ার অয়েল ৫লি", sku: "OIL-001", category: "Grocery", buyPrice: 250, sellPrice: 300, stock: 24, min: 10, unit: "Piece / পিস", status: "in-stock", brand: "Fresh", image: "🫙", barcode: "89411000101" },
  { id: 2, name: "Pran RUCHI Chanachur 200g", nameBn: "প্রাণ রুচি চানাচুর ২০০গ্রাম", sku: "SNA-002", category: "Snacks", buyPrice: 45, sellPrice: 60, stock: 48, min: 20, unit: "Piece / পিস", status: "in-stock", brand: "Pran", image: "🍿", barcode: "89411000102" },
  { id: 3, name: "BD Fresh Milk 1L", nameBn: "বিডি ফ্রেশ মিল্ক ১লি", sku: "DAI-003", category: "Dairy", buyPrice: 68, sellPrice: 80, stock: 8, min: 20, unit: "Liter / লিটার", status: "low-stock", brand: "BD Milk", image: "🥛", barcode: "89411000103" },
  { id: 4, name: "Bashundhara Tissue Box", nameBn: "বসুন্ধরা টিস্যু বক্স", sku: "HH-004", category: "Household", buyPrice: 90, sellPrice: 120, stock: 32, min: 10, unit: "Box / বক্স", status: "in-stock", brand: "Bashundhara", image: "🧻", barcode: "89411000104" },
  { id: 5, name: "Pran Frooto 250ml", nameBn: "প্রাণ ফ্রুটো ২৫০মিলি", sku: "BEV-005", category: "Beverages", buyPrice: 18, sellPrice: 25, stock: 96, min: 30, unit: "Piece / পিস", status: "in-stock", brand: "Pran", image: "🍹", barcode: "89411000105" },
  { id: 6, name: "Lifebuoy Soap 100g", nameBn: "লাইফবয় সাবান ১০০গ্রাম", sku: "PC-006", category: "Personal Care", buyPrice: 38, sellPrice: 50, stock: 0, min: 10, unit: "Piece / পিস", status: "out-of-stock", brand: "Lifebuoy", image: "🧼", barcode: "89411000106" },
  { id: 7, name: "Pran Salt 1kg", nameBn: "প্রাণ লবণ ১কেজি", sku: "GRO-007", category: "Grocery", buyPrice: 30, sellPrice: 40, stock: 3, min: 15, unit: "KG", status: "low-stock", brand: "Pran", image: "🧂", barcode: "89411000107" },
  { id: 8, name: "Meril Shampoo 200ml", nameBn: "মেরিল শ্যাম্পু ২০০মিলি", sku: "PC-008", category: "Personal Care", buyPrice: 110, sellPrice: 150, stock: 22, min: 8, unit: "Piece / পিস", status: "in-stock", brand: "Meril", image: "🧴", barcode: "89411000108" },
  { id: 9, name: "Lal Gura 500g", nameBn: "লাল গুড়া ৫০০গ্রাম", sku: "GRO-009", category: "Grocery", buyPrice: 42, sellPrice: 55, stock: 40, min: 10, unit: "Piece / পিস", status: "in-stock", brand: "Fresh", image: "🌾", barcode: "89411000109" },
  { id: 10, name: "Tea Biscuit 200g", nameBn: "টি বিস্কিট ২০০গ্রাম", sku: "SNA-010", category: "Snacks", buyPrice: 35, sellPrice: 45, stock: 72, min: 20, unit: "Packet / প্যাকেট", status: "in-stock", brand: "Olympic", image: "🍪", barcode: "89411000110" },
  { id: 11, name: "Pran Juice 1L", nameBn: "প্রাণ জুস ১লি", sku: "BEV-011", category: "Beverages", buyPrice: 65, sellPrice: 85, stock: 30, min: 10, unit: "Piece / পিস", status: "in-stock", brand: "Pran", image: "🧃", barcode: "89411000111" },
  { id: 12, name: "Dove Soap 100g", nameBn: "ডাভ সাবান ১০০গ্রাম", sku: "PC-012", category: "Personal Care", buyPrice: 60, sellPrice: 80, stock: 44, min: 12, unit: "Piece / পিস", status: "in-stock", brand: "Unilever", image: "🧼", barcode: "89411000112" },
];

const initialCustomers: Customer[] = [
  { id: 1, name: "Karim Ahmed", nameBn: "করিম আহমেদ", phone: "01712-345678", address: "হাউজ ১২, রোড ৫, ধানমন্ডি", totalPurchases: 45200, due: 8500, visits: 28, lastVisit: "Today", lastPayment: "3 days ago", dueSince: "Dec 10", status: "regular", rating: 5, avatar: "ক" },
  { id: 2, name: "Sumaiya Khatun", nameBn: "সুমাইয়া খাতুন", phone: "01812-456789", address: "ব্লক সি, মিরপুর ১০", totalPurchases: 32100, due: 12000, visits: 19, lastVisit: "Yesterday", lastPayment: "7 days ago", dueSince: "Nov 28", status: "due", rating: 4, avatar: "স" },
  { id: 3, name: "Rahim Mia", nameBn: "রহিম মিয়া", phone: "01912-567890", address: "সেক্টর ৭, উত্তরা", totalPurchases: 18500, due: 3200, visits: 12, lastVisit: "2 days ago", lastPayment: "Today", dueSince: "Dec 12", status: "regular", rating: 4, avatar: "র" },
  { id: 4, name: "Farida Begum", nameBn: "ফরিদা বেগম", phone: "01612-678901", address: "রোড ৩, মোহাম্মদপুর", totalPurchases: 28000, due: 5800, visits: 22, lastVisit: "3 days ago", lastPayment: "5 days ago", dueSince: "Dec 5", status: "due", rating: 5, avatar: "ফ" },
  { id: 5, name: "Noor Islam", nameBn: "নূর ইসলাম", phone: "01512-789012", address: "বাসা ৮, বনশ্রী", totalPurchases: 9800, due: 1500, visits: 7, lastVisit: "Today", lastPayment: "2 days ago", dueSince: "Dec 13", status: "new", rating: 3, avatar: "ন" },
  { id: 6, name: "Jahangir Alam", nameBn: "জাহাঙ্গীর আলম", phone: "01312-890123", address: "গুলশান ২, ঢাকা", totalPurchases: 52400, due: 4800, visits: 35, lastVisit: "1 week ago", lastPayment: "2 weeks ago", dueSince: "Nov 15", status: "vip", rating: 5, avatar: "জ" },
  { id: 7, name: "Rashida Khanam", nameBn: "রশিদা খানম", phone: "01411-901234", address: "শান্তিনগর, ঢাকা", totalPurchases: 15200, due: 0, visits: 11, lastVisit: "4 days ago", status: "regular", rating: 4, avatar: "রখ" },
  { id: 8, name: "Belal Hossain", nameBn: "বেলাল হোসেন", phone: "01611-012345", address: "মতিঝিল, ঢাকা", totalPurchases: 62000, due: 0, visits: 41, lastVisit: "Today", status: "vip", rating: 5, avatar: "ব" },
];

const initialSuppliers: Supplier[] = [
  { id: 1, name: "Pran-RFL Group", nameBn: "প্রাণ-আরএফএল গ্রুপ", contact: "01711-000001", totalPurchases: 185000, paid: 163600, due: 21400, nextPayment: "Dec 20", avatar: "P", category: "Food & FMCG" },
  { id: 2, name: "Meghna Group", nameBn: "মেঘনা গ্রুপ", contact: "01711-000002", totalPurchases: 92000, paid: 92000, due: 0, nextPayment: "—", avatar: "M", category: "Oil & Food" },
  { id: 3, name: "ACI Limited", nameBn: "এসিআই লিমিটেড", contact: "01711-000003", totalPurchases: 58000, paid: 45000, due: 13000, nextPayment: "Dec 22", avatar: "A", category: "Healthcare & FMCG" },
  { id: 4, name: "Square Group BD", nameBn: "স্কয়ার গ্রুপ", contact: "01711-000004", totalPurchases: 34000, paid: 34000, due: 0, nextPayment: "—", avatar: "S", category: "FMCG" },
  { id: 5, name: "Bashundhara Group", nameBn: "বসুন্ধরা গ্রুপ", contact: "01711-000005", totalPurchases: 42000, paid: 30000, due: 12000, nextPayment: "Dec 18", avatar: "B", category: "Paper & Tissue" },
];

const initialPurchases: Purchase[] = [
  { id: "PUR-0042", supplier: "Pran-RFL Group", date: "Dec 13, 2024", items: [{ product: "Pran Chanachur", qty: 50, cost: 45 }, { product: "Pran Frooto", qty: 100, cost: 18 }], itemCount: 8, total: 18500, paid: 18500, due: 0, status: "paid", invoiceNo: "PRAN-9921" },
  { id: "PUR-0041", supplier: "Meghna Group", date: "Dec 12, 2024", items: [{ product: "Fresh Sunflower Oil", qty: 40, cost: 250 }], itemCount: 4, total: 12000, paid: 8000, due: 4000, status: "partial", invoiceNo: "MEG-412" },
  { id: "PUR-0040", supplier: "ACI Limited", date: "Dec 11, 2024", items: [{ product: "Salt & Spices", qty: 60, cost: 30 }], itemCount: 6, total: 8500, paid: 0, due: 8500, status: "credit", invoiceNo: "ACI-108" },
  { id: "PUR-0039", supplier: "Square Group BD", date: "Dec 10, 2024", items: [{ product: "Personal Care Bundle", qty: 100, cost: 250 }], itemCount: 12, total: 25000, paid: 25000, due: 0, status: "paid", invoiceNo: "SQ-551" },
  { id: "PUR-0038", supplier: "Bashundhara Group", date: "Dec 9, 2024", items: [{ product: "Tissue Box Bulk", qty: 50, cost: 90 }], itemCount: 3, total: 6800, paid: 3000, due: 3800, status: "partial", invoiceNo: "BAS-882" },
];

const initialExpenses: Expense[] = [
  { id: "EXP-1", category: "Salary", categoryBn: "বেতন", amount: 28000, date: "Dec 1, 2024", paidFrom: "Cash", note: "December salary for employees" },
  { id: "EXP-2", category: "Shop Rent", categoryBn: "দোকান ভাড়া", amount: 15000, date: "Dec 1, 2024", paidFrom: "bKash", note: "Monthly shop rent" },
  { id: "EXP-3", category: "Electricity", categoryBn: "বিদ্যুৎ", amount: 3200, date: "Dec 5, 2024", paidFrom: "Cash", note: "DESCO electric bill" },
  { id: "EXP-4", category: "Transport", categoryBn: "পরিবহন", amount: 1200, date: "Dec 8, 2024", paidFrom: "Cash", note: "Supplier pickup van rent" },
  { id: "EXP-5", category: "Food", categoryBn: "খাবার", amount: 800, date: "Dec 10, 2024", paidFrom: "Cash", note: "Staff afternoon snacks" },
  { id: "EXP-6", category: "Marketing", categoryBn: "মার্কেটিং", amount: 2000, date: "Dec 11, 2024", paidFrom: "bKash", note: "Facebook local ad boost" },
  { id: "EXP-7", category: "Maintenance", categoryBn: "রক্ষণাবেক্ষণ", amount: 500, date: "Dec 12, 2024", paidFrom: "Cash", note: "Shelf repair" },
];

const initialAccounts: CashAccount[] = [
  { id: "cash", name: "Cash", nameBn: "নগদ ক্যাশ", balance: 72500, color: "#16A34A", bg: "#F0FDF4", in: 48250, out: 12800 },
  { id: "bkash", name: "bKash", nameBn: "বিকাশ", balance: 28400, color: "#E91E8C", bg: "#FDF2F8", in: 12400, out: 3200 },
  { id: "nagad", name: "Nagad", nameBn: "নগদ", balance: 15200, color: "#D97706", bg: "#FFFBEB", in: 8200, out: 1500 },
  { id: "rocket", name: "Rocket", nameBn: "রকেট", balance: 8600, color: "#7B1FA2", bg: "#F3E5F5", in: 4100, out: 800 },
  { id: "bank", name: "BRAC Bank", nameBn: "ব্র্যাক ব্যাংক", balance: 185000, color: "#1565C0", bg: "#E3F2FD", in: 50000, out: 25000 },
];

const initialTransactions: CashTransaction[] = [
  { id: "TX-1", type: "in", desc: "Sale Collection — Karim Ahmed", descBn: "বিক্রয় আয়", account: "Cash", amount: 2850, time: "Today 6:32 PM" },
  { id: "TX-2", type: "in", desc: "Sale Collection — Sumaiya", descBn: "বিক্রয় আয়", account: "bKash", amount: 1200, time: "Today 5:48 PM" },
  { id: "TX-3", type: "out", desc: "Stock Purchase — Pran", descBn: "স্টক ক্রয়", account: "Cash", amount: 18500, time: "Today 2:15 PM" },
  { id: "TX-4", type: "transfer", desc: "Cash to bKash Transfer", descBn: "ক্যাশ থেকে বিকাশ", account: "Cash → bKash", amount: 10000, time: "Today 11:00 AM" },
  { id: "TX-5", type: "in", desc: "Customer Due Collected — Farida", descBn: "বাকি গ্রহণ", account: "Cash", amount: 5000, time: "Yesterday" },
  { id: "TX-6", type: "out", desc: "Shop Rent Payment", descBn: "দোকান ভাড়া", account: "bKash", amount: 15000, time: "Dec 1" },
];

const initialEmployees: Employee[] = [
  { id: 1, name: "Salam Ahmed", nameBn: "সালাম আহমেদ", role: "Cashier", roleBn: "ক্যাশিয়ার", phone: "01712-111111", salary: 12000, salesThisMonth: 185000, joined: "Jan 2023", avatar: "স", status: "active", lastPaid: "Dec 1, 2024" },
  { id: 2, name: "Riya Begum", nameBn: "রিয়া বেগম", role: "Sales Staff", roleBn: "বিক্রয় স্টাফ", phone: "01812-222222", salary: 10000, salesThisMonth: 142000, joined: "Mar 2023", avatar: "র", status: "active", lastPaid: "Dec 1, 2024" },
  { id: 3, name: "Hasan Ali", nameBn: "হাসান আলী", role: "Store Manager", roleBn: "স্টোর ম্যানেজার", phone: "01912-333333", salary: 18000, salesThisMonth: 320000, joined: "Aug 2022", avatar: "হ", status: "active", lastPaid: "Dec 1, 2024" },
  { id: 4, name: "Mina Khatun", nameBn: "মিনা খাতুন", role: "Inventory Staff", roleBn: "ইনভেন্টরি স্টাফ", phone: "01612-444444", salary: 9000, salesThisMonth: 0, joined: "Jun 2023", avatar: "ম", status: "active", lastPaid: "Dec 1, 2024" },
];

const initialNotifications: NotificationItem[] = [
  { id: 1, type: "alert", title: "Low Stock Alert", titleBn: "কম স্টক সতর্কতা", body: "Pran Salt 1kg has only 3 units left. Minimum stock is 15.", bodyBn: "প্রাণ লবণ ১কেজিতে মাত্র ৩টি বাকি। সর্বনিম্ন স্টক ১৫টি।", time: "2 min ago", read: false, color: "bg-ac-50 text-ink", badge: "bg-ac-100 text-ink" },
  { id: 2, type: "sale", title: "Sale Completed", titleBn: "বিক্রয় সম্পন্ন", body: "INV-1043 completed for Karim Ahmed — ৳2,850", bodyBn: "করিম আহমেদের INV-১০৪৩ সম্পন্ন — ৳২,৮৫০", time: "15 min ago", read: false, color: "bg-em-50 text-ink", badge: "bg-em-100 text-ink" },
  { id: 3, type: "due", title: "Overdue Payment Reminder", titleBn: "বকেয়া পেমেন্ট মনে করানো", body: "Sumaiya Khatun has ৳12,000 overdue since Nov 28.", bodyBn: "সুমাইয়া খাতুনের ৳১২,০০০ বাকি নভেম্বর ২৮ থেকে।", time: "1 hour ago", read: false, color: "bg-red-50 text-ink", badge: "bg-red-100 text-ink" },
  { id: 4, type: "stock", title: "Low Stock Alert", titleBn: "কম স্টক সতর্কতা", body: "BD Fresh Milk 1L — 8 units left (min: 20)", bodyBn: "বিডি ফ্রেশ মিল্ক — ৮টি বাকি (সর্বনিম্ন: ২০)", time: "2 hours ago", read: true, color: "bg-ac-50 text-ink", badge: "bg-ac-100 text-ink" },
  { id: 5, type: "supplier", title: "Supplier Payment Due", titleBn: "সাপ্লায়ার পেমেন্ট দেয়", body: "Pran-RFL Group payment of ৳21,400 is due on Dec 20.", bodyBn: "প্রাণ-আরএফএল গ্রুপের ৳২১,৪০০ পেমেন্ট ডিসেম্বর ২০ তারিখে।", time: "3 hours ago", read: true, color: "bg-nv-50 text-ink", badge: "bg-nv-100 text-ink" },
];

const initialSales: Sale[] = [
  {
    id: "sale-1042",
    invoiceNo: "INV-1042",
    customer: "Karim Ahmed",
    customerPhone: "01712-345678",
    items: [
      { name: "Fresh Sunflower Oil 5L", nameBn: "ফ্রেশ সানফ্লাওয়ার অয়েল ৫লি", qty: 2, price: 300, discount: 0 },
      { name: "Pran RUCHI Chanachur 200g", nameBn: "প্রাণ রুচি চানাচুর ২০০গ্রাম", qty: 3, price: 60, discount: 0 },
      { name: "Meril Shampoo 200ml", nameBn: "মেরিল শ্যাম্পু ২০০মিলি", qty: 1, price: 150, discount: 20 },
      { name: "BD Fresh Milk 1L", nameBn: "বিডি ফ্রেশ মিল্ক ১লি", qty: 4, price: 80, discount: 0 },
      { name: "Pran Frooto 250ml", nameBn: "প্রাণ ফ্রুটো ২৫০মিলি", qty: 5, price: 25, discount: 0 },
    ],
    subtotal: 1345,
    discount: 20,
    vat: 0,
    grandTotal: 1325,
    paid: 1325,
    due: 0,
    paymentMethod: "cash",
    cashGiven: 1500,
    change: 175,
    date: "December 13, 2024",
    time: "6:32 PM",
    status: "completed",
  },
  {
    id: "sale-1041",
    invoiceNo: "INV-1041",
    customer: "Sumaiya Khatun",
    customerPhone: "01812-456789",
    items: [
      { name: "Fresh Sunflower Oil 5L", nameBn: "ফ্রেশ সানফ্লাওয়ার অয়েল ৫লি", qty: 4, price: 300, discount: 0 },
    ],
    subtotal: 1200,
    discount: 0,
    vat: 0,
    grandTotal: 1200,
    paid: 1200,
    due: 0,
    paymentMethod: "bkash",
    date: "December 13, 2024",
    time: "5:48 PM",
    status: "completed",
  },
  {
    id: "sale-1040",
    invoiceNo: "INV-1040",
    customer: "Walk-in Customer",
    items: [
      { name: "Bashundhara Tissue Box", nameBn: "বসুন্ধরা টিস্যু বক্স", qty: 5, price: 120, discount: 0 },
      { name: "Pran RUCHI Chanachur 200g", nameBn: "প্রাণ রুচি চানাচুর ২০০গ্রাম", qty: 10, price: 60, discount: 0 },
    ],
    subtotal: 1200,
    discount: 0,
    vat: 0,
    grandTotal: 1200,
    paid: 1200,
    due: 0,
    paymentMethod: "cash",
    date: "December 13, 2024",
    time: "5:12 PM",
    status: "completed",
  },
];

const initialSettings: ShopSettings = {
  shopName: "Rahim Store",
  shopNameBn: "রহিম স্টোর",
  ownerName: "Rahim Mia",
  businessType: "Grocery / মুদি দোকান",
  phone: "01712-345678",
  address: "House 42, Main Road, Dhanmondi, Dhaka 1209",
  currency: "BDT (৳)",
  taxRate: 0,
  autoPrint: true,
  soundEnabled: true,
  smsReminderTemplate: "Dear [Name], your due amount at Rahim Store is ৳[Amount]. Please pay at your earliest convenience. Thank you!",
  branch: "Main Branch (Dhanmondi)",
};

const initialVgoContributions: VGOContribution[] = [
  { id: "VGO-1092", contributor: "Rahim Mia", contributorType: "customer", action: "Purchased weekly grocery bundle", actionBn: "সাপ্তাহিক মুদি সদাই ক্রয় করেছেন", category: "transaction", impactUnits: 120, vgoRewarded: 24, proofHash: "0x8f4c...91b2", timestamp: "10 mins ago", status: "verified" },
  { id: "VGO-1091", contributor: "Pran-RFL Group", contributorType: "supplier", action: "100% On-Time Supply Delivery", actionBn: "১০০% সময়মতো সাপ্লাই ডেলিভারি সম্পন্ন", category: "logistics", impactUnits: 350, vgoRewarded: 70, proofHash: "0x3e1a...44f0", timestamp: "45 mins ago", status: "minted" },
  { id: "VGO-1090", contributor: "Tanvir Ahmed", contributorType: "employee", action: "Fast Checkout & Customer Delight", actionBn: "দ্রুত চেকআউট ও গ্রাহক সেবা প্রদান", category: "loyalty", impactUnits: 95, vgoRewarded: 19, proofHash: "0x11bb...cc29", timestamp: "2 hours ago", status: "verified" },
  { id: "VGO-1089", contributor: "Karim Ahmed", contributorType: "customer", action: "Store Referral (Referred 2 Neighbors)", actionBn: "২ জন নতুন গ্রাহক রেফার করেছেন", category: "collaboration", impactUnits: 250, vgoRewarded: 50, proofHash: "0x4a99...fe12", timestamp: "Yesterday", status: "shared" },
  { id: "VGO-1088", contributor: "Akij Consumer Care", contributorType: "supplier", action: "Direct Manufacturer Eco-Packaging", actionBn: "পরিবেশবান্ধব ইকো-প্যাকেজিং চালান", category: "governance", impactUnits: 180, vgoRewarded: 36, proofHash: "0x98dd...71ca", timestamp: "2 days ago", status: "minted" },
];

const initialVgoWallets: VGOWallet[] = [
  { id: "W-STORE", ownerName: "Rahim Store Treasury", ownerType: "store_treasury", balanceVGO: 48500, stakedVGO: 25000, totalEarned: 95000, reputationScore: 980, impactBadge: "Master Node" },
  { id: "W-01", ownerName: "Rahim Mia", ownerType: "customer", balanceVGO: 1420, stakedVGO: 500, totalEarned: 3200, reputationScore: 890, impactBadge: "Diamond Patron" },
  { id: "W-02", ownerName: "Karim Ahmed", ownerType: "customer", balanceVGO: 860, stakedVGO: 200, totalEarned: 1900, reputationScore: 820, impactBadge: "Pioneer" },
  { id: "W-03", ownerName: "Pran-RFL Group", ownerType: "supplier", balanceVGO: 12400, stakedVGO: 8000, totalEarned: 28000, reputationScore: 950, impactBadge: "Verified Partner" },
  { id: "W-04", ownerName: "Tanvir Ahmed", ownerType: "employee", balanceVGO: 640, stakedVGO: 150, totalEarned: 1400, reputationScore: 860, impactBadge: "Star Contributor" },
];

const initialVgoPool: VGONetworkPool = {
  totalPoolVGO: 250000,
  distributedToday: 4250,
  activeNetworkNodes: 1420,
  communityDividendsRate: 4.8,
  networkVelocity: 8.4,
  lastDistributionTime: "Just now",
};

// Initial Data: 1. Marketing
const initialSmsCampaigns: SMSCampaign[] = [
  { id: "SMS-101", title: "Weekend Discount Offer", titleBn: "উইকেন্ড স্পেশাল ছাড়", type: "promotional", recipientCount: 350, message: "Dear Customer, Get 10% flat off on all grocery items this Friday at Rahim Store! Shop now.", messageBn: "সম্মানিত গ্রাহক, শুক্রবার রহিম স্টোরে সকল মুদি পণ্যে ১০% বিশেষ ছাড়! আজই আসুন।", date: "Aug 22, 2026", status: "sent", cost: 140 },
  { id: "SMS-102", title: "Customer Due Friendly Reminder", titleBn: "বাকি পরিশোধের তাগাদা এসএমএস", type: "due_reminder", recipientCount: 7, message: "Dear Customer, Friendly reminder for your pending due at Rahim Store. Please settle at your convenience.", messageBn: "সম্মানিত গ্রাহক, রহিম স্টোরে আপনার বকেয়া পরিশোধের অনুরোধ রইল। ধন্যবাদ।", date: "Aug 24, 2026", status: "sent", cost: 3.5 },
  { id: "SMS-103", title: "Eid Mubarak Mega Offer", titleBn: "ঈদ মোবারক মেগা অফার", type: "festival", recipientCount: 500, message: "Eid Mubarak from Rahim Store! Special combo gift on shopping above ৳2000.", messageBn: "রহিম স্টোরের পক্ষ থেকে ঈদ মোবারক! ২০০০ টাকার কেনাকাটায় বিশেষ কম্বো গিফট।", date: "Scheduled for next week", status: "scheduled", cost: 200 },
];

const initialMetaAdSync: MetaAdSync = {
  catalogSynced: true,
  syncedProductsCount: 12,
  pixelId: "META-PIXEL-BD-89410",
  pixelActive: true,
  adSpend: 3400,
  conversions: 48,
};

// Initial Data: 2. Delivery Aggregator
const initialCourierParcels: CourierParcel[] = [
  { id: "PAR-901", trackingCode: "STF-BD-89211", courier: "steadfast", customerName: "Tanvir Hasan", customerPhone: "01711-223344", destination: "Mirpur 10, Dhaka", invoiceNo: "INV-2026-001", codAmount: 1850, deliveryFee: 60, status: "delivered", date: "Aug 24, 2026", codSettled: true },
  { id: "PAR-902", trackingCode: "PTH-EXP-44019", courier: "pathao", customerName: "Sultana Begum", customerPhone: "01819-556677", destination: "Sector 7, Uttara", invoiceNo: "INV-2026-002", codAmount: 3200, deliveryFee: 60, status: "in_transit", date: "Today, 11:30 AM", codSettled: false },
  { id: "PAR-903", trackingCode: "RDX-DH-10928", courier: "redx", customerName: "Mahbubur Rahman", customerPhone: "01912-778899", destination: "Chittagong GEC", invoiceNo: "INV-2026-003", codAmount: 950, deliveryFee: 130, status: "picked_up", date: "Today, 02:15 PM", codSettled: false },
  { id: "PAR-904", trackingCode: "ECO-NAT-55102", courier: "ecourier", customerName: "Karim Mia", customerPhone: "01788-990011", destination: "Sylhet Zindabazar", invoiceNo: "INV-2026-004", codAmount: 4100, deliveryFee: 130, status: "booked", date: "Today, 04:00 PM", codSettled: false },
];

// Initial Data: 3. Fintech, Banking & Loans
const initialBankApplications: BankAccountApplication[] = [
  { id: "BNK-01", bankName: "BRAC Bank Digital Merchant", bankLogo: "🏦", accountType: "current", accountNumber: "1501204899201001", status: "active", nidNumber: "1992269201994821", tradeLicense: "TRAD/DNCC/092182/2026", kycProgress: 100 },
  { id: "BNK-02", bankName: "bKash Merchant Enterprise Wallet", bankLogo: "📱", accountType: "merchant_wallet", accountNumber: "01712-345678", status: "active", nidNumber: "1992269201994821", tradeLicense: "TRAD/DNCC/092182/2026", kycProgress: 100 },
  { id: "BNK-03", bankName: "City Bank Islamic SME", bankLogo: "🏛️", accountType: "islamic_business", accountNumber: "21094892010", status: "approved", nidNumber: "1992269201994821", tradeLicense: "TRAD/DNCC/092182/2026", kycProgress: 100 },
];

const initialLoanOffers: SMELoanOffer[] = [
  { id: "LOAN-CITY-01", bankPartner: "City Bank SME QuickCredit", eligibleAmount: 150000, interestRate: 9.0, tenureMonths: 12, monthlyEMI: 13125, status: "pre_approved", activeLoanAmount: 0, paidInstallments: 0, totalInstallments: 12 },
  { id: "LOAN-BRAC-02", bankPartner: "BRAC Bank Shobuj SME Loan", eligibleAmount: 300000, interestRate: 8.5, tenureMonths: 24, monthlyEMI: 13640, status: "pre_approved", activeLoanAmount: 0, paidInstallments: 0, totalInstallments: 24 },
  { id: "LOAN-IDLC-03", bankPartner: "IDLC Micro Enterprise Credit", eligibleAmount: 75000, interestRate: 9.5, tenureMonths: 6, monthlyEMI: 12850, status: "pre_approved", activeLoanAmount: 0, paidInstallments: 0, totalInstallments: 6 },
];

const initialDigitalPayments: DigitalPaymentConfig = {
  banglaQRActive: true,
  merchantQrString: "00020101021226500010bd.gov.bb28380008bKash01017123456785204599953030505802BD5911Rahim Store6005Dhaka",
  bkashMerchantNumber: "01712-345678",
  nagadMerchantNumber: "01812-345678",
  paymentGatewayActive: true,
};

const initialPaymentLinks: PaymentLinkItem[] = [
  { id: "PLK-8801", customerName: "Tanvir Ahmed", amount: 1850, linkUrl: "https://pay.sayhpro.com/l/rahim-8801", purpose: "Grocery Home Delivery", createdDate: "Aug 24, 2026", status: "paid" },
  { id: "PLK-8802", customerName: "Farhana Islam", amount: 3400, linkUrl: "https://pay.sayhpro.com/l/rahim-8802", purpose: "Monthly Supplies Order", createdDate: "Today, 10:15 AM", status: "pending" },
  { id: "PLK-8803", customerName: "Abul Kalam", amount: 650, linkUrl: "https://pay.sayhpro.com/l/rahim-8803", purpose: "Dues Settlement via WhatsApp", createdDate: "Today, 01:40 PM", status: "pending" },
];

// Initial Data: 4. Reselling Products
const initialResellProducts: ResellProduct[] = [
  { id: "RSL-01", name: "T500 Ultra Smartwatch Series 8", nameBn: "টি৫০০ আল্ট্রা স্মার্টওয়াচ", category: "Electronics", wholesalePrice: 580, suggestedRetailPrice: 950, stock: 120, image: "⌚", supplier: "Global Tech Imports", rating: 4.8, isAddedToStore: true, mySellingPrice: 890, myProfit: 310 },
  { id: "RSL-02", name: "Kemei KM-6330 3-in-1 Grooming Trimmer", nameBn: "কেমেই ৩-ইন-১ গ্রুমিং ট্রিমার", category: "Electronics", wholesalePrice: 620, suggestedRetailPrice: 1050, stock: 85, image: "🪒", supplier: "Apex Electronics", rating: 4.7, isAddedToStore: true, mySellingPrice: 990, myProfit: 370 },
  { id: "RSL-03", name: "Pure Organic Cold-Pressed Mustard Oil 5L", nameBn: "খাঁটি ঘানি ভাঙা সরিষার তেল ৫লি", category: "Grocery", wholesalePrice: 1100, suggestedRetailPrice: 1450, stock: 60, image: "🫙", supplier: "Gramin Organic Hub", rating: 4.9, isAddedToStore: true, mySellingPrice: 1390, myProfit: 290 },
  { id: "RSL-04", name: "Premium Daawat Basmati Rice 5kg", nameBn: "দাওয়াত বাসমতি চাল ৫কেজি", category: "Grocery", wholesalePrice: 820, suggestedRetailPrice: 1100, stock: 45, image: "🌾", supplier: "Bengal Agro Foods", rating: 4.8, isAddedToStore: false },
  { id: "RSL-05", name: "Pro ANC Wireless Bluetooth Earbuds", nameBn: "ওয়্যারলেস ব্লুটুথ এয়ারবাডস", category: "Electronics", wholesalePrice: 450, suggestedRetailPrice: 799, stock: 140, image: "🎧", supplier: "SoundMax BD", rating: 4.6, isAddedToStore: false },
  { id: "RSL-06", name: "Semi-Stitched Premium Cotton Panjabi", nameBn: "প্রিমিয়াম সুতি পাঞ্জাবি", category: "Fashion", wholesalePrice: 750, suggestedRetailPrice: 1350, stock: 90, image: "👘", supplier: "Dhaka Fabrics Co.", rating: 4.9, isAddedToStore: false },
];

// Initial Data: 5. No-Code Website Storefront
const initialStorefrontConfig: StorefrontConfig = {
  subdomain: "rahimstore",
  customDomain: "rahimstore.com.bd",
  heroHeadline: "Rahim Store — Your Neighborhood Daily Grocery & Essentials",
  heroHeadlineBn: "রহিম স্টোর — আপনার বিশ্বস্ত অনলাইন মুদি ও নিত্যপ্রয়োজনীয় দোকান",
  heroSubheadline: "Fast 1-hour home delivery across Dhanmondi and surrounding areas. Best quality guaranteed.",
  heroSubheadlineBn: "ধানমন্ডি ও সংলগ্ন এলাকায় ১ ঘণ্টায় হোম ডেলিভারি। সেরা গুণগত মানের নিশ্চয়তা।",
  themeColor: "#16A34A",
  bannerImage: "🛒",
  logo: "RA",
  announcementText: "🎉 Free Home Delivery on all orders above ৳1000! Order now via WhatsApp.",
  announcementTextBn: "🎉 ১০০০ টাকার বেশি অর্ডারে ফ্রি হোম ডেলিভারি! এখনই হোয়াটসঅ্যাপে অর্ডার করুন।",
  showWhatsAppButton: true,
  whatsAppNumber: "01712-345678",
  allowCOD: true,
  showReviews: true,
  featuredProductIds: [1, 2, 3, 4],
  published: true,
};

// Initial Data: 6. Monitoring & Alerts
const initialMonitoringRules: MonitoringRule[] = [
  { id: "RULE-01", name: "Low Stock Emergency Threshold", nameBn: "কম স্টক জরুরি সতর্কবার্তা", type: "low_stock", enabled: true, thresholdValue: 5, channel: "sms", lastTriggered: "Today, 09:15 AM" },
  { id: "RULE-02", name: "Customer Due Aging (> 30 Days)", nameBn: "বকেয়া মেয়াদোত্তীর্ণ সতর্কতা (> ৩০ দিন)", type: "high_due", enabled: true, thresholdValue: 5000, channel: "push", lastTriggered: "Yesterday" },
  { id: "RULE-03", name: "Cash Drawer Discrepancy Alert", nameBn: "ক্যাশ ড্রয়ার গরমিল সতর্কতা", type: "cash_discrepancy", enabled: true, thresholdValue: 500, channel: "whatsapp", lastTriggered: "3 days ago" },
  { id: "RULE-04", name: "Daily Automatic Closing Profit Report", nameBn: "দৈনিক স্বয়ংক্রিয় লাভ-ক্ষতি এসএমএস", type: "daily_profit_sms", enabled: true, thresholdValue: 0, channel: "sms", lastTriggered: "Yesterday, 10:00 PM" },
];

const initialBusinessAlerts: BusinessAlert[] = [
  { id: "ALT-01", ruleType: "low_stock", title: "Low Stock Alert: BD Fresh Milk 1L", titleBn: "কম স্টক: বিডি ফ্রেশ মিল্ক ১লি", message: "Only 8 liters remaining in inventory. Please restock immediately.", messageBn: "দোকানে মাত্র ৮ লিটার অবশিষ্ট আছে। অবিলম্বে রি-স্টক করুন।", severity: "warning", time: "2 hours ago", resolved: false },
  { id: "ALT-02", ruleType: "high_due", title: "High Due Warning: Karim Ahmed (৳14,500)", titleBn: "উচ্চ বকেয়া: করিম আহমেদ (৳১৪,৫০০)", message: "Due unpaid for more than 35 days. Send automated SMS reminder.", messageBn: "৩৫ দিনেরও বেশি সময় ধরে বাকি অপরিশোধিত। এসএমএস তাগাদা পাঠান।", severity: "critical", time: "5 hours ago", resolved: false },
  { id: "ALT-03", ruleType: "daily_profit_sms", title: "Daily Sales Summary Dispatched", titleBn: "দৈনিক বিক্রয় সারাংশ পাঠানো হয়েছে", message: "Today's Net Profit summary SMS successfully delivered to Owner phone.", messageBn: "আজকের নিট লাভের সারাংশ এসএমএস মালিকের ফোনে পাঠানো হয়েছে।", severity: "info", time: "Yesterday", resolved: true },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<"en" | "bn">("en");

  // Load from localStorage or defaults
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem("dukan_products");
      return saved ? JSON.parse(saved) : initialProducts;
    } catch {
      return initialProducts;
    }
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    try {
      const saved = localStorage.getItem("dukan_sales");
      return saved ? JSON.parse(saved) : initialSales;
    } catch {
      return initialSales;
    }
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem("dukan_customers");
      return saved ? JSON.parse(saved) : initialCustomers;
    } catch {
      return initialCustomers;
    }
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    try {
      const saved = localStorage.getItem("dukan_suppliers");
      return saved ? JSON.parse(saved) : initialSuppliers;
    } catch {
      return initialSuppliers;
    }
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    try {
      const saved = localStorage.getItem("dukan_purchases");
      return saved ? JSON.parse(saved) : initialPurchases;
    } catch {
      return initialPurchases;
    }
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem("dukan_expenses");
      return saved ? JSON.parse(saved) : initialExpenses;
    } catch {
      return initialExpenses;
    }
  });

  const [accounts, setAccounts] = useState<CashAccount[]>(() => {
    try {
      const saved = localStorage.getItem("dukan_accounts");
      return saved ? JSON.parse(saved) : initialAccounts;
    } catch {
      return initialAccounts;
    }
  });

  const [transactions, setTransactions] = useState<CashTransaction[]>(() => {
    try {
      const saved = localStorage.getItem("dukan_transactions");
      return saved ? JSON.parse(saved) : initialTransactions;
    } catch {
      return initialTransactions;
    }
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem("dukan_employees");
      return saved ? JSON.parse(saved) : initialEmployees;
    } catch {
      return initialEmployees;
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem("dukan_notifications");
      return saved ? JSON.parse(saved) : initialNotifications;
    } catch {
      return initialNotifications;
    }
  });

  const [settings, setSettings] = useState<ShopSettings>(() => {
    try {
      const saved = localStorage.getItem("dukan_settings");
      return saved ? JSON.parse(saved) : initialSettings;
    } catch {
      return initialSettings;
    }
  });

  const [currentInvoice, setCurrentInvoice] = useState<Sale | null>(() => {
    return initialSales[0] || null;
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickModal, setQuickModal] = useState<string | null>(null);

  const [vgoContributions, setVgoContributions] = useState<VGOContribution[]>(() => {
    try {
      const saved = localStorage.getItem("vgo_contributions");
      return saved ? JSON.parse(saved) : initialVgoContributions;
    } catch {
      return initialVgoContributions;
    }
  });

  const [vgoWallets, setVgoWallets] = useState<VGOWallet[]>(() => {
    try {
      const saved = localStorage.getItem("vgo_wallets");
      return saved ? JSON.parse(saved) : initialVgoWallets;
    } catch {
      return initialVgoWallets;
    }
  });

  const [vgoPool, setVgoPool] = useState<VGONetworkPool>(() => {
    try {
      const saved = localStorage.getItem("vgo_pool");
      return saved ? JSON.parse(saved) : initialVgoPool;
    } catch {
      return initialVgoPool;
    }
  });

  // 1. Marketing State
  const [smsCampaigns, setSmsCampaigns] = useState<SMSCampaign[]>(() => {
    try {
      const saved = localStorage.getItem("dukan_sms_campaigns");
      return saved ? JSON.parse(saved) : initialSmsCampaigns;
    } catch {
      return initialSmsCampaigns;
    }
  });
  const [smsBalance, setSmsBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("dukan_sms_balance");
      return saved ? JSON.parse(saved) : 420;
    } catch {
      return 420;
    }
  });
  const [metaAdSync, setMetaAdSync] = useState<MetaAdSync>(() => {
    try {
      const saved = localStorage.getItem("dukan_meta_sync");
      return saved ? JSON.parse(saved) : initialMetaAdSync;
    } catch {
      return initialMetaAdSync;
    }
  });

  // 2. Delivery Aggregator State
  const [courierParcels, setCourierParcels] = useState<CourierParcel[]>(() => {
    try {
      const saved = localStorage.getItem("dukan_courier_parcels");
      return saved ? JSON.parse(saved) : initialCourierParcels;
    } catch {
      return initialCourierParcels;
    }
  });

  // 3. Fintech, Banking & Loans State
  const [bankApplications, setBankApplications] = useState<BankAccountApplication[]>(() => {
    try {
      const saved = localStorage.getItem("dukan_bank_apps");
      return saved ? JSON.parse(saved) : initialBankApplications;
    } catch {
      return initialBankApplications;
    }
  });
  const [smeLoanOffers, setSmeLoanOffers] = useState<SMELoanOffer[]>(() => {
    try {
      const saved = localStorage.getItem("dukan_loan_offers");
      return saved ? JSON.parse(saved) : initialLoanOffers;
    } catch {
      return initialLoanOffers;
    }
  });
  const [digitalPayments, setDigitalPayments] = useState<DigitalPaymentConfig>(() => {
    try {
      const saved = localStorage.getItem("dukan_digital_payments");
      return saved ? JSON.parse(saved) : initialDigitalPayments;
    } catch {
      return initialDigitalPayments;
    }
  });
  const [paymentLinks, setPaymentLinks] = useState<PaymentLinkItem[]>(() => {
    try {
      const saved = localStorage.getItem("dukan_payment_links");
      return saved ? JSON.parse(saved) : initialPaymentLinks;
    } catch {
      return initialPaymentLinks;
    }
  });

  // 4. Reselling State
  const [resellProducts, setResellProducts] = useState<ResellProduct[]>(() => {
    try {
      const saved = localStorage.getItem("dukan_resell_products");
      return saved ? JSON.parse(saved) : initialResellProducts;
    } catch {
      return initialResellProducts;
    }
  });

  // 5. Storefront State
  const [storefront, setStorefront] = useState<StorefrontConfig>(() => {
    try {
      const saved = localStorage.getItem("dukan_storefront");
      return saved ? JSON.parse(saved) : initialStorefrontConfig;
    } catch {
      return initialStorefrontConfig;
    }
  });

  // 6. Monitoring & Alerts State
  const [monitoringRules, setMonitoringRules] = useState<MonitoringRule[]>(() => {
    try {
      const saved = localStorage.getItem("dukan_monitoring_rules");
      return saved ? JSON.parse(saved) : initialMonitoringRules;
    } catch {
      return initialMonitoringRules;
    }
  });
  const [businessAlerts, setBusinessAlerts] = useState<BusinessAlert[]>(() => {
    try {
      const saved = localStorage.getItem("dukan_business_alerts");
      return saved ? JSON.parse(saved) : initialBusinessAlerts;
    } catch {
      return initialBusinessAlerts;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("dukan_products", JSON.stringify(products));
      localStorage.setItem("dukan_sales", JSON.stringify(sales));
      localStorage.setItem("dukan_customers", JSON.stringify(customers));
      localStorage.setItem("dukan_suppliers", JSON.stringify(suppliers));
      localStorage.setItem("dukan_purchases", JSON.stringify(purchases));
      localStorage.setItem("dukan_expenses", JSON.stringify(expenses));
      localStorage.setItem("dukan_accounts", JSON.stringify(accounts));
      localStorage.setItem("dukan_transactions", JSON.stringify(transactions));
      localStorage.setItem("dukan_employees", JSON.stringify(employees));
      localStorage.setItem("dukan_notifications", JSON.stringify(notifications));
      localStorage.setItem("dukan_settings", JSON.stringify(settings));
      localStorage.setItem("vgo_contributions", JSON.stringify(vgoContributions));
      localStorage.setItem("vgo_wallets", JSON.stringify(vgoWallets));
      localStorage.setItem("vgo_pool", JSON.stringify(vgoPool));
      localStorage.setItem("dukan_sms_campaigns", JSON.stringify(smsCampaigns));
      localStorage.setItem("dukan_sms_balance", JSON.stringify(smsBalance));
      localStorage.setItem("dukan_meta_sync", JSON.stringify(metaAdSync));
      localStorage.setItem("dukan_courier_parcels", JSON.stringify(courierParcels));
      localStorage.setItem("dukan_bank_apps", JSON.stringify(bankApplications));
      localStorage.setItem("dukan_loan_offers", JSON.stringify(smeLoanOffers));
      localStorage.setItem("dukan_digital_payments", JSON.stringify(digitalPayments));
      localStorage.setItem("dukan_payment_links", JSON.stringify(paymentLinks));
      localStorage.setItem("dukan_resell_products", JSON.stringify(resellProducts));
      localStorage.setItem("dukan_storefront", JSON.stringify(storefront));
      localStorage.setItem("dukan_monitoring_rules", JSON.stringify(monitoringRules));
      localStorage.setItem("dukan_business_alerts", JSON.stringify(businessAlerts));
    } catch (e) {
      console.error("Storage error:", e);
    }
  }, [
    products, sales, customers, suppliers, purchases, expenses, accounts, transactions, employees,
    notifications, settings, vgoContributions, vgoWallets, vgoPool, smsCampaigns, smsBalance, metaAdSync,
    courierParcels, bankApplications, smeLoanOffers, digitalPayments, paymentLinks, resellProducts,
    storefront, monitoringRules, businessAlerts
  ]);

  const updateProductStatus = (stock: number, min: number): "in-stock" | "low-stock" | "out-of-stock" => {
    if (stock <= 0) return "out-of-stock";
    if (stock <= min) return "low-stock";
    return "in-stock";
  };

  // Products Actions
  const addProduct = (p: Omit<Product, "id" | "status">) => {
    const id = Date.now();
    const status = updateProductStatus(p.stock, p.min);
    const newProduct: Product = { ...p, id, status };
    setProducts(prev => [newProduct, ...prev]);
    toast({
      type: "success",
      title: lang === "bn" ? "পণ্য যোগ করা হয়েছে!" : "Product Added!",
      message: `${p.name} (Stock: ${p.stock})`,
    });
  };

  const updateProduct = (id: number, p: Partial<Product>) => {
    setProducts(prev =>
      prev.map(item => {
        if (item.id === id) {
          const updated = { ...item, ...p };
          updated.status = updateProductStatus(updated.stock, updated.min);
          return updated;
        }
        return item;
      })
    );
    toast({
      type: "info",
      title: lang === "bn" ? "পণ্য আপডেট হয়েছে!" : "Product Updated!",
    });
  };

  const deleteProduct = (id: number) => {
    const p = products.find(x => x.id === id);
    setProducts(prev => prev.filter(item => item.id !== id));
    toast({
      type: "error",
      title: lang === "bn" ? "পণ্য মুছে ফেলা হয়েছে" : "Product Deleted",
      message: p?.name,
    });
  };

  const adjustStock = (id: number, qtyDelta: number, reason: string) => {
    setProducts(prev =>
      prev.map(item => {
        if (item.id === id) {
          const newStock = Math.max(0, item.stock + qtyDelta);
          return {
            ...item,
            stock: newStock,
            status: updateProductStatus(newStock, item.min),
          };
        }
        return item;
      })
    );
    toast({
      type: "success",
      title: lang === "bn" ? "স্টক সমন্বয় সম্পন্ন" : "Stock Adjusted",
      message: `${reason}: ${qtyDelta > 0 ? "+" : ""}${qtyDelta}`,
    });
  };

  // POS & Sale Action
  const completeSale = (saleData: Omit<Sale, "id" | "invoiceNo" | "date" | "time" | "status">): Sale => {
    const invoiceNumber = `INV-${1044 + sales.length}`;
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

    const newSale: Sale = {
      ...saleData,
      id: `sale-${Date.now()}`,
      invoiceNo: invoiceNumber,
      date: dateStr,
      time: timeStr,
      status: saleData.due > 0 ? (saleData.paid > 0 ? "partial" : "due") : "completed",
    };

    // 1. Deduct Product Stocks
    setProducts(prev =>
      prev.map(p => {
        const sold = saleData.items.find(i => i.name === p.name || i.nameBn === p.nameBn);
        if (sold) {
          const newStock = Math.max(0, p.stock - sold.qty);
          return {
            ...p,
            stock: newStock,
            status: updateProductStatus(newStock, p.min),
          };
        }
        return p;
      })
    );

    // 2. Add Money to Account if Paid
    if (saleData.paid > 0) {
      const accId = saleData.paymentMethod === "due" ? "cash" : saleData.paymentMethod;
      setAccounts(prev =>
        prev.map(a => {
          if (a.id === accId || (accId === "cash" && a.id === "cash")) {
            return { ...a, balance: a.balance + saleData.paid, in: a.in + saleData.paid };
          }
          return a;
        })
      );

      // Add cash transaction
      const newTx: CashTransaction = {
        id: `TX-${Date.now()}`,
        type: "in",
        desc: `Sale ${invoiceNumber} — ${saleData.customer}`,
        descBn: `বিক্রয় আয় ${invoiceNumber}`,
        account: accId.toUpperCase(),
        amount: saleData.paid,
        time: `${timeStr} Today`,
      };
      setTransactions(prev => [newTx, ...prev]);
    }

    // 3. Update Customer records if due or existing customer
    if (saleData.customer && saleData.customer !== "Walk-in" && saleData.customer !== "Walk-in Customer") {
      setCustomers(prev =>
        prev.map(c => {
          if (c.name.toLowerCase() === saleData.customer.toLowerCase() || (saleData.customerPhone && c.phone === saleData.customerPhone)) {
            return {
              ...c,
              totalPurchases: c.totalPurchases + saleData.grandTotal,
              due: c.due + saleData.due,
              visits: c.visits + 1,
              lastVisit: "Today",
              status: c.due + saleData.due > 0 ? "due" : c.status,
            };
          }
          return c;
        })
      );
    }

    // 4. Record notification
    addNotification({
      type: "sale",
      title: "Sale Completed",
      titleBn: "বিক্রয় সম্পন্ন",
      body: `${invoiceNumber} for ${saleData.customer} — ৳${saleData.grandTotal.toLocaleString()}`,
      bodyBn: `${saleData.customer}-এর জন্য ${invoiceNumber} সম্পন্ন — ৳${saleData.grandTotal.toLocaleString()}`,
      color: "bg-em-50 text-ink",
      badge: "bg-em-100 text-ink",
    });

    setSales(prev => [newSale, ...prev]);
    setCurrentInvoice(newSale);

    toast({
      type: "success",
      title: lang === "bn" ? "বিক্রয় সফলভাবে সম্পন্ন!" : "Sale Completed Successfully!",
      message: `${invoiceNumber} · ৳${saleData.grandTotal.toLocaleString()}`,
    });

    return newSale;
  };

  // Customers Actions
  const addCustomer = (c: Omit<Customer, "id" | "totalPurchases" | "visits" | "lastVisit" | "rating" | "avatar"> & { totalPurchases?: number }) => {
    const id = Date.now();
    const avatar = c.nameBn ? c.nameBn.slice(0, 1) : c.name.slice(0, 1);
    const newCust: Customer = {
      ...c,
      id,
      totalPurchases: c.totalPurchases ?? 0,
      visits: 1,
      lastVisit: "Today",
      rating: 5,
      avatar,
      status: c.due > 0 ? "due" : "new",
    };
    setCustomers(prev => [newCust, ...prev]);
    toast({
      type: "success",
      title: lang === "bn" ? "গ্রাহক যোগ করা হয়েছে!" : "Customer Added!",
      message: c.name,
    });
  };

  const updateCustomer = (id: number, c: Partial<Customer>) => {
    setCustomers(prev => prev.map(item => (item.id === id ? { ...item, ...c } : item)));
    toast({ type: "info", title: lang === "bn" ? "গ্রাহকের তথ্য আপডেট হয়েছে" : "Customer Updated" });
  };

  const deleteCustomer = (id: number) => {
    setCustomers(prev => prev.filter(item => item.id !== id));
    toast({ type: "error", title: lang === "bn" ? "গ্রাহক মুছে ফেলা হয়েছে" : "Customer Deleted" });
  };

  const recordCustomerPayment = (customerId: number, amount: number, accountId: string, note?: string) => {
    const cust = customers.find(c => c.id === customerId);
    if (!cust) return;

    const newDue = Math.max(0, cust.due - amount);
    setCustomers(prev =>
      prev.map(c =>
        c.id === customerId
          ? {
              ...c,
              due: newDue,
              lastPayment: "Today",
              status: newDue === 0 ? "regular" : "due",
            }
          : c
      )
    );

    // Add money to account
    setAccounts(prev =>
      prev.map(a =>
        a.id === accountId
          ? { ...a, balance: a.balance + amount, in: a.in + amount }
          : a
      )
    );

    // Record cash transaction
    setTransactions(prev => [
      {
        id: `TX-${Date.now()}`,
        type: "in",
        desc: `Due Collected — ${cust.name}`,
        descBn: `বাকি গ্রহণ — ${cust.nameBn || cust.name}`,
        account: accountId.toUpperCase(),
        amount: amount,
        time: "Today",
      },
      ...prev,
    ]);

    toast({
      type: "success",
      title: lang === "bn" ? "বকেয়া টাকা গ্রহণ সম্পন্ন!" : "Payment Collected!",
      message: `${cust.name}: ৳${amount.toLocaleString()} (Remaining Due: ৳${newDue.toLocaleString()})`,
    });
  };

  const addCustomerDue = (customerId: number, amount: number, note?: string) => {
    setCustomers(prev =>
      prev.map(c =>
        c.id === customerId
          ? {
              ...c,
              due: c.due + amount,
              status: "due",
            }
          : c
      )
    );
    toast({
      type: "warning",
      title: lang === "bn" ? "বকেয়া হিসাব যুক্ত হয়েছে" : "Due Recorded",
      message: `৳${amount.toLocaleString()}`,
    });
  };

  // Suppliers Actions
  const addSupplier = (sup: Omit<Supplier, "id" | "totalPurchases" | "paid" | "avatar">) => {
    const id = Date.now();
    const avatar = sup.name.slice(0, 1).toUpperCase();
    const newSup: Supplier = {
      ...sup,
      id,
      totalPurchases: sup.due,
      paid: 0,
      avatar,
    };
    setSuppliers(prev => [newSup, ...prev]);
    toast({
      type: "success",
      title: lang === "bn" ? "সাপ্লায়ার যুক্ত হয়েছে!" : "Supplier Added!",
      message: sup.name,
    });
  };

  const recordSupplierPayment = (supplierId: number, amount: number, accountId: string) => {
    const sup = suppliers.find(s => s.id === supplierId);
    if (!sup) return;

    setSuppliers(prev =>
      prev.map(s =>
        s.id === supplierId
          ? {
              ...s,
              paid: s.paid + amount,
              due: Math.max(0, s.due - amount),
            }
          : s
      )
    );

    // Deduct cash from account
    setAccounts(prev =>
      prev.map(a =>
        a.id === accountId
          ? { ...a, balance: Math.max(0, a.balance - amount), out: a.out + amount }
          : a
      )
    );

    setTransactions(prev => [
      {
        id: `TX-${Date.now()}`,
        type: "out",
        desc: `Supplier Payment — ${sup.name}`,
        descBn: `সাপ্লায়ার পেমেন্ট — ${sup.nameBn || sup.name}`,
        account: accountId.toUpperCase(),
        amount: amount,
        time: "Today",
      },
      ...prev,
    ]);

    toast({
      type: "success",
      title: lang === "bn" ? "সাপ্লায়ার পরিশোধ সম্পন্ন!" : "Supplier Paid!",
      message: `${sup.name}: ৳${amount.toLocaleString()}`,
    });
  };

  // Purchases Actions
  const addPurchase = (purchase: {
    supplier: string;
    invoiceNo?: string;
    date: string;
    items: PurchaseItem[];
    paid: number;
    paymentMethod: string;
  }) => {
    const totalCost = purchase.items.reduce((sum, item) => sum + item.qty * item.cost, 0);
    const dueAmount = Math.max(0, totalCost - purchase.paid);
    const purchaseId = `PUR-${1000 + purchases.length + 1}`;

    const newPurchase: Purchase = {
      id: purchaseId,
      supplier: purchase.supplier,
      date: purchase.date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      items: purchase.items,
      itemCount: purchase.items.length,
      total: totalCost,
      paid: purchase.paid,
      due: dueAmount,
      status: dueAmount === 0 ? "paid" : purchase.paid > 0 ? "partial" : "credit",
      invoiceNo: purchase.invoiceNo,
    };

    // 1. Update Product stocks or create if new
    purchase.items.forEach(pItem => {
      const match = products.find(p => p.name.toLowerCase() === pItem.product.toLowerCase());
      if (match) {
        adjustStock(match.id, pItem.qty, `Purchase ${purchaseId}`);
      }
    });

    // 2. Deduct from account if paid
    if (purchase.paid > 0) {
      setAccounts(prev =>
        prev.map(a =>
          a.id === purchase.paymentMethod
            ? { ...a, balance: Math.max(0, a.balance - purchase.paid), out: a.out + purchase.paid }
            : a
        )
      );

      setTransactions(prev => [
        {
          id: `TX-${Date.now()}`,
          type: "out",
          desc: `Stock Purchase — ${purchase.supplier}`,
          descBn: `স্টক ক্রয় — ${purchase.supplier}`,
          account: purchase.paymentMethod.toUpperCase(),
          amount: purchase.paid,
          time: "Today",
        },
        ...prev,
      ]);
    }

    // 3. Update supplier balance if due
    if (dueAmount > 0) {
      setSuppliers(prev =>
        prev.map(s =>
          s.name.toLowerCase() === purchase.supplier.toLowerCase()
            ? {
                ...s,
                totalPurchases: s.totalPurchases + totalCost,
                due: s.due + dueAmount,
                paid: s.paid + purchase.paid,
              }
            : s
        )
      );
    }

    setPurchases(prev => [newPurchase, ...prev]);

    toast({
      type: "success",
      title: lang === "bn" ? "নতুন ক্রয় সংরক্ষিত হয়েছে!" : "Purchase Recorded!",
      message: `${purchaseId} · ৳${totalCost.toLocaleString()}`,
    });
  };

  // Expenses Actions
  const addExpense = (expense: Omit<Expense, "id">) => {
    const id = `EXP-${Date.now()}`;
    const newExp: Expense = { ...expense, id };

    // Deduct from account
    const accId = expense.paidFrom.toLowerCase().includes("bkash")
      ? "bkash"
      : expense.paidFrom.toLowerCase().includes("nagad")
      ? "nagad"
      : expense.paidFrom.toLowerCase().includes("bank")
      ? "bank"
      : "cash";

    setAccounts(prev =>
      prev.map(a =>
        a.id === accId
          ? { ...a, balance: Math.max(0, a.balance - expense.amount), out: a.out + expense.amount }
          : a
      )
    );

    setTransactions(prev => [
      {
        id: `TX-${Date.now()}`,
        type: "out",
        desc: `Expense: ${expense.category} — ${expense.note || ""}`,
        descBn: `খরচ: ${expense.categoryBn || expense.category}`,
        account: accId.toUpperCase(),
        amount: expense.amount,
        time: "Today",
      },
      ...prev,
    ]);

    setExpenses(prev => [newExp, ...prev]);

    toast({
      type: "success",
      title: lang === "bn" ? "খরচ যুক্ত হয়েছে!" : "Expense Added!",
      message: `${expense.category}: ৳${expense.amount.toLocaleString()}`,
    });
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    toast({ type: "info", title: lang === "bn" ? "খরচ মুছে ফেলা হয়েছে" : "Expense Deleted" });
  };

  // Cash & Accounts Actions
  const addCashDeposit = (accountId: string, amount: number, note: string) => {
    setAccounts(prev =>
      prev.map(a =>
        a.id === accountId
          ? { ...a, balance: a.balance + amount, in: a.in + amount }
          : a
      )
    );

    setTransactions(prev => [
      {
        id: `TX-${Date.now()}`,
        type: "in",
        desc: `Deposit: ${note || "Cash Added"}`,
        descBn: `ক্যাশ জমা: ${note || "ক্যাশ যোগ"}`,
        account: accountId.toUpperCase(),
        amount: amount,
        time: "Today",
      },
      ...prev,
    ]);

    toast({
      type: "success",
      title: lang === "bn" ? "ক্যাশ জমা সফল!" : "Cash Deposit Successful!",
      message: `৳${amount.toLocaleString()}`,
    });
  };

  const transferCash = (fromId: string, toId: string, amount: number, note?: string) => {
    const fromAcc = accounts.find(a => a.id === fromId);
    if (!fromAcc || fromAcc.balance < amount) {
      toast({
        type: "error",
        title: lang === "bn" ? "অপর্যাপ্ত ব্যালেন্স!" : "Insufficient Balance!",
        message: `${fromAcc?.name} balance is ৳${fromAcc?.balance.toLocaleString()}`,
      });
      return;
    }

    setAccounts(prev =>
      prev.map(a => {
        if (a.id === fromId) return { ...a, balance: a.balance - amount, out: a.out + amount };
        if (a.id === toId) return { ...a, balance: a.balance + amount, in: a.in + amount };
        return a;
      })
    );

    const toAcc = accounts.find(a => a.id === toId);

    setTransactions(prev => [
      {
        id: `TX-${Date.now()}`,
        type: "transfer",
        desc: `${fromAcc.name} → ${toAcc?.name} Transfer`,
        descBn: `${fromAcc.nameBn} থেকে ${toAcc?.nameBn} ট্রান্সফার`,
        account: `${fromId.toUpperCase()} → ${toId.toUpperCase()}`,
        amount: amount,
        time: "Today",
      },
      ...prev,
    ]);

    toast({
      type: "success",
      title: lang === "bn" ? "ট্রান্সফার সম্পন্ন হয়েছে!" : "Transfer Completed!",
      message: `৳${amount.toLocaleString()} from ${fromAcc.name} to ${toAcc?.name}`,
    });
  };

  // Employees Actions
  const addEmployee = (emp: Omit<Employee, "id" | "salesThisMonth" | "avatar" | "status">) => {
    const id = Date.now();
    const avatar = emp.nameBn ? emp.nameBn.slice(0, 1) : emp.name.slice(0, 1);
    const newEmp: Employee = {
      ...emp,
      id,
      salesThisMonth: 0,
      avatar,
      status: "active",
    };
    setEmployees(prev => [...prev, newEmp]);
    toast({
      type: "success",
      title: lang === "bn" ? "কর্মচারী যুক্ত হয়েছে!" : "Employee Added!",
      message: emp.name,
    });
  };

  const updateEmployee = (id: number, emp: Partial<Employee>) => {
    setEmployees(prev => prev.map(item => (item.id === id ? { ...item, ...emp } : item)));
    toast({ type: "info", title: lang === "bn" ? "কর্মচারী আপডেট হয়েছে" : "Employee Updated" });
  };

  const deleteEmployee = (id: number) => {
    setEmployees(prev => prev.filter(item => item.id !== id));
    toast({ type: "error", title: lang === "bn" ? "কর্মচারী মুছে ফেলা হয়েছে" : "Employee Deleted" });
  };

  const paySalary = (empId: number, accountId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    addExpense({
      category: "Salary",
      categoryBn: "বেতন",
      amount: emp.salary,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      paidFrom: accountId.toUpperCase(),
      note: `Salary payment for ${emp.name} (${emp.role})`,
    });

    setEmployees(prev =>
      prev.map(e =>
        e.id === empId ? { ...e, lastPaid: "Today" } : e
      )
    );

    toast({
      type: "success",
      title: lang === "bn" ? "বেতন পরিশোধ সম্পন্ন!" : "Salary Paid Successfully!",
      message: `${emp.name}: ৳${emp.salary.toLocaleString()}`,
    });
  };

  // Notifications Actions
  const markNotificationRead = (id: number) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast({ type: "info", title: lang === "bn" ? "সব নোটিফিকেশন পড়া হিসেবে চিহ্নিত" : "All notifications marked as read" });
  };

  const clearNotifications = () => {
    setNotifications([]);
    toast({ type: "info", title: lang === "bn" ? "সব নোটিফিকেশন মুছে ফেলা হয়েছে" : "All notifications cleared" });
  };

  const addNotification = (item: Omit<NotificationItem, "id" | "time" | "read">) => {
    const id = Date.now();
    const newN: NotificationItem = {
      ...item,
      id,
      time: "Just now",
      read: false,
    };
    setNotifications(prev => [newN, ...prev]);
  };

  // Settings Actions
  const updateSettings = (s: Partial<ShopSettings>) => {
    setSettings(prev => ({ ...prev, ...s }));
    toast({
      type: "success",
      title: lang === "bn" ? "সেটিংস সংরক্ষিত হয়েছে!" : "Settings Saved!",
    });
  };

  const resetToDefaultData = () => {
    setProducts(initialProducts);
    setSales(initialSales);
    setCustomers(initialCustomers);
    setSuppliers(initialSuppliers);
    setPurchases(initialPurchases);
    setExpenses(initialExpenses);
    setAccounts(initialAccounts);
    setTransactions(initialTransactions);
    setEmployees(initialEmployees);
    setNotifications(initialNotifications);
    setSettings(initialSettings);
    setCurrentInvoice(initialSales[0]);
    toast({ type: "info", title: "Demo Data Reset to Defaults" });
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        sales,
        currentInvoice,
        setCurrentInvoice,
        completeSale,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        recordCustomerPayment,
        addCustomerDue,
        suppliers,
        addSupplier,
        recordSupplierPayment,
        purchases,
        addPurchase,
        expenses,
        addExpense,
        deleteExpense,
        accounts,
        transactions,
        addCashDeposit,
        transferCash,
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        paySalary,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        addNotification,
        // VGO Value Economy actions
        vgoContributions,
        vgoWallets,
        vgoPool,
        recordVgoContribution: (c: Omit<VGOContribution, "id" | "proofHash" | "timestamp" | "status">) => {
          const id = `VGO-${Math.floor(1000 + Math.random() * 9000)}`;
          const proofHash = `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`;
          const newContribution: VGOContribution = {
            ...c,
            id,
            proofHash,
            timestamp: "Just now",
            status: "verified",
          };
          setVgoContributions(prev => [newContribution, ...prev]);
          setVgoWallets(prev => prev.map(w => {
            if (w.ownerName.toLowerCase() === c.contributor.toLowerCase()) {
              return {
                ...w,
                balanceVGO: w.balanceVGO + c.vgoRewarded,
                totalEarned: w.totalEarned + c.vgoRewarded,
                reputationScore: Math.min(1000, w.reputationScore + Math.round(c.impactUnits / 10)),
              };
            }
            return w;
          }));
          toast({
            type: "success",
            title: lang === "bn" ? "অবদান রেকর্ড ও ইমপ্যাক্ট স্বীকৃত!" : "Contribution Recorded & Impact Recognized!",
            message: `${c.action} (+${c.vgoRewarded} VGO Value Units)`,
          });
        },
        transferVgoValue: (fromWalletId: string, toWalletId: string, amount: number, note?: string) => {
          const fromW = vgoWallets.find(w => w.id === fromWalletId);
          if (!fromW || fromW.balanceVGO < amount) {
            toast({
              type: "error",
              title: lang === "bn" ? "অপর্যাপ্ত ব্যালেন্স" : "Insufficient VGO Balance",
              message: "Cannot transfer more than available wallet balance.",
            });
            return;
          }
          setVgoWallets(prev => prev.map(w => {
            if (w.id === fromWalletId) return { ...w, balanceVGO: w.balanceVGO - amount };
            if (w.id === toWalletId) return { ...w, balanceVGO: w.balanceVGO + amount };
            return w;
          }));
          toast({
            type: "success",
            title: lang === "bn" ? "ভ্যালু ট্রান্সফার সফল!" : "Value Transferred Successfully!",
            message: `${amount} VGO moved across network (${note || "Direct Settlement"}).`,
          });
        },
        stakeVgoTokens: (walletId: string, amount: number) => {
          const w = vgoWallets.find(w => w.id === walletId);
          if (!w || w.balanceVGO < amount) return;
          setVgoWallets(prev => prev.map(item => item.id === walletId ? {
            ...item,
            balanceVGO: item.balanceVGO - amount,
            stakedVGO: item.stakedVGO + amount,
          } : item));
          toast({
            type: "success",
            title: lang === "bn" ? "নেটওয়ার্ক স্ট্যাকিং সম্পন্ন!" : "Network Staking Completed!",
            message: `${amount} VGO staked for collective yield sharing.`,
          });
        },
        distributeVgoPool: (amount: number, poolType = "Community Dividends") => {
          setVgoPool(prev => ({
            ...prev,
            totalPoolVGO: Math.max(0, prev.totalPoolVGO - amount),
            distributedToday: prev.distributedToday + amount,
            lastDistributionTime: "Just now",
          }));
          // Add reward to all active node wallets proportionally
          setVgoWallets(prev => prev.map(w => ({
            ...w,
            balanceVGO: w.balanceVGO + Math.round((amount / prev.length)),
            totalEarned: w.totalEarned + Math.round((amount / prev.length)),
          })));
          toast({
            type: "success",
            title: lang === "bn" ? "নেটওয়ার্ক ডিভিডেন্ড শেয়ার সম্পন্ন!" : "Network Value Shared!",
            message: `${amount} VGO distributed across connected nodes (${poolType}).`,
          });
        },
        // 1. Marketing actions
        smsCampaigns,
        smsBalance,
        metaAdSync,
        sendSMSCampaign: (c: Omit<SMSCampaign, "id" | "date" | "status">) => {
          const id = `SMS-${Math.floor(100 + Math.random() * 900)}`;
          const newCamp: SMSCampaign = {
            ...c,
            id,
            date: "Today, Just now",
            status: "sent",
          };
          setSmsCampaigns(prev => [newCamp, ...prev]);
          setSmsBalance(prev => Math.max(0, prev - c.recipientCount));
          toast({
            type: "success",
            title: lang === "bn" ? "এসএমএস ক্যাম্পেইন পাঠানো হয়েছে!" : "SMS Campaign Sent!",
            message: `Sent to ${c.recipientCount} customers.`,
          });
        },
        updateMetaSync: (sync: Partial<MetaAdSync>) => {
          setMetaAdSync(prev => ({ ...prev, ...sync }));
          toast({
            type: "success",
            title: lang === "bn" ? "মেটা/ফেসবুক সিঙ্ক আপডেট সম্পন্ন!" : "Meta / Facebook Sync Updated!",
            message: "Catalog & Pixel settings synchronized.",
          });
        },
        topupSMSBalance: (credits: number) => {
          setSmsBalance(prev => prev + credits);
          toast({
            type: "success",
            title: lang === "bn" ? "এসএমএস ব্যালেন্স রিচার্জ সফল!" : "SMS Balance Recharged!",
            message: `+${credits} SMS added to account.`,
          });
        },

        // 2. Delivery Aggregator actions
        courierParcels,
        bookCourierParcel: (parcel: Omit<CourierParcel, "id" | "trackingCode" | "date" | "status" | "codSettled">) => {
          const id = `PAR-${Math.floor(900 + Math.random() * 100)}`;
          const trackingCode = `${parcel.courier.toUpperCase().slice(0, 3)}-BD-${Math.floor(10000 + Math.random() * 90000)}`;
          const newParcel: CourierParcel = {
            ...parcel,
            id,
            trackingCode,
            date: "Today, Just now",
            status: "booked",
            codSettled: false,
          };
          setCourierParcels(prev => [newParcel, ...prev]);
          toast({
            type: "success",
            title: lang === "bn" ? "পার্সেল বুকিং সফল!" : "Courier Parcel Booked!",
            message: `Tracking: ${trackingCode} (${parcel.courier.toUpperCase()})`,
          });
        },
        updateParcelStatus: (id: string, status: CourierParcel["status"]) => {
          setCourierParcels(prev => prev.map(p => p.id === id ? {
            ...p,
            status,
            codSettled: status === "delivered" ? true : p.codSettled,
          } : p));
          toast({
            type: "success",
            title: lang === "bn" ? "পার্সেল স্ট্যাটাস আপডেট!" : "Parcel Status Updated!",
            message: `Status updated to ${status}.`,
          });
        },

        // 3. Fintech, Banking & Loans actions
        bankApplications,
        smeLoanOffers,
        digitalPayments,
        paymentLinks,
        applyBankKYC: (bankName: string, accountType: BankAccountApplication["accountType"], nid: string, tradeLicense: string) => {
          const id = `BNK-${Math.floor(10 + Math.random() * 90)}`;
          const newApp: BankAccountApplication = {
            id,
            bankName,
            bankLogo: "🏦",
            accountType,
            nidNumber: nid,
            tradeLicense,
            status: "approved",
            accountNumber: `209489${Math.floor(100000 + Math.random() * 900000)}`,
            kycProgress: 100,
          };
          setBankApplications(prev => [newApp, ...prev]);
          toast({
            type: "success",
            title: lang === "bn" ? "ব্যাংক অ্যাকাউন্ট অনুমোদিত ও চালু!" : "Digital Bank Account Activated!",
            message: `${bankName} A/C: ${newApp.accountNumber}`,
          });
        },
        applySMELoan: (offerId: string, amount: number) => {
          setSmeLoanOffers(prev => prev.map(off => off.id === offerId ? {
            ...off,
            status: "disbursed",
            activeLoanAmount: amount,
            paidInstallments: 0,
          } : off));
          toast({
            type: "success",
            title: lang === "bn" ? "ক্ষুদ্র ঋণ অনুমোদন ও বিতরণ সম্পন্ন!" : "SME Loan Disbursed!",
            message: `৳${amount.toLocaleString()} credited to your Business Bank Account.`,
          });
        },
        createPaymentLink: (customerName: string, amount: number, purpose: string) => {
          const id = `PLK-${Math.floor(8800 + Math.random() * 100)}`;
          const linkUrl = `https://pay.sayhpro.com/l/rahim-${id.toLowerCase()}`;
          const newLink: PaymentLinkItem = {
            id,
            customerName,
            amount,
            linkUrl,
            purpose,
            createdDate: "Today, Just now",
            status: "pending",
          };
          setPaymentLinks(prev => [newLink, ...prev]);
          toast({
            type: "success",
            title: lang === "bn" ? "পেমেন্ট লিঙ্ক তৈরি হয়েছে!" : "Payment Link Created!",
            message: `Link ready for ${customerName} (৳${amount.toLocaleString()}).`,
          });
        },
        updatePaymentConfig: (config: Partial<DigitalPaymentConfig>) => {
          setDigitalPayments(prev => ({ ...prev, ...config }));
          toast({
            type: "success",
            title: lang === "bn" ? "পেমেন্ট গেটওয়ে সেটিংস সংরক্ষিত!" : "Digital Payment Settings Saved!",
            message: "Bangla QR & merchant gateway updated.",
          });
        },

        // 4. Reselling actions
        resellProducts,
        toggleResellProduct: (id: string, mySellingPrice?: number) => {
          setResellProducts(prev => prev.map(p => {
            if (p.id === id) {
              const added = !p.isAddedToStore;
              const sellPrice = mySellingPrice || p.suggestedRetailPrice;
              const profit = sellPrice - p.wholesalePrice;
              return {
                ...p,
                isAddedToStore: added,
                mySellingPrice: added ? sellPrice : undefined,
                myProfit: added ? profit : undefined,
              };
            }
            return p;
          }));
          toast({
            type: "success",
            title: lang === "bn" ? "রিসেল প্রোডাক্ট আপডেট!" : "Resell Product Updated!",
            message: "Store catalog updated with wholesale margin.",
          });
        },

        // 5. Storefront actions
        storefront,
        updateStorefront: (s: Partial<StorefrontConfig>) => {
          setStorefront(prev => ({ ...prev, ...s }));
          toast({
            type: "success",
            title: lang === "bn" ? "অনলাইন স্টোর ওয়েবসাইট সংরক্ষিত!" : "Online Storefront Updated!",
            message: "Live website preview updated.",
          });
        },

        // 6. Monitoring & Alerts actions
        monitoringRules,
        businessAlerts,
        toggleMonitoringRule: (id: string) => {
          setMonitoringRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
          toast({
            type: "success",
            title: lang === "bn" ? "মনিটরিং রুল আপডেট!" : "Monitoring Rule Toggled!",
            message: "Alert trigger rule updated.",
          });
        },
        resolveBusinessAlert: (id: string) => {
          setBusinessAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
          toast({
            type: "success",
            title: lang === "bn" ? "অ্যালার্ট সমাধান করা হয়েছে!" : "Alert Resolved!",
            message: "Marked as resolved.",
          });
        },

        settings,
        updateSettings,
        isSearchOpen,
        setIsSearchOpen,
        quickModal,
        setQuickModal,
        tNum: (val: number | string | undefined | null) => formatNum(val, lang),
        formatTaka: (val: number | string | undefined | null) => formatTaka(val, lang),
        resetToDefaultData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
