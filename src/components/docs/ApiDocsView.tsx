import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  FileCode,
  Copy,
  Check,
  Play,
  Download,
  Database,
  Lock,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const ApiDocsView: React.FC = () => {
  const { showToast } = useStore();
  const [activeTab, setActiveTab] = useState<'endpoints' | 'raw_spec'>('endpoints');
  const [copied, setCopied] = useState(false);
  const [testResponses, setTestResponses] = useState<Record<string, { status: number; data: any }>>({});
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null);

  const endpoints = [
    {
      method: 'GET',
      path: '/api/v1/catalog/products',
      summary: 'Query & filter catalog products with multi-faceted hardware filters',
      params: '?categoryId=cat-1&minPrice=1000&maxPrice=3000&sortBy=featured&page=1&limit=6',
      testUrl: '/api/v1/catalog/products?limit=3',
      description: 'Returns paginated products matching category, brands, price boundaries, in-stock switches, and hardware specification facets.',
    },
    {
      method: 'GET',
      path: '/api/v1/catalog/products/{id}',
      summary: 'Get single product details with full specs, price history, reviews, and faqs',
      params: '/prod-1',
      testUrl: '/api/v1/catalog/products/prod-1',
      description: 'Retrieves complete entity graph for a hardware SKU including specifications grouped by section and historical price log points.',
    },
    {
      method: 'GET',
      path: '/api/v1/catalog/compare',
      summary: 'Generate side-by-side aligned specification comparison matrix',
      params: '?productIds=prod-1,prod-2',
      testUrl: '/api/v1/catalog/compare?productIds=prod-1,prod-2',
      description: 'Normalizes and aligns technical specifications across 2 to 4 products with difference flags for easy comparative evaluation.',
    },
    {
      method: 'GET',
      path: '/api/v1/barcode/{code}',
      summary: 'Instant barcode / UPC optical scanner lookup',
      params: '/190199438210',
      testUrl: '/api/v1/barcode/190199438210',
      description: 'Searches UPC barcode and SKU indices to resolve an exact product match for camera scanner viewfinders.',
    },
    {
      method: 'POST',
      path: '/api/v1/orders',
      summary: 'Create and place a new hardware order with inventory deduction',
      params: '',
      testUrl: '/api/v1/orders',
      testMethod: 'POST',
      testBody: {
        userId: 'user-1',
        userName: 'Alex Chen',
        userEmail: 'alex.chen@enterprise.io',
        items: [{ productId: 'prod-1', quantity: 1, unitPrice: 3499.0 }],
        shippingAddress: '450 Silicon Way, San Jose CA 95112',
        paymentMethod: 'CREDIT_CARD',
      },
      description: 'Processes payment authorization, validates stock levels, updates inventory, and creates an order lifecycle record.',
    },
    {
      method: 'GET',
      path: '/api/v1/orders',
      summary: 'List customer or admin orders with fulfillment milestones',
      params: '?userId=user-1',
      testUrl: '/api/v1/orders',
      description: 'Fetches order records with tracking numbers, line items, and fulfillment statuses.',
    },
    {
      method: 'GET',
      path: '/api/v1/admin/analytics',
      summary: 'Retrieve admin KPI metrics and inventory analytics',
      params: '',
      testUrl: '/api/v1/admin/analytics',
      description: 'Aggregates billed revenue, total active orders, product counts, and low-stock threshold triggers.',
    },
    {
      method: 'GET',
      path: '/api/v1/admin/schema',
      summary: 'Retrieve production MySQL 8.x Flyway DDL script',
      params: '?download=false',
      testUrl: '/api/v1/admin/schema',
      description: 'Returns complete SQL DDL schema containing 13 entity tables, foreign keys, and composite indexes.',
    },
  ];

  const handleTestEndpoint = async (ep: (typeof endpoints)[0]) => {
    setTestingEndpoint(ep.path);
    try {
      const options: RequestInit = {
        method: ep.testMethod || 'GET',
        headers: { 'Content-Type': 'application/json' },
      };
      if (ep.testBody) {
        options.body = JSON.stringify(ep.testBody);
      }

      const res = await fetch(ep.testUrl, options);
      const json = await res.json();
      setTestResponses((prev) => ({
        ...prev,
        [ep.path]: { status: res.status, data: json },
      }));
    } catch (err: any) {
      setTestResponses((prev) => ({
        ...prev,
        [ep.path]: { status: 500, data: { error: err.message } },
      }));
    }
    setTestingEndpoint(null);
  };

  const handleCopySpec = async () => {
    try {
      const res = await fetch('/api/v1/docs/openapi.json');
      const spec = await res.text();
      await navigator.clipboard.writeText(spec);
      setCopied(true);
      showToast('OpenAPI 3.0 specification copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      showToast('Failed to copy spec', 'error');
    }
  };

  return (
    <div id="api-docs-view" className="space-y-8 pb-20">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>OpenAPI 3.0 / Swagger Interactive API</span>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 font-mono px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                v1.0.0 Spec
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Spring Boot 3 REST controller signatures, DTOs, and real-time interactive endpoint test runner.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySpec}
            className="bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>Copy OpenAPI Spec</span>
          </button>

          <a
            href="/api/v1/admin/schema?download=true"
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Database className="w-4 h-4" />
            <span>MySQL Schema DDL</span>
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/60 p-2 rounded-2xl gap-2">
        <button
          onClick={() => setActiveTab('endpoints')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
            activeTab === 'endpoints' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Play className="w-4 h-4" />
          <span>Interactive Test Runner ({endpoints.length} Endpoints)</span>
        </button>
        <button
          onClick={() => setActiveTab('raw_spec')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
            activeTab === 'raw_spec' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Raw OpenAPI JSON</span>
        </button>
      </div>

      {/* TAB 1: Interactive Endpoints */}
      {activeTab === 'endpoints' && (
        <div className="space-y-4">
          {endpoints.map((ep) => {
            const isTesting = testingEndpoint === ep.path;
            const resData = testResponses[ep.path];

            return (
              <div
                key={ep.path}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className={`text-xs font-mono font-bold px-3 py-1 rounded-lg ${
                        ep.method === 'GET'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-sm font-bold text-white">{ep.path}</span>
                  </div>

                  <button
                    onClick={() => handleTestEndpoint(ep)}
                    disabled={isTesting}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-md shadow-blue-600/20"
                  >
                    {isTesting ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                    <span>Execute "Try It Out"</span>
                  </button>
                </div>

                <p className="text-xs text-slate-300">{ep.summary}</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">{ep.description}</p>

                {/* Live Response Panel */}
                {resData && (
                  <div className="space-y-2 pt-2 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-400">Server Response:</span>
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded ${
                          resData.status >= 200 && resData.status < 300
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        HTTP {resData.status} OK
                      </span>
                    </div>
                    <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-300/90 overflow-x-auto max-h-60 leading-relaxed shadow-inner">
                      {JSON.stringify(resData.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: Raw OpenAPI Spec JSON */}
      {activeTab === 'raw_spec' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-white">Full OpenAPI 3.0 Specification</h3>
            <button
              onClick={handleCopySpec}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy JSON</span>
            </button>
          </div>
          <pre className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-xs font-mono text-indigo-300/90 overflow-x-auto max-h-[500px] leading-relaxed shadow-inner">
            {`{
  "openapi": "3.0.3",
  "info": {
    "title": "VoltMart Electronics Catalog & E-Commerce REST API",
    "version": "1.0.0",
    "description": "High-performance Spring Boot 3 & Express REST API with specification facets, price tracking, and order lifecycle management."
  },
  "servers": [{ "url": "/api/v1", "description": "Production Server" }],
  "paths": {
    "/catalog/products": { "get": { "summary": "Query and filter products" } },
    "/catalog/products/{id}": { "get": { "summary": "Get product by ID" } },
    "/catalog/compare": { "get": { "summary": "Compare product specifications" } },
    "/barcode/{code}": { "get": { "summary": "Optical barcode lookup" } },
    "/orders": { "post": { "summary": "Create order" }, "get": { "summary": "List orders" } },
    "/admin/analytics": { "get": { "summary": "KPI analytics" } },
    "/admin/schema": { "get": { "summary": "MySQL 8.x DDL script" } }
  }
}`}
          </pre>
        </div>
      )}
    </div>
  );
};
