import {
  EcommapsCreateOrderRequest,
  EcommapsAuthResponse,
  EcommapsBlog,
  EcommapsCart,
  EcommapsCollection,
  EcommapsCouponValidateResponse,
  EcommapsCustomer,
  EcommapsMenu,
  EcommapsOrder,
  EcommapsPage,
  EcommapsProduct,
  EcommapsSearchResponse,
  EcommapsSite,
  PaginatedResponse,
} from "./types";

const DEFAULT_API_URL = process.env.NEXT_PUBLIC_ECOMMAPS_API_URL || "https://api.ecommaps.com/api/v1/storefront";
const DEFAULT_API_KEY = process.env.ECOMMAPS_API_KEY || "";

type QueryValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryValue>;

export interface EcommapsClientConfig {
  apiUrl?: string;
  apiKey?: string;
  fetch?: typeof fetch;
  defaultHeaders?: HeadersInit;
}

export interface EcommapsClient {
  store: {
    retrieve: (options?: RequestInit) => Promise<EcommapsSite>;
    menus: {
      list: (options?: RequestInit) => Promise<EcommapsMenu[]>;
      retrieve: (handle: string, options?: RequestInit) => Promise<EcommapsMenu>;
    };
    coupons: {
      validate: (body: { code: string; cart_total?: number; items?: unknown[] }, options?: RequestInit) => Promise<EcommapsCouponValidateResponse>;
    };
    pages: {
      list: (options?: RequestInit) => Promise<EcommapsPage[]>;
      retrieve: (slug: string, options?: RequestInit) => Promise<EcommapsPage>;
    };
    blogs: {
      list: (options?: RequestInit) => Promise<EcommapsBlog[]>;
      retrieve: (slug: string, options?: RequestInit) => Promise<EcommapsBlog>;
    };
  };
  products: {
    list: (params?: QueryParams, options?: RequestInit) => Promise<PaginatedResponse<EcommapsProduct>>;
    retrieve: (slug: string, options?: RequestInit) => Promise<EcommapsProduct>;
    search: (q: string, params?: QueryParams, options?: RequestInit) => Promise<EcommapsSearchResponse>;
  };
  collections: {
    list: (options?: RequestInit) => Promise<{ data: EcommapsCollection[] }>;
    retrieve: (slug: string, limit?: number, offset?: number, options?: RequestInit) => Promise<{
      collection: EcommapsCollection;
      products: EcommapsProduct[];
      pagination: unknown;
    }>;
  };
  cart: {
    create: (options?: RequestInit) => Promise<EcommapsCart>;
    retrieve: (cartId: string, options?: RequestInit) => Promise<EcommapsCart>;
    addItem: (cartId: string, body: { product_id: string; variant_id?: string; quantity: number }, options?: RequestInit) => Promise<EcommapsCart>;
    updateItem: (cartId: string, itemId: string, body: { quantity: number }, options?: RequestInit) => Promise<EcommapsCart>;
    removeItem: (cartId: string, itemId: string, options?: RequestInit) => Promise<EcommapsCart>;
  };
  orders: {
    create: (body: EcommapsCreateOrderRequest, options?: RequestInit) => Promise<EcommapsOrder>;
    retrieve: (orderNumber: string, options?: RequestInit) => Promise<EcommapsOrder>;
    list: (options?: RequestInit & { params?: { limit?: number; offset?: number } }) => Promise<{ data: EcommapsOrder[]; pagination: unknown }>;
  };
  auth: {
    login: (body: unknown, options?: RequestInit) => Promise<EcommapsAuthResponse>;
    signup: (body: unknown, options?: RequestInit) => Promise<EcommapsAuthResponse>;
    me: (options?: RequestInit) => Promise<{ customer: EcommapsCustomer }>;
    addAddress: (body: unknown, options?: RequestInit) => Promise<{ success: boolean; address: unknown }>;
    setDefaultAddress: (addressId: string, options?: RequestInit) => Promise<{ success: boolean; addresses: unknown[] }>;
    deleteAddress: (addressId: string, options?: RequestInit) => Promise<{ success: boolean; addresses: unknown[] }>;
  };
}

export class EcommapsAPIError extends Error {
  public status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "EcommapsAPIError";
    this.status = status;
  }
}

function buildEndpoint(endpoint: string, params?: QueryParams): string {
  const base = endpoint;
  if (!params) return base;

  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    query.append(key, String(value));
  });

  const queryString = query.toString();
  return queryString ? `${base}?${queryString}` : base;
}

function normalizeArrayPayload<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object" && Array.isArray((payload as { data?: unknown[] }).data)) {
    return (payload as { data: T[] }).data;
  }
  if (payload && typeof payload === "object" && Array.isArray((payload as { results?: unknown[] }).results)) {
    return (payload as { results: T[] }).results;
  }
  return [];
}

function normalizeRecordPayload<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && !Array.isArray(payload) && "data" in payload) {
    const maybeData = (payload as { data?: unknown }).data;
    if (maybeData && typeof maybeData === "object" && !Array.isArray(maybeData)) {
      return maybeData as T;
    }
  }
  if (payload && typeof payload === "object" && !Array.isArray(payload) && "result" in payload) {
    const maybeResult = (payload as { result?: unknown }).result;
    if (maybeResult && typeof maybeResult === "object" && !Array.isArray(maybeResult)) {
      return maybeResult as T;
    }
  }
  return payload as T;
}

function normalizePaginatedPayload<T>(payload: unknown): PaginatedResponse<T> {
  if (payload && typeof payload === "object" && Array.isArray((payload as { data?: unknown[] }).data)) {
    const record = payload as { data: T[]; pagination?: PaginatedResponse<T>["pagination"] };
    return {
      data: record.data,
      pagination: record.pagination ?? {
        total: record.data.length,
        limit: record.data.length,
        offset: 0,
        has_more: false,
      },
    };
  }

  const asArray = Array.isArray(payload) ? (payload as T[]) : [];
  return {
    data: asArray,
    pagination: {
      total: asArray.length,
      limit: asArray.length,
      offset: 0,
      has_more: false,
    },
  };
}

export function createEcommapsClient(config: EcommapsClientConfig = {}): EcommapsClient {
  const apiUrl = config.apiUrl || DEFAULT_API_URL;
  const apiKey = config.apiKey ?? DEFAULT_API_KEY;
  const fetchImpl = config.fetch || fetch;
  const baseHeaders = config.defaultHeaders;

  async function ecommapsFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${apiUrl}${endpoint}`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(apiKey ? { "x-api-key": apiKey } : {}),
      ...(baseHeaders || {}),
      ...(options?.headers || {}),
    };

    const response = await fetchImpl(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        errorMessage =
          (typeof errorData?.detail === "string" && errorData.detail) ||
          (typeof errorData?.message === "string" && errorData.message) ||
          errorMessage;
      } catch {
        // noop
      }
      throw new EcommapsAPIError(errorMessage, response.status);
    }

    return (await response.json()) as T;
  }

  return {
    store: {
      retrieve: async (options?: RequestInit) => {
        const payload = await ecommapsFetch<unknown>("/store", options);
        return normalizeRecordPayload<EcommapsSite>(payload);
      },
      menus: {
        list: async (options?: RequestInit) => {
          const payload = await ecommapsFetch<unknown>("/store/menus", options);
          return normalizeArrayPayload<EcommapsMenu>(payload);
        },
        retrieve: async (handle: string, options?: RequestInit) => {
          const payload = await ecommapsFetch<unknown>(`/store/menus/${handle}`, options);
          return normalizeRecordPayload<EcommapsMenu>(payload);
        },
      },
      coupons: {
        validate: (body: { code: string; cart_total?: number; items?: unknown[] }, options?: RequestInit) =>
          ecommapsFetch<EcommapsCouponValidateResponse>("/coupons/validate", {
            ...options,
            method: "POST",
            body: JSON.stringify(body),
          }),
      },
      pages: {
        list: async (options?: RequestInit) => {
          const payload = await ecommapsFetch<unknown>("/pages", options);
          return normalizeArrayPayload<EcommapsPage>(payload);
        },
        retrieve: async (slug: string, options?: RequestInit) => {
          const payload = await ecommapsFetch<unknown>(`/pages/${slug}`, options);
          return normalizeRecordPayload<EcommapsPage>(payload);
        },
      },
      blogs: {
        list: async (options?: RequestInit) => {
          const payload = await ecommapsFetch<unknown>("/blogs", options);
          return normalizeArrayPayload<EcommapsBlog>(payload);
        },
        retrieve: async (slug: string, options?: RequestInit) => {
          const payload = await ecommapsFetch<unknown>(`/blogs/${slug}`, options);
          return normalizeRecordPayload<EcommapsBlog>(payload);
        },
      },
    },
    products: {
      list: async (params?: QueryParams, options?: RequestInit) => {
        const payload = await ecommapsFetch<unknown>(buildEndpoint("/products", params), options);
        return normalizePaginatedPayload<EcommapsProduct>(payload);
      },
      retrieve: (slug: string, options?: RequestInit) => ecommapsFetch<EcommapsProduct>(`/products/${slug}`, options),
      search: async (q: string, params?: QueryParams, options?: RequestInit) => {
        const payload = await ecommapsFetch<unknown>(buildEndpoint("/search", { q, ...(params || {}) }), options);
        const normalized = normalizePaginatedPayload<EcommapsProduct>(payload);
        return {
          data: normalized.data,
          pagination: normalized.pagination,
          query: q,
        };
      },
    },
    collections: {
      list: async (options?: RequestInit) => {
        const payload = await ecommapsFetch<unknown>("/collections", options);
        return { data: normalizeArrayPayload<EcommapsCollection>(payload) };
      },
      retrieve: (slug: string, limit = 20, offset = 0, options?: RequestInit) =>
        ecommapsFetch<{
          collection: EcommapsCollection;
          products: EcommapsProduct[];
          pagination: unknown;
        }>(`/collections/${slug}?limit=${limit}&offset=${offset}`, options),
    },
    cart: {
      create: (options?: RequestInit) => ecommapsFetch<EcommapsCart>("/cart", { ...options, method: "POST" }),
      retrieve: (cartId: string, options?: RequestInit) => ecommapsFetch<EcommapsCart>(`/cart/${cartId}`, options),
      addItem: (cartId: string, body: { product_id: string; variant_id?: string; quantity: number }, options?: RequestInit) =>
        ecommapsFetch<EcommapsCart>(`/cart/${cartId}/items`, {
          ...options,
          method: "POST",
          body: JSON.stringify(body),
        }),
      updateItem: (cartId: string, itemId: string, body: { quantity: number }, options?: RequestInit) =>
        ecommapsFetch<EcommapsCart>(`/cart/${cartId}/items/${itemId}`, {
          ...options,
          method: "PATCH",
          body: JSON.stringify(body),
        }),
      removeItem: (cartId: string, itemId: string, options?: RequestInit) =>
        ecommapsFetch<EcommapsCart>(`/cart/${cartId}/items/${itemId}`, {
          ...options,
          method: "DELETE",
        }),
    },
    orders: {
      create: (body: EcommapsCreateOrderRequest, options?: RequestInit) =>
        ecommapsFetch<EcommapsOrder>("/orders", {
          ...options,
          method: "POST",
          body: JSON.stringify(body),
        }),
      retrieve: async (orderNumber: string, options?: RequestInit) => {
        try {
          return await ecommapsFetch<EcommapsOrder>(`/orders/track/${orderNumber}`, options);
        } catch (error) {
          if (error instanceof EcommapsAPIError && error.status === 404) {
            return ecommapsFetch<EcommapsOrder>(`/orders/${orderNumber}`, options);
          }
          throw error;
        }
      },
      list: async (options?: RequestInit & { params?: { limit?: number; offset?: number } }) => {
        const payload = await ecommapsFetch<unknown>(
          buildEndpoint("/orders", {
            limit: options?.params?.limit,
            offset: options?.params?.offset,
          }),
          options,
        );
        if (payload && typeof payload === "object" && Array.isArray((payload as { data?: unknown[] }).data)) {
          const result = payload as { data: EcommapsOrder[]; pagination: unknown };
          return result;
        }
        return { data: [] as EcommapsOrder[], pagination: null };
      },
    },
    auth: {
      login: (body: unknown, options?: RequestInit) =>
        ecommapsFetch<EcommapsAuthResponse>("/auth/login", {
          ...options,
          method: "POST",
          body: JSON.stringify(body),
        }),
      signup: (body: unknown, options?: RequestInit) =>
        ecommapsFetch<EcommapsAuthResponse>("/auth/signup", {
          ...options,
          method: "POST",
          body: JSON.stringify(body),
        }),
      me: (options?: RequestInit) => ecommapsFetch<{ customer: EcommapsCustomer }>("/auth/me", options),
      addAddress: (body: unknown, options?: RequestInit) =>
        ecommapsFetch<{ success: boolean; address: unknown }>("/auth/me/addresses", {
          ...options,
          method: "POST",
          body: JSON.stringify(body),
        }),
      setDefaultAddress: (addressId: string, options?: RequestInit) =>
        ecommapsFetch<{ success: boolean; addresses: unknown[] }>(`/auth/me/addresses/${addressId}/default`, {
          ...options,
          method: "PATCH",
        }),
      deleteAddress: (addressId: string, options?: RequestInit) =>
        ecommapsFetch<{ success: boolean; addresses: unknown[] }>(`/auth/me/addresses/${addressId}`, {
          ...options,
          method: "DELETE",
        }),
    },
  };
}

export const ecommapsClient = createEcommapsClient();
