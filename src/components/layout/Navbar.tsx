import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Search,
  ShoppingCart,
  Heart,
  Scale,
  User,
  ShieldCheck,
  QrCode,
  FileCode,
  Package,
  Layers,
  Sparkles,
  ChevronDown,
  X,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    switchUserRole,
    currentView,
    setCurrentView,
    cartItemCount,
    setIsCartDrawerOpen,
    compareList,
    wishlist,
    categories,
    setCategoryFilter,
    filters,
    setFilters,
    setIsScannerOpen,
  } = useStore();

  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, searchQuery: searchInput }));
    setCurrentView('catalog');
  };

  const clearSearch = () => {
    setSearchInput('');
    setFilters((prev) => ({ ...prev, searchQuery: '' }));
  };

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      {/* Top Banner Notice */}
      <div id="top-announcement-bar" className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-xs py-1.5 px-4 text-center text-white flex items-center justify-between">
        <div className="flex items-center gap-2 mx-auto">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
          <span className="font-medium">Special Spring Tech Event: Use code <strong className="bg-white/20 px-1.5 py-0.5 rounded font-mono tracking-wide">VOLT10</strong> for 10% off all flagship laptops & monitors!</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-slate-200 text-xs">
          <span>Free Express Shipping $500+</span>
          <span>•</span>
          <span>2-Year Full Hardware Warranty</span>
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Category Button */}
          <div className="flex items-center gap-4">
            <button
              id="brand-logo-btn"
              onClick={() => {
                setFilters((prev) => ({ ...prev, searchQuery: '', categoryId: null }));
                setCurrentView('home');
              }}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
                  Volt<span className="text-blue-400">Mart</span>
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block -mt-1 font-semibold">
                  Electronics Catalog & E-Commerce
                </span>
              </div>
            </button>

            {/* Category Dropdown Trigger */}
            <div className="relative hidden lg:block">
              <button
                id="category-menu-trigger"
                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isCategoryMenuOpen ? 'bg-slate-800 text-blue-400' : 'bg-slate-800/60 hover:bg-slate-800 text-slate-200'
                }`}
              >
                <span>Categories</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Mega Dropdown */}
              {isCategoryMenuOpen && (
                <div
                  id="category-mega-dropdown"
                  className="absolute left-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2"
                >
                  <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    Product Categories
                  </div>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setCategoryFilter(cat.id);
                        setIsCategoryMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-800 flex items-center justify-between text-sm text-slate-200 hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <img src={cat.imageUrl} alt={cat.name} className="w-6 h-6 rounded object-cover" />
                        <span>{cat.name}</span>
                      </div>
                      <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                        {cat.productCount || 0}
                      </span>
                    </button>
                  ))}
                  <div className="border-t border-slate-800 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setCategoryFilter(null);
                        setIsCategoryMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-800 text-xs text-blue-400 font-semibold"
                    >
                      View All Electronics →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                id="global-search-input"
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search laptops, RTX 4090, 4K OLED, Sony XM5, SKU, or specs..."
                className="w-full bg-slate-800/90 text-white placeholder-slate-400 text-sm rounded-xl pl-10 pr-20 py-2.5 border border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-10 top-3 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                id="search-submit-btn"
                className="absolute right-1.5 top-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
              >
                Search
              </button>
            </form>
          </div>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Barcode Scanner Modal Trigger */}
            <button
              id="navbar-barcode-scanner-btn"
              onClick={() => setIsScannerOpen(true)}
              title="Scan Product Barcode or QR Code"
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors relative"
            >
              <QrCode className="w-5 h-5 text-emerald-400" />
            </button>

            {/* Compare Badge */}
            <button
              id="navbar-compare-btn"
              onClick={() => setCurrentView('compare')}
              className={`p-2 rounded-lg transition-colors relative ${
                currentView === 'compare' ? 'bg-blue-600 text-white' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Side-by-Side Product Comparison"
            >
              <Scale className="w-5 h-5" />
              {compareList.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900">
                  {compareList.length}
                </span>
              )}
            </button>

            {/* Wishlist Badge */}
            <button
              id="navbar-wishlist-btn"
              onClick={() => setCurrentView('wishlist')}
              className={`p-2 rounded-lg transition-colors relative ${
                currentView === 'wishlist' ? 'bg-rose-600 text-white' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Saved Wishlist & Price Alerts"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              id="navbar-cart-btn"
              onClick={() => setIsCartDrawerOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline">Cart</span>
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs font-bold">
                {cartItemCount}
              </span>
            </button>

            {/* User Role Switcher */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
              <button
                id="role-toggle-btn"
                onClick={() => switchUserRole(currentUser.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN')}
                className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
                  currentUser.role === 'ADMIN'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
                title="Switch between Customer and Admin role to test full workflows"
              >
                {currentUser.role === 'ADMIN' ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Admin</span>
                  </>
                ) : (
                  <>
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <span>Customer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Sub-Navbar Links */}
        <div className="flex items-center justify-between py-2 border-t border-slate-800/80 text-xs overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-5 whitespace-nowrap">
            <button
              onClick={() => {
                setFilters((prev) => ({ ...prev, categoryId: null, searchQuery: '' }));
                setCurrentView('catalog');
              }}
              className={`font-medium hover:text-blue-400 transition-colors ${
                currentView === 'catalog' ? 'text-blue-400 font-bold' : 'text-slate-300'
              }`}
            >
              All Products
            </button>
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`font-medium hover:text-blue-400 transition-colors ${
                  filters.categoryId === cat.id && currentView === 'catalog'
                    ? 'text-blue-400 font-bold'
                    : 'text-slate-400'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 ml-4 whitespace-nowrap">
            <button
              id="nav-orders-link"
              onClick={() => setCurrentView('orders')}
              className={`flex items-center gap-1.5 hover:text-white transition-colors ${
                currentView === 'orders' ? 'text-blue-400 font-bold' : 'text-slate-300'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-slate-400" />
              <span>Order Tracking</span>
            </button>

            <button
              id="nav-api-docs-link"
              onClick={() => setCurrentView('api-docs')}
              className={`flex items-center gap-1.5 hover:text-white transition-colors ${
                currentView === 'api-docs' ? 'text-indigo-400 font-bold' : 'text-slate-300'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-400" />
              <span>OpenAPI / Swagger</span>
            </button>

            {currentUser.role === 'ADMIN' && (
              <button
                id="nav-admin-dashboard-link"
                onClick={() => setCurrentView('admin')}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded font-bold transition-colors ${
                  currentView === 'admin'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Console</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
