interface EcommapsSite {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    logo_url: string | null;
    custom_domain: string | null;
    theme: any | null;
    theme_settings: any | null;
    settings: any | null;
    contact_info: any | null;
    social_links: any | null;
}
interface EcommapsProductVariant {
    title: string;
    prices: any[];
    options: any[];
    inventory_quantity: number;
    sku: string | null;
    id?: string;
}
interface EcommapsProduct {
    id: string;
    site_id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    compare_at_price: number | null;
    currency: string | null;
    images: any | null;
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
    options: any | null;
    variants: any | null;
    charge_tax: boolean | null;
    is_physical: boolean | null;
}
interface EcommapsCollection {
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
interface PaginationMeta {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
}
interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMeta;
}
interface EcommapsCartItem {
    id: string;
    product_id: string;
    variant_id: string | null;
    product_name: string;
    product_price: number;
    product_image: string | null;
    quantity: number;
    subtotal: number;
}
interface EcommapsCart {
    id: string;
    site_id: string;
    items: EcommapsCartItem[];
    items_count: number;
    subtotal: number;
    created_at: string | null;
}
interface EcommapsCustomer {
    id: string;
    store_id: string;
    email: string;
    full_name: string;
    phone: string | null;
    addresses: any[];
    created_at: string;
}
interface EcommapsAuthResponse {
    token: string;
    user: EcommapsCustomer;
}

declare class EcommapsAPIError extends Error {
    status: number;
    constructor(message: string, status: number);
}
declare const ecommapsClient: {
    store: {
        retrieve: (options?: RequestInit) => Promise<EcommapsSite>;
        menus: (options?: RequestInit) => Promise<any>;
    };
    products: {
        list: (params?: Record<string, string | number>, options?: RequestInit) => Promise<PaginatedResponse<EcommapsProduct>>;
        retrieve: (slug: string, options?: RequestInit) => Promise<EcommapsProduct>;
    };
    collections: {
        list: (options?: RequestInit) => Promise<{
            data: EcommapsCollection[];
        }>;
        retrieve: (slug: string, limit?: number, offset?: number, options?: RequestInit) => Promise<{
            collection: EcommapsCollection;
            products: EcommapsProduct[];
            pagination: any;
        }>;
    };
    cart: {
        create: (options?: RequestInit) => Promise<EcommapsCart>;
        retrieve: (cartId: string, options?: RequestInit) => Promise<EcommapsCart>;
        addItem: (cartId: string, body: {
            product_id: string;
            variant_id?: string;
            quantity: number;
        }, options?: RequestInit) => Promise<EcommapsCart>;
        updateItem: (cartId: string, itemId: string, body: {
            quantity: number;
        }, options?: RequestInit) => Promise<EcommapsCart>;
        removeItem: (cartId: string, itemId: string, options?: RequestInit) => Promise<EcommapsCart>;
    };
    orders: {
        create: (body: any, options?: RequestInit) => Promise<any>;
        retrieve: (orderNumber: string, options?: RequestInit) => Promise<any>;
        list: (options?: RequestInit & {
            params?: {
                limit?: number;
                offset?: number;
            };
        }) => Promise<{
            data: any[];
            pagination: any;
        }>;
    };
    auth: {
        login: (body: any, options?: RequestInit) => Promise<EcommapsAuthResponse>;
        signup: (body: any, options?: RequestInit) => Promise<EcommapsAuthResponse>;
        me: (options?: RequestInit) => Promise<{
            customer: EcommapsCustomer;
        }>;
        addAddress: (body: any, options?: RequestInit) => Promise<{
            success: boolean;
            address: any;
        }>;
    };
};

export { EcommapsAPIError, type EcommapsAuthResponse, type EcommapsCart, type EcommapsCartItem, type EcommapsCollection, type EcommapsCustomer, type EcommapsProduct, type EcommapsProductVariant, type EcommapsSite, type PaginatedResponse, type PaginationMeta, ecommapsClient };
