// ╔══════════════════════════════════════════════════════════════╗
// ║  LangToggle — Floating Darija / English switch button       ║
// ║  Drop it anywhere in your layout — it floats fixed          ║
// ╚══════════════════════════════════════════════════════════════╝
import { useState } from "react";
import { useLang } from "./Translations";

export default function LangToggle() {
  const { lang, toggle } = useLang();
  const [hovered, setHovered] = useState(false);
  const [animating, setAnimating] = useState(false);
  const isAr = lang === "ar";

  const handleClick = () => {
    setAnimating(true);
    toggle();
    setTimeout(() => setAnimating(false), 600);
  };

  return (
    <>
      <style>{`
        @keyframes langPop {
          0%   { transform: scale(1) rotate(0deg); }
          30%  { transform: scale(1.18) rotate(-8deg); }
          60%  { transform: scale(0.92) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes flagWave {
          0%,100% { transform: rotate(-3deg) scale(1); }
          50%      { transform: rotate(3deg) scale(1.08); }
        }
        @keyframes ripple {
          0%   { transform: scale(0.5); opacity: .5; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        .lang-pop { animation: langPop .55s cubic-bezier(.34,1.1,.64,1) both; }
        .flag-wave { animation: flagWave 1.8s ease-in-out infinite; }
        .lang-ripple { animation: ripple .6s ease-out both; }
      `}</style>

      {/* Fixed floating button */}
      <button
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={animating ? "lang-pop" : ""}
        style={{
          position: "fixed",
          bottom: 28,
          right: 28,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: hovered ? "12px 20px" : "12px 16px",
          borderRadius: 999,
          border: "1.5px solid rgba(232,119,34,0.5)",
          background: hovered
            ? "linear-gradient(135deg,#E87722,#F4C21F)"
            : "linear-gradient(135deg,rgba(10,5,0,0.92),rgba(20,10,0,0.92))",
          color: hovered ? "#fff" : "#E87722",
          cursor: "pointer",
          boxShadow: hovered
            ? "0 12px 40px rgba(232,119,34,0.55), 0 0 0 4px rgba(232,119,34,0.15)"
            : "0 6px 28px rgba(0,0,0,0.55), 0 0 0 1px rgba(232,119,34,0.25)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          transition: "all .3s cubic-bezier(.34,1.1,.64,1)",
          fontFamily: "'Syne',sans-serif",
          fontWeight: 800,
          fontSize: 13,
          letterSpacing: ".04em",
          overflow: "hidden",
          userSelect: "none",
        }}
      >
        {/* Ripple on click */}
        {animating && (
          <span
            className="lang-ripple"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 999,
              background: "rgba(232,119,34,0.3)",
              pointerEvents: "none",
            }}
          />
        )}

        {/* Flag */}
        <span
          className={hovered ? "flag-wave" : ""}
          style={{
            fontSize: 20,
            lineHeight: 1,
            display: "inline-block",
            filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.4))",
          }}
        >
          {isAr ? "🇬🇧" : "🇩🇿"}
        </span>

        {/* Label */}
        <span
          style={{
            position: "relative",
            letterSpacing: isAr ? ".02em" : ".06em",
            fontFamily: isAr ? "'Syne',sans-serif" : "'Syne',sans-serif",
            direction: "ltr",
          }}
        >
          {isAr ? "English" : "دارجة"}
        </span>

        {/* Right arrow / indicator */}
        <span
          style={{
            fontSize: 11,
            opacity: hovered ? 1 : 0.5,
            transition: "all .3s",
            transform: hovered ? "translateX(3px)" : "translateX(0)",
          }}
        >
          {hovered ? "↩" : "⇄"}
        </span>
      </button>

      {/* Tooltip on hover */}
      {hovered && (
        <div
          style={{
            position: "fixed",
            bottom: 74,
            right: 28,
            zIndex: 9998,
            padding: "7px 14px",
            borderRadius: 10,
            background: "rgba(10,5,0,0.92)",
            border: "1px solid rgba(232,119,34,0.3)",
            color: "rgba(255,255,255,0.7)",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: ".06em",
            whiteSpace: "nowrap",
            backdropFilter: "blur(12px)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
            animation: "fadeIn .2s ease both",
            pointerEvents: "none",
          }}
        >
          {isAr ? "Switch to English" : "الترجمة للدارجة الجزائرية"}
        </div>
      )}
    </>
  );
}