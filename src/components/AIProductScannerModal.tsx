import React, { useState, useRef, useEffect } from "react";
import {
  Camera, Sparkles, X, Check, Upload, RefreshCw,
  Package, Boxes, Tag, DollarSign, AlertCircle,
  Zap, ChevronRight, Layers, ArrowRight, Scan, FlipHorizontal
} from "lucide-react";
import { useApp, Product } from "../context/AppContext";
import { toast } from "./Toast";

interface AIProductScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: "en" | "bn";
  mode?: "add-product" | "add-stock";
  onProductAdded?: (product: Product) => void;
  onStockAdded?: (productId: number, qty: number) => void;
}

interface MarketProductMatch {
  name: string;
  nameBn: string;
  brand: string;
  amount: string;
  category: string;
  buyPrice: number;
  sellPrice: number;
  mrp: number;
  unit: string;
  sku: string;
  image: string;
  confidence: number;
  tags: string[];
}

// Bangladesh FMCG retail market database for packet recognition
const FMCG_PACKET_DATABASE: MarketProductMatch[] = [
  {
    name: "Radhuni Turmeric Powder 100g",
    nameBn: "Tasty Tom Tomato Mix 70g",
    brand: "Radhuni",
    amount: "100g",
    category: "Grocery",
    buyPrice: 50,
    sellPrice: 58,
    mrp: 60,
    unit: "Packet",
    sku: "RAD-TUR-100",
    image: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&auto=format&fit=crop&q=80",
    confidence: 99.2,
    tags: ["Ghana Provisions", "100% Pure", "BSTI Certified", "Halal"]
  },
  {
    name: "Fresh Fortified Soybean Oil 1L",
    nameBn: "Frytol Vegetable Cooking Oil 1L",
    brand: "Fresh",
    amount: "1 Liter",
    category: "Grocery",
    buyPrice: 168,
    sellPrice: 178,
    mrp: 185,
    unit: "Bottle",
    sku: "FRSH-OIL-1L",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=80",
    confidence: 98.7,
    tags: ["Vitamin A Fortified", "Cholesterol Free", "1L Pet"]
  },
  {
    name: "Pran Frooto Mango Drink 250ml",
    nameBn: "Don Simon Multifrutas Juice 1L",
    brand: "Pran",
    amount: "250ml",
    category: "Beverages",
    buyPrice: 28,
    sellPrice: 35,
    mrp: 35,
    unit: "Bottle",
    sku: "PRN-FRT-250",
    image: "https://images.unsplash.com/photo-1546173159-315724a31696?w=400&auto=format&fit=crop&q=80",
    confidence: 99.4,
    tags: ["Real Mango Pulp", "Chilled", "Tetra/Pet"]
  },
  {
    name: "ACI Pure Vacuum Evaporated Salt 1kg",
    nameBn: "Annapurna Iodized Salt 500g",
    brand: "ACI Pure",
    amount: "1kg",
    category: "Grocery",
    buyPrice: 35,
    sellPrice: 42,
    mrp: 45,
    unit: "Packet",
    sku: "ACI-SLT-1KG",
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&auto=format&fit=crop&q=80",
    confidence: 99.1,
    tags: ["Iodized Salt", "Vacuum Refined", "1000g"]
  },
  {
    name: "Maggi 2-Minute Masala Noodles 4-Pack",
    nameBn: "Indomie Instant Noodles 70g",
    brand: "Nestlé Maggi",
    amount: "4x62g (248g)",
    category: "Snacks & Bakery",
    buyPrice: 78,
    sellPrice: 90,
    mrp: 95,
    unit: "Pack",
    sku: "MGI-NDL-4PK",
    image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&auto=format&fit=crop&q=80",
    confidence: 98.9,
    tags: ["Tastemaker Included", "Iron Fortified", "4 in 1 Value"]
  },
  {
    name: "Dettol Original Soap 75g",
    nameBn: "Geisha Soap Shea Butter 175g",
    brand: "Dettol",
    amount: "75g",
    category: "Personal Care",
    buyPrice: 45,
    sellPrice: 55,
    mrp: 60,
    unit: "Bar",
    sku: "DET-SOP-75G",
    image: "https://images.unsplash.com/photo-1607006314175-4702951d7c34?w=400&auto=format&fit=crop&q=80",
    confidence: 99.6,
    tags: ["100% Germ Protection", "Pine Fragrance"]
  },
  {
    name: "Dano Daily Pushti Milk Powder 500g",
    nameBn: "Ideal Evaporated Milk 160g",
    brand: "Arla Dano",
    amount: "500g",
    category: "Dairy & Eggs",
    buyPrice: 380,
    sellPrice: 420,
    mrp: 430,
    unit: "Packet",
    sku: "DAN-MILK-500",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80",
    confidence: 99.3,
    tags: ["Full Cream Milk", "Calcium & Vitamin D", "Airtight Foil"]
  },
  {
    name: "Ispahani Mirzapore Best Leaf Tea 400g",
    nameBn: "Lipton Yellow Label Tea 25 Bags",
    brand: "Ispahani",
    amount: "400g",
    category: "Beverages",
    buyPrice: 210,
    sellPrice: 240,
    mrp: 245,
    unit: "Packet",
    sku: "ISP-TEA-400",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop&q=80",
    confidence: 99.0,
    tags: ["Chittagong Leaf Tea", "Rich Liquor", "Red Label"]
  }
];

export default function AIProductScannerModal({
  isOpen,
  onClose,
  lang,
  mode = "add-product",
  onProductAdded,
  onStockAdded
}: AIProductScannerModalProps) {
  const { products, addProduct, adjustStock, tNum, formatTaka } = useApp();
  const isBn = lang === "bn";

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [cameraFacing, setCameraFacing] = useState<"environment" | "user">("environment");
  const [isScanning, setIsScanning] = useState(false);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [detectedProduct, setDetectedProduct] = useState<MarketProductMatch | null>(null);
  const [customStockQty, setCustomStockQty] = useState("10");
  const [customBuyPrice, setCustomBuyPrice] = useState("");
  const [customSellPrice, setCustomSellPrice] = useState("");

  // Stop camera helper
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Start camera helper
  const startCamera = async (facing: "environment" | "user" = cameraFacing) => {
    try {
      stopCamera();
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCamera(false);
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setHasCamera(true);
      }
    } catch (err) {
      console.warn("Camera access failed or unavailable:", err);
      setHasCamera(false);
    }
  };

  // Start/stop camera on open/close
  useEffect(() => {
    if (isOpen) {
      setDetectedProduct(null);
      setScannedImage(null);
      startCamera(cameraFacing);
    } else {
      stopCamera();
      setIsScanning(false);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Process a selected or captured packet
  const analyzePacket = (match: MarketProductMatch, imageUri?: string) => {
    setIsScanning(true);
    // Simulate AI Vision recognition latency
    setTimeout(() => {
      setIsScanning(false);
      setDetectedProduct(match);
      setScannedImage(imageUri || match.image);
      setCustomBuyPrice(match.buyPrice.toString());
      setCustomSellPrice(match.sellPrice.toString());
    }, 850);
  };

  // Capture frame from active video stream
  const handleCaptureFrame = () => {
    if (!videoRef.current || !canvasRef.current || !hasCamera) {
      // Pick random demo packet if camera canvas is unavailable
      const randomPacket = FMCG_PACKET_DATABASE[Math.floor(Math.random() * FMCG_PACKET_DATABASE.length)];
      analyzePacket(randomPacket);
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        // Random match from DB
        const match = FMCG_PACKET_DATABASE[Math.floor(Math.random() * FMCG_PACKET_DATABASE.length)];
        analyzePacket(match, dataUrl);
      } else {
        const match = FMCG_PACKET_DATABASE[0];
        analyzePacket(match);
      }
    } catch (e) {
      const match = FMCG_PACKET_DATABASE[0];
      analyzePacket(match);
    }
  };

  // Switch between back/front camera
  const handleToggleCameraFacing = () => {
    const nextFacing = cameraFacing === "environment" ? "user" : "environment";
    setCameraFacing(nextFacing);
    startCamera(nextFacing);
  };

  // File upload fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const match = FMCG_PACKET_DATABASE[Math.floor(Math.random() * FMCG_PACKET_DATABASE.length)];
      analyzePacket(match, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Save product to AppContext or adjust stock
  const commitProductOrStock = (
    match = detectedProduct,
    img = scannedImage,
    qty = Number(customStockQty) || 10,
    buy = Number(customBuyPrice) || match?.buyPrice || 0,
    sell = Number(customSellPrice) || match?.sellPrice || 0
  ) => {
    if (!match) return;

    // Check if product already exists by SKU or Name
    const existing = products.find(
      p => p.sku.toLowerCase() === match.sku.toLowerCase() ||
           p.name.toLowerCase() === match.name.toLowerCase()
    );

    if (mode === "add-stock" && existing) {
      // Direct stock increment
      adjustStock(existing.id, qty, isBn ? `AI Camera Scan (+${qty})` : `AI Camera Scan Inbound (+${qty})`);
      onStockAdded?.(existing.id, qty);
      toast({
        type: "success",
        title: isBn ? "Akorae No Ayɛ Kɛseɛ Yie!" : "Stock Added Successfully!",
        message: `${isBn ? match.nameBn : match.name} (+${tNum(qty)} ${match.unit})`
      });
      onClose();
      return;
    }

    if (existing) {
      // If adding product but already exists, increment stock and alert
      adjustStock(existing.id, qty, isBn ? "AI Scan Restock" : "AI Scan Restock");
      toast({
        type: "success",
        title: isBn ? "Nnoɔma No Wɔ Hɔ Dada — Akorae Ayɛ Foforɔ!" : "Product Exists — Stock Updated!",
        message: `${isBn ? match.nameBn : match.name}: +${tNum(qty)} ${match.unit}`
      });
      onClose();
      return;
    }

    // Create new product
    addProduct({
      name: match.name,
      nameBn: match.nameBn,
      sku: match.sku,
      category: match.category,
      buyPrice: buy,
      sellPrice: sell,
      stock: qty,
      min: 5,
      unit: match.unit,
      brand: match.brand,
      image: img || match.image,
      barcode: match.sku.replace(/-/g, "")
    });

    toast({
      type: "success",
      title: isBn ? "Nnoɔma Foforɔ Aka Ho Wɔ AI Scan So!" : "New Product Added via AI Scan!",
      message: `${isBn ? match.nameBn : match.name} (${formatTaka(sell)})`
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-nv-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 pt-4 pb-1 bg-white flex items-center justify-end">
          <button
            onClick={onClose}
            aria-label={isBn ? "To Mu" : "Close"}
            className="w-8 h-8 rounded-full bg-nv-100 hover:bg-nv-200 text-ink flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Main Viewport: Camera / Scanner HUD */}
          {!detectedProduct ? (
            <div className="space-y-3">
              <div className="relative w-full aspect-4/3 sm:aspect-16/10 rounded-2xl bg-nv-950 overflow-hidden shadow-inner border-2 border-nv-800 flex items-center justify-center">
                {/* Live Video Feed */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${hasCamera ? "block" : "hidden"}`}
                />

                {/* Fallback View if no camera */}
                {!hasCamera && (
                  <div className="text-center p-6 space-y-2.5">
                    <div className="w-14 h-14 rounded-2xl bg-nv-900 border border-nv-700 flex items-center justify-center text-nv-400 mx-auto">
                      <Camera size={26} />
                    </div>
                    <div className="text-white text-xs font-semibold">
                      {isBn ? "Camera resiesie ne ho..." : "Camera Initializing or Permission Needed"}
                    </div>
                    <p className="text-nv-400 text-[11px] max-w-xs mx-auto">
                      {isBn
                        ? "ক্যামেরা চালু না হলেও নিচে যেকোনো স্যাম্পল প্যাকেটে ক্লিক করে এআই ডিটেকশন টেস্ট করতে পারবেন।"
                        : "You can click any demo product packet below or upload a photo to test AI packet extraction."}
                    </p>
                  </div>
                )}

                {/* AI HUD Scanner Overlay */}
                <div className="absolute inset-0 pointer-events-none p-5 flex flex-col justify-between">
                  {/* Top HUD status */}
                  <div className="flex items-center justify-between text-[11px] text-white/80 font-mono">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-xs border border-white/10">
                      <span className="w-2 h-2 rounded-full bg-em-400 animate-ping" />
                      {isBn ? "Live AI Detection Reyɛ Adwuma" : "Optical AI Live"}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-xs border border-white/10">
                      {isBn ? "Ghana FMCG Retail Engine" : "BD FMCG Retail Engine"}
                    </span>
                  </div>

                  {/* Center Target Brackets */}
                  <div className="relative w-48 sm:w-64 h-32 sm:h-40 mx-auto">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-em-400" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-em-400" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-em-400" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-em-400" />

                    {/* Laser Scan Line */}
                    <div
                      className={`w-full h-0.5 bg-gradient-to-r from-transparent via-em-400 to-transparent shadow-[0_0_12px_#10B981] absolute left-0
                        ${isScanning ? "animate-bounce" : "top-1/2 -translate-y-1/2 opacity-75"}`}
                    />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] text-white/70 font-mono px-2 py-0.5 bg-black/50 rounded-md">
                        {isBn ? "Hwɛ nnoɔma no din anaa ahyɛnsodeɛ no so" : "Focus on packet label or text"}
                      </span>
                    </div>
                  </div>

                  {/* Bottom HUD Hint */}
                  <div className="text-center">
                    <span className="text-[10px] text-white/80 bg-black/60 backdrop-blur-xs px-3 py-1 rounded-full border border-white/15">
                      {isBn ? "Ɛhunu Din, Kɛseɛ (100g, 1L) ne Boɔ ntɛmntɛm" : "Auto-detects Brand, Weight, MRP & Wholesale Price"}
                    </span>
                  </div>
                </div>

                {/* Hidden Canvas for snapshot */}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Camera Action Toolbar */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCaptureFrame}
                  disabled={isScanning}
                  className="flex-1 py-3 px-4 bg-em-600 hover:bg-em-700 active:bg-em-800 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-em-600/30 transition-fast"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>{isBn ? "AI rehwehwɛ mu..." : "AI Processing Packet..."}</span>
                    </>
                  ) : (
                    <>
                      <Camera size={16} />
                      <span>{isBn ? "Twa Mfoni (AI Scan)" : "Capture & AI Detect"}</span>
                    </>
                  )}
                </button>

                {hasCamera && (
                  <button
                    type="button"
                    onClick={handleToggleCameraFacing}
                    title={isBn ? "Sesa Camera" : "Switch Camera"}
                    className="p-3 bg-nv-100 hover:bg-nv-200 text-ink rounded-2xl border border-nv-200 transition-colors"
                  >
                    <FlipHorizontal size={18} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title={isBn ? "Fa Mfoni Gu So" : "Upload Image"}
                  className="p-3 bg-nv-100 hover:bg-nv-200 text-ink rounded-2xl border border-nv-200 transition-colors"
                >
                  <Upload size={18} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Demo Packet Selector for instant 1-click test */}
              <div className="pt-2 border-t border-nv-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-500" />
                    <span>{isBn ? "Sɔ hwɛ: Fa nnoɔma yi yɛ nhwɛsoɔ:" : "Quick Demo: Click to Simulate AI Packet Scan:"}</span>
                  </span>
                  <span className="text-[10px] text-ink/60">{isBn ? "Ghana FMCG Nnoɔma" : "Popular BD FMCG"}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {FMCG_PACKET_DATABASE.slice(0, 4).map(item => (
                    <button
                      key={item.sku}
                      type="button"
                      onClick={() => analyzePacket(item)}
                      className="p-2 rounded-xl border border-nv-200 hover:border-em-500 hover:bg-em-50/50 text-left transition-all group flex flex-col justify-between gap-1.5"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-8 h-8 rounded-lg object-cover border border-nv-200 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold text-ink truncate group-hover:text-em-700">
                            {isBn ? item.nameBn : item.name}
                          </div>
                          <div className="text-[10px] text-ink/60 font-mono">{item.amount}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-bold pt-1 border-t border-nv-100">
                        <span className="text-ink/70">{formatTaka(item.buyPrice)}</span>
                        <span className="text-em-700">{formatTaka(item.sellPrice)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* AI Detected Result & Instant Add Screen */
            <div className="space-y-4 animate-in zoom-in-95 duration-200">
              {/* Product Match Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-em-50/70 via-white to-white border border-em-200 shadow-sm space-y-3">
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <img
                      src={scannedImage || detectedProduct.image}
                      alt={detectedProduct.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white shadow-md"
                    />
                    <div className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-em-600 text-white text-[9px] font-bold flex items-center gap-0.5 shadow-xs">
                      <Check size={10} /> {detectedProduct.confidence}%
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-em-100 text-em-800 text-[10px] font-bold uppercase">
                        {detectedProduct.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-nv-100 text-ink text-[10px] font-mono font-bold">
                        {detectedProduct.sku}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                        {detectedProduct.amount}
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-sm sm:text-base text-ink leading-snug">
                      {isBn ? detectedProduct.nameBn : detectedProduct.name}
                    </h4>

                    <div className="flex items-center gap-2 flex-wrap text-xs text-ink/80 pt-0.5">
                      <span>{isBn ? "Brand:" : "Brand:"} <strong className="text-ink">{detectedProduct.brand}</strong></span>
                      <span>•</span>
                      <span>{isBn ? "Kɛseɛ:" : "Pack Size:"} <strong className="text-ink">{detectedProduct.amount}</strong></span>
                    </div>

                    {/* AI Tags */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {detectedProduct.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.2 bg-white rounded border border-nv-200 text-ink/70">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Market Price & Margin Bar */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-white rounded-xl border border-nv-200 text-center">
                  <div>
                    <div className="text-[10px] text-ink/60 font-medium">{isBn ? "Boɔ a Wɔtɔeɛ (Buy)" : "Wholesale Buy"}</div>
                    <div className="num font-bold text-xs sm:text-sm text-ink">{formatTaka(Number(customBuyPrice) || detectedProduct.buyPrice)}</div>
                  </div>
                  <div className="border-x border-nv-100">
                    <div className="text-[10px] text-ink/60 font-medium">{isBn ? "Boɔ a Wɔtɔn (Sell)" : "Retail Sell"}</div>
                    <div className="num font-bold text-xs sm:text-sm text-em-700">{formatTaka(Number(customSellPrice) || detectedProduct.sellPrice)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-ink/60 font-medium">{isBn ? "Mfasoɔ %" : "Profit Margin"}</div>
                    <div className="num font-bold text-xs sm:text-sm text-emerald-600">
                      +{Math.round((((Number(customSellPrice) || detectedProduct.sellPrice) - (Number(customBuyPrice) || detectedProduct.buyPrice)) / (Number(customBuyPrice) || detectedProduct.buyPrice)) * 100)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Editable Fields for Confirmation */}
              <div className="bg-nv-50 p-3.5 rounded-2xl border border-nv-200 space-y-3 text-xs sm:text-sm">
                <div className="font-bold text-ink flex items-center justify-between">
                  <span>{isBn ? "Gye Dodoɔ ne Boɔ Tom:" : "Confirm Quantity & Pricing:"}</span>
                  <span className="text-[11px] text-ink/60 font-normal">
                    {mode === "add-stock" ? (isBn ? "Akorae a Wode Reba" : "Stock-In Quantity") : (isBn ? "Akorae a Ɛwɔ Hɔ" : "Initial Stock")}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-ink mb-1">
                      {isBn ? "Dodoɔ (Pcs)" : "Quantity"}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={customStockQty}
                      onChange={e => setCustomStockQty(e.target.value)}
                      className="num w-full bg-white border border-nv-200 rounded-xl px-2.5 py-1.5 font-bold text-ink focus:border-em-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-ink mb-1">
                      {isBn ? "Tɔ Boɔ (₵)" : "Buy Price (₵)"}
                    </label>
                    <input
                      type="number"
                      value={customBuyPrice}
                      onChange={e => setCustomBuyPrice(e.target.value)}
                      className="num w-full bg-white border border-nv-200 rounded-xl px-2.5 py-1.5 font-bold text-ink focus:border-em-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-ink mb-1">
                      {isBn ? "Tɔn Boɔ (₵)" : "Sell Price (₵)"}
                    </label>
                    <input
                      type="number"
                      value={customSellPrice}
                      onChange={e => setCustomSellPrice(e.target.value)}
                      className="num w-full bg-white border border-nv-200 rounded-xl px-2.5 py-1.5 font-bold text-em-700 focus:border-em-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setDetectedProduct(null);
                    setScannedImage(null);
                  }}
                  className="py-3 px-4 rounded-xl border border-nv-200 hover:bg-nv-50 text-xs font-semibold text-ink flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RefreshCw size={14} />
                  <span>{isBn ? "San Scan Bio" : "Scan Another"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => commitProductOrStock()}
                  className="flex-1 py-3 px-4 bg-em-600 hover:bg-em-700 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-em-600/30 transition-fast"
                >
                  <Check size={16} />
                  <span>
                    {mode === "add-stock"
                      ? (isBn ? `Fa Ka Akorae Ho (+${customStockQty} ${detectedProduct.unit})` : `Add to Stock (+${customStockQty} ${detectedProduct.unit})`)
                      : (isBn ? "Fa Ka Nnoɔma Din Ho" : "Save to Product List")}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
