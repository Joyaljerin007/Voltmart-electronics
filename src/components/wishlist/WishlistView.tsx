import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Heart,
  ShoppingCart,
  Trash2,
  Bell,
  Scale,
  ArrowRight,
  TrendingDown,
  Sparkles,
} from 'lucide-react';

export const WishlistView: React.FC = () => {
  const {
    wishlist,
    removeFromWishlist,
    priceAlerts,
    removePriceAlert,
    addToCart,
    openProductDetail,
    setCurrentView,
    toggleCompare,
    isInCompare,
  } = useStore();

  return (
    <div id="wishlist-view" className="space-y-8 pb-20">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Saved Wishlist & Price Alerts</span>
              <span className="text-xs bg-rose-500/20 text-rose-300 font-mono px-2.5 py-0.5 rounded-full">
                {wishlist.length} Items
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Track hardware availability and monitor automated price drop thresholds.
            </p>
          </div>
        </div>

        {wishlist.length > 0 && (
          <button
            onClick={() => {
              wishlist.forEach((p) => addToCart(p));
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors self-start sm:self-auto"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add All Available to Cart</span>
          </button>
        )}
      </div>

      {/* Active Price Alerts Bar */}
      {priceAlerts.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Active Price Drop Watchlist ({priceAlerts.length})</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {priceAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-slate-850 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <h4
                    onClick={() => openProductDetail(alert.productId)}
                    className="text-xs font-semibold text-white truncate hover:text-blue-400 cursor-pointer"
                  >
                    {alert.productName}
                  </h4>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Target: <strong className="text-emerald-400 font-bold">${alert.targetPrice}</strong> (Current: ${alert.currentPrice})
                  </div>
                </div>
                <button
                  onClick={() => removePriceAlert(alert.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
                  title="Remove alert"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wishlist Items Grid */}
      {wishlist.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 text-rose-400 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Your wishlist is currently empty</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Click the heart icon on any workstation, GPU, or display to save it here and track future price reductions.
          </p>
          <button
            onClick={() => setCurrentView('catalog')}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors inline-flex items-center gap-2"
          >
            <span>Explore Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.map((product) => {
            const inComp = isInCompare(product.id);
            const price = product.salePrice ?? product.basePrice;

            return (
              <div
                key={product.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 mb-3">
                    <img
                      src={product.images[0]?.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="absolute top-2 right-2 bg-slate-950/80 hover:bg-rose-600 text-rose-400 hover:text-white p-1.5 rounded-lg backdrop-blur transition-colors"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-[11px] text-blue-400 font-semibold mb-0.5">
                    {product.brand?.name}
                  </div>
                  <h4
                    onClick={() => openProductDetail(product.id)}
                    className="text-sm font-bold text-white hover:text-blue-400 cursor-pointer line-clamp-2 mb-2 transition-colors"
                  >
                    {product.name}
                  </h4>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-black text-white">${price.toFixed(2)}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        product.stockQuantity > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stockQuantity === 0}
                      className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1 transition-colors"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>

                    <button
                      onClick={() => toggleCompare(product)}
                      className={`py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                        inComp
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                      }`}
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>{inComp ? 'Compared' : 'Compare'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
