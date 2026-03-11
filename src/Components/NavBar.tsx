import { useState, useEffect } from "react";
import { HiMenu, HiX } from "react-icons/hi";

const navLinks = [
  { label: "Home", id: "home" },
  { label: "About", id: "about" },
  { label: "Niches", id: "niches" },
  { label: "Inspiration", id: "inspiration" },
  { label: "Plans", id: "plans" },
  { label: "Contact", id: "contact" },
];

const NavBar = ({ onSignUp, onLogin }: { onSignUp: () => void; onLogin: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("Home");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string, label: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setActive(label);
    setIsOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0a0500]/90 backdrop-blur-xl border-b border-[#E87722]/20 py-3 shadow-lg shadow-black/30"
          : "bg-transparent py-5"
      }`}
    >
      {/* Glow line at bottom */}
      <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E87722]/50 to-transparent transition-opacity duration-500 ${scrolled ? "opacity-100" : "opacity-0"}`} />

      <div className="flex items-center justify-between px-6 md:px-16">

        {/* Logo */}
        <div
          className="relative group cursor-pointer"
          onClick={() => scrollTo("home", "Home")}
        >
          <div className="absolute -inset-2 bg-gradient-to-r from-[#E87722]/20 to-[#F4C21F]/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <img
            className="relative h-10 w-auto transition-transform duration-300 group-hover:scale-105 brightness-200"
            src="./src/Pictures/bazario-logo.png"
            alt="Bazario Logo"
          />
        </div>

        {/* Desktop Nav Links */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <li
              key={link.label}
              onClick={() => scrollTo(link.id, link.label)}
              className={`relative cursor-pointer px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 group
                ${active === link.label
                  ? "text-[#F4C21F]"
                  : "text-gray-400 hover:text-white"
                }`}
            >
              {active === link.label && (
                <span className="absolute inset-0 bg-[#E87722]/15 border border-[#E87722]/30 rounded-xl" />
              )}
              <span className="absolute inset-0 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <span className="relative z-10">{link.label}</span>
              {active === link.label && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[#E87722]" />
              )}
            </li>
          ))}
        </ul>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button onClick={onLogin} className="px-5 py-2.5 text-sm font-semibold text-gray-400 hover:text-white rounded-xl hover:bg-white/5 cursor-pointer transition-all duration-200 border border-transparent hover:border-white/10">
            Log in
          </button>
          <button
            onClick={onSignUp}
            className="relative group px-5 py-2.5 text-sm font-black text-white rounded-xl cursor-pointer active:scale-95 transition-all duration-200 overflow-hidden shadow-lg shadow-[#E87722]/20"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[#E87722] to-[#F4C21F]" />
            <span className="absolute inset-0 bg-gradient-to-r from-[#2EA7F2] to-[#2EA7F2] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 flex items-center gap-2">
              Start for Free
              <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-md">✦</span>
            </span>
          </button>
        </div>

        {/* Hamburger Button */}
        <button
          className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-[#E87722] hover:border-[#E87722]/30 transition-all duration-200 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <HiX className="h-5 w-5" /> : <HiMenu className="h-5 w-5" />}
        </button>

      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-500 ${isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="mx-4 mt-3 mb-4 bg-[#0a0500]/95 backdrop-blur-xl border border-[#E87722]/20 rounded-2xl overflow-hidden shadow-2xl">

          {/* Mobile Links */}
          <ul className="flex flex-col p-3">
            {navLinks.map((link, i) => (
              <li
                key={link.label}
                onClick={() => scrollTo(link.id, link.label)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 text-sm font-semibold
                  ${active === link.label
                    ? "bg-[#E87722]/15 text-[#F4C21F] border border-[#E87722]/30"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                style={{ transitionDelay: `${i * 30}ms` }}
              >
                {link.label}
                {active === link.label && <span className="h-1.5 w-1.5 rounded-full bg-[#E87722]" />}
              </li>
            ))}
          </ul>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#E87722]/30 to-transparent mx-3" />

          {/* Mobile Buttons */}
          <div className="flex flex-col gap-2 p-3">
            <button 
              onClick={onLogin} 
              className="w-full py-3 text-sm font-semibold text-gray-400 rounded-xl border border-white/10 hover:text-white hover:bg-white/5 cursor-pointer transition-all duration-200">
              Log in
            </button>
            <button
              onClick={onSignUp}
              className="relative w-full py-3 text-sm font-black text-white rounded-xl cursor-pointer active:scale-95 transition-all duration-200 overflow-hidden shadow-lg shadow-[#E87722]/20"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[#E87722] to-[#F4C21F]" />
              <span className="relative z-10">Start for Free ✦</span>
            </button>
          </div>

        </div>
      </div>

    </nav>
  );
};

export default NavBar;