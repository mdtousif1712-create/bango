import React, { useState } from 'react';
import { ArrowUpRight, Cpu, Network, Compass, Sparkles, Database, CheckCircle2 } from 'lucide-react';

interface HowItWorksProps {
  onOpenAlgorithm: () => void;
}

const STEPS = [
  {
    step: '01',
    title: 'Explore & Capture',
    subtitle: 'Citizen Mobility Transactions',
    icon: Compass,
    description:
      'Citizens and visitors navigate Bengaluru across Namma Metro corridors, hospitals, IT corridors, green parks, and commercial streets. Every sequence of urban visits creates an anonymized multi-domain mobility basket.',
    highlight: '1,250+ Transactional Records',
  },
  {
    step: '02',
    title: 'Analyse & Mine',
    subtitle: 'Apriori Association Engine',
    icon: Cpu,
    description:
      'Our FastAPI backend applies the Apriori Algorithm via MLxtend. It scans frequent itemsets that meet minimum support thresholds (≥ 2%) and extracts high-confidence association rules with positive lift (> 1.0x).',
    highlight: 'Support &bull; Confidence &bull; Lift',
  },
  {
    step: '03',
    title: 'Discover & Connect',
    subtitle: 'Cross-Domain Intelligence',
    icon: Network,
    description:
      'Traditional map engines only look at radius distance. Our engine surfaces intelligent cross-sector recommendations—connecting transit nodes to healthcare and parks based on real human mobility trends.',
    highlight: '8 Interconnected Domains',
  },
];

export const HowItWorksSection: React.FC<HowItWorksProps> = ({ onOpenAlgorithm }) => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="how-it-works" className="py-24 bg-[#171717] text-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F02D25] animate-ping"></span>
              <span className="text-xs font-bold uppercase tracking-widest text-[#F02D25]">
                Algorithmic Architecture
              </span>
            </div>
            <h2 className="font-display font-extrabold text-4xl sm:text-6xl md:text-7xl text-white uppercase tracking-tight leading-[0.92]">
              How It <br />
              Works.
            </h2>
          </div>

          <div className="max-w-md">
            <p className="text-sm sm:text-base text-[#ECE9E2]/70 leading-relaxed font-normal mb-4">
              Behind Bengaluru Smart City Discovery is a data-mining engine executing Association Rule Mining (ARM) via the Apriori Algorithm to unlock cross-domain urban patterns.
            </p>
            <button
              onClick={onOpenAlgorithm}
              className="group flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white text-[#191919] hover:bg-[#F5F3EE] text-xs font-bold uppercase tracking-wider transition-all"
            >
              <span>Explore Rule Matrix</span>
              <div className="w-6 h-6 rounded-full bg-[#F02D25] text-white flex items-center justify-center">
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5" />
              </div>
            </button>
          </div>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isSelected = activeStep === idx;

            return (
              <div
                key={s.step}
                onClick={() => setActiveStep(idx)}
                className={`group p-8 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[360px] ${
                  isSelected
                    ? 'bg-[#222222] border-[#F02D25] shadow-2xl'
                    : 'bg-[#1C1C1C] border-white/10 hover:border-white/25 hover:bg-[#202020]'
                }`}
              >
                <div>
                  {/* Step Number & Icon */}
                  <div className="flex items-center justify-between mb-8">
                    <span className="font-display font-extrabold text-3xl sm:text-4xl text-[#F02D25]">
                      {s.step}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-[#F02D25] transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Titles */}
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#ECE9E2]/50">
                    {s.subtitle}
                  </span>
                  <h3 className="font-display font-bold text-2xl text-white uppercase tracking-tight mt-1 mb-4">
                    {s.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-[#ECE9E2]/70 leading-relaxed font-normal">
                    {s.description}
                  </p>
                </div>

                {/* Bottom Highlight Badge */}
                <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-[#F02D25]">
                  <span>{s.highlight}</span>
                  <span className="text-white/40">&rarr;</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Metrics Row */}
        <div className="p-8 rounded-3xl bg-[#222222] border border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="font-display font-black text-3xl sm:text-4xl text-white mb-1">
              1,250+
            </div>
            <div className="text-[11px] uppercase tracking-wider text-[#ECE9E2]/60 font-semibold">
              Mobility Transactions
            </div>
          </div>

          <div>
            <div className="font-display font-black text-3xl sm:text-4xl text-[#F02D25] mb-1">
              80
            </div>
            <div className="text-[11px] uppercase tracking-wider text-[#ECE9E2]/60 font-semibold">
              Bengaluru Smart Hubs
            </div>
          </div>

          <div>
            <div className="font-display font-black text-3xl sm:text-4xl text-white mb-1">
              100+
            </div>
            <div className="text-[11px] uppercase tracking-wider text-[#ECE9E2]/60 font-semibold">
              Mined Apriori Rules
            </div>
          </div>

          <div>
            <div className="font-display font-black text-3xl sm:text-4xl text-[#F02D25] mb-1">
              8
            </div>
            <div className="text-[11px] uppercase tracking-wider text-[#ECE9E2]/60 font-semibold">
              Interconnected Domains
            </div>
          </div>
        </div>

      </div>

      {/* Decorative Background Glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-[#F02D25]/10 rounded-full blur-3xl pointer-events-none"></div>
    </section>
  );
};
