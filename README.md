# @ecommaps/client

Official TypeScript SDK for Ecommaps storefront APIs.

![npm version](https://img.shields.io/npm/v/@ecommaps/client)
![npm downloads](https://img.shields.io/npm/dm/@ecommaps/client)

## Release status (source of truth)

- Canonical package version is the npm registry version.
- Verify current published version with:

```bash
npm view @ecommaps/client version
```

## 1. Positioning

`@ecommaps/client` is the Core API SDK layer.

Use this package when you need:
- direct access to Storefront endpoints
- strongly typed contracts for products, cart, auth, pages, blogs, and coupons
- environment-agnostic API consumption in Next.js, Node.js, Edge, or workers

If you need commerce logic (variant resolver, promotion classifier), use `@ecommaps/storefront-kit`.

## 2. Installation

```bash
pnpm add @ecommaps/client
```

## 3. Configuration

### Environment variables

```env
NEXT_PUBLIC_ECOMMAPS_API_URL=https://api.ecommaps.com/api/v1/storefront
ECOMMAPS_API_KEY=your_storefront_api_key
```

### Default singleton client

```ts
import { ecommapsClient } from "@ecommaps/client";
```

### Factory client

```ts
import { createEcommapsClient } from "@ecommaps/client";

const client = createEcommapsClient({
  apiUrl: "https://api.ecommaps.com/api/v1/storefront",
  apiKey: process.env.ECOMMAPS_API_KEY!,
});
```

## 4. API Surface

### Store

```ts
await ecommapsClient.store.retrieve();
await ecommapsClient.store.menus.list();
await ecommapsClient.store.menus.retrieve("main-menu");
await ecommapsClient.store.pages.list();
await ecommapsClient.store.pages.retrieve("refund");
await ecommapsClient.store.blogs.list();
await ecommapsClient.store.blogs.retrieve("new-arrivals");
await ecommapsClient.store.coupons.validate({ code: "DISCOUNT20", cart_total: 10000, items: [] });
```

### Products / Collections

```ts
await ecommapsClient.products.list({ limit: 12, offset: 0 });
await ecommapsClient.products.retrieve("product-slug");
await ecommapsClient.products.search("shirt", { limit: 10 });
await ecommapsClient.collections.list();
await ecommapsClient.collections.retrieve("menswear", 20, 0);
```

### Cart / Orders / Auth

```ts
const cart = await ecommapsClient.cart.create();
await ecommapsClient.cart.addItem(cart.id, { product_id: "product_uuid", variant_id: "variant_uuid", quantity: 1 });
await ecommapsClient.cart.retrieve(cart.id);
await ecommapsClient.orders.create({ cart_id: cart.id, customer_name: "Name", customer_phone: "0555000000" });
await ecommapsClient.auth.login({ email: "user@mail.com", password: "secret" });
```

## 5. Error handling

All non-2xx responses throw `EcommapsAPIError`:

```ts
import { EcommapsAPIError } from "@ecommaps/client";

try {
  await ecommapsClient.products.retrieve("missing");
} catch (error) {
  if (error instanceof EcommapsAPIError) {
    console.error(error.status, error.message);
  }
}
```

## 6. Compatibility

- Runtime: Node.js 20+
- Module formats: ESM + CJS
- TypeScript: full declaration files included
- Backward compatibility: `ecommapsClient` default singleton remains supported

## 7. Migration

See [MIGRATION.md](./MIGRATION.md).

## 8. Release policy

- Semver is enforced.
- Breaking changes are released only in major versions.
- Every published change must include changelog notes.
