import React, { useEffect, useState } from 'react';
import { AssociationRule, AnalyticsSummary } from '../types';
import { fetchAssociationRules, fetchAnalyticsSummary, retrainAprioriAlgorithm } from '../services/api';
import { X, Cpu, Sparkles, Sliders, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';

interface AlgorithmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetrained: () => void;
}

export const AlgorithmModal: React.FC<AlgorithmModalProps> = ({ isOpen, onClose, onRetrained }) => {
  const [rules, setRules] = useState<AssociationRule[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRetraining, setIsRetraining] = useState(false);

  // Parameter sliders
  const [minSupport, setMinSupport] = useState<number>(0.02);
  const [minConfidence, setMinConfidence] = useState<number>(0.30);
  const [minLift, setMinLift] = useState<number>(1.0);
  const [searchFilter, setSearchFilter] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rulesData, summaryData] = await Promise.all([
        fetchAssociationRules(200),
        fetchAnalyticsSummary()
      ]);
      setRules(rulesData.rules || []);
      setSummary(summaryData);
      if (summaryData.parameters) {
        setMinSupport(summaryData.parameters.min_support);
        setMinConfidence(summaryData.parameters.min_confidence);
        setMinLift(summaryData.parameters.min_lift);
      }
    } catch (err) {
      console.error('Failed to load algorithm data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleRetrain = async () => {
    setIsRetraining(true);
    try {
      await retrainAprioriAlgorithm({
        min_support: minSupport,
        min_confidence: minConfidence,
        min_lift: minLift
      });
      await loadData();
      onRetrained();
    } catch (err) {
      console.error('Retrain failed:', err);
    } finally {
      setIsRetraining(false);
    }
  };

  if (!isOpen) return null;

  const filteredRules = rules.filter((r) => {
    const q = searchFilter.toLowerCase();
    return (
      r.antecedents.some((a) => a.toLowerCase().includes(q)) ||
      r.consequents.some((c) => c.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-[#E8EBF0] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8EBF0] flex items-center justify-between shrink-0 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5681EB]/10 text-[#5681EB] flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#171B24]">
                  Apriori Association Mining Engine
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  MLxtend Backend Engine
                </span>
              </div>
              <p className="text-xs text-[#777F8B]">
                Discovering frequent itemsets & generating association rules across Bengaluru smart city mobility datasets.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#777F8B] hover:text-[#171B24] hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary Metrics Bar */}
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-[#E8EBF0]">
                <span className="text-[11px] font-semibold text-[#777F8B]">Transactions Mined</span>
                <p className="text-xl font-bold text-[#171B24] mt-0.5">
                  {summary.total_transactions.toLocaleString()}
                </p>
                <span className="text-[10px] text-[#5681EB]">Mobility journeys</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-[#E8EBF0]">
                <span className="text-[11px] font-semibold text-[#777F8B]">Frequent Itemsets</span>
                <p className="text-xl font-bold text-[#171B24] mt-0.5">
                  {summary.frequent_itemsets_count}
                </p>
                <span className="text-[10px] text-emerald-600">Above min_support</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-[#E8EBF0]">
                <span className="text-[11px] font-semibold text-[#777F8B]">Rules Generated</span>
                <p className="text-xl font-bold text-[#171B24] mt-0.5">
                  {summary.total_rules_generated}
                </p>
                <span className="text-[10px] text-indigo-600">Confidence ≥ 30%</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-[#E8EBF0]">
                <span className="text-[11px] font-semibold text-[#777F8B]">Avg Rule Confidence</span>
                <p className="text-xl font-bold text-[#171B24] mt-0.5">
                  {(summary.average_confidence * 100).toFixed(1)}%
                </p>
                <span className="text-[10px] text-amber-600">High predictive power</span>
              </div>
            </div>
          )}

          {/* Synthetic Data Transparency Notice */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 leading-relaxed">
            <ShieldCheck className="w-5 h-5 text-[#5681EB] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#171B24]">Algorithm Transparency & Integrity Notice</p>
              <p className="text-[#777F8B] text-[11px] mt-0.5">
                The recommendations in this application are derived directly by executing Python's <code className="bg-blue-100 text-[#3F6FDB] px-1 py-0.5 rounded">mlxtend.frequent_patterns.apriori</code> and <code className="bg-blue-100 text-[#3F6FDB] px-1 py-0.5 rounded">association_rules</code> algorithms over 1,250 reproducible smart city mobility transactions. No recommendations are simulated or hardcoded.
              </p>
            </div>
          </div>

          {/* Interactive Parameter Tuning Panel */}
          <div className="p-4 rounded-xl bg-slate-50 border border-[#E8EBF0]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#5681EB]" />
                <h4 className="text-xs font-bold text-[#171B24] uppercase tracking-wider">
                  Configurable Algorithm Thresholds
                </h4>
              </div>

              <button
                onClick={handleRetrain}
                disabled={isRetraining}
                className="px-3.5 py-1.5 rounded-lg bg-[#5681EB] hover:bg-[#3F6FDB] text-white text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRetraining ? 'animate-spin' : ''}`} />
                <span>{isRetraining ? 'Mining...' : 'Retrain Engine'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <div className="flex justify-between text-xs font-medium text-[#171B24] mb-1">
                  <span>Minimum Support</span>
                  <span className="font-bold text-[#5681EB]">{(minSupport * 100).toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.10"
                  step="0.005"
                  value={minSupport}
                  onChange={(e) => setMinSupport(parseFloat(e.target.value))}
                  className="w-full accent-[#5681EB]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-[#171B24] mb-1">
                  <span>Minimum Confidence</span>
                  <span className="font-bold text-[#5681EB]">{(minConfidence * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.90"
                  step="0.05"
                  value={minConfidence}
                  onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
                  className="w-full accent-[#5681EB]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-[#171B24] mb-1">
                  <span>Minimum Lift</span>
                  <span className="font-bold text-[#5681EB]">{minLift.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="20.0"
                  step="0.5"
                  value={minLift}
                  onChange={(e) => setMinLift(parseFloat(e.target.value))}
                  className="w-full accent-[#5681EB]"
                />
              </div>
            </div>
          </div>

          {/* Association Rules Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-[#171B24] uppercase tracking-wider">
                Generated Association Rules ({filteredRules.length})
              </h4>

              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter rules by place name..."
                className="px-3 py-1 text-xs border border-[#E8EBF0] rounded-lg outline-none focus:border-[#5681EB] w-56"
              />
            </div>

            <div className="border border-[#E8EBF0] rounded-xl overflow-hidden shadow-2xs">
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-[#777F8B] font-semibold sticky top-0 border-b border-[#E8EBF0]">
                    <tr>
                      <th className="py-2.5 px-3">Rule ID</th>
                      <th className="py-2.5 px-3">Antecedents (If visited)</th>
                      <th className="py-2.5 px-3">Consequents (Then recommends)</th>
                      <th className="py-2.5 px-3 text-right">Support</th>
                      <th className="py-2.5 px-3 text-right">Confidence</th>
                      <th className="py-2.5 px-3 text-right">Lift</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8EBF0]">
                    {filteredRules.map((rule) => (
                      <tr key={rule.rule_id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 font-mono text-[11px] text-[#777F8B]">
                          {rule.rule_id}
                        </td>
                        <td className="py-2 px-3 font-medium text-[#171B24]">
                          {rule.antecedents.join(', ')}
                        </td>
                        <td className="py-2 px-3 font-medium text-[#5681EB]">
                          {rule.consequents.join(', ')}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-[11px] text-[#777F8B]">
                          {(rule.support * 100).toFixed(1)}%
                        </td>
                        <td className="py-2 px-3 text-right font-semibold text-emerald-600">
                          {(rule.confidence * 100).toFixed(1)}%
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-indigo-600">
                          {rule.lift.toFixed(2)}x
                        </td>
                      </tr>
                    ))}
                    {filteredRules.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-[#777F8B]">
                          No rules match your filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E8EBF0] bg-slate-50 flex items-center justify-between text-xs text-[#777F8B] shrink-0">
          <span>Formula: Confidence = Support(X ∪ Y) / Support(X) | Lift = Confidence / Support(Y)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-[#171B24] font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
