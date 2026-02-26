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
  ecommapsClient: () => ecommapsClient
});
module.exports = __toCommonJS(index_exports);

// src/client.ts
var API_URL = process.env.NEXT_PUBLIC_ECOMMAPS_API_URL || "http://127.0.0.1:8001/api/v1/storefront";
var API_KEY = process.env.ECOMMAPS_API_KEY || "";
var EcommapsAPIError = class extends Error {
  status;
  constructor(message, status) {
    super(message);
    this.name = "EcommapsAPIError";
    this.status = status;
  }
};
async function ecommapsFetch(endpoint, options) {
  const url = `${API_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
    ...options?.headers || {}
  };
  const response = await fetch(url, {
    ...options,
    headers
  });
  if (!response.ok) {
    let errorMessage = response.statusText;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch (e) {
    }
    console.error(`[EcommapsClient] ${response.status} error fetching ${url} - ${errorMessage}`);
    throw new EcommapsAPIError(errorMessage, response.status);
  }
  return response.json();
}
var ecommapsClient = {
  store: {
    retrieve: (options) => ecommapsFetch("/store", options),
    menus: (options) => ecommapsFetch("/store/menus", options)
  },
  products: {
    list: (params, options) => {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== void 0 && value !== null) {
            query.append(key, String(value));
          }
        });
      }
      return ecommapsFetch(
        `/products?${query.toString()}`,
        options
      );
    },
    retrieve: (slug, options) => ecommapsFetch(`/products/${slug}`, options)
  },
  collections: {
    list: (options) => ecommapsFetch("/collections", options),
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
    list: (options) => {
      const searchParams = new URLSearchParams();
      if (options?.params?.limit) searchParams.append("limit", options.params.limit.toString());
      if (options?.params?.offset) searchParams.append("offset", options.params.offset.toString());
      const qs = searchParams.toString() ? `?${searchParams.toString()}` : "";
      return ecommapsFetch(`/orders${qs}`, options);
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
    })
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EcommapsAPIError,
  ecommapsClient
});
