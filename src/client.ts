import {
    EcommapsProduct,
    EcommapsCollection,
    EcommapsSite,
    EcommapsCart,
    PaginatedResponse,
} from "./types"

const API_URL =
    process.env.NEXT_PUBLIC_ECOMMAPS_API_URL ||
    "http://127.0.0.1:8001/api/v1/storefront"
const API_KEY = process.env.ECOMMAPS_API_KEY || ""

export class EcommapsAPIError extends Error {
    public status: number
    constructor(message: string, status: number) {
        super(message)
        this.name = "EcommapsAPIError"
        this.status = status
    }
}

async function ecommapsFetch<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const url = `${API_URL}${endpoint}`

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        ...(options?.headers || {}),
    }

    const response = await fetch(url, {
        ...options,
        headers,
    })

    if (!response.ok) {
        let errorMessage = response.statusText
        try {
            const errorData = await response.json()
            errorMessage = errorData.detail || errorMessage
        } catch (e) {
            // Ignore
        }
        console.error(`[EcommapsClient] ${response.status} error fetching ${url} - ${errorMessage}`);
        throw new EcommapsAPIError(errorMessage, response.status)
    }

    return response.json()
}

export const ecommapsClient = {
    store: {
        retrieve: (options?: RequestInit) => ecommapsFetch<EcommapsSite>("/store", options),
        menus: (options?: RequestInit) => ecommapsFetch<any>("/store/menus", options),
    },
    products: {
        list: (params?: Record<string, string | number>, options?: RequestInit) => {
            const query = new URLSearchParams()
            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        query.append(key, String(value))
                    }
                })
            }
            return ecommapsFetch<PaginatedResponse<EcommapsProduct>>(
                `/products?${query.toString()}`,
                options
            )
        },
        retrieve: (slug: string, options?: RequestInit) =>
            ecommapsFetch<EcommapsProduct>(`/products/${slug}`, options),
    },
    collections: {
        list: (options?: RequestInit) => ecommapsFetch<{ data: EcommapsCollection[] }>("/collections", options),
        retrieve: (slug: string, limit = 20, offset = 0, options?: RequestInit) =>
            ecommapsFetch<{
                collection: EcommapsCollection
                products: EcommapsProduct[]
                pagination: any
            }>(`/collections/${slug}?limit=${limit}&offset=${offset}`, options),
    },
    cart: {
        create: (options?: RequestInit) =>
            ecommapsFetch<EcommapsCart>("/cart", { ...options, method: "POST" }),
        retrieve: (cartId: string, options?: RequestInit) =>
            ecommapsFetch<EcommapsCart>(`/cart/${cartId}`, options),
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
        create: (body: any, options?: RequestInit) =>
            ecommapsFetch<any>("/orders", {
                ...options,
                method: "POST",
                body: JSON.stringify(body),
            }),
        retrieve: (orderNumber: string, options?: RequestInit) =>
            ecommapsFetch<any>(`/orders/${orderNumber}`, options),
        list: (options?: RequestInit & { params?: { limit?: number; offset?: number } }) => {
            const searchParams = new URLSearchParams()
            if (options?.params?.limit) searchParams.append("limit", options.params.limit.toString())
            if (options?.params?.offset) searchParams.append("offset", options.params.offset.toString())
            const qs = searchParams.toString() ? `?${searchParams.toString()}` : ""
            return ecommapsFetch<{ data: any[]; pagination: any }>(`/orders${qs}`, options)
        },
    },
    auth: {
        login: (body: any, options?: RequestInit) =>
            ecommapsFetch<import("./types").EcommapsAuthResponse>("/auth/login", {
                ...options,
                method: "POST",
                body: JSON.stringify(body),
            }),
        signup: (body: any, options?: RequestInit) =>
            ecommapsFetch<import("./types").EcommapsAuthResponse>("/auth/signup", {
                ...options,
                method: "POST",
                body: JSON.stringify(body),
            }),
        me: (options?: RequestInit) =>
            ecommapsFetch<{ customer: import("./types").EcommapsCustomer }>("/auth/me", options),
        addAddress: (body: any, options?: RequestInit) =>
            ecommapsFetch<{ success: boolean; address: any }>("/auth/me/addresses", {
                ...options,
                method: "POST",
                body: JSON.stringify(body),
            }),
    },
}
