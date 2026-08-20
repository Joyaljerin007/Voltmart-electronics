import React, { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { api } from '../../services/api';
import { Product } from '../../types';
import {
  Scale,
  X,
  Plus,
  ShoppingCart,
  Check,
  Sparkles,
  SlidersHorizontal,
  ArrowRight,
  Eye,
  Trash2,
} from 'lucide-react';

export const CompareView: React.FC = () => {
  const {
    compareList,
    removeFromCompare,
    clearCompare,
    addToCart,
    openProductDetail,
    setCurrentView,
  } = useStore();

  const [comparisonData, setComparisonData] = useState<{
    products: Product[];
    matrix: {
      group: string;
      specs: { name: string; values: Record<string, string>; isDifferent: boolean }[];
    }[];
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [highlightDifferences, setHighlightDifferences] = useState(true);
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);

  useEffect(() => {
    async function loadComparison() {
      if (compareList.length === 0) {
        setComparisonData(null);
        return;
      }
      setLoading(true);
      const res = await api.compareProducts(compareList.map((p) => p.id));
      if (res.success && res.data) {
        setComparisonData(res.data);
      }
      setLoading(false);
    }
    loadComparison();
  }, [compareList]);

  if (compareList.length === 0) {
    return (
      <div id="empty-compare-view" className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-4 max-w-2xl mx-auto my-8">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 text-amber-400 flex items-center justify-center mx-auto">
          <Scale className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Compare Matrix is Empty</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Select between 2 and 4 products from the catalog to generate an aligned, grouped hardware specification comparison matrix.
        </p>
        <button
          onClick={() => setCurrentView('catalog')}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-5 py-3 rounded-xl transition-colors inline-flex items-center gap-2 shadow-lg shadow-blue-600/20"
        >
          <span>Browse Electronics to Compare</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div id="compare-view" className="space-y-6 pb-20">
      {/* Top Header & Comparison Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Hardware Comparison Matrix</span>
              <span className="text-xs bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded-full">
                {compareList.length} of 4 Selected
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Aligned side-by-side specifications across silicon, display panels, dimensions, and battery life.
            </p>
          </div>
        </div>

        {/* Action Toggles */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 select-none">
            <input
              type="checkbox"
              checked={highlightDifferences}
              onChange={(e) => setHighlightDifferences(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-600 focus:ring-0"
            />
            <span className="font-semibold">Highlight Differences</span>
          </label>

          <label className="flex items-center gap-2 text-slate-300 cursor-pointer bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 select-none">
            <input
              type="checkbox"
              checked={showOnlyDifferences}
              onChange={(e) => setShowOnlyDifferences(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-600 focus:ring-0"
            />
            <span className="font-semibold">Show Only Differences</span>
          </label>

          <button
            onClick={clearCompare}
            className="text-xs text-rose-400 hover:text-rose-300 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 font-semibold flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Comparison Grid Table */}
      {loading || !comparisonData ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs">Aligning specification matrix...</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              {/* Product Header Cards Row */}
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950">
                  <th className="p-4 sm:p-6 w-56 text-xs uppercase tracking-wider text-slate-400 font-bold align-top">
                    Product Summary
                  </th>
                  {comparisonData.products.map((p) => {
                    const price = p.salePrice ?? p.basePrice;
                    return (
                      <th key={p.id} className="p-4 sm:p-6 min-w-[240px] max-w-[280px] align-top">
                        <div className="space-y-3">
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                            <img
                              src={p.images[0]?.imageUrl}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => removeFromCompare(p.id)}
                              className="absolute top-2 right-2 bg-slate-950/80 hover:bg-rose-600 text-slate-300 hover:text-white p-1 rounded-lg backdrop-blur transition-colors"
                              title="Remove from comparison"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-[11px] text-blue-400 font-semibold">{p.brand?.name}</div>
                          <h4
                            onClick={() => openProductDetail(p.id)}
                            className="text-xs font-bold text-white hover:text-blue-400 cursor-pointer line-clamp-2 transition-colors"
                          >
                            {p.name}
                          </h4>

                          <div className="text-base font-black text-white">${price.toFixed(2)}</div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => addToCart(p)}
                              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1 transition-colors"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>Add to Cart</span>
                            </button>
                            <button
                              onClick={() => openProductDetail(p.id)}
                              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Grouped Specification Rows */}
              <tbody className="divide-y divide-slate-800 text-xs">
                {comparisonData.matrix.map((groupObj) => {
                  const filteredSpecs = showOnlyDifferences
                    ? groupObj.specs.filter((s) => s.isDifferent)
                    : groupObj.specs;

                  if (filteredSpecs.length === 0) return null;

                  return (
                    <React.Fragment key={groupObj.group}>
                      {/* Section Group Header */}
                      <tr className="bg-slate-850/80 border-t-2 border-slate-800">
                        <td
                          colSpan={comparisonData.products.length + 1}
                          className="px-4 sm:px-6 py-2.5 font-bold text-xs text-blue-400 uppercase tracking-wider"
                        >
                          {groupObj.group}
                        </td>
                      </tr>

                      {/* Spec Rows */}
                      {filteredSpecs.map((spec) => {
                        const isDiff = spec.isDifferent;
                        return (
                          <tr
                            key={spec.name}
                            className={`hover:bg-slate-850/50 transition-colors ${
                              highlightDifferences && isDiff
                                ? 'bg-amber-500/5'
                                : ''
                            }`}
                          >
                            <td className="px-4 sm:px-6 py-3 font-semibold text-slate-300 flex items-center gap-2">
                              <span>{spec.name}</span>
                              {highlightDifferences && isDiff && (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Values differ" />
                              )}
                            </td>
                            {comparisonData.products.map((p) => (
                              <td
                                key={p.id}
                                className={`px-4 sm:px-6 py-3 font-mono ${
                                  highlightDifferences && isDiff
                                    ? 'text-amber-200 font-medium'
                                    : 'text-slate-200'
                                }`}
                              >
                                {spec.values[p.id] || 'N/A'}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
