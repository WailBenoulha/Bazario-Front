import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { HiEye, HiEyeOff, HiUser, HiMail, HiLockClosed, HiX, HiCheckCircle } from "react-icons/hi";
import { BsShopWindow } from "react-icons/bs";

const API_URL = "http://127.0.0.1:8000/api";

const SignUp = ({ onClose, onSwitchToLogin }: { onClose: () => void; onSwitchToLogin: () => void }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [focused, setFocused] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear field error on type
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const passwordStrength = () => {
    const p = form.password;
    if (p.length === 0) return null;
    if (p.length < 6) return { label: "Weak", color: "#ef4444", width: "33%" };
    if (p.length < 10) return { label: "Medium", color: "#F4C21F", width: "66%" };
    return { label: "Strong", color: "#22c55e", width: "100%" };
  };

  const strength = passwordStrength();

  const handleSubmit = async () => {
    // Basic client-side validation
    const newErrors: Record<string, string> = {};
    if (!form.username.trim()) newErrors.username = "Username is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 8) newErrors.password = "Password must be at least 8 characters";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch(`${API_URL}/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        // Map Django field errors to our errors state
        const fieldErrors: Record<string, string> = {};
        for (const key in data) {
          fieldErrors[key] = Array.isArray(data[key]) ? data[key][0] : data[key];
        }
        setErrors(fieldErrors);
        return;
      }

      // Store tokens
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      // Show success screen
      setSuccess(true);

      // Auto-switch to login after 2.5s
      setTimeout(() => {
        onSwitchToLogin();
      }, 2500);

    } catch {
      setErrors({ general: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field: string) => ({
    borderColor: errors[field]
      ? "#ef4444"
      : focused === field
        ? "#E87722"
        : "rgba(255,255,255,0.08)",
    backgroundColor: errors[field]
      ? "rgba(239,68,68,0.05)"
      : focused === field
        ? "rgba(232,119,34,0.05)"
        : "rgba(255,255,255,0.03)",
    boxShadow: errors[field]
      ? "0 0 0 3px rgba(239,68,68,0.1)"
      : focused === field
        ? "0 0 0 3px rgba(232,119,34,0.1)"
        : "none",
  });

  const iconColor = (field: string) => ({
    color: errors[field] ? "#ef4444" : focused === field ? "#E87722" : "#4b5563",
  });

  // ── Success Screen ──────────────────────────────────────────
  if (success) {
    return (
      <div className="relative w-full max-w-md z-10">
        <div className="absolute -inset-4 rounded-3xl border border-green-500/10 rotate-1 pointer-events-none" />
        <div className="bg-[#0d0601] border border-white/10 rounded-3xl p-12 shadow-2xl shadow-black/50 relative flex flex-col items-center gap-6 text-center overflow-hidden">

          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-white cursor-pointer bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl p-2 transition-all duration-200"
          >
            <HiX className="h-5 w-5" />
          </button>

          {/* Icon */}
          <div className="relative">
            <div className="absolute -inset-4 bg-green-500/20 rounded-full blur-xl animate-pulse" />
            <div className="relative bg-green-500/15 border border-green-500/30 p-5 rounded-full">
              <HiCheckCircle className="h-12 w-12 text-green-400" />
            </div>
          </div>

          {/* Text */}
          <div className="flex flex-col gap-2 relative">
            <div className="flex items-center gap-2 justify-center">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-green-500" />
              <span className="text-xs font-bold tracking-[0.3em] text-green-400 uppercase">Success</span>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-green-500" />
            </div>
            <h2 className="text-3xl font-black text-white">
              Account{" "}
              <span className="text-green-400">Created!</span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Welcome to Bazario,{" "}
              <span className="text-[#E87722] font-bold">@{form.username}</span>!
              Your account is ready. Redirecting you to login...
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
              style={{ animation: "progress 2.5s linear forwards" }}
            />
          </div>

          {/* Manual login button */}
          <button
            onClick={onSwitchToLogin}
            className="relative group w-full py-3.5 rounded-2xl font-black text-white text-sm cursor-pointer active:scale-95 transition-all duration-200 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[#E87722] to-[#F4C21F]" />
            <span className="absolute inset-0 bg-gradient-to-r from-[#2EA7F2] to-[#2EA7F2] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10">Go to Login →</span>
          </button>

          <style>{`
            @keyframes progress {
              from { width: 0% }
              to   { width: 100% }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // ── Sign Up Form ─────────────────────────────────────────────
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
              <span className="text-xs font-bold tracking-[0.3em] text-[#E87722] uppercase">Join Bazario</span>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#E87722]" />
            </div>
            <h1 className="text-3xl font-black text-white mt-1">
              Create your{" "}
              <span className="bg-gradient-to-r from-[#E87722] to-[#F4C21F] bg-clip-text text-transparent">
                Account
              </span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">Start building your store in minutes — it's free</p>
          </div>
        </div>

        {/* General error */}
        {errors.general && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
            <span className="text-red-400 text-xs font-semibold">{errors.general}</span>
          </div>
        )}

        {/* Google Button */}
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

          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Username</label>
            <div className="relative flex items-center rounded-2xl border transition-all duration-300" style={inputStyle("username")}>
              <HiUser className="absolute left-4 h-4 w-4 transition-colors duration-300" style={iconColor("username")} />
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                onFocus={() => setFocused("username")}
                onBlur={() => setFocused(null)}
                placeholder="your_store_name"
                className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none"
              />
            </div>
            {errors.username && (
              <span className="text-xs text-red-400 font-semibold flex items-center gap-1">
                <span>⚠</span> {errors.username}
              </span>
            )}
          </div>

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
              <span className="text-xs text-red-400 font-semibold flex items-center gap-1">
                <span>⚠</span> {errors.email}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Password</label>
            <div className="relative flex items-center rounded-2xl border transition-all duration-300" style={inputStyle("password")}>
              <HiLockClosed className="absolute left-4 h-4 w-4 transition-colors duration-300" style={iconColor("password")} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                placeholder="Min. 8 characters"
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
              <span className="text-xs text-red-400 font-semibold flex items-center gap-1">
                <span>⚠</span> {errors.password}
              </span>
            )}
            {strength && !errors.password && (
              <div className="flex flex-col gap-1.5 mt-1">
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: strength.width, backgroundColor: strength.color }}
                  />
                </div>
                <span className="text-xs font-bold" style={{ color: strength.color }}>
                  {strength.label} password
                </span>
              </div>
            )}
          </div>

          {/* Terms */}
          <p className="text-xs text-gray-600 text-center leading-relaxed">
            By signing up, you agree to our{" "}
            <span className="text-[#E87722] cursor-pointer hover:underline">Terms of Service</span>
            {" "}and{" "}
            <span className="text-[#E87722] cursor-pointer hover:underline">Privacy Policy</span>
          </p>

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
                  Creating your account...
                </>
              ) : (
                <>
                  Create my Free Store
                  <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-md">✦</span>
                </>
              )}
            </span>
          </button>

        </div>

        {/* Login link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <span onClick={onSwitchToLogin} className="text-[#E87722] font-bold cursor-pointer hover:underline">
            Log in
          </span>
        </p>

      </div>
    </div>
  );
};

export default SignUp;