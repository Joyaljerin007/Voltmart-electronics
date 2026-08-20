import {
  Category,
  Brand,
  Product,
  ProductSpecification,
  ProductImage,
  PriceHistoryPoint,
  Review,
  FAQ,
  ProductDocument,
  PriceAlert,
  Order,
  User,
  WishlistItem,
  FilterState,
  OrderStatus,
} from '../src/types';
import {
  initialCategories,
  initialBrands,
  initialProducts,
  initialPriceHistories,
  initialReviews,
  initialFAQs,
  initialDocuments,
  initialOrders,
  initialUsers,
} from './seedData';

class DatabaseStore {
  public categories: Category[] = [...initialCategories];
  public brands: Brand[] = [...initialBrands];
  public products: Product[] = [...initialProducts];
  public priceHistories: Record<string, PriceHistoryPoint[]> = { ...initialPriceHistories };
  public reviews: Review[] = [...initialReviews];
  public faqs: FAQ[] = [...initialFAQs];
  public documents: ProductDocument[] = [...initialDocuments];
  public orders: Order[] = [...initialOrders];
  public users: User[] = [...initialUsers];
  public wishlists: WishlistItem[] = [
    {
      id: 'wl-1',
      userId: 'usr-customer-1',
      productId: 'prod-macbook-pro-16',
      product: initialProducts[0],
      addedAt: '2025-02-01T10:00:00Z',
      priceWhenAdded: 3499.00,
    },
  ];
  public priceAlerts: PriceAlert[] = [
    {
      id: 'pa-1',
      userId: 'usr-customer-1',
      productId: 'prod-macbook-pro-16',
      productName: 'MacBook Pro 16" (M3 Max)',
      productImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      currentPrice: 3299.00,
      targetPrice: 3100.00,
      isActive: true,
      createdAt: '2025-02-15T12:00:00Z',
    },
  ];

  // Get full enriched product
  public getEnrichedProduct(product: Product): Product {
    const brand = this.brands.find((b) => b.id === product.brandId);
    const category = this.categories.find((c) => c.id === product.categoryId);
    return {
      ...product,
      brand,
      category,
    };
  }

  // Filter and paginate products
  public queryProducts(filters: Partial<FilterState> & { page?: number; limit?: number }) {
    let list = this.products.map((p) => this.getEnrichedProduct(p));

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.barcode.includes(q) ||
          (p.brand && p.brand.name.toLowerCase().includes(q)) ||
          p.specifications.some(
            (s) => s.specName.toLowerCase().includes(q) || s.specValue.toLowerCase().includes(q)
          )
      );
    }

    if (filters.categoryId) {
      list = list.filter((p) => p.categoryId === filters.categoryId);
    }

    if (filters.brandIds && filters.brandIds.length > 0) {
      list = list.filter((p) => filters.brandIds!.includes(p.brandId));
    }

    if (filters.minPrice !== undefined) {
      list = list.filter((p) => (p.salePrice ?? p.basePrice) >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
      list = list.filter((p) => (p.salePrice ?? p.basePrice) <= filters.maxPrice!);
    }

    if (filters.minRating !== undefined && filters.minRating > 0) {
      list = list.filter((p) => p.rating >= filters.minRating!);
    }

    if (filters.inStockOnly) {
      list = list.filter((p) => p.stockQuantity > 0);
    }

    // Dynamic Specification Filters (e.g. spec_RAM, spec_Processor, etc.)
    if (filters.specFilters && Object.keys(filters.specFilters).length > 0) {
      Object.entries(filters.specFilters).forEach(([specKey, allowedValues]) => {
        if (allowedValues.length > 0) {
          list = list.filter((p) =>
            p.specifications.some(
              (s) =>
                s.specName.toLowerCase() === specKey.toLowerCase() &&
                allowedValues.some((v) => s.specValue.toLowerCase().includes(v.toLowerCase()))
            )
          );
        }
      });
    }

    // Sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price_asc':
          list.sort((a, b) => (a.salePrice ?? a.basePrice) - (b.salePrice ?? b.basePrice));
          break;
        case 'price_desc':
          list.sort((a, b) => (b.salePrice ?? b.basePrice) - (a.salePrice ?? a.basePrice));
          break;
        case 'rating':
          list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
          break;
        case 'newest':
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'featured':
        default:
          list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
          break;
      }
    }

    const total = list.length;
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 12;
    const startIndex = (page - 1) * limit;
    const pagedProducts = list.slice(startIndex, startIndex + limit);

    return {
      products: pagedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  // Get single product with full specs, price history, reviews, FAQs, docs
  public getProductById(id: string) {
    const product = this.products.find((p) => p.id === id || p.sku === id || p.barcode === id);
    if (!product) return null;

    const enriched = this.getEnrichedProduct(product);
    const history = this.priceHistories[product.id] || [];
    const reviews = this.reviews.filter((r) => r.productId === product.id && r.status !== 'REJECTED');
    const faqs = this.faqs.filter((f) => f.productId === product.id);
    const documents = this.documents.filter((d) => d.productId === product.id);

    return {
      ...enriched,
      priceHistory: history,
      reviews,
      faqs,
      documents,
    };
  }

  // Multi-product compare
  public compareProducts(productIds: string[]) {
    const matched = productIds
      .map((id) => this.getProductById(id))
      .filter((p): p is NonNullable<typeof p> => p !== null);

    // Collect all spec names grouped
    const groupMap: Record<string, Set<string>> = {};
    matched.forEach((p) => {
      p.specifications.forEach((s) => {
        if (!groupMap[s.specGroup]) {
          groupMap[s.specGroup] = new Set();
        }
        groupMap[s.specGroup].add(s.specName);
      });
    });

    const comparisonMatrix: {
      group: string;
      specs: {
        name: string;
        values: Record<string, string>;
        isDifferent: boolean;
      }[];
    }[] = [];

    Object.entries(groupMap).forEach(([group, specNamesSet]) => {
      const specsList: {
        name: string;
        values: Record<string, string>;
        isDifferent: boolean;
      }[] = [];

      specNamesSet.forEach((specName) => {
        const values: Record<string, string> = {};
        const distinctValues = new Set<string>();

        matched.forEach((p) => {
          const found = p.specifications.find(
            (s) => s.specGroup === group && s.specName === specName
          );
          const val = found ? found.specValue : 'N/A';
          values[p.id] = val;
          distinctValues.add(val);
        });

        specsList.push({
          name: specName,
          values,
          isDifferent: distinctValues.size > 1,
        });
      });

      comparisonMatrix.push({
        group,
        specs: specsList,
      });
    });

    return {
      products: matched,
      matrix: comparisonMatrix,
    };
  }

  // Create Product
  public createProduct(data: Partial<Product>) {
    const id = `prod-${Date.now()}`;
    const newProduct: Product = {
      id,
      name: data.name || 'New Electronics Item',
      sku: data.sku || `SKU-${Date.now().toString().slice(-6)}`,
      barcode: data.barcode || `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      categoryId: data.categoryId || this.categories[0].id,
      brandId: data.brandId || this.brands[0].id,
      description: data.description || '',
      basePrice: Number(data.basePrice) || 99.99,
      salePrice: data.salePrice ? Number(data.salePrice) : undefined,
      stockQuantity: Number(data.stockQuantity) || 10,
      rating: 5.0,
      reviewCount: 0,
      isFeatured: Boolean(data.isFeatured),
      isDeal: Boolean(data.isDeal),
      images: data.images?.length
        ? data.images
        : [
            {
              id: `img-${Date.now()}`,
              productId: id,
              imageUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80',
              isPrimary: true,
              altText: data.name,
            },
          ],
      specifications: data.specifications || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.products.unshift(newProduct);

    // Initial price history
    this.priceHistories[id] = [
      {
        id: `ph-${Date.now()}`,
        productId: id,
        price: newProduct.salePrice ?? newProduct.basePrice,
        changedAt: new Date().toISOString(),
        note: 'Initial catalog creation',
      },
    ];

    // Update category count
    this.updateCategoryProductCounts();

    return this.getEnrichedProduct(newProduct);
  }

  // Update Product (logs price change if price altered, checks price alerts)
  public updateProduct(id: string, updates: Partial<Product>) {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const existing = this.products[idx];
    const oldEffectivePrice = existing.salePrice ?? existing.basePrice;

    const updated: Product = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const newEffectivePrice = updated.salePrice ?? updated.basePrice;

    // Detect price change & log to price history
    if (oldEffectivePrice !== newEffectivePrice) {
      if (!this.priceHistories[id]) {
        this.priceHistories[id] = [];
      }
      this.priceHistories[id].push({
        id: `ph-${Date.now()}`,
        productId: id,
        price: newEffectivePrice,
        changedAt: new Date().toISOString(),
        note: `Price updated from $${oldEffectivePrice} to $${newEffectivePrice}`,
      });

      // Check price alerts
      this.checkPriceAlertsForProduct(id, newEffectivePrice);
    }

    this.products[idx] = updated;
    this.updateCategoryProductCounts();
    return this.getEnrichedProduct(updated);
  }

  // Delete product
  public deleteProduct(id: string) {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    this.products.splice(idx, 1);
    delete this.priceHistories[id];
    this.reviews = this.reviews.filter((r) => r.productId !== id);
    this.faqs = this.faqs.filter((f) => f.productId !== id);
    this.documents = this.documents.filter((d) => d.productId !== id);
    this.wishlists = this.wishlists.filter((w) => w.productId !== id);
    this.updateCategoryProductCounts();
    return true;
  }

  // Add Review & update product average rating
  public addReview(reviewData: Omit<Review, 'id' | 'createdAt' | 'helpfulCount' | 'status'>) {
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      ...reviewData,
      helpfulCount: 0,
      status: 'APPROVED',
      createdAt: new Date().toISOString(),
    };
    this.reviews.unshift(newRev);

    // Recompute product rating
    const productRevs = this.reviews.filter(
      (r) => r.productId === reviewData.productId && r.status === 'APPROVED'
    );
    const avg =
      productRevs.reduce((acc, curr) => acc + curr.rating, 0) / (productRevs.length || 1);
    const roundedAvg = Math.round(avg * 10) / 10;

    const pIdx = this.products.findIndex((p) => p.id === reviewData.productId);
    if (pIdx !== -1) {
      this.products[pIdx].rating = roundedAvg;
      this.products[pIdx].reviewCount = productRevs.length;
    }

    return newRev;
  }

  // Helpfulness increment
  public voteHelpfulReview(reviewId: string) {
    const rev = this.reviews.find((r) => r.id === reviewId);
    if (rev) {
      rev.helpfulCount += 1;
      return rev;
    }
    return null;
  }

  // Wishlist
  public getWishlist(userId: string) {
    return this.wishlists
      .filter((w) => w.userId === userId)
      .map((w) => {
        const prod = this.products.find((p) => p.id === w.productId);
        return {
          ...w,
          product: prod ? this.getEnrichedProduct(prod) : w.product,
        };
      });
  }

  public addToWishlist(userId: string, productId: string) {
    const existing = this.wishlists.find((w) => w.userId === userId && w.productId === productId);
    if (existing) return existing;

    const prod = this.products.find((p) => p.id === productId);
    if (!prod) return null;

    const item: WishlistItem = {
      id: `wl-${Date.now()}`,
      userId,
      productId,
      product: this.getEnrichedProduct(prod),
      addedAt: new Date().toISOString(),
      priceWhenAdded: prod.salePrice ?? prod.basePrice,
    };
    this.wishlists.push(item);
    return item;
  }

  public removeFromWishlist(userId: string, productId: string) {
    const idx = this.wishlists.findIndex((w) => w.userId === userId && w.productId === productId);
    if (idx !== -1) {
      this.wishlists.splice(idx, 1);
      return true;
    }
    return false;
  }

  // Price Alerts
  public createPriceAlert(userId: string, productId: string, targetPrice: number) {
    const prod = this.products.find((p) => p.id === productId);
    if (!prod) return null;

    const alert: PriceAlert = {
      id: `pa-${Date.now()}`,
      userId,
      productId,
      productName: prod.name,
      productImage: prod.images[0]?.imageUrl,
      currentPrice: prod.salePrice ?? prod.basePrice,
      targetPrice,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    this.priceAlerts.push(alert);
    return alert;
  }

  private checkPriceAlertsForProduct(productId: string, newPrice: number) {
    this.priceAlerts.forEach((alert) => {
      if (alert.productId === productId && alert.isActive && newPrice <= alert.targetPrice) {
        console.log(
          `[PRICE_ALERT_TRIGGER] User ${alert.userId}: Target price $${alert.targetPrice} met for ${alert.productName} (Current: $${newPrice}). Simulated email dispatched!`
        );
      }
    });
  }

  // Checkout & Order creation
  public createOrder(orderPayload: {
    userId: string;
    userName: string;
    userEmail: string;
    items: { productId: string; quantity: number }[];
    shippingAddress: Order['shippingAddress'];
    paymentMethod: Order['paymentMethod'];
    discountCode?: string;
  }) {
    let subtotal = 0;
    const orderItems: Order['items'] = [];

    for (const item of orderPayload.items) {
      const prod = this.products.find((p) => p.id === item.productId);
      if (!prod) continue;

      const unitPrice = prod.salePrice ?? prod.basePrice;
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      // Deduct inventory
      prod.stockQuantity = Math.max(0, prod.stockQuantity - item.quantity);

      orderItems.push({
        id: `oi-${Date.now()}-${item.productId}`,
        productId: prod.id,
        productName: prod.name,
        productImage: prod.images[0]?.imageUrl || '',
        sku: prod.sku,
        unitPrice,
        quantity: item.quantity,
        totalPrice,
      });
    }

    let discount = 0;
    if (orderPayload.discountCode?.toUpperCase() === 'VOLT10') {
      discount = subtotal * 0.10;
    } else if (orderPayload.discountCode?.toUpperCase() === 'SUPERTECH') {
      discount = Math.min(50, subtotal * 0.2);
    }

    const tax = (subtotal - discount) * 0.0825;
    const shippingCost = subtotal > 500 ? 0 : 19.99;
    const totalAmount = Math.max(0, subtotal - discount + tax + shippingCost);

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `VM-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: orderPayload.userId,
      userName: orderPayload.userName,
      userEmail: orderPayload.userEmail,
      items: orderItems,
      subtotal: Math.round(subtotal * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      shippingCost,
      totalAmount: Math.round(totalAmount * 100) / 100,
      status: 'CONFIRMED',
      shippingAddress: orderPayload.shippingAddress,
      paymentMethod: orderPayload.paymentMethod,
      trackingNumber: `1Z${Math.random().toString(36).substring(2, 10).toUpperCase()}883`,
      timeline: [
        {
          status: 'PENDING',
          timestamp: new Date(Date.now() - 60000).toISOString(),
          description:
            'Payment authorized via ' +
            (typeof orderPayload.paymentMethod === 'object' && orderPayload.paymentMethod !== null
              ? orderPayload.paymentMethod.type
              : String(orderPayload.paymentMethod || 'Credit Card')),
        },
        {
          status: 'CONFIRMED',
          timestamp: new Date().toISOString(),
          description: 'Order confirmed and inventory allocated in VoltMart distribution center.',
        },
      ],
      createdAt: new Date().toISOString(),
    };

    this.orders.unshift(newOrder);
    return newOrder;
  }

  // Update Order Status
  public updateOrderStatus(orderId: string, newStatus: OrderStatus, description?: string) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return null;

    order.status = newStatus;
    order.timeline.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      description: description || `Order status updated to ${newStatus}`,
    });

    return order;
  }

  // Admin Analytics
  public getAnalytics() {
    const totalRevenue = this.orders.reduce((acc, o) => acc + o.totalAmount, 0);
    const totalOrders = this.orders.length;
    const lowStockProducts = this.products.filter((p) => p.stockQuantity <= 5);
    const totalCatalogItems = this.products.length;

    // Sales by Category
    const categorySales: Record<string, { name: string; revenue: number; units: number }> = {};
    this.categories.forEach((c) => {
      categorySales[c.id] = { name: c.name, revenue: 0, units: 0 };
    });

    this.orders.forEach((o) => {
      o.items.forEach((item) => {
        const prod = this.products.find((p) => p.id === item.productId);
        if (prod && categorySales[prod.categoryId]) {
          categorySales[prod.categoryId].revenue += item.totalPrice;
          categorySales[prod.categoryId].units += item.quantity;
        }
      });
    });

    // Price Alert count
    const activePriceAlerts = this.priceAlerts.filter((a) => a.isActive).length;

    return {
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        totalCatalogItems,
        lowStockCount: lowStockProducts.length,
        activePriceAlerts,
        avgOrderValue: totalOrders ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0,
      },
      categorySales: Object.values(categorySales),
      lowStockProducts,
      recentOrders: this.orders.slice(0, 5),
    };
  }

  // Sync category product count
  private updateCategoryProductCounts() {
    this.categories.forEach((cat) => {
      cat.productCount = this.products.filter((p) => p.categoryId === cat.id).length;
    });
  }

  // Complete MySQL 8.x schema DDL for Flyway / Liquibase
  public getDatabaseSchemaSQL(): string {
    return `-- ==========================================================
-- VoltMart Electronics Catalog Platform - MySQL 8.x Schema
-- Compatible with Flyway / Liquibase / Spring Data JPA
-- ==========================================================

CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    parent_id VARCHAR(64),
    image_url VARCHAR(1024),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_category_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS brands (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    logo_url VARCHAR(1024),
    description TEXT,
    website VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    barcode VARCHAR(100) NOT NULL UNIQUE,
    category_id VARCHAR(64) NOT NULL,
    brand_id VARCHAR(64) NOT NULL,
    description LONGTEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    sale_price DECIMAL(10, 2),
    stock_quantity INT NOT NULL DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 5.0,
    review_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_deal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_products_category (category_id),
    INDEX idx_products_brand (brand_id),
    INDEX idx_products_price (sale_price, base_price),
    INDEX idx_products_sku (sku),
    CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    CONSTRAINT fk_product_brand FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_images (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL,
    image_url VARCHAR(1024) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    alt_text VARCHAR(255),
    CONSTRAINT fk_image_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_specifications (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL,
    spec_group VARCHAR(64) NOT NULL,
    spec_name VARCHAR(128) NOT NULL,
    spec_value VARCHAR(512) NOT NULL,
    INDEX idx_spec_lookup (spec_group, spec_name),
    CONSTRAINT fk_spec_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS price_history (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note VARCHAR(255),
    INDEX idx_price_history_product (product_id, changed_at),
    CONSTRAINT fk_price_hist_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('CUSTOMER', 'ADMIN') DEFAULT 'CUSTOMER',
    avatar_url VARCHAR(1024),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(255) NOT NULL,
    comment TEXT NOT NULL,
    verified_purchase BOOLEAN DEFAULT TRUE,
    helpful_count INT DEFAULT 0,
    status ENUM('APPROVED', 'PENDING', 'REJECTED') DEFAULT 'APPROVED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_reviews_product (product_id, rating),
    CONSTRAINT fk_review_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS wishlists (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    product_id VARCHAR(64) NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    price_when_added DECIMAL(10, 2) NOT NULL,
    UNIQUE KEY uk_user_product_wishlist (user_id, product_id),
    CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS price_alerts (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    product_id VARCHAR(64) NOT NULL,
    target_price DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_alert_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_alert_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY,
    order_number VARCHAR(64) NOT NULL UNIQUE,
    user_id VARCHAR(64) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0.00,
    tax DECIMAL(10, 2) NOT NULL,
    shipping_cost DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
    tracking_number VARCHAR(128),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL,
    product_id VARCHAR(64) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_item_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS faqs (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    CONSTRAINT fk_faq_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_documents (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL,
    doc_type ENUM('MANUAL', 'WARRANTY', 'SPEC_SHEET', 'QUICK_START') NOT NULL,
    title VARCHAR(255) NOT NULL,
    file_url VARCHAR(1024) NOT NULL,
    file_size VARCHAR(64),
    CONSTRAINT fk_doc_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;
  }
}

export const db = new DatabaseStore();
