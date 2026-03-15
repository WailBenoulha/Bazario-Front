// ── Types ─────────────────────────────────────────────────────
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
  accent_color: string;
  button_style: string;
  panel_style: string;
  logo?: string;
  logo_url?: string;
  description?: string;
}

export interface Category {
  id: number;
  store: number;
  name: string;
  description?: string;
  icon?: string;      // react-icons key e.g. "FiSmartphone"
  order: number;
  product_count?: number;
}

export interface ProductImage {
  id: number;
  image_url: string;
  is_primary: boolean;
  order: number;
}

export interface ProductColor {
  id: number;
  name: string;
  hex: string;
}

export interface ProductSize {
  id: number;
  label: string;
  stock: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  is_active: boolean;
  store: number;
  categories?: number[];        // ← M2M: array of category IDs
  category_names?: string[];    // ← read-only: array of category names
  // primary image (legacy)
  image?: string;
  image_url?: string;
  // multi-image
  images?: ProductImage[];
  // variants
  sizes?: ProductSize[];
  colors?: ProductColor[];
  // extra
  material?: string;
  weight?: string;
  brand?: string;
}

export interface OrderItem {
  id: number;
  product: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  selected_size?: string;
  selected_color?: string;
}

export interface Order {
  id: number;
  // buyer info
  customer_name: string;
  customer_family_name?: string;
  customer_email: string;
  customer_phone: string;
  customer_address?: string;
  customer_city?: string;
  customer_wilaya?: string;
  notes?: string;
  // order
  total: number;
  status: string;
  created_at: string;
  store: number;
  items?: OrderItem[];
}

export interface Customer {
  email: string;
  name: string;
  total_orders: number;
  total_spent: number;
  last_order: string;
}

export interface DashboardStats {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  pending: number;
}

// ── API ───────────────────────────────────────────────────────
export const API_URL = "http://127.0.0.1:8000/api";

export const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("access_token");
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };
  return fetch(url, { ...options, headers });
};

// ── Constants ─────────────────────────────────────────────────
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

export const nicheEmoji: Record<string, string> = {
  fashion:"👗", electronics:"⚡", cosmetics:"💄", food:"🍽️",
  accessories:"💍", sports:"🏆", education:"📚", other:"✨",
};

// Default sizes per niche
export const NICHE_SIZES: Record<string, string[]> = {
  fashion:     ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
  sports:      ["XS", "S", "M", "L", "XL", "2XL"],
  accessories: ["One Size", "S", "M", "L"],
  cosmetics:   ["30ml", "50ml", "100ml", "200ml"],
  food:        ["Small", "Medium", "Large", "Family"],
  education:   [],
  electronics: [],
  other:       [],
};