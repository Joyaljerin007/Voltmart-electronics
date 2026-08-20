import React, { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { api } from '../../services/api';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Star,
  ShieldCheck,
  Zap,
  Tag,
  Scale,
  Heart,
  ShoppingCart,
  QrCode,
  Check,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const {
    categories,
    brands,
    setCategoryFilter,
    setCurrentView,
    openProductDetail,
    addToCart,
    toggleCompare,
    isInCompare,
    toggleWishlist,
    isInWishlist,
    setIsScannerOpen,
  } = useStore();

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [dealProducts, setDealProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await api.getProducts({ limit: 12 });
      if (res.success && res.data) {
        setFeaturedProducts(res.data.filter((p) => p.isFeatured));
        setDealProducts(res.data.filter((p) => p.isDeal));
      }
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div id="home-view" className="space-y-12 pb-16">
      {/* Hero Showcase Banner */}
      <section id="hero-banner" className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 border border-slate-800 shadow-2xl p-6 sm:p-10 lg:p-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Next-Generation Flagship Electronics • Spring 2025 Release</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Engineered for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">Peak Performance</span> & Fidelity.
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
              Explore cutting-edge M3 Max workstations, 240Hz OLED gaming displays, Snapdragon 8 Gen 3 flagships, and acoustic noise-canceling audio gear with live price tracking and side-by-side spec comparisons.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="hero-explore-catalog-btn"
                onClick={() => {
                  setCategoryFilter(null);
                  setCurrentView('catalog');
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all hover:gap-3"
              >
                <span>Browse All Products</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-open-scanner-btn"
                onClick={() => setIsScannerOpen(true)}
                className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm px-5 py-3.5 rounded-xl flex items-center gap-2 transition-colors"
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>Barcode Scanner</span>
              </button>

              <button
                id="hero-compare-btn"
                onClick={() => setCurrentView('compare')}
                className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm px-5 py-3.5 rounded-xl flex items-center gap-2 transition-colors"
              >
                <Scale className="w-4 h-4 text-amber-400" />
                <span>Compare Matrix</span>
              </button>
            </div>

            {/* Quick Stat Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
              <div>
                <div className="text-white font-bold text-lg">100%</div>
                <div className="text-slate-400">Authentic Hardware</div>
              </div>
              <div>
                <div className="text-white font-bold text-lg">2-Year</div>
                <div className="text-slate-400">VoltCare Protection</div>
              </div>
              <div>
                <div className="text-white font-bold text-lg">Real-Time</div>
                <div className="text-slate-400">Price History Charts</div>
              </div>
            </div>
          </div>

          {/* Hero Featured Card Spotlight */}
          <div className="lg:col-span-5">
            {featuredProducts[0] && (
              <div className="relative bg-slate-850/90 border border-slate-700/80 rounded-2xl p-5 shadow-2xl backdrop-blur">
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Featured Flagship</span>
                </div>

                <div className="aspect-video w-full rounded-xl overflow-hidden mb-4 bg-slate-900 relative group">
                  <img
                    src={featuredProducts[0].images[0]?.imageUrl}
                    alt={featuredProducts[0].name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur text-[11px] font-mono text-slate-200 px-2 py-0.5 rounded">
                    SKU: {featuredProducts[0].sku}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-blue-400">{featuredProducts[0].brand?.name}</span>
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="font-bold text-white">{featuredProducts[0].rating}</span>
                      <span className="text-slate-400">({featuredProducts[0].reviewCount})</span>
                    </div>
                  </div>

                  <h3
                    onClick={() => openProductDetail(featuredProducts[0].id)}
                    className="text-base font-bold text-white hover:text-blue-400 cursor-pointer transition-colors line-clamp-2"
                  >
                    {featuredProducts[0].name}
                  </h3>

                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-2xl font-black text-white">
                      ${(featuredProducts[0].salePrice ?? featuredProducts[0].basePrice).toFixed(2)}
                    </span>
                    {featuredProducts[0].salePrice && (
                      <span className="text-sm text-slate-400 line-through">
                        ${featuredProducts[0].basePrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="pt-3 flex gap-2">
                    <button
                      onClick={() => addToCart(featuredProducts[0])}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </button>
                    <button
                      onClick={() => openProductDetail(featuredProducts[0].id)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
                    >
                      View Specs
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section id="categories-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Browse by Category</h2>
            <p className="text-xs text-slate-400">Find hardware tailored to work, esports, and creation</p>
          </div>
          <button
            onClick={() => {
              setCategoryFilter(null);
              setCurrentView('catalog');
            }}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className="group text-left bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-4 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/5 flex flex-col justify-between"
            >
              <div className="aspect-square w-full rounded-xl overflow-hidden mb-3 bg-slate-800">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                  {cat.name}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                  {cat.productCount || 0} Models Available
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Deal of the Day / Limited Offers */}
      <section id="deals-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Deals & Price Drops</span>
                <span className="text-xs bg-rose-500/20 text-rose-300 font-semibold px-2 py-0.5 rounded-full border border-rose-500/30">
                  Save up to $400
                </span>
              </h2>
              <p className="text-xs text-slate-400">Verified price reductions tracked by VoltMart history engine</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dealProducts.slice(0, 4).map((product) => {
            const savings = product.salePrice ? product.basePrice - product.salePrice : 0;
            const inComp = isInCompare(product.id);
            const inWish = isInWishlist(product.id);

            return (
              <div
                key={product.id}
                id={`deal-card-${product.id}`}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between transition-all group hover:shadow-xl"
              >
                <div>
                  {/* Image & Badges */}
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 mb-3">
                    <img
                      src={product.images[0]?.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {savings > 0 && (
                      <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow">
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

                  <div className="text-[11px] text-blue-400 font-semibold mb-1">
                    {product.brand?.name || 'VoltMart'}
                  </div>

                  <h4
                    onClick={() => openProductDetail(product.id)}
                    className="text-sm font-bold text-white hover:text-blue-400 cursor-pointer line-clamp-2 mb-2 transition-colors"
                  >
                    {product.name}
                  </h4>

                  {/* Primary specs tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.specifications.slice(0, 2).map((s) => (
                      <span
                        key={s.id}
                        className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono truncate max-w-[150px]"
                      >
                        {s.specName}: {s.specValue}
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
                    <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{product.rating}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1 transition-colors"
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
      </section>

      {/* Featured Manufacturer Brands */}
      <section id="brands-section" className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h3 className="text-lg font-bold text-white">Authorized Manufacturer Brands</h3>
          <p className="text-xs text-slate-400">Direct distributor partnerships with manufacturer warranty support</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {brands.map((b) => (
            <div
              key={b.id}
              className="bg-slate-900 border border-slate-800/80 rounded-xl p-3 flex flex-col items-center justify-center text-center hover:border-slate-700 transition-colors"
            >
              <img src={b.logoUrl} alt={b.name} className="w-10 h-10 rounded-full object-cover mb-2" />
              <span className="text-xs font-semibold text-slate-200">{b.name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
