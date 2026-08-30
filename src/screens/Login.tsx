import { useState } from "react";
import { Phone, Mail, ArrowRight, RefreshCw, Eye, EyeOff, Building2, ChevronLeft, Check } from "lucide-react";

interface LoginProps {
  lang: "en" | "bn";
  setLang: (l: "en" | "bn") => void;
  onLogin: () => void;
}

type Mode = "login" | "register" | "otp" | "forgot";

export default function Login({ lang, setLang, onLogin }: LoginProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");
  const [showPass, setShowPass] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const isBn = lang === "bn";

  const handleOtpChange = (val: string, idx: number) => {
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) {
      const el = document.getElementById(`otp-${idx + 1}`);
      el?.focus();
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#0F172A" }}>
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-em-400 flex items-center justify-center">
            <Building2 size={20} className="text-ink" />
          </div>
          <span className="font-display font-bold text-white text-xl">DukanPro</span>
        </div>

        <div>
          <h1 className="font-display text-4xl font-bold text-white leading-tight mb-4">
            {isBn ? "আপনার দোকান\nএখন আপনার হাতে।" : "Your shop,\nright in your hands."}
          </h1>
          <p className="text-em-200 text-lg mb-8">
            {isBn ? "বিক্রয়, ক্রয়, বাকির হিসাব — সব এক জায়গায়।" : "Sales, purchases, dues — all in one place."}
          </p>

          <div className="space-y-4">
            {[
              { emoji: "📦", text: isBn ? "স্মার্ট ইনভেন্টরি ম্যানেজমেন্ট" : "Smart inventory management" },
              { emoji: "💰", text: isBn ? "বাকির খাতা ডিজিটাল" : "Digital credit ledger (বাকির খাতা)" },
              { emoji: "📊", text: isBn ? "লাভ-ক্ষতির সহজ রিপোর্ট" : "Simple profit & loss reports" },
              { emoji: "🏪", text: isBn ? "মুদি থেকে পাইকারি — সব ধরনের ব্যবসার জন্য" : "For grocery to wholesale — all retail types" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm">{f.emoji}</div>
                <span className="text-em-100 text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-em-400 text-xs">© 2024 DukanPro · Made for Bangladesh 🇧🇩</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
          {/* Logo mobile */}
          <div className="flex lg:hidden items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-em-700 flex items-center justify-center">
              <Building2 size={15} className="text-white" />
            </div>
            <span className="font-display font-bold text-ink">DukanPro</span>
          </div>

          {/* Lang switcher */}
          <div className="flex justify-end mb-4">
            <button onClick={() => setLang(isBn ? "en" : "bn")}
              className="text-xs px-3 py-1.5 border border-nv-200 rounded-lg text-ink hover:border-em-400 transition-fast">
              {isBn ? "EN" : "বাংলা"}
            </button>
          </div>

          {/* OTP screen */}
          {mode === "otp" && (
            <div>
              <button onClick={() => setMode("login")} className="flex items-center gap-1.5 text-ink text-sm mb-5 hover:text-ink transition-fast">
                <ChevronLeft size={14} /> {isBn ? "ফিরে যান" : "Back"}
              </button>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Phone size={24} className="text-ink" />
                </div>
                <h2 className="font-display text-xl font-bold text-ink mb-1">{isBn ? "OTP যাচাই করুন" : "Verify OTP"}</h2>
                <p className="text-ink text-sm">{isBn ? "01712-345678 নম্বরে OTP পাঠানো হয়েছে" : "OTP sent to 01712-345678"}</p>
              </div>
              <div className="flex gap-2 justify-center mb-6">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    maxLength={1}
                    value={d}
                    onChange={e => handleOtpChange(e.target.value, i)}
                    className="num w-11 h-12 text-center text-xl font-bold border-2 border-nv-200 rounded-xl focus:border-em-500 focus:bg-em-50 transition-fast"
                  />
                ))}
              </div>
              <button onClick={onLogin}
                className="w-full py-3 bg-em-700 text-white rounded-xl font-semibold hover:bg-em-800 transition-fast">
                {isBn ? "যাচাই করুন ও লগইন করুন" : "Verify & Login"}
              </button>
              <p className="text-center text-xs text-ink mt-3">
                {isBn ? "OTP পাননি? " : "Didn't receive? "}
                <button className="text-ink font-semibold hover:underline">{isBn ? "পুনরায় পাঠান" : "Resend"}</button>
              </p>
            </div>
          )}

          {/* Login screen */}
          {mode === "login" && (
            <div>
              <h2 className="font-display text-2xl font-bold text-ink mb-1">{isBn ? "লগইন করুন" : "Welcome back"}</h2>
              <p className="text-ink text-sm mb-6">{isBn ? "আপনার অ্যাকাউন্টে প্রবেশ করুন" : "Sign in to your account"}</p>

              {/* Method toggle */}
              <div className="flex gap-1 bg-nv-100 rounded-xl p-1 mb-5">
                {[
                  { id: "phone" as const, label: isBn ? "ফোন নম্বর" : "Phone", icon: Phone },
                  { id: "email" as const, label: isBn ? "ইমেইল" : "Email", icon: Mail },
                ].map(m => (
                  <button key={m.id} onClick={() => setLoginMethod(m.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-fast
                      ${loginMethod === m.id ? "bg-white shadow-sm text-ink" : "text-ink hover:text-ink"}`}>
                    <m.icon size={14} />
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-ink mb-1.5">
                    {loginMethod === "phone" ? (isBn ? "ফোন নম্বর" : "Phone Number") : (isBn ? "ইমেইল" : "Email")}
                  </label>
                  <div className="relative">
                    {loginMethod === "phone" && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink font-medium">+880</span>
                    )}
                    <input
                      type={loginMethod === "phone" ? "tel" : "email"}
                      placeholder={loginMethod === "phone" ? "1712-345678" : "example@email.com"}
                      className={`w-full border border-nv-200 rounded-xl py-3 text-sm focus:border-em-500 transition-fast
                        ${loginMethod === "phone" ? "pl-14 pr-3" : "px-3"}`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink mb-1.5">{isBn ? "পাসওয়ার্ড" : "Password"}</label>
                  <div className="relative">
                    <input type={showPass ? "text" : "password"} placeholder="••••••••"
                      className="w-full border border-nv-200 rounded-xl px-3 py-3 pr-10 text-sm focus:border-em-500 transition-fast" />
                    <button onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink hover:text-ink transition-fast">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              <button onClick={() => setMode("forgot")} className="text-xs text-ink hover:underline mt-2 block text-right">
                {isBn ? "পাসওয়ার্ড ভুলে গেছেন?" : "Forgot password?"}
              </button>

              <button onClick={() => setMode("otp")}
                className="w-full mt-5 py-3 bg-em-700 text-white rounded-xl font-semibold hover:bg-em-800 transition-fast flex items-center justify-center gap-2">
                {isBn ? "লগইন করুন" : "Sign In"} <ArrowRight size={16} />
              </button>

              <p className="text-center text-sm text-ink mt-5">
                {isBn ? "অ্যাকাউন্ট নেই? " : "No account? "}
                <button onClick={() => setMode("register")} className="text-ink font-semibold hover:underline">
                  {isBn ? "নিবন্ধন করুন" : "Register"}
                </button>
              </p>
            </div>
          )}

          {/* Register screen */}
          {mode === "register" && (
            <div>
              <button onClick={() => setMode("login")} className="flex items-center gap-1.5 text-ink text-sm mb-5 hover:text-ink transition-fast">
                <ChevronLeft size={14} /> {isBn ? "ফিরে যান" : "Back"}
              </button>
              <h2 className="font-display text-2xl font-bold text-ink mb-1">{isBn ? "নিবন্ধন করুন" : "Create Account"}</h2>
              <p className="text-ink text-sm mb-5">{isBn ? "আপনার দোকানের জন্য বিনামূল্যে শুরু করুন" : "Start free for your shop"}</p>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-ink mb-1.5">{isBn ? "দোকানের নাম" : "Shop Name"} *</label>
                    <input type="text" placeholder={isBn ? "রহিম স্টোর" : "My Shop"}
                      className="w-full border border-nv-200 rounded-xl px-3 py-2.5 text-sm focus:border-em-500 transition-fast" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink mb-1.5">{isBn ? "মালিকের নাম" : "Owner Name"} *</label>
                    <input type="text" placeholder={isBn ? "রহিম মিয়া" : "Your Name"}
                      className="w-full border border-nv-200 rounded-xl px-3 py-2.5 text-sm focus:border-em-500 transition-fast" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink mb-1.5">{isBn ? "ফোন নম্বর" : "Phone Number"} *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink">+880</span>
                    <input type="tel" placeholder="1712-345678"
                      className="w-full border border-nv-200 rounded-xl pl-14 pr-3 py-2.5 text-sm focus:border-em-500 transition-fast" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink mb-1.5">{isBn ? "পাসওয়ার্ড" : "Password"} *</label>
                  <input type="password" placeholder="••••••••"
                    className="w-full border border-nv-200 rounded-xl px-3 py-2.5 text-sm focus:border-em-500 transition-fast" />
                </div>
              </div>

              <button onClick={() => setMode("otp")}
                className="w-full mt-5 py-3 bg-em-700 text-white rounded-xl font-semibold hover:bg-em-800 transition-fast flex items-center justify-center gap-2">
                {isBn ? "OTP পাঠান" : "Send OTP"} <ArrowRight size={16} />
              </button>

              <p className="text-xs text-ink text-center mt-3">
                {isBn ? "নিবন্ধন করে আপনি আমাদের শর্তাবলীতে সম্মত" : "By registering you agree to our Terms"}
              </p>
            </div>
          )}

          {/* Forgot password */}
          {mode === "forgot" && (
            <div>
              <button onClick={() => setMode("login")} className="flex items-center gap-1.5 text-ink text-sm mb-5 hover:text-ink transition-fast">
                <ChevronLeft size={14} /> {isBn ? "ফিরে যান" : "Back"}
              </button>
              <h2 className="font-display text-2xl font-bold text-ink mb-1">{isBn ? "পাসওয়ার্ড রিসেট" : "Reset Password"}</h2>
              <p className="text-ink text-sm mb-6">{isBn ? "আপনার ফোন নম্বর দিন" : "Enter your phone number to reset"}</p>
              <div>
                <label className="block text-xs font-medium text-ink mb-1.5">{isBn ? "ফোন নম্বর" : "Phone Number"}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink">+880</span>
                  <input type="tel" placeholder="1712-345678"
                    className="w-full border border-nv-200 rounded-xl pl-14 pr-3 py-3 text-sm focus:border-em-500 transition-fast" />
                </div>
              </div>
              <button onClick={() => setMode("otp")}
                className="w-full mt-5 py-3 bg-em-700 text-white rounded-xl font-semibold hover:bg-em-800 transition-fast">
                {isBn ? "OTP পাঠান" : "Send OTP"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
