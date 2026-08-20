import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ShoppingCart, X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    cart,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    promoCode,
    setPromoCode,
    discountAmount,
    setCurrentView,
  } = useStore();

  if (!isCartDrawerOpen) return null;

  const shippingCost = cartSubtotal > 500 || cartSubtotal === 0 ? 0 : 19.99;
  const tax = (cartSubtotal - discountAmount) * 0.0825;
  const total = Math.max(0, cartSubtotal - discountAmount + tax + (cart.length ? shippingCost : 0));

  const handleCheckoutClick = () => {
    setIsCartDrawerOpen(false);
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="cart-drawer-overlay" className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white">Your Shopping Cart</h3>
              <span className="bg-slate-800 text-blue-400 text-xs px-2 py-0.5 rounded-full font-semibold">
                {cart.reduce((sum, i) => sum + i.quantity, 0)} items
              </span>
            </div>
            <button
              id="close-cart-btn"
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-slate-400">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <h4 className="text-white font-medium mb-1">Your cart is currently empty</h4>
                <p className="text-xs text-slate-400 max-w-xs mb-6">
                  Browse our high-performance laptops, monitors, gaming rigs, and flagship smartphones.
                </p>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    setCurrentView('catalog');
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
                >
                  Explore Catalog →
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const effectivePrice = item.product.salePrice ?? item.product.basePrice;
                return (
                  <div
                    key={item.product.id}
                    id={`cart-item-${item.product.id}`}
                    className="flex gap-3.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60"
                  >
                    <img
                      src={item.product.images[0]?.imageUrl}
                      alt={item.product.name}
                      className="w-20 h-20 rounded-lg object-cover bg-slate-900 shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-semibold text-white truncate" title={item.product.name}>
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-slate-400 hover:text-rose-400 p-0.5 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          SKU: {item.product.sku}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-lg p-0.5">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white rounded hover:bg-slate-800"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-semibold px-1 text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white rounded hover:bg-slate-800"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-bold text-white">
                            ${(effectivePrice * item.quantity).toFixed(2)}
                          </div>
                          {item.product.salePrice && (
                            <div className="text-[10px] text-slate-400 line-through">
                              ${(item.product.basePrice * item.quantity).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-900/90 space-y-3">
              {/* Promo Code Input */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Promo code (e.g. VOLT10)"
                    className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-lg pl-7 pr-3 py-1.5 uppercase font-mono placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                </div>
                {promoCode && (
                  <button
                    onClick={() => setPromoCode('')}
                    className="text-xs text-slate-400 hover:text-white px-1"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Subtotals */}
              <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">${cartSubtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Discount ({promoCode.toUpperCase()})</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Tax (8.25%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? <strong className="text-emerald-400 font-normal">FREE</strong> : `$${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                  <span>Estimated Total</span>
                  <span className="text-blue-400">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Proceed to Checkout CTA */}
              <button
                id="cart-drawer-checkout-btn"
                onClick={handleCheckoutClick}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-600/20 transition-colors mt-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>256-bit Encrypted Checkout & 2-Year Hardware Warranty</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
