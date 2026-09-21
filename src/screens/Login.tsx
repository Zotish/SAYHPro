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
          <span className="font-display font-bold text-white text-xl">SAYHPro</span>
        </div>

        <div>
          <h1 className="font-display text-4xl font-bold text-white leading-tight mb-4">
            {isBn ? "Wo dukan akontabuo\nwɔ wo nsa mu." : "Your shop,\nright in your hands."}
          </h1>
          <p className="text-em-200 text-lg mb-8">
            {isBn ? "Tɔn, tɔ, aka ne MTN MoMo — biribiara wɔ faako baako." : "Sales, purchases, dues, and Mobile Money — all in one place."}
          </p>

          <div className="space-y-4">
            {[
              { emoji: "📦", text: isBn ? "Akorae Sohwɛ a Ɛyɛ Nnam" : "Smart inventory management" },
              { emoji: "💰", text: isBn ? "Aka & Bosea Nhyehyɛeɛ" : "Digital customer credit & dues" },
              { emoji: "📊", text: isBn ? "Mfasoɔ ne Nkogu Amanneɛbɔ" : "Simple profit & loss reports" },
              { emoji: "🏪", text: isBn ? "Firi provisions kɔsi wholesale — Ghana dukan nyinaa" : "For provisions to wholesale — made for Ghana retail" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm">{f.emoji}</div>
                <span className="text-em-100 text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-em-400 text-xs">© 2026 SAYHPro · Made for Ghana 🇬🇭</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
          {/* Logo mobile */}
          <div className="flex lg:hidden items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-em-700 flex items-center justify-center">
              <Building2 size={15} className="text-white" />
            </div>
            <span className="font-display font-bold text-ink">SAYHPro</span>
          </div>

          {/* Lang switcher */}
          <div className="flex justify-end mb-4">
            <button onClick={() => setLang(isBn ? "en" : "bn")}
              className="text-xs px-3 py-1.5 border border-nv-200 rounded-lg text-ink hover:border-em-400 transition-fast font-medium">
              {isBn ? "EN" : "Twi (Akan)"}
            </button>
          </div>

          {/* OTP screen */}
          {mode === "otp" && (
            <div>
              <button onClick={() => setMode("login")} className="flex items-center gap-1.5 text-ink text-sm mb-5 hover:text-ink transition-fast">
                <ChevronLeft size={14} /> {isBn ? "San Kɔ Akyi" : "Back"}
              </button>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Phone size={24} className="text-ink" />
                </div>
                <h2 className="font-display text-xl font-bold text-ink mb-1">{isBn ? "Hwɛ OTP Nɔmba No" : "Verify OTP"}</h2>
                <p className="text-ink text-sm">{isBn ? "Yɛasoma OTP akɔ 024 412 3456 so" : "OTP sent to +233 24 412 3456"}</p>
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
                {isBn ? "Hwɛ Mu & Wura Mu" : "Verify & Sign In"}
              </button>
              <p className="text-center text-xs text-ink mt-3">
                {isBn ? "Wonnyae OTP? " : "Didn't receive? "}
                <button className="text-ink font-semibold hover:underline">{isBn ? "Soma बायो Bio" : "Resend"}</button>
              </p>
            </div>
          )}

          {/* Login screen */}
          {mode === "login" && (
            <div>
              <h2 className="font-display text-2xl font-bold text-ink mb-1">{isBn ? "Akwaaba, Wura Mu" : "Welcome back"}</h2>
              <p className="text-ink text-sm mb-6">{isBn ? "Fa wo fon nɔmba wura wo dukan akawnt mu" : "Sign in to your shop account"}</p>

              {/* Method toggle */}
              <div className="flex gap-1 bg-nv-100 rounded-xl p-1 mb-5">
                {[
                  { id: "phone" as const, label: isBn ? "Fon Nɔmba" : "Phone", icon: Phone },
                  { id: "email" as const, label: isBn ? "Imele" : "Email", icon: Mail },
                ].map(m => (
                  <button key={m.id} onClick={() => setLoginMethod(m.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-fast
                      ${loginMethod === m.id ? "bg-white shadow-sm text-ink font-bold" : "text-ink hover:text-ink"}`}>
                    <m.icon size={14} />
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-ink mb-1.5">
                    {loginMethod === "phone" ? (isBn ? "Fon Nɔmba" : "Phone Number") : (isBn ? "Imele" : "Email")}
                  </label>
                  <div className="relative">
                    {loginMethod === "phone" && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink font-medium">+233</span>
                    )}
                    <input
                      type={loginMethod === "phone" ? "tel" : "email"}
                      placeholder={loginMethod === "phone" ? "24 412 3456" : "kofi@provisions.gh"}
                      className={`w-full border border-nv-200 rounded-xl py-3 text-sm focus:border-em-500 transition-fast
                        ${loginMethod === "phone" ? "pl-16 pr-3 font-mono" : "px-3"}`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink mb-1.5">{isBn ? "Ahyɛnsodeɛ (Password)" : "Password"}</label>
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
                {isBn ? "Wo werɛ afi wo password?" : "Forgot password?"}
              </button>

              <button onClick={() => setMode("otp")}
                className="w-full mt-5 py-3 bg-em-700 text-white rounded-xl font-semibold hover:bg-em-800 transition-fast flex items-center justify-center gap-2">
                {isBn ? "Wura Mu" : "Sign In"} <ArrowRight size={16} />
              </button>

              <p className="text-center text-sm text-ink mt-5">
                {isBn ? "Wonni akawnt? " : "No account? "}
                <button onClick={() => setMode("register")} className="text-ink font-semibold hover:underline">
                  {isBn ? "Kyerɛw Wo Din" : "Register"}
                </button>
              </p>
            </div>
          )}

          {/* Register screen */}
          {mode === "register" && (
            <div>
              <button onClick={() => setMode("login")} className="flex items-center gap-1.5 text-ink text-sm mb-5 hover:text-ink transition-fast">
                <ChevronLeft size={14} /> {isBn ? "San Kɔ Akyi" : "Back"}
              </button>
              <h2 className="font-display text-2xl font-bold text-ink mb-1">{isBn ? "Kyerɛw Wo Din" : "Create Account"}</h2>
              <p className="text-ink text-sm mb-5">{isBn ? "Firi ase kwa ma wo dukan a wuntua hwee" : "Start free for your retail business in Ghana"}</p>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-ink mb-1.5">{isBn ? "Dukan Din" : "Shop Name"} *</label>
                    <input type="text" placeholder={isBn ? "Kofi Provisions Mart" : "Kofi Provisions Mart"}
                      className="w-full border border-nv-200 rounded-xl px-3 py-2.5 text-sm focus:border-em-500 transition-fast" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink mb-1.5">{isBn ? "Wura Din" : "Owner Name"} *</label>
                    <input type="text" placeholder={isBn ? "Kwame Mensah" : "Kwame Mensah"}
                      className="w-full border border-nv-200 rounded-xl px-3 py-2.5 text-sm focus:border-em-500 transition-fast" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink mb-1.5">{isBn ? "Fon Nɔmba" : "Phone Number"} *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink font-medium">+233</span>
                    <input type="tel" placeholder="24 412 3456"
                      className="w-full border border-nv-200 rounded-xl pl-16 pr-3 py-2.5 text-sm focus:border-em-500 transition-fast font-mono" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink mb-1.5">{isBn ? "Ahyɛnsodeɛ (Password)" : "Password"} *</label>
                  <input type="password" placeholder="••••••••"
                    className="w-full border border-nv-200 rounded-xl px-3 py-2.5 text-sm focus:border-em-500 transition-fast" />
                </div>
              </div>

              <button onClick={() => setMode("otp")}
                className="w-full mt-5 py-3 bg-em-700 text-white rounded-xl font-semibold hover:bg-em-800 transition-fast flex items-center justify-center gap-2">
                {isBn ? "Soma OTP" : "Send OTP"} <ArrowRight size={16} />
              </button>

              <p className="text-xs text-ink text-center mt-3">
                {isBn ? "Sɛ worekyerɛw wo din a, wogye yɛn mmara to mu" : "By registering you agree to our Terms of Service"}
              </p>
            </div>
          )}

          {/* Forgot password */}
          {mode === "forgot" && (
            <div>
              <button onClick={() => setMode("login")} className="flex items-center gap-1.5 text-ink text-sm mb-5 hover:text-ink transition-fast">
                <ChevronLeft size={14} /> {isBn ? "San Kɔ Akyi" : "Back"}
              </button>
              <h2 className="font-display text-2xl font-bold text-ink mb-1">{isBn ? "Sesa Wo Password" : "Reset Password"}</h2>
              <p className="text-ink text-sm mb-6">{isBn ? "Fa wo fon nɔmba ma yɛnsoma OTP" : "Enter your phone number to reset"}</p>
              <div>
                <label className="block text-xs font-medium text-ink mb-1.5">{isBn ? "Fon Nɔmba" : "Phone Number"}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink font-medium">+233</span>
                  <input type="tel" placeholder="24 412 3456"
                    className="w-full border border-nv-200 rounded-xl pl-16 pr-3 py-3 text-sm focus:border-em-500 transition-fast font-mono" />
                </div>
              </div>
              <button onClick={() => setMode("otp")}
                className="w-full mt-5 py-3 bg-em-700 text-white rounded-xl font-semibold hover:bg-em-800 transition-fast">
                {isBn ? "Soma OTP" : "Send OTP"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
