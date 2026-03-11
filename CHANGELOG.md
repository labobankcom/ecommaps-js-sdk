# Changelog:

## 1.4.0

- Added `createEcommapsClient(config)` factory.
- Added typed Store endpoints:
  - `store.pages.list/retrieve`
  - `store.blogs.list/retrieve`
  - `store.coupons.validate` (typed payload/response)
- Improved type coverage for:
  - product variants and option values
  - product/media payloads
  - promotions/coupons
  - customer addresses
- Normalized list payload handling (`[]` and `{ data: [] }`) inside client methods.
- Kept `ecommapsClient` default export behavior (non-breaking for existing apps).
