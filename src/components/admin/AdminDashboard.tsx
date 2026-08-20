import React, { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { api } from '../../services/api';
import { Product, Order } from '../../types';
import {
  ShieldAlert,
  DollarSign,
  Package,
  Boxes,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  Database,
  FileCode,
  Download,
  Check,
  X,
  RotateCcw,
  Search,
  Truck,
  Sparkles,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { categories, brands, showToast } = useStore();

  const [activeAdminTab, setActiveAdminTab] = useState<'inventory' | 'orders' | 'schema'>('inventory');
  const [analytics, setAnalytics] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [selectedProductForPrice, setSelectedProductForPrice] = useState<Product | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [priceNote, setPriceNote] = useState('Catalog price adjustment');

  // New Product Form State
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    sku: '',
    barcode: '',
    categoryId: '',
    brandId: '',
    description: '',
    basePrice: 999,
    stockQuantity: 15,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    specName1: 'Processor',
    specValue1: 'Apple M3 Pro',
    specGroup1: 'Performance',
    specName2: 'RAM',
    specValue2: '36GB Unified Memory',
    specGroup2: 'Memory & Storage',
  });

  // MySQL Schema DDL string
  const [schemaDdl, setSchemaDdl] = useState<string>('');

  const loadAdminData = async () => {
    setLoading(true);
    const [analyticsRes, productsRes, ordersRes, schemaRes] = await Promise.all([
      api.getAnalytics(),
      api.getProducts({ limit: 50 }),
      api.getOrders(),
      api.getSchemaDdl(),
    ]);

    if (analyticsRes.success) setAnalytics(analyticsRes.data);
    if (productsRes.success) setProducts(productsRes.data);
    if (ordersRes.success) setOrders(ordersRes.data);
    if (schemaRes.success) setSchemaDdl(schemaRes.data.ddl);
    setLoading(false);
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    const res = await api.updateOrderStatus(orderId, status);
    if (res.success && res.data) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.data! : o)));
      showToast(`Order ${orderId} updated to ${status}`, 'success');
    }
  };

  const handleUpdateStock = async (product: Product, delta: number) => {
    const newQty = Math.max(0, product.stockQuantity + delta);
    const res = await api.updateProduct(product.id, { stockQuantity: newQty });
    if (res.success && res.data) {
      setProducts((prev) => prev.map((p) => (p.id === product.id ? res.data! : p)));
      showToast(`Updated ${product.name} stock to ${newQty} units.`, 'info');
    }
  };

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForPrice) return;

    const res = await api.updateProductPrice(selectedProductForPrice.id, newPrice, priceNote);
    if (res.success && res.data) {
      setProducts((prev) => prev.map((p) => (p.id === selectedProductForPrice.id ? res.data! : p)));
      setIsPriceModalOpen(false);
      showToast(`Price updated to $${newPrice.toFixed(2)} and logged to history.`, 'success');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductForm.name || !newProductForm.sku) return;

    const res = await api.createProduct({
      name: newProductForm.name,
      sku: newProductForm.sku,
      barcode: newProductForm.barcode || `UPC-${Date.now()}`,
      categoryId: newProductForm.categoryId || categories[0]?.id || 'cat-1',
      brandId: newProductForm.brandId || brands[0]?.id || 'brand-1',
      description: newProductForm.description,
      basePrice: Number(newProductForm.basePrice),
      stockQuantity: Number(newProductForm.stockQuantity),
      images: [{ imageUrl: newProductForm.imageUrl, isPrimary: true, altText: newProductForm.name }],
      specifications: [
        {
          specName: newProductForm.specName1,
          specValue: newProductForm.specValue1,
          specGroup: newProductForm.specGroup1,
          isFilterable: true,
        },
        {
          specName: newProductForm.specName2,
          specValue: newProductForm.specValue2,
          specGroup: newProductForm.specGroup2,
          isFilterable: true,
        },
      ],
    });

    if (res.success && res.data) {
      setProducts([res.data, ...products]);
      setIsNewProductModalOpen(false);
      showToast(`Created product: ${res.data.name}`, 'success');
      loadAdminData();
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="admin-dashboard-view" className="space-y-8 pb-20">
      {/* Top Header & Admin Badge */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Admin Control Center</span>
              <span className="text-xs bg-purple-500/20 text-purple-300 font-mono px-2.5 py-0.5 rounded-full border border-purple-500/30">
                ROLE_ADMIN
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Manage product catalog inventory, pricing logs, order fulfillment statuses, and database schemas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewProductModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
          <button
            onClick={loadAdminData}
            className="p-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="Refresh"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium">Total Billed Revenue</span>
              <div className="text-2xl font-black text-white mt-1">
                ${(analytics.summary?.totalRevenue ?? analytics.totalRevenue ?? 0).toFixed(2)}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium">Total Orders</span>
              <div className="text-2xl font-black text-white mt-1">
                {analytics.summary?.totalOrders ?? analytics.totalOrders ?? 0}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium">Catalog Hardware Models</span>
              <div className="text-2xl font-black text-white mt-1">
                {analytics.summary?.totalCatalogItems ?? analytics.totalProducts ?? 0}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium">Low Stock Alerts (&lt; 5 units)</span>
              <div className="text-2xl font-black text-rose-400 mt-1">
                {analytics.summary?.lowStockCount ?? analytics.lowStockCount ?? 0}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800 bg-slate-900/60 p-2 rounded-2xl gap-2">
        <button
          onClick={() => setActiveAdminTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
            activeAdminTab === 'inventory' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Product Catalog & Stock ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
            activeAdminTab === 'orders' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Order Fulfillment Pipeline ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('schema')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
            activeAdminTab === 'schema' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>MySQL 8.x DDL & DTOs</span>
        </button>
      </div>

      {/* TAB 1: Product Inventory & Pricing Management */}
      {activeAdminTab === 'inventory' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by SKU, name, or barcode..."
                className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-blue-500"
              />
            </div>
            <span className="text-xs text-slate-400 font-mono">Showing {filteredProducts.length} hardware units</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Product Info</th>
                  <th className="py-3 px-4">SKU / Barcode</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock Level</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredProducts.map((product) => {
                  const isLow = product.stockQuantity <= 5;
                  return (
                    <tr key={product.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={product.images[0]?.imageUrl}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-950 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate max-w-xs">{product.name}</div>
                          <div className="text-[10px] text-blue-400">{product.brand?.name} • {product.category?.name}</div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-300">
                        <div>{product.sku}</div>
                        <div className="text-[10px] text-slate-400">UPC: {product.barcode}</div>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-white">${(product.salePrice ?? product.basePrice).toFixed(2)}</div>
                        {product.salePrice && (
                          <div className="text-[10px] text-slate-400 line-through">${product.basePrice.toFixed(2)}</div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded ${
                              isLow ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-200'
                            }`}
                          >
                            {product.stockQuantity} units
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleUpdateStock(product, -1)}
                              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold"
                              title="Decrease stock"
                            >
                              -
                            </button>
                            <button
                              onClick={() => handleUpdateStock(product, 5)}
                              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold"
                              title="Restock +5 units"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedProductForPrice(product);
                            setNewPrice(product.salePrice ?? product.basePrice);
                            setIsPriceModalOpen(true);
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-semibold inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                          <span>Adjust Price</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Order Fulfillment Pipeline */}
      {activeAdminTab === 'orders' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-white">All Customer Orders ({orders.length})</h3>
            <span className="text-xs text-slate-400">Directly transition fulfillment status</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date & Amount</th>
                  <th className="py-3 px-4">Tracking Code</th>
                  <th className="py-3 px-4">Lifecycle Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-white">{order.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100">{order.userName}</div>
                      <div className="text-[10px] text-slate-400">{order.userEmail}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-blue-400">${order.totalAmount.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-400 text-xs">
                      {order.trackingNumber || 'Pending Courier'}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as any)}
                        className="bg-slate-800 border border-slate-700 text-xs text-slate-200 font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED (IN TRANSIT)</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MySQL Schema & Architecture Exporter */}
      {activeAdminTab === 'schema' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <span>Production MySQL 8.x DDL Schema</span>
              </h3>
              <p className="text-xs text-slate-400">
                13 normalized entity tables with composite indexes, foreign key constraints, and Flyway migration compatibility.
              </p>
            </div>

            <a
              href="/api/v1/admin/schema?download=true"
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors self-start sm:self-auto"
            >
              <Download className="w-4 h-4" />
              <span>Download .sql DDL File</span>
            </a>
          </div>

          <div className="relative">
            <pre className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-xs font-mono text-emerald-300/90 overflow-x-auto max-h-96 leading-relaxed shadow-inner">
              {schemaDdl}
            </pre>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: Adjust Product Price & Log History */}
      {/* ------------------------------------------------------------- */}
      {isPriceModalOpen && selectedProductForPrice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white">Adjust Product Price</h3>
              <button onClick={() => setIsPriceModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Updating the price of <strong>{selectedProductForPrice.name}</strong> will automatically append an immutable entry to the price tracking history and trigger matched user price alerts.
            </p>

            <form onSubmit={handleSavePrice} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">New Sale / Base Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-white font-mono text-base rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Change Reason / Audit Note</label>
                <input
                  type="text"
                  required
                  value={priceNote}
                  onChange={(e) => setPriceNote(e.target.value)}
                  placeholder="e.g. Flash Deal, Manufacturer Markdown, Holiday Promo"
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPriceModalOpen(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-600/20"
                >
                  Save & Log History
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: Add New Hardware Product */}
      {/* ------------------------------------------------------------- */}
      {isNewProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl text-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base text-white">Add New Catalog Product</h3>
              </div>
              <button onClick={() => setIsNewProductModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-slate-400 block mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={newProductForm.name}
                    onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                    placeholder="e.g. Dell XPS 16 (2025 Core Ultra 9)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">SKU (Unique)</label>
                  <input
                    type="text"
                    required
                    value={newProductForm.sku}
                    onChange={(e) => setNewProductForm({ ...newProductForm, sku: e.target.value })}
                    placeholder="e.g. DELL-XPS16-U9"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Barcode / UPC (12 Digits)</label>
                  <input
                    type="text"
                    value={newProductForm.barcode}
                    onChange={(e) => setNewProductForm({ ...newProductForm, barcode: e.target.value })}
                    placeholder="e.g. 884116449102"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select
                    value={newProductForm.categoryId}
                    onChange={(e) => setNewProductForm({ ...newProductForm, categoryId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Brand</label>
                  <select
                    value={newProductForm.brandId}
                    onChange={(e) => setNewProductForm({ ...newProductForm, brandId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Base Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProductForm.basePrice}
                    onChange={(e) => setNewProductForm({ ...newProductForm, basePrice: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Initial Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={newProductForm.stockQuantity}
                    onChange={(e) => setNewProductForm({ ...newProductForm, stockQuantity: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-400 block mb-1">Primary Image URL</label>
                  <input
                    type="url"
                    value={newProductForm.imageUrl}
                    onChange={(e) => setNewProductForm({ ...newProductForm, imageUrl: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-400 block mb-1">Hardware Description</label>
                  <textarea
                    rows={2}
                    value={newProductForm.description}
                    onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })}
                    placeholder="Provide technical architecture highlights..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Quick specs */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="font-semibold text-slate-300 block">Initial Specifications</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newProductForm.specName1}
                    onChange={(e) => setNewProductForm({ ...newProductForm, specName1: e.target.value })}
                    placeholder="Spec Name (e.g. Processor)"
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                  <input
                    type="text"
                    value={newProductForm.specValue1}
                    onChange={(e) => setNewProductForm({ ...newProductForm, specValue1: e.target.value })}
                    placeholder="Spec Value (e.g. M3 Pro)"
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                  <input
                    type="text"
                    value={newProductForm.specName2}
                    onChange={(e) => setNewProductForm({ ...newProductForm, specName2: e.target.value })}
                    placeholder="Spec Name (e.g. RAM)"
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                  <input
                    type="text"
                    value={newProductForm.specValue2}
                    onChange={(e) => setNewProductForm({ ...newProductForm, specValue2: e.target.value })}
                    placeholder="Spec Value (e.g. 36GB Unified)"
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewProductModalOpen(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-600/20"
                >
                  Publish Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
