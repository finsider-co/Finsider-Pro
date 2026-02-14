import React, { useState, useMemo } from 'react';
import { ClientProfile, AssetType } from '../types';
import { Briefcase, CreditCard, TrendingUp, Wallet, ArrowUpRight, Calculator } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  data: ClientProfile;
}

export const BalanceSheetView: React.FC<Props> = ({ data }) => {
  // 1. Calculate Aggregates
  const portfolioBySector = new Map<string, number>();
  let totalPortfolioValue = 0;

  data.portfolio.forEach(p => {
    const value = p.shares * p.currentPrice;
    totalPortfolioValue += value;
    const key = `${p.name} (${p.ticker})`;
    portfolioBySector.set(key, (portfolioBySector.get(key) || 0) + value);
  });

  const manualAssetsValue = data.assets.reduce((sum, item) => sum + item.value, 0);
  const totalAssets = manualAssetsValue + totalPortfolioValue;
  const totalLiabilities = data.liabilities.reduce((sum, item) => sum + item.amount, 0);
  const netWorth = totalAssets - totalLiabilities;
  const leverageRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

  // Calculate Monthly Surplus (Default for savings input)
  const monthlyIncome = data.cashFlow.filter(c => c.isIncome).reduce((sum, c) => sum + (c.frequency === 'Monthly' ? c.amount : c.amount/12), 0);
  const monthlyExpense = data.cashFlow.filter(c => !c.isIncome).reduce((sum, c) => sum + (c.frequency === 'Monthly' ? c.amount : c.amount/12), 0);
  const defaultMonthlySavings = Math.max(0, monthlyIncome - monthlyExpense);

  // --- Projection States ---
  const [assetGrowthRate, setAssetGrowthRate] = useState<number>(5.0); // Existing assets growth %
  const [monthlySavings, setMonthlySavings] = useState<number>(Math.round(defaultMonthlySavings));
  const [savingsReturnRate, setSavingsReturnRate] = useState<number>(5.0); // New savings return %

  // --- 2. Future Projection Logic ---
  const projectionData = useMemo(() => {
    const years = 10;
    const currentYear = new Date(data.lastMeetingDate || new Date()).getFullYear();
    const result = [];

    let currentExistingAssets = totalAssets;
    let accumulatedSavings = 0;

    for (let i = 0; i <= years; i++) {
      const year = currentYear + i;
      
      // Calculate Total
      const totalProjected = currentExistingAssets + accumulatedSavings;
      // Assume liabilities stay flat or decrease (simplified: keeping flat for now or calculating amortization is complex without loan terms)
      // Let's assume liabilities decrease by 5% a year for visualization
      const projectedLiabilities = Math.max(0, totalLiabilities * Math.pow(0.95, i)); 
      
      result.push({
        year,
        assets: Math.round(totalProjected),
        liabilities: Math.round(projectedLiabilities),
        netWorth: Math.round(totalProjected - projectedLiabilities),
        existing: Math.round(currentExistingAssets),
        savings: Math.round(accumulatedSavings)
      });

      // Advance to next year
      // 1. Grow existing assets
      currentExistingAssets = currentExistingAssets * (1 + assetGrowthRate / 100);
      
      // 2. Add yearly savings + grow them
      // FV of annual contribution: PMT * 12 * (1+r)
      const yearlyContribution = monthlySavings * 12;
      // Grow previous accumulated savings
      accumulatedSavings = accumulatedSavings * (1 + savingsReturnRate / 100);
      // Add new contribution (assume contributed evenly, simple addition for end of year)
      accumulatedSavings += yearlyContribution; 
    }
    return result;
  }, [totalAssets, totalLiabilities, assetGrowthRate, monthlySavings, savingsReturnRate, data.lastMeetingDate]);

  // 3. Helper for Badges
  const getAssetBadge = (type: string) => {
    if (type === AssetType.EQUITY || type === '股票' || type === 'Equity') return "bg-emerald-100 text-emerald-700";
    if (type === AssetType.CASH) return "bg-blue-100 text-blue-700";
    if (type === AssetType.REAL_ESTATE) return "bg-amber-100 text-amber-700";
    if (type === AssetType.FIXED_INCOME) return "bg-cyan-100 text-cyan-700";
    return "bg-slate-100 text-slate-700";
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Top Section: Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                 <Wallet size={20} />
              </div>
              <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wide">總資產淨值 (Net Worth)</h3>
           </div>
           <p className="text-3xl font-bold text-slate-900">${netWorth.toLocaleString()}</p>
           <p className="text-sm text-emerald-600 font-medium mt-1 flex items-center">
             <ArrowUpRight size={16} /> 穩健增長中
           </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                 <Briefcase size={20} />
              </div>
              <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wide">總資產 (Assets)</h3>
           </div>
           <p className="text-3xl font-bold text-slate-900">${totalAssets.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 rounded-lg text-red-600">
                 <CreditCard size={20} />
              </div>
              <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wide">總負債 (Liabilities)</h3>
           </div>
           <p className="text-3xl font-bold text-slate-900">${totalLiabilities.toLocaleString()}</p>
           <p className="text-sm text-slate-400 mt-1">槓桿比率: {leverageRatio.toFixed(1)}%</p>
        </div>
      </div>

      {/* Projection Section (Chart + Inputs) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                 <TrendingUp className="text-emerald-500" /> 未來 10 年資產增長預測
              </h3>
              <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded">
                 由 {data.lastMeetingDate || '現在'} 開始計算
              </span>
           </div>
           <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={projectionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                       <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                       </linearGradient>
                       <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(val) => `$${val/1000000}M`} />
                    <CartesianGrid vertical={false} stroke="#f1f5f9" />
                    <Tooltip 
                       formatter={(value: number) => `$${value.toLocaleString()}`}
                       labelStyle={{ color: '#64748b', marginBottom: '0.5rem' }}
                       contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Area type="monotone" dataKey="assets" name="總資產 (Total Assets)" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorAssets)" />
                    <Area type="monotone" dataKey="netWorth" name="資產淨值 (Net Worth)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorNetWorth)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Calculator Inputs */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col gap-4">
           <div className="flex items-center gap-2 mb-2 text-slate-800">
             <Calculator size={20} className="text-emerald-500" />
             <h3 className="font-bold">增長參數設定</h3>
           </div>

           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <label className="block text-xs font-bold text-slate-500 mb-2">現有資產預期年升幅 (%)</label>
             <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={assetGrowthRate}
                  onChange={(e) => setAssetGrowthRate(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-slate-50 rounded-lg border border-slate-200 font-bold text-slate-700 focus:border-emerald-500 outline-none"
                />
                <span className="text-slate-400 font-bold">%</span>
             </div>
           </div>

           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <label className="block text-xs font-bold text-slate-500 mb-2">每月儲蓄/投入金額 ($)</label>
             <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold">$</span>
                <input 
                  type="number" 
                  value={monthlySavings}
                  onChange={(e) => setMonthlySavings(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-slate-50 rounded-lg border border-slate-200 font-bold text-slate-700 focus:border-emerald-500 outline-none"
                />
             </div>
             <p className="text-xs text-slate-400 mt-2">根據現金流分析，目前每月盈餘約 ${defaultMonthlySavings.toLocaleString()}</p>
           </div>

           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <label className="block text-xs font-bold text-slate-500 mb-2">新資金/儲蓄預期回報 (%)</label>
             <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={savingsReturnRate}
                  onChange={(e) => setSavingsReturnRate(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-slate-50 rounded-lg border border-slate-200 font-bold text-slate-700 focus:border-emerald-500 outline-none"
                />
                <span className="text-slate-400 font-bold">%</span>
             </div>
           </div>
           
           <div className="mt-auto bg-emerald-50 p-4 rounded-xl border border-emerald-100">
             <p className="text-xs text-emerald-700 mb-1 font-bold">10 年後預期資產淨值</p>
             <p className="text-2xl font-bold text-emerald-600">
               ${projectionData[projectionData.length - 1].netWorth.toLocaleString()}
             </p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assets Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div> 資產列表
            </h3>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <table className="min-w-full divide-y divide-slate-100">
               <thead className="bg-slate-50/50">
                 <tr>
                   <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">項目</th>
                   <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">類別</th>
                   <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">估值</th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-slate-50">
                 {data.assets.map((asset) => (
                   <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">{asset.name}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm">
                       <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getAssetBadge(asset.type)}`}>
                         {asset.type}
                       </span>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 text-right font-mono font-medium">
                       ${asset.value.toLocaleString()}
                     </td>
                   </tr>
                 ))}
                 {Array.from(portfolioBySector).map(([itemName, value], index) => (
                    <tr key={`portfolio-${index}`} className="hover:bg-slate-50 transition-colors">
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800 flex items-center gap-2">
                       {itemName} 
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm">
                       <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getAssetBadge(AssetType.EQUITY)}`}>
                         {AssetType.EQUITY}
                       </span>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 text-right font-mono font-medium">
                       ${value.toLocaleString()}
                     </td>
                   </tr>
                 ))}
               </tbody>
               <tfoot className="bg-slate-50 font-bold text-slate-800">
                  <tr>
                    <td colSpan={2} className="px-6 py-4 text-right">總資產合計:</td>
                    <td className="px-6 py-4 text-right text-emerald-600">${totalAssets.toLocaleString()}</td>
                  </tr>
               </tfoot>
             </table>
          </div>
        </div>

        {/* Liabilities Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-red-500 rounded-full"></div> 負債列表
            </h3>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <table className="min-w-full divide-y divide-slate-100">
               <thead className="bg-slate-50/50">
                 <tr>
                   <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">項目</th>
                   <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">類別</th>
                   <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">金額</th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-slate-50">
                 {data.liabilities.map((liability) => (
                   <tr key={liability.id} className="hover:bg-slate-50 transition-colors">
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">{liability.name}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-red-100 text-red-700">
                         {liability.type}
                       </span>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 text-right font-mono font-medium">
                       ${liability.amount.toLocaleString()}
                     </td>
                   </tr>
                 ))}
               </tbody>
               <tfoot className="bg-slate-50 font-bold text-slate-800">
                  <tr>
                    <td colSpan={2} className="px-6 py-4 text-right">總負債合計:</td>
                    <td className="px-6 py-4 text-right text-red-600">${totalLiabilities.toLocaleString()}</td>
                  </tr>
               </tfoot>
             </table>
          </div>
        </div>
      </div>
    </div>
  );
};
