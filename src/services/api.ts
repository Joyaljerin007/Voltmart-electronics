import {
  Product,
  Category,
  Brand,
  Review,
  PriceAlert,
  Order,
  WishlistItem,
  FilterState,
  ApiResponse,
  OrderStatus,
} from '../types';

const API_BASE = '/api/v1';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    const json = await res.json();
    return json;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network request failed',
      timestamp: new Date().toISOString(),
    };
  }
}

export const api = {
  // Catalog
  async getCategories() {
    return fetchJson<Category[]>(`${API_BASE}/catalog/categories`);
  },

  async getBrands() {
    return fetchJson<Brand[]>(`${API_BASE}/catalog/brands`);
  },

  async getProducts(filters: Partial<FilterState> & { page?: number; limit?: number }) {
    const params = new URLSearchParams();

    if (filters.searchQuery) params.append('searchQuery', filters.searchQuery);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.brandIds && filters.brandIds.length) {
      params.append('brandIds', filters.brandIds.join(','));
    }
    if (filters.minPrice !== undefined) params.append('minPrice', String(filters.minPrice));
    if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
      params.append('maxPrice', String(filters.maxPrice));
    }
    if (filters.minRating !== undefined && filters.minRating > 0) {
      params.append('minRating', String(filters.minRating));
    }
    if (filters.inStockOnly) params.append('inStockOnly', 'true');
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    // Dynamic specs
    if (filters.specFilters) {
      Object.entries(filters.specFilters).forEach(([specKey, values]) => {
        if (values.length) {
          params.append(`spec_${specKey}`, values.join(','));
        }
      });
    }

    return fetchJson<Product[]>(`${API_BASE}/catalog/products?${params.toString()}`);
  },

  async getProductById(idOrCode: string) {
    return fetchJson<Product & { priceHistory: any[]; reviews: Review[]; faqs: any[]; documents: any[] }>(
      `${API_BASE}/catalog/products/${encodeURIComponent(idOrCode)}`
    );
  },

  async lookupBarcode(barcode: string) {
    return fetchJson<Product>(`${API_BASE}/barcode/${encodeURIComponent(barcode)}`);
  },

  async compareProducts(productIds: string[]) {
    return fetchJson<{
      products: Product[];
      matrix: {
        group: string;
        specs: { name: string; values: Record<string, string>; isDifferent: boolean }[];
      }[];
    }>(`${API_BASE}/catalog/compare`, {
      method: 'POST',
      body: JSON.stringify({ productIds }),
    });
  },

  // Reviews
  async submitReview(productId: string, data: { userId: string; userName: string; rating: number; title: string; comment: string }) {
    return fetchJson<Review>(`${API_BASE}/catalog/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async voteHelpfulReview(reviewId: string) {
    return fetchJson<Review>(`${API_BASE}/reviews/${reviewId}/helpful`, {
      method: 'POST',
    });
  },

  // Wishlist
  async getWishlist(userId: string) {
    return fetchJson<WishlistItem[]>(`${API_BASE}/wishlist?userId=${userId}`);
  },

  async addToWishlist(userId: string, productId: string) {
    return fetchJson<WishlistItem>(`${API_BASE}/wishlist`, {
      method: 'POST',
      body: JSON.stringify({ userId, productId }),
    });
  },

  async removeFromWishlist(userId: string, productId: string) {
    return fetchJson<{ success: boolean }>(`${API_BASE}/wishlist/${productId}?userId=${userId}`, {
      method: 'DELETE',
    });
  },

  // Price Alerts
  async getPriceAlerts(userId: string) {
    return fetchJson<PriceAlert[]>(`${API_BASE}/price-alerts?userId=${userId}`);
  },

  async createPriceAlert(userId: string, productId: string, targetPrice: number) {
    return fetchJson<PriceAlert>(`${API_BASE}/price-alerts`, {
      method: 'POST',
      body: JSON.stringify({ userId, productId, targetPrice }),
    });
  },

  async deletePriceAlert(alertId: string) {
    return fetchJson<{ id: string }>(`${API_BASE}/price-alerts/${alertId}`, {
      method: 'DELETE',
    });
  },

  // Orders
  async getOrders(userId?: string) {
    const url = userId ? `${API_BASE}/orders?userId=${userId}` : `${API_BASE}/orders`;
    return fetchJson<Order[]>(url);
  },

  async getOrderById(orderId: string) {
    return fetchJson<Order>(`${API_BASE}/orders/${orderId}`);
  },

  async createOrder(payload: any) {
    return fetchJson<Order>(`${API_BASE}/orders`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateOrderStatus(orderId: string, status: OrderStatus, description?: string) {
    return fetchJson<Order>(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, description }),
    });
  },

  async cancelOrder(orderId: string) {
    return fetchJson<Order>(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'CANCELLED', description: 'Cancelled by customer' }),
    });
  },

  // Admin APIs
  async getAdminAnalytics() {
    return fetchJson<{
      summary: {
        totalRevenue: number;
        totalOrders: number;
        totalCatalogItems: number;
        lowStockCount: number;
        activePriceAlerts: number;
        avgOrderValue: number;
      };
      categorySales: { name: string; revenue: number; units: number }[];
      lowStockProducts: Product[];
      recentOrders: Order[];
    }>(`${API_BASE}/admin/analytics`);
  },

  async getAnalytics() {
    return fetchJson<{
      totalRevenue: number;
      totalOrders: number;
      totalProducts: number;
      lowStockCount: number;
      summary: {
        totalRevenue: number;
        totalOrders: number;
        totalCatalogItems: number;
        lowStockCount: number;
        activePriceAlerts: number;
        avgOrderValue: number;
      };
      categorySales: { name: string; revenue: number; units: number }[];
      lowStockProducts: Product[];
      recentOrders: Order[];
    }>(`${API_BASE}/admin/analytics`);
  },

  async createProduct(productData: any) {
    return fetchJson<Product>(`${API_BASE}/catalog/products`, {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  async updateProduct(id: string, updates: any) {
    return fetchJson<Product>(`${API_BASE}/catalog/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async updateProductPrice(id: string, newPrice: number, note?: string) {
    return fetchJson<Product>(`${API_BASE}/catalog/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ salePrice: newPrice, priceNote: note }),
    });
  },

  async deleteProduct(id: string) {
    return fetchJson<{ id: string }>(`${API_BASE}/catalog/products/${id}`, {
      method: 'DELETE',
    });
  },

  async getDatabaseSchema() {
    return fetchJson<{
      schemaVersion: string;
      dialect: string;
      migrationTool: string;
      ddl: string;
    }>(`${API_BASE}/admin/schema`);
  },

  async getSchemaDdl() {
    return fetchJson<{
      schemaVersion: string;
      dialect: string;
      migrationTool: string;
      ddl: string;
    }>(`${API_BASE}/admin/schema`);
  },

  async getOpenApiSpec() {
    return fetchJson<any>(`${API_BASE}/openapi.json`);
  },
};
