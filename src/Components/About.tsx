import { useState } from "react";
import { HiMiniCheckBadge } from "react-icons/hi2";
import { LiaStoreSolid } from "react-icons/lia";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { useLang } from "./Translations";

export default function About() {
  const { t, lang } = useLang();
  const isAr = lang === "ar";
  const [hovered, setHovered] = useState<string | null>(null);

  const steps = [
    { icon:<HiMiniCheckBadge className="h-10 w-10 text-white"/>, step:"01", accent:"#E87722",
      title:t("about_step1_title"), description:t("about_step1_desc"),
      perks:[t("about_step1_p1"), t("about_step1_p2"), t("about_step1_p3")] },
    { icon:<LiaStoreSolid className="h-10 w-10 text-white"/>, step:"02", accent:"#2EA7F2",
      title:t("about_step2_title"), description:t("about_step2_desc"),
      perks:[t("about_step2_p1"), t("about_step2_p2"), t("about_step2_p3")] },
    { icon:<FaMoneyBillTrendUp className="h-10 w-10 text-white"/>, step:"03", accent:"#F4C21F",
      title:t("about_step3_title"), description:t("about_step3_desc"),
      perks:[t("about_step3_p1"), t("about_step3_p2"), t("about_step3_p3")] },
  ];

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="py-32 flex flex-col gap-20 items-center px-6 md:px-16 bg-[#fdf8f3] relative overflow-hidden">

      {/* Background decoration */}
      <div className="absolute top-0 left-0 h-96 w-96 bg-[#E87722] opacity-5 rounded-full blur-3xl pointer-events-none"/>
      <div className="absolute bottom-0 right-0 h-96 w-96 bg-[#2EA7F2] opacity-5 rounded-full blur-3xl pointer-events-none"/>

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage:`linear-gradient(rgba(232,119,34,1) 1px,transparent 1px),linear-gradient(90deg,rgba(232,119,34,1) 1px,transparent 1px)`, backgroundSize:"60px 60px" }}/>

      {/* Header */}
      <section className="flex flex-col items-center gap-6 text-center z-10">
        <div className="flex items-center gap-3">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#E87722]"/>
          <span className="text-xs font-bold tracking-[0.3em] text-[#E87722] uppercase">{t("about_eyebrow")}</span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#E87722]"/>
        </div>
        <h1 className="font-black text-6xl md:text-7xl text-gray-900 leading-none tracking-tight">
          {t("about_title")}{" "}
          <span className="bg-gradient-to-r from-[#E87722] to-[#F4C21F] bg-clip-text text-transparent">{t("about_title_2")}</span>
        </h1>
        <p className="text-gray-500 max-w-md text-base leading-relaxed">{t("about_sub")}</p>
      </section>

      {/* Connector + Steps */}
      <section className="relative w-full max-w-5xl z-10">

        {/* Horizontal connector line (desktop) */}
        <div className="hidden md:block absolute top-16 left-[15%] right-[15%] h-px bg-gradient-to-r from-[#E87722]/30 via-[#F4C21F]/60 to-[#E87722]/30 z-0"/>

        <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
          {steps.map((step, index) => (
            <div key={step.step}
              onMouseEnter={() => setHovered(step.step)}
              onMouseLeave={() => setHovered(null)}
              className={`relative flex flex-col gap-6 flex-1 bg-white rounded-3xl p-8 border transition-all duration-500 cursor-default
                ${hovered === step.step ? "shadow-2xl -translate-y-3 border-transparent" : "shadow-md border-gray-100 translate-y-0"}`}
              style={{ boxShadow: hovered === step.step ? `0 20px 60px ${step.accent}25` : undefined }}>

              {/* Top glow bar */}
              <div className={`absolute top-0 left-8 right-8 h-0.5 rounded-full transition-all duration-500 ${hovered === step.step ? "opacity-100" : "opacity-0"}`}
                style={{ background:`linear-gradient(to right,transparent,${step.accent},transparent)` }}/>

              {/* Step number + connector dot */}
              <div className="flex items-center justify-between">
                <span className="text-5xl font-black opacity-10 select-none leading-none" style={{ color:step.accent }}>{step.step}</span>
                <div className={`hidden md:flex absolute -top-[2.15rem] left-1/2 -translate-x-1/2 h-4 w-4 rounded-full border-2 border-white shadow-md transition-all duration-300 z-10
                    ${hovered === step.step ? "scale-150" : "scale-100"}`}
                  style={{ backgroundColor:step.accent }}/>
              </div>

              {/* Icon */}
              <div className={`self-start p-4 rounded-2xl shadow-lg transition-all duration-300 ${hovered === step.step ? "scale-110" : "scale-100"}`}
                style={{ background:`linear-gradient(135deg,${step.accent},${step.accent}bb)` }}>
                {step.icon}
              </div>

              {/* Text */}
              <div className="flex flex-col gap-2">
                <h2 className="font-black text-xl text-gray-900">{step.title}</h2>
                <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
              </div>

              {/* Perks */}
              <ul className="flex flex-col gap-2 mt-auto pt-4 border-t border-gray-100">
                {step.perks.map(perk => (
                  <li key={perk} className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor:step.accent }}/>
                    {perk}
                  </li>
                ))}
              </ul>

              {/* Arrow between cards */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute -right-5 top-1/2 -translate-y-1/2 z-20 text-lg font-black" style={{ color:step.accent }}>→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <div className="flex flex-col items-center gap-4 z-10 text-center">
        <p className="text-gray-400 text-sm">{isAr ? "جاهز تبدا؟" : "Ready to get started?"}</p>
        <button className="px-8 py-4 bg-gradient-to-r from-[#E87722] to-[#F4C21F] text-white font-black rounded-full hover:from-[#2EA7F2] hover:to-[#2EA7F2] cursor-pointer active:scale-95 transition-all duration-300 shadow-lg shadow-[#E87722]/30 text-base">
          {t("hero_cta_main")}
        </button>
      </div>
    </div>
  );
}