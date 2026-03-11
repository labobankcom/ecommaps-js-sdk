export type JsonPrimitive = string | number | boolean | null | undefined;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type JsonRecord = { [key: string]: JsonValue };

export interface EcommapsMenuItem {
  title: string;
  url: string | null;
  type?: string | null;
  position?: number;
  children?: EcommapsMenuItem[];
}

export interface EcommapsMenu {
  id: string;
  title: string;
  handle: string;
  items: EcommapsMenuItem[];
}

export interface EcommapsSite {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  custom_domain: string | null;
  theme: JsonRecord | null;
  theme_settings: JsonRecord | null;
  settings: JsonRecord | null;
  contact_info: JsonRecord | null;
  social_links: JsonValue[] | null;
  currency?: string | null;
  primary_color?: string | null;
  shipping_providers?: string[] | null;
  shipping_companies?: string[] | null;
  shipping_methods?: string[] | null;
}

export interface EcommapsImage {
  id?: string | null;
  url?: string | null;
  src?: string | null;
  image_url?: string | null;
  alt?: string | null;
  position?: number | null;
  [key: string]: JsonValue;
}

export interface EcommapsProductOption {
  name: string;
  values: string[];
}

export interface EcommapsProductVariant {
  id: string;
  title: string | null;
  sku: string | null;
  barcode?: string | null;
  price: number | null;
  base_price?: number | null;
  compare_at_price?: number | null;
  inventory_quantity: number | null;
  in_stock?: boolean | null;
  option_values?: Record<string, string>;
  options?: string[] | Record<string, string> | null;
  image_url?: string | null;
  images?: (string | EcommapsImage)[] | null;
  prices?: JsonValue[] | null;
}

export interface EcommapsProduct {
  id: string;
  site_id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  currency: string | null;
  images: (string | EcommapsImage)[] | null;
  category: string | null;
  tags: string[] | null;
  inventory_quantity: number | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  sku: string | null;
  barcode: string | null;
  cost_per_item: number | null;
  track_quantity: boolean | null;
  continue_selling_when_out_of_stock: boolean | null;
  weight: number | null;
  weight_unit: string | null;
  vendor: string | null;
  product_type: string | null;
  options: EcommapsProductOption[] | null;
  variants: EcommapsProductVariant[] | null;
  charge_tax: boolean | null;
  is_physical: boolean | null;
  in_stock?: boolean | null;
  discounted_price?: number;
  discount_text?: string;
}

export interface EcommapsCollection {
  id: string;
  site_id: string;
  title: string;
  description: string | null;
  slug: string;
  image_url: string | null;
  is_active: boolean | null;
  sort_order: string | null;
  created_at: string;
  updated_at: string;
}

export interface EcommapsPage {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  excerpt?: string | null;
  body?: string | null;
  content?: JsonRecord | string | null;
  is_published?: boolean;
  featured_image?: string | null;
  image_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface EcommapsBlog {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  excerpt?: string | null;
  body?: string | null;
  content?: JsonRecord | string | null;
  image_url?: string | null;
  featured_image?: string | null;
  is_published?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface EcommapsCartItem {
  id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string;
  product_price: number;
  product_image: string | null;
  quantity: number;
  subtotal: number;
  variant_options?: Record<string, string>;
}

export interface EcommapsCart {
  id: string;
  site_id: string;
  items: EcommapsCartItem[];
  items_count: number;
  subtotal: number;
  created_at: string | null;
}

export interface EcommapsAddress {
  id?: string;
  label?: string | null;
  title?: string | null;
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;
  phone?: string | null;
  is_default?: boolean;
  [key: string]: JsonValue;
}

export interface EcommapsCustomer {
  id: string;
  store_id: string;
  email: string;
  full_name: string;
  phone: string | null;
  addresses: EcommapsAddress[];
  created_at: string;
}

export interface EcommapsAuthResponse {
  token: string;
  user: EcommapsCustomer;
}

export interface EcommapsSearchResponse {
  data: EcommapsProduct[];
  query: string;
  pagination: PaginationMeta;
}

export type EcommapsDiscountType = "percentage" | "fixed_amount" | "free_shipping";
export type EcommapsPromotionTargetType = "store" | "products" | "collections";
export type EcommapsPromotionType = "automatic" | "coupon" | "manual" | string;

export interface EcommapsPromotion {
  id?: string;
  code?: string | null;
  title?: string | null;
  message?: string | null;
  discount_type?: EcommapsDiscountType;
  discount_value?: number;
  discount_amount?: number;
  min_order_amount?: number | null;
  max_discount_amount?: number | null;
  starts_at?: string | null;
  expires_at?: string | null;
  promotion_type?: EcommapsPromotionType;
  target_type?: EcommapsPromotionTargetType | string;
  target_ids?: string[];
}

export interface EcommapsCouponValidateResponse {
  valid: boolean;
  applied_discounts?: EcommapsPromotion[];
  code?: string;
  discount_type?: EcommapsDiscountType;
  discount_value?: number;
  discount_amount?: number;
  target_type?: EcommapsPromotionTargetType | string;
  promotion_type?: EcommapsPromotionType;
  message?: string;
}
