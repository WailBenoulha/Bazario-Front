import { GiClothes, GiLipstick, GiNecklace } from "react-icons/gi";
import { MdDevices, MdFastfood, MdSportsSoccer } from "react-icons/md";
import { FaBookOpen } from "react-icons/fa";
import { HiArrowRight } from "react-icons/hi";
import { useState } from "react";

const sections = [
  {
    img: "./src/Pictures/clothes-pr.jpg",
    title: "Fashion",
    subtitle: "Style & Apparel",
    icon: <GiClothes className="h-7 w-7" />,
    description: "Launch your clothing brand with stylish templates built for apparel, accessories, and more.",
    tag: "Trending",
    accent: "#E87722",
    light: "#FFF3E8",
    span: "col-span-2",
    stores: "2.4k stores",
  },
  {
    img: "./src/Pictures/electro-pr.jpg",
    title: "Electronics",
    subtitle: "Tech & Gadgets",
    icon: <MdDevices className="h-7 w-7" />,
    description: "Sell gadgets, devices, and tech accessories with a clean, modern store layout.",
    tag: "Popular",
    accent: "#2EA7F2",
    light: "#E8F5FF",
    span: "col-span-1",
    stores: "1.8k stores",
  },
  {
    img: "./src/Pictures/cosmetique.jpg",
    title: "Cosmetics",
    subtitle: "Beauty & Glow",
    icon: <GiLipstick className="h-7 w-7" />,
    description: "Showcase beauty products with elegant designs that convert browsers into buyers.",
    tag: null,
    accent: "#F4C21F",
    light: "#FFFBE8",
    span: "col-span-1",
    stores: "980 stores",
  },
  {
    img: "./src/Pictures/food-pr.jpg",
    title: "Food & Drinks",
    subtitle: "Taste & Flavor",
    icon: <MdFastfood className="h-7 w-7" />,
    description: "From homemade treats to restaurant delivery — build a delicious online presence.",
    tag: "🔥 Hot",
    accent: "#E87722",
    light: "#FFF3E8",
    span: "col-span-1",
    stores: "3.1k stores",
  },
  {
    img: "./src/Pictures/Accessories.jpg",
    title: "Accessories",
    subtitle: "Bags & Jewelry",
    icon: <GiNecklace className="h-7 w-7" />,
    description: "From handbags to jewelry — curate a stunning accessories store that keeps customers coming back.",
    tag: "New",
    accent: "#F4C21F",
    light: "#FFFBE8",
    span: "col-span-1",
    stores: "540 stores",
  },
  {
    img: "./src/Pictures/sport.jpg",
    title: "Sports",
    subtitle: "Energy & Gear",
    icon: <MdSportsSoccer className="h-7 w-7" />,
    description: "Gear up your customers with a high-energy store for sports equipment and activewear.",
    tag: null,
    accent: "#2EA7F2",
    light: "#E8F5FF",
    span: "col-span-2",
    stores: "1.2k stores",
  },
  {
    img: "./src/Pictures/books-pr.jpg",
    title: "Education",
    subtitle: "Books & Courses",
    icon: <FaBookOpen className="h-7 w-7" />,
    description: "Sell books, courses, and educational content with a clean and professional storefront.",
    tag: null,
    accent: "#F4C21F",
    light: "#FFFBE8",
    span: "col-span-1",
    stores: "320 stores",
  },
];

const Categories = () => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center py-32 px-6 md:px-16 gap-20 bg-[#fdf8f3] relative overflow-hidden">

      {/* Soft background orbs */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] bg-[#E87722] opacity-[0.06] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] bg-[#2EA7F2] opacity-[0.06] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 h-64 w-64 bg-[#F4C21F] opacity-[0.06] rounded-full blur-3xl pointer-events-none" />

      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #E8772222 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Header */}
      <section className="flex flex-col items-center gap-6 text-center z-10 max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#E87722]" />
          <span className="text-xs font-black tracking-[0.4em] text-[#E87722] uppercase">
            Choose your niche
          </span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#E87722]" />
        </div>

        <h1 className="font-black text-6xl md:text-7xl text-gray-900 leading-[0.9] tracking-tight">
          Find Your{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-[#E87722] to-[#F4C21F] bg-clip-text text-transparent">
              Perfect
            </span>
            {/* Underline decoration */}
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
              <path d="M0 6 Q50 0 100 4 Q150 8 200 2" stroke="url(#grad)" strokeWidth="3" strokeLinecap="round" fill="none"/>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#E87722"/>
                  <stop offset="1" stopColor="#F4C21F"/>
                </linearGradient>
              </defs>
            </svg>
          </span>{" "}
          Niche
        </h1>

        <p className="text-gray-500 max-w-md text-base leading-relaxed mt-2">
          Pick your market and launch a beautifully crafted store — tailored templates and tools included for every niche.
        </p>

        {/* Store count badges */}
        <div className="flex flex-wrap gap-3 justify-center mt-2">
          {["7 Niches", "10,000+ Stores", "50+ Templates", "Free to Start"].map((badge) => (
            <span
              key={badge}
              className="text-xs font-bold px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-600 shadow-sm"
            >
              {badge}
            </span>
          ))}
        </div>
      </section>

      {/* Bento Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-6xl z-10">
        {sections.map((section) => (
          <div
            key={section.title}
            onMouseEnter={() => setHovered(section.title)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => setSelected(section.title === selected ? null : section.title)}
            className={`relative group rounded-3xl overflow-hidden cursor-pointer
              ${section.span === "col-span-2" ? "lg:col-span-2 h-80" : "lg:col-span-1 h-72"}
              transition-all duration-500 ease-out
              ${hovered && hovered !== section.title ? "opacity-30 scale-[0.97] blur-[1px]" : "opacity-100 scale-100 blur-0"}
            `}
            style={{
              boxShadow: hovered === section.title
                ? `0 24px 60px ${section.accent}30, 0 0 0 2px ${section.accent}40`
                : "0 4px 20px rgba(0,0,0,0.08)",
            }}
          >
            {/* Image */}
            <img
              src={section.img}
              alt={section.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Base dark overlay */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500" />

            {/* Gradient overlay */}
            <div
              className="absolute inset-0 transition-all duration-500"
              style={{
                background: `linear-gradient(to top, ${section.accent}f0 0%, ${section.accent}60 35%, transparent 70%)`,
                opacity: hovered === section.title ? 1 : 0.8,
              }}
            />

            {/* Top-right glow on hover */}
            {hovered === section.title && (
              <div
                className="absolute -top-10 -right-10 h-32 w-32 rounded-full blur-2xl opacity-60 pointer-events-none"
                style={{ backgroundColor: section.accent }}
              />
            )}

            {/* Tag */}
            {section.tag && (
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-white/90 backdrop-blur-md text-gray-800 text-xs font-black px-3 py-1.5 rounded-full shadow-md border border-white">
                  {section.tag}
                </span>
              </div>
            )}

            {/* Store count */}
            <div className="absolute top-4 right-16 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <span className="bg-black/30 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20">
                {section.stores}
              </span>
            </div>

            {/* Icon */}
            <div
              className="absolute top-4 right-4 z-10 p-2.5 rounded-2xl backdrop-blur-md border border-white/40 text-white transition-all duration-300 group-hover:scale-125 group-hover:rotate-6 shadow-lg"
              style={{ backgroundColor: `${section.accent}99` }}
            >
              {section.icon}
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10 flex flex-col gap-1.5">
              <p className="text-white/70 text-xs font-bold uppercase tracking-[0.2em]">
                {section.subtitle}
              </p>
              <h2 className="text-white font-black text-2xl md:text-3xl leading-tight drop-shadow-lg">
                {section.title}
              </h2>

              {/* Description */}
              <p className="text-white/85 text-sm leading-relaxed max-h-0 opacity-0 group-hover:max-h-24 group-hover:opacity-100 transition-all duration-500 overflow-hidden mt-1">
                {section.description}
              </p>

              {/* CTA row */}
              <div className="flex items-center justify-between mt-2 opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-y-1 group-hover:translate-y-0">
                <button className="flex items-center gap-2 px-5 py-2 text-sm font-black rounded-full text-gray-900 bg-white hover:bg-orange-50 transition-all duration-200 shadow-lg">
                  Start this Store
                  <HiArrowRight className="h-4 w-4" />
                </button>
                <span className="text-white/60 text-xs font-bold">
                  {section.stores}
                </span>
              </div>
            </div>

          </div>
        ))}
      </section>

      {/* Bottom CTA */}
      <div className="flex flex-col items-center gap-6 z-10 text-center">
        <div className="flex flex-col items-center gap-2">
          <p className="text-gray-400 text-sm font-medium">Don't see your niche?</p>
          <p className="text-gray-300 text-xs">We're adding new categories every month</p>
        </div>
        <button className="group cursor-pointer flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#E87722] to-[#F4C21F] text-white font-black rounded-full hover:from-[#2EA7F2] hover:to-[#2EA7F2] transition-all duration-300 active:scale-95 shadow-xl shadow-[#E87722]/25 text-base">
          Request a Custom Niche
          <span className="bg-white/20 px-2 py-0.5 rounded-md text-sm group-hover:bg-white/30 transition-all duration-200">✦</span>
        </button>
      </div>

    </div>
  );
};

export default Categories;