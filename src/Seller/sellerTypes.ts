// ── Shared types ──────────────────────────────────────────────
export interface Store {
  id: number;
  name: string;
  niche: string;
  slug: string;
  is_live: boolean;
  plan: string;
  total_revenue: number;
  total_orders: number;
  total_customers: number;
}

export interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
  created_at: string;
}

export interface DashboardStats {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  pending: number;
}

// ── API helper ────────────────────────────────────────────────
export const API_URL = "http://127.0.0.1:8000/api";

export const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("access_token");
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
};

// ── Shared constants ──────────────────────────────────────────
export const statusColors: Record<string, string> = {
  delivered:  "bg-green-100 text-green-700 border-green-200",
  pending:    "bg-amber-100 text-amber-700 border-amber-200",
  processing: "bg-blue-100 text-blue-700 border-blue-200",
  cancelled:  "bg-red-100 text-red-700 border-red-200",
};

export const nicheColors: Record<string, { bg: string; text: string; border: string }> = {
  fashion:     { bg: "bg-pink-50",   text: "text-pink-600",   border: "border-pink-100" },
  electronics: { bg: "bg-blue-50",   text: "text-blue-600",   border: "border-blue-100" },
  cosmetics:   { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100" },
  food:        { bg: "bg-green-50",  text: "text-green-600",  border: "border-green-100" },
  accessories: { bg: "bg-yellow-50", text: "text-yellow-600", border: "border-yellow-100" },
  sports:      { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-100" },
  education:   { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100" },
  other:       { bg: "bg-gray-50",   text: "text-gray-600",   border: "border-gray-100" },
};
