import { useState, useEffect } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import { useLang } from "./Translations";

const navKeys = [
  { key: "nav_home",        id: "home" },
  { key: "nav_about",       id: "about" },
  { key: "nav_niches",      id: "niches" },
  { key: "nav_inspiration", id: "inspiration" },
  { key: "nav_plans",       id: "plans" },
  { key: "nav_contact",     id: "contact" },
] as const;

const NavBar = ({ onSignUp, onLogin }: { onSignUp: () => void; onLogin: () => void }) => {
  const { t, lang } = useLang();
  const isAr = lang === "ar";

  const [isOpen,   setIsOpen]   = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState("nav_home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string, key: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setActiveId(key);
    setIsOpen(false);
  };

  return (
    <nav
      dir={isAr ? "rtl" : "ltr"}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0a0500]/90 backdrop-blur-xl border-b border-[#E87722]/20 py-3 shadow-lg shadow-black/30"
          : "bg-transparent py-5"
      }`}
    >
      {/* Glow line */}
      <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E87722]/50 to-transparent transition-opacity duration-500 ${scrolled ? "opacity-100" : "opacity-0"}`}/>

      <div className="flex items-center justify-between px-6 md:px-16">

        {/* Logo */}
        <div className="relative group cursor-pointer" onClick={() => scrollTo("home", "nav_home")}>
          <div className="absolute -inset-2 bg-gradient-to-r from-[#E87722]/20 to-[#F4C21F]/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
          <img className="relative h-10 w-auto transition-transform duration-300 group-hover:scale-105 brightness-200"
            src="./src/Pictures/bazario-logo.png" alt="Bazario Logo"/>
        </div>

        {/* Desktop Nav Links */}
        <ul className="hidden md:flex items-center gap-1">
          {navKeys.map(({ key, id }) => (
            <li key={key} onClick={() => scrollTo(id, key)}
              className={`relative cursor-pointer px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 group
                ${activeId === key ? "text-[#F4C21F]" : "text-gray-400 hover:text-white"}`}>
              {activeId === key && <span className="absolute inset-0 bg-[#E87722]/15 border border-[#E87722]/30 rounded-xl"/>}
              <span className="absolute inset-0 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"/>
              <span className="relative z-10">{t(key)}</span>
              {activeId === key && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[#E87722]"/>}
            </li>
          ))}
        </ul>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button onClick={onLogin}
            className="px-5 py-2.5 text-sm font-semibold text-gray-400 hover:text-white rounded-xl hover:bg-white/5 cursor-pointer transition-all duration-200 border border-transparent hover:border-white/10">
            {t("nav_login")}
          </button>
          <button onClick={onSignUp}
            className="relative group px-5 py-2.5 text-sm font-black text-white rounded-xl cursor-pointer active:scale-95 transition-all duration-200 overflow-hidden shadow-lg shadow-[#E87722]/20">
            <span className="absolute inset-0 bg-gradient-to-r from-[#E87722] to-[#F4C21F]"/>
            <span className="absolute inset-0 bg-gradient-to-r from-[#2EA7F2] to-[#2EA7F2] opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
            <span className="relative z-10 flex items-center gap-2">
              {t("nav_start")}
              <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-md">✦</span>
            </span>
          </button>
        </div>

        {/* Hamburger */}
        <button className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-[#E87722] hover:border-[#E87722]/30 transition-all duration-200 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <HiX className="h-5 w-5"/> : <HiMenu className="h-5 w-5"/>}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-500 ${isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="mx-4 mt-3 mb-4 bg-[#0a0500]/95 backdrop-blur-xl border border-[#E87722]/20 rounded-2xl overflow-hidden shadow-2xl">
          <ul className="flex flex-col p-3">
            {navKeys.map(({ key, id }, i) => (
              <li key={key} onClick={() => scrollTo(id, key)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 text-sm font-semibold
                  ${activeId === key ? "bg-[#E87722]/15 text-[#F4C21F] border border-[#E87722]/30" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                style={{ transitionDelay: `${i * 30}ms` }}>
                {t(key)}
                {activeId === key && <span className="h-1.5 w-1.5 rounded-full bg-[#E87722]"/>}
              </li>
            ))}
          </ul>
          <div className="h-px bg-gradient-to-r from-transparent via-[#E87722]/30 to-transparent mx-3"/>
          <div className="flex flex-col gap-2 p-3">
            <button onClick={onLogin}
              className="w-full py-3 text-sm font-semibold text-gray-400 rounded-xl border border-white/10 hover:text-white hover:bg-white/5 cursor-pointer transition-all duration-200">
              {t("nav_login")}
            </button>
            <button onClick={onSignUp}
              className="relative w-full py-3 text-sm font-black text-white rounded-xl cursor-pointer active:scale-95 transition-all duration-200 overflow-hidden shadow-lg shadow-[#E87722]/20">
              <span className="absolute inset-0 bg-gradient-to-r from-[#E87722] to-[#F4C21F]"/>
              <span className="relative z-10">{t("nav_start")} ✦</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;