import { useState } from "react";
import { HiCheckCircle, HiXCircle } from "react-icons/hi";
import { BsRocketTakeoff, BsShopWindow, BsStars } from "react-icons/bs";

const plans = [
  {
    type: "Start",
    price: "Free",
    duration: "just the first Month",
    badge: null,
    icon: <BsRocketTakeoff className="h-6 w-6" />,
    accent: "#6B7280",
    description: "Perfect for testing the waters and exploring what Bazario can do.",
    features: [
      { text: "1 Online Store", included: true },
      { text: "Up to 10 Products", included: true },
      { text: "Basic Analytics", included: true },
      { text: "Email Support", included: true },
      { text: "Bazario Subdomain", included: true },
      { text: "Custom Domain", included: false },
      { text: "Remove Bazario Branding", included: false },
      { text: "Marketing Tools", included: false },
    ],
  },
  {
    type: "Basic",
    price: "2,500",
    duration: "per month",
    badge: "Most Popular",
    icon: <BsShopWindow className="h-6 w-6" />,
    accent: "#E87722",
    description: "Everything you need to run a serious, growing online store.",
    features: [
      { text: "1 Online Store", included: true },
      { text: "Up to 100 Products", included: true },
      { text: "Advanced Analytics", included: true },
      { text: "Priority Support", included: true },
      { text: "Custom Domain", included: true },
      { text: "Remove Bazario Branding", included: true },
      { text: "Marketing Tools", included: false },
      { text: "Early Access to Features", included: false },
    ],
  },
  {
    type: "Premium",
    price: "4,500",
    duration: "per month",
    badge: "Best Value",
    icon: <BsStars className="h-6 w-6" />,
    accent: "#F4C21F",
    description: "Unlock the full power of Bazario and scale without any limits.",
    features: [
      { text: "Unlimited Stores", included: true },
      { text: "Unlimited Products", included: true },
      { text: "Full Analytics Suite", included: true },
      { text: "24/7 Dedicated Support", included: true },
      { text: "Custom Domain", included: true },
      { text: "Remove Bazario Branding", included: true },
      { text: "Marketing Tools", included: true },
      { text: "Early Access to Features", included: true },
    ],
  },
];

const Plans = () => {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="py-32 flex flex-col gap-20 items-center px-6 md:px-16 bg-[#fdf8f3] relative overflow-hidden">

      {/* Background decoration */}
      <div className="absolute top-0 right-0 h-96 w-96 bg-[#E87722] opacity-5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-96 w-96 bg-[#F4C21F] opacity-5 rounded-full blur-3xl pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(232,119,34,1) 1px, transparent 1px), linear-gradient(90deg, rgba(232,119,34,1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Header */}
      <section className="flex flex-col items-center gap-6 text-center z-10">
        <div className="flex items-center gap-3">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#E87722]" />
          <span className="text-xs font-bold tracking-[0.3em] text-[#E87722] uppercase">
            Choose your Plan
          </span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#E87722]" />
        </div>

        <h1 className="font-black text-6xl md:text-7xl text-gray-900 leading-none tracking-tight">
          Simple,{" "}
          <span className="bg-gradient-to-r from-[#E87722] to-[#F4C21F] bg-clip-text text-transparent">
            Honest
          </span>{" "}
          Pricing
        </h1>

        <p className="text-gray-500 max-w-md text-base leading-relaxed">
          Start for free and scale as you grow — no hidden fees, no surprises, cancel anytime.
        </p>

        {/* Trust badges */}
        <div className="flex flex-wrap gap-4 justify-center mt-2">
          {["No credit card required", "Cancel anytime", "Free forever plan"].map((badge) => (
            <span key={badge} className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <HiCheckCircle className="h-4 w-4 text-[#E87722]" />
              {badge}
            </span>
          ))}
        </div>
      </section>

      {/* Cards */}
      <section className="flex flex-col lg:flex-row gap-6 justify-center items-stretch w-full max-w-5xl z-10">
        {plans.map((plan) => {
          const isPopular = plan.badge === "Most Popular";
          const isBest = plan.badge === "Best Value";
          const isHovered = hovered === plan.type;

          return (
            <div
              key={plan.type}
              onMouseEnter={() => setHovered(plan.type)}
              onMouseLeave={() => setHovered(null)}
              className={`relative flex flex-col flex-1 rounded-3xl overflow-hidden transition-all duration-500 cursor-default
                ${isPopular ? "lg:-translate-y-4 shadow-2xl" : "shadow-md"}
                ${isHovered && !isPopular ? "-translate-y-2 shadow-xl" : ""}
              `}
              style={{
                boxShadow: isHovered ? `0 20px 60px ${plan.accent}25` : undefined,
              }}
            >
              {/* Top accent bar */}
              <div
                className="h-1.5 w-full"
                style={{ background: `linear-gradient(to right, ${plan.accent}, ${plan.accent}88)` }}
              />

              {/* Card body */}
              <div className={`flex flex-col flex-1 p-8 gap-6 ${isPopular ? "bg-gray-900" : "bg-white border border-gray-100"}`}>

                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-0 right-6">
                    <span
                      className="text-xs font-black px-4 py-1.5 rounded-b-xl text-white shadow-md"
                      style={{ backgroundColor: plan.accent }}
                    >
                      ✦ {plan.badge}
                    </span>
                  </div>
                )}

                {/* Icon + Plan type */}
                <div className="flex items-center gap-3">
                  <div
                    className="p-2.5 rounded-xl"
                    style={{ backgroundColor: `${plan.accent}22`, color: plan.accent, border: `1px solid ${plan.accent}44` }}
                  >
                    {plan.icon}
                  </div>
                  <div>
                    <h2 className={`font-black text-lg ${isPopular ? "text-white" : "text-gray-900"}`}>
                      {plan.type}
                    </h2>
                    <p className={`text-xs ${isPopular ? "text-gray-400" : "text-gray-400"}`}>
                      {plan.description}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-end gap-1">
                    {plan.price !== "Free" && (
                      <span className={`text-lg font-bold ${isPopular ? "text-gray-400" : "text-gray-400"}`}>DA</span>
                    )}
                    <span
                      className="text-5xl font-black leading-none"
                      style={{ color: isPopular ? "white" : plan.accent }}
                    >
                      {plan.price}
                    </span>
                  </div>
                  <p className={`text-xs ${isPopular ? "text-gray-400" : "text-gray-400"}`}>
                    {plan.duration}
                  </p>
                </div>

                {/* Divider */}
                <div
                  className="h-px w-full"
                  style={{ background: isPopular ? "rgba(255,255,255,0.1)" : "#f3f4f6" }}
                />

                {/* Features */}
                <ul className="flex flex-col gap-3 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-center gap-2.5 text-sm">
                      {feature.included ? (
                        <HiCheckCircle
                          className="h-5 w-5 shrink-0"
                          style={{ color: plan.accent }}
                        />
                      ) : (
                        <HiXCircle className="h-5 w-5 shrink-0 text-gray-300" />
                      )}
                      <span className={
                        feature.included
                          ? isPopular ? "text-gray-200" : "text-gray-700"
                          : "text-gray-300 line-through"
                      }>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  className={`w-full py-3.5 rounded-2xl font-black text-sm cursor-pointer active:scale-95 transition-all duration-200 mt-2
                    ${isPopular
                      ? "bg-gradient-to-r from-[#E87722] to-[#F4C21F] text-white shadow-lg shadow-[#E87722]/30 hover:shadow-[#E87722]/50"
                      : "text-white shadow-md hover:shadow-lg"
                    }`}
                  style={!isPopular ? {
                    background: `linear-gradient(to right, ${plan.accent}, ${plan.accent}cc)`,
                  } : undefined}
                >
                  {plan.price === "Free" ? "Get Started Free →" : "Get Started →"}
                </button>

              </div>
            </div>
          );
        })}
      </section>

      {/* Bottom note */}
      <div className="flex flex-col items-center gap-2 z-10 text-center">
        <p className="text-gray-400 text-sm">
          Need something custom?{" "}
          <span className="text-[#E87722] font-bold cursor-pointer hover:underline">Contact us</span>
        </p>
      </div>

    </div>
  );
};

export default Plans;