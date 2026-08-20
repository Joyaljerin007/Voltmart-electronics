export type UserRole = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  imageUrl: string;
  description?: string;
  productCount?: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  description: string;
  website?: string;
}

export interface ProductSpecification {
  id: string;
  productId: string;
  specName: string;
  specValue: string;
  specGroup: 'Display' | 'Performance' | 'Memory & Storage' | 'Battery & Power' | 'Connectivity' | 'Camera' | 'Design & Build' | 'General';
}

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  isPrimary: boolean;
  altText?: string;
}

export interface PriceHistoryPoint {
  id: string;
  productId: string;
  price: number;
  changedAt: string;
  note?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  status?: 'APPROVED' | 'PENDING' | 'REJECTED';
  createdAt: string;
}

export interface FAQ {
  id: string;
  productId: string;
  question: string;
  answer: string;
}

export interface ProductDocument {
  id: string;
  productId: string;
  docType: 'MANUAL' | 'WARRANTY' | 'SPEC_SHEET' | 'QUICK_START';
  title: string;
  fileUrl: string;
  fileSize: string;
}

export interface PriceAlert {
  id: string;
  userId: string;
  productId: string;
  productName?: string;
  productImage?: string;
  currentPrice: number;
  targetPrice: number;
  isActive: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  categoryId: string;
  brandId: string;
  description: string;
  basePrice: number;
  salePrice?: number;
  stockQuantity: number;
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  isDeal?: boolean;
  images: ProductImage[];
  specifications: ProductSpecification[];
  brand?: Brand;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  productId: string;
  productName?: string;
  productImage?: string;
  product?: Product;
  sku?: string;
  unitPrice: number;
  quantity: number;
  totalPrice?: number;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
  description: string;
  location?: string;
}

export interface Order {
  id: string;
  orderNumber?: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  subtotal?: number;
  discount?: number;
  tax?: number;
  shippingCost?: number;
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: string | {
    fullName: string;
    street?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  paymentMethod?: string | {
    type: string;
    last4?: string;
    cardBrand?: string;
  };
  trackingNumber?: string;
  estimatedDelivery?: string;
  timeline?: OrderTimelineEvent[];
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  addedAt: string;
  priceWhenAdded: number;
}

export interface FilterState {
  searchQuery: string;
  categoryId: string | null;
  brandIds: string[];
  minPrice: number;
  maxPrice: number;
  minRating: number;
  inStockOnly: boolean;
  specFilters: Record<string, string[]>;
  sortBy: 'featured' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}
