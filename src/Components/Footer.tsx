import { useState } from "react";
import { HiMail, HiPhone, HiLocationMarker, HiArrowRight } from "react-icons/hi";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from "react-icons/fa";
import { BsShopWindow } from "react-icons/bs";
import { useLang } from "./Translations";

export default function Footer() {
  const { t, lang } = useLang();
  const isAr = lang === "ar";
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);

  const footerLinks = {
    [t("footer_product")]: [t("footer_features"),t("footer_pricing"),t("footer_templates_link"),t("footer_integrations"),t("footer_changelog")],
    [t("footer_company")]: [t("footer_about"),t("footer_careers"),t("footer_blog"),t("footer_press"),t("footer_contact")],
    [t("footer_support")]: [t("footer_help"),t("footer_docs"),t("footer_api"),t("footer_status"),t("footer_community")],
    [t("footer_legal")]:   [t("footer_privacy"),t("footer_terms"),t("footer_cookies"),t("footer_refund")],
  };

  const socials = [
    { icon:<FaFacebookF className="h-3.5 w-3.5"/>, label:"Facebook", color:"#1877F2" },
    { icon:<FaInstagram className="h-3.5 w-3.5"/>, label:"Instagram", color:"#E1306C" },
    { icon:<FaTwitter className="h-3.5 w-3.5"/>,   label:"Twitter",   color:"#1DA1F2" },
    { icon:<FaLinkedinIn className="h-3.5 w-3.5"/>,label:"LinkedIn",  color:"#0A66C2" },
  ];

  const contacts = [
    { icon:<HiMail className="h-4 w-4"/>,         text:"support@bazario.dz" },
    { icon:<HiPhone className="h-4 w-4"/>,        text:"+213 549 311 195" },
    { icon:<HiLocationMarker className="h-4 w-4"/>,text:isAr?"سطيف، الجزائر":"Setif, Algeria" },
  ];

  const stats = [
    { value:"10K+", label:t("footer_merchants") },
    { value:"50+",  label:t("footer_templates") },
    { value:"98%",  label:t("footer_satisfaction") },
    { value:"3min", label:t("footer_setup") },
  ];

  return (
    <footer dir={isAr ? "rtl" : "ltr"} className="relative bg-[#050200] text-gray-400 overflow-hidden">

      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage:`linear-gradient(rgba(244,194,31,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(244,194,31,0.6) 1px,transparent 1px)`, backgroundSize:"60px 60px" }}/>
      <div className="absolute top-0 left-1/4 h-96 w-96 bg-[#E87722] opacity-[0.04] rounded-full blur-3xl pointer-events-none"/>
      <div className="absolute bottom-0 right-1/4 h-64 w-64 bg-[#2EA7F2] opacity-[0.04] rounded-full blur-3xl pointer-events-none"/>

      {/* Newsletter Banner */}
      <div className="relative border-b border-white/5">
        <div className="px-6 md:px-16 py-14 flex flex-col md:flex-row items-center justify-between gap-8 max-w-7xl mx-auto">
          <div className="flex flex-col gap-3 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <div className="h-2 w-2 rounded-full bg-[#E87722] animate-ping"/>
              <span className="text-xs font-bold tracking-[0.3em] text-[#E87722] uppercase">{t("newsletter_label")}</span>
            </div>
            <h3 className="text-white font-black text-3xl md:text-4xl leading-tight">
              {t("footer_newsletter_title")}{" "}
              <span className="bg-gradient-to-r from-[#E87722] to-[#F4C21F] bg-clip-text text-transparent">{t("footer_newsletter_highlight")}</span>{" "}📬
            </h3>
            <p className="text-gray-500 text-sm max-w-sm">{t("footer_newsletter_sub")}</p>
          </div>
          <div className="w-full md:w-auto">
            {subscribed ? (
              <div className="flex items-center gap-3 px-6 py-4 bg-green-500/10 border border-green-500/30 rounded-2xl">
                <div className="h-2 w-2 rounded-full bg-green-400"/>
                <span className="text-green-400 font-bold text-sm">{t("footer_subscribed")}</span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder={t("footer_email_placeholder")}
                  className="flex-1 sm:w-72 px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#E87722]/60 focus:bg-white/8 transition-all duration-200"/>
                <button onClick={() => { if (email) { setSubscribed(true); setEmail(""); } }}
                  className="group flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#E87722] to-[#F4C21F] text-white font-black text-sm rounded-2xl hover:from-[#2EA7F2] hover:to-[#2EA7F2] cursor-pointer active:scale-95 transition-all duration-300 shadow-lg shadow-[#E87722]/20 whitespace-nowrap">
                  {t("footer_subscribe")} <HiArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200"/>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="px-6 md:px-16 py-16 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 justify-between">

          {/* Brand Column */}
          <div className="flex flex-col gap-8 max-w-xs">
            <div className="flex flex-col gap-4">
              <img src="./src/Pictures/bazario-logo.png" alt="Bazario Logo" className="h-25 w-auto brightness-200"/>
              <p className="text-sm leading-relaxed text-gray-500">{t("footer_tagline")}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map(stat => (
                <div key={stat.label} className="flex flex-col gap-1 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-xl font-black bg-gradient-to-r from-[#E87722] to-[#F4C21F] bg-clip-text text-transparent">{stat.value}</span>
                  <span className="text-gray-600 text-xs uppercase tracking-widest">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* Contact */}
            <div className="flex flex-col gap-2.5">
              {contacts.map(c => (
                <div key={c.text} className="flex items-center gap-3 text-sm text-gray-500 hover:text-[#E87722] transition-colors duration-200 cursor-pointer group">
                  <div className="text-[#E87722] group-hover:scale-110 transition-transform duration-200">{c.icon}</div>
                  {c.text}
                </div>
              ))}
            </div>

            {/* Socials */}
            <div className="flex gap-2">
              {socials.map(s => (
                <button key={s.label} aria-label={s.label}
                  onMouseEnter={() => setHoveredSocial(s.label)}
                  onMouseLeave={() => setHoveredSocial(null)}
                  className="h-10 w-10 flex items-center justify-center rounded-xl border border-white/10 text-gray-500 transition-all duration-300 cursor-pointer"
                  style={{
                    backgroundColor: hoveredSocial === s.label ? `${s.color}22` : "transparent",
                    borderColor:     hoveredSocial === s.label ? `${s.color}66` : undefined,
                    color:           hoveredSocial === s.label ? s.color : undefined,
                    transform:       hoveredSocial === s.label ? "translateY(-2px)" : undefined,
                  }}>
                  {s.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 flex-1">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <h3 className="text-white font-black text-sm tracking-widest uppercase">{category}</h3>
                  <div className="h-0.5 w-8 rounded-full" style={{ background:"linear-gradient(to right,#E87722,transparent)" }}/>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {links.map(link => (
                    <li key={link} className="group flex items-center gap-1.5 text-sm text-gray-500 cursor-pointer hover:text-[#E87722] transition-all duration-200">
                      <HiArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200 text-[#E87722]"/>
                      {link}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="px-6 md:px-16 py-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <BsShopWindow className="h-4 w-4 text-[#E87722]"/>
            <span>{t("footer_rights")}</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-600">
            <span className="hover:text-[#E87722] cursor-pointer transition-colors duration-200">{isAr?"الخصوصية":"Privacy"}</span>
            <span className="hover:text-[#E87722] cursor-pointer transition-colors duration-200">{isAr?"الشروط":"Terms"}</span>
            <span className="hover:text-[#E87722] cursor-pointer transition-colors duration-200">{isAr?"الكوكيز":"Cookies"}</span>
            <span className="h-3 w-px bg-white/10"/>
            <p>{t("footer_made")}{" "}
              <span className="bg-gradient-to-r from-[#E87722] to-[#F4C21F] bg-clip-text text-transparent font-black">{t("footer_algeria")}</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}