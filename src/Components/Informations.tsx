import { useState } from "react";
import { HiCheckCircle } from "react-icons/hi";
import { BsRocketTakeoff, BsBarChartFill, BsGlobeAmericas } from "react-icons/bs";
import { useLang } from "./Translations";

export default function Informations() {
  const { t, lang } = useLang();
  const isAr = lang === "ar";
  const [hovered, setHovered] = useState<number|null>(null);

  const sections = [
    { img:"./src/Pictures/bus1.jpg", reverse:false, accent:"#E87722", icon:<BsRocketTakeoff className="h-6 w-6"/>,
      tag:t("info_1_tag"), title:t("info_1_title"), desc:t("info_1_desc"),
      perks:[t("info_1_p1"),t("info_1_p2"),t("info_1_p3")] },
    { img:"./src/Pictures/bus2.jpg", reverse:true, accent:"#2EA7F2", icon:<BsBarChartFill className="h-6 w-6"/>,
      tag:t("info_2_tag"), title:t("info_2_title"), desc:t("info_2_desc"),
      perks:[t("info_2_p1"),t("info_2_p2"),t("info_2_p3")] },
    { img:"./src/Pictures/bus3.jpg", reverse:false, accent:"#F4C21F", icon:<BsGlobeAmericas className="h-6 w-6"/>,
      tag:t("info_3_tag"), title:t("info_3_title"), desc:t("info_3_desc"),
      perks:[t("info_3_p1"),t("info_3_p2"),t("info_3_p3")] },
  ];

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="py-32 flex flex-col gap-8 items-center bg-[#0a0500] relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage:`linear-gradient(rgba(244,194,31,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(244,194,31,0.4) 1px,transparent 1px)`, backgroundSize:"80px 80px" }}/>
      <div className="absolute top-40 left-0 h-80 w-80 bg-[#E87722] opacity-5 rounded-full blur-3xl pointer-events-none"/>
      <div className="absolute bottom-40 right-0 h-80 w-80 bg-[#2EA7F2] opacity-5 rounded-full blur-3xl pointer-events-none"/>

      <section className="flex flex-col items-center gap-6 text-center px-6 z-10 mb-16">
        <div className="flex items-center gap-3">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#E87722]"/>
          <span className="text-xs font-bold tracking-[0.3em] text-[#E87722] uppercase">{t("info_eyebrow")}</span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#E87722]"/>
        </div>
        <h1 className="font-black text-6xl md:text-7xl text-white leading-none tracking-tight">
          {t("info_title")}{" "}<span className="bg-gradient-to-r from-[#E87722] to-[#F4C21F] bg-clip-text text-transparent">Bazario</span>
        </h1>
        <p className="text-gray-400 max-w-lg text-base leading-relaxed">{t("info_sub")}</p>
      </section>

      <div className="flex flex-col gap-4 w-full px-6 md:px-16 max-w-7xl z-10">
        {sections.map((s, i) => (
          <div key={i} onMouseEnter={()=>setHovered(i)} onMouseLeave={()=>setHovered(null)}
            className={`relative flex flex-col ${s.reverse?"md:flex-row-reverse":"md:flex-row"} items-stretch gap-0 rounded-3xl overflow-hidden border transition-all duration-500 cursor-default
              ${hovered===i?"border-[#E87722]/40 shadow-2xl shadow-[#E87722]/10":"border-white/5 shadow-none"}`}>
            <div className="relative w-full md:w-1/2 min-h-72 overflow-hidden">
              <img src={s.img} alt={s.title} className={`w-full h-full object-cover transition-transform duration-700 ${hovered===i?"scale-110":"scale-100"}`}/>
              <div className="absolute inset-0 transition-opacity duration-500"
                style={{ background:`linear-gradient(to ${s.reverse?"left":"right"},transparent 50%,#0a0500 100%)` }}/>
              <div className="absolute inset-0 bg-black/30"/>
              <div className="absolute top-6 left-6 flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl text-white transition-all duration-300"
                  style={{ backgroundColor:`${s.accent}33`, border:`1px solid ${s.accent}55` }}>{s.icon}</div>
                <span className="text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full backdrop-blur-sm"
                  style={{ color:s.accent, backgroundColor:`${s.accent}22`, border:`1px solid ${s.accent}44` }}>{s.tag}</span>
              </div>
            </div>
            <div className="relative w-full md:w-1/2 bg-[#0d0600] flex flex-col justify-center gap-6 p-10 md:p-14">
              <span className="absolute top-4 right-8 text-8xl font-black opacity-[0.04] select-none pointer-events-none" style={{ color:s.accent }}>0{i+1}</span>
              <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">{s.title}</h2>
              <p className="text-gray-400 text-base leading-relaxed">{s.desc}</p>
              <ul className="flex flex-col gap-2.5">
                {s.perks.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-sm text-gray-300">
                    <HiCheckCircle className="h-5 w-5 shrink-0" style={{ color:s.accent }}/>{p}
                  </li>
                ))}
              </ul>
              <div className={`h-0.5 rounded-full transition-all duration-500 ${hovered===i?"w-24":"w-10"}`}
                style={{ background:`linear-gradient(to right,${s.accent},transparent)` }}/>
              <button className={`self-start px-6 py-3 text-sm font-bold rounded-xl text-white transition-all duration-300 border ${hovered===i?"opacity-100 translate-y-0":"opacity-0 translate-y-2"}`}
                style={{ backgroundColor:`${s.accent}22`, borderColor:`${s.accent}44`, color:s.accent }}>
                {t("learn_more")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}