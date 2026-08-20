import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { openApiSpec } from './server/openapi';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper response wrapper
  const sendSuccess = (res: Response, data: any, message?: string, pagination?: any, status = 200) => {
    res.status(status).json({
      success: true,
      data,
      message,
      pagination,
      timestamp: new Date().toISOString(),
    });
  };

  const sendError = (res: Response, error: string, status = 400) => {
    res.status(status).json({
      success: false,
      error,
      timestamp: new Date().toISOString(),
    });
  };

  // -------------------------------------------------------------
  // REST API v1 Routes
  // -------------------------------------------------------------

  // OpenAPI spec
  app.get('/api/v1/openapi.json', (req, res) => {
    res.json(openApiSpec);
  });

  // Auth routes (Mock JWT token exchange for Customer and Admin)
  app.post('/api/v1/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());

    if (!user) {
      // Auto register for convenience in demo
      const newUser = {
        id: `usr-${Date.now()}`,
        name: email.split('@')[0] || 'Customer',
        email,
        role: (email.includes('admin') ? 'ADMIN' : 'CUSTOMER') as any,
        createdAt: new Date().toISOString(),
      };
      db.users.push(newUser);
      return sendSuccess(res, {
        token: `jwt_token_${newUser.id}_${Date.now()}`,
        user: newUser,
      });
    }

    sendSuccess(res, {
      token: `jwt_token_${user.id}_${Date.now()}`,
      user,
    });
  });

  app.get('/api/v1/auth/me', (req, res) => {
    const authHeader = req.headers.authorization || '';
    const userId = authHeader.replace('Bearer ', '').split('_')[2];
    const user = db.users.find((u) => u.id === userId) || db.users[1]; // default to customer
    sendSuccess(res, user);
  });

  // Catalog: Categories
  app.get('/api/v1/catalog/categories', (req, res) => {
    sendSuccess(res, db.categories);
  });

  app.get('/api/v1/catalog/categories/:id', (req, res) => {
    const cat = db.categories.find((c) => c.id === req.params.id || c.slug === req.params.id);
    if (!cat) return sendError(res, 'Category not found', 404);
    sendSuccess(res, cat);
  });

  // Catalog: Brands
  app.get('/api/v1/catalog/brands', (req, res) => {
    sendSuccess(res, db.brands);
  });

  app.get('/api/v1/catalog/brands/:id', (req, res) => {
    const brand = db.brands.find((b) => b.id === req.params.id || b.slug === req.params.id);
    if (!brand) return sendError(res, 'Brand not found', 404);
    sendSuccess(res, brand);
  });

  // Catalog: Products Query & Filter
  app.get('/api/v1/catalog/products', (req, res) => {
    const {
      searchQuery,
      categoryId,
      brandIds,
      minPrice,
      maxPrice,
      minRating,
      inStockOnly,
      sortBy,
      page,
      limit,
      ...otherParams
    } = req.query;

    // Parse spec filters (spec_*)
    const specFilters: Record<string, string[]> = {};
    Object.keys(otherParams).forEach((key) => {
      if (key.startsWith('spec_')) {
        const specName = key.replace('spec_', '');
        const val = otherParams[key];
        specFilters[specName] = Array.isArray(val)
          ? (val as string[])
          : String(val).split(',').filter(Boolean);
      }
    });

    const parsedBrandIds = brandIds
      ? Array.isArray(brandIds)
        ? (brandIds as string[])
        : String(brandIds).split(',').filter(Boolean)
      : [];

    const result = db.queryProducts({
      searchQuery: searchQuery ? String(searchQuery) : undefined,
      categoryId: categoryId ? String(categoryId) : undefined,
      brandIds: parsedBrandIds,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minRating: minRating ? Number(minRating) : undefined,
      inStockOnly: inStockOnly === 'true',
      specFilters,
      sortBy: sortBy as any,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 12,
    });

    sendSuccess(res, result.products, undefined, result.pagination);
  });

  // Catalog: Product Detail by ID / SKU / Barcode
  app.get('/api/v1/catalog/products/:id', (req, res) => {
    const product = db.getProductById(req.params.id);
    if (!product) return sendError(res, 'Product not found', 404);
    sendSuccess(res, product);
  });

  // Barcode / QR quick scan lookup
  app.get('/api/v1/barcode/:code', (req, res) => {
    const product = db.getProductById(req.params.code);
    if (!product) return sendError(res, 'Product code not found', 404);
    sendSuccess(res, product);
  });

  // Admin: Create Product
  app.post('/api/v1/catalog/products', (req, res) => {
    const created = db.createProduct(req.body);
    sendSuccess(res, created, 'Product created successfully', undefined, 201);
  });

  // Admin: Update Product (price change logs to history and notifies alerts)
  app.put('/api/v1/catalog/products/:id', (req, res) => {
    const updated = db.updateProduct(req.params.id, req.body);
    if (!updated) return sendError(res, 'Product not found', 404);
    sendSuccess(res, updated, 'Product updated successfully');
  });

  // Admin: Delete Product
  app.delete('/api/v1/catalog/products/:id', (req, res) => {
    const ok = db.deleteProduct(req.params.id);
    if (!ok) return sendError(res, 'Product not found', 404);
    sendSuccess(res, { id: req.params.id }, 'Product deleted successfully');
  });

  // Comparison API
  app.post('/api/v1/catalog/compare', (req, res) => {
    const productIds: string[] = req.body.productIds || [];
    if (!productIds.length) {
      return sendError(res, 'No product IDs provided for comparison');
    }
    const comparison = db.compareProducts(productIds);
    sendSuccess(res, comparison);
  });

  // Product Reviews
  app.get('/api/v1/catalog/products/:id/reviews', (req, res) => {
    const revs = db.reviews.filter((r) => r.productId === req.params.id);
    sendSuccess(res, revs);
  });

  app.post('/api/v1/catalog/products/:id/reviews', (req, res) => {
    const { userId, userName, rating, title, comment, verifiedPurchase } = req.body;
    if (!rating || !title || !comment) {
      return sendError(res, 'Missing required review fields');
    }
    const review = db.addReview({
      productId: req.params.id,
      userId: userId || 'usr-customer-1',
      userName: userName || 'Verified Buyer',
      rating: Number(rating),
      title,
      comment,
      verifiedPurchase: verifiedPurchase !== undefined ? verifiedPurchase : true,
    });
    sendSuccess(res, review, 'Review submitted successfully', undefined, 201);
  });

  app.post('/api/v1/reviews/:id/helpful', (req, res) => {
    const rev = db.voteHelpfulReview(req.params.id);
    if (!rev) return sendError(res, 'Review not found', 404);
    sendSuccess(res, rev);
  });

  // Wishlist API
  app.get('/api/v1/wishlist', (req, res) => {
    const userId = (req.query.userId as string) || 'usr-customer-1';
    const items = db.getWishlist(userId);
    sendSuccess(res, items);
  });

  app.post('/api/v1/wishlist', (req, res) => {
    const { userId, productId } = req.body;
    if (!productId) return sendError(res, 'Missing productId');
    const item = db.addToWishlist(userId || 'usr-customer-1', productId);
    sendSuccess(res, item, 'Item added to wishlist');
  });

  app.delete('/api/v1/wishlist/:productId', (req, res) => {
    const userId = (req.query.userId as string) || 'usr-customer-1';
    const ok = db.removeFromWishlist(userId, req.params.productId);
    sendSuccess(res, { success: ok });
  });

  // Price Alerts API
  app.get('/api/v1/price-alerts', (req, res) => {
    const userId = (req.query.userId as string) || 'usr-customer-1';
    const alerts = db.priceAlerts.filter((a) => a.userId === userId);
    sendSuccess(res, alerts);
  });

  app.post('/api/v1/price-alerts', (req, res) => {
    const { userId, productId, targetPrice } = req.body;
    if (!productId || !targetPrice) return sendError(res, 'Missing productId or targetPrice');
    const alert = db.createPriceAlert(userId || 'usr-customer-1', productId, Number(targetPrice));
    if (!alert) return sendError(res, 'Product not found', 404);
    sendSuccess(res, alert, 'Price drop alert configured');
  });

  app.delete('/api/v1/price-alerts/:id', (req, res) => {
    const idx = db.priceAlerts.findIndex((a) => a.id === req.params.id);
    if (idx !== -1) {
      db.priceAlerts.splice(idx, 1);
      return sendSuccess(res, { id: req.params.id });
    }
    sendError(res, 'Price alert not found', 404);
  });

  // Orders API
  app.get('/api/v1/orders', (req, res) => {
    const userId = req.query.userId as string;
    const orders = userId ? db.orders.filter((o) => o.userId === userId) : db.orders;
    sendSuccess(res, orders);
  });

  app.get('/api/v1/orders/:id', (req, res) => {
    const order = db.orders.find((o) => o.id === req.params.id || o.orderNumber === req.params.id);
    if (!order) return sendError(res, 'Order not found', 404);
    sendSuccess(res, order);
  });

  app.post('/api/v1/orders', (req, res) => {
    try {
      const order = db.createOrder(req.body);
      sendSuccess(res, order, 'Order confirmed and inventory reserved', undefined, 201);
    } catch (err: any) {
      sendError(res, err.message || 'Failed to place order', 500);
    }
  });

  app.patch('/api/v1/orders/:id/status', (req, res) => {
    const { status, description } = req.body;
    const updated = db.updateOrderStatus(req.params.id, status, description);
    if (!updated) return sendError(res, 'Order not found', 404);
    sendSuccess(res, updated, 'Order status updated');
  });

  // Admin Analytics API
  app.get('/api/v1/admin/analytics', (req, res) => {
    sendSuccess(res, db.getAnalytics());
  });

  // Admin Database SQL Schema Migration endpoint
  app.get('/api/v1/admin/schema', (req, res) => {
    const sql = db.getDatabaseSchemaSQL();
    if (req.query.download === 'true') {
      res.setHeader('Content-Disposition', 'attachment; filename="V1__init_voltmart_schema.sql"');
      res.setHeader('Content-Type', 'application/sql');
      return res.send(sql);
    }
    sendSuccess(res, {
      schemaVersion: '1.0.0 (MySQL 8.x)',
      dialect: 'MySQL InnoDB utf8mb4',
      migrationTool: 'Flyway / Liquibase / Spring Data JPA',
      ddl: sql,
    });
  });

  // Global Express Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled API error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  });

  // -------------------------------------------------------------
  // Vite Integration (SPA Middleware / Static Serving)
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VoltMart API & Web Server running on port ${PORT}`);
  });
}

startServer();
