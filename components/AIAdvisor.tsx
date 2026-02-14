import React, { useState, useEffect } from 'react';
import { generateFinancialInsights } from '../services/geminiService';
import { ClientProfile } from '../types';
import { Sparkles, Loader2, X } from 'lucide-react';

interface AIAdvisorProps {
  profile: ClientProfile;
  context: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ profile, context, isOpen, onClose }) => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      generateFinancialInsights(profile, context)
        .then(text => setInsight(text))
        .catch(() => setInsight("Failed to load insights."))
        .finally(() => setLoading(false));
    }
  }, [isOpen, context, profile]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-slate-200 z-50 flex flex-col">
      <div className="p-4 bg-slate-900 text-white flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-400" />
          <h3 className="font-semibold text-lg">AI Wealth Advisor</h3>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
        <div className="mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Context</span>
          <p className="text-sm font-medium text-slate-800 mt-1">{context}</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            <span className="text-sm">Analyzing financial data...</span>
          </div>
        ) : (
          <div className="prose prose-sm prose-slate text-slate-700 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div dangerouslySetInnerHTML={{ __html: insight.replace(/\n/g, '<br/>') }} />
          </div>
        )}

        <div className="mt-8">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Quick Actions</h4>
          <div className="space-y-2">
            <button className="w-full text-left p-3 rounded bg-white hover:bg-indigo-50 border border-slate-200 text-sm text-slate-700 transition-colors">
              Tell me about tax implications
            </button>
            <button className="w-full text-left p-3 rounded bg-white hover:bg-indigo-50 border border-slate-200 text-sm text-slate-700 transition-colors">
              Suggest portfolio rebalancing
            </button>
            <button className="w-full text-left p-3 rounded bg-white hover:bg-indigo-50 border border-slate-200 text-sm text-slate-700 transition-colors">
              Review retirement readiness
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-400 text-center">
        Powered by Gemini 3 Flash. <br/> Information is for reference only.
      </div>
    </div>
  );
};
