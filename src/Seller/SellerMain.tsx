import { useState, useEffect } from "react";
import { HiMenu } from "react-icons/hi";
import NavSeller from "./NavSeller";
import Sidebar, { menuItems } from "./Sidebar";
import Dashboard from "./Dashboard";
import StoresPage from "./StoresPage";
import Placeholder from "./Placeholder";
import PlanPickerModal from "./PlanPickerModal";
import CreateStoreModal from "./CreateStoreModal";
import { API_URL, authFetch, type Store, type Order, type DashboardStats } from "./sellerTypes";

const SellerMain = () => {
  const [activeMenu,       setActiveMenu]       = useState("dashboard");
  const [sidebarOpen,      setSidebarOpen]      = useState(false);
  const [stores,           setStores]           = useState<Store[]>([]);
  const [orders,           setOrders]           = useState<Order[]>([]);
  const [dashStats,        setDashStats]        = useState<DashboardStats | null>(null);
  const [loading,          setLoading]          = useState(true);
  const [showPlanPicker,   setShowPlanPicker]   = useState(false);
  const [showCreateStore,  setShowCreateStore]  = useState(false);
  const [selectedPlan,     setSelectedPlan]     = useState("");

  // ── Fetch all data ────────────────────────────────────────
  const fetchData = async () => {
    try {
      const [storesRes, ordersRes] = await Promise.all([
        authFetch(`${API_URL}/stores/`),
        authFetch(`${API_URL}/orders/`),
      ]);
      const storesData: Store[] = await storesRes.json().then((d: any) => d.results ?? d);
      const ordersData: Order[] = await ordersRes.json().then((d: any) => d.results ?? d);

      setStores(storesData);
      setOrders(ordersData);
      setDashStats({
        total_revenue:   ordersData.filter(o => o.status === "delivered").reduce((s, o) => s + Number(o.total), 0),
        total_orders:    ordersData.length,
        total_customers: new Set(ordersData.map((o: any) => o.customer_email)).size,
        pending:         ordersData.filter(o => o.status === "pending").length,
      });
    } catch (e) {
      console.error("Failed to fetch seller data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Store creation flow ───────────────────────────────────
  const handleNewStore   = ()           => setShowPlanPicker(true);
  const handlePlanSelect = (plan: string) => { setSelectedPlan(plan); setShowPlanPicker(false); setShowCreateStore(true); };

  // ── Route → component ─────────────────────────────────────
  const renderContent = () => {
    if (loading) return (
      <div className="flex items-center justify-center h-64 gap-3">
        <svg className="animate-spin h-6 w-6 text-[#E87722]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <span className="text-gray-400 text-sm font-semibold">Loading your data...</span>
      </div>
    );

    switch (activeMenu) {
      case "dashboard": return <Dashboard stats={dashStats} orders={orders} storeName={stores[0]?.name ?? ""} />;
      case "stores":    return <StoresPage stores={stores} onRefresh={fetchData} onNewStore={handleNewStore} />;
      default:          return <Placeholder title={menuItems.find(m => m.id === activeMenu)?.label ?? ""} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf8f3] flex flex-col">

      <NavSeller />

      {/* Modals */}
      {showPlanPicker  && <PlanPickerModal  onSelect={handlePlanSelect}  onClose={() => setShowPlanPicker(false)} />}
      {showCreateStore && <CreateStoreModal plan={selectedPlan} onCreated={fetchData} onClose={() => setShowCreateStore(false)} />}

      <div className="flex flex-1 pt-[72px]">

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar
          activeMenu={activeMenu}
          sidebarOpen={sidebarOpen}
          stores={stores}
          dashStats={dashStats}
          onMenuClick={(id) => { setActiveMenu(id); setSidebarOpen(false); }}
          onNewStore={handleNewStore}
        />

        {/* Main content */}
        <main className="flex-1 lg:ml-64 p-6 md:p-8 min-h-screen">

          {/* Mobile menu toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden mb-6 flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-gray-800 hover:border-gray-300 transition-all duration-200 cursor-pointer text-sm font-semibold shadow-sm"
          >
            <HiMenu className="h-5 w-5" /> Menu
          </button>

          {/* Dot background */}
          <div
            className="fixed inset-0 opacity-[0.3] pointer-events-none z-0"
            style={{
              backgroundImage: `radial-gradient(circle, #d1d5db 1px, transparent 1px)`,
              backgroundSize: "28px 28px",
            }}
          />

          <div className="relative z-10">
            {renderContent()}
          </div>

        </main>
      </div>
    </div>
  );
};

export default SellerMain;
