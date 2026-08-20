import React, { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { api } from '../../services/api';
import { Order } from '../../types';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCcw,
  ArrowRight,
  ShoppingCart,
  XCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const OrdersView: React.FC = () => {
  const { currentUser, setCurrentView, showToast, addToCart } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await api.getOrders(currentUser.role === 'ADMIN' ? undefined : currentUser.id);
    if (res.success && res.data) {
      setOrders(res.data);
      if (res.data.length > 0 && !expandedOrderId) {
        setExpandedOrderId(res.data[0].id);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [currentUser]);

  const handleCancel = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order? Hardware allocations will be released.')) return;
    const res = await api.cancelOrder(orderId);
    if (res.success && res.data) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.data! : o)));
      showToast(`Order ${orderId} has been cancelled.`, 'info');
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Delivered</span>
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
            <Truck className="w-3 h-3" />
            <span>In Transit (Shipped)</span>
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Processing in Warehouse</span>
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Order Confirmed</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold">
            Pending
          </span>
        );
    }
  };

  const steps = [
    { key: 'CONFIRMED', label: 'Order Placed' },
    { key: 'PROCESSING', label: 'Warehouse Pack' },
    { key: 'SHIPPED', label: 'In Transit' },
    { key: 'DELIVERED', label: 'Delivered' },
  ];

  const getStepIndex = (status: Order['status']) => {
    if (status === 'CONFIRMED') return 0;
    if (status === 'PROCESSING') return 1;
    if (status === 'SHIPPED') return 2;
    if (status === 'DELIVERED') return 3;
    return -1;
  };

  return (
    <div id="orders-view" className="space-y-8 pb-20">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Order Lifecycle & Tracking</span>
              <span className="text-xs bg-blue-500/20 text-blue-300 font-mono px-2.5 py-0.5 rounded-full">
                {orders.length} Records
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Real-time shipment tracking, warehouse fulfillment status, and invoicing history.
            </p>
          </div>
        </div>

        <button
          onClick={fetchOrders}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs">Loading order fulfillment histories...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No Orders Found</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            You have not placed any hardware orders yet. Explore our catalog to buy workstations, displays, and audio gear.
          </p>
          <button
            onClick={() => setCurrentView('catalog')}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors inline-flex items-center gap-2"
          >
            <span>Browse Products</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const currentStepIdx = getStepIndex(order.status);

            return (
              <div
                key={order.id}
                id={`order-card-${order.id}`}
                className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl transition-all"
              >
                {/* Header Summary Bar */}
                <div
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="p-5 sm:p-6 bg-slate-850/70 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-850 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-sm text-white">{order.id}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1 pt-0.5">
                      <span>Date: <strong className="text-slate-300 font-normal">{new Date(order.createdAt).toLocaleDateString()}</strong></span>
                      <span>Recipient: <strong className="text-slate-300 font-normal">{order.userName}</strong></span>
                      {order.trackingNumber && (
                        <span>Tracking: <strong className="text-emerald-400 font-mono font-normal">{order.trackingNumber}</strong></span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Total Billed</div>
                      <div className="text-base font-black text-blue-400 font-mono">${order.totalAmount.toFixed(2)}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-150">
                    {/* Visual Stepper Timeline (if not cancelled) */}
                    {order.status !== 'CANCELLED' ? (
                      <div className="py-2">
                        <div className="grid grid-cols-4 gap-2 relative">
                          {/* Connecting Bar */}
                          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 z-0" />
                          
                          {steps.map((step, idx) => {
                            const isCompleted = idx <= currentStepIdx;
                            const isCurrent = idx === currentStepIdx;

                            return (
                              <div key={step.key} className="relative z-10 flex flex-col items-center text-center">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md ${
                                    isCompleted
                                      ? 'bg-blue-600 text-white ring-4 ring-blue-600/20'
                                      : 'bg-slate-800 text-slate-400'
                                  }`}
                                >
                                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                                </div>
                                <span
                                  className={`text-[11px] font-semibold mt-2 ${
                                    isCurrent ? 'text-blue-400 font-bold' : isCompleted ? 'text-slate-200' : 'text-slate-400'
                                  }`}
                                >
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>This order was cancelled. Authorized payments have been credited back.</span>
                      </div>
                    )}

                    {/* Order Items Table */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Ordered Items</h4>
                      <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden bg-slate-850/50">
                        {order.items.map((item) => (
                          <div key={item.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={item.product?.images[0]?.imageUrl}
                                alt={item.product?.name || ''}
                                className="w-12 h-12 rounded-lg object-cover bg-slate-950 shrink-0"
                              />
                              <div className="min-w-0">
                                <h5 className="font-bold text-white truncate">{item.product?.name}</h5>
                                <div className="text-slate-400 font-mono text-[11px]">
                                  SKU: {item.product?.sku} • Qty: {item.quantity}
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="font-bold text-white font-mono">
                                ${(item.unitPrice * item.quantity).toFixed(2)}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                (${item.unitPrice.toFixed(2)} each)
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address & Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-800 text-xs">
                      <div className="text-slate-400">
                        <span className="text-slate-300 font-semibold block">Shipping Destination:</span>
                        <span>{order.shippingAddress}</span>
                      </div>

                      <div className="flex gap-2 self-end sm:self-auto">
                        {(order.status === 'PENDING' || order.status === 'CONFIRMED' || order.status === 'PROCESSING') && (
                          <button
                            onClick={() => handleCancel(order.id)}
                            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
                          >
                            Cancel Order
                          </button>
                        )}
                        <button
                          onClick={() => {
                            order.items.forEach((it) => {
                              if (it.product) addToCart(it.product, it.quantity);
                            });
                          }}
                          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Buy Items Again</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
