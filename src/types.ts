export interface EcommapsSite {
    id: string
    name: string
    slug: string
    description: string | null
    logo_url: string | null
    custom_domain: string | null
    theme: any | null
    theme_settings: any | null
    settings: any | null
    contact_info: any | null
    social_links: any | null
}

export interface EcommapsProductVariant {
    title: string
    prices: any[]
    options: any[]
    inventory_quantity: number
    sku: string | null
    id?: string
}

export interface EcommapsProduct {
    id: string
    site_id: string
    name: string
    slug: string
    description: string | null
    price: number
    compare_at_price: number | null
    currency: string | null
    images: any | null
    category: string | null
    tags: string[] | null
    inventory_quantity: number | null
    is_active: boolean | null
    created_at: string | null
    updated_at: string | null
    sku: string | null
    barcode: string | null
    cost_per_item: number | null
    track_quantity: boolean | null
    continue_selling_when_out_of_stock: boolean | null
    weight: number | null
    weight_unit: string | null
    vendor: string | null
    product_type: string | null
    options: any | null
    variants: any | null
    charge_tax: boolean | null
    is_physical: boolean | null
}

export interface EcommapsCollection {
    id: string
    site_id: string
    title: string
    description: string | null
    slug: string
    image_url: string | null
    is_active: boolean | null
    sort_order: string | null
    created_at: string
    updated_at: string
}

export interface PaginationMeta {
    total: number
    limit: number
    offset: number
    has_more: boolean
}

export interface PaginatedResponse<T> {
    data: T[]
    pagination: PaginationMeta
}

export interface EcommapsCartItem {
    id: string
    product_id: string
    variant_id: string | null
    product_name: string
    product_price: number
    product_image: string | null
    quantity: number
    subtotal: number
}

export interface EcommapsCart {
    id: string
    site_id: string
    items: EcommapsCartItem[]
    items_count: number
    subtotal: number
    created_at: string | null
}

export interface EcommapsCustomer {
    id: string
    store_id: string
    email: string
    full_name: string
    phone: string | null
    addresses: any[]
    created_at: string
}

export interface EcommapsAuthResponse {
    token: string
    user: EcommapsCustomer
}
