import { useState, useEffect } from "react";

const stats = [
  { value: "10K+", label: "Merchants" },
  { value: "98%", label: "Satisfaction" },
  { value: "3min", label: "Setup Time" },
  { value: "50+", label: "Templates" },
];

const Home = ({ onSignUp }: { onSignUp: () => void }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0a0500] overflow-hidden flex items-center">

      {/* Animated cursor glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(232,119,34,0.08), transparent 50%)`,
        }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(244,194,31,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(244,194,31,0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Big decorative text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black text-white/[0.02] select-none whitespace-nowrap z-0 pointer-events-none">
        BAZARIO
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-20 right-20 h-96 w-96 bg-[#E87722] opacity-15 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 h-64 w-64 bg-[#F4C21F] opacity-10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 h-48 w-48 bg-[#E87722] opacity-5 rounded-full blur-2xl" />

      {/* Main Content */}
      <div className="relative z-10 w-full flex flex-col lg:flex-row items-center justify-between px-6 md:px-16 py-20 gap-16">

        {/* Left — Text */}
        <section className={`flex flex-col gap-8 max-w-2xl transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>

          {/* Badge */}
          <div className="flex items-center gap-3 self-start">
            <div className="h-2 w-2 rounded-full bg-[#E87722] animate-ping" />
            <span className="text-[#E87722] text-xs font-bold tracking-[0.3em] uppercase">
              Now Live — Launch your Store Today
            </span>
          </div>

          {/* Heading */}
          <div className="flex flex-col gap-2">
            <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.95] tracking-tight">
              Build Your
            </h1>
            <h1 className="text-5xl md:text-7xl font-black leading-[0.95] tracking-tight bg-gradient-to-r from-[#E87722] via-[#F4C21F] to-[#E87722] bg-clip-text text-transparent">
              Dream Store.
            </h1>
            <h1 className="text-5xl md:text-7xl font-black text-white/30 leading-[0.95] tracking-tight">
              Start Selling.
            </h1>
          </div>

          {/* Description */}
          <p className="text-gray-400 text-lg leading-relaxed max-w-md border-l-2 border-[#E87722]/50 pl-4">
            Bazario gives merchants everything they need to launch a professional
            online store — no code, no complexity, just results.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onSignUp}
              className="group relative px-8 py-4 bg-gradient-to-r from-[#E87722] to-[#F4C21F] text-white font-black text-lg rounded-2xl cursor-pointer active:scale-95 transition-all duration-200 shadow-lg shadow-[#E87722]/30 hover:shadow-[#E87722]/60 overflow-hidden"
            >
              <span className="relative z-10">Build my FREE Store ✦</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
            </button>
            <button
              onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-4 border border-white/20 text-white font-bold text-lg rounded-2xl cursor-pointer hover:border-[#E87722]/60 hover:text-[#E87722] hover:bg-[#E87722]/5 active:scale-95 transition-all duration-200 backdrop-blur-sm"
            >
              Explore →
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4 pt-4 border-t border-white/10">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <span className="text-2xl font-black bg-gradient-to-r from-[#E87722] to-[#F4C21F] bg-clip-text text-transparent">
                  {stat.value}
                </span>
                <span className="text-gray-500 text-xs uppercase tracking-widest">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

        </section>

        {/* Right — Image */}
        <div className={`relative flex-shrink-0 transition-all duration-1000 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>

          {/* Decorative ring */}
          <div className="absolute -inset-4 rounded-3xl border border-[#E87722]/20 rotate-3" />
          <div className="absolute -inset-8 rounded-3xl border border-[#F4C21F]/10 -rotate-2" />

          {/* Floating tag 1 */}
          <div className="absolute -top-6 -left-6 z-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-xl">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white text-xs font-semibold">Store is Live</span>
          </div>

          {/* Floating tag 2 */}
          <div className="absolute -bottom-6 -right-6 z-20 bg-gradient-to-r from-[#E87722] to-[#F4C21F] rounded-2xl px-4 py-3 shadow-xl">
            <span className="text-white text-xs font-black">+124 orders today 🚀</span>
          </div>

          {/* Glow behind image */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#E87722]/40 to-[#F4C21F]/20 rounded-3xl blur-3xl scale-110" />

          <img
            className="relative z-10 h-64 sm:h-80 md:h-[580px] w-auto rounded-3xl shadow-2xl hover:scale-[1.02] transition-transform duration-500 object-cover"
            src="./src/Pictures/baz-lan.png"
            alt="Bazario Store Preview"
          />
        </div>

      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0500] to-transparent pointer-events-none z-10" />

    </div>
  );
};

export default Home;