import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  Product,
  CartItem,
  WishlistItem,
  PriceAlert,
  Order,
  FilterState,
  Category,
  Brand,
} from '../types';
import { api } from '../services/api';

export type AppView =
  | 'home'
  | 'catalog'
  | 'product-detail'
  | 'compare'
  | 'wishlist'
  | 'checkout'
  | 'orders'
  | 'order-detail'
  | 'admin'
  | 'api-docs';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface StoreContextType {
  // Current user & switch role
  currentUser: User;
  switchUserRole: (role: 'CUSTOMER' | 'ADMIN') => void;

  // View routing
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  selectedProductId: string | null;
  openProductDetail: (productId: string) => void;
  selectedOrderId: string | null;
  openOrderDetail: (orderId: string) => void;

  // Catalog meta
  categories: Category[];
  brands: Brand[];
  refreshCatalogMeta: () => Promise<void>;

  // Filters
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  setCategoryFilter: (categoryId: string | null) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  cartSubtotal: number;
  cartItemCount: number;
  promoCode: string;
  setPromoCode: (code: string) => void;
  discountAmount: number;

  // Compare
  compareList: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  toggleCompare: (product: Product) => void;
  isInCompare: (productId: string) => boolean;
  clearCompare: () => void;

  // Wishlist
  wishlist: WishlistItem[];
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (product: Product) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  refreshWishlist: () => Promise<void>;

  // Price Alerts
  priceAlerts: PriceAlert[];
  addPriceAlert: (productId: string, targetPrice: number) => Promise<boolean>;
  deletePriceAlert: (alertId: string) => Promise<void>;
  refreshPriceAlerts: () => Promise<void>;

  // Scanner modal
  isScannerOpen: boolean;
  setIsScannerOpen: (open: boolean) => void;

  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const initialFilters: FilterState = {
  searchQuery: '',
  categoryId: null,
  brandIds: [],
  minPrice: 0,
  maxPrice: 4000,
  minRating: 0,
  inStockOnly: false,
  specFilters: {},
  sortBy: 'featured',
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Current user state
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'usr-customer-1',
    name: 'David Chen',
    email: 'david.chen@example.com',
    role: 'CUSTOMER',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2025-02-10T14:30:00Z',
  });

  const switchUserRole = (role: 'CUSTOMER' | 'ADMIN') => {
    if (role === 'ADMIN') {
      setCurrentUser({
        id: 'usr-admin-1',
        name: 'Alex Vance (Admin)',
        email: 'admin@voltmart.io',
        role: 'ADMIN',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        createdAt: '2025-01-15T09:00:00Z',
      });
      showToast('Switched to Admin Role. Unlocked inventory, pricing & moderation dashboard.', 'info');
    } else {
      setCurrentUser({
        id: 'usr-customer-1',
        name: 'David Chen',
        email: 'david.chen@example.com',
        role: 'CUSTOMER',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        createdAt: '2025-02-10T14:30:00Z',
      });
      showToast('Switched to Customer Role.', 'info');
    }
  };

  // View management
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Meta data
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // Filters
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // Cart & Promo
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('voltmart_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');

  // Compare & Wishlist & Alerts
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);

  // Scanner & Toasts
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Persist cart
  useEffect(() => {
    try {
      localStorage.setItem('voltmart_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Load initial meta & wishlist
  const refreshCatalogMeta = async () => {
    const [catsRes, brandsRes] = await Promise.all([api.getCategories(), api.getBrands()]);
    if (catsRes.success && catsRes.data) setCategories(catsRes.data);
    if (brandsRes.success && brandsRes.data) setBrands(brandsRes.data);
  };

  const refreshWishlist = async () => {
    const res = await api.getWishlist(currentUser.id);
    if (res.success && res.data) setWishlist(res.data);
  };

  const refreshPriceAlerts = async () => {
    const res = await api.getPriceAlerts(currentUser.id);
    if (res.success && res.data) setPriceAlerts(res.data);
  };

  useEffect(() => {
    refreshCatalogMeta();
    refreshWishlist();
    refreshPriceAlerts();
  }, [currentUser.id]);

  // Navigation helpers
  const openProductDetail = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openOrderDetail = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCurrentView('order-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const setCategoryFilter = (categoryId: string | null) => {
    setFilters((prev) => ({ ...prev, categoryId, searchQuery: '' }));
    setCurrentView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      }
      return [...prev, { product, quantity }];
    });
    showToast(`Added "${product.name.slice(0, 35)}..." to cart!`, 'success');
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Removed item from cart', 'info');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartSubtotal = cart.reduce((sum, item) => {
    const price = item.product.salePrice ?? item.product.basePrice;
    return sum + price * item.quantity;
  }, 0);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const discountAmount =
    promoCode.toUpperCase() === 'VOLT10'
      ? cartSubtotal * 0.10
      : promoCode.toUpperCase() === 'SUPERTECH'
      ? Math.min(50, cartSubtotal * 0.2)
      : 0;

  // Comparison list (Max 4 items)
  const addToCompare = (product: Product) => {
    if (compareList.length >= 4) {
      showToast('Comparison limit reached (Max 4 products)', 'error');
      return;
    }
    if (!compareList.some((p) => p.id === product.id)) {
      setCompareList((prev) => [...prev, product]);
      showToast(`Added "${product.name.slice(0, 30)}..." to comparison`, 'success');
    }
  };

  const removeFromCompare = (productId: string) => {
    setCompareList((prev) => prev.filter((p) => p.id !== productId));
  };

  const toggleCompare = (product: Product) => {
    if (isInCompare(product.id)) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  const isInCompare = (productId: string) => compareList.some((p) => p.id === productId);

  const clearCompare = () => setCompareList([]);

  // Wishlist operations
  const addToWishlist = async (product: Product) => {
    const res = await api.addToWishlist(currentUser.id, product.id);
    if (res.success) {
      await refreshWishlist();
      showToast(`Saved "${product.name.slice(0, 30)}..." to Wishlist`, 'success');
    }
  };

  const removeFromWishlist = async (productId: string) => {
    const res = await api.removeFromWishlist(currentUser.id, productId);
    if (res.success) {
      await refreshWishlist();
      showToast('Removed from Wishlist', 'info');
    }
  };

  const toggleWishlist = async (product: Product) => {
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  };

  const isInWishlist = (productId: string) => wishlist.some((w) => w.productId === productId);

  // Price Alerts
  const addPriceAlert = async (productId: string, targetPrice: number) => {
    const res = await api.createPriceAlert(currentUser.id, productId, targetPrice);
    if (res.success) {
      await refreshPriceAlerts();
      showToast(`Price Alert set at $${targetPrice}! We'll notify you when it drops.`, 'success');
      return true;
    }
    showToast(res.error || 'Failed to set price alert', 'error');
    return false;
  };

  const deletePriceAlert = async (alertId: string) => {
    const res = await api.deletePriceAlert(alertId);
    if (res.success) {
      await refreshPriceAlerts();
      showToast('Price alert removed', 'info');
    }
  };

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        switchUserRole,
        currentView,
        setCurrentView,
        selectedProductId,
        openProductDetail,
        selectedOrderId,
        openOrderDetail,
        categories,
        brands,
        refreshCatalogMeta,
        filters,
        setFilters,
        resetFilters,
        setCategoryFilter,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        cartSubtotal,
        cartItemCount,
        promoCode,
        setPromoCode,
        discountAmount,
        compareList,
        addToCompare,
        removeFromCompare,
        toggleCompare,
        isInCompare,
        clearCompare,
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        refreshWishlist,
        priceAlerts,
        addPriceAlert,
        deletePriceAlert,
        refreshPriceAlerts,
        isScannerOpen,
        setIsScannerOpen,
        toasts,
        showToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
