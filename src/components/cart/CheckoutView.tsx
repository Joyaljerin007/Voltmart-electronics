import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { api } from '../../services/api';
import { Order } from '../../types';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShoppingCart,
  Tag,
  Package,
  Building,
  RotateCcw,
} from 'lucide-react';

export const CheckoutView: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    promoCode,
    discountAmount,
    clearCart,
    setCurrentView,
    currentUser,
    showToast,
  } = useStore();

  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [shippingForm, setShippingForm] = useState({
    fullName: currentUser.name,
    email: currentUser.email,
    address: '450 Silicon Way, Suite 800',
    city: 'San Jose',
    state: 'CA',
    postalCode: '95112',
    country: 'United States',
  });

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'invoice' | 'crypto'>('card');
  const [cardForm, setCardForm] = useState({
    cardNumber: '4242 •••• •••• 4242',
    expDate: '12/28',
    cvv: '888',
    cardholder: currentUser.name,
  });

  const [processing, setProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const shippingCost = shippingMethod === 'express' ? 29.99 : cartSubtotal > 500 ? 0 : 19.99;
  const tax = (cartSubtotal - discountAmount) * 0.0825;
  const grandTotal = Math.max(0, cartSubtotal - discountAmount + tax + shippingCost);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setProcessing(true);
    const shippingAddress = `${shippingForm.address}, ${shippingForm.city}, ${shippingForm.state} ${shippingForm.postalCode}, ${shippingForm.country}`;

    const items = cart.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      unitPrice: item.product.salePrice ?? item.product.basePrice,
    }));

    const res = await api.createOrder({
      userId: currentUser.id,
      userName: shippingForm.fullName,
      userEmail: shippingForm.email,
      items,
      shippingAddress,
      paymentMethod: paymentMethod === 'card' ? 'CREDIT_CARD' : paymentMethod === 'invoice' ? 'NET30_INVOICE' : 'DIRECT_DEBIT',
    });

    setProcessing(false);

    if (res.success && res.data) {
      setCompletedOrder(res.data);
      clearCart();
      showToast(`Order ${res.data.id} placed successfully!`, 'success');
    } else {
      showToast('Error creating order. Please check item availability.', 'error');
    }
  };

  // If order is completed, show the official receipt confirmation screen
  if (completedOrder) {
    return (
      <div id="checkout-success-view" className="max-w-2xl mx-auto my-10 bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 text-slate-100 shadow-2xl animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
            Payment Authorized & Dispatched
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Order Confirmed!</h2>
          <p className="text-xs text-slate-400">
            Thank you, <strong>{completedOrder.userName}</strong>. Your hardware allocation is locked and preparing for packaging.
          </p>
        </div>

        {/* Order Meta Box */}
        <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 text-left text-xs space-y-2.5">
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Order Number</span>
            <span className="font-mono font-bold text-white">{completedOrder.id}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Lifecycle Status</span>
            <span className="font-semibold text-blue-400 capitalize">{completedOrder.status}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Tracking Number</span>
            <span className="font-mono text-emerald-400">{completedOrder.trackingNumber || 'Pending Courier Scan'}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Estimated Delivery</span>
            <span className="font-medium text-white">{new Date(completedOrder.estimatedDelivery).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between pt-1 font-bold text-sm">
            <span className="text-slate-200">Total Billed</span>
            <span className="text-blue-400">${completedOrder.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => setCurrentView('orders')}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
          >
            <Package className="w-4 h-4" />
            <span>Track in Order History</span>
          </button>
          <button
            onClick={() => setCurrentView('catalog')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-5 py-3 rounded-xl transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-4 text-slate-400">
        <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
          <ShoppingCart className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">Your Cart is Empty</h3>
        <p className="text-xs text-slate-400">
          Please add items to your cart before proceeding to checkout.
        </p>
        <button
          onClick={() => setCurrentView('catalog')}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors inline-block"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  return (
    <div id="checkout-view" className="space-y-8 pb-20">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Secure Order Checkout</span>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 font-mono px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>256-Bit SSL Encrypted</span>
            </span>
          </h1>
          <p className="text-xs text-slate-400">Complete delivery details and select payment method.</p>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Shipping & Payment forms */}
        <div className="lg:col-span-7 space-y-6">
          {/* Shipping Address */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Truck className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-sm text-white">1. Delivery Address</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="text-slate-400 block mb-1">Full Name / Company Name</label>
                <input
                  type="text"
                  required
                  value={shippingForm.fullName}
                  onChange={(e) => setShippingForm({ ...shippingForm, fullName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-400 block mb-1">Email for Invoicing & Tracking</label>
                <input
                  type="email"
                  required
                  value={shippingForm.email}
                  onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-400 block mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={shippingForm.address}
                  onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">City</label>
                <input
                  type="text"
                  required
                  value={shippingForm.city}
                  onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={shippingForm.state}
                    onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">ZIP Code</label>
                  <input
                    type="text"
                    required
                    value={shippingForm.postalCode}
                    onChange={(e) => setShippingForm({ ...shippingForm, postalCode: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Speed Options */}
            <div className="pt-2 space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Shipping Speed</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                    shippingMethod === 'standard'
                      ? 'bg-blue-600/10 border-blue-500 text-white'
                      : 'bg-slate-850 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'standard'}
                      onChange={() => setShippingMethod('standard')}
                      className="text-blue-600 focus:ring-0"
                    />
                    <div>
                      <div className="font-semibold text-slate-100">Standard Freight (3-5 Days)</div>
                      <div className="text-[11px] text-slate-400">Insured road delivery</div>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-400">{cartSubtotal > 500 ? 'FREE' : '$19.99'}</span>
                </label>

                <label
                  className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                    shippingMethod === 'express'
                      ? 'bg-blue-600/10 border-blue-500 text-white'
                      : 'bg-slate-850 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'express'}
                      onChange={() => setShippingMethod('express')}
                      className="text-blue-600 focus:ring-0"
                    />
                    <div>
                      <div className="font-semibold text-slate-100">VoltMart Priority Air (1-2 Days)</div>
                      <div className="text-[11px] text-slate-400">Overnight dispatch</div>
                    </div>
                  </div>
                  <span className="font-bold text-white">$29.99</span>
                </label>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">2. Payment Method</h3>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors ${
                  paymentMethod === 'card'
                    ? 'bg-blue-600/10 border-blue-500 text-white'
                    : 'bg-slate-850 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Credit / Debit</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('invoice')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors ${
                  paymentMethod === 'invoice'
                    ? 'bg-blue-600/10 border-blue-500 text-white'
                    : 'bg-slate-850 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Enterprise NET30</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('crypto')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors ${
                  paymentMethod === 'crypto'
                    ? 'bg-blue-600/10 border-blue-500 text-white'
                    : 'bg-slate-850 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Wire Transfer</span>
              </button>
            </div>

            {paymentMethod === 'card' && (
              <div className="space-y-3 pt-2 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardForm.cardNumber}
                    onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Expiration Date</label>
                    <input
                      type="text"
                      value={cardForm.expDate}
                      onChange={(e) => setCardForm({ ...cardForm, expDate: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">CVC / CVV</label>
                    <input
                      type="password"
                      value={cardForm.cvv}
                      onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 sticky top-24">
            <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-3">
              Order Summary ({cart.reduce((s, i) => s + i.quantity, 0)} Items)
            </h3>

            {/* Item List */}
            <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
              {cart.map((item) => {
                const itemPrice = item.product.salePrice ?? item.product.basePrice;
                return (
                  <div key={item.product.id} className="flex gap-3 text-xs">
                    <img
                      src={item.product.images[0]?.imageUrl}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-lg object-cover bg-slate-950 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white truncate">{item.product.name}</h4>
                      <span className="text-slate-400 text-[11px]">Qty: {item.quantity} × ${itemPrice.toFixed(2)}</span>
                    </div>
                    <span className="font-bold text-white font-mono">${(itemPrice * item.quantity).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>

            {/* Calculations */}
            <div className="space-y-2 pt-3 border-t border-slate-800 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-white">${cartSubtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Promo Discount ({promoCode.toUpperCase()})</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping ({shippingMethod})</span>
                <span className="text-white">{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (8.25%)</span>
                <span className="text-white">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
                <span>Grand Total</span>
                <span className="text-blue-400">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Authorize Payment CTA */}
            <button
              type="submit"
              disabled={processing}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 text-sm transition-all"
            >
              {processing ? (
                <span>Authorizing & Allocating Inventory...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Authorize & Place Order (${grandTotal.toFixed(2)})</span>
                </>
              )}
            </button>

            <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full 2-Year VoltCare Hardware Warranty Included</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
