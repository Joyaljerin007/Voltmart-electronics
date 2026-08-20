export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "VoltMart Electronics Catalog & E-Commerce API",
    version: "1.0.0",
    description: "Production-grade RESTful API for electronics catalog browsing, dynamic specification filtering, multi-product comparison, price tracking, customer reviews, wishlists, order lifecycle, and admin moderation.",
    contact: {
      name: "VoltMart API Engineering Team",
      email: "api@voltmart.io"
    }
  },
  servers: [
    {
      url: "/api/v1",
      description: "VoltMart REST v1 Service Endpoint"
    }
  ],
  paths: {
    "/catalog/products": {
      get: {
        summary: "Query products with dynamic filters",
        description: "Returns paginated list of products matching search, categories, brands, price boundaries, rating, and dynamic hardware specification facets.",
        parameters: [
          { name: "searchQuery", in: "query", schema: { type: "string" }, description: "Text search matching name, SKU, or specs" },
          { name: "categoryId", in: "query", schema: { type: "string" }, description: "Filter by category ID" },
          { name: "brandIds", in: "query", schema: { type: "array", items: { type: "string" } }, description: "Comma-separated list of brand IDs" },
          { name: "minPrice", in: "query", schema: { type: "number" }, description: "Minimum price" },
          { name: "maxPrice", in: "query", schema: { type: "number" }, description: "Maximum price" },
          { name: "minRating", in: "query", schema: { type: "number" }, description: "Minimum star rating (1-5)" },
          { name: "inStockOnly", in: "query", schema: { type: "boolean" }, description: "Filter in-stock items" },
          { name: "sortBy", in: "query", schema: { type: "string", enum: ["featured", "price_asc", "price_desc", "rating", "newest"] } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 12 } }
        ],
        responses: {
          200: {
            description: "Successful product list response with pagination metadata"
          }
        }
      },
      post: {
        summary: "Create product (Admin only)",
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: "Product created" } }
      }
    },
    "/catalog/products/{id}": {
      get: {
        summary: "Get enriched product by ID, SKU, or Barcode",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Product details with specs, price history, reviews, FAQs, and documents" } }
      },
      put: {
        summary: "Update product (Admin only; automatically logs price changes into pricehistory and evaluates price alerts)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Updated product details" } }
      },
      delete: {
        summary: "Delete product (Admin only)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Product deleted" } }
      }
    },
    "/catalog/compare": {
      post: {
        summary: "Compare multiple products (2 to 4)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  productIds: { type: "array", items: { type: "string" } }
                },
                required: ["productIds"]
              }
            }
          }
        },
        responses: { 200: { description: "Aligned specification matrix" } }
      }
    },
    "/catalog/categories": {
      get: {
        summary: "Get all product categories with child hierarchy",
        responses: { 200: { description: "List of categories" } }
      }
    },
    "/catalog/brands": {
      get: {
        summary: "Get all manufacturer brands",
        responses: { 200: { description: "List of brands" } }
      }
    },
    "/catalog/products/{id}/reviews": {
      get: { summary: "Get customer reviews for a product" },
      post: { summary: "Submit a new customer review with rating aggregation" }
    },
    "/wishlist": {
      get: { summary: "List saved wishlist items for authenticated user" },
      post: { summary: "Add product to user wishlist" }
    },
    "/price-alerts": {
      get: { summary: "List active price alerts" },
      post: { summary: "Set a target price drop alert for a product" }
    },
    "/orders": {
      get: { summary: "Get user order history" },
      post: { summary: "Place new order and deduct stock quantity" }
    },
    "/admin/analytics": {
      get: { summary: "Get revenue, category sales distribution, and inventory stock alerts" }
    },
    "/admin/schema": {
      get: { summary: "Download or inspect MySQL 8.x Flyway schema DDL" }
    }
  }
};
