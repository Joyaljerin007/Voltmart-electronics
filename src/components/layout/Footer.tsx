import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Layers, ShieldCheck, Database, FileCode, Cpu, RotateCcw, Truck, Headphones } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentView, setCategoryFilter, categories } = useStore();

  const handleDownloadSchema = () => {
    window.location.href = '/api/v1/admin/schema?download=true';
  };

  return (
    <footer id="app-footer" className="bg-slate-950 text-slate-400 border-t border-slate-800 text-sm mt-auto">
      {/* Service Highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-slate-800/80">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Free Express Shipping</h4>
              <p className="text-xs text-slate-400">On all electronics orders over $500</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">2-Year VoltCare Warranty</h4>
              <p className="text-xs text-slate-400">Comprehensive hardware protection</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">30-Day Hassle-Free Returns</h4>
              <p className="text-xs text-slate-400">100% money-back guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">24/7 Tech Concierge</h4>
              <p className="text-xs text-slate-400">Direct support from certified engineers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Stack Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">VoltMart</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full-Stack Electronics Catalog & E-Commerce Platform featuring high-performance hardware, dynamic spec comparison, real-time price tracking, and order lifecycle management.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-slate-400">
              <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded">React 18+</span>
              <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded">TypeScript</span>
              <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded">Spring Boot 3 DTOs</span>
              <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded">MySQL 8.x DDL</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h5 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Categories</h5>
            <ul className="space-y-2 text-xs">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => setCategoryFilter(cat.id)}
                    className="hover:text-blue-400 transition-colors"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Developer & Platform */}
          <div>
            <h5 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Engineering & API</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setCurrentView('api-docs')}
                  className="hover:text-blue-400 transition-colors flex items-center gap-1.5"
                >
                  <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Interactive Swagger / OpenAPI 3.0</span>
                </button>
              </li>
              <li>
                <button
                  onClick={handleDownloadSchema}
                  className="hover:text-blue-400 transition-colors flex items-center gap-1.5"
                >
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download MySQL 8.x Flyway DDL</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('compare')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Side-by-Side Product Comparison
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('orders')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Real-Time Order Tracking Timeline
                </button>
              </li>
            </ul>
          </div>

          {/* Architecture & Tech Specs */}
          <div>
            <h5 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Database & Architecture</h5>
            <div className="text-xs space-y-2 text-slate-400">
              <p>• Normalized schema with 13 entity tables (products, specs, price history, reviews, orders, documents).</p>
              <p>• Spring Security JWT role-based access control with customer/admin claims.</p>
              <p>• Dynamic specification facet filtering across CPU, GPU, RAM, OLED panels & refresh rates.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>© {new Date().getFullYear()} VoltMart Electronics Platform. Built with React, TypeScript, and modern REST APIs.</div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Status: <strong className="text-emerald-400 font-normal">All API Endpoints Healthy (v1.0.0)</strong></span>
          </div>
        </div>
      </div>
    </footer>
  );
};
