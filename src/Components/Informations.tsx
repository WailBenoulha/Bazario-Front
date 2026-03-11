import { useState } from "react";
import { HiCheckCircle } from "react-icons/hi";
import { BsRocketTakeoff, BsBarChartFill, BsGlobeAmericas } from "react-icons/bs";

const sections = [
  {
    img: "./src/Pictures/bus1.jpg",
    title: "Built for Entrepreneurs",
    description:
      "Bazario was created with one goal in mind — to make launching an online store as simple as possible. Whether you're a solo founder or a growing business, our platform adapts to your needs and scales with you.",
    reverse: false,
    icon: <BsRocketTakeoff className="h-6 w-6" />,
    accent: "#E87722",
    tag: "Get Started Fast",
    perks: ["No coding required", "Launch in minutes", "Mobile-ready stores"],
  },
  {
    img: "./src/Pictures/bus2.jpg",
    title: "Powerful Tools, Zero Complexity",
    description:
      "From inventory management to customer analytics, Bazario gives you everything you need in one clean dashboard. No plugins, no complicated setups — just powerful tools that work out of the box.",
    reverse: true,
    icon: <BsBarChartFill className="h-6 w-6" />,
    accent: "#2EA7F2",
    tag: "All-in-One Dashboard",
    perks: ["Real-time analytics", "Inventory tracking", "Order management"],
  },
  {
    img: "./src/Pictures/bus3.jpg",
    title: "Grow Without Limits",
    description:
      "As your business grows, Bazario grows with you. Upgrade your plan at any time, unlock advanced features, and reach customers across Algeria and beyond with our built-in marketing and SEO tools.",
    reverse: false,
    icon: <BsGlobeAmericas className="h-6 w-6" />,
    accent: "#F4C21F",
    tag: "Scale Globally",
    perks: ["SEO built-in", "Marketing tools", "Multi-region support"],
  },
];

const Informations = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="py-32 flex flex-col gap-8 items-center bg-[#0a0500] relative overflow-hidden">

      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(244,194,31,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(244,194,31,0.4) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Glowing orbs */}
      <div className="absolute top-40 left-0 h-80 w-80 bg-[#E87722] opacity-5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-40 right-0 h-80 w-80 bg-[#2EA7F2] opacity-5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <section className="flex flex-col items-center gap-6 text-center px-6 z-10 mb-16">
        <div className="flex items-center gap-3">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#E87722]" />
          <span className="text-xs font-bold tracking-[0.3em] text-[#E87722] uppercase">
            Who We Are
          </span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#E87722]" />
        </div>
        <h1 className="font-black text-6xl md:text-7xl text-white leading-none tracking-tight">
          Why Choose{" "}
          <span className="bg-gradient-to-r from-[#E87722] to-[#F4C21F] bg-clip-text text-transparent">
            Bazario
          </span>
        </h1>
        <p className="text-gray-400 max-w-lg text-base leading-relaxed">
          We're on a mission to empower Algerian merchants with world-class
          e-commerce tools — affordable, simple, and built for growth.
        </p>
      </section>

      {/* Sections */}
      <div className="flex flex-col gap-4 w-full px-6 md:px-16 max-w-7xl z-10">
        {sections.map((section, index) => (
          <div
            key={index}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`relative flex flex-col ${section.reverse ? "md:flex-row-reverse" : "md:flex-row"} 
              items-stretch gap-0 rounded-3xl overflow-hidden border transition-all duration-500 cursor-default
              ${hoveredIndex === index
                ? "border-[#E87722]/40 shadow-2xl shadow-[#E87722]/10"
                : "border-white/5 shadow-none"
              }`}
          >
            {/* Image Side */}
            <div className="relative w-full md:w-1/2 min-h-72 overflow-hidden">
              <img
                src={section.img}
                alt={section.title}
                className={`w-full h-full object-cover transition-transform duration-700 ${hoveredIndex === index ? "scale-110" : "scale-100"}`}
              />
              {/* Image overlay */}
              <div
                className="absolute inset-0 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(to ${section.reverse ? "left" : "right"}, transparent 50%, #0a0500 100%)`,
                }}
              />
              {/* Dark base overlay */}
              <div className="absolute inset-0 bg-black/30" />

              {/* Floating step number on image */}
              <div className="absolute top-6 left-6 flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-xl text-white transition-all duration-300"
                  style={{ backgroundColor: `${section.accent}33`, border: `1px solid ${section.accent}55` }}
                >
                  {section.icon}
                </div>
                <span
                  className="text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full backdrop-blur-sm"
                  style={{ color: section.accent, backgroundColor: `${section.accent}22`, border: `1px solid ${section.accent}44` }}
                >
                  {section.tag}
                </span>
              </div>
            </div>

            {/* Text Side */}
            <div className="relative w-full md:w-1/2 bg-[#0d0600] flex flex-col justify-center gap-6 p-10 md:p-14">

              {/* Step number watermark */}
              <span
                className="absolute top-4 right-8 text-8xl font-black opacity-[0.04] select-none pointer-events-none"
                style={{ color: section.accent }}
              >
                0{index + 1}
              </span>

              {/* Title */}
              <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
                {section.title}
              </h2>

              {/* Description */}
              <p className="text-gray-400 text-base leading-relaxed">
                {section.description}
              </p>

              {/* Perks */}
              <ul className="flex flex-col gap-2.5">
                {section.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-3 text-sm text-gray-300">
                    <HiCheckCircle
                      className="h-5 w-5 shrink-0 transition-colors duration-300"
                      style={{ color: section.accent }}
                    />
                    {perk}
                  </li>
                ))}
              </ul>

              {/* Accent line */}
              <div
                className={`h-0.5 rounded-full transition-all duration-500 ${hoveredIndex === index ? "w-24" : "w-10"}`}
                style={{ background: `linear-gradient(to right, ${section.accent}, transparent)` }}
              />

              {/* CTA */}
              <button
                className={`self-start px-6 py-3 text-sm font-bold rounded-xl text-white transition-all duration-300 border
                  ${hoveredIndex === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
                style={{
                  backgroundColor: `${section.accent}22`,
                  borderColor: `${section.accent}44`,
                  color: section.accent,
                }}
              >
                Learn More →
              </button>

            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Informations;