import { useState, useMemo, useEffect } from "react";
import {
  Search, ShoppingCart, Heart, Star, ShieldCheck, Truck, CreditCard,
  Phone, MessageCircle, X, Plus, Minus, Trash2, ArrowRight, Check,
  CheckCircle, ChevronRight, Share2, Copy, Sparkles, Filter, ExternalLink,
  MapPin, Clock, ArrowLeft, RefreshCw, Smartphone, Monitor, AlertCircle,
  Tag, ChevronDown, Camera, Mic, Home, User, Menu, SlidersHorizontal,
  Package, CheckSquare, Zap, Eye, HelpCircle, Gift, Navigation, Store, Download
} from "lucide-react";
import { useApp, Product } from "../context/AppContext";
import { toast } from "../components/Toast";

interface CustomerStorefrontProps {
  lang: "en" | "bn";
  onBack?: () => void;
  previewMode?: boolean;
}

// Robust Product Image Renderer (Handles URLs, Unsplash images, local paths & emojis cleanly)
const renderProductImage = (
  img?: string,
  sizeClass = "text-4xl",
  imgClass = "w-full h-full object-contain p-1 rounded-md"
) => {
  if (!img) return <span className={sizeClass}>📦</span>;
  const isUrl = img.startsWith("http://") || img.startsWith("https://") || img.startsWith("/") || img.startsWith("data:");
  if (isUrl) {
    return (
      <img
        src={img}
        alt="Product"
        className={imgClass}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.style.display = "none";
          if (e.currentTarget.parentElement) {
            e.currentTarget.parentElement.innerHTML = `<span class="${sizeClass}">📦</span>`;
          }
        }}
      />
    );
  }
  return <span className={sizeClass}>{img}</span>;
};

export default function CustomerStorefront({
  lang: initialLang = "bn",
  onBack,
  previewMode = true,
}: CustomerStorefrontProps) {
  const { products, storefront, settings, formatTaka, tNum } = useApp();

  // Local Language
  const [lang, setLang] = useState<"en" | "bn">(initialLang);
  const isBn = lang === "bn";

  // Amazon Mobile App Active Bottom Navigation Tab: 'home' | 'you' | 'cart' | 'menu'
  const [activeTab, setActiveTab] = useState<"home" | "you" | "cart" | "menu">("home");

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "rating">("featured");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [dealsOnly, setDealsOnly] = useState(false);

  // Delivery Location
  const [selectedLocation, setSelectedLocation] = useState("Dhaka 1205");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Voice/Camera Search simulation modal
  const [isMediaSearchOpen, setIsMediaSearchOpen] = useState<"camera" | "voice" | null>(null);

  // Customer Profile State (Guest by default, registers upon order)
  const [customer, setCustomer] = useState<{
    name: string;
    phone: string;
    address: string;
    area: string;
    isRegistered: boolean;
  }>({
    name: "",
    phone: "",
    address: "",
    area: "Dhanmondi, Dhaka",
    isRegistered: false,
  });

  // Customer's Placed Orders
  const [customerOrders, setCustomerOrders] = useState<Array<{
    id: string;
    date: string;
    time: string;
    status: "confirmed" | "packing" | "out_for_delivery" | "delivered";
    items: Array<{ name: string; nameBn?: string; qty: number; price: number; image?: string }>;
    total: number;
    paymentMethod: "cod" | "bkash" | "whatsapp";
  }>>([]);

  // Edit Customer Profile Modal
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [tempProfileName, setTempProfileName] = useState("");
  const [tempProfilePhone, setTempProfilePhone] = useState("");
  const [phoneLookupInput, setPhoneLookupInput] = useState("");

  // Cart State (Initialized with 1 demo product for quick preview)
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([
    {
      product: products[0] || {
        id: 1,
        name: "Sunflower Cooking Oil 5L",
        nameBn: "সানফ্লাওয়ার রান্নার তেল ৫লিটার",
        sellPrice: 300,
        buyPrice: 250,
        unit: "Piece",
        stock: 25,
        status: "in-stock",
        category: "Grocery",
        image: "🫙",
        sku: "OIL-001",
        min: 5
      },
      qty: 1
    }
  ]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  // Quick View / Product Detail Modal
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"details" | "success">("details");
  const [checkoutName, setCheckoutName] = useState(customer.name);
  const [checkoutPhone, setCheckoutPhone] = useState(customer.phone);
  const [checkoutAddress, setCheckoutAddress] = useState(customer.address);
  const [checkoutArea, setCheckoutArea] = useState(customer.area || "Dhanmondi, Dhaka");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bkash" | "whatsapp">("cod");
  const [orderId, setOrderId] = useState("");

  // Wishlist state
  const [wishlist, setWishlist] = useState<number[]>([]);

  // Derived Values
  const storeUrl = `https://${storefront.subdomain || "bhaibhaistore"}.sayhpro.com`;

  // Categories list extracted from products with Amazon-style circular badge icons
  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map(p => p.category)));
    return [
      { id: "all", name: "All Items", nameBn: "সব পণ্য", icon: "🛒", bg: "bg-teal-50 text-teal-700" },
      { id: "deals", name: "Today's Deals", nameBn: "স্পেশাল ডিল", icon: "🔥", bg: "bg-red-50 text-red-600", badge: "20% OFF" },
      ...unique.map(cat => ({
        id: cat,
        name: cat,
        nameBn: cat === "Grocery" ? "মুদি ও খাদ্য" : cat === "Dairy" ? "দুধ ও ডেইরি" : cat === "Snacks" ? "স্ন্যাক্স ও বিস্কুট" : cat === "Beverages" ? "জুস ও পানীয়" : cat === "Personal Care" ? "প্রসাধন রূপচর্চা" : cat === "Household" ? "গৃহস্থালী ক্লিন" : cat,
        icon: cat === "Grocery" ? "🌾" : cat === "Dairy" ? "🥛" : cat === "Snacks" ? "🍿" : cat === "Beverages" ? "🧃" : cat === "Personal Care" ? "🧴" : "📦",
        bg: cat === "Grocery" ? "bg-amber-50 text-amber-700" : cat === "Dairy" ? "bg-blue-50 text-blue-700" : cat === "Snacks" ? "bg-orange-50 text-orange-700" : "bg-purple-50 text-purple-700",
        badge: undefined
      }))
    ];
  }, [products]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (selectedCategory === "deals") {
        return p.sellPrice > 100;
      }
      const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.nameBn && p.nameBn.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q);
      const matchesStock = !inStockOnly || p.stock > 0;
      const matchesDeals = !dealsOnly || p.sellPrice > 150;
      return matchesCategory && matchesSearch && matchesStock && matchesDeals;
    }).sort((a, b) => {
      if (sortBy === "price-asc") return a.sellPrice - b.sellPrice;
      if (sortBy === "price-desc") return b.sellPrice - a.sellPrice;
      if (sortBy === "rating") return b.id - a.id;
      return 0;
    });
  }, [products, selectedCategory, searchQuery, inStockOnly, dealsOnly, sortBy]);

  // Deals of the day sample products
  const dealProducts = useMemo(() => {
    return products.slice(0, 5).map((p, idx) => ({
      ...p,
      discountPercent: [25, 30, 20, 15, 35][idx % 5],
      mrp: Math.round(p.sellPrice * 1.35),
      dealTitle: ["Limited time deal", "Deal of the Day", "Save ৳60", "Top Pick", "Best Seller"][idx % 5]
    }));
  }, [products]);

  // Cart operations
  const addToCart = (product: Product, delta = 1) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.product.id === product.id);
      if (idx > -1) {
        const nextQty = prev[idx].qty + delta;
        if (nextQty <= 0) {
          return prev.filter(item => item.product.id !== product.id);
        }
        return prev.map((item, i) => i === idx ? { ...item, qty: nextQty } : item);
      }
      if (delta > 0) {
        return [...prev, { product, qty: delta }];
      }
      return prev;
    });
    if (delta > 0) {
      toast({
        type: "success",
        title: isBn ? "কার্টে যোগ হয়েছে!" : "Added to Cart!",
        message: `${isBn ? product.nameBn || product.name : product.name} ${isBn ? "সফলভাবে কার্টে যোগ করা হয়েছে।" : "added to your Amazon cart."}`,
      });
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  };

  const toggleWishlist = (id: number) => {
    setWishlist(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const getCartItemQty = (id: number) => {
    const item = cart.find(i => i.product.id === id);
    return item ? item.qty : 0;
  };

  // Cart totals
  const subtotal = cart.reduce((sum, item) => sum + item.product.sellPrice * item.qty, 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const freeDeliveryThreshold = 500;
  const isFreeDelivery = subtotal >= freeDeliveryThreshold;
  const deliveryFee = subtotal === 0 || isFreeDelivery ? 0 : 40;
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const grandTotal = Math.max(0, subtotal + deliveryFee - couponDiscount);

  // Apply Promo Code
  const handleApplyCoupon = () => {
    const clean = couponCode.trim().toUpperCase();
    if (clean === "SAVE50" || clean === "WELCOME50") {
      setAppliedCoupon({ code: clean, discount: 50 });
      toast({
        type: "success",
        title: isBn ? "কুপন কোড সক্রিয় হয়েছে!" : "Promo Code Applied!",
        message: isBn ? "৳৫০ ডিসকাউন্ট যুক্ত হয়েছে।" : "৳50 discount applied.",
      });
    } else if (clean === "AMAZON100" || clean === "EID100") {
      setAppliedCoupon({ code: clean, discount: 100 });
      toast({
        type: "success",
        title: isBn ? "উৎসব অফার সফল!" : "Festival Deal Applied!",
        message: isBn ? "৳১০০ ডিসকাউন্ট যুক্ত হয়েছে।" : "৳100 discount applied.",
      });
    } else {
      toast({
        type: "error",
        title: isBn ? "অকার্যকর কুপন" : "Invalid Code",
        message: isBn ? "SAVE50 বা AMAZON100 চেষ্টা করুন।" : "Try SAVE50 or AMAZON100.",
      });
    }
  };

  // Handle Checkout & Order Placement
  const handlePlaceOrder = () => {
    const nameToUse = checkoutName.trim() || customer.name.trim();
    const phoneToUse = checkoutPhone.trim() || customer.phone.trim();
    const addressToUse = checkoutAddress.trim() || customer.address.trim();

    if (!nameToUse || !phoneToUse || !addressToUse) {
      toast({
        type: "error",
        title: isBn ? "তথ্য পূরণ করুন" : "Incomplete Info",
        message: isBn ? "দয়া করে আপনার নাম, মোবাইল এবং ঠিকানা লিখুন।" : "Please provide your name, phone and shipping address.",
      });
      return;
    }

    const generatedId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderId(generatedId);

    // 1. Auto-register customer profile from checkout details
    setCustomer({
      name: nameToUse,
      phone: phoneToUse,
      address: addressToUse,
      area: checkoutArea,
      isRegistered: true,
    });

    // 2. Add order to customer's order history
    const newOrder = {
      id: generatedId,
      date: new Date().toLocaleDateString(isBn ? "bn-BD" : "en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      status: "confirmed" as const,
      items: cart.map(i => ({
        name: i.product.name,
        nameBn: i.product.nameBn,
        qty: i.qty,
        price: i.product.sellPrice,
        image: i.product.image
      })),
      total: grandTotal,
      paymentMethod: paymentMethod,
    };
    setCustomerOrders(prev => [newOrder, ...prev]);

    // 3. WhatsApp redirect if selected
    if (paymentMethod === "whatsapp") {
      const itemsList = cart.map(i => `• ${i.product.name} (${i.qty}x) = ৳${i.product.sellPrice * i.qty}`).join("\n");
      const message = `Hello ${settings.shopName},\nI would like to place an order via your Amazon App Storefront:\n\nOrder ID: #${generatedId}\nCustomer: ${nameToUse}\nPhone: ${phoneToUse}\nAddress: ${addressToUse}, ${checkoutArea}\n\n*Ordered Items:*\n${itemsList}\n\n*Total Payable: ৳${grandTotal}*\nPayment: Cash on Delivery\n\nPlease confirm my delivery!`;
      const encoded = encodeURIComponent(message);
      window.open(`https://wa.me/8801712345678?text=${encoded}`, "_blank");
    }

    setCheckoutStep("success");
    toast({
      type: "success",
      title: isBn ? "অর্ডার সম্পন্ন হয়েছে!" : "Order Placed Successfully!",
      message: isBn ? `অর্ডার #${generatedId} নিশ্চিত হয়েছে।` : `Order #${generatedId} confirmed.`,
    });
  };

  const resetCheckout = () => {
    setCart([]);
    setAppliedCoupon(null);
    setIsCheckoutOpen(false);
    setCheckoutStep("details");
  };

  // PWA Install State for Storefront
  const [pwaPrompt, setPwaPrompt] = useState<any>(() => {
    if (typeof window !== "undefined" && (window as any).deferredPwaPrompt) {
      return (window as any).deferredPwaPrompt;
    }
    return null;
  });
  const [canInstallPWA, setCanInstallPWA] = useState(() => {
    return typeof window !== "undefined" && Boolean((window as any).deferredPwaPrompt);
  });
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);

  useEffect(() => {
    // Check if early prompt already captured
    if (typeof window !== "undefined" && (window as any).deferredPwaPrompt) {
      setPwaPrompt((window as any).deferredPwaPrompt);
      setCanInstallPWA(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPwaPrompt = e;
      setPwaPrompt(e);
      setCanInstallPWA(true);
    };

    const handlePromptReady = (e: any) => {
      if (e.detail) {
        setPwaPrompt(e.detail);
        setCanInstallPWA(true);
      }
    };

    const handleInstalled = () => {
      setPwaPrompt(null);
      if (typeof window !== "undefined") (window as any).deferredPwaPrompt = null;
      setCanInstallPWA(false);
      setIsPwaModalOpen(false);
      toast({
        type: "success",
        title: isBn ? "স্টোর অ্যাপ ইনস্টল সম্পন্ন!" : "Store App Installed!",
      });
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("pwa-prompt-ready", handlePromptReady);
    window.addEventListener("pwa-installed", handleInstalled);
    window.addEventListener("appinstalled", handleInstalled);

    // Switch manifest to dedicated storefront-manifest.json
    const manifestEl = document.getElementById("app-manifest") as HTMLLinkElement | null;
    const prevManifestHref = manifestEl ? manifestEl.href : null;
    if (manifestEl) {
      manifestEl.href = "/storefront-manifest.json";
    }

    // Set page title to shop name
    const prevTitle = document.title;
    document.title = `${settings.shopName || "Rahim Store"} — Online Shop`;

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("pwa-prompt-ready", handlePromptReady);
      window.removeEventListener("pwa-installed", handleInstalled);
      window.removeEventListener("appinstalled", handleInstalled);
      if (manifestEl && prevManifestHref) {
        manifestEl.href = prevManifestHref;
      }
      document.title = prevTitle;
    };
  }, [settings.shopName, isBn]);

  // Helper to open real Google Chrome on Android (escaping In-App browsers and Custom Tabs)
  const openInRealChrome = (customUrl?: string) => {
    const targetUrl = customUrl || `${window.location.origin}/?screen=storefront&auto_install=true`;
    const isAndroid = typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);
    if (isAndroid) {
      const rawUrl = targetUrl.replace(/^https?:\/\//, "");
      // Android intent forcing Chrome app launch
      const intentUrl = `intent://${rawUrl}#Intent;scheme=https;package=com.android.chrome;end`;
      window.location.href = intentUrl;
      // Fallback
      setTimeout(() => {
        window.open(targetUrl, "_blank");
      }, 1200);
      return;
    }
    window.open(targetUrl, "_blank");
  };

  // Auto-install trigger if opened with auto_install=true
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("auto_install") === "true") {
        const attemptPrompt = () => {
          const p = pwaPrompt || (window as any).deferredPwaPrompt;
          if (p) {
            try {
              p.prompt();
            } catch (err) {
              console.warn("Auto prompt error:", err);
            }
          }
        };
        window.addEventListener("pwa-prompt-ready", attemptPrompt);
        if ((window as any).deferredPwaPrompt || pwaPrompt) {
          attemptPrompt();
        }
      }
    }
  }, [pwaPrompt]);

  const triggerPWAInstall = async () => {
    const promptEvent = pwaPrompt || (typeof window !== "undefined" ? (window as any).deferredPwaPrompt : null);
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice && choice.outcome === "accepted") {
          toast({
            type: "success",
            title: isBn ? "স্টোর অ্যাপ ইনস্টল সম্পন্ন!" : "Store App Installed!",
          });
          setPwaPrompt(null);
          if (typeof window !== "undefined") (window as any).deferredPwaPrompt = null;
          setCanInstallPWA(false);
          setIsPwaModalOpen(false);
          return;
        }
      } catch (e) {
        console.warn("PWA prompt error, opening guide modal:", e);
      }
    }

    // If inside in-app browser or Custom Tab on Android without prompt
    const isAndroid = typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);
    if (isAndroid && !promptEvent) {
      // Auto launch in real Chrome with auto_install intent
      openInRealChrome();
    }

    // Open interactive PWA guide modal
    setIsPwaModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans select-none antialiased text-[#0f1111]">
      {/* ========================================================================= */}
      {/* MAIN MOBILE WEB CONTAINER                                                 */}
      {/* ========================================================================= */}
      <div className="flex-1 flex justify-center w-full bg-white">
        <div className="w-full max-w-md min-h-screen bg-white flex flex-col shadow-sm relative pb-16">

          {/* ========================================================================= */}
          {/* AMAZON MOBILE APP HEADER (STICKY WITH INTEGRATED TOP-LEFT BACK ARROW)     */}
          {/* ========================================================================= */}
          <header className="bg-gradient-to-r from-[#84d8d8] via-[#88ded9] to-[#99e2d0] text-[#0f1111] shadow-xs flex-shrink-0 z-30 sticky top-0">
            {/* Top row: Back arrow, Shop Brand Identity & Search bar */}
            <div className="px-2.5 sm:px-3 pt-2 pb-1.5 flex items-center gap-1.5">
              {/* ALWAYS VISIBLE BACK ARROW BUTTON DIRECTLY IN HEADER */}
              {onBack && (
                <button
                  onClick={onBack}
                  className="w-8 h-8 rounded-lg bg-black/15 hover:bg-black/25 active:bg-black/35 text-[#0f1111] flex items-center justify-center flex-shrink-0 cursor-pointer shadow-2xs transition-colors"
                  title={isBn ? "পূর্ববর্তী পৃষ্ঠায় ফিরুন" : "Back to Admin"}
                >
                  <ArrowLeft size={18} />
                </button>
              )}

              {/* Store Name Badge */}
              <div
                onClick={() => setActiveTab("home")}
                className="flex items-center flex-shrink-0 bg-[#131921] text-[#febd69] px-2 py-1.5 rounded-md shadow-xs border border-white/15 cursor-pointer hover:bg-black transition-colors"
                title={settings.shopName}
              >
                <span className="text-xs font-black tracking-tight truncate max-w-[70px] sm:max-w-[100px]">
                  {settings.shopName}
                </span>
              </div>

              {/* Amazon App Search Box with Camera & Mic */}
              <div className="flex-1 relative min-w-0">
                <div className="flex items-center bg-white rounded-lg shadow-xs border border-gray-300 hover:border-gray-400 focus-within:ring-2 focus-within:ring-[#f08804] px-2 py-1.5 transition-all">
                  <Search size={15} className="text-gray-600 mr-1.5 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={
                      isBn
                        ? `Search ${settings.shopName}`
                        : `Search ${settings.shopName}`
                    }
                    className="w-full bg-transparent text-xs text-[#0f1111] placeholder-gray-500 outline-none font-normal min-w-0"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-700 mr-1">
                      <X size={13} />
                    </button>
                  )}
                  {/* Camera / Scan icon */}
                  <button
                    onClick={() => setIsMediaSearchOpen("camera")}
                    className="p-0.5 text-gray-500 hover:text-[#0f1111] transition-colors flex-shrink-0"
                    title="Scan image or barcode"
                  >
                    <Camera size={15} />
                  </button>
                  {/* Mic / Alexa icon */}
                  <button
                    onClick={() => setIsMediaSearchOpen("voice")}
                    className="p-0.5 text-gray-500 hover:text-[#0f1111] transition-colors flex-shrink-0"
                    title="Voice search"
                  >
                    <Mic size={15} />
                  </button>
                </div>
              </div>

              {/* Share Store with native mobile sheet support */}
              <button
                onClick={async () => {
                  const liveCustomerUrl = `${window.location.origin}/?screen=storefront`;
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: settings.shopName,
                        text: isBn ? `${settings.shopName}-এর অনলাইন শপ থেকে কেনাকাটা করুন:` : `Shop online from ${settings.shopName}:`,
                        url: liveCustomerUrl,
                      });
                      return;
                    } catch (e) {
                      // user cancelled
                    }
                  }
                  navigator.clipboard.writeText(liveCustomerUrl);
                  toast({
                    type: "success",
                    title: isBn ? "কাস্টমার লিংক কপি হয়েছে!" : "Customer Link Copied!",
                    message: liveCustomerUrl,
                  });
                }}
                className="w-7 h-7 flex items-center justify-center text-gray-800 hover:text-black flex-shrink-0 cursor-pointer"
                title="Share Store Link"
              >
                <Share2 size={16} />
              </button>
            </div>

            {/* Amazon App Sub-bar: Dynamic Location & Customer Indicator */}
            <div
              onClick={() => setIsLocationModalOpen(true)}
              className="bg-[#c4eded] hover:bg-[#b5e7e7] px-3 py-1.5 flex items-center justify-between text-xs text-[#0f1111] cursor-pointer transition-colors border-t border-[#b1e3e3]"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <MapPin size={13} className="text-[#0f1111] flex-shrink-0" />
                <span className="truncate text-[11px] font-medium">
                  {isBn ? "ডেলিভারি এলাকা:" : "Deliver to"}{" "}
                  {customer.isRegistered && customer.name ? (
                    <strong className="font-bold">{customer.name.split(" ")[0]} - {selectedLocation}</strong>
                  ) : (
                    <strong className="font-bold">{selectedLocation}</strong>
                  )}
                </span>
                <ChevronDown size={12} className="text-gray-700" />
              </div>

              <div className="flex items-center gap-1 text-[10px] bg-white/70 px-1.5 py-0.5 rounded font-bold text-teal-900 flex-shrink-0">
                <Zap size={10} className="fill-amber-500 text-amber-500" />
                <span>{isBn ? "৪৫-৬০ মিনিট" : "45m Express"}</span>
              </div>
            </div>

            {/* PWA Install Strip (Instant App Experience & External Browser Link) */}
            <div className="bg-[#131921] text-[#febd69] px-3 py-1 flex items-center justify-between text-[11px] font-bold">
              <div className="flex items-center gap-1.5 truncate">
                <Smartphone size={13} className="text-[#febd69] animate-pulse flex-shrink-0" />
                <span className="text-white truncate">
                  {isBn ? `${settings.shopName} PWA অ্যাপ ইনস্টল` : `Install ${settings.shopName} App`}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                <button
                  onClick={() => openInRealChrome()}
                  className="bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer"
                  title="Open in Google Chrome"
                >
                  <ExternalLink size={10} />
                  <span>{isBn ? "ক্রোম" : "Chrome"}</span>
                </button>
                <button
                  onClick={triggerPWAInstall}
                  className="bg-[#febd69] hover:bg-[#f08804] text-black text-[10px] font-black px-2.5 py-0.5 rounded-full cursor-pointer shadow-xs"
                >
                  {isBn ? "ইনস্টল" : "Install"}
                </button>
              </div>
            </div>
          </header>

          {/* ========================================================================= */}
          {/* 4. MAIN SCROLLABLE APP VIEW BODY                                          */}
          {/* ========================================================================= */}
          <main className="flex-1 overflow-y-auto bg-[#eaeded] scroll-smooth pb-16">
            {/* TAB 1: HOME SCREEN (MAIN AMAZON SHOPPING FEED) */}
            {activeTab === "home" && (
              <div className="space-y-2.5">
                {/* 4.1 AMAZON APP HORIZONTAL CATEGORY STRIP (ROUND BUBBLES) */}
                <div className="bg-white py-3 px-2 shadow-2xs overflow-x-auto scrollbar-none">
                  <div className="flex items-center gap-3 min-w-max px-2">
                    {categories.map(cat => {
                      const isActive = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setSelectedCategory(cat.id);
                            if (cat.id === "deals") setDealsOnly(true);
                            else setDealsOnly(false);
                          }}
                          className="flex flex-col items-center gap-1 group cursor-pointer"
                        >
                          <div
                            className={`w-14 h-14 rounded-full flex items-center justify-center text-xl shadow-xs transition-all relative ${
                              isActive
                                ? "ring-2 ring-[#f08804] ring-offset-2 bg-[#fff8e7] scale-105"
                                : "bg-gray-100 hover:bg-gray-200"
                            }`}
                          >
                            <span>{cat.icon}</span>
                            {cat.badge && (
                              <span className="absolute -top-1 -right-1 bg-[#cc0c39] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase">
                                {cat.badge}
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-[11px] text-center font-medium max-w-[68px] truncate leading-tight ${
                              isActive ? "text-[#c45500] font-bold" : "text-[#0f1111]"
                            }`}
                          >
                            {isBn ? cat.nameBn : cat.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4.2 AMAZON APP HERO PROMO CAROUSEL CARD */}
                <div className="px-2">
                  <div className="bg-gradient-to-r from-[#232f3e] via-[#1b2533] to-[#37475a] text-white rounded-xl p-4 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-36 h-36 bg-[#febd69]/15 rounded-full blur-2xl pointer-events-none" />

                    <div className="relative z-10 space-y-1.5">
                      <div className="inline-flex items-center gap-1 bg-[#cc0c39] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">
                        <Tag size={10} />
                        <span>{isBn ? "গ্রেট সুপার সেভিংস সেল" : "SUPER VALUE DAYS"}</span>
                      </div>

                      <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                        {isBn
                          ? "নিত্যপ্রয়োজনীয় মুদি সামগ্রীতে সর্বোচ্চ ৪০% পর্যন্ত ছাড়!"
                          : "Save Up to 40% on Daily Groceries & Essentials"}
                      </h2>

                      <p className="text-[11px] text-gray-300 font-medium">
                        {isBn
                          ? "⚡ ৫০০ টাকার অর্ডারে ফ্রি এক্সপ্রেস হোম ডেলিভারি।"
                          : "⚡ FREE Doorstep Delivery on orders above ৳500."}
                      </p>

                      <div className="pt-2 flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedCategory("all");
                            setDealsOnly(true);
                          }}
                          className="bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] text-xs font-bold px-3.5 py-1.5 rounded-full shadow-xs cursor-pointer"
                        >
                          {isBn ? "সকল অফার দেখুন" : "Explore Deals"}
                        </button>
                        <span className="text-[10px] text-gray-300 font-mono">Code: SAVE50</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4.3 TODAY'S DEALS / LIMITED TIME DEALS (AMAZON APP HORIZONTAL SCROLLER) */}
                <div className="bg-white py-3 px-3 shadow-2xs">
                  <div className="flex items-center justify-between mb-2.5">
                    <div>
                      <h3 className="text-sm font-extrabold text-[#0f1111] flex items-center gap-1.5">
                        <span className="text-[#cc0c39]">🔥</span>
                        <span>{isBn ? "আজকের সেরা ডিল (Deals of the Day)" : "Deals of the Day"}</span>
                      </h3>
                      <p className="text-[10px] text-gray-500">{isBn ? "সীমিত সময়ের জন্য বিশেষ মূল্যছাড়" : "Limited-time savings on essentials"}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCategory("deals");
                        setDealsOnly(true);
                      }}
                      className="text-xs text-[#007185] hover:text-[#c45500] font-bold cursor-pointer"
                    >
                      {isBn ? "সব ডিল দেখুন >" : "See all deals >"}
                    </button>
                  </div>

                  <div className="flex items-stretch gap-3 overflow-x-auto pb-2 scrollbar-none">
                    {dealProducts.map(deal => (
                      <div
                        key={deal.id}
                        className="w-36 flex-shrink-0 bg-white border border-gray-200 rounded-lg p-2.5 flex flex-col justify-between hover:shadow-md transition-shadow relative"
                      >
                        {/* Red Deal Badge */}
                        <div className="mb-1.5">
                          <span className="bg-[#cc0c39] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-xs uppercase">
                            {deal.discountPercent}% off
                          </span>
                          <span className="ml-1 text-[9px] text-[#cc0c39] font-bold">Deal</span>
                        </div>

                        {/* Image Thumbnail */}
                        <div
                          onClick={() => setQuickViewProduct(deal)}
                          className="h-24 bg-[#f7f7f7] rounded-md flex items-center justify-center text-4xl cursor-pointer mb-2 hover:scale-105 transition-transform overflow-hidden"
                        >
                          {renderProductImage(deal.image, "text-4xl")}
                        </div>

                        {/* Title & Price */}
                        <div>
                          <div className="text-[11px] font-semibold text-[#0f1111] line-clamp-2 leading-tight mb-1">
                            {isBn ? deal.nameBn || deal.name : deal.name}
                          </div>

                          <div className="flex items-baseline gap-1">
                            <span className="text-xs font-bold text-[#0f1111]">{formatTaka(deal.sellPrice)}</span>
                            <span className="text-[10px] text-gray-400 line-through">৳{deal.mrp}</span>
                          </div>

                          <div className="text-[9px] text-emerald-700 font-bold mt-0.5">
                            ✓express Delivery
                          </div>
                        </div>

                        {/* Yellow Amazon Button */}
                        <button
                          onClick={() => addToCart(deal, 1)}
                          className="mt-2 w-full bg-[#ffd814] hover:bg-[#f7ca00] active:bg-[#f0b800] text-[#0f1111] text-[11px] font-bold py-1.5 rounded-full border border-[#fcd200] shadow-2xs transition-transform active:scale-95 cursor-pointer"
                        >
                          {isBn ? "যোগ করুন" : "Add"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4.4 FILTER & SORT BAR (AMAZON APP STYLE) */}
                <div className="bg-white px-3 py-2 flex items-center justify-between text-xs border-y border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#0f1111]">
                      {isBn ? `${tNum(filteredProducts.length)} টি পণ্য পাওয়া গেছে` : `${filteredProducts.length} Results`}
                    </span>
                    {selectedCategory !== "all" && (
                      <button
                        onClick={() => {
                          setSelectedCategory("all");
                          setDealsOnly(false);
                        }}
                        className="text-[10px] text-[#007185] hover:underline"
                      >
                        (Clear filter)
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Sort Selector */}
                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value as any)}
                      className="bg-gray-100 hover:bg-gray-200 text-[#0f1111] text-[11px] font-medium py-1 px-2 rounded border border-gray-300 outline-none cursor-pointer"
                    >
                      <option value="featured">{isBn ? "জনপ্রিয় (Featured)" : "Featured"}</option>
                      <option value="price-asc">{isBn ? "কম দাম আগে" : "Price: Low to High"}</option>
                      <option value="price-desc">{isBn ? "বেশি দাম আগে" : "Price: High to Low"}</option>
                      <option value="rating">{isBn ? "সেরা রেটিং" : "Avg. Customer Review"}</option>
                    </select>

                    {/* In Stock toggle */}
                    <button
                      onClick={() => setInStockOnly(!inStockOnly)}
                      className={`px-2 py-1 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
                        inStockOnly
                          ? "bg-[#007185] text-white border-[#007185]"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {isBn ? "স্টক আছে" : "In Stock"}
                    </button>
                  </div>
                </div>

                {/* 4.5 MAIN 2-COLUMN AMAZON APP PRODUCT FEED */}
                <div className="px-2">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {filteredProducts.map((product, pIndex) => {
                      const qtyInCart = getCartItemQty(product.id);
                      const isWish = wishlist.includes(product.id);
                      const isBestSeller = pIndex % 3 === 0;
                      const isStoresChoice = pIndex % 4 === 1;
                      const hasDiscount = product.sellPrice > 80;
                      const fakeMrp = Math.round(product.sellPrice * 1.25);
                      const discountPct = Math.round(((fakeMrp - product.sellPrice) / fakeMrp) * 100);

                      return (
                        <div
                          key={product.id}
                          className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow relative p-2.5"
                        >
                          {/* Top Badges: Store's Choice / Best Seller */}
                          <div className="flex items-start justify-between gap-1 mb-1 min-h-[22px]">
                            {isStoresChoice ? (
                              <div className="bg-[#232f3e] text-white text-[9px] font-black px-1.5 py-0.5 rounded-xs flex items-center gap-1">
                                <span className="text-[#febd69]">Store's</span>
                                <span>Choice</span>
                              </div>
                            ) : isBestSeller ? (
                              <div className="bg-[#e67a00] text-white text-[9px] font-black px-1.5 py-0.5 rounded-xs">
                                #1 Best Seller
                              </div>
                            ) : hasDiscount ? (
                              <div className="bg-[#cc0c39] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-xs">
                                -{discountPct}% Deal
                              </div>
                            ) : (
                              <div />
                            )}

                            {/* Wishlist Heart */}
                            <button
                              onClick={() => toggleWishlist(product.id)}
                              className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 cursor-pointer"
                              title="Add to Wishlist"
                            >
                              <Heart
                                size={15}
                                className={isWish ? "fill-red-500 text-red-500" : "text-gray-400"}
                              />
                            </button>
                          </div>

                          {/* Product Image Box */}
                          <div
                            onClick={() => setQuickViewProduct(product)}
                            className="h-32 bg-[#f8f8f8] rounded-md flex items-center justify-center text-5xl relative cursor-pointer group mb-2 overflow-hidden"
                          >
                            {renderProductImage(product.image, "text-5xl group-hover:scale-110 transition-transform duration-200")}
                            {product.stock <= 5 && product.stock > 0 && (
                              <span className="absolute bottom-1 left-1 bg-red-100 text-red-700 text-[8px] font-bold px-1 rounded">
                                {isBn ? `মাত্র ${tNum(product.stock)}টি বাকি` : `Only ${product.stock} left`}
                              </span>
                            )}
                          </div>

                          {/* Product Information */}
                          <div className="space-y-1">
                            {/* Brand / Category */}
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold truncate">
                              {product.brand || product.category}
                            </div>

                            {/* Product Title */}
                            <h4
                              onClick={() => setQuickViewProduct(product)}
                              className="text-xs font-semibold text-[#0f1111] line-clamp-2 leading-tight cursor-pointer hover:text-[#007185]"
                            >
                              {isBn ? product.nameBn || product.name : product.name}
                            </h4>

                            {/* Amazon Star Rating */}
                            <div className="flex items-center gap-1 text-[11px]">
                              <div className="flex text-[#de7921]">
                                <Star size={11} className="fill-[#de7921]" />
                                <Star size={11} className="fill-[#de7921]" />
                                <Star size={11} className="fill-[#de7921]" />
                                <Star size={11} className="fill-[#de7921]" />
                                <Star size={11} className="fill-[#de7921]" />
                              </div>
                              <span className="text-[10px] text-[#007185] font-semibold hover:underline">
                                ({tNum(45 + (product.id * 17) % 350)})
                              </span>
                            </div>

                            {/* Price Breakdown */}
                            <div className="pt-0.5">
                              <div className="flex items-baseline gap-1 flex-wrap">
                                {hasDiscount && (
                                  <span className="text-xs font-light text-[#cc0c39]">-{discountPct}%</span>
                                )}
                                <span className="text-base font-extrabold text-[#0f1111]">
                                  {formatTaka(product.sellPrice)}
                                </span>
                              </div>
                              {hasDiscount && (
                                <div className="text-[10px] text-gray-500">
                                  <span>M.R.P.: </span>
                                  <span className="line-through">৳{fakeMrp}</span>
                                </div>
                              )}
                            </div>

                            {/* Prime / Express Delivery Badge */}
                            <div className="flex items-center gap-1 text-[10px] text-[#0f1111] pt-0.5">
                              <span className="text-[#007185] font-black italic">✓express</span>
                              <span className="text-gray-600 truncate">{isBn ? "কাল ডেলিভারি" : "Get it by Tomorrow"}</span>
                            </div>

                            {/* In Stock Tag */}
                            <div className="text-[10px]">
                              {product.stock > 0 ? (
                                <span className="text-[#007600] font-bold">{isBn ? "স্টকে আছে (In Stock)" : "In Stock"}</span>
                              ) : (
                                <span className="text-[#b12704] font-bold">{isBn ? "স্টক শেষ (Out of Stock)" : "Currently unavailable"}</span>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons: Yellow Amazon Button or Stepper */}
                          <div className="pt-2">
                            {qtyInCart > 0 ? (
                              <div className="flex items-center justify-between bg-gray-100 rounded-full border border-gray-300 p-1">
                                <button
                                  onClick={() => addToCart(product, -1)}
                                  className="w-7 h-7 rounded-full bg-white text-gray-700 hover:bg-gray-200 flex items-center justify-center font-bold shadow-2xs cursor-pointer"
                                >
                                  {qtyInCart === 1 ? <Trash2 size={12} className="text-red-500" /> : <Minus size={12} />}
                                </button>
                                <span className="text-xs font-black text-[#0f1111]">
                                  {tNum(qtyInCart)}
                                </span>
                                <button
                                  onClick={() => addToCart(product, 1)}
                                  className="w-7 h-7 rounded-full bg-[#ffd814] text-black hover:bg-[#f7ca00] flex items-center justify-center font-bold shadow-2xs cursor-pointer"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => addToCart(product, 1)}
                                disabled={product.stock <= 0}
                                className={`w-full text-xs font-semibold py-2 px-3 rounded-full shadow-xs transition-transform active:scale-95 flex items-center justify-center gap-1 cursor-pointer ${
                                  product.stock > 0
                                    ? "bg-[#ffd814] hover:bg-[#f7ca00] active:bg-[#f0b800] text-[#0f1111] border border-[#fcd200]"
                                    : "bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed"
                                }`}
                              >
                                <span>{isBn ? "কার্টে যোগ করুন" : "Add to Cart"}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4.6 TRUST BADGES & VALUE PROPOSITION */}
                <div className="p-3 bg-white mx-2 rounded-xl border border-gray-200 space-y-3 mt-4">
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider text-center">
                    {isBn ? `কেন ${settings.shopName} থেকে কিনবেন?` : `Why Shop at ${settings.shopName}?`}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <Truck size={18} className="text-[#007185] flex-shrink-0" />
                      <div>
                        <div className="font-bold text-[#0f1111]">{isBn ? "দ্রুত ডেলিভারি" : "Fast Delivery"}</div>
                        <div className="text-[10px] text-gray-500">{isBn ? "৪৫-৬০ মিনিটে" : "Within 45-60 mins"}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <ShieldCheck size={18} className="text-[#007600] flex-shrink-0" />
                      <div>
                        <div className="font-bold text-[#0f1111]">{isBn ? "খাঁটি পণ্য" : "100% Genuine"}</div>
                        <div className="text-[10px] text-gray-500">{isBn ? "মানের নিশ্চয়তা" : "Verified Quality"}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <CreditCard size={18} className="text-[#f08804] flex-shrink-0" />
                      <div>
                        <div className="font-bold text-[#0f1111]">{isBn ? "ক্যাশ অন ডেলিভারি" : "Cash on Delivery"}</div>
                        <div className="text-[10px] text-gray-500">{isBn ? "পণ্য দেখে দাম দিন" : "Pay at doorstep"}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <MessageCircle size={18} className="text-[#25D366] flex-shrink-0" />
                      <div>
                        <div className="font-bold text-[#0f1111]">{isBn ? "হোয়াটসঅ্যাপ সাপোর্ট" : "WhatsApp Chat"}</div>
                        <div className="text-[10px] text-gray-500">{isBn ? "২৪/৭ সরাসরি সাহায্য" : "Direct response"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: YOU / ACCOUNT SCREEN (INTELLIGENT GUEST & REGISTERED MODES) */}
            {activeTab === "you" && (
              <div className="p-3 space-y-3">
                {/* 2.1 Customer Profile Header Card */}
                {customer.isRegistered && customer.name ? (
                  // REGISTERED CUSTOMER (Has placed an order or entered name)
                  <div className="bg-gradient-to-r from-[#84d8d8] to-[#99e2d0] p-4 rounded-xl shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#131921] text-[#febd69] text-xl font-black flex items-center justify-center border border-white/30">
                        {customer.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-[11px] text-teal-900 font-semibold">{isBn ? "স্বাগতম," : "Hello,"}</div>
                        <div className="text-base font-extrabold text-[#0f1111] leading-tight">{customer.name}</div>
                        <div className="text-[11px] text-gray-700 font-mono mt-0.5">{customer.phone}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setTempProfileName(customer.name);
                        setTempProfilePhone(customer.phone);
                        setIsEditProfileOpen(true);
                      }}
                      className="text-xs font-bold text-[#007185] bg-white/80 hover:bg-white px-2.5 py-1 rounded-md shadow-2xs cursor-pointer"
                    >
                      {isBn ? "পরিবর্তন" : "Edit"}
                    </button>
                  </div>
                ) : (
                  // GUEST SHOPPER BANNER (Zero signup barrier)
                  <div className="bg-gradient-to-r from-[#84d8d8] to-[#99e2d0] p-4 rounded-xl shadow-xs space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white text-[#007185] text-xl font-bold flex items-center justify-center shadow-xs flex-shrink-0">
                        <User size={24} />
                      </div>
                      <div>
                        <div className="inline-block bg-teal-800 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase">
                          {isBn ? "গেস্ট কাস্টমার" : "Guest Shopper"}
                        </div>
                        <h3 className="text-base font-extrabold text-[#0f1111] leading-tight">
                          {isBn ? "স্বাগতম, প্রিয় গ্রাহক! 👋" : "Welcome, Guest Customer! 👋"}
                        </h3>
                        <p className="text-[11px] text-teal-950 font-medium leading-snug">
                          {isBn
                            ? "কোনো পাসওয়ার্ড বা সাইন-আপের ঝামেলা নেই। সরাসরি কেনাকাটা করুন।"
                            : "Shop directly without passwords or signup forms."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2.2 4 Quick Action Cards */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      if (customerOrders.length > 0) {
                        toast({
                          type: "info",
                          title: isBn ? "চলমান অর্ডার" : "Active Orders",
                          message: isBn ? `${tNum(customerOrders.length)}টি অর্ডার প্রসেসিং হচ্ছে।` : `${customerOrders.length} order in progress.`,
                        });
                      } else {
                        toast({
                          type: "info",
                          title: isBn ? "কোনো অর্ডার নেই" : "No Orders Yet",
                          message: isBn ? "পণ্য কিনতে কার্টে আইটেম যোগ করুন।" : "Add items to cart to place an order.",
                        });
                      }
                    }}
                    className="p-3 bg-white rounded-lg border border-gray-200 text-left hover:border-gray-400 transition-colors shadow-2xs cursor-pointer"
                  >
                    <div className="text-xs font-extrabold text-[#0f1111]">{isBn ? "আপনার অর্ডার" : "Your Orders"}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      {customerOrders.length > 0
                        ? (isBn ? `${tNum(customerOrders.length)}টি সক্রিয় অর্ডার` : `${customerOrders.length} active orders`)
                        : (isBn ? "এখনো অর্ডার করা হয়নি" : "No orders placed yet")}
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      toast({
                        type: "info",
                        title: isBn ? "পছন্দের তালিকা" : "Your Wishlist",
                        message: `${wishlist.length} items in wishlist`,
                      });
                    }}
                    className="p-3 bg-white rounded-lg border border-gray-200 text-left hover:border-gray-400 transition-colors shadow-2xs cursor-pointer"
                  >
                    <div className="text-xs font-extrabold text-[#0f1111]">{isBn ? "পছন্দের পণ্য (Wishlist)" : "Your Wishlist"}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{wishlist.length} {isBn ? "টি পণ্য সেভ আছে" : "saved items"}</div>
                  </button>

                  <button
                    onClick={() => setIsLocationModalOpen(true)}
                    className="p-3 bg-white rounded-lg border border-gray-200 text-left hover:border-gray-400 transition-colors shadow-2xs cursor-pointer"
                  >
                    <div className="text-xs font-extrabold text-[#0f1111]">{isBn ? "ডেলিভারি এলাকা" : "Delivery Area"}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5 truncate">{selectedLocation}</div>
                  </button>

                  <button
                    onClick={() => {
                      window.open(`https://wa.me/8801712345678?text=${encodeURIComponent(`Hello ${settings.shopName}, I have a question about shopping online!`)}`, "_blank");
                    }}
                    className="p-3 bg-white rounded-lg border border-gray-200 text-left hover:border-gray-400 transition-colors shadow-2xs cursor-pointer"
                  >
                    <div className="text-xs font-extrabold text-[#007600] flex items-center gap-1">
                      <MessageCircle size={13} />
                      <span>{isBn ? "হোয়াটসঅ্যাপ হেল্প" : "Customer Care"}</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{isBn ? "সরাসরি দোকানদারের সাথে চ্যাট" : "Direct WhatsApp Help"}</div>
                  </button>
                </div>

                {/* 2.3 Order History Section */}
                <div className="bg-white p-3.5 rounded-xl border border-gray-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-[#0f1111] flex items-center gap-1.5">
                      <Package size={14} className="text-[#007185]" />
                      <span>{isBn ? "আপনার অর্ডারসমূহ (Order History)" : "Your Orders"}</span>
                    </h4>
                    {customerOrders.length > 0 && (
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                        {tNum(customerOrders.length)} {isBn ? "টি অর্ডার" : "Orders"}
                      </span>
                    )}
                  </div>

                  {customerOrders.length > 0 ? (
                    // Customer's ACTUAL orders
                    <div className="space-y-2.5">
                      {customerOrders.map(order => (
                        <div
                          key={order.id}
                          className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-extrabold text-xs text-[#0f1111]">
                              #{order.id}
                            </div>
                            <span className="text-[10px] text-gray-500 font-mono">
                              {order.date} • {order.time}
                            </span>
                          </div>

                          {/* Live Status Indicator */}
                          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                            <span>
                              {isBn ? "অর্ডার গ্রহণ করা হয়েছে — দোকানে প্যাকিং চলছে" : "Order Confirmed — Packing at store"}
                            </span>
                          </div>

                          {/* Item summary */}
                          <div className="text-xs text-gray-600 space-y-1 pt-1">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-[11px]">
                                <span className="truncate max-w-[200px] flex items-center gap-1">
                                  {renderProductImage(item.image, "text-xs", "w-4 h-4 object-contain inline-block")} {item.name} × {tNum(item.qty)}
                                </span>
                                <span className="font-bold text-[#0f1111]">
                                  {formatTaka(item.price * item.qty)}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                            <div className="text-xs font-bold text-gray-700">
                              {isBn ? "মোট পরিশোধ:" : "Total:"}{" "}
                              <span className="text-sm font-black text-[#b12704]">{formatTaka(order.total)}</span>
                            </div>

                            <button
                              onClick={() => {
                                // Re-add items
                                order.items.forEach(i => {
                                  const prod = products.find(p => p.name === i.name) || products[0];
                                  addToCart(prod, i.qty);
                                });
                                setActiveTab("cart");
                              }}
                              className="bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] text-[11px] font-bold px-3 py-1 rounded-full border border-[#fcd200] shadow-2xs"
                            >
                              {isBn ? "পুনরায় কিনুন" : "Buy Again"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // EMPTY ORDERS STATE FOR GUEST
                    <div className="p-4 text-center space-y-2 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      <div className="text-3xl">📦</div>
                      <div className="text-xs font-bold text-[#0f1111]">
                        {isBn ? "আপনার কোনো পূর্ববর্তী অর্ডার নেই" : "No orders placed yet"}
                      </div>
                      <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
                        {isBn
                          ? "পছন্দের পণ্য কার্টে নিয়ে অর্ডার প্লেস করুন। কোনো অ্যাকাউন্ট খোলার দরকার নেই!"
                          : "Add items to your cart and place an order. No account needed!"}
                      </p>
                      <button
                        onClick={() => setActiveTab("home")}
                        className="mt-1 bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] text-xs font-bold px-4 py-1.5 rounded-full border border-[#fcd200] shadow-2xs cursor-pointer"
                      >
                        {isBn ? "কেনাকাটা শুরু করুন" : "Start Shopping"}
                      </button>
                    </div>
                  )}
                </div>

                {/* 2.4 Track Previous Order with Phone (Guest Convenience) */}
                {!customer.isRegistered && (
                  <div className="bg-white p-3.5 rounded-xl border border-gray-200 space-y-2">
                    <h4 className="text-xs font-extrabold text-[#0f1111]">
                      {isBn ? "পূর্বে অর্ডার করেছেন? ট্র্যাকিং দেখুন" : "Already placed an order? Track it"}
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      {isBn
                        ? "আপনার মোবাইল নম্বরটি লিখলে পূর্ববর্তী অর্ডারের স্ট্যাটাস দেখতে পারবেন:"
                        : "Enter your phone number to look up past order status:"}
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        value={phoneLookupInput}
                        onChange={e => setPhoneLookupInput(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="flex-1 text-xs p-2 rounded-lg border border-gray-300 outline-none font-mono"
                      />
                      <button
                        onClick={() => {
                          if (phoneLookupInput.length >= 10) {
                            setCustomer({
                              name: "Karim Ahmed",
                              phone: phoneLookupInput,
                              address: "Road #4, Dhanmondi",
                              area: "Dhanmondi, Dhaka",
                              isRegistered: true,
                            });
                            // simulate found order
                            setCustomerOrders([
                              {
                                id: "ORD-94281",
                                date: "Today",
                                time: "1:15 PM",
                                status: "out_for_delivery",
                                items: [
                                  { name: "Sunflower Cooking Oil 5L", qty: 1, price: 300, image: "🫙" },
                                ],
                                total: 300,
                                paymentMethod: "cod"
                              }
                            ]);
                            toast({
                              type: "success",
                              title: isBn ? "অর্ডার লোড হয়েছে!" : "Order Found!",
                              message: isBn ? "আপনার প্রোফাইল ও অর্ডার হিস্ট্রি সংযুক্ত হয়েছে।" : "Your order history has been linked.",
                            });
                          } else {
                            toast({
                              type: "error",
                              title: isBn ? "সঠিক নম্বর দিন" : "Invalid Phone",
                              message: isBn ? "১১ ডিজিটের মোবাইল নম্বর লিখুন।" : "Please enter a valid phone number.",
                            });
                          }
                        }}
                        className="bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] text-xs font-bold px-3 py-2 rounded-lg border border-[#fcd200]"
                      >
                        {isBn ? "ট্র্যাক" : "Track"}
                      </button>
                    </div>
                  </div>
                )}

                {/* 2.5 Merchant Store Details Card */}
                <div className="bg-white p-3.5 rounded-xl border border-gray-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#0f1111]">
                    <Store size={15} className="text-[#007185]" />
                    <span>{isBn ? "দোকানের বিবরণ ও যোগাযোগ" : "About the Store"}</span>
                  </div>
                  <div className="text-xs text-gray-600 leading-relaxed">
                    <p className="font-bold text-[#0f1111]">{settings.shopName}</p>
                    <p>{settings.address || "Dhanmondi, Dhaka, Bangladesh"}</p>
                    <p className="font-mono text-[11px] mt-1 text-[#007185] font-bold">
                      📞 {settings.phone || "01712-345678"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: AMAZON CART SCREEN (HIGH FIDELITY SHOPPING CART) */}
            {activeTab === "cart" && (
              <div className="p-3 space-y-3">
                {/* Subtotal & Proceed to Buy Sticky Block */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-gray-700">
                      {isBn ? `সাবটোটাল (${tNum(totalItemsCount)} টি পণ্য):` : `Subtotal (${totalItemsCount} items):`}
                    </span>
                    <span className="text-xl font-black text-[#0f1111]">
                      {formatTaka(subtotal)}
                    </span>
                  </div>

                  {/* Free Delivery Bar */}
                  {isFreeDelivery ? (
                    <div className="flex items-center gap-1.5 text-xs text-[#007600] font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      <CheckCircle size={14} />
                      <span>{isBn ? "আপনার অর্ডারটি ফ্রি ডেলিভারির যোগ্য!" : "Your order qualifies for FREE Delivery!"}</span>
                    </div>
                  ) : (
                    <div className="space-y-1 bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-xs text-amber-900">
                      <div className="flex justify-between font-bold text-[11px]">
                        <span>{isBn ? "ফ্রি ডেলিভারি পেতে আর মাত্র" : "Add more for FREE delivery"}</span>
                        <span>{formatTaka(freeDeliveryThreshold - subtotal)}</span>
                      </div>
                      <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#f08804] h-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (subtotal / freeDeliveryThreshold) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Amazon Signature Yellow Proceed to Buy Button */}
                  <button
                    onClick={() => {
                      // Pre-fill with customer state
                      if (customer.name) setCheckoutName(customer.name);
                      if (customer.phone) setCheckoutPhone(customer.phone);
                      if (customer.address) setCheckoutAddress(customer.address);
                      setIsCheckoutOpen(true);
                    }}
                    disabled={cart.length === 0}
                    className={`w-full py-3 rounded-full font-bold text-sm shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
                      cart.length > 0
                        ? "bg-[#ffd814] hover:bg-[#f7ca00] active:bg-[#f0b800] text-[#0f1111] border border-[#fcd200]"
                        : "bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed"
                    }`}
                  >
                    <span>{isBn ? `চেকআউট করুন (${tNum(totalItemsCount)}টি পণ্য)` : `Proceed to Buy (${totalItemsCount} items)`}</span>
                    <ArrowRight size={15} />
                  </button>

                  {/* WhatsApp Quick Order Direct Button */}
                  <button
                    onClick={() => {
                      if (!customer.name) {
                        setIsCheckoutOpen(true);
                        setPaymentMethod("whatsapp");
                      } else {
                        setPaymentMethod("whatsapp");
                        handlePlaceOrder();
                      }
                    }}
                    disabled={cart.length === 0}
                    className="w-full py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full font-bold text-xs shadow-xs transition-transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle size={15} />
                    <span>{isBn ? "হোয়াটসঅ্যাপে ১-ক্লিকে অর্ডার দিন" : "Order via WhatsApp with 1 Tap"}</span>
                  </button>
                </div>

                {/* Promo Code Input Card */}
                <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center gap-2">
                  <Tag size={15} className="text-[#f08804]" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    placeholder={isBn ? "কুপন কোড (SAVE50 / AMAZON100)" : "Promo code (e.g. SAVE50)"}
                    className="flex-1 text-xs uppercase font-mono text-[#0f1111] outline-none"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="bg-gray-100 hover:bg-gray-200 text-[#0f1111] text-xs font-bold px-3 py-1.5 rounded-md border border-gray-300 cursor-pointer"
                  >
                    {isBn ? "প্রয়োগ" : "Apply"}
                  </button>
                </div>

                {/* Cart Items List */}
                <div className="space-y-2">
                  {cart.length === 0 ? (
                    <div className="bg-white p-8 rounded-xl text-center space-y-3 border border-gray-200">
                      <div className="text-4xl">🛒</div>
                      <div className="font-extrabold text-sm text-[#0f1111]">
                        {isBn ? "আপনার কার্ট এখন খালি" : "Your Amazon Cart is empty"}
                      </div>
                      <p className="text-xs text-gray-500">
                        {isBn ? "আমাদের সেরা ডিল ও মুদি পণ্য ঘুরে দেখুন!" : "Check out today's deals to fill your cart."}
                      </p>
                      <button
                        onClick={() => setActiveTab("home")}
                        className="bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-bold text-xs px-4 py-2 rounded-full border border-[#fcd200]"
                      >
                        {isBn ? "কেনাকাটা শুরু করুন" : "Continue Shopping"}
                      </button>
                    </div>
                  ) : (
                    cart.map(({ product, qty }) => (
                      <div
                        key={product.id}
                        className="bg-white p-3 rounded-xl border border-gray-200 flex gap-3 relative shadow-2xs"
                      >
                        {/* Thumbnail */}
                        <div className="w-20 h-20 bg-[#f8f8f8] rounded-lg border border-gray-200 flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden">
                          {renderProductImage(product.image, "text-3xl")}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <h4 className="text-xs font-bold text-[#0f1111] line-clamp-2 leading-tight">
                            {isBn ? product.nameBn || product.name : product.name}
                          </h4>

                          <div className="text-sm font-extrabold text-[#0f1111]">
                            {formatTaka(product.sellPrice)}
                          </div>

                          <div className="text-[10px] text-[#007600] font-bold">
                            {isBn ? "স্টকে আছে (In Stock)" : "In Stock"}
                          </div>

                          <div className="text-[10px] text-gray-500">
                            Eligible for FREE Shipping
                          </div>

                          {/* Stepper + Delete Action Row */}
                          <div className="pt-2 flex items-center gap-3 flex-wrap">
                            <div className="flex items-center bg-gray-100 rounded-lg border border-gray-300 p-0.5">
                              <button
                                onClick={() => addToCart(product, -1)}
                                className="w-6 h-6 rounded bg-white text-gray-700 hover:bg-gray-200 flex items-center justify-center font-bold text-xs"
                              >
                                {qty === 1 ? <Trash2 size={12} className="text-red-500" /> : <Minus size={12} />}
                              </button>
                              <span className="w-7 text-center font-bold text-xs text-[#0f1111]">
                                {tNum(qty)}
                              </span>
                              <button
                                onClick={() => addToCart(product, 1)}
                                className="w-6 h-6 rounded bg-white text-gray-700 hover:bg-gray-200 flex items-center justify-center font-bold text-xs"
                              >
                                <Plus size={12} />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(product.id)}
                              className="text-xs text-[#007185] hover:underline font-medium"
                            >
                              {isBn ? "মুছুন" : "Delete"}
                            </button>

                            <button
                              onClick={() => {
                                toggleWishlist(product.id);
                                removeFromCart(product.id);
                                toast({
                                  type: "info",
                                  title: isBn ? "সংরক্ষিত হয়েছে" : "Saved for Later",
                                  message: isBn ? "পণ্যটি পছন্দের তালিকায় যোগ করা হয়েছে।" : "Item moved to saved items.",
                                });
                              }}
                              className="text-xs text-[#007185] hover:underline font-medium"
                            >
                              {isBn ? "পরে কিনুন" : "Save for later"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: MENU SCREEN (AMAZON APP FULL DEPARTMENT MENU) */}
            {activeTab === "menu" && (
              <div className="p-3 space-y-3">
                {/* Menu Header Card */}
                <div className="bg-white p-3.5 rounded-xl border border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-[#232f3e] text-[#febd69] font-bold flex items-center justify-center text-sm">
                      🛍️
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#0f1111]">{settings.shopName} Menu</div>
                      <div className="text-[10px] text-gray-500">{isBn ? "সকল ক্যাটাগরি ও সার্ভিস" : "Explore all store sections"}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setLang(l => (l === "bn" ? "en" : "bn"))}
                    className="text-xs font-bold bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                  >
                    🌐 {isBn ? "English" : "বাংলা"}
                  </button>
                </div>

                {/* Explore Departments Grid */}
                <div className="bg-white p-3.5 rounded-xl border border-gray-200 space-y-2">
                  <h4 className="text-xs font-extrabold text-[#0f1111] uppercase tracking-wider">{isBn ? "সকল ডিপার্টমেন্ট" : "Shop by Category"}</h4>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {categories.filter(c => c.id !== "all").map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setActiveTab("home");
                        }}
                        className="p-2.5 rounded-lg border border-gray-200 hover:border-[#f08804] bg-gray-50 hover:bg-white text-left transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <span className="text-xl">{cat.icon}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#0f1111] truncate">{isBn ? cat.nameBn : cat.name}</div>
                          <div className="text-[9px] text-gray-500">Shop Now →</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Customer Service & Merchant Help */}
                <div className="bg-white p-3.5 rounded-xl border border-gray-200 space-y-2">
                  <h4 className="text-xs font-extrabold text-[#0f1111] uppercase tracking-wider">{isBn ? "কাস্টমার সার্ভিস" : "Customer Service & Help"}</h4>
                  <div className="divide-y divide-gray-100 text-xs">
                    <button
                      onClick={() => {
                        window.open(`https://wa.me/8801712345678`, "_blank");
                      }}
                      className="w-full py-2.5 flex items-center justify-between text-[#0f1111] hover:text-[#007185] font-medium"
                    >
                      <span className="flex items-center gap-2">
                        <MessageCircle size={14} className="text-emerald-600" />
                        <span>{isBn ? "হোয়াটসঅ্যাপ কাস্টমার সাপোর্ট" : "Live WhatsApp Support"}</span>
                      </span>
                      <ChevronRight size={14} className="text-gray-400" />
                    </button>

                    <button
                      onClick={() => {
                        window.open(`tel:${settings.phone || "01712345678"}`);
                      }}
                      className="w-full py-2.5 flex items-center justify-between text-[#0f1111] hover:text-[#007185] font-medium"
                    >
                      <span className="flex items-center gap-2">
                        <Phone size={14} className="text-[#007185]" />
                        <span>{isBn ? "দোকানদারের সাথে কথা বলুন" : "Call Store Hotline"}</span>
                      </span>
                      <ChevronRight size={14} className="text-gray-400" />
                    </button>

                    <button
                      onClick={() => {
                        toast({
                          type: "info",
                          title: isBn ? "রিটার্ন ও রিফান্ড নীতি" : "Return & Refund Policy",
                          message: isBn ? "পণ্য পৌঁছানোর পর যেকোনো ত্রুটিতে তাৎক্ষণিক রিপ্লেসমেন্ট।" : "Instant return & replacement on delivery.",
                        });
                      }}
                      className="w-full py-2.5 flex items-center justify-between text-[#0f1111] hover:text-[#007185] font-medium"
                    >
                      <span className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-[#007600]" />
                        <span>{isBn ? "রিটার্ন এবং মান পলিসি" : "Returns & Guarantees"}</span>
                      </span>
                      <ChevronRight size={14} className="text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* ========================================================================= */}
          {/* 5. AMAZON MOBILE WEB BOTTOM 4-TAB NAVIGATION BAR                          */}
          {/* ========================================================================= */}
          <nav className="fixed bottom-0 max-w-md w-full bg-white border-t border-gray-300 py-1.5 px-3 flex items-center justify-around z-40 shadow-lg select-none">
            {/* Tab 1: Home */}
            <button
              onClick={() => setActiveTab("home")}
              className={`flex flex-col items-center gap-0.5 cursor-pointer flex-1 py-1 transition-colors relative ${
                activeTab === "home" ? "text-[#007185] font-black" : "text-gray-600 hover:text-black"
              }`}
            >
              {activeTab === "home" && (
                <span className="absolute -top-1.5 w-8 h-1 bg-[#007185] rounded-full" />
              )}
              <Home size={20} className={activeTab === "home" ? "stroke-[2.5]" : "stroke-[1.8]"} />
              <span className="text-[10px] tracking-tight">{isBn ? "হোম" : "Home"}</span>
            </button>

            {/* Tab 2: You / Profile */}
            <button
              onClick={() => setActiveTab("you")}
              className={`flex flex-col items-center gap-0.5 cursor-pointer flex-1 py-1 transition-colors relative ${
                activeTab === "you" ? "text-[#007185] font-black" : "text-gray-600 hover:text-black"
              }`}
            >
              {activeTab === "you" && (
                <span className="absolute -top-1.5 w-8 h-1 bg-[#007185] rounded-full" />
              )}
              <User size={20} className={activeTab === "you" ? "stroke-[2.5]" : "stroke-[1.8]"} />
              <span className="text-[10px] tracking-tight">{isBn ? "অ্যাকাউন্ট" : "You"}</span>
            </button>

            {/* Tab 3: Cart with Yellow Badge */}
            <button
              onClick={() => setActiveTab("cart")}
              className={`flex flex-col items-center gap-0.5 cursor-pointer flex-1 py-1 transition-colors relative ${
                activeTab === "cart" ? "text-[#007185] font-black" : "text-gray-600 hover:text-black"
              }`}
            >
              {activeTab === "cart" && (
                <span className="absolute -top-1.5 w-8 h-1 bg-[#007185] rounded-full" />
              )}
              <div className="relative">
                <ShoppingCart size={20} className={activeTab === "cart" ? "stroke-[2.5]" : "stroke-[1.8]"} />
                {totalItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#f08804] text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs border border-white">
                    {tNum(totalItemsCount)}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight">{isBn ? "কার্ট" : "Cart"}</span>
            </button>

            {/* Tab 4: Menu */}
            <button
              onClick={() => setActiveTab("menu")}
              className={`flex flex-col items-center gap-0.5 cursor-pointer flex-1 py-1 transition-colors relative ${
                activeTab === "menu" ? "text-[#007185] font-black" : "text-gray-600 hover:text-black"
              }`}
            >
              {activeTab === "menu" && (
                <span className="absolute -top-1.5 w-8 h-1 bg-[#007185] rounded-full" />
              )}
              <Menu size={20} className={activeTab === "menu" ? "stroke-[2.5]" : "stroke-[1.8]"} />
              <span className="text-[10px] tracking-tight">{isBn ? "মেনু" : "Menu"}</span>
            </button>
          </nav>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. MODAL: PRODUCT DETAIL / QUICK VIEW (AMAZON APP PRODUCT DETAIL SHEET)   */}
      {/* ========================================================================= */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative border border-gray-200">
            {/* Close button */}
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center z-10 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="p-4 sm:p-6 space-y-4">
              {/* Product Category & Brand */}
              <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                {quickViewProduct.brand || settings.shopName} • {quickViewProduct.category}
              </div>

              {/* Product Big Title */}
              <h3 className="text-base sm:text-lg font-bold text-[#0f1111] leading-snug">
                {isBn ? quickViewProduct.nameBn || quickViewProduct.name : quickViewProduct.name}
              </h3>

              {/* Amazon App Star Rating */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex text-[#de7921]">
                  <Star size={14} className="fill-[#de7921]" />
                  <Star size={14} className="fill-[#de7921]" />
                  <Star size={14} className="fill-[#de7921]" />
                  <Star size={14} className="fill-[#de7921]" />
                  <Star size={14} className="fill-[#de7921]" />
                </div>
                <span className="text-[#007185] font-bold hover:underline">4.8 out of 5</span>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600">324 ratings</span>
              </div>

              {/* Product Big Image */}
              <div className="h-48 sm:h-56 bg-[#f8f8f8] rounded-xl flex items-center justify-center text-7xl relative shadow-inner overflow-hidden">
                {renderProductImage(quickViewProduct.image, "text-7xl")}
                <div className="absolute top-2 left-2 bg-[#232f3e] text-white text-[10px] font-black px-2 py-0.5 rounded">
                  Store's Choice
                </div>
              </div>

              {/* Price Block */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-light text-[#cc0c39]">-25%</span>
                  <span className="text-2xl font-black text-[#0f1111]">
                    {formatTaka(quickViewProduct.sellPrice)}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  <span>M.R.P.: </span>
                  <span className="line-through">৳{Math.round(quickViewProduct.sellPrice * 1.33)}</span>
                  <span className="ml-2 text-emerald-700 font-bold">You Save: ৳{Math.round(quickViewProduct.sellPrice * 0.33)}</span>
                </div>
                <div className="text-xs text-gray-700 pt-1 flex items-center gap-1 font-medium">
                  <Truck size={14} className="text-[#007185]" />
                  <span>{isBn ? "ফ্রি এক্সপ্রেস ডেলিভারি পাওয়া যাবে" : "Eligible for FREE Express Delivery"}</span>
                </div>
              </div>

              {/* Stock status */}
              <div className="text-xs">
                {quickViewProduct.stock > 0 ? (
                  <span className="text-[#007600] font-bold text-sm">
                    {isBn ? "স্টকে আছে — এখনই অর্ডার করুন" : "In Stock - Order now for fast delivery"}
                  </span>
                ) : (
                  <span className="text-[#b12704] font-bold">
                    {isBn ? "বর্তমানে স্টক শেষ" : "Currently out of stock"}
                  </span>
                )}
              </div>

              {/* Buttons: Add to Cart (Yellow) and Buy Now (Orange) */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    addToCart(quickViewProduct, 1);
                    setQuickViewProduct(null);
                  }}
                  className="w-full py-3 bg-[#ffd814] hover:bg-[#f7ca00] active:bg-[#f0b800] text-[#0f1111] font-bold text-sm rounded-full border border-[#fcd200] shadow-xs cursor-pointer"
                >
                  {isBn ? "কার্টে যোগ করুন (Add to Cart)" : "Add to Cart"}
                </button>

                <button
                  onClick={() => {
                    addToCart(quickViewProduct, 1);
                    setQuickViewProduct(null);
                    if (customer.name) setCheckoutName(customer.name);
                    if (customer.phone) setCheckoutPhone(customer.phone);
                    if (customer.address) setCheckoutAddress(customer.address);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full py-3 bg-[#ffa41c] hover:bg-[#fa8900] active:bg-[#e07b00] text-[#0f1111] font-bold text-sm rounded-full border border-[#ff8f00] shadow-xs cursor-pointer"
                >
                  {isBn ? "এখনই কিনুন (Buy Now)" : "Buy Now"}
                </button>
              </div>

              {/* Secure transaction guarantee */}
              <div className="text-[11px] text-gray-500 text-center flex items-center justify-center gap-1 pt-1">
                <ShieldCheck size={14} className="text-gray-400" />
                <span>{isBn ? "নিরাপদ লেনদেন ও ক্যাশ অন ডেলিভারি" : "Secure transaction • Cash on Delivery"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL: LOCATION SELECTOR (AMAZON APP "CHOOSE YOUR LOCATION")           */}
      {/* ========================================================================= */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 space-y-3 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <h3 className="text-sm font-extrabold text-[#0f1111] flex items-center gap-1.5">
                <MapPin size={16} className="text-[#007185]" />
                <span>{isBn ? "ডেলিভারি এলাকা নির্বাচন করুন" : "Choose your location"}</span>
              </h3>
              <button onClick={() => setIsLocationModalOpen(false)} className="text-gray-400 hover:text-black">
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              {isBn ? "আপনার এলাকা অনুযায়ী এক্সপ্রেস ডেলিভারির সময় নির্ধারিত হবে:" : "Select your area to see accurate delivery speed and availability:"}
            </p>

            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {[
                { name: "Dhanmondi, Dhaka 1205", time: "40 mins" },
                { name: "Gulshan 1 & 2, Dhaka 1212", time: "50 mins" },
                { name: "Banani, Dhaka 1213", time: "45 mins" },
                { name: "Uttara, Dhaka 1230", time: "60 mins" },
                { name: "Mirpur 1-14, Dhaka 1216", time: "55 mins" },
                { name: "Mohammadpur, Dhaka 1207", time: "35 mins" },
                { name: "Bashundhara R/A, Dhaka 1229", time: "60 mins" },
                { name: "Motijheel, Dhaka 1000", time: "50 mins" },
              ].map(loc => (
                <button
                  key={loc.name}
                  onClick={() => {
                    setSelectedLocation(loc.name);
                    setCheckoutArea(loc.name);
                    setCustomer(c => ({ ...c, area: loc.name }));
                    setIsLocationModalOpen(false);
                    toast({
                      type: "success",
                      title: isBn ? "ঠিকানা আপডেট হয়েছে" : "Location Set",
                      message: loc.name,
                    });
                  }}
                  className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                    selectedLocation === loc.name
                      ? "bg-teal-50 border-[#007185] font-bold text-[#007185]"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100 text-[#0f1111]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MapPin size={13} />
                    <span>{loc.name}</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">{loc.time}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. MODAL: EDIT CUSTOMER PROFILE                                            */}
      {/* ========================================================================= */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <h3 className="text-sm font-extrabold text-[#0f1111]">
                {isBn ? "প্রোফাইল তথ্য পরিবর্তন" : "Edit Customer Profile"}
              </h3>
              <button onClick={() => setIsEditProfileOpen(false)} className="text-gray-400 hover:text-black">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  {isBn ? "আপনার নাম" : "Your Name"}
                </label>
                <input
                  type="text"
                  value={tempProfileName}
                  onChange={e => setTempProfileName(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-gray-300 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  {isBn ? "মোবাইল নম্বর" : "Phone Number"}
                </label>
                <input
                  type="tel"
                  value={tempProfilePhone}
                  onChange={e => setTempProfilePhone(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-gray-300 outline-none font-mono"
                />
              </div>

              <button
                onClick={() => {
                  if (tempProfileName.trim() && tempProfilePhone.trim()) {
                    setCustomer(c => ({
                      ...c,
                      name: tempProfileName.trim(),
                      phone: tempProfilePhone.trim(),
                      isRegistered: true,
                    }));
                    setCheckoutName(tempProfileName.trim());
                    setCheckoutPhone(tempProfilePhone.trim());
                    setIsEditProfileOpen(false);
                    toast({
                      type: "success",
                      title: isBn ? "প্রোফাইল আপডেট হয়েছে" : "Profile Updated",
                      message: tempProfileName.trim(),
                    });
                  }
                }}
                className="w-full py-2.5 bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-bold text-xs rounded-full border border-[#fcd200] shadow-xs cursor-pointer"
              >
                {isBn ? "সংরক্ষণ করুন" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. MODAL: CAMERA / VOICE SEARCH SIMULATION (AMAZON APP FEATURE)           */}
      {/* ========================================================================= */}
      {isMediaSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-teal-100 text-[#007185] flex items-center justify-center mx-auto text-2xl">
              {isMediaSearchOpen === "camera" ? <Camera size={28} /> : <Mic size={28} />}
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-[#0f1111]">
                {isMediaSearchOpen === "camera"
                  ? (isBn ? "অ্যামাজন লেন্স (বারকোড / ছবি স্ক্যান)" : "Amazon Visual Lens Search")
                  : (isBn ? "অ্যামাজন ভয়েস সার্চ" : "Amazon Voice Assistant")}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {isMediaSearchOpen === "camera"
                  ? (isBn ? "পণ্যের ছবি বা প্যাকেজের বারকোড স্ক্যান করুন" : "Point camera at an item or barcode to search instantly")
                  : (isBn ? "দয়া করে বলুন: 'রান্নার তেল' অথবা 'মুদি সামগ্রী'..." : "Say: 'Sunflower cooking oil' or 'Rice'...")}
              </p>
            </div>

            <div className="p-3 bg-gray-100 rounded-lg text-xs font-mono text-gray-700">
              {isMediaSearchOpen === "camera" ? "Scanning active..." : "Listening..."}
            </div>

            <button
              onClick={() => setIsMediaSearchOpen(null)}
              className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded-full cursor-pointer"
            >
              {isBn ? "বন্ধ করুন" : "Close"}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. MODAL: AMAZON STYLE 3-STEP GUEST CHECKOUT                             */}
      {/* ========================================================================= */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col border border-gray-200">
            {/* Modal Header */}
            <div className="p-4 bg-[#232f3e] text-white flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#febd69] text-black font-black text-xs flex items-center justify-center">
                  🛒
                </div>
                <h3 className="font-extrabold text-sm">
                  {checkoutStep === "details"
                    ? (isBn ? "অ্যামাজন এক্সপ্রেস চেকআউট" : "Amazon Express Checkout")
                    : (isBn ? "অর্ডার সম্পন্ন হয়েছে!" : "Order Placed Successfully!")}
                </h3>
              </div>
              <button
                onClick={resetCheckout}
                className="text-gray-300 hover:text-white p-1 rounded cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {checkoutStep === "details" ? (
              <div className="p-4 sm:p-6 space-y-4">
                {/* Zero-signup notice */}
                <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200 font-medium">
                  <CheckCircle size={14} className="text-emerald-600 flex-shrink-0" />
                  <span>{isBn ? "কোনো পাসওয়ার্ড দরকার নেই — শুধু ঠিকানা দিন ও অর্ডার করুন!" : "Zero Sign-up: Enter address & place your order instantly."}</span>
                </div>

                {/* Step 1: Shipping Address */}
                <div className="space-y-2">
                  <div className="text-xs font-black uppercase text-gray-500 tracking-wider flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-[#febd69] text-black text-[10px] font-bold flex items-center justify-center">1</span>
                    <span>{isBn ? "ডেলিভারি ঠিকানা (Shipping Address)" : "1. Shipping Address"}</span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] font-bold text-gray-700 block mb-0.5">
                        {isBn ? "আপনার পুরো নাম" : "Your Full Name"} *
                      </label>
                      <input
                        type="text"
                        value={checkoutName}
                        onChange={e => setCheckoutName(e.target.value)}
                        placeholder={isBn ? "যেমন: তানভীর হাসান / সোহেল" : "e.g. Tanvir Hasan"}
                        className="w-full text-xs p-2 rounded-lg border border-gray-300 focus:border-[#f08804] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-700 block mb-0.5">
                        {isBn ? "মোবাইল নম্বর" : "Mobile Phone Number"} *
                      </label>
                      <input
                        type="tel"
                        value={checkoutPhone}
                        onChange={e => setCheckoutPhone(e.target.value)}
                        placeholder="01712-XXXXXX"
                        className="w-full text-xs p-2 rounded-lg border border-gray-300 focus:border-[#f08804] outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-700 block mb-0.5">
                        {isBn ? "রাস্তা ও বাসার ঠিকানা" : "Street Address / House / Road"} *
                      </label>
                      <input
                        type="text"
                        value={checkoutAddress}
                        onChange={e => setCheckoutAddress(e.target.value)}
                        placeholder={isBn ? "বাসা নম্বর, রোড নম্বর, এলাকা" : "House #, Road #, Flat #"}
                        className="w-full text-xs p-2 rounded-lg border border-gray-300 focus:border-[#f08804] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-700 block mb-0.5">
                        {isBn ? "এলাকা ও থানা" : "Area & City"}
                      </label>
                      <select
                        value={checkoutArea}
                        onChange={e => setCheckoutArea(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-gray-300 focus:border-[#f08804] outline-none bg-white cursor-pointer"
                      >
                        <option value="Dhanmondi, Dhaka">Dhanmondi, Dhaka</option>
                        <option value="Gulshan, Dhaka">Gulshan, Dhaka</option>
                        <option value="Banani, Dhaka">Banani, Dhaka</option>
                        <option value="Uttara, Dhaka">Uttara, Dhaka</option>
                        <option value="Mirpur, Dhaka">Mirpur, Dhaka</option>
                        <option value="Mohammadpur, Dhaka">Mohammadpur, Dhaka</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Step 2: Payment Method */}
                <div className="space-y-2 pt-2 border-t border-gray-200">
                  <div className="text-xs font-black uppercase text-gray-500 tracking-wider flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-[#febd69] text-black text-[10px] font-bold flex items-center justify-center">2</span>
                    <span>{isBn ? "পেমেন্ট মাধ্যম (Payment Method)" : "2. Payment Method"}</span>
                  </div>

                  <div className="space-y-1.5">
                    {/* COD Option */}
                    <label
                      onClick={() => setPaymentMethod("cod")}
                      className={`p-2.5 rounded-lg border flex items-center justify-between text-xs cursor-pointer transition-colors ${
                        paymentMethod === "cod"
                          ? "bg-amber-50/50 border-[#f08804] text-[#0f1111] font-bold"
                          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === "cod"}
                          onChange={() => setPaymentMethod("cod")}
                          className="accent-[#f08804]"
                        />
                        <span>{isBn ? "ক্যাশ অন ডেলিভারি (Cash on Delivery)" : "Cash on Delivery (COD)"}</span>
                      </div>
                      <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded font-normal">Pay cash</span>
                    </label>

                    {/* bKash Option */}
                    <label
                      onClick={() => setPaymentMethod("bkash")}
                      className={`p-2.5 rounded-lg border flex items-center justify-between text-xs cursor-pointer transition-colors ${
                        paymentMethod === "bkash"
                          ? "bg-pink-50/50 border-pink-500 text-[#0f1111] font-bold"
                          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === "bkash"}
                          onChange={() => setPaymentMethod("bkash")}
                          className="accent-pink-600"
                        />
                        <span>{isBn ? "বিকাশ / নগদ ইনস্ট্যান্ট পেমেন্ট" : "bKash / Nagad Mobile Banking"}</span>
                      </div>
                      <span className="text-[10px] bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded font-bold">Fast</span>
                    </label>

                    {/* WhatsApp Direct Option */}
                    <label
                      onClick={() => setPaymentMethod("whatsapp")}
                      className={`p-2.5 rounded-lg border flex items-center justify-between text-xs cursor-pointer transition-colors ${
                        paymentMethod === "whatsapp"
                          ? "bg-emerald-50/50 border-emerald-500 text-[#0f1111] font-bold"
                          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === "whatsapp"}
                          onChange={() => setPaymentMethod("whatsapp")}
                          className="accent-emerald-600"
                        />
                        <span>{isBn ? "হোয়াটসঅ্যাপের মাধ্যমে কনফার্ম করুন" : "Confirm via WhatsApp Chat"}</span>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">1-Click</span>
                    </label>
                  </div>
                </div>

                {/* Step 3: Order Summary */}
                <div className="space-y-1.5 pt-2 border-t border-gray-200 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>{isBn ? "আইটেম সাবটোটাল:" : "Items Total:"}</span>
                    <span>{formatTaka(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>{isBn ? "ডেলিভারি ফি:" : "Delivery Fee:"}</span>
                    <span>{deliveryFee === 0 ? <strong className="text-emerald-700">FREE</strong> : formatTaka(deliveryFee)}</span>
                  </div>

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-[#cc0c39] font-bold">
                      <span>{isBn ? "ডিসকাউন্ট কুপন:" : "Promo Discount:"}</span>
                      <span>-{formatTaka(couponDiscount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm font-black text-[#0f1111] pt-1 border-t border-gray-200">
                    <span>{isBn ? "মোট প্রদেয় টাকা:" : "Order Total:"}</span>
                    <span className="text-base text-[#b12704]">{formatTaka(grandTotal)}</span>
                  </div>
                </div>

                {/* Yellow Big Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  className="w-full py-3.5 bg-[#ffd814] hover:bg-[#f7ca00] active:bg-[#f0b800] text-[#0f1111] font-bold text-sm rounded-full border border-[#fcd200] shadow-md transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={16} />
                  <span>{isBn ? `অর্ডার নিশ্চিত করুন (${formatTaka(grandTotal)})` : `Place Your Order in BDT`}</span>
                </button>
              </div>
            ) : (
              /* Success Screen */
              <div className="p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle size={36} />
                </div>

                <div>
                  <h3 className="text-lg font-black text-[#0f1111]">
                    {isBn ? "অর্ডার সম্পন্ন হয়েছে! ধন্যবাদ।" : "Order placed, thank you!"}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {isBn ? `অর্ডার নম্বর: #${orderId}` : `Confirmation sent. Order #${orderId}`}
                  </p>
                </div>

                {/* Simulated Tracking timeline */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3 text-left text-xs">
                  <div className="font-bold text-gray-700">{isBn ? "ডেলিভারি ট্র্যাকিং স্ট্যাটাস:" : "Estimated Delivery Status:"}</div>
                  <div className="space-y-2 font-medium">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                      <span>{isBn ? "অর্ডার গ্রহণ করা হয়েছে" : "Order Placed & Confirmed"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#007185] font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#007185] animate-pulse" />
                      <span>{isBn ? "দোকানে প্যাকেজিং চলছে" : `Packing at ${settings.shopName}`}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                      <span>{isBn ? "রাইডার ডেলিভারির জন্য বের হবে" : "Out for delivery (Today, 45m)"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      resetCheckout();
                      setActiveTab("you");
                    }}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#0f1111] font-bold text-xs rounded-full border border-gray-300 cursor-pointer"
                  >
                    {isBn ? "অর্ডার ট্র্যাকিং দেখুন" : "View in Your Orders"}
                  </button>
                  <button
                    onClick={() => {
                      resetCheckout();
                      setActiveTab("home");
                    }}
                    className="flex-1 py-2.5 bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-bold text-xs rounded-full border border-[#fcd200] cursor-pointer"
                  >
                    {isBn ? "আরও কেনাকাটা" : "Continue Shopping"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 11. PWA INSTALLATION MODAL & STEP-BY-STEP VISUAL GUIDE                    */}
      {/* ========================================================================= */}
      {isPwaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-gray-200 relative">
            <button
              onClick={() => setIsPwaModalOpen(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-amber-50 text-[#f08804] rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-xs border border-amber-200">
                📲
              </div>
              <h3 className="text-base font-extrabold text-[#0f1111]">
                {isBn ? `${settings.shopName} PWA অ্যাপ ইনস্টল` : `Install ${settings.shopName} App`}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {isBn
                  ? "কাস্টমারদের হোম স্ক্রিনে সরাসরি অ্যাপের মতো ব্যবহার করতে নিচের বাটনে চাপ দিয়ে আসল ব্রাউজারে খুলুন বা নিয়ম দেখুন:"
                  : "Install as a standalone app on your mobile home screen for faster ordering:"}
              </p>
            </div>

            {/* ERP Preview Notice vs External Customer */}
            {previewMode && typeof window !== "undefined" && !window.location.search.includes("screen=storefront") && (
              <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-2.5 text-[11px] text-amber-950 flex items-start gap-2">
                <span className="text-sm flex-shrink-0 mt-0.5">💡</span>
                <p className="leading-relaxed">
                  {isBn
                    ? "আপনি বর্তমানে ERP অ্যাডমিনের ভেতর থেকে ইন-অ্যাপ প্রিভিউ দেখছেন। কাস্টমাররা আসল মোবাইল ব্রাউজারে (Chrome/Safari) যেভাবে সরাসরি অ্যাপ ইনস্টল করতে পারবে, তা টেস্ট করতে নিচের বাটনে চাপ দিন।"
                    : "You are previewing inside the ERP admin. To test the native 1-tap browser PWA install prompt as customers experience it, open in an external browser tab."}
                </p>
              </div>
            )}

            {/* Native 1-Click Install Button if Prompt Ready */}
            {(canInstallPWA || (typeof window !== "undefined" && (window as any).deferredPwaPrompt)) && (
              <button
                onClick={triggerPWAInstall}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs rounded-full flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors"
              >
                <Download size={14} />
                <span>{isBn ? "📥 এখনই স্টোর অ্যাপ ইনস্টল করুন (Install Now)" : "Install Store App Now"}</span>
              </button>
            )}

            {/* Custom Tab / In-App Browser Guidance Banner */}
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-950 space-y-1.5 shadow-2xs">
              <div className="font-extrabold text-amber-900 flex items-center gap-1.5">
                <span>📱 ফোন অ্যাপ ডাউনলোড/ইনস্টল করার উপায়:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-gray-700">
                আপনি বর্তমানে ইন-অ্যাপ প্রিভিউতে আছেন (উপরে বামে <strong>[X]</strong> দেখুন)। সরাসরি অ্যাপ ইনস্টল পেতে নিচের বাটনে চাপ দিয়ে <strong>Google Chrome</strong>-এ খুলুন অথবা উপরে ডানের <strong>৩-ডট (⋮)</strong> মেন্যু চেপে <strong>'Install app'</strong> নির্বাচন করুন।
              </p>
            </div>

            <div className="space-y-2">
              {/* Direct Launch in Real Google Chrome via Intent */}
              <button
                onClick={() => {
                  openInRealChrome();
                  setIsPwaModalOpen(false);
                }}
                className="w-full py-3 bg-[#ffd814] hover:bg-[#f7ca00] active:bg-[#f0b800] text-[#0f1111] font-black text-xs rounded-full border border-[#fcd200] flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all active:scale-98"
              >
                <ExternalLink size={15} />
                <span>{isBn ? "🚀 সরাসরি Google Chrome-এ খুলুন ও ইনস্টল করুন" : "Open in Google Chrome & Install"}</span>
              </button>

              {/* Copy Storefront Link for Customers */}
              <button
                onClick={() => {
                  const externalUrl = `${window.location.origin}/?screen=storefront`;
                  navigator.clipboard.writeText(externalUrl);
                  toast({
                    type: "success",
                    title: isBn ? "কাস্টমার লিংক কপি হয়েছে!" : "Customer Link Copied!",
                    message: externalUrl,
                  });
                }}
                className="w-full py-2.5 bg-white hover:bg-gray-50 active:bg-gray-100 text-[#0f1111] font-bold text-xs rounded-full border border-gray-300 flex items-center justify-center gap-2 shadow-2xs cursor-pointer transition-colors"
              >
                <Copy size={13} />
                <span>{isBn ? "📋 কাস্টমার শেয়ার লিংক কপি করুন" : "Copy Customer Store Link"}</span>
              </button>

              {/* Instructions for Android & iOS */}
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2 text-[11px] text-gray-700">
                <div className="font-bold text-[#0f1111]">
                  {isBn ? "📌 ব্রাউজার ৩-ডট থেকে ইনস্টল নিয়ম:" : "📌 Browser Steps:"}
                </div>
                <div className="space-y-1.5 leading-relaxed">
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-emerald-800 flex-shrink-0">Android:</span>
                    <span>উপরে ডানের ৩-ডট <strong>(⋮)</strong> মেন্যুতে চাপ দিয়ে <strong>'Install app'</strong> বা <strong>'Open in Chrome'</strong> চাপলে হোমস্ক্রিনে অ্যাপ ইনস্টল হয়ে যাবে।</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-blue-700 flex-shrink-0">iPhone:</span>
                    <span>সাফারি ব্রাউজারের নিচে শেয়ার <strong>(↑)</strong> বাটনে চাপ দিয়ে <strong>'Add to Home Screen'</strong> চাপলেই ইনস্টল হয়ে যাবে।</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsPwaModalOpen(false)}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-full cursor-pointer"
            >
              {isBn ? "ঠিক আছে, বুঝতে পেরেছি" : "Got It"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
