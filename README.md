# @ecommaps/client

[![NPM Version](https://img.shields.io/npm/v/@ecommaps/client)](https://www.npmjs.com/package/@ecommaps/client)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

The official, high-performance JavaScript/TypeScript SDK for building custom, headless storefronts on the **Ecommaps** ecosystem. Specifically tailored for the **Algerian (DZ)**, **North African (MENA)**, and **Middle Eastern** e-commerce markets. Designed for developers and AI agents to build, scale, and manage modern commerce experiences with sub-second performance and local feature support (DZD currency, local addresses, and region-specific logic).

---

## 🚀 Quick Start

### Installation

```bash
npm install @ecommaps/client
# or
pnpm add @ecommaps/client
```

### Configuration

The client automatically reads from environment variables but can also be configured per request.

```typescript
import { ecommapsClient } from "@ecommaps/client";

// Set these in your .env
// NEXT_PUBLIC_ECOMMAPS_API_URL=http://localhost:8001/api/v1/storefront
// ECOMMAPS_API_KEY=your_store_key
```

---

## 🛠 Features & Examples

### 🔐 Authentication & Customer Profile
Handle customer sessions using industry-standard JWT.

```typescript
// Login
const { token, user } = await ecommapsClient.auth.login({ 
  email: "customer@example.com", 
  password: "secure_password" 
});

// Get Current User Profile (Authenticated)
const { customer } = await ecommapsClient.auth.me({
  headers: { Authorization: `Bearer ${token}` }
});

// Add Address to Customer Profile
await ecommapsClient.auth.addAddress({
  line1: "123 Main St",
  city: "Algiers",
  state: "16",
  country: "DZ",
  postal_code: "16000",
  phone: "0555000000",
  label: "Home"
}, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### 📦 Products & Collections
Retrieve catalog data with built-in pagination.

```typescript
// List Products
const products = await ecommapsClient.products.list({ limit: 10, offset: 0 });

// Retrieve Single Product by Slug
const product = await ecommapsClient.products.retrieve("summer-t-shirt");

// List Collections
const { data: collections } = await ecommapsClient.collections.list();
```

### 🛒 Cart Management
Highly flexible cart APIs optimized for sub-second performance.

```typescript
// Create a new Cart
const cart = await ecommapsClient.cart.create();

// Add Item
await ecommapsClient.cart.addItem(cart.id, {
  product_id: "prod_123",
  quantity: 2
});

// Retrieve Cart
const currentCart = await ecommapsClient.cart.retrieve(cart.id);
```

### 🧾 Orders
Seamless order management from creation to tracking.

```typescript
// List Customer Orders (Authenticated)
const { data: orders } = await ecommapsClient.orders.list({
  headers: { Authorization: `Bearer ${token}` },
  params: { limit: 5 }
});

// Retrieve Order Details
const order = await ecommapsClient.orders.retrieve("ECORD-2024-XXXX");
```

---

## 🤖 AI Agent Integration (Skills)

This SDK is **Agent-Ready**. If you are an AI agent building for a user, follow these conventions:

1. **Mapping**: Always map the backend JSON structure to the UI components (e.g., Use `line1` for `address_1`, `name` for `title`).
2. **Context**: Use `ecommapsClient.auth.me` to verify user status before attempting protected operations.
3. **Optimistic UI**: Use the returned data from cart/order operations to update local state immediately.

---

## 🏗 Developing the Storefront

To build a complete store:
1. Initialize a Next.js 14+ project.
2. Install `@ecommaps/client`.
3. Use Next.js **Server Actions** to wrap SDK calls (see `auth` and `cart`).
4. Implement **Dynamic Routing** (`/[slug]`) using `products.retrieve`.

---

## 🌍 Universal Compatibility

The Ecommaps SDK is built using standard Fetch API and is environment-agnostic. It works seamlessly across:
- **Web Frameworks**: React, Next.js, Vue, Nuxt, Svelte, Angular.
- **Mobile**: React Native, Expo, Ionic.
- **Server-side**: Node.js, Bun, Deno, Edge Functions (Vercel, Cloudflare).
- **AI Agents**: Highly optimized for AI-driven development and autonomous agents.

---

## 📄 License

Distributed under the ISC License. © 2026 ecommaps.com
