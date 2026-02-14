import React, { useState } from 'react';
import { ClientProfile, AssetType } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { COLORS } from '../constants';
import { TrendingUp, Briefcase, RefreshCw, Sparkles } from 'lucide-react';
import { useClient } from '../contexts/ClientContext';

interface Props {
  data: ClientProfile;
}

export const PortfolioView: React.FC<Props> = ({ data }) => {
  const { refreshPortfolioPrices } = useClient();
  const [isUpdating, setIsUpdating] = useState(false);

  // Use the last check time from the data directly
  const lastUpdate = data.portfolio.length > 0 ? data.portfolio[0].lastPriceCheck : null;

  const handleUpdatePrices = async () => {
    setIsUpdating(true);
    try {
      await refreshPortfolioPrices(data.id);
    } catch (e) {
      console.error("Error updating prices", e);
      alert("Failed to update prices. Please check API connection.");
    } finally {
      setIsUpdating(false);
    }
  };

  // --- 1. Top Level Asset Breakdown ---
  const investmentAssets = data.assets.filter(a => 
    a.type === AssetType.EQUITY || a.type === AssetType.FIXED_INCOME || a.type === AssetType.ALTERNATIVE
  );

  const breakdownData = investmentAssets.map(a => ({
    name: a.name,
    value: a.value,
    type: a.type
  }));
  
  const totalInvestmentValue = breakdownData.reduce((acc, curr) => acc + curr.value, 0);

  const typeMap = new Map<string, number>();
  investmentAssets.forEach(a => {
    typeMap.set(a.type, (typeMap.get(a.type) || 0) + a.value);
  });
  const typeChartData = Array.from(typeMap).map(([name, value]) => ({ name, value }));


  // --- 2. Detailed Holdings ---
  const holdingsData = data.portfolio.map(p => ({
    ...p,
    amount: p.currentPrice * p.shares
  }));

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold" style={{ pointerEvents: 'none', textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      
      {/* Section 1: Broad Asset Class Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1 md:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
           <div>
              <h3 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
                 <Briefcase className="text-emerald-500" /> 主要投資資產分佈
              </h3>
              <p className="text-slate-500 text-sm">股票、債券及另類投資 (來自資產負債表)</p>
           </div>
           
           <div className="flex flex-col md:flex-row items-center mt-6 gap-8">
              <div className="h-48 w-48 shrink-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                      label={renderCustomizedLabel}
                      labelLine={false}
                    >
                      {typeChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                      contentStyle={{ backgroundColor: '#ffffff', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                   <span className="text-xs text-slate-400">總值</span>
                   <span className="font-bold text-slate-800 text-sm">${(totalInvestmentValue/1000000).toFixed(1)}M</span>
                </div>
              </div>

              <div className="flex-1 w-full space-y-4">
                 {breakdownData.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-slate-50 pb-2 last:border-0">
                       <div>
                          <p className="font-bold text-slate-800">{item.name}</p>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-500">{item.type}</span>
                       </div>
                       <div className="text-right">
                          <p className="font-mono font-medium text-slate-700">${item.value.toLocaleString()}</p>
                          <p className="text-xs text-emerald-500 font-bold">
                             {((item.value / totalInvestmentValue) * 100).toFixed(1)}%
                          </p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-2xl shadow-xl flex flex-col justify-center relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp size={120} />
           </div>
           <h4 className="text-slate-400 font-medium mb-2">投資組合總覽</h4>
           <h2 className="text-4xl font-bold tracking-tight mb-6">${totalInvestmentValue.toLocaleString()}</h2>
           
           <div className="space-y-4 z-10">
              <div>
                 <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">股票 (Equity)</span>
                    <span>{((typeMap.get(AssetType.EQUITY) || 0) / totalInvestmentValue * 100).toFixed(0)}%</span>
                 </div>
                 <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${(typeMap.get(AssetType.EQUITY) || 0) / totalInvestmentValue * 100}%` }}></div>
                 </div>
              </div>
              <div>
                 <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">固定收益 (Fixed Income)</span>
                    <span>{((typeMap.get(AssetType.FIXED_INCOME) || 0) / totalInvestmentValue * 100).toFixed(0)}%</span>
                 </div>
                 <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${(typeMap.get(AssetType.FIXED_INCOME) || 0) / totalInvestmentValue * 100}%` }}></div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Section 2: Specific Holdings */}
      <div>
         <div className="flex items-center justify-between mb-6 px-1">
            <h3 className="text-xl font-bold text-slate-800">詳細持倉 (Holdings)</h3>
            <button 
               onClick={handleUpdatePrices}
               disabled={isUpdating}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all shadow-md ${isUpdating ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'}`}
            >
               {isUpdating ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
               {isUpdating ? '更新中...' : 'AI 更新即時股價'}
            </button>
         </div>
         
         {lastUpdate && (
            <p className="text-right text-xs text-slate-400 mb-4 italic">
               上次更新: {new Date(lastUpdate).toLocaleString()}
            </p>
         )}

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {holdingsData.map((item) => (
               <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center gap-3">
                        <div className="w-auto min-w-[40px] h-10 px-2 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors whitespace-nowrap">
                           {item.ticker}
                        </div>
                        <div>
                           <h4 className="font-bold text-slate-800">{item.name}</h4>
                           <span className="text-xs text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{item.sector}</span>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="font-bold text-lg text-slate-900">${item.currentPrice}</p>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-50">
                     <div>
                        <p className="text-xs text-slate-400 mb-0.5">持股數量</p>
                        <p className="font-medium text-slate-700">{item.shares.toLocaleString()}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-xs text-slate-400 mb-0.5">總市值</p>
                        <p className="font-bold text-slate-800">${item.amount.toLocaleString()}</p>
                     </div>
                  </div>
               </div>
            ))}
            
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer min-h-[160px]">
               <p className="font-medium">在編輯頁面新增持倉</p>
            </div>
         </div>
      </div>

    </div>
  );
};
