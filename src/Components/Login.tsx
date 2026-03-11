import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { HiEye, HiEyeOff, HiMail, HiLockClosed, HiX } from "react-icons/hi";
import { BsShopWindow } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000/api";

const Login = ({ onClose, onSwitchToSignUp }: { onClose: () => void; onSwitchToSignUp: () => void }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [focused, setFocused] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [entering, setEntering] = useState(false); // splash screen
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const inputStyle = (field: string) => ({
    borderColor: errors[field] ? "#ef4444" : focused === field ? "#E87722" : "rgba(255,255,255,0.08)",
    backgroundColor: errors[field] ? "rgba(239,68,68,0.05)" : focused === field ? "rgba(232,119,34,0.05)" : "rgba(255,255,255,0.03)",
    boxShadow: errors[field] ? "0 0 0 3px rgba(239,68,68,0.1)" : focused === field ? "0 0 0 3px rgba(232,119,34,0.1)" : "none",
  });

  const iconColor = (field: string) => ({
    color: errors[field] ? "#ef4444" : focused === field ? "#E87722" : "#4b5563",
  });

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.password) newErrors.password = "Password is required";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch(`${API_URL}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const fieldErrors: Record<string, string> = {};
        for (const key in data) {
          fieldErrors[key] = Array.isArray(data[key]) ? data[key][0] : data[key];
        }
        // Django returns non_field_errors for wrong credentials
        if (data.non_field_errors) {
          fieldErrors.general = data.non_field_errors[0];
        }
        setErrors(fieldErrors);
        setLoading(false);
        return;
      }

      // Store tokens
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));

      setLoading(false);

      // Show splash screen then navigate
      setEntering(true);
      setTimeout(() => {
        navigate("/seller");
        onClose();
      }, 2800);

    } catch {
      setErrors({ general: "Network error. Please try again." });
      setLoading(false);
    }
  };

  // ── Splash / Entering Screen ─────────────────────────────────
  if (entering) {
    return (
      <div className="fixed inset-0 z-[200] bg-[#0a0500] flex flex-col items-center justify-center overflow-hidden">

        {/* Animated grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(244,194,31,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(244,194,31,0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Outer ring */}
        <div className="absolute h-[500px] w-[500px] rounded-full border border-[#E87722]/10 animate-spin" style={{ animationDuration: "12s" }} />
        <div className="absolute h-[380px] w-[380px] rounded-full border border-[#F4C21F]/10 animate-spin" style={{ animationDuration: "8s", animationDirection: "reverse" }} />
        <div className="absolute h-[260px] w-[260px] rounded-full border border-[#E87722]/15 animate-spin" style={{ animationDuration: "5s" }} />

        {/* Glowing orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 bg-[#E87722] opacity-10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-48 bg-[#F4C21F] opacity-5 rounded-full blur-2xl" />

        {/* Orbiting dot */}
        <div className="absolute h-[380px] w-[380px] animate-spin" style={{ animationDuration: "3s" }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 bg-[#E87722] rounded-full shadow-lg shadow-[#E87722]/50" />
        </div>
        <div className="absolute h-[260px] w-[260px] animate-spin" style={{ animationDuration: "2s", animationDirection: "reverse" }}>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 h-2 w-2 bg-[#F4C21F] rounded-full shadow-lg shadow-[#F4C21F]/50" />
        </div>

        {/* Center content */}
        <div className="relative flex flex-col items-center gap-8 z-10">

          {/* Logo */}
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-r from-[#E87722]/20 to-[#F4C21F]/20 rounded-3xl blur-xl animate-pulse" />
            <img
              src="./src/Pictures/bazario-logo.png"
              alt="Bazario"
              className="relative h-16 w-auto brightness-200"
              style={{ filter: "brightness(2) drop-shadow(0 0 20px rgba(232,119,34,0.6))" }}
            />
          </div>

          {/* Text */}
          <div className="flex flex-col items-center gap-2 text-center">
            <h2 className="text-2xl font-black text-white">
              Entering your{" "}
              <span className="bg-gradient-to-r from-[#E87722] to-[#F4C21F] bg-clip-text text-transparent">
                Dashboard
              </span>
            </h2>
            <p className="text-gray-500 text-sm">Setting up your workspace...</p>
          </div>

          {/* Loading bar */}
          <div className="w-64 flex flex-col gap-3">
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#E87722] to-[#F4C21F]"
                style={{ animation: "fillBar 2.6s ease-out forwards" }}
              />
            </div>

            {/* Steps */}
            <div className="flex flex-col gap-1.5">
              {[
                { label: "Authenticating...", delay: "0s" },
                { label: "Loading your stores...", delay: "0.8s" },
                { label: "Preparing dashboard...", delay: "1.6s" },
              ].map((step) => (
                <div
                  key={step.label}
                  className="flex items-center gap-2 opacity-0"
                  style={{ animation: `fadeIn 0.4s ease forwards ${step.delay}` }}
                >
                  <div className="h-1 w-1 rounded-full bg-[#E87722]" />
                  <span className="text-xs text-gray-500">{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          @keyframes fillBar {
            from { width: 0% }
            to   { width: 100% }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateX(-8px) }
            to   { opacity: 1; transform: translateX(0) }
          }
        `}</style>
      </div>
    );
  }

  // ── Login Form ───────────────────────────────────────────────
  return (
    <div className="relative w-full max-w-md z-10">

      <div className="absolute -inset-4 rounded-3xl border border-[#E87722]/10 rotate-1 pointer-events-none" />
      <div className="absolute -inset-8 rounded-3xl border border-[#F4C21F]/5 -rotate-1 pointer-events-none" />

      <div className="bg-[#0d0601] border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50 backdrop-blur-sm relative">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-gray-500 hover:text-white transition-all duration-200 cursor-pointer bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/20 rounded-xl p-2"
        >
          <HiX className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="relative group">
            <div className="absolute -inset-3 bg-gradient-to-r from-[#E87722]/30 to-[#F4C21F]/30 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-2 bg-gradient-to-r from-[#E87722] to-[#F4C21F] p-3 rounded-2xl shadow-lg shadow-[#E87722]/30">
              <BsShopWindow className="h-7 w-7 text-white" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="flex items-center gap-2">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#E87722]" />
              <span className="text-xs font-bold tracking-[0.3em] text-[#E87722] uppercase">Welcome Back</span>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#E87722]" />
            </div>
            <h1 className="text-3xl font-black text-white mt-1">
              Log in to{" "}
              <span className="bg-gradient-to-r from-[#E87722] to-[#F4C21F] bg-clip-text text-transparent">
                Bazario
              </span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">Continue managing your store</p>
          </div>
        </div>

        {/* General error */}
        {errors.general && (
          <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
            <span className="text-red-400 text-xs font-semibold">{errors.general}</span>
          </div>
        )}

        {/* Google */}
        <button className="group w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer active:scale-95 mb-6">
          <FcGoogle className="h-5 w-5" />
          <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors duration-200">
            Continue with Google
          </span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-gray-600 font-medium uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email</label>
            <div className="relative flex items-center rounded-2xl border transition-all duration-300" style={inputStyle("email")}>
              <HiMail className="absolute left-4 h-4 w-4 transition-colors duration-300" style={iconColor("email")} />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                placeholder="you@example.com"
                className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none"
              />
            </div>
            {errors.email && (
              <span className="text-xs text-red-400 font-semibold">⚠ {errors.email}</span>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Password</label>
              <span className="text-xs text-[#E87722] cursor-pointer hover:underline font-semibold">Forgot password?</span>
            </div>
            <div className="relative flex items-center rounded-2xl border transition-all duration-300" style={inputStyle("password")}>
              <HiLockClosed className="absolute left-4 h-4 w-4 transition-colors duration-300" style={iconColor("password")} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                placeholder="Your password"
                className="w-full bg-transparent pl-11 pr-12 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-gray-500 hover:text-[#E87722] transition-colors duration-200 cursor-pointer"
              >
                {showPassword ? <HiEyeOff className="h-4 w-4" /> : <HiEye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <span className="text-xs text-red-400 font-semibold">⚠ {errors.password}</span>
            )}
          </div>

          {/* Remember me */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>
            <div
              className="h-5 w-5 rounded-md border flex items-center justify-center transition-all duration-200 shrink-0"
              style={{
                borderColor: rememberMe ? "#E87722" : "rgba(255,255,255,0.15)",
                backgroundColor: rememberMe ? "rgba(232,119,34,0.2)" : "transparent",
              }}
            >
              {rememberMe && (
                <svg className="h-3 w-3 text-[#E87722]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-sm text-gray-400 select-none">Remember me for 30 days</span>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="relative group w-full py-4 rounded-2xl font-black text-white text-sm cursor-pointer active:scale-95 transition-all duration-200 overflow-hidden shadow-lg shadow-[#E87722]/20 mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[#E87722] to-[#F4C21F]" />
            <span className="absolute inset-0 bg-gradient-to-r from-[#2EA7F2] to-[#2EA7F2] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Logging in...
                </>
              ) : (
                <>
                  Log in to my Store
                  <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-md">→</span>
                </>
              )}
            </span>
          </button>

        </div>

        {/* Sign up link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{" "}
          <span onClick={onSwitchToSignUp} className="text-[#E87722] font-bold cursor-pointer hover:underline">
            Create one for free
          </span>
        </p>

      </div>
    </div>
  );
};

export default Login;