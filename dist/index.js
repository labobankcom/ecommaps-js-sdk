"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  EcommapsAPIError: () => EcommapsAPIError,
  createEcommapsClient: () => createEcommapsClient,
  ecommapsClient: () => ecommapsClient
});
module.exports = __toCommonJS(index_exports);

// src/client.ts
var DEFAULT_API_URL = process.env.NEXT_PUBLIC_ECOMMAPS_API_URL || "https://api.ecommaps.com/api/v1/storefront";
var DEFAULT_API_KEY = process.env.ECOMMAPS_API_KEY || "";
var EcommapsAPIError = class extends Error {
  status;
  constructor(message, status) {
    super(message);
    this.name = "EcommapsAPIError";
    this.status = status;
  }
};
function buildEndpoint(endpoint, params) {
  const base = endpoint;
  if (!params) return base;
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === void 0 || value === null) return;
    query.append(key, String(value));
  });
  const queryString = query.toString();
  return queryString ? `${base}?${queryString}` : base;
}
function normalizeArrayPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object" && Array.isArray(payload.data)) {
    return payload.data;
  }
  if (payload && typeof payload === "object" && Array.isArray(payload.results)) {
    return payload.results;
  }
  return [];
}
function normalizeRecordPayload(payload) {
  if (payload && typeof payload === "object" && !Array.isArray(payload) && "data" in payload) {
    const maybeData = payload.data;
    if (maybeData && typeof maybeData === "object" && !Array.isArray(maybeData)) {
      return maybeData;
    }
  }
  if (payload && typeof payload === "object" && !Array.isArray(payload) && "result" in payload) {
    const maybeResult = payload.result;
    if (maybeResult && typeof maybeResult === "object" && !Array.isArray(maybeResult)) {
      return maybeResult;
    }
  }
  return payload;
}
function normalizePaginatedPayload(payload) {
  if (payload && typeof payload === "object" && Array.isArray(payload.data)) {
    const record = payload;
    return {
      data: record.data,
      pagination: record.pagination ?? {
        total: record.data.length,
        limit: record.data.length,
        offset: 0,
        has_more: false
      }
    };
  }
  const asArray = Array.isArray(payload) ? payload : [];
  return {
    data: asArray,
    pagination: {
      total: asArray.length,
      limit: asArray.length,
      offset: 0,
      has_more: false
    }
  };
}
function createEcommapsClient(config = {}) {
  const apiUrl = config.apiUrl || DEFAULT_API_URL;
  const apiKey = config.apiKey ?? DEFAULT_API_KEY;
  const fetchImpl = config.fetch || fetch;
  const baseHeaders = config.defaultHeaders;
  async function ecommapsFetch(endpoint, options) {
    const url = `${apiUrl}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...apiKey ? { "x-api-key": apiKey } : {},
      ...baseHeaders || {},
      ...options?.headers || {}
    };
    const response = await fetchImpl(url, {
      ...options,
      headers
    });
    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        errorMessage = typeof errorData?.detail === "string" && errorData.detail || typeof errorData?.message === "string" && errorData.message || errorMessage;
      } catch {
      }
      throw new EcommapsAPIError(errorMessage, response.status);
    }
    return await response.json();
  }
  return {
    store: {
      retrieve: async (options) => {
        const payload = await ecommapsFetch("/store", options);
        return normalizeRecordPayload(payload);
      },
      menus: {
        list: async (options) => {
          const payload = await ecommapsFetch("/store/menus", options);
          return normalizeArrayPayload(payload);
        },
        retrieve: async (handle, options) => {
          const payload = await ecommapsFetch(`/store/menus/${handle}`, options);
          return normalizeRecordPayload(payload);
        }
      },
      coupons: {
        validate: (body, options) => ecommapsFetch("/coupons/validate", {
          ...options,
          method: "POST",
          body: JSON.stringify(body)
        })
      },
      pages: {
        list: async (options) => {
          const payload = await ecommapsFetch("/pages", options);
          return normalizeArrayPayload(payload);
        },
        retrieve: async (slug, options) => {
          const payload = await ecommapsFetch(`/pages/${slug}`, options);
          return normalizeRecordPayload(payload);
        }
      },
      blogs: {
        list: async (options) => {
          const payload = await ecommapsFetch("/blogs", options);
          return normalizeArrayPayload(payload);
        },
        retrieve: async (slug, options) => {
          const payload = await ecommapsFetch(`/blogs/${slug}`, options);
          return normalizeRecordPayload(payload);
        }
      }
    },
    products: {
      list: async (params, options) => {
        const payload = await ecommapsFetch(buildEndpoint("/products", params), options);
        return normalizePaginatedPayload(payload);
      },
      retrieve: (slug, options) => ecommapsFetch(`/products/${slug}`, options),
      search: async (q, params, options) => {
        const payload = await ecommapsFetch(buildEndpoint("/search", { q, ...params || {} }), options);
        const normalized = normalizePaginatedPayload(payload);
        return {
          data: normalized.data,
          pagination: normalized.pagination,
          query: q
        };
      }
    },
    collections: {
      list: async (options) => {
        const payload = await ecommapsFetch("/collections", options);
        return { data: normalizeArrayPayload(payload) };
      },
      retrieve: (slug, limit = 20, offset = 0, options) => ecommapsFetch(`/collections/${slug}?limit=${limit}&offset=${offset}`, options)
    },
    cart: {
      create: (options) => ecommapsFetch("/cart", { ...options, method: "POST" }),
      retrieve: (cartId, options) => ecommapsFetch(`/cart/${cartId}`, options),
      addItem: (cartId, body, options) => ecommapsFetch(`/cart/${cartId}/items`, {
        ...options,
        method: "POST",
        body: JSON.stringify(body)
      }),
      updateItem: (cartId, itemId, body, options) => ecommapsFetch(`/cart/${cartId}/items/${itemId}`, {
        ...options,
        method: "PATCH",
        body: JSON.stringify(body)
      }),
      removeItem: (cartId, itemId, options) => ecommapsFetch(`/cart/${cartId}/items/${itemId}`, {
        ...options,
        method: "DELETE"
      })
    },
    orders: {
      create: (body, options) => ecommapsFetch("/orders", {
        ...options,
        method: "POST",
        body: JSON.stringify(body)
      }),
      retrieve: (orderNumber, options) => ecommapsFetch(`/orders/${orderNumber}`, options),
      list: async (options) => {
        const payload = await ecommapsFetch(
          buildEndpoint("/orders", {
            limit: options?.params?.limit,
            offset: options?.params?.offset
          }),
          options
        );
        if (payload && typeof payload === "object" && Array.isArray(payload.data)) {
          return payload;
        }
        return { data: [], pagination: null };
      }
    },
    auth: {
      login: (body, options) => ecommapsFetch("/auth/login", {
        ...options,
        method: "POST",
        body: JSON.stringify(body)
      }),
      signup: (body, options) => ecommapsFetch("/auth/signup", {
        ...options,
        method: "POST",
        body: JSON.stringify(body)
      }),
      me: (options) => ecommapsFetch("/auth/me", options),
      addAddress: (body, options) => ecommapsFetch("/auth/me/addresses", {
        ...options,
        method: "POST",
        body: JSON.stringify(body)
      }),
      setDefaultAddress: (addressId, options) => ecommapsFetch(`/auth/me/addresses/${addressId}/default`, {
        ...options,
        method: "PATCH"
      }),
      deleteAddress: (addressId, options) => ecommapsFetch(`/auth/me/addresses/${addressId}`, {
        ...options,
        method: "DELETE"
      })
    }
  };
}
var ecommapsClient = createEcommapsClient();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EcommapsAPIError,
  createEcommapsClient,
  ecommapsClient
});
