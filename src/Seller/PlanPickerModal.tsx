import { BsStars, BsCheckCircleFill } from "react-icons/bs";
import { HiX } from "react-icons/hi";

interface Props {
  onSelect: (plan: string) => void;
  onClose: () => void;
}

const plans = [
  {
    id: "free", name: "Free", price: "0 DA", period: "/forever",
    color: "#6b7280",
    features: ["1 store", "10 products", "Basic dashboard"],
    cta: "Start for Free", recommended: false,
  },
  {
    id: "basic", name: "Basic", price: "2,500 DA", period: "/mo",
    color: "#E87722",
    features: ["2 stores", "50 products", "Custom domain", "Analytics"],
    cta: "Choose Basic", recommended: true,
  },
  {
    id: "premium", name: "Premium", price: "4,500 DA", period: "/mo",
    color: "#F4C21F",
    features: ["5 stores", "Unlimited products", "Priority support", "Multi-store analytics"],
    cta: "Go Premium", recommended: false,
  },
];

const PlanPickerModal = ({ onSelect, onClose }: Props) => (
  <div
    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md px-4"
    onClick={onClose}
  >
    <div className="relative w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">

        {/* Header */}
        <div className="relative px-8 pt-8 pb-6 bg-gradient-to-br from-[#fdf8f3] to-white border-b border-gray-100">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 cursor-pointer bg-gray-100 hover:bg-gray-200 rounded-xl p-2 transition-all"
          >
            <HiX className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-[#E87722] to-[#F4C21F] rounded-xl">
              <BsStars className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-black tracking-[0.2em] text-[#E87722] uppercase">Choose Your Plan</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900">Pick a plan to create your store</h2>
          <p className="text-gray-500 text-sm mt-1">Start free and upgrade anytime. No credit card required.</p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-3 gap-4 p-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => onSelect(plan.id)}
              className={`relative flex flex-col gap-4 p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer hover:shadow-lg
                ${plan.recommended ? "border-[#E87722] shadow-md shadow-[#E87722]/10" : "border-gray-100 hover:border-gray-200"}`}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#E87722] to-[#F4C21F] text-white text-[10px] font-black px-3 py-1 rounded-full whitespace-nowrap">
                  MOST POPULAR
                </div>
              )}

              <div>
                <p className="text-xs font-black uppercase tracking-widest" style={{ color: plan.color }}>{plan.name}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-gray-900">{plan.price}</span>
                  <span className="text-gray-400 text-xs">{plan.period}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 flex-1">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <BsCheckCircleFill className="h-3 w-3 shrink-0" style={{ color: plan.color }} />
                    <span className="text-gray-600 text-xs">{f}</span>
                  </div>
                ))}
              </div>

              <button
                className="w-full py-2.5 rounded-xl text-sm font-black text-white transition-all duration-200 cursor-pointer active:scale-95"
                style={{ background: `linear-gradient(135deg, ${plan.color}, ${plan.id === "premium" ? "#E87722" : plan.color})` }}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 pb-5">Cancel anytime · Secure payment · Instant access</p>
      </div>
    </div>
  </div>
);

export default PlanPickerModal;
