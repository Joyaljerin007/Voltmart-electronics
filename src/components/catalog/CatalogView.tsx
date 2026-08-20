import React, { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { api } from '../../services/api';
import {
  Filter,
  SlidersHorizontal,
  Grid,
  List,
  Star,
  ShoppingCart,
  Scale,
  Heart,
  QrCode,
  X,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const CatalogView: React.FC = () => {
  const {
    categories,
    brands,
    filters,
    setFilters,
    resetFilters,
    openProductDetail,
    addToCart,
    toggleCompare,
    isInCompare,
    toggleWishlist,
    isInWishlist,
    setIsScannerOpen,
  } = useStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Dynamic hardware spec facets available to filter
  const specFacets = [
    { key: 'RAM', label: 'Memory (RAM)', options: ['64GB', '32GB', '16GB', '12GB', '8GB'] },
    { key: 'Refresh Rate', label: 'Display Refresh Rate', options: ['240Hz', '120Hz', '90Hz', '60Hz'] },
    { key: 'Screen Size', label: 'Screen Size', options: ['49-inch', '31.5-inch', '16.3-inch', '16.2-inch', '6.9-inch', '6.8-inch'] },
    { key: 'Processor', label: 'Processor Family', options: ['M3 Max', 'Core Ultra 9', 'Snapdragon 8 Gen 3', 'A18 Pro'] },
  ];

  const fetchProducts = async () => {
    setLoading(true);
    const res = await api.getProducts({
      ...filters,
      page: currentPage,
      limit: 12,
    });
    if (res.success && res.data) {
      setProducts(res.data);
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages);
        setTotalCount(res.pagination.total);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [filters, currentPage]);

  const handleBrandToggle = (brandId: string) => {
    setFilters((prev) => {
      const exists = prev.brandIds.includes(brandId);
      const nextBrandIds = exists
        ? prev.brandIds.filter((id) => id !== brandId)
        : [...prev.brandIds, brandId];
      return { ...prev, brandIds: nextBrandIds };
    });
    setCurrentPage(1);
  };

  const handleSpecToggle = (specKey: string, val: string) => {
    setFilters((prev) => {
      const currentList = prev.specFilters[specKey] || [];
      const exists = currentList.includes(val);
      const nextList = exists
        ? currentList.filter((v) => v !== val)
        : [...currentList, val];
      
      const nextSpecs = { ...prev.specFilters };
      if (nextList.length > 0) {
        nextSpecs[specKey] = nextList;
      } else {
        delete nextSpecs[specKey];
      }

      return { ...prev, specFilters: nextSpecs };
    });
    setCurrentPage(1);
  };

  return (
    <div id="catalog-view" className="space-y-6 pb-16">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Electronics Catalog</span>
            <span className="text-xs bg-blue-500/10 text-blue-400 font-mono px-2.5 py-0.5 rounded-full border border-blue-500/30">
              {totalCount} Items Found
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse hardware specifications, compare models side-by-side, and track price histories.
          </p>
        </div>

        {/* View Mode & Sorter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }));
                setCurrentPage(1);
              }}
              className="bg-slate-800 text-slate-200 border border-slate-700 text-xs rounded-xl px-3 py-2.5 pr-8 appearance-none focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
            >
              <option value="featured">Sort by: Featured & Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="newest">Newest Arrivals</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Active Filter Chips (if any) */}
      {(filters.categoryId ||
        filters.brandIds.length > 0 ||
        filters.minRating > 0 ||
        filters.inStockOnly ||
        filters.searchQuery ||
        Object.keys(filters.specFilters).length > 0) && (
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Active Filters:</span>
          </span>

          {filters.searchQuery && (
            <span className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs px-2.5 py-1 rounded-lg">
              Query: "{filters.searchQuery}"
              <button
                onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.categoryId && (
            <span className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs px-2.5 py-1 rounded-lg">
              Category: {categories.find((c) => c.id === filters.categoryId)?.name}
              <button
                onClick={() => setFilters((prev) => ({ ...prev, categoryId: null }))}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.brandIds.map((bId) => (
            <span
              key={bId}
              className="inline-flex items-center gap-1 bg-slate-800 border border-slate-700 text-slate-200 text-xs px-2.5 py-1 rounded-lg"
            >
              Brand: {brands.find((b) => b.id === bId)?.name}
              <button onClick={() => handleBrandToggle(bId)} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {Object.entries(filters.specFilters).map(([sKey, vals]) =>
            (Array.isArray(vals) ? vals : []).map((v) => (
              <span
                key={`${sKey}-${v}`}
                className="inline-flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs px-2.5 py-1 rounded-lg font-mono"
              >
                {sKey}: {v}
                <button onClick={() => handleSpecToggle(sKey, v)} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}

          {filters.inStockOnly && (
            <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs px-2.5 py-1 rounded-lg">
              In Stock Only
              <button
                onClick={() => setFilters((prev) => ({ ...prev, inStockOnly: false }))}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={resetFilters}
            className="text-xs text-rose-400 hover:text-rose-300 ml-auto flex items-center gap-1 font-medium"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        </div>
      )}

      {/* Main Catalog Layout (Sidebar + Results) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Filter Sidebar */}
        <aside className="lg:col-span-3 space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-400" />
                <span>Filters & Facets</span>
              </span>
              <button onClick={resetFilters} className="text-xs text-slate-400 hover:text-white">
                Clear
              </button>
            </div>

            {/* In-Stock Toggle */}
            <div className="flex items-center justify-between">
              <label htmlFor="inStockToggle" className="text-xs font-semibold text-slate-200 cursor-pointer">
                In Stock Only
              </label>
              <input
                id="inStockToggle"
                type="checkbox"
                checked={filters.inStockOnly}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, inStockOnly: e.target.checked }));
                  setCurrentPage(1);
                }}
                className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Categories Tree */}
            <div className="space-y-2 pt-3 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Categories</h4>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, categoryId: null }));
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                    filters.categoryId === null ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>All Categories</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, categoryId: cat.id }));
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                      filters.categoryId === cat.id ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] opacity-75">{cat.productCount || 0}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Brands Checkboxes */}
            <div className="space-y-2 pt-3 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Brands</h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {brands.map((brand) => {
                  const isChecked = filters.brandIds.includes(brand.id);
                  return (
                    <label
                      key={brand.id}
                      className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleBrandToggle(brand.id)}
                        className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-0"
                      />
                      <span>{brand.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Price Range Slider */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Max Price</h4>
                <span className="text-xs font-mono font-bold text-blue-400">
                  ${filters.maxPrice}
                </span>
              </div>
              <input
                type="range"
                min={100}
                max={4000}
                step={50}
                value={filters.maxPrice}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }));
                  setCurrentPage(1);
                }}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>$100</span>
                <span>$2,000</span>
                <span>$4,000</span>
              </div>
            </div>

            {/* Dynamic Hardware Spec Facets (RAM, Refresh Rate, Screen Size, Processor) */}
            {specFacets.map((facet) => (
              <div key={facet.key} className="space-y-2 pt-3 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">{facet.label}</h4>
                <div className="flex flex-wrap gap-1.5">
                  {facet.options.map((opt) => {
                    const active = (filters.specFilters[facet.key] || []).includes(opt);
                    return (
                      <button
                        key={opt}
                        onClick={() => handleSpecToggle(facet.key, opt)}
                        className={`text-[11px] px-2 py-1 rounded-md font-mono transition-colors ${
                          active
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Minimum Star Rating */}
            <div className="space-y-2 pt-3 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Customer Rating</h4>
              <div className="space-y-1">
                {[4.5, 4.0, 0].map((ratingVal) => (
                  <button
                    key={ratingVal}
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, minRating: ratingVal }));
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      filters.minRating === ratingVal ? 'bg-slate-800 text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                      <span>{ratingVal === 0 ? 'All Ratings' : `${ratingVal} Stars & Up`}</span>
                    </div>
                    {filters.minRating === ratingVal && <Check className="w-3.5 h-3.5 text-blue-400" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Right Product Grid/List Area */}
        <main className="lg:col-span-9 space-y-6">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs font-medium">Filtering & loading catalog records...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Filter className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No matching products found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try widening your price boundaries, clearing hardware spec filters, or searching a broader term.
              </p>
              <button
                onClick={resetFilters}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors inline-block"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid Layout */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => {
                const inComp = isInCompare(product.id);
                const inWish = isInWishlist(product.id);
                const savings = product.salePrice ? product.basePrice - product.salePrice : 0;

                return (
                  <div
                    key={product.id}
                    id={`catalog-card-${product.id}`}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between transition-all group hover:shadow-xl hover:shadow-blue-500/5"
                  >
                    <div>
                      {/* Image & Quick Action Floating Buttons */}
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 mb-3">
                        <img
                          src={product.images[0]?.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {savings > 0 && (
                          <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                            SAVE ${savings.toFixed(0)}
                          </span>
                        )}
                        <div className="absolute top-2 right-2 flex flex-col gap-1">
                          <button
                            onClick={() => toggleWishlist(product)}
                            className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${
                              inWish ? 'bg-rose-500 text-white' : 'bg-slate-900/80 text-slate-300 hover:text-white'
                            }`}
                            title="Save to Wishlist"
                          >
                            <Heart className="w-3.5 h-3.5 fill-current" />
                          </button>
                          <button
                            onClick={() => toggleCompare(product)}
                            className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${
                              inComp ? 'bg-amber-500 text-slate-950' : 'bg-slate-900/80 text-slate-300 hover:text-white'
                            }`}
                            title="Add to Compare"
                          >
                            <Scale className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-blue-400 font-semibold">{product.brand?.name}</span>
                        <div className="flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{product.rating}</span>
                          <span className="text-slate-400 font-normal">({product.reviewCount})</span>
                        </div>
                      </div>

                      <h3
                        onClick={() => openProductDetail(product.id)}
                        className="text-sm font-bold text-white hover:text-blue-400 cursor-pointer line-clamp-2 mb-2 transition-colors"
                        title={product.name}
                      >
                        {product.name}
                      </h3>

                      {/* Specs pills */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {product.specifications.slice(0, 3).map((s) => (
                          <span
                            key={s.id}
                            className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono truncate max-w-[130px]"
                          >
                            {s.specValue}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80">
                      <div className="flex items-baseline justify-between mb-3">
                        <div>
                          <span className="text-lg font-black text-white">
                            ${(product.salePrice ?? product.basePrice).toFixed(2)}
                          </span>
                          {product.salePrice && (
                            <span className="text-xs text-slate-400 line-through ml-1.5">
                              ${product.basePrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            product.stockQuantity > 5
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : product.stockQuantity > 0
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {product.stockQuantity > 5
                            ? 'In Stock'
                            : product.stockQuantity > 0
                            ? `Only ${product.stockQuantity} left`
                            : 'Out of Stock'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => addToCart(product)}
                          disabled={product.stockQuantity === 0}
                          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1 transition-colors"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                        <button
                          onClick={() => openProductDetail(product.id)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium py-2 rounded-xl text-center transition-colors"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List Layout */
            <div className="space-y-3">
              {products.map((product) => {
                const inComp = isInCompare(product.id);
                const inWish = isInWishlist(product.id);

                return (
                  <div
                    key={product.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <img
                        src={product.images[0]?.imageUrl}
                        alt={product.name}
                        className="w-24 h-24 rounded-xl object-cover bg-slate-950 shrink-0 cursor-pointer"
                        onClick={() => openProductDetail(product.id)}
                      />
                      <div>
                        <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold mb-0.5">
                          <span>{product.brand?.name}</span>
                          <span>•</span>
                          <span className="text-slate-400 font-mono">SKU: {product.sku}</span>
                        </div>
                        <h3
                          onClick={() => openProductDetail(product.id)}
                          className="text-sm font-bold text-white hover:text-blue-400 cursor-pointer transition-colors"
                        >
                          {product.name}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-1 max-w-md mt-1">
                          {product.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {product.specifications.slice(0, 4).map((s) => (
                            <span
                              key={s.id}
                              className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono"
                            >
                              {s.specName}: {s.specValue}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      <div className="text-left sm:text-right">
                        <div className="text-lg font-black text-white">
                          ${(product.salePrice ?? product.basePrice).toFixed(2)}
                        </div>
                        {product.salePrice && (
                          <div className="text-xs text-slate-400 line-through">
                            ${product.basePrice.toFixed(2)}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleWishlist(product)}
                          className={`p-2 rounded-xl transition-colors ${
                            inWish ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
                          }`}
                          title="Save to Wishlist"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                        <button
                          onClick={() => toggleCompare(product)}
                          className={`p-2 rounded-xl transition-colors ${
                            inComp ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
                          }`}
                          title="Add to Compare"
                        >
                          <Scale className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => addToCart(product)}
                          disabled={product.stockQuantity === 0}
                          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-slate-900 border border-slate-800 disabled:opacity-40 text-slate-200 text-xs px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors"
              >
                Previous
              </button>
              <div className="text-xs text-slate-400 font-mono">
                Page {currentPage} of {totalPages}
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-slate-900 border border-slate-800 disabled:opacity-40 text-slate-200 text-xs px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
