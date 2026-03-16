import { GiClothes, GiLipstick, GiNecklace } from "react-icons/gi";
import { MdDevices, MdFastfood, MdSportsSoccer } from "react-icons/md";
import { FaBookOpen } from "react-icons/fa";
import { HiArrowRight } from "react-icons/hi";
import { useState } from "react";
import { useLang } from "./Translations";

export default function Categories() {
  const { t, lang } = useLang();
  const isAr = lang === "ar";
  const [hovered, setHovered] = useState<string|null>(null);

  const sections = [
    { img:"./src/Pictures/clothes-pr.jpg",  icon:<GiClothes className="h-7 w-7"/>,        accent:"#E87722", light:"#FFF3E8", span:"col-span-2", stores:"2.4k",
      title:t("niche_fashion"),      sub:t("cat_fashion_sub"),      tag:t("tag_trending"),  desc:t("cat_fashion_desc") },
    { img:"./src/Pictures/electro-pr.jpg",  icon:<MdDevices className="h-7 w-7"/>,         accent:"#2EA7F2", light:"#E8F5FF", span:"col-span-1", stores:"1.8k",
      title:t("niche_electronics"),  sub:t("cat_electronics_sub"),  tag:t("tag_popular"),   desc:t("cat_electronics_desc") },
    { img:"./src/Pictures/cosmetique.jpg",  icon:<GiLipstick className="h-7 w-7"/>,        accent:"#F4C21F", light:"#FFFBE8", span:"col-span-1", stores:"980",
      title:t("niche_cosmetics"),    sub:t("cat_cosmetics_sub"),    tag:null,               desc:t("cat_cosmetics_desc") },
    { img:"./src/Pictures/food-pr.jpg",     icon:<MdFastfood className="h-7 w-7"/>,        accent:"#E87722", light:"#FFF3E8", span:"col-span-1", stores:"3.1k",
      title:t("niche_food"),         sub:t("cat_food_sub"),         tag:t("tag_hot"),       desc:t("cat_food_desc") },
    { img:"./src/Pictures/Accessories.jpg", icon:<GiNecklace className="h-7 w-7"/>,        accent:"#F4C21F", light:"#FFFBE8", span:"col-span-1", stores:"540",
      title:t("niche_accessories"),  sub:t("cat_accessories_sub"),  tag:t("tag_new"),       desc:t("cat_accessories_desc") },
    { img:"./src/Pictures/sport.jpg",       icon:<MdSportsSoccer className="h-7 w-7"/>,    accent:"#2EA7F2", light:"#E8F5FF", span:"col-span-2", stores:"1.2k",
      title:t("niche_sports"),       sub:t("cat_sports_sub"),       tag:null,               desc:t("cat_sports_desc") },
    { img:"./src/Pictures/books-pr.jpg",    icon:<FaBookOpen className="h-7 w-7"/>,         accent:"#F4C21F", light:"#FFFBE8", span:"col-span-1", stores:"320",
      title:t("niche_education"),    sub:t("cat_education_sub"),    tag:null,               desc:t("cat_education_desc") },
  ];

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="flex flex-col items-center py-32 px-6 md:px-16 gap-20 bg-[#fdf8f3] relative overflow-hidden">
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] bg-[#E87722] opacity-[0.06] rounded-full blur-3xl pointer-events-none"/>
      <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] bg-[#2EA7F2] opacity-[0.06] rounded-full blur-3xl pointer-events-none"/>
      <div className="absolute inset-0 opacity-[0.35] pointer-events-none"
        style={{ backgroundImage:`radial-gradient(circle,#E8772222 1px,transparent 1px)`, backgroundSize:"32px 32px" }}/>

      <section className="flex flex-col items-center gap-6 text-center z-10 max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#E87722]"/>
          <span className="text-xs font-black tracking-[0.4em] text-[#E87722] uppercase">{t("cats_eyebrow")}</span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#E87722]"/>
        </div>
        <h1 className="font-black text-6xl md:text-7xl text-gray-900 leading-[0.9] tracking-tight">
          {t("cats_title")}{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-[#E87722] to-[#F4C21F] bg-clip-text text-transparent">{lang==="ar" ? "صنفك" : "Perfect"}</span>
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
              <path d="M0 6 Q50 0 100 4 Q150 8 200 2" stroke="url(#grad)" strokeWidth="3" strokeLinecap="round" fill="none"/>
              <defs><linearGradient id="grad" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse"><stop stopColor="#E87722"/><stop offset="1" stopColor="#F4C21F"/></linearGradient></defs>
            </svg>
          </span>{" "}
          {lang==="ar" ? "" : "Niche"}
        </h1>
        <p className="text-gray-500 max-w-md text-base leading-relaxed mt-2">{t("cats_sub")}</p>
        <div className="flex flex-wrap gap-3 justify-center mt-2">
          {[lang==="ar"?"7 أصناف":"7 Niches", lang==="ar"?"+10,000 متجر":"10,000+ Stores", lang==="ar"?"+50 قالب":"50+ Templates", lang==="ar"?"مجاني للبداية":"Free to Start"].map((b)=>(
            <span key={b} className="text-xs font-bold px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-600 shadow-sm">{b}</span>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-6xl z-10">
        {sections.map((s) => (
          <div key={s.title} onMouseEnter={()=>setHovered(s.title)} onMouseLeave={()=>setHovered(null)}
            className={`relative group rounded-3xl overflow-hidden cursor-pointer ${s.span==="col-span-2"?"lg:col-span-2 h-80":"lg:col-span-1 h-72"} transition-all duration-500 ease-out
              ${hovered && hovered!==s.title?"opacity-30 scale-[0.97] blur-[1px]":"opacity-100 scale-100 blur-0"}`}
            style={{ boxShadow:hovered===s.title?`0 24px 60px ${s.accent}30,0 0 0 2px ${s.accent}40`:"0 4px 20px rgba(0,0,0,0.08)" }}>
            <img src={s.img} alt={s.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"/>
            <div className="absolute inset-0 transition-all duration-500"
              style={{ background:`linear-gradient(to top,${s.accent}f0 0%,${s.accent}60 35%,transparent 70%)`, opacity:hovered===s.title?1:0.8 }}/>
            {hovered===s.title&&<div className="absolute -top-10 -right-10 h-32 w-32 rounded-full blur-2xl opacity-60 pointer-events-none" style={{ backgroundColor:s.accent }}/>}
            {s.tag&&<div className="absolute top-4 left-4 z-10"><span className="bg-white/90 backdrop-blur-md text-gray-800 text-xs font-black px-3 py-1.5 rounded-full shadow-md border border-white">{s.tag}</span></div>}
            <div className="absolute top-4 right-16 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <span className="bg-black/30 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20">{s.stores} {lang==="ar"?"متجر":"stores"}</span>
            </div>
            <div className="absolute top-4 right-4 z-10 p-2.5 rounded-2xl backdrop-blur-md border border-white/40 text-white transition-all duration-300 group-hover:scale-125 group-hover:rotate-6 shadow-lg"
              style={{ backgroundColor:`${s.accent}99` }}>{s.icon}</div>
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10 flex flex-col gap-1.5">
              <p className="text-white/70 text-xs font-bold uppercase tracking-[0.2em]">{s.sub}</p>
              <h2 className="text-white font-black text-2xl md:text-3xl leading-tight drop-shadow-lg">{s.title}</h2>
              <p className="text-white/85 text-sm leading-relaxed max-h-0 opacity-0 group-hover:max-h-24 group-hover:opacity-100 transition-all duration-500 overflow-hidden mt-1">{s.desc}</p>
              <div className="flex items-center justify-between mt-2 opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-y-1 group-hover:translate-y-0">
                <button className="flex items-center gap-2 px-5 py-2 text-sm font-black rounded-full text-gray-900 bg-white hover:bg-orange-50 transition-all duration-200 shadow-lg">
                  {t("cats_start_store")}<HiArrowRight className="h-4 w-4"/>
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="flex flex-col items-center gap-6 z-10 text-center">
        <div className="flex flex-col items-center gap-2">
          <p className="text-gray-400 text-sm font-medium">{t("cats_no_niche")}</p>
          <p className="text-gray-300 text-xs">{t("cats_adding")}</p>
        </div>
        <button className="group cursor-pointer flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#E87722] to-[#F4C21F] text-white font-black rounded-full hover:from-[#2EA7F2] hover:to-[#2EA7F2] transition-all duration-300 active:scale-95 shadow-xl shadow-[#E87722]/25 text-base">
          {t("cats_request")}
        </button>
      </div>
    </div>
  );
}