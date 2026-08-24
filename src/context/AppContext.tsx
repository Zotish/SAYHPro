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
  const str = typeof val === "number" ? val.toLocaleString("en-US") : val.toString();
  return lang === "bn" ? toBnDigits(str) : str;
};

export const formatTaka = (val: number | string | undefined | null, lang: "en" | "bn" = "en"): string => {
  return `৳${formatNum(val, lang)}`;
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
  addCustomer: (customer: Omit<Customer, "id" | "totalPurchases" | "visits" | "lastVisit" | "rating" | "avatar">) => void;
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
  { id: "cash", name: "Cash", nameBn: "নগদ ক্যাশ", balance: 72500, color: "#059669", bg: "#ECFDF5", in: 48250, out: 12800 },
  { id: "bkash", name: "bKash", nameBn: "বিকাশ", balance: 28400, color: "#E91E8C", bg: "#FDF2F8", in: 12400, out: 3200 },
  { id: "nagad", name: "Nagad", nameBn: "নগদ", balance: 15200, color: "#F57C00", bg: "#FFF3E0", in: 8200, out: 1500 },
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
  { id: 1, type: "alert", title: "Low Stock Alert", titleBn: "কম স্টক সতর্কতা", body: "Pran Salt 1kg has only 3 units left. Minimum stock is 15.", bodyBn: "প্রাণ লবণ ১কেজিতে মাত্র ৩টি বাকি। সর্বনিম্ন স্টক ১৫টি।", time: "2 min ago", read: false, color: "bg-amber-50 text-amber-600", badge: "bg-amber-100 text-amber-700" },
  { id: 2, type: "sale", title: "Sale Completed", titleBn: "বিক্রয় সম্পন্ন", body: "INV-1043 completed for Karim Ahmed — ৳2,850", bodyBn: "করিম আহমেদের INV-১০৪৩ সম্পন্ন — ৳২,৮৫০", time: "15 min ago", read: false, color: "bg-em-50 text-em-600", badge: "bg-em-100 text-em-700" },
  { id: 3, type: "due", title: "Overdue Payment Reminder", titleBn: "বকেয়া পেমেন্ট মনে করানো", body: "Sumaiya Khatun has ৳12,000 overdue since Nov 28.", bodyBn: "সুমাইয়া খাতুনের ৳১২,০০০ বাকি নভেম্বর ২৮ থেকে।", time: "1 hour ago", read: false, color: "bg-red-50 text-red-600", badge: "bg-red-100 text-red-700" },
  { id: 4, type: "stock", title: "Low Stock Alert", titleBn: "কম স্টক সতর্কতা", body: "BD Fresh Milk 1L — 8 units left (min: 20)", bodyBn: "বিডি ফ্রেশ মিল্ক — ৮টি বাকি (সর্বনিম্ন: ২০)", time: "2 hours ago", read: true, color: "bg-amber-50 text-amber-600", badge: "bg-amber-100 text-amber-700" },
  { id: 5, type: "supplier", title: "Supplier Payment Due", titleBn: "সাপ্লায়ার পেমেন্ট দেয়", body: "Pran-RFL Group payment of ৳21,400 is due on Dec 20.", bodyBn: "প্রাণ-আরএফএল গ্রুপের ৳২১,৪০০ পেমেন্ট ডিসেম্বর ২০ তারিখে।", time: "3 hours ago", read: true, color: "bg-blue-50 text-blue-600", badge: "bg-blue-100 text-blue-700" },
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
    } catch (e) {
      console.error("Storage error:", e);
    }
  }, [products, sales, customers, suppliers, purchases, expenses, accounts, transactions, employees, notifications, settings]);

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
      color: "bg-em-50 text-em-600",
      badge: "bg-em-100 text-em-700",
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
  const addCustomer = (c: Omit<Customer, "id" | "totalPurchases" | "visits" | "lastVisit" | "rating" | "avatar">) => {
    const id = Date.now();
    const avatar = c.nameBn ? c.nameBn.slice(0, 1) : c.name.slice(0, 1);
    const newCust: Customer = {
      ...c,
      id,
      totalPurchases: 0,
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
