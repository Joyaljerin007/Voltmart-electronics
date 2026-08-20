import React, { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, Review } from '../../types';
import { api } from '../../services/api';
import {
  Star,
  ShoppingCart,
  Scale,
  Heart,
  QrCode,
  Bell,
  ShieldCheck,
  Truck,
  RotateCcw,
  Download,
  FileText,
  HelpCircle,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  ThumbsUp,
  Plus,
  Minus,
  ArrowLeft,
  ChevronDown,
  Send,
  X,
  Share2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const ProductDetailView: React.FC = () => {
  const {
    selectedProductId,
    setCurrentView,
    addToCart,
    toggleCompare,
    isInCompare,
    toggleWishlist,
    isInWishlist,
    addPriceAlert,
    showToast,
    currentUser,
  } = useStore();

  const [product, setProduct] = useState<
    (Product & { priceHistory: any[]; reviews: Review[]; faqs: any[]; documents: any[] }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'history' | 'reviews' | 'faqs' | 'documents'>('specs');

  // Modals
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [targetAlertPrice, setTargetAlertPrice] = useState<number>(0);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Review submission state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: '',
  });

  // FAQ submission
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqsList, setFaqsList] = useState<any[]>([]);

  const fetchDetail = async (id: string) => {
    setLoading(true);
    const res = await api.getProductById(id);
    if (res.success && res.data) {
      setProduct(res.data);
      setFaqsList(res.data.faqs || []);
      const currentPrice = res.data.salePrice ?? res.data.basePrice;
      setTargetAlertPrice(Math.round(currentPrice * 0.9));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedProductId) {
      fetchDetail(selectedProductId);
    }
  }, [selectedProductId]);

  if (loading || !product) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-400 space-y-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium">Loading hardware specification matrix & history...</p>
      </div>
    );
  }

  const effectivePrice = product.salePrice ?? product.basePrice;
  const savings = product.salePrice ? product.basePrice - product.salePrice : 0;
  const inComp = isInCompare(product.id);
  const inWish = isInWishlist(product.id);

  // Group specifications by specGroup
  const groupedSpecs: Record<string, typeof product.specifications> = {};
  product.specifications.forEach((s) => {
    if (!groupedSpecs[s.specGroup]) groupedSpecs[s.specGroup] = [];
    groupedSpecs[s.specGroup].push(s);
  });

  // Price history chart data formatting
  const chartData = (product.priceHistory || []).map((p) => ({
    date: new Date(p.changedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    price: p.price,
    note: p.note,
  }));

  const minHistoricalPrice = chartData.length
    ? Math.min(...chartData.map((d) => d.price))
    : effectivePrice;
  const maxHistoricalPrice = chartData.length
    ? Math.max(...chartData.map((d) => d.price))
    : product.basePrice;

  // Review submission handler
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.title || !reviewForm.comment) return;

    const res = await api.submitReview(product.id, {
      userId: currentUser.id,
      userName: currentUser.name,
      rating: reviewForm.rating,
      title: reviewForm.title,
      comment: reviewForm.comment,
    });

    if (res.success && res.data) {
      setProduct((prev) => (prev ? { ...prev, reviews: [res.data!, ...prev.reviews] } : prev));
      setIsReviewModalOpen(false);
      setReviewForm({ rating: 5, title: '', comment: '' });
      showToast('Thank you! Your verified review has been published.', 'success');
    }
  };

  const handleHelpfulVote = async (reviewId: string) => {
    const res = await api.voteHelpfulReview(reviewId);
    if (res.success && res.data) {
      setProduct((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          reviews: prev.reviews.map((r) => (r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r)),
        };
      });
      showToast('Thank you for your feedback!', 'success');
    }
  };

  const handleFaqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim()) return;
    const newFaq = {
      id: `faq-${Date.now()}`,
      productId: product.id,
      question: faqQuestion,
      answer: 'Our technical team is reviewing this question and will post an authoritative response shortly.',
    };
    setFaqsList([newFaq, ...faqsList]);
    setFaqQuestion('');
    showToast('Question submitted to VoltMart technical specialists!', 'success');
  };

  return (
    <div id="product-detail-view" className="space-y-8 pb-20">
      {/* Back Button & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentView('catalog')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{product.category?.name || 'Electronics'}</span>
          <span>/</span>
          <span className="text-white font-medium truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      {/* Main Top Section: Image Gallery (Left) & Key Purchase Info (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square sm:aspect-4/3 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
            <img
              src={product.images[activeImageIndex]?.imageUrl || product.images[0]?.imageUrl}
              alt={product.name}
              className="w-full h-full object-contain p-4"
            />
            {savings > 0 && (
              <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-lg shadow-lg">
                SAVE ${savings.toFixed(0)} ({Math.round((savings / product.basePrice) * 100)}% OFF)
              </span>
            )}
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 p-2 rounded-xl backdrop-blur transition-colors"
              title="Show Product QR / Barcode"
            >
              <QrCode className="w-5 h-5 text-emerald-400" />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden bg-slate-950 border transition-all shrink-0 ${
                    activeImageIndex === idx
                      ? 'border-blue-500 ring-2 ring-blue-500/20'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <img src={img.imageUrl} alt={img.altText || ''} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Value Props Pills */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-center text-xs text-slate-300">
            <div className="bg-slate-850 p-2.5 rounded-xl border border-slate-800 flex flex-col items-center gap-1">
              <Truck className="w-4 h-4 text-blue-400" />
              <span>Fast Express Dispatch</span>
            </div>
            <div className="bg-slate-850 p-2.5 rounded-xl border border-slate-800 flex flex-col items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>2-Year Full Warranty</span>
            </div>
            <div className="bg-slate-850 p-2.5 rounded-xl border border-slate-800 flex flex-col items-center gap-1">
              <RotateCcw className="w-4 h-4 text-purple-400" />
              <span>30-Day Hassle Free</span>
            </div>
          </div>
        </div>

        {/* Right: Buy Box & Product Metadata */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-blue-500/10 text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-lg border border-blue-500/30">
                  {product.brand?.name || 'VoltMart'}
                </span>
                <span className="text-xs text-slate-400 font-mono">SKU: {product.sku}</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">UPC: {product.barcode}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Rating Summary */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= Math.round(product.rating) ? 'fill-current' : 'text-slate-700'
                    }`}
                  />
                ))}
                <span className="font-bold text-white ml-1">{product.rating}</span>
              </div>
              <span className="text-slate-400">•</span>
              <button
                onClick={() => setActiveTab('reviews')}
                className="text-blue-400 hover:underline font-medium"
              >
                {product.reviewCount} Verified Customer Reviews
              </button>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-white">
                  ${effectivePrice.toFixed(2)}
                </span>
                {product.salePrice && (
                  <span className="text-base text-slate-400 line-through">
                    ${product.basePrice.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      product.stockQuantity > 0 ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'
                    }`}
                  />
                  <span className="font-semibold text-slate-200">
                    {product.stockQuantity > 5
                      ? `In Stock (${product.stockQuantity} units available)`
                      : product.stockQuantity > 0
                      ? `Low Stock: Only ${product.stockQuantity} remaining!`
                      : 'Temporarily Out of Stock'}
                  </span>
                </div>

                <button
                  onClick={() => setIsAlertModalOpen(true)}
                  className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Set Price Alert</span>
                </button>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {product.description}
            </p>

            {/* Quick Specs Highlight Chips */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {product.specifications.slice(0, 4).map((s) => (
                <div key={s.id} className="bg-slate-800/60 border border-slate-700/60 p-2 rounded-xl">
                  <div className="text-[10px] text-slate-400">{s.specName}</div>
                  <div className="font-bold text-slate-100 truncate">{s.specValue}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons & Quantity Stepper */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-3">
              {/* Quantity Stepper */}
              <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1 shrink-0">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white rounded-lg hover:bg-slate-700"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-bold text-sm text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stockQuantity || 10, q + 1))}
                  className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white rounded-lg hover:bg-slate-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart CTA */}
              <button
                onClick={() => addToCart(product, quantity)}
                disabled={product.stockQuantity === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 text-sm transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Shopping Cart</span>
              </button>
            </div>

            {/* Compare, Wishlist & Share Secondary Actions */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => toggleCompare(product)}
                className={`py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  inComp
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>{inComp ? 'In Compare' : 'Add to Compare'}</span>
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  inWish
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                }`}
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>{inWish ? 'Saved' : 'Wishlist'}</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showToast('Product link copied to clipboard!', 'info');
                }}
                className="py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Link</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Deep-Dive Tabbed Section: Specs, Price History, Reviews, FAQs, Documents */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-800 overflow-x-auto no-scrollbar bg-slate-950/50 p-2 gap-2">
          {[
            { id: 'specs', label: 'Technical Specifications', icon: FileText, count: product.specifications.length },
            { id: 'history', label: 'Price History & Trends', icon: TrendingDown, count: chartData.length },
            { id: 'reviews', label: 'Customer Reviews', icon: Star, count: product.reviews?.length || 0 },
            { id: 'faqs', label: 'Questions & Answers', icon: HelpCircle, count: faqsList.length },
            { id: 'documents', label: 'Manuals & Documents', icon: Download, count: product.documents?.length || 0 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Full Specifications Matrix */}
        {activeTab === 'specs' && (
          <div className="p-6 sm:p-8 space-y-8 animate-in fade-in duration-150">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Hardware Specification Matrix</h3>
              <p className="text-xs text-slate-400">
                Verified technical specifications across silicon, display panels, connectivity, and power.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(groupedSpecs).map(([groupName, specs]) => (
                <div key={groupName} className="bg-slate-850 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                    {groupName}
                  </h4>
                  <div className="space-y-2">
                    {specs.map((s) => (
                      <div key={s.id} className="flex justify-between text-xs py-1 border-b border-slate-800/40 last:border-0">
                        <span className="text-slate-400 font-medium">{s.specName}</span>
                        <span className="text-slate-100 font-semibold text-right max-w-[60%] font-mono">
                          {s.specValue}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Interactive Price History Chart */}
        {activeTab === 'history' && (
          <div className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white mb-1">Historical Price Tracking</h3>
                <p className="text-xs text-slate-400">
                  Every catalog price adjustment is immutably logged into VoltMart's price history store.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="bg-slate-850 border border-slate-800 px-3 py-1.5 rounded-xl">
                  <span className="text-slate-400">All-Time Low: </span>
                  <strong className="text-emerald-400 font-bold">${minHistoricalPrice.toFixed(2)}</strong>
                </div>
                <div className="bg-slate-850 border border-slate-800 px-3 py-1.5 rounded-xl">
                  <span className="text-slate-400">Launch MSRP: </span>
                  <strong className="text-slate-200 font-bold">${maxHistoricalPrice.toFixed(2)}</strong>
                </div>
              </div>
            </div>

            {/* Recharts Price Area Chart */}
            <div className="h-72 w-full bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(val) => `$${val}`}
                    domain={['dataMin - 100', 'dataMax + 100']}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '11px' }}
                    formatter={(val: any, name: any, item: any) => [
                      `$${Number(val).toFixed(2)} (${item.payload.note || 'Recorded price'})`,
                      'Price',
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#priceGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Price Alert Banner */}
            <div className="bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-800/40 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm">Want to buy at a lower price?</h4>
                  <p className="text-xs text-slate-400">
                    Set a target price threshold. When the price dips, our background job triggers an instant alert.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAlertModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl whitespace-nowrap transition-colors shrink-0"
              >
                Set Target Alert →
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Customer Reviews */}
        {activeTab === 'reviews' && (
          <div className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white mb-1">Customer Reviews & Ratings</h3>
                <p className="text-xs text-slate-400">Real feedback from verified purchasers</p>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                Write a Review
              </button>
            </div>

            {/* Rating Distribution Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-850 p-5 rounded-2xl border border-slate-800 items-center">
              <div className="text-center md:border-r border-slate-800 pr-4">
                <div className="text-4xl font-black text-white">{product.rating}</div>
                <div className="flex justify-center text-amber-400 my-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <div className="text-xs text-slate-400">Based on {product.reviewCount} reviews</div>
              </div>

              <div className="md:col-span-2 space-y-2 text-xs">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = product.reviews.filter((r) => r.rating === stars).length;
                  const pct = product.reviews.length ? (count / product.reviews.length) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-3">
                      <span className="w-12 text-slate-300 font-medium">{stars} Stars</span>
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-slate-400 font-mono">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Review Cards List */}
            <div className="space-y-4">
              {product.reviews.map((rev) => (
                <div key={rev.id} className="p-5 rounded-2xl bg-slate-850/60 border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{rev.userName}</span>
                        {rev.verifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verified Buyer</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${s <= rev.rating ? 'fill-current' : 'text-slate-700'}`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleHelpfulVote(rev.id)}
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Helpful ({rev.helpfulCount})</span>
                    </button>
                  </div>

                  <h5 className="text-xs font-bold text-slate-100">{rev.title}</h5>
                  <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: FAQs & Technical Q&A */}
        {activeTab === 'faqs' && (
          <div className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Frequently Asked Questions</h3>
              <p className="text-xs text-slate-400">Official technical responses regarding compatibility and operation</p>
            </div>

            <div className="space-y-3">
              {faqsList.map((faq) => (
                <details
                  key={faq.id}
                  className="group bg-slate-850 border border-slate-800 rounded-xl p-4 transition-colors"
                >
                  <summary className="font-semibold text-xs text-white cursor-pointer list-none flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-blue-400" />
                      <span>{faq.question}</span>
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="pt-3 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 mt-3 pl-6">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>

            {/* Ask Question Form */}
            <form onSubmit={handleFaqSubmit} className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-3">
              <label className="text-xs font-bold text-slate-200 block">Have a question about this product?</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  placeholder="e.g. Does this support USB-C DisplayPort alternate mode charging?"
                  className="flex-1 bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Question</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 5: Documents & Manuals */}
        {activeTab === 'documents' && (
          <div className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Manuals & Documentation</h3>
              <p className="text-xs text-slate-400">Download manufacturer PDF spec sheets, quick start guides, and warranty terms</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {product.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-2xl bg-slate-850 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white truncate max-w-xs">{doc.title}</h5>
                      <span className="text-[10px] text-slate-400 font-mono">{doc.docType} • {doc.fileSize}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => showToast(`Simulated download: ${doc.title}`, 'info')}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Download Document PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: Price Alert Configuration Modal */}
      {/* ------------------------------------------------------------- */}
      {isAlertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">Create Price Drop Alert</h3>
              </div>
              <button onClick={() => setIsAlertModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              We'll monitor <strong>{product.name}</strong> continuously. When the price falls below your target, you'll receive a notification.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Current Price: ${effectivePrice.toFixed(2)}</label>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white">$</span>
                <input
                  type="number"
                  value={targetAlertPrice}
                  onChange={(e) => setTargetAlertPrice(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-white font-mono text-base rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsAlertModalOpen(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2.5 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const ok = await addPriceAlert(product.id, targetAlertPrice);
                  if (ok) setIsAlertModalOpen(false);
                }}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold py-2.5 rounded-xl transition-colors shadow-lg shadow-amber-500/20"
              >
                Activate Alert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: Barcode & QR Code Display Modal */}
      {/* ------------------------------------------------------------- */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl text-center">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Product QR & Barcode</h3>
              <button onClick={() => setIsQrModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-xl inline-block shadow-inner mx-auto">
              {/* Clean SVG visual QR Code simulation */}
              <div className="w-44 h-44 flex flex-col items-center justify-center text-slate-900">
                <QrCode className="w-36 h-36" />
                <span className="text-[10px] font-mono font-bold mt-1 tracking-wider">{product.sku}</span>
              </div>
            </div>

            <div className="text-xs text-slate-400 space-y-1">
              <div>Barcode / UPC: <strong className="text-white font-mono">{product.barcode}</strong></div>
              <div>SKU: <strong className="text-white font-mono">{product.sku}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: Write Review Modal */}
      {/* ------------------------------------------------------------- */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white">Write a Review</h3>
              <button onClick={() => setIsReviewModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Your Rating</label>
                <div className="flex gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          s <= reviewForm.rating ? 'fill-current' : 'text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Review Headline</label>
                <input
                  type="text"
                  required
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  placeholder="e.g. Exceptional build quality and compile speeds"
                  className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Detailed Feedback</label>
                <textarea
                  required
                  rows={4}
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Share your experience regarding performance, display clarity, battery life, thermals..."
                  className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-xl p-3 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2.5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-600/20"
                >
                  Submit Verified Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
