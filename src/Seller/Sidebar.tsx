import { BsGrid, BsBoxSeam, BsPeopleFill, BsBarChartFill, BsGearFill, BsCreditCard, BsPlus } from "react-icons/bs";
import { MdStorefront } from "react-icons/md";
import type { Store, DashboardStats } from "./sellerTypes";

export const menuItems = [
  { label: "Dashboard", icon: <BsGrid className="h-5 w-5" />,         id: "dashboard" },
  { label: "My Stores",  icon: <MdStorefront className="h-5 w-5" />,  id: "stores" },
  { label: "Products",   icon: <BsBoxSeam className="h-5 w-5" />,     id: "products" },
  { label: "Orders",     icon: <BsCreditCard className="h-5 w-5" />,  id: "orders" },
  { label: "Customers",  icon: <BsPeopleFill className="h-5 w-5" />,  id: "customers" },
  { label: "Analytics",  icon: <BsBarChartFill className="h-5 w-5" />,id: "analytics" },
  { label: "Settings",   icon: <BsGearFill className="h-5 w-5" />,    id: "settings" },
];

interface Props {
  activeMenu: string;
  sidebarOpen: boolean;
  stores: Store[];
  dashStats: DashboardStats | null;
  onMenuClick: (id: string) => void;
  onNewStore: () => void;
}

const Sidebar = ({ activeMenu, sidebarOpen, stores, dashStats, onMenuClick, onNewStore }: Props) => {
  const user       = JSON.parse(localStorage.getItem("user") || "{}");
  const firstStore = stores[0];
  const initial    = (user.username?.[0] || "S").toUpperCase();

  return (
    <aside
      className={`fixed top-[72px] left-0 h-[calc(100vh-72px)] w-64 bg-white border-r border-gray-100 z-40 flex flex-col transition-transform duration-300 shadow-xl shadow-gray-100
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
    >
      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.4] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Store info / create CTA */}
      <div className="relative p-4 border-b border-gray-100">
        {firstStore ? (
          <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-100 rounded-2xl">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#E87722] to-[#F4C21F] flex items-center justify-center shadow-lg shadow-[#E87722]/20 shrink-0">
              <MdStorefront className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-gray-900 text-sm font-black truncate">{firstStore.name}</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={`h-1.5 w-1.5 rounded-full ${firstStore.is_live ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
                <span className={`text-xs font-semibold ${firstStore.is_live ? "text-green-600" : "text-gray-400"}`}>
                  {firstStore.is_live ? "Live" : "Offline"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={onNewStore}
            className="w-full flex items-center gap-3 p-3 bg-orange-50 border border-dashed border-orange-200 rounded-2xl cursor-pointer hover:bg-orange-100 transition-all duration-200 group"
          >
            <div className="h-10 w-10 rounded-xl border-2 border-dashed border-[#E87722]/40 flex items-center justify-center group-hover:border-[#E87722] transition-colors">
              <BsPlus className="h-5 w-5 text-[#E87722]" />
            </div>
            <span className="text-[#E87722] text-sm font-black">Create First Store</span>
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="relative flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
        <p className="text-gray-300 text-[10px] font-bold uppercase tracking-widest px-4 py-2">Main Menu</p>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onMenuClick(item.id)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 group text-left
              ${activeMenu === item.id
                ? "bg-gradient-to-r from-[#E87722]/10 to-[#F4C21F]/5 text-[#E87722] border border-[#E87722]/20 shadow-sm"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50 border border-transparent"
              }`}
          >
            <div className="flex items-center gap-3">
              <span className={activeMenu === item.id ? "text-[#E87722]" : "text-gray-400 group-hover:text-gray-600 transition-colors"}>
                {item.icon}
              </span>
              {item.label}
            </div>
            {/* Dynamic badges */}
            {item.id === "stores" && stores.length > 0 && (
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{stores.length}</span>
            )}
            {item.id === "orders" && (dashStats?.pending ?? 0) > 0 && (
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-[#E87722]/10 text-[#E87722]">{dashStats!.pending}</span>
            )}
          </button>
        ))}
      </nav>

      {/* User profile */}
      <div className="relative p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition-all duration-200">
          <div className="relative h-9 w-9 rounded-full bg-gradient-to-br from-[#E87722] to-[#F4C21F] flex items-center justify-center shadow-lg shrink-0">
            <span className="text-white text-sm font-black">{initial}</span>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-gray-800 text-xs font-bold truncate">{user.username || "Seller"}</span>
            <span className="text-gray-400 text-xs truncate">{user.email || ""}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
