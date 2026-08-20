import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomeView } from './components/home/HomeView';
import { CatalogView } from './components/catalog/CatalogView';
import { ProductDetailView } from './components/product/ProductDetailView';
import { CompareView } from './components/compare/CompareView';
import { WishlistView } from './components/wishlist/WishlistView';
import { CheckoutView } from './components/cart/CheckoutView';
import { OrdersView } from './components/orders/OrdersView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ApiDocsView } from './components/docs/ApiDocsView';
import { CartDrawer } from './components/cart/CartDrawer';
import { BarcodeScannerModal } from './components/scanner/BarcodeScannerModal';

const MainContent: React.FC = () => {
  const { currentView } = useStore();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      {currentView === 'home' && <HomeView />}
      {currentView === 'catalog' && <CatalogView />}
      {currentView === 'detail' && <ProductDetailView />}
      {currentView === 'compare' && <CompareView />}
      {currentView === 'wishlist' && <WishlistView />}
      {currentView === 'checkout' && <CheckoutView />}
      {currentView === 'orders' && <OrdersView />}
      {currentView === 'admin' && <AdminDashboard />}
      {currentView === 'api-docs' && <ApiDocsView />}
    </main>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white antialiased">
        <Navbar />
        <div className="flex-1">
          <MainContent />
        </div>
        <Footer />
        <CartDrawer />
        <BarcodeScannerModal />
      </div>
    </StoreProvider>
  );
}
