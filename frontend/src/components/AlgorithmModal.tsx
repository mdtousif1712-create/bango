import React, { useEffect, useState } from 'react';
import { AssociationRule, AnalyticsSummary } from '../types';
import { fetchAssociationRules, fetchAnalyticsSummary, retrainAprioriAlgorithm } from '../services/api';
import { X, Cpu, Sliders, RefreshCw, CheckCircle2, Search, ArrowRight } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 font-sans">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-[#E3DFD7] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E3DFD7] flex items-center justify-between shrink-0 bg-[#F5F3EE]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#191919] text-white flex items-center justify-center">
              <Cpu className="w-5 h-5 text-[#F02D25]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-lg text-[#191919] uppercase tracking-tight">
                  Apriori Association Engine
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-white text-[#F02D25] text-[10px] font-bold border border-[#E3DFD7] flex items-center gap-1 uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3 text-[#F02D25]" />
                  MLxtend Backend
                </span>
              </div>
              <p className="text-xs text-[#77736D]">
                Mining transactional co-occurrences across Bengaluru smart city mobility datasets.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#77736D] hover:text-[#191919] hover:bg-[#ECE9E2] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#F5F3EE] border border-[#E3DFD7]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#77736D]">
                  Mobility Records
                </span>
                <p className="font-display font-black text-2xl text-[#191919] mt-0.5">
                  {summary.total_transactions.toLocaleString()}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F5F3EE] border border-[#E3DFD7]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#77736D]">
                  Frequent Itemsets
                </span>
                <p className="font-display font-black text-2xl text-[#191919] mt-0.5">
                  {summary.frequent_itemsets_count}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F5F3EE] border border-[#E3DFD7]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#77736D]">
                  Active Rules
                </span>
                <p className="font-display font-black text-2xl text-[#F02D25] mt-0.5">
                  {summary.total_rules_generated}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F5F3EE] border border-[#E3DFD7]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#77736D]">
                  Avg Confidence
                </span>
                <p className="font-display font-black text-2xl text-[#191919] mt-0.5">
                  {(summary.average_confidence * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          )}

          {/* Hyperparameter Controls */}
          <div className="p-5 rounded-2xl bg-[#ECE9E2]/60 border border-[#E3DFD7] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#F02D25]" />
                <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#191919]">
                  Tune Apriori Hyperparameters
                </h4>
              </div>

              <button
                onClick={handleRetrain}
                disabled={isRetraining}
                className="px-4 py-2 rounded-full bg-[#191919] hover:bg-[#F02D25] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 transition-colors shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRetraining ? 'animate-spin' : ''}`} />
                <span>{isRetraining ? 'Retraining...' : 'Re-Mine Rules'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#77736D] font-medium">Min Support:</span>
                  <span className="font-bold text-[#191919]">{(minSupport * 100).toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.10"
                  step="0.005"
                  value={minSupport}
                  onChange={(e) => setMinSupport(parseFloat(e.target.value))}
                  className="w-full accent-[#F02D25] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#77736D] font-medium">Min Confidence:</span>
                  <span className="font-bold text-[#191919]">{(minConfidence * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.80"
                  step="0.05"
                  value={minConfidence}
                  onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
                  className="w-full accent-[#F02D25] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#77736D] font-medium">Min Lift:</span>
                  <span className="font-bold text-[#191919]">{minLift.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.1"
                  value={minLift}
                  onChange={(e) => setMinLift(parseFloat(e.target.value))}
                  className="w-full accent-[#F02D25] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Association Rules Explorer */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#191919]">
                Generated Association Rules ({filteredRules.length})
              </h4>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#77736D] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter rules by place name..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-full bg-[#F5F3EE] border border-[#E3DFD7] text-xs text-[#191919] outline-none focus:border-[#F02D25]"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-xs text-[#77736D]">
                Loading mined association rules...
              </div>
            ) : filteredRules.length > 0 ? (
              <div className="border border-[#E3DFD7] rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F5F3EE] text-[#77736D] uppercase text-[10px] font-bold border-b border-[#E3DFD7] sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Antecedent (If Visited)</th>
                      <th className="py-2.5 px-3"></th>
                      <th className="py-2.5 px-3">Consequent (Likely Next)</th>
                      <th className="py-2.5 px-3 text-right">Support</th>
                      <th className="py-2.5 px-3 text-right">Confidence</th>
                      <th className="py-2.5 px-3 text-right">Lift</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3DFD7]">
                    {filteredRules.map((rule, idx) => (
                      <tr key={idx} className="hover:bg-[#F5F3EE]/50 transition-colors">
                        <td className="py-2 px-3 font-semibold text-[#191919]">
                          {rule.antecedents.join(', ')}
                        </td>
                        <td className="py-2 px-1 text-[#F02D25]">
                          <ArrowRight className="w-3 h-3" />
                        </td>
                        <td className="py-2 px-3 font-semibold text-[#191919]">
                          {rule.consequents.join(', ')}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-[#77736D]">
                          {(rule.support * 100).toFixed(1)}%
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-[#191919]">
                          {(rule.confidence * 100).toFixed(0)}%
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-[#F02D25]">
                          {rule.lift.toFixed(2)}x
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#77736D] bg-[#F5F3EE] rounded-2xl">
                No association rules match your search filter.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F5F3EE] border-t border-[#E3DFD7] flex items-center justify-between text-xs text-[#77736D]">
          <span>Mathematical Model: Support(A &cup; B) / Support(A) = Confidence</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#191919] hover:bg-[#2A2A2A] text-white font-bold uppercase tracking-wider text-[11px] transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
