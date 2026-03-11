# Migration Notes (v1.4.x)

`@ecommaps/client` remains backward compatible while adding new typed capabilities.

## New in v1.4.x

- `createEcommapsClient(config)`
- `store.pages.list/retrieve`
- `store.blogs.list/retrieve`
- typed `store.coupons.validate`
- stronger product/variant/promotion/page/blog types

## No breaking changes

- Existing `ecommapsClient` import still works.
- Existing cart/auth/products/orders calls keep the same usage.
