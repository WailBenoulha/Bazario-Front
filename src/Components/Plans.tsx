import { useState } from "react";
import { HiCheckCircle, HiXCircle } from "react-icons/hi";
import { BsRocketTakeoff, BsShopWindow, BsStars } from "react-icons/bs";
import { useLang } from "./Translations";

export default function Plans() {
  const { t, lang } = useLang();
  const isAr = lang === "ar";
  const [hovered, setHovered] = useState<string|null>(null);

  const plans = [
    { type:t("plan_start"),   price:t("plan_free_price"), duration:t("plan_duration_free"),  badge:null,                   icon:<BsRocketTakeoff className="h-6 w-6"/>, accent:"#6B7280", desc:t("plan_start_desc"),
      features:[
        {text:t("f_1store"),true:true},{text:t("f_10prod"),true:true},{text:t("f_basic_analytics"),true:true},
        {text:t("f_email_support"),true:true},{text:t("f_subdomain"),true:true},{text:t("f_custom_domain"),true:false},
        {text:t("f_no_branding"),true:false},{text:t("f_marketing"),true:false}] },
    { type:t("plan_basic"),   price:"2,500",               duration:t("plan_duration_month"), badge:lang==="ar"?"الأكثر شعبية":"Most Popular", icon:<BsShopWindow className="h-6 w-6"/>, accent:"#E87722", desc:t("plan_basic_desc"),
      features:[
        {text:t("f_1store"),true:true},{text:t("f_100prod"),true:true},{text:t("f_adv_analytics"),true:true},
        {text:t("f_priority"),true:true},{text:t("f_custom_domain"),true:true},{text:t("f_no_branding"),true:true},
        {text:t("f_marketing"),true:false},{text:t("f_early_access"),true:false}] },
    { type:t("plan_premium"), price:"4,500",               duration:t("plan_duration_month"), badge:lang==="ar"?"أفضل قيمة":"Best Value",   icon:<BsStars className="h-6 w-6"/>, accent:"#F4C21F", desc:t("plan_premium_desc"),
      features:[
        {text:t("f_unlimited_stores"),true:true},{text:t("f_unlimited_prod"),true:true},{text:t("f_full_analytics"),true:true},
        {text:t("f_247"),true:true},{text:t("f_custom_domain"),true:true},{text:t("f_no_branding"),true:true},
        {text:t("f_marketing"),true:true},{text:t("f_early_access"),true:true}] },
  ];

  const badges = [t("badge_nocredit"), t("badge_cancel"), t("badge_free")];

  return (
    <div dir={isAr?"rtl":"ltr"} className="py-32 flex flex-col gap-20 items-center px-6 md:px-16 bg-[#fdf8f3] relative overflow-hidden">
      <div className="absolute top-0 right-0 h-96 w-96 bg-[#E87722] opacity-5 rounded-full blur-3xl pointer-events-none"/>
      <div className="absolute bottom-0 left-0 h-96 w-96 bg-[#F4C21F] opacity-5 rounded-full blur-3xl pointer-events-none"/>
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage:`linear-gradient(rgba(232,119,34,1) 1px,transparent 1px),linear-gradient(90deg,rgba(232,119,34,1) 1px,transparent 1px)`, backgroundSize:"60px 60px" }}/>

      <section className="flex flex-col items-center gap-6 text-center z-10">
        <div className="flex items-center gap-3">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#E87722]"/>
          <span className="text-xs font-bold tracking-[0.3em] text-[#E87722] uppercase">{t("plans_eyebrow")}</span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#E87722]"/>
        </div>
        <h1 className="font-black text-6xl md:text-7xl text-gray-900 leading-none tracking-tight">
          {t("plans_title")}{" "}<span className="bg-gradient-to-r from-[#E87722] to-[#F4C21F] bg-clip-text text-transparent">{t("plans_title_2")}</span>{" "}{t("plans_title_3")}
        </h1>
        <p className="text-gray-500 max-w-md text-base leading-relaxed">{t("plans_sub")}</p>
        <div className="flex flex-wrap gap-4 justify-center mt-2">
          {badges.map(b=>(
            <span key={b} className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <HiCheckCircle className="h-4 w-4 text-[#E87722]"/>{b}
            </span>
          ))}
        </div>
      </section>

      <section className="flex flex-col lg:flex-row gap-6 justify-center items-stretch w-full max-w-5xl z-10">
        {plans.map((plan) => {
          const isPopular = !!plan.badge && plan.badge.includes(isAr?"شعبية":"Popular");
          const isHov = hovered===plan.type;
          return (
            <div key={plan.type} onMouseEnter={()=>setHovered(plan.type)} onMouseLeave={()=>setHovered(null)}
              className={`relative flex flex-col flex-1 rounded-3xl overflow-hidden transition-all duration-500 cursor-default ${isPopular?"lg:-translate-y-4 shadow-2xl":"shadow-md"} ${isHov&&!isPopular?"-translate-y-2 shadow-xl":""}`}
              style={{ boxShadow:isHov?`0 20px 60px ${plan.accent}25`:undefined }}>
              <div className="h-1.5 w-full" style={{ background:`linear-gradient(to right,${plan.accent},${plan.accent}88)` }}/>
              <div className={`flex flex-col flex-1 p-8 gap-6 ${isPopular?"bg-gray-900":"bg-white border border-gray-100"}`}>
                {plan.badge&&(
                  <div className="absolute -top-0 right-6">
                    <span className="text-xs font-black px-4 py-1.5 rounded-b-xl text-white shadow-md" style={{ backgroundColor:plan.accent }}>✦ {plan.badge}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl" style={{ backgroundColor:`${plan.accent}22`, color:plan.accent, border:`1px solid ${plan.accent}44` }}>{plan.icon}</div>
                  <div>
                    <h2 className={`font-black text-lg ${isPopular?"text-white":"text-gray-900"}`}>{plan.type}</h2>
                    <p className="text-xs text-gray-400">{plan.desc}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-end gap-1">
                    {plan.price!==t("plan_free_price")&&<span className="text-lg font-bold text-gray-400">DA</span>}
                    <span className="text-5xl font-black leading-none" style={{ color:isPopular?"white":plan.accent }}>{plan.price}</span>
                  </div>
                  <p className="text-xs text-gray-400">{plan.duration}</p>
                </div>
                <div className="h-px w-full" style={{ background:isPopular?"rgba(255,255,255,0.1)":"#f3f4f6" }}/>
                <ul className="flex flex-col gap-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-center gap-2.5 text-sm">
                      {f.true
                        ? <HiCheckCircle className="h-5 w-5 shrink-0" style={{ color:plan.accent }}/>
                        : <HiXCircle className="h-5 w-5 shrink-0 text-gray-300"/>}
                      <span className={f.true?(isPopular?"text-gray-200":"text-gray-700"):"text-gray-300 line-through"}>{f.text}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3.5 rounded-2xl font-black text-sm cursor-pointer active:scale-95 transition-all duration-200 mt-2 text-white shadow-md hover:shadow-lg ${isPopular?"bg-gradient-to-r from-[#E87722] to-[#F4C21F] shadow-lg shadow-[#E87722]/30":""}`}
                  style={!isPopular?{ background:`linear-gradient(to right,${plan.accent},${plan.accent}cc)` }:undefined}>
                  {plan.price===t("plan_free_price") ? t("get_started_free") : t("get_started")}
                </button>
              </div>
            </div>
          );
        })}
      </section>

      <div className="flex flex-col items-center gap-2 z-10 text-center">
        <p className="text-gray-400 text-sm">{t("plans_custom")}{" "}<span className="text-[#E87722] font-bold cursor-pointer hover:underline">{t("plans_contact")}</span></p>
      </div>
    </div>
  );
}