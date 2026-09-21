import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "../components/Toast";

export const toBnDigits = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null) return "";
  return val.toString();
};

export const formatNum = (val: number | string | undefined | null, _lang?: string): string => {
  if (val === undefined || val === null) return "";
  const num = typeof val === "number" ? val : parseFloat(val.toString());
  return !isNaN(num) ? num.toLocaleString("en-US") : val.toString();
};

export const formatCedi = (val: number | string | undefined | null, _lang?: string): string => {
  if (val === undefined || val === null) return "";
  const num = typeof val === "number" ? val : parseFloat(val.toString()) || 0;
  const isNeg = num < 0;
  const absNum = Math.abs(num);
  const formattedStr = absNum.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(absNum) ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return isNeg ? `-GH₵${formattedStr}` : `GH₵${formattedStr}`;
};

export const formatTaka = formatCedi;

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
  photo?: string;
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

// Helpers to keep product names short, crisp and understandable for fast POS operations
export function cleanProductName(name: string): string {
  if (!name) return "";
  let s = name.trim();
  s = s.replace(/^Frytol Cooking Oil 5L$/i, "Frytol Cooking Oil 5L");
  s = s.replace(/^Indomie Instant Noodles Carton$/i, "Indomie Instant Noodles");
  s = s.replace(/^Ideal Evaporated Milk 160g$/i, "Ideal Milk 160g");
  s = s.replace(/^Soft Facial Tissue Box$/i, "Tissue Box");
  s = s.replace(/^Milo Malt Beverage 400g$/i, "Milo Drink 400g");
  s = s.replace(/^Key Soap Laundry Bar$/i, "Key Soap Bar");
  s = s.replace(/^Annapurna Iodized Salt 1kg$/i, "Annapurna Salt 1kg");
  s = s.replace(/^Gino Jasmine Rice 5kg$/i, "Gino Rice 5kg");
  s = s.replace(/^Shito Hot Pepper Sauce 350g$/i, "Shito Pepper Sauce 350g");
  s = s.replace(/^Golden Tree Kingsbite Chocolate$/i, "Kingsbite Chocolate");
  s = s.replace(/^Voltic Natural Mineral Water 1.5L$/i, "Voltic Water 1.5L");
  s = s.replace(/^Geisha Mackerel in Tomato Sauce$/i, "Geisha Mackerel");
  return s;
}

export function cleanProductNameBn(nameBn: string): string {
  if (!nameBn) return "";
  return nameBn.trim();
}

const initialProducts: Product[] = [
  { id: 13, name: "Potato Bulk Regular", nameBn: "Ntwea / Potato (1kg)", sku: "VEG-013", category: "Grocery", buyPrice: 15, sellPrice: 25, stock: 50, min: 10, unit: "1kg", status: "in-stock", brand: "Local Farm", image: "/products/potato.png", barcode: "89411000113" },
  { id: 1, name: "Frytol Cooking Oil 5L", nameBn: "Frytol Angwa 5L", sku: "OIL-001", category: "Grocery", buyPrice: 110, sellPrice: 135, stock: 24, min: 10, unit: "5L", status: "in-stock", brand: "Wilmar", image: "/products/sunflower-oil.jpg", barcode: "89411000101" },
  { id: 2, name: "Indomie Instant Noodles Carton", nameBn: "Indomie Carton (40pcs)", sku: "SNA-002", category: "Snacks", buyPrice: 70, sellPrice: 85, stock: 48, min: 20, unit: "Carton", status: "in-stock", brand: "Indomie Ghana", image: "/products/chanachur.jpg", barcode: "89411000102" },
  { id: 3, name: "Ideal Evaporated Milk 160g", nameBn: "Ideal Nufusuo 160g", sku: "DAI-003", category: "Dairy", buyPrice: 9.5, sellPrice: 12, stock: 8, min: 20, unit: "160g Tin", status: "low-stock", brand: "Nestlé Ghana", image: "/products/milk.jpg", barcode: "89411000103" },
  { id: 4, name: "Soft Facial Tissue Box", nameBn: "Tissue Box", sku: "HH-004", category: "Household", buyPrice: 15, sellPrice: 22, stock: 32, min: 10, unit: "Box", status: "in-stock", brand: "Flora Ghana", image: "/products/tissue-box.jpg", barcode: "89411000104" },
  { id: 5, name: "Milo Malt Beverage 400g", nameBn: "Milo Kookoo 400g", sku: "BEV-005", category: "Beverages", buyPrice: 32, sellPrice: 42, stock: 96, min: 30, unit: "400g Refill", status: "in-stock", brand: "Nestlé Ghana", image: "/products/frooto.jpg", barcode: "89411000105" },
  { id: 6, name: "Key Soap Laundry Bar", nameBn: "Key Soap Kɛseɛ", sku: "PC-006", category: "Personal Care", buyPrice: 11, sellPrice: 14, stock: 0, min: 10, unit: "Bar", status: "out-of-stock", brand: "Unilever Ghana", image: "/products/soap.jpg", barcode: "89411000106" },
  { id: 7, name: "Annapurna Iodized Salt 1kg", nameBn: "Nkyene 1kg", sku: "GRO-007", category: "Grocery", buyPrice: 6, sellPrice: 9, stock: 3, min: 15, unit: "1kg", status: "low-stock", brand: "Unilever Ghana", image: "/products/salt.jpg", barcode: "89411000107" },
  { id: 8, name: "Gino Jasmine Rice 5kg", nameBn: "Gino Ɛmo 5kg", sku: "GRO-008", category: "Grocery", buyPrice: 85, sellPrice: 105, stock: 22, min: 8, unit: "5kg Bag", status: "in-stock", brand: "Gino Ghana", image: "/products/chilli-powder.jpg", barcode: "89411000108" },
  { id: 9, name: "Shito Hot Pepper Sauce 350g", nameBn: "Shito Mako 350g", sku: "GRO-009", category: "Grocery", buyPrice: 20, sellPrice: 28, stock: 40, min: 10, unit: "350g Jar", status: "in-stock", brand: "Homowo", image: "/products/chilli-powder.jpg", barcode: "89411000109" },
  { id: 10, name: "Golden Tree Kingsbite Chocolate", nameBn: "Kingsbite Choclete", sku: "SNA-010", category: "Snacks", buyPrice: 14, sellPrice: 20, stock: 72, min: 20, unit: "100g Bar", status: "in-stock", brand: "CPC Ghana", image: "/products/biscuit.jpg", barcode: "89411000110" },
  { id: 11, name: "Voltic Natural Mineral Water 1.5L", nameBn: "Voltic Nsuo 1.5L", sku: "BEV-011", category: "Beverages", buyPrice: 5, sellPrice: 8, stock: 30, min: 10, unit: "1.5L Bottle", status: "in-stock", brand: "Voltic Ghana", image: "/products/juice.jpg", barcode: "89411000111" },
  { id: 12, name: "Geisha Mackerel in Tomato Sauce", nameBn: "Geisha Nam 425g", sku: "GRO-012", category: "Grocery", buyPrice: 18, sellPrice: 24, stock: 44, min: 12, unit: "425g Tin", status: "in-stock", brand: "Geisha", image: "/products/dove-soap.jpg", barcode: "89411000112" },
];

const initialCustomers: Customer[] = [
  { id: 1, name: "Kwame Mensah", nameBn: "Kwame Mensah", phone: "024 412 3456", address: "Plot 12, East Legon, Accra", totalPurchases: 4520, due: 850, visits: 28, lastVisit: "Today", lastPayment: "3 days ago", dueSince: "Dec 10", status: "regular", rating: 5, avatar: "KM" },
  { id: 2, name: "Abena Osei", nameBn: "Abena Osei", phone: "055 892 1234", address: "Adum Central, Kumasi", totalPurchases: 3210, due: 1200, visits: 19, lastVisit: "Yesterday", lastPayment: "7 days ago", dueSince: "Nov 28", status: "due", rating: 4, avatar: "AO" },
  { id: 3, name: "Kofi Boateng", nameBn: "Kofi Boateng", phone: "020 781 4567", address: "Oxford Street, Osu, Accra", totalPurchases: 1850, due: 320, visits: 12, lastVisit: "2 days ago", lastPayment: "Today", dueSince: "Dec 12", status: "regular", rating: 4, avatar: "KB" },
  { id: 4, name: "Ama Serwaa", nameBn: "Ama Serwaa", phone: "024 331 9988", address: "Community 1, Tema", totalPurchases: 2800, due: 580, visits: 22, lastVisit: "3 days ago", lastPayment: "5 days ago", dueSince: "Dec 5", status: "due", rating: 5, avatar: "AS" },
  { id: 5, name: "Yaw Addo", nameBn: "Yaw Addo", phone: "054 662 3120", address: "Spintex Road, Accra", totalPurchases: 980, due: 150, visits: 7, lastVisit: "Today", lastPayment: "2 days ago", dueSince: "Dec 13", status: "new", rating: 3, avatar: "YA" },
  { id: 6, name: "Akosua Frimpong", nameBn: "Akosua Frimpong", phone: "027 554 8899", address: "Airport Residential Area, Accra", totalPurchases: 5240, due: 480, visits: 35, lastVisit: "1 week ago", lastPayment: "2 weeks ago", dueSince: "Nov 15", status: "vip", rating: 5, avatar: "AF" },
  { id: 7, name: "Kwabena Asante", nameBn: "Kwabena Asante", phone: "024 991 7733", address: "Bantama High Street, Kumasi", totalPurchases: 1520, due: 0, visits: 11, lastVisit: "4 days ago", status: "regular", rating: 4, avatar: "KA" },
  { id: 8, name: "Efua Nyarko", nameBn: "Efua Nyarko", phone: "020 334 5511", address: "Market Circle, Takoradi", totalPurchases: 6200, due: 0, visits: 41, lastVisit: "Today", status: "vip", rating: 5, avatar: "EN" },
];

const initialSuppliers: Supplier[] = [
  { id: 1, name: "Wilmar Africa Ltd (Frytol)", nameBn: "Wilmar Africa Ltd", contact: "030 330 4560", totalPurchases: 18500, paid: 16360, due: 2140, nextPayment: "Dec 20", avatar: "W", category: "Edible Oils & Rice" },
  { id: 2, name: "Nestlé Ghana Ltd", nameBn: "Nestlé Ghana Ltd", contact: "030 250 0700", totalPurchases: 9200, paid: 9200, due: 0, nextPayment: "—", avatar: "N", category: "Dairy & Beverage" },
  { id: 3, name: "Unilever Ghana PLC", nameBn: "Unilever Ghana PLC", contact: "030 222 1100", totalPurchases: 5800, paid: 4500, due: 1300, nextPayment: "Dec 22", avatar: "U", category: "Personal Care & Household" },
  { id: 4, name: "De-United Foods (Indomie)", nameBn: "Indomie Ghana Ltd", contact: "030 281 2940", totalPurchases: 3400, paid: 3400, due: 0, nextPayment: "—", avatar: "I", category: "Noodles & FMCG" },
  { id: 5, name: "Cocoa Processing Co. (CPC)", nameBn: "CPC Golden Tree", contact: "030 320 2911", totalPurchases: 4200, paid: 3000, due: 1200, nextPayment: "Dec 18", avatar: "C", category: "Confectionery & Cocoa" },
];

const initialPurchases: Purchase[] = [
  { id: "PUR-0042", supplier: "Wilmar Africa Ltd (Frytol)", date: "Dec 13, 2024", items: [{ product: "Frytol Cooking Oil 5L", qty: 40, cost: 110 }, { product: "Gino Jasmine Rice 5kg", qty: 30, cost: 85 }], itemCount: 8, total: 6950, paid: 6950, due: 0, status: "paid", invoiceNo: "WIL-9921" },
  { id: "PUR-0041", supplier: "Nestlé Ghana Ltd", date: "Dec 12, 2024", items: [{ product: "Milo Malt 400g", qty: 50, cost: 32 }, { product: "Ideal Milk 160g", qty: 100, cost: 9.5 }], itemCount: 4, total: 2550, paid: 1800, due: 750, status: "partial", invoiceNo: "NES-412" },
  { id: "PUR-0040", supplier: "Unilever Ghana PLC", date: "Dec 11, 2024", items: [{ product: "Key Soap Laundry Bar", qty: 80, cost: 11 }], itemCount: 6, total: 880, paid: 0, due: 880, status: "credit", invoiceNo: "UNI-108" },
  { id: "PUR-0039", supplier: "De-United Foods (Indomie)", date: "Dec 10, 2024", items: [{ product: "Indomie Carton 40pcs", qty: 30, cost: 70 }], itemCount: 12, total: 2100, paid: 2100, due: 0, status: "paid", invoiceNo: "IND-551" },
  { id: "PUR-0038", supplier: "Cocoa Processing Co. (CPC)", date: "Dec 9, 2024", items: [{ product: "Kingsbite Chocolate", qty: 60, cost: 14 }], itemCount: 3, total: 840, paid: 400, due: 440, status: "partial", invoiceNo: "CPC-882" },
];

const initialExpenses: Expense[] = [
  { id: "EXP-1", category: "Salary", categoryBn: "Akatua / Salary", amount: 4800, date: "Dec 1, 2024", paidFrom: "Cash", note: "December staff salary" },
  { id: "EXP-2", category: "Shop Rent", categoryBn: "Ofie Ka / Rent", amount: 2500, date: "Dec 1, 2024", paidFrom: "MTN MoMo", note: "Monthly shop rent - Osu Oxford St" },
  { id: "EXP-3", category: "Electricity", categoryBn: "Anyinam Ahooden / ECG", amount: 550, date: "Dec 5, 2024", paidFrom: "MTN MoMo", note: "ECG prepaid meter recharge" },
  { id: "EXP-4", category: "Transport", categoryBn: "Akwantuo / Transport", amount: 220, date: "Dec 8, 2024", paidFrom: "Cash", note: "Dispatch rider fuel & logistics" },
  { id: "EXP-5", category: "Food", categoryBn: "Aduane / Staff Lunch", amount: 160, date: "Dec 10, 2024", paidFrom: "Cash", note: "Staff lunch & refreshments" },
  { id: "EXP-6", category: "Marketing", categoryBn: "Dawubɔ / Marketing", amount: 350, date: "Dec 11, 2024", paidFrom: "MTN MoMo", note: "Instagram & WhatsApp local promo" },
  { id: "EXP-7", category: "Maintenance", categoryBn: "Nsiesie / Maintenance", amount: 120, date: "Dec 12, 2024", paidFrom: "Cash", note: "Store lighting & shelf fixing" },
];

const initialAccounts: CashAccount[] = [
  { id: "cash", name: "Cash Drawer", nameBn: "Sika Pɔtee (Cash)", balance: 4850, color: "#16A34A", bg: "#F0FDF4", in: 3420, out: 1100 },
  { id: "bkash", name: "MTN MoMo", nameBn: "MTN MoMo", balance: 8420, color: "#EAB308", bg: "#FEFCE8", in: 6100, out: 1800 },
  { id: "nagad", name: "Telecel Cash", nameBn: "Telecel Cash", balance: 3150, color: "#E11D48", bg: "#FFF1F2", in: 2200, out: 650 },
  { id: "rocket", name: "AT Money", nameBn: "AT Money", balance: 1200, color: "#0284C7", bg: "#F0F9FF", in: 950, out: 200 },
  { id: "bank", name: "Ecobank Ghana", nameBn: "Ecobank Ghana", balance: 24500, color: "#1E3A8A", bg: "#EFF6FF", in: 12000, out: 4500 },
];

const initialTransactions: CashTransaction[] = [
  { id: "TX-1", type: "in", desc: "Sale Collection — Kwame Mensah", descBn: "Tɔn Nnoɔma — Kwame Mensah", account: "Cash", amount: 285, time: "Today 6:32 PM" },
  { id: "TX-2", type: "in", desc: "MoMo Sale Collection — Abena Osei", descBn: "MTN MoMo Akatua", account: "MTN MoMo", amount: 185, time: "Today 5:48 PM" },
  { id: "TX-3", type: "out", desc: "Stock Purchase — Wilmar Africa", descBn: "Tɔ Nnoɔma — Wilmar", account: "Cash", amount: 1200, time: "Today 2:15 PM" },
  { id: "TX-4", type: "transfer", desc: "Cash Drawer to MTN MoMo Deposit", descBn: "Sika Firi Drawer Kɔ MoMo", account: "Cash → MTN MoMo", amount: 800, time: "Today 11:00 AM" },
  { id: "TX-5", type: "in", desc: "Customer Credit Settled — Ama Serwaa", descBn: "Aka Tua — Ama Serwaa", account: "MTN MoMo", amount: 350, time: "Yesterday" },
  { id: "TX-6", type: "out", desc: "Store ECG Electricity Recharge", descBn: "ECG Anyinam Ahooden", account: "MTN MoMo", amount: 250, time: "Dec 5" },
];

const initialEmployees: Employee[] = [
  { id: 1, name: "Kwesi Appiah", nameBn: "Kwesi Appiah", role: "Store Manager", roleBn: "Panyin / Manager", phone: "024 400 1122", salary: 2200, salesThisMonth: 18500, joined: "Jan 2023", avatar: "KA", status: "active", lastPaid: "Dec 1, 2024" },
  { id: 2, name: "Abena Darko", nameBn: "Abena Darko", role: "Chief Cashier", roleBn: "Sika Sohwɛfoɔ", phone: "055 330 2211", salary: 1400, salesThisMonth: 14200, joined: "Mar 2023", avatar: "AD", status: "active", lastPaid: "Dec 1, 2024" },
  { id: 3, name: "Kojo Antwi", nameBn: "Kojo Antwi", role: "Sales Associate", roleBn: "Tɔnfoɔ / Sales", phone: "020 889 3344", salary: 1200, salesThisMonth: 9800, joined: "Aug 2023", avatar: "KA", status: "active", lastPaid: "Dec 1, 2024" },
  { id: 4, name: "Akwasi Mensah", nameBn: "Akwasi Mensah", role: "Inventory & Dispatch", roleBn: "Akorae Sohwɛfoɔ", phone: "024 771 9900", salary: 1100, salesThisMonth: 0, joined: "Nov 2023", avatar: "AM", status: "active", lastPaid: "Dec 1, 2024" },
];

const initialNotifications: NotificationItem[] = [
  { id: 1, type: "alert", title: "Low Stock Alert", titleBn: "Nneɛma a Aka Wɔ Fom", body: "Annapurna Salt 1kg has only 3 units left. Restock now.", bodyBn: "Annapurna Nkyene 1kg aka 3 pɛ. Tɔ bi bio.", time: "2 min ago", read: false, color: "bg-ac-50 text-ink", badge: "bg-ac-100 text-ink" },
  { id: 2, type: "sale", title: "Sale Completed", titleBn: "Wɔatɔ Nnoɔma Awie", body: "INV-1043 completed for Kwame Mensah — GH₵ 285.00", bodyBn: "INV-1043 awie ma Kwame Mensah — GH₵ 285.00", time: "15 min ago", read: false, color: "bg-em-50 text-ink", badge: "bg-em-100 text-ink" },
  { id: 3, type: "due", title: "Credit Overdue Reminder", titleBn: "Aka / Bosea Kɔkɔbɔ", body: "Abena Osei has GH₵ 1,200.00 overdue since Nov 28.", bodyBn: "Abena Osei de GH₵ 1,200.00 firi Nov 28.", time: "1 hour ago", read: false, color: "bg-red-50 text-ink", badge: "bg-red-100 text-ink" },
  { id: 4, type: "stock", title: "Low Stock Warning", titleBn: "Akorae Kɔkɔbɔ", body: "Ideal Milk 160g — 8 tins left (min: 20)", bodyBn: "Ideal Nufusuo — aka 8 (min: 20)", time: "2 hours ago", read: true, color: "bg-ac-50 text-ink", badge: "bg-ac-100 text-ink" },
  { id: 5, type: "supplier", title: "Supplier Payment Due", titleBn: "Agorɔfoɔ Akatua", body: "Wilmar Africa payment of GH₵ 2,140.00 is due on Dec 20.", bodyBn: "Wilmar Africa akatua GH₵ 2,140.00 bɛba Dec 20.", time: "3 hours ago", read: true, color: "bg-nv-50 text-ink", badge: "bg-nv-100 text-ink" },
];

const initialSales: Sale[] = [
  {
    id: "sale-1042",
    invoiceNo: "INV-1042",
    customer: "Kwame Mensah",
    customerPhone: "024 412 3456",
    items: [
      { name: "Frytol Cooking Oil 5L", nameBn: "Frytol Angwa 5L", qty: 2, price: 135, discount: 0 },
      { name: "Gino Jasmine Rice 5kg", nameBn: "Gino Ɛmo 5kg", qty: 1, price: 105, discount: 0 },
      { name: "Milo Malt Beverage 400g", nameBn: "Milo Kookoo 400g", qty: 2, price: 42, discount: 4 },
      { name: "Ideal Evaporated Milk", nameBn: "Ideal Nufusuo", qty: 4, price: 12, discount: 0 },
      { name: "Voltic Water 1.5L", nameBn: "Voltic Nsuo 1.5L", qty: 3, price: 8, discount: 0 },
    ],
    subtotal: 531,
    discount: 4,
    vat: 0,
    grandTotal: 527,
    paid: 527,
    due: 0,
    paymentMethod: "cash",
    cashGiven: 550,
    change: 23,
    date: "December 13, 2024",
    time: "6:32 PM",
    status: "completed",
  },
  {
    id: "sale-1041",
    invoiceNo: "INV-1041",
    customer: "Abena Osei",
    customerPhone: "055 892 1234",
    items: [
      { name: "Frytol Cooking Oil 5L", nameBn: "Frytol Angwa 5L", qty: 1, price: 135, discount: 0 },
      { name: "Indomie Carton (40pcs)", nameBn: "Indomie Carton", qty: 1, price: 85, discount: 0 },
    ],
    subtotal: 220,
    discount: 0,
    vat: 0,
    grandTotal: 220,
    paid: 220,
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
      { name: "Geisha Mackerel 425g", nameBn: "Geisha Nam", qty: 3, price: 24, discount: 0 },
      { name: "Kingsbite Chocolate", nameBn: "Kingsbite Choclete", qty: 2, price: 20, discount: 0 },
    ],
    subtotal: 112,
    discount: 0,
    vat: 0,
    grandTotal: 112,
    paid: 112,
    due: 0,
    paymentMethod: "cash",
    date: "December 13, 2024",
    time: "5:12 PM",
    status: "completed",
  },
];

const initialSettings: ShopSettings = {
  shopName: "Kofi Provisions & Retail Mart",
  shopNameBn: "Kofi Nsɛm Supermarket",
  ownerName: "Kofi Boateng",
  businessType: "Supermarket & Provisions / Nnoɔma Fie",
  phone: "+233 24 412 3456",
  address: "Plot 14, Oxford Street, Osu, Accra, Ghana",
  currency: "GHS (GH₵)",
  taxRate: 0,
  autoPrint: true,
  soundEnabled: true,
  smsReminderTemplate: "Dear [Name], friendly reminder that your outstanding balance at Kofi Provisions is GH₵[Amount]. Kindly settle via MTN MoMo to 0244123456. Medaase (Thank you)!",
  branch: "Accra Central (Osu)",
};

const initialVgoContributions: VGOContribution[] = [
  { id: "VGO-1092", contributor: "Kwame Mensah", contributorType: "customer", action: "Purchased weekly grocery bundle", actionBn: "Wɔatɔ dapɛn nnoɔma nkyɛmu", category: "transaction", impactUnits: 120, vgoRewarded: 24, proofHash: "0x8f4c...91b2", timestamp: "10 mins ago", status: "verified" },
  { id: "VGO-1091", contributor: "Wilmar Africa Ltd", contributorType: "supplier", action: "100% On-Time Supply Delivery", actionBn: "Wɔde nnoɔma bae pɛpɛɛpɛ wɔ berɛ mu", category: "logistics", impactUnits: 350, vgoRewarded: 70, proofHash: "0x3e1a...44f0", timestamp: "45 mins ago", status: "minted" },
  { id: "VGO-1090", contributor: "Abena Darko", contributorType: "employee", action: "Fast Checkout & Customer Delight", actionBn: "Ntɛmntɛm dwumadie & anigyeɛ", category: "loyalty", impactUnits: 95, vgoRewarded: 19, proofHash: "0x11bb...cc29", timestamp: "2 hours ago", status: "verified" },
  { id: "VGO-1089", contributor: "Kofi Boateng", contributorType: "customer", action: "Store Referral (Referred 2 Neighbors)", actionBn: "Ɔfrɛɛ afipamfoɔ 2 baa dukan mu", category: "collaboration", impactUnits: 250, vgoRewarded: 50, proofHash: "0x4a99...fe12", timestamp: "Yesterday", status: "shared" },
  { id: "VGO-1088", contributor: "Unilever Ghana PLC", contributorType: "supplier", action: "Direct Manufacturer Eco-Packaging", actionBn: "Mfididwuma kwan so nnoɔma ahyɛase", category: "governance", impactUnits: 180, vgoRewarded: 36, proofHash: "0x98dd...71ca", timestamp: "2 days ago", status: "minted" },
];

const initialVgoWallets: VGOWallet[] = [
  { id: "W-STORE", ownerName: "Kofi Provisions Treasury", ownerType: "store_treasury", balanceVGO: 48500, stakedVGO: 25000, totalEarned: 95000, reputationScore: 980, impactBadge: "Master Node" },
  { id: "W-01", ownerName: "Kwame Mensah", ownerType: "customer", balanceVGO: 1420, stakedVGO: 500, totalEarned: 3200, reputationScore: 890, impactBadge: "Diamond Patron" },
  { id: "W-02", ownerName: "Abena Osei", ownerType: "customer", balanceVGO: 860, stakedVGO: 200, totalEarned: 1900, reputationScore: 820, impactBadge: "Pioneer" },
  { id: "W-03", ownerName: "Wilmar Africa Ltd", ownerType: "supplier", balanceVGO: 12400, stakedVGO: 8000, totalEarned: 28000, reputationScore: 950, impactBadge: "Verified Partner" },
  { id: "W-04", ownerName: "Kwesi Appiah", ownerType: "employee", balanceVGO: 640, stakedVGO: 150, totalEarned: 1400, reputationScore: 860, impactBadge: "Star Contributor" },
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
  { id: "SMS-101", title: "Weekend Market Discount", titleBn: "Weekend Special Nkabuom", type: "promotional", recipientCount: 350, message: "Dear Customer, Enjoy 10% off all groceries this Saturday at Kofi Provisions, Osu! Free delivery on MoMo orders.", messageBn: "Mema wo akwaaba! Tɔ nnoɔma wɔ Kofi Provisions na nya 10% discount nnɛ Memeneda yi.", date: "Aug 22, 2026", status: "sent", cost: 35 },
  { id: "SMS-102", title: "Customer Credit Friendly Reminder", titleBn: "Aka / Bosea Nkaebɔ SMS", type: "due_reminder", recipientCount: 7, message: "Dear Customer, Friendly reminder of your pending balance at Kofi Provisions. Kindly settle via MTN MoMo to 0244123456. Medaase!", messageBn: "Yɛsrɛ wo, kae wo bosea a ɛda hɔ wɔ Kofi Provisions. Wubetumi atua wɔ MTN MoMo so. Medaase!", date: "Aug 24, 2026", status: "sent", cost: 1.5 },
  { id: "SMS-103", title: "Akwasidae Festive Promo", titleBn: "Akwasidae Afahyɛ Promo", type: "festival", recipientCount: 500, message: "Happy Celebrations from Kofi Provisions! Free delivery across Accra on all orders above GH₵ 150.", messageBn: "Afahyɛ pa firi Kofi Provisions! Yɛde nnoɔma bɛbrɛ wo kwa sɛ wotɔ boro GH₵ 150 a.", date: "Scheduled for next week", status: "scheduled", cost: 50 },
];

const initialMetaAdSync: MetaAdSync = {
  catalogSynced: true,
  syncedProductsCount: 12,
  pixelId: "META-PIXEL-GH-89410",
  pixelActive: true,
  adSpend: 340,
  conversions: 48,
};

// Initial Data: 2. Delivery Aggregator (Ghana Couriers)
const initialCourierParcels: CourierParcel[] = [
  { id: "PAR-901", trackingCode: "YNG-ACC-89211", courier: "steadfast", customerName: "Kwame Mensah", customerPhone: "024 412 3456", destination: "East Legon, Accra", invoiceNo: "INV-2026-001", codAmount: 285, deliveryFee: 20, status: "delivered", date: "Aug 24, 2026", codSettled: true },
  { id: "PAR-902", trackingCode: "BLT-EXP-44019", courier: "pathao", customerName: "Abena Osei", customerPhone: "055 892 1234", destination: "Adum, Kumasi", invoiceNo: "INV-2026-002", codAmount: 420, deliveryFee: 35, status: "in_transit", date: "Today, 11:30 AM", codSettled: false },
  { id: "PAR-903", trackingCode: "GLV-TEM-10928", courier: "redx", customerName: "Ama Serwaa", customerPhone: "024 331 9988", destination: "Community 1, Tema", invoiceNo: "INV-2026-003", codAmount: 195, deliveryFee: 25, status: "picked_up", date: "Today, 02:15 PM", codSettled: false },
  { id: "PAR-904", trackingCode: "SWF-TAK-55102", courier: "ecourier", customerName: "Efua Nyarko", customerPhone: "020 334 5511", destination: "Market Circle, Takoradi", invoiceNo: "INV-2026-004", codAmount: 560, deliveryFee: 45, status: "booked", date: "Today, 04:00 PM", codSettled: false },
];

// Initial Data: 3. Fintech, Banking & Loans (Ghanaian Financial Institutions)
const initialBankApplications: BankAccountApplication[] = [
  { id: "BNK-01", bankName: "Ecobank Ghana Merchant Account", bankLogo: "🏦", accountType: "current", accountNumber: "1441002948201", status: "active", nidNumber: "GHA-718294019-2", tradeLicense: "CS192842024/GRA-TIN", kycProgress: 100 },
  { id: "BNK-02", bankName: "MTN MoMo Enterprise Merchant", bankLogo: "📱", accountType: "merchant_wallet", accountNumber: "024 412 3456", status: "active", nidNumber: "GHA-718294019-2", tradeLicense: "CS192842024/GRA-TIN", kycProgress: 100 },
  { id: "BNK-03", bankName: "GCB Bank SME Commercial", bankLogo: "🏛️", accountType: "islamic_business", accountNumber: "20184910294", status: "approved", nidNumber: "GHA-718294019-2", tradeLicense: "CS192842024/GRA-TIN", kycProgress: 100 },
];

const initialLoanOffers: SMELoanOffer[] = [
  { id: "LOAN-ECO-01", bankPartner: "Ecobank SME Express Credit", eligibleAmount: 15000, interestRate: 18.0, tenureMonths: 12, monthlyEMI: 1475, status: "pre_approved", activeLoanAmount: 0, paidInstallments: 0, totalInstallments: 12 },
  { id: "LOAN-MOMO-02", bankPartner: "MTN MoMo Business Qwikee Loan", eligibleAmount: 7500, interestRate: 12.5, tenureMonths: 6, monthlyEMI: 1350, status: "pre_approved", activeLoanAmount: 0, paidInstallments: 0, totalInstallments: 6 },
  { id: "LOAN-GCB-03", bankPartner: "GCB Kudi Nkosuo Micro Loan", eligibleAmount: 25000, interestRate: 16.5, tenureMonths: 18, monthlyEMI: 1680, status: "pre_approved", activeLoanAmount: 0, paidInstallments: 0, totalInstallments: 18 },
];

const initialDigitalPayments: DigitalPaymentConfig = {
  banglaQRActive: true,
  merchantQrString: "00020101021226500010gh.gov.ghqr010102441234565204599953039365802GH5911Kofi Store6005Accra",
  bkashMerchantNumber: "024 412 3456",
  nagadMerchantNumber: "020 781 4567",
  paymentGatewayActive: true,
};

const initialPaymentLinks: PaymentLinkItem[] = [
  { id: "PLK-8801", customerName: "Kwame Mensah", amount: 285, linkUrl: "https://pay.sayhpro.com/l/kofi-8801", purpose: "Grocery Home Delivery", createdDate: "Aug 24, 2026", status: "paid" },
  { id: "PLK-8802", customerName: "Abena Osei", amount: 420, linkUrl: "https://pay.sayhpro.com/l/kofi-8802", purpose: "Monthly Provisions Order", createdDate: "Today, 10:15 AM", status: "pending" },
  { id: "PLK-8803", customerName: "Ama Serwaa", amount: 195, linkUrl: "https://pay.sayhpro.com/l/kofi-8803", purpose: "Credit Settlement via MoMo", createdDate: "Today, 01:40 PM", status: "pending" },
];

// Initial Data: 4. Reselling Products
const initialResellProducts: ResellProduct[] = [
  { id: "RSL-01", name: "T500 Ultra Smartwatch Series 8", nameBn: "T500 Ultra Dɔnhwere", category: "Electronics", wholesalePrice: 95, suggestedRetailPrice: 150, stock: 120, image: "⌚", supplier: "Global Tech Imports", rating: 4.8, isAddedToStore: true, mySellingPrice: 140, myProfit: 45 },
  { id: "RSL-02", name: "Kemei KM-6330 3-in-1 Grooming Trimmer", nameBn: "Kemei 3-in-1 Yi Ti Trimmer", category: "Electronics", wholesalePrice: 85, suggestedRetailPrice: 140, stock: 85, image: "🪒", supplier: "Apex Electronics Ghana", rating: 4.7, isAddedToStore: true, mySellingPrice: 130, myProfit: 45 },
  { id: "RSL-03", name: "Pure Unrefined Organic Shea Butter 1kg", nameBn: "Nkuto Pa Kɛseɛ 1kg", category: "Personal Care", wholesalePrice: 40, suggestedRetailPrice: 65, stock: 60, image: "🫙", supplier: "Northern Ghana Shea Hub", rating: 4.9, isAddedToStore: true, mySellingPrice: 60, myProfit: 20 },
  { id: "RSL-04", name: "Royal Aroma Fragrant Jasmine Rice 5kg", nameBn: "Royal Aroma Ɛmo 5kg", category: "Grocery", wholesalePrice: 85, suggestedRetailPrice: 110, stock: 45, image: "🌾", supplier: "Tema Grains & Commodities", rating: 4.8, isAddedToStore: false },
  { id: "RSL-05", name: "Pro Wireless Noise Cancelling Earbuds", nameBn: "Wireless Bluetooth Earbuds", category: "Electronics", wholesalePrice: 65, suggestedRetailPrice: 115, stock: 140, image: "🎧", supplier: "SoundMax Ghana", rating: 4.6, isAddedToStore: false },
  { id: "RSL-06", name: "Authentic Kente Print Smock / Fabric", nameBn: "Kente Ntoma Fɛfɛɛfɛ", category: "Fashion", wholesalePrice: 180, suggestedRetailPrice: 280, stock: 90, image: "👘", supplier: "Bonwire Kente Weavers", rating: 4.9, isAddedToStore: false },
];

// Initial Data: 5. No-Code Website Storefront
const initialStorefrontConfig: StorefrontConfig = {
  subdomain: "kofiprovisions",
  customDomain: "kofimart.com.gh",
  heroHeadline: "Kofi Provisions — Accra's Trusted Daily Groceries & Essentials",
  heroHeadlineBn: "Kofi Provisions — Wo Fi Ne Wo Nnoɔma Fie Pa",
  heroSubheadline: "Fast delivery across Accra, Tema & Kumasi. Best quality and fresh staples guaranteed.",
  heroSubheadlineBn: "Ntɛmntɛm kɔmafoɔ wɔ Accra, Tema ne Kumasi. Nnoɔma papa pa ara.",
  themeColor: "#16A34A",
  bannerImage: "🛒",
  logo: "KP",
  announcementText: "⚡ Free Express Delivery on all orders above GH₵ 150! Pay via MTN MoMo or Cash on Delivery.",
  announcementTextBn: "⚡ Nnoɔma a wotɔ boro GH₵ 150 no, yɛde brɛ wo kwa! Tua wɔ MTN MoMo anaa Cash so.",
  showWhatsAppButton: true,
  whatsAppNumber: "+233 24 412 3456",
  allowCOD: true,
  showReviews: true,
  featuredProductIds: [1, 2, 3, 4],
  published: true,
};

// Initial Data: 6. Monitoring & Alerts
const initialMonitoringRules: MonitoringRule[] = [
  { id: "RULE-01", name: "Low Stock Emergency Alert", nameBn: "Nneɛma a Aka Wɔ Fom Kɔkɔbɔ", type: "low_stock", enabled: true, thresholdValue: 5, channel: "sms", lastTriggered: "Today, 09:15 AM" },
  { id: "RULE-02", name: "Customer Credit Aging (> 30 Days)", nameBn: "Aka a Akyɛ (> 30 Days)", type: "high_due", enabled: true, thresholdValue: 500, channel: "push", lastTriggered: "Yesterday" },
  { id: "RULE-03", name: "Cash Drawer Discrepancy Alert", nameBn: "Sika Fom Kɔkɔbɔ", type: "cash_discrepancy", enabled: true, thresholdValue: 50, channel: "whatsapp", lastTriggered: "3 days ago" },
  { id: "RULE-04", name: "Daily Automatic Closing Report", nameBn: "Da Koro Biara Amanneɛbɔ", type: "daily_profit_sms", enabled: true, thresholdValue: 0, channel: "sms", lastTriggered: "Yesterday, 10:00 PM" },
];

const initialBusinessAlerts: BusinessAlert[] = [
  { id: "ALT-01", ruleType: "low_stock", title: "Low Stock Alert: Ideal Milk 160g", titleBn: "Akorae Fom: Ideal Nufusuo", message: "Only 8 tins remaining in inventory. Please restock immediately.", messageBn: "Ideal Nufusuo aka 8 pɛ wɔ akorae. Tɔ bi bio ntɛm.", severity: "warning", time: "2 hours ago", resolved: false },
  { id: "ALT-02", ruleType: "high_due", title: "High Due Warning: Abena Osei (GH₵ 1,200)", titleBn: "Aka Kɛseɛ: Abena Osei (GH₵ 1,200)", message: "Credit overdue for more than 35 days. Send automated MoMo reminder.", messageBn: "Bosea a akyɛ boro nna 35. Mane MoMo nkaebɔ.", severity: "critical", time: "5 hours ago", resolved: false },
  { id: "ALT-03", ruleType: "daily_profit_sms", title: "Daily Sales Summary Dispatched", titleBn: "Da Biara Tɔn Nnoɔma Amanneɛbɔ", message: "Today's Net Profit summary SMS successfully delivered to Owner phone.", messageBn: "Ɛnnɛ mfasoɔ ho amanneɛbɔ akɔ wura no fon so.", severity: "info", time: "Yesterday", resolved: true },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<"en" | "bn">("en");

  // Migration for Ghana localization
  if (typeof window !== "undefined") {
    try {
      const LOC_VERSION = "ghana_v2";
      if (localStorage.getItem("dukan_loc_version") !== LOC_VERSION) {
        localStorage.setItem("dukan_loc_version", LOC_VERSION);
        localStorage.removeItem("dukan_products");
        localStorage.removeItem("dukan_sales");
        localStorage.removeItem("dukan_customers");
        localStorage.removeItem("dukan_suppliers");
        localStorage.removeItem("dukan_purchases");
        localStorage.removeItem("dukan_expenses");
        localStorage.removeItem("dukan_accounts");
        localStorage.removeItem("dukan_transactions");
        localStorage.removeItem("dukan_employees");
        localStorage.removeItem("dukan_notifications");
        localStorage.removeItem("dukan_settings");
        localStorage.removeItem("dukan_courier_parcels");
        localStorage.removeItem("dukan_bank_apps");
        localStorage.removeItem("dukan_loan_offers");
        localStorage.removeItem("dukan_digital_payments");
        localStorage.removeItem("dukan_payment_links");
        localStorage.removeItem("dukan_storefront");
        localStorage.removeItem("dukan_resell_products");
        localStorage.removeItem("dukan_monitoring_rules");
        localStorage.removeItem("dukan_business_alerts");
      }
    } catch {}
  }

  // Load from localStorage or defaults with auto-cleaning for short, understandable names
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem("dukan_products");
      if (saved) {
        let parsed: Product[] = JSON.parse(saved);
        parsed = parsed.map(p => ({
          ...p,
          name: cleanProductName(p.name),
          nameBn: cleanProductNameBn(p.nameBn),
        }));
        if (!parsed.some(p => p.sku === "VEG-013" || p.name.toLowerCase().includes("potato"))) {
          parsed.unshift(initialProducts[0]);
        }
        try {
          localStorage.setItem("dukan_products", JSON.stringify(parsed));
        } catch {}
        return parsed;
      }
      return initialProducts;
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
      titleBn: "Wɔatɔ Nnoɔma Awie",
      body: `${invoiceNumber} for ${saleData.customer} — GH₵${saleData.grandTotal.toLocaleString()}`,
      bodyBn: `${saleData.customer} — ${invoiceNumber} awie — GH₵${saleData.grandTotal.toLocaleString()}`,
      color: "bg-em-50 text-ink",
      badge: "bg-em-100 text-ink",
    });

    setSales(prev => [newSale, ...prev]);
    setCurrentInvoice(newSale);

    toast({
      type: "success",
      title: lang === "bn" ? "Wɔatɔ Nnoɔma Awie Pɛpɛɛpɛ!" : "Sale Completed Successfully!",
      message: `${invoiceNumber} · GH₵${saleData.grandTotal.toLocaleString()}`,
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
      title: lang === "bn" ? "Sika a Wɔatua Agye!" : "Payment Collected!",
      message: `${cust.name}: GH₵${amount.toLocaleString()} (Remaining Due: GH₵${newDue.toLocaleString()})`,
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
      title: lang === "bn" ? "Aka / Bosea Ahyɛ Mu" : "Due Recorded",
      message: `GH₵${amount.toLocaleString()}`,
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
      title: lang === "bn" ? "Wɔatua Agorɔfoɔ No Ka!" : "Supplier Paid!",
      message: `${sup.name}: GH₵${amount.toLocaleString()}`,
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
      title: lang === "bn" ? "Nnoɔma a Wɔatɔ Awie!" : "Purchase Recorded!",
      message: `${purchaseId} · GH₵${totalCost.toLocaleString()}`,
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
      title: lang === "bn" ? "Ka a Wɔabɔ Ahyɛ Mu!" : "Expense Added!",
      message: `${expense.category}: GH₵${expense.amount.toLocaleString()}`,
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
      title: lang === "bn" ? "Sika a Wɔde Ahyɛ Mu Awie!" : "Cash Deposit Successful!",
      message: `GH₵${amount.toLocaleString()}`,
    });
  };

  const transferCash = (fromId: string, toId: string, amount: number, note?: string) => {
    const fromAcc = accounts.find(a => a.id === fromId);
    if (!fromAcc || fromAcc.balance < amount) {
      toast({
        type: "error",
        title: lang === "bn" ? "Sika Nso!" : "Insufficient Balance!",
        message: `${fromAcc?.name} balance is GH₵${fromAcc?.balance.toLocaleString()}`,
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
        descBn: `${fromAcc.nameBn} kɔ ${toAcc?.nameBn}`,
        account: `${fromId.toUpperCase()} → ${toId.toUpperCase()}`,
        amount: amount,
        time: "Today",
      },
      ...prev,
    ]);

    toast({
      type: "success",
      title: lang === "bn" ? "Wɔatwe Sika No Awie!" : "Transfer Completed!",
      message: `GH₵${amount.toLocaleString()} from ${fromAcc.name} to ${toAcc?.name}`,
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
      title: lang === "bn" ? "Wɔatua Akatua Awie!" : "Salary Paid Successfully!",
      message: `${emp.name}: GH₵${emp.salary.toLocaleString()}`,
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
            title: lang === "bn" ? "SME Bosea Akɔ Sikakorabea!" : "SME Loan Disbursed!",
            message: `GH₵${amount.toLocaleString()} credited to your Business Bank Account.`,
          });
        },
        createPaymentLink: (customerName: string, amount: number, purpose: string) => {
          const id = `PLK-${Math.floor(8800 + Math.random() * 100)}`;
          const linkUrl = `https://pay.sayhpro.com/l/kofi-${id.toLowerCase()}`;
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
            title: lang === "bn" ? "Akatua Link Ayɛ Krado!" : "Payment Link Created!",
            message: `Link ready for ${customerName} (GH₵${amount.toLocaleString()}).`,
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
