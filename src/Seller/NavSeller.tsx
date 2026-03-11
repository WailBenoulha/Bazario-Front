import { useState, useEffect, useRef } from "react";
import { HiMenu, HiX, HiBell, HiSearch, HiChevronDown, HiLogout, HiUser, HiCog, HiCamera, HiLockClosed, HiEye, HiEyeOff, HiCheckCircle, HiMail } from "react-icons/hi";
import { BsShopWindow, BsStars, BsPerson } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000/api";

const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("access_token");
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });
};

interface UserProfile { id?: number; username: string; email: string; avatar?: string; }

const plans = [
  { name: "Basic", price: "2,500 DA", period: "/mo", color: "#E87722", features: ["50 products", "Custom domain", "Basic analytics"] },
  { name: "Premium", price: "4,500 DA", period: "/mo", color: "#F4C21F", features: ["Unlimited products", "Priority support", "Advanced analytics", "Multi-store"], popular: true },
];

// ── Splash Screen (reusable) ──────────────────────────────────
const Splash = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="fixed inset-0 z-[300] bg-[#0a0500] flex flex-col items-center justify-center overflow-hidden">
    <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `linear-gradient(rgba(244,194,31,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(244,194,31,0.5) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
    <div className="absolute h-[500px] w-[500px] rounded-full border border-[#E87722]/10 animate-spin" style={{ animationDuration: "12s" }} />
    <div className="absolute h-[380px] w-[380px] rounded-full border border-[#F4C21F]/10 animate-spin" style={{ animationDuration: "8s", animationDirection: "reverse" }} />
    <div className="absolute h-[260px] w-[260px] rounded-full border border-[#E87722]/15 animate-spin" style={{ animationDuration: "5s" }} />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 bg-[#E87722] opacity-10 rounded-full blur-3xl animate-pulse" />
    <div className="absolute h-[380px] w-[380px] animate-spin" style={{ animationDuration: "3s" }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 bg-[#E87722] rounded-full shadow-lg shadow-[#E87722]/50" />
    </div>
    <div className="absolute h-[260px] w-[260px] animate-spin" style={{ animationDuration: "2s", animationDirection: "reverse" }}>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 h-2 w-2 bg-[#F4C21F] rounded-full shadow-lg shadow-[#F4C21F]/50" />
    </div>
    <div className="relative flex flex-col items-center gap-8 z-10">
      <div className="relative">
        <div className="absolute -inset-6 bg-gradient-to-r from-[#E87722]/20 to-[#F4C21F]/20 rounded-3xl blur-xl animate-pulse" />
        <img src="./src/Pictures/bazario-logo.png" alt="Bazario" className="relative h-16 w-auto" style={{ filter: "brightness(2) drop-shadow(0 0 20px rgba(232,119,34,0.6))" }} />
      </div>
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-2xl font-black text-white" dangerouslySetInnerHTML={{ __html: title }} />
        <p className="text-gray-500 text-sm">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-2 w-2 rounded-full bg-[#E87722]" style={{ animation: `bounceDot 1s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
    </div>
    <style>{`
      @keyframes bounceDot {
        0%, 100% { transform: translateY(0); opacity: 0.4; }
        50% { transform: translateY(-8px); opacity: 1; }
      }
    `}</style>
  </div>
);

// ── Profile Page ──────────────────────────────────────────────
const ProfilePage = ({ onClose, onUpdated }: { onClose: () => void; onUpdated: (u: UserProfile) => void }) => {
  const [user, setUser]               = useState<UserProfile>({ username: "", email: "" });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile]   = useState<File | null>(null);
  const [focused, setFocused]         = useState<string | null>(null);
  const [tab, setTab]                 = useState<"info" | "password">("info");
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [showSplash, setShowSplash]   = useState(false);
  const [errors, setErrors]           = useState<Record<string, string>>({});
  const [pwForm, setPwForm]           = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [showPw, setShowPw]           = useState<Record<string, boolean>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    authFetch(`${API_URL}/auth/me/`).then(r => r.json()).then(d => {
      setUser(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveInfo = async () => {
    const newErrors: Record<string, string> = {};
    if (!user.username.trim()) newErrors.username = "Username is required";
    if (!user.email.trim())    newErrors.email    = "Email is required";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setSaving(true);
    try {
      let body: FormData | string;
      let options: RequestInit;

      if (avatarFile) {
        const fd = new FormData();
        fd.append("username", user.username);
        fd.append("email", user.email);
        fd.append("avatar", avatarFile);
        body = fd;
        options = { method: "PATCH", body };
      } else {
        body = JSON.stringify({ username: user.username, email: user.email });
        options = { method: "PATCH", body };
      }

      const res = await authFetch(`${API_URL}/auth/me/`, options);
      const data = await res.json();

      if (!res.ok) { setErrors(data); setSaving(false); return; }

      localStorage.setItem("user", JSON.stringify(data));
      onUpdated(data);
      setSaving(false);
      setShowSplash(true);
      setTimeout(() => { setShowSplash(false); onClose(); }, 2800);
    } catch {
      setErrors({ general: "Network error. Try again." });
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    const newErrors: Record<string, string> = {};
    if (!pwForm.current_password)  newErrors.current_password  = "Current password is required";
    if (!pwForm.new_password)      newErrors.new_password      = "New password is required";
    else if (pwForm.new_password.length < 8) newErrors.new_password = "Min. 8 characters";
    if (pwForm.new_password !== pwForm.confirm_password) newErrors.confirm_password = "Passwords don't match";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setSaving(true);
    try {
      const res = await authFetch(`${API_URL}/auth/change-password/`, {
        method: "POST",
        body: JSON.stringify({ current_password: pwForm.current_password, new_password: pwForm.new_password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ current_password: data.current_password?.[0] || data.detail || "Incorrect password" });
        setSaving(false);
        return;
      }
      setSaving(false);
      setShowSplash(true);
      setTimeout(() => { setShowSplash(false); onClose(); }, 2800);
    } catch {
      setErrors({ general: "Network error." });
      setSaving(false);
    }
  };

  const inputStyle = (field: string) => ({
    borderColor: errors[field] ? "#ef4444" : focused === field ? "#E87722" : "#e5e7eb",
    boxShadow: focused === field && !errors[field] ? "0 0 0 3px rgba(232,119,34,0.08)" : errors[field] ? "0 0 0 3px rgba(239,68,68,0.08)" : "none",
    backgroundColor: errors[field] ? "rgba(239,68,68,0.02)" : focused === field ? "rgba(232,119,34,0.02)" : "white",
  });

  if (showSplash) return (
    <Splash
      title={tab === "password"
        ? `Password <span style="color:#22c55e">Updated!</span>`
        : `Profile <span class="bg-gradient-to-r from-[#E87722] to-[#F4C21F] bg-clip-text text-transparent">Saved!</span>`
      }
      subtitle={tab === "password" ? "Your password has been changed successfully 🔒" : "Your profile has been updated successfully ✨"}
    />
  );

  const initial = (user.username?.[0] || "S").toUpperCase();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        {/* Top accent */}
        <div className="h-1 bg-gradient-to-r from-[#E87722] via-[#F4C21F] to-[#E87722]" />

        {/* Header */}
        <div className="relative px-8 pt-7 pb-6 bg-gradient-to-br from-[#fdf8f3] to-white border-b border-gray-100">
          <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 cursor-pointer bg-gray-100 hover:bg-gray-200 rounded-xl p-2 transition-all">
            <HiX className="h-4 w-4" />
          </button>

          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#E87722] to-[#F4C21F] flex items-center justify-center shadow-lg shadow-[#E87722]/20 overflow-hidden">
                {avatarPreview || user.avatar
                  ? <img src={avatarPreview || user.avatar} alt="avatar" className="h-full w-full object-cover" />
                  : <span className="text-white text-3xl font-black">{initial}</span>
                }
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
              >
                <HiCamera className="h-6 w-6 text-white" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-gradient-to-r from-[#E87722] to-[#F4C21F] rounded-full flex items-center justify-center cursor-pointer shadow-md" onClick={() => fileRef.current?.click()}>
                <HiCamera className="h-3 w-3 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">{loading ? "Loading..." : user.username}</h2>
              <p className="text-gray-400 text-sm">{user.email}</p>
              <p className="text-[10px] text-gray-300 mt-1 font-semibold uppercase tracking-wider">Click avatar to change photo</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6 bg-gray-100 p-1 rounded-xl">
            {[
              { id: "info",     icon: <BsPerson className="h-4 w-4" />,      label: "Profile Info" },
              { id: "password", icon: <HiLockClosed className="h-4 w-4" />,  label: "Password" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id as "info" | "password"); setErrors({}); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer
                  ${tab === t.id ? "bg-white text-[#E87722] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                {t.icon}{t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          {errors.general && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-semibold flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
              {errors.general}
            </div>
          )}

          {tab === "info" && (
            <div className="flex flex-col gap-5">
              {/* Username */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Username</label>
                <div className="relative flex items-center rounded-xl border transition-all duration-200" style={inputStyle("username")}>
                  <HiUser className="absolute left-4 h-4 w-4 text-gray-400 pointer-events-none" style={{ color: focused === "username" ? "#E87722" : errors.username ? "#ef4444" : "#9ca3af" }} />
                  <input
                    type="text"
                    value={user.username}
                    onChange={e => { setUser({ ...user, username: e.target.value }); setErrors({ ...errors, username: "" }); }}
                    onFocus={() => setFocused("username")}
                    onBlur={() => setFocused(null)}
                    placeholder="your_username"
                    className="w-full pl-11 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent rounded-xl"
                  />
                </div>
                {errors.username && <span className="text-xs text-red-500 font-semibold">⚠ {errors.username}</span>}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
                <div className="relative flex items-center rounded-xl border transition-all duration-200" style={inputStyle("email")}>
                  <HiMail className="absolute left-4 h-4 w-4 pointer-events-none" style={{ color: focused === "email" ? "#E87722" : errors.email ? "#ef4444" : "#9ca3af" }} />
                  <input
                    type="email"
                    value={user.email}
                    onChange={e => { setUser({ ...user, email: e.target.value }); setErrors({ ...errors, email: "" }); }}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent rounded-xl"
                  />
                </div>
                {errors.email && <span className="text-xs text-red-500 font-semibold">⚠ {errors.email}</span>}
              </div>

              <button
                onClick={handleSaveInfo}
                disabled={saving || loading}
                className="relative group w-full py-3.5 rounded-xl font-black text-white text-sm cursor-pointer active:scale-95 transition-all duration-200 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#E87722] to-[#F4C21F]" />
                <span className="absolute inset-0 bg-gradient-to-r from-[#2EA7F2] to-[#2EA7F2] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {saving
                    ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Saving...</>
                    : <><HiCheckCircle className="h-4 w-4" /> Save Changes</>
                  }
                </span>
              </button>
            </div>
          )}

          {tab === "password" && (
            <div className="flex flex-col gap-5">
              {/* Info box */}
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <HiLockClosed className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-800 text-xs font-bold">Security Check</p>
                  <p className="text-amber-600 text-xs mt-0.5">You must enter your current password before setting a new one.</p>
                </div>
              </div>

              {/* Current password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Password</label>
                <div className="relative flex items-center rounded-xl border transition-all duration-200" style={inputStyle("current_password")}>
                  <HiLockClosed className="absolute left-4 h-4 w-4 pointer-events-none" style={{ color: focused === "current_password" ? "#E87722" : errors.current_password ? "#ef4444" : "#9ca3af" }} />
                  <input
                    type={showPw.current ? "text" : "password"}
                    value={pwForm.current_password}
                    onChange={e => { setPwForm({ ...pwForm, current_password: e.target.value }); setErrors({ ...errors, current_password: "" }); }}
                    onFocus={() => setFocused("current_password")}
                    onBlur={() => setFocused(null)}
                    placeholder="Your current password"
                    className="w-full pl-11 pr-12 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
                  />
                  <button type="button" onClick={() => setShowPw({ ...showPw, current: !showPw.current })} className="absolute right-4 text-gray-400 hover:text-[#E87722] cursor-pointer transition-colors">
                    {showPw.current ? <HiEyeOff className="h-4 w-4" /> : <HiEye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.current_password && <span className="text-xs text-red-500 font-semibold">⚠ {errors.current_password}</span>}
              </div>

              {/* New password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">New Password</label>
                <div className="relative flex items-center rounded-xl border transition-all duration-200" style={inputStyle("new_password")}>
                  <HiLockClosed className="absolute left-4 h-4 w-4 pointer-events-none" style={{ color: focused === "new_password" ? "#E87722" : errors.new_password ? "#ef4444" : "#9ca3af" }} />
                  <input
                    type={showPw.new ? "text" : "password"}
                    value={pwForm.new_password}
                    onChange={e => { setPwForm({ ...pwForm, new_password: e.target.value }); setErrors({ ...errors, new_password: "" }); }}
                    onFocus={() => setFocused("new_password")}
                    onBlur={() => setFocused(null)}
                    placeholder="Min. 8 characters"
                    className="w-full pl-11 pr-12 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
                  />
                  <button type="button" onClick={() => setShowPw({ ...showPw, new: !showPw.new })} className="absolute right-4 text-gray-400 hover:text-[#E87722] cursor-pointer transition-colors">
                    {showPw.new ? <HiEyeOff className="h-4 w-4" /> : <HiEye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.new_password && <span className="text-xs text-red-500 font-semibold">⚠ {errors.new_password}</span>}
                {/* strength bars */}
                {pwForm.new_password && !errors.new_password && (() => {
                  const l = pwForm.new_password.length;
                  const s = l < 6 ? { bars: 1, color: "#ef4444", label: "Weak" } : l < 10 ? { bars: 2, color: "#F4C21F", label: "Medium" } : { bars: 3, color: "#22c55e", label: "Strong" };
                  return (
                    <div className="flex flex-col gap-1.5 mt-1">
                      <div className="flex gap-1.5">
                        {[1,2,3].map(b => <div key={b} className="flex-1 h-1 rounded-full transition-all duration-500" style={{ backgroundColor: b <= s.bars ? s.color : "#f3f4f6" }} />)}
                      </div>
                      <span className="text-xs font-bold" style={{ color: s.color }}>{s.label} password</span>
                    </div>
                  );
                })()}
              </div>

              {/* Confirm password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Confirm New Password</label>
                <div className="relative flex items-center rounded-xl border transition-all duration-200" style={inputStyle("confirm_password")}>
                  <HiLockClosed className="absolute left-4 h-4 w-4 pointer-events-none" style={{ color: focused === "confirm_password" ? "#E87722" : errors.confirm_password ? "#ef4444" : "#9ca3af" }} />
                  <input
                    type={showPw.confirm ? "text" : "password"}
                    value={pwForm.confirm_password}
                    onChange={e => { setPwForm({ ...pwForm, confirm_password: e.target.value }); setErrors({ ...errors, confirm_password: "" }); }}
                    onFocus={() => setFocused("confirm_password")}
                    onBlur={() => setFocused(null)}
                    placeholder="Repeat new password"
                    className="w-full pl-11 pr-12 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
                  />
                  <button type="button" onClick={() => setShowPw({ ...showPw, confirm: !showPw.confirm })} className="absolute right-4 text-gray-400 hover:text-[#E87722] cursor-pointer transition-colors">
                    {showPw.confirm ? <HiEyeOff className="h-4 w-4" /> : <HiEye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirm_password && <span className="text-xs text-red-500 font-semibold">⚠ {errors.confirm_password}</span>}
                {pwForm.confirm_password && pwForm.new_password === pwForm.confirm_password && !errors.confirm_password && (
                  <span className="text-xs text-green-600 font-semibold flex items-center gap-1"><HiCheckCircle className="h-3 w-3" /> Passwords match</span>
                )}
              </div>

              <button
                onClick={handleChangePassword}
                disabled={saving}
                className="relative group w-full py-3.5 rounded-xl font-black text-white text-sm cursor-pointer active:scale-95 transition-all duration-200 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#E87722] to-[#F4C21F]" />
                <span className="absolute inset-0 bg-gradient-to-r from-[#2EA7F2] to-[#2EA7F2] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {saving
                    ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Updating...</>
                    : <><HiLockClosed className="h-4 w-4" /> Update Password</>
                  }
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── NavSeller ─────────────────────────────────────────────────
const NavSeller = () => {
  const [isOpen, setIsOpen]           = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifs, setShowNotifs]   = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showProfilePage, setShowProfilePage] = useState(false);
  const [loggingOut, setLoggingOut]   = useState(false);
  const [user, setUser]               = useState<UserProfile>({ username: "Seller", email: "seller@bazario.dz" });
  const [notifs, setNotifs]           = useState([
    { id: 1, title: "New order received",     desc: "#ORD-006 from Amira K.",        time: "2 min ago",  dot: "#E87722", read: false },
    { id: 2, title: "Product low stock",      desc: "UrbanThread Jacket — 2 left",   time: "15 min ago", dot: "#F4C21F", read: false },
    { id: 3, title: "New customer signed up", desc: "Yacine T. joined your store",   time: "1h ago",     dot: "#2EA7F2", read: false },
    { id: 4, title: "Payment confirmed",      desc: "#ORD-005 — 1,500 DA received", time: "3h ago",     dot: "#22c55e", read: false },
  ]);

  const unread     = notifs.filter(n => !n.read).length;
  const navigate   = useNavigate();
  const notifRef   = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const upgradeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    authFetch(`${API_URL}/auth/me/`).then(r => r.json()).then(d => {
      setUser(d);
      localStorage.setItem("user", JSON.stringify(d));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current   && !notifRef.current.contains(e.target as Node))   setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
      if (upgradeRef.current && !upgradeRef.current.contains(e.target as Node)) setShowUpgrade(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    setShowProfile(false);
    setLoggingOut(true);
    try {
      const refresh = localStorage.getItem("refresh_token");
      await authFetch(`${API_URL}/auth/logout/`, { method: "POST", body: JSON.stringify({ refresh }) });
    } catch {}
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setTimeout(() => navigate("/"), 2200);
  };

  const initial = (user.username?.[0] || "S").toUpperCase();

  if (loggingOut) return <Splash title={`Signing you <span style="color:#E87722">out...</span>`} subtitle="See you next time 👋" />;

  return (
    <>
      {showProfilePage && (
        <ProfilePage
          onClose={() => setShowProfilePage(false)}
          onUpdated={(updated) => setUser(updated)}
        />
      )}

      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? "bg-[#0a0500]/95 backdrop-blur-xl shadow-lg shadow-black/40 py-3 border-b border-[#E87722]/15" : "bg-[#0a0500] py-4 border-b border-white/5"}`}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E87722]/50 to-transparent" />

        <div className="flex items-center justify-between px-6 md:px-10 gap-4">

          {/* Logo */}
          <div className="relative group cursor-pointer shrink-0" onClick={() => navigate("/seller")}>
            <div className="absolute -inset-2 bg-gradient-to-r from-[#E87722]/20 to-[#F4C21F]/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <img src="./src/Pictures/bazario-logo.png" alt="Bazario" className="relative h-9 w-auto brightness-200 transition-transform duration-300 group-hover:scale-105" />
          </div>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-xl mx-6">
            <div className="relative w-full flex items-center" style={{ filter: searchFocused ? "drop-shadow(0 0 12px rgba(232,119,34,0.15))" : "none" }}>
              <HiSearch className="absolute left-4 h-4 w-4 pointer-events-none transition-colors duration-300" style={{ color: searchFocused ? "#E87722" : "#4b5563" }} />
              <input
                type="text" value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search orders, products, customers..."
                className="w-full pl-11 pr-10 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none rounded-xl transition-all duration-300"
                style={{
                  backgroundColor: searchFocused ? "rgba(232,119,34,0.06)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${searchFocused ? "rgba(232,119,34,0.4)" : "rgba(255,255,255,0.08)"}`,
                  boxShadow: searchFocused ? "0 0 0 3px rgba(232,119,34,0.08)" : "none",
                }}
              />
              {searchValue && <button onClick={() => setSearchValue("")} className="absolute right-3 text-gray-500 hover:text-white cursor-pointer"><HiX className="h-4 w-4" /></button>}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 shrink-0">

            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-xs font-bold">Live</span>
            </div>

            {/* Upgrade */}
            <div className="relative" ref={upgradeRef}>
              <button onClick={() => { setShowUpgrade(!showUpgrade); setShowNotifs(false); setShowProfile(false); }}
                className="relative hidden md:flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer active:scale-95 transition-all duration-200 overflow-hidden group border border-[#F4C21F]/30 hover:border-[#F4C21F]/60"
                style={{ background: "linear-gradient(135deg, rgba(232,119,34,0.15), rgba(244,194,31,0.1))" }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "linear-gradient(105deg, transparent 40%, rgba(244,194,31,0.15) 50%, transparent 60%)" }} />
                <BsStars className="h-3.5 w-3.5 text-[#F4C21F] relative z-10" />
                <span className="text-xs font-black text-[#F4C21F] relative z-10">Upgrade</span>
              </button>
              {showUpgrade && (
                <div className="absolute right-0 top-12 w-72 bg-[#0d0601] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-50">
                  <div className="relative px-5 py-4 overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{ background: "linear-gradient(135deg, #E87722, #F4C21F)" }} />
                    <div className="relative flex items-center gap-2 mb-1"><BsStars className="h-4 w-4 text-[#F4C21F]" /><span className="text-white font-black text-sm">Upgrade Your Plan</span></div>
                    <p className="relative text-gray-400 text-xs">Unlock more features and grow faster</p>
                  </div>
                  <div className="p-3 flex flex-col gap-2">
                    {plans.map(plan => (
                      <div key={plan.name} className="relative flex flex-col gap-3 p-4 rounded-xl border cursor-pointer overflow-hidden"
                        style={{ borderColor: plan.popular ? `${plan.color}40` : "rgba(255,255,255,0.06)", backgroundColor: plan.popular ? `${plan.color}08` : "rgba(255,255,255,0.02)" }}>
                        {plan.popular && <div className="absolute top-0 right-0"><div className="text-[10px] font-black text-white px-2.5 py-1 rounded-bl-xl rounded-tr-xl" style={{ background: `linear-gradient(135deg, ${plan.color}, #E87722)` }}>POPULAR</div></div>}
                        <div className="flex items-center justify-between">
                          <span className="text-white font-black text-sm">{plan.name}</span>
                          <div className="flex items-baseline gap-0.5"><span className="font-black text-base" style={{ color: plan.color }}>{plan.price}</span><span className="text-gray-600 text-xs">{plan.period}</span></div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {plan.features.map(f => <div key={f} className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: plan.color }} /><span className="text-gray-400 text-xs">{f}</span></div>)}
                        </div>
                        <button className="w-full py-2 rounded-xl text-xs font-black text-white cursor-pointer active:scale-95" style={{ background: `linear-gradient(135deg, ${plan.color}, ${plan.popular ? "#E87722" : plan.color})` }}>Choose {plan.name}</button>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 pb-4 text-center"><span className="text-gray-600 text-xs">No credit card required · Cancel anytime</span></div>
                </div>
              )}
            </div>

            <div className="hidden md:block h-6 w-px bg-white/10" />

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); setShowUpgrade(false); }}
                className="relative h-9 w-9 flex items-center justify-center text-gray-400 hover:text-[#E87722] transition-all duration-200 cursor-pointer rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10">
                <HiBell className="h-5 w-5" />
                {unread > 0 && <span className="absolute top-1 right-1 h-4 w-4 bg-gradient-to-r from-[#E87722] to-[#F4C21F] rounded-full text-white text-[10px] font-black flex items-center justify-center animate-pulse">{unread}</span>}
              </button>
              {showNotifs && (
                <div className="absolute right-0 top-12 w-80 bg-[#0d0601] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-black">Notifications</span>
                      {unread > 0 && <span className="h-5 w-5 bg-gradient-to-r from-[#E87722] to-[#F4C21F] rounded-full text-white text-[10px] font-black flex items-center justify-center">{unread}</span>}
                    </div>
                    <button onClick={() => setNotifs(notifs.map(n => ({ ...n, read: true })))} className="text-[#E87722] text-xs font-bold cursor-pointer hover:underline">Mark all read</button>
                  </div>
                  <div className="flex flex-col max-h-72 overflow-y-auto">
                    {notifs.map(n => (
                      <div key={n.id} onClick={() => setNotifs(notifs.map(x => x.id === n.id ? { ...x, read: true } : x))}
                        className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors duration-200 border-b border-white/[0.03] last:border-0 ${n.read ? "opacity-50" : "hover:bg-white/[0.03]"}`}>
                        <div className="mt-1.5 h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: n.dot }} />
                        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                          <span className="text-white text-xs font-bold">{n.title}</span>
                          <span className="text-gray-500 text-xs truncate">{n.desc}</span>
                          <span className="text-gray-700 text-[10px]">{n.time}</span>
                        </div>
                        {!n.read && <div className="h-2 w-2 rounded-full bg-[#E87722] shrink-0 mt-1" />}
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-3 border-t border-white/5"><button className="w-full text-center text-xs text-[#E87722] font-bold hover:underline cursor-pointer">View all notifications</button></div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); setShowUpgrade(false); }}
                className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-200 cursor-pointer">
                <div className="relative">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#E87722] to-[#F4C21F] flex items-center justify-center shadow-lg shadow-[#E87722]/20 overflow-hidden">
                    {user.avatar ? <img src={user.avatar} alt="avatar" className="h-full w-full object-cover" /> : <span className="text-white text-xs font-black">{initial}</span>}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-green-400 rounded-full border-2 border-[#0a0500]" />
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-white text-xs font-bold leading-none">{user.username}</span>
                  <span className="text-gray-500 text-[10px] leading-none mt-0.5">{user.email}</span>
                </div>
                <HiChevronDown className={`hidden md:block h-3.5 w-3.5 text-gray-500 transition-transform duration-200 ${showProfile ? "rotate-180" : ""}`} />
              </button>

              {showProfile && (
                <div className="absolute right-0 top-12 w-56 bg-[#0d0601] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#E87722] to-[#F4C21F] flex items-center justify-center overflow-hidden shrink-0">
                      {user.avatar ? <img src={user.avatar} alt="avatar" className="h-full w-full object-cover" /> : <span className="text-white text-xs font-black">{initial}</span>}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-black truncate">{user.username}</p>
                      <p className="text-gray-500 text-xs truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="p-2">
                    {[
                      { icon: <HiUser className="h-4 w-4" />, label: "My Profile", action: () => { setShowProfile(false); setShowProfilePage(true); } },
                      { icon: <BsShopWindow className="h-4 w-4" />, label: "Store Settings", action: () => {} },
                      { icon: <HiCog className="h-4 w-4" />, label: "Preferences", action: () => {} },
                    ].map(item => (
                      <button key={item.label} onClick={item.action}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer transition-all duration-200 text-left">
                        <span className="text-gray-600">{item.icon}</span>{item.label}
                      </button>
                    ))}
                  </div>
                  <div className="p-2 border-t border-white/5">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer transition-all duration-200 text-left">
                      <HiLogout className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden h-9 w-9 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-[#E87722] hover:border-[#E87722]/30 transition-all duration-200 cursor-pointer">
              {isOpen ? <HiX className="h-5 w-5" /> : <HiMenu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-500 ${isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="mx-4 mt-3 mb-4 bg-[#0d0601] border border-[#E87722]/15 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4">
              <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                <HiSearch className="h-4 w-4 text-gray-500 shrink-0" />
                <input type="text" placeholder="Search orders, products..." className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none" />
              </div>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-[#E87722]/20 to-transparent mx-4" />
            <div className="px-4 py-3">
              <button className="relative w-full flex items-center justify-center gap-2 py-3 rounded-xl cursor-pointer border border-[#F4C21F]/30" style={{ background: "linear-gradient(135deg, rgba(232,119,34,0.15), rgba(244,194,31,0.1))" }}>
                <BsStars className="h-4 w-4 text-[#F4C21F]" /><span className="text-sm font-black text-[#F4C21F]">Upgrade Your Plan</span>
              </button>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-[#E87722]/20 to-transparent mx-4" />
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-[#E87722] to-[#F4C21F] flex items-center justify-center shadow-lg overflow-hidden">
                  {user.avatar ? <img src={user.avatar} alt="avatar" className="h-full w-full object-cover" /> : <span className="text-white font-black">{initial}</span>}
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 rounded-full border-2 border-[#0d0601]" />
                </div>
                <div className="flex flex-col"><span className="text-white text-sm font-bold">{user.username}</span><span className="text-gray-500 text-xs">{user.email}</span></div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-xl">
                <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-xs font-bold">Live</span>
              </div>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-[#E87722]/20 to-transparent mx-4" />
            <div className="p-3 flex flex-col gap-1">
              {[{ label: "Dashboard", path: "/seller" }, { label: "My Profile", path: "" }, { label: "Store Settings", path: "/seller/settings" }].map(item => (
                <button key={item.label}
                  onClick={() => { if (item.label === "My Profile") { setIsOpen(false); setShowProfilePage(true); } else { navigate(item.path); setIsOpen(false); } }}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer transition-all duration-200 font-semibold">
                  {item.label}
                </button>
              ))}
              <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer transition-all duration-200 font-semibold flex items-center gap-2">
                <HiLogout className="h-4 w-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default NavSeller;