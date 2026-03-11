import { useState } from "react";
import { HiStar, HiArrowRight } from "react-icons/hi";
import { BsShopWindow } from "react-icons/bs";
import { GiClothes, GiLipstick } from "react-icons/gi";
import { MdDevices, MdFastfood, MdSportsSoccer } from "react-icons/md";
import { FaBookOpen } from "react-icons/fa";

const stores = [
  {
    name: "UrbanThread",
    category: "Fashion",
    icon: <GiClothes className="h-5 w-5" />,
    description: "A premium clothing brand with minimalist aesthetics and bold seasonal collections.",
    rating: 4.9,
    sales: "12.4k",
    accent: "#E87722",
    tag: "Top Seller",
    img: "./src/Pictures/urban.jpg",
    products: 148,
  },
  {
    name: "GlowUp Beauty",
    category: "Cosmetics",
    icon: <GiLipstick className="h-5 w-5" />,
    description: "Cruelty-free beauty essentials loved by thousands of customers across Algeria.",
    rating: 4.8,
    sales: "8.1k",
    accent: "#F4C21F",
    tag: "Trending",
    img: "./src/Pictures/glowup.jpg",
    products: 93,
  },
  {
    name: "TechNest",
    category: "Electronics",
    icon: <MdDevices className="h-5 w-5" />,
    description: "The go-to destination for the latest gadgets, accessories, and smart home devices.",
    rating: 4.7,
    sales: "21.3k",
    accent: "#2EA7F2",
    tag: "Most Visited",
    img: "./src/Pictures/technest.jpg",
    products: 312,
  },
  {
    name: "Savoria",
    category: "Food & Drinks",
    icon: <MdFastfood className="h-5 w-5" />,
    description: "Artisan food products, homemade recipes, and premium ingredients delivered fast.",
    rating: 4.9,
    sales: "5.6k",
    accent: "#E87722",
    tag: "Fan Favorite",
    img: "./src/Pictures/savoria.jpg",
    products: 67,
  },
  {
    name: "ProZone",
    category: "Sports",
    icon: <MdSportsSoccer className="h-5 w-5" />,
    description: "Professional sports gear for athletes and fitness enthusiasts at every level.",
    rating: 4.6,
    sales: "9.8k",
    accent: "#2EA7F2",
    tag: null,
    img: "./src/Pictures/prozone.jpg",
    products: 204,
  },
  {
    name: "MindScape",
    category: "Education",
    icon: <FaBookOpen className="h-5 w-5" />,
    description: "Curated books, online courses, and learning resources for curious minds.",
    rating: 4.8,
    sales: "3.2k",
    accent: "#F4C21F",
    tag: "Rising Star",
    img: "./src/Pictures/mindscape.jpg",
    products: 55,
  },
];

const filters = ["All", "Fashion", "Cosmetics", "Electronics", "Food & Drinks", "Sports", "Education"];

const Shop = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [hovered, setHovered] = useState<string | null>(null);

  const filtered = activeFilter === "All"
    ? stores
    : stores.filter((s) => s.category === activeFilter);

  return (
    <div className="flex flex-col items-center py-32 px-6 md:px-16 gap-16 bg-[#0a0500] relative overflow-hidden">

      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(244,194,31,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(244,194,31,0.5) 1px, transparent 1px)`,
          backgroundSize: "70px 70px",
        }}
      />

      {/* Glowing orbs */}
      <div className="absolute top-20 left-10 h-96 w-96 bg-[#E87722] opacity-5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 h-80 w-80 bg-[#2EA7F2] opacity-5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <section className="flex flex-col items-center gap-6 text-center z-10">
        <div className="flex items-center gap-3">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#E87722]" />
          <span className="text-xs font-bold tracking-[0.3em] text-[#E87722] uppercase">
            Inspire from Others
          </span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#E87722]" />
        </div>

        <h1 className="font-black text-6xl md:text-7xl text-white leading-none tracking-tight">
          Store{" "}
          <span className="bg-gradient-to-r from-[#E87722] to-[#F4C21F] bg-clip-text text-transparent">
            Inspiration
          </span>
        </h1>

        <p className="text-gray-400 max-w-md text-base leading-relaxed">
          Explore real stores built on Bazario — see what's possible and launch yours today.
        </p>
      </section>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-3 justify-center z-10">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 cursor-pointer border
              ${activeFilter === filter
                ? "bg-gradient-to-r from-[#E87722] to-[#F4C21F] text-white border-transparent shadow-lg shadow-[#E87722]/30"
                : "bg-white/5 text-gray-400 border-white/10 hover:border-[#E87722]/40 hover:text-white"
              }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Store Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl z-10">
        {filtered.map((store) => (
          <div
            key={store.name}
            onMouseEnter={() => setHovered(store.name)}
            onMouseLeave={() => setHovered(null)}
            className={`relative flex flex-col rounded-3xl overflow-hidden border transition-all duration-500 cursor-pointer group
              ${hovered === store.name
                ? "border-[#E87722]/40 shadow-2xl -translate-y-2"
                : "border-white/5 shadow-none translate-y-0"
              }`}
            style={{
              boxShadow: hovered === store.name ? `0 20px 60px ${store.accent}20` : undefined,
            }}
          >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={store.img}
                alt={store.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0600] via-black/20 to-transparent" />

              {/* Tag */}
              {store.tag && (
                <span
                  className="absolute top-4 left-4 text-xs font-black px-3 py-1.5 rounded-full text-white"
                  style={{ backgroundColor: `${store.accent}cc` }}
                >
                  {store.tag}
                </span>
              )}

              {/* Category pill */}
              <div
                className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20 text-white text-xs font-bold"
                style={{ backgroundColor: `${store.accent}44` }}
              >
                {store.icon}
                {store.category}
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-4 p-6 bg-[#0d0600] flex-1">

              {/* Store name + rating */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className="p-2 rounded-xl"
                    style={{ backgroundColor: `${store.accent}22`, border: `1px solid ${store.accent}44` }}
                  >
                    <BsShopWindow className="h-4 w-4" style={{ color: store.accent }} />
                  </div>
                  <h2 className="text-white font-black text-lg">{store.name}</h2>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <HiStar className="h-4 w-4 text-[#F4C21F]" />
                  <span className="text-white text-sm font-bold">{store.rating}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-400 text-sm leading-relaxed">{store.description}</p>

              {/* Stats */}
              <div className="flex items-center gap-4 pt-2 border-t border-white/5">
                <div className="flex flex-col">
                  <span className="text-white font-black text-lg">{store.sales}</span>
                  <span className="text-gray-500 text-xs uppercase tracking-widest">Sales</span>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="flex flex-col">
                  <span className="text-white font-black text-lg">{store.products}</span>
                  <span className="text-gray-500 text-xs uppercase tracking-widest">Products</span>
                </div>
                <button
                  className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300
                    ${hovered === store.name ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}
                  style={{
                    backgroundColor: `${store.accent}22`,
                    color: store.accent,
                    border: `1px solid ${store.accent}44`,
                  }}
                >
                  Visit <HiArrowRight className="h-4 w-4" />
                </button>
              </div>

            </div>

            {/* Bottom glow line */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-500 ${hovered === store.name ? "opacity-100" : "opacity-0"}`}
              style={{ background: `linear-gradient(to right, transparent, ${store.accent}, transparent)` }}
            />
          </div>
        ))}
      </section>

      {/* Bottom CTA */}
      <div className="flex flex-col items-center gap-4 z-10 text-center">
        <p className="text-gray-500 text-sm">Ready to build yours?</p>
        <button className="px-8 py-4 bg-gradient-to-r from-[#E87722] to-[#F4C21F] text-white font-black rounded-full hover:from-[#2EA7F2] hover:to-[#2EA7F2] cursor-pointer active:scale-95 transition-all duration-300 shadow-lg shadow-[#E87722]/30 text-base">
          Inspire from other Stores ✦
        </button>
      </div>

    </div>
  );
};

export default Shop;