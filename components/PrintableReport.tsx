
import React from 'react';
import { ClientProfile, AssetType } from '../types';
import { calculateAge, COLORS } from '../constants';
import { Sparkles, TrendingUp, Activity, PieChart as PieIcon, Wallet, Shield, HeartPulse, Building2 } from 'lucide-react';
import { PieChart, Pie, Cell, Legend } from 'recharts';

interface Props {
  client: ClientProfile;
}

export const PrintableReport: React.FC<Props> = ({ client }) => {
  const age = calculateAge(client.dateOfBirth);
  
  // --- Calculations ---

  // 1. Portfolio Value
  const portfolioValue = client.portfolio.reduce((sum, item) => sum + (item.currentPrice * item.shares), 0);
  
  // 2. Asset Allocation Data Preparation
  const allocationMap = new Map<string, number>();
  
  // Add Manual Assets
  client.assets.forEach(asset => {
    allocationMap.set(asset.type, (allocationMap.get(asset.type) || 0) + asset.value);
  });

  // Add Portfolio (Simplified: grouping all portfolio as '股票/基金 (Portfolio)')
  // In a real app, you might map individual stock sectors to asset types.
  if (portfolioValue > 0) {
     const pfLabel = '股票/基金 (Portfolio)';
     allocationMap.set(pfLabel, (allocationMap.get(pfLabel) || 0) + portfolioValue);
  }

  // Convert to Array and Sort by Value
  const chartData = Array.from(allocationMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const manualAssetsValue = client.assets.reduce((sum, item) => sum + item.value, 0);
  const totalAssets = manualAssetsValue + portfolioValue;
  const totalLiabilities = client.liabilities.reduce((sum, item) => sum + item.amount, 0);
  const netWorth = totalAssets - totalLiabilities;
  
  // Cash Flow
  const monthlyIncome = client.cashFlow.filter(c => c.isIncome).reduce((sum, c) => sum + (c.frequency === 'Monthly' ? c.amount : c.amount/12), 0);
  const monthlyExpense = client.cashFlow.filter(c => !c.isIncome).reduce((sum, c) => sum + (c.frequency === 'Monthly' ? c.amount : c.amount/12), 0);
  const monthlySavings = monthlyIncome - monthlyExpense;
  const savingsRatio = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
  
  // Ratios
  const liquidAssets = client.assets.filter(a => a.type === AssetType.CASH).reduce((sum, a) => sum + a.value, 0);
  const liquidityRatio = monthlyExpense > 0 ? (liquidAssets / monthlyExpense) : 0;
  const debtRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
  
  // Insurance
  const lifeCoverage = client.insurance.filter(i => i.type === 'Life').reduce((s,i) => s + i.coverageAmount, 0);
  const ciCoverage = client.insurance.filter(i => i.type === 'Critical Illness').reduce((s,i) => s + i.coverageAmount, 0);
  const totalPremiumMonthly = client.insurance.reduce((s, i) => s + (i.premiumFrequency === 'Monthly' ? i.premium : i.premium/12), 0);

  return (
    <div className="w-full bg-white text-slate-900 font-sans p-10 h-auto block">
      
      {/* 1. HEADER SECTION */}
      <div className="flex justify-between items-end border-b-2 border-slate-900 pb-6 mb-8 avoid-break">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg">
              <Sparkles size={28} className="text-emerald-400" />
          </div>
          <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">{client.name}</h1>
              <p className="text-emerald-600 font-bold text-sm mt-1 uppercase tracking-wider">財富管理分析報告 (Wealth Analysis)</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex flex-col items-end gap-1">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Client Profile</span>
             <div className="flex gap-3 text-xs font-medium text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                {/* ID Removed */}
                <span><span className="text-slate-400">Age:</span> {age}</span>
                <span className="border-l border-slate-300 pl-3"><span className="text-slate-400">Retirement:</span> {client.retirementAge}</span>
                <span className="border-l border-slate-300 pl-3"><span className="text-slate-400">Date:</span> {new Date().toLocaleDateString()}</span>
             </div>
          </div>
        </div>
      </div>

      {/* 2. EXECUTIVE SUMMARY CARDS */}
      <div className="grid grid-cols-4 gap-6 mb-8 avoid-break">
        <div className="bg-slate-900 text-white p-5 rounded-xl shadow-md border border-slate-800">
            <span className="text-emerald-400 block text-[10px] uppercase font-bold tracking-wider mb-2 flex items-center gap-2">
               <Wallet size={14} /> 資產淨值 (Net Worth)
            </span>
            <span className="text-2xl font-bold block tracking-tight">${netWorth.toLocaleString()}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-blue-500 block text-[10px] uppercase font-bold tracking-wider mb-2 flex items-center gap-2">
               <Building2 size={14} /> 總資產 (Total Assets)
            </span>
            <span className="text-2xl font-bold text-slate-800 block tracking-tight">${totalAssets.toLocaleString()}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-red-500 block text-[10px] uppercase font-bold tracking-wider mb-2 flex items-center gap-2">
               <TrendingUp size={14} className="rotate-180" /> 總負債 (Liabilities)
            </span>
            <span className="text-2xl font-bold text-slate-800 block tracking-tight">${totalLiabilities.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 font-bold mt-1 block">槓桿比率: {debtRatio.toFixed(1)}%</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-emerald-600 block text-[10px] uppercase font-bold tracking-wider mb-2 flex items-center gap-2">
               <Activity size={14} /> 每月盈餘 (Surplus)
            </span>
            <span className="text-2xl font-bold text-slate-800 block tracking-tight">+${monthlySavings.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 font-bold mt-1 block">儲蓄率: {savingsRatio.toFixed(1)}%</span>
        </div>
      </div>

      {/* 3. ASSET ALLOCATION CHART SECTION */}
      <div className="mb-8 bg-slate-50 rounded-2xl p-6 border border-slate-200 avoid-break">
         <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-4">
            <PieIcon size={20} className="text-indigo-500" />
            <h3 className="text-lg font-bold text-slate-800">資產分佈分析 (Asset Allocation)</h3>
         </div>
         
         <div className="flex items-center gap-8">
            {/* Chart Area */}
            <div className="w-[200px] h-[200px] relative shrink-0">
               <PieChart width={200} height={200}>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    isAnimationActive={false} // CRITICAL for PDF: Disable animation so it renders instantly
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
               </PieChart>
               {/* Center Text */}
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                  <span className="text-sm font-extrabold text-slate-800">${(totalAssets/1000000).toFixed(1)}M</span>
               </div>
            </div>

            {/* Legend / Table Area */}
            <div className="flex-1">
               <table className="w-full text-xs">
                  <thead>
                     <tr className="text-slate-400 border-b border-slate-200">
                        <th className="text-left py-2 font-bold uppercase tracking-wider">資產類別</th>
                        <th className="text-right py-2 font-bold uppercase tracking-wider">金額</th>
                        <th className="text-right py-2 font-bold uppercase tracking-wider">佔比</th>
                     </tr>
                  </thead>
                  <tbody>
                     {chartData.map((entry, index) => (
                        <tr key={index} className="border-b border-slate-200/50 last:border-0">
                           <td className="py-2.5 flex items-center gap-2 font-bold text-slate-700">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                              {entry.name}
                           </td>
                           <td className="py-2.5 text-right font-medium text-slate-600">${entry.value.toLocaleString()}</td>
                           <td className="py-2.5 text-right font-bold text-slate-800">{((entry.value / totalAssets) * 100).toFixed(1)}%</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>

      {/* 4. DETAILED 3-COLUMN GRID */}
      {/* Remove 'items-start' to allow columns to flow naturally */}
      <div className="grid grid-cols-3 gap-8">
        
        {/* COL 1: INCOME & EXPENSE */}
        <div className="col-span-1 space-y-6">
            {/* Header + Summary: Keep Together */}
            <div className="avoid-break">
                <h3 className="text-sm font-bold text-slate-800 border-b-2 border-slate-100 pb-2 mb-4 flex items-center gap-2">
                   <Activity size={16} className="text-emerald-500" /> 收支詳情
                </h3>
                
                {/* Income Summary */}
                <div className="bg-emerald-50/50 rounded-lg p-3 mb-3 border border-emerald-100">
                   <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-emerald-800">總收入</span>
                      <span className="text-sm font-bold text-emerald-700">${monthlyIncome.toLocaleString()}</span>
                   </div>
                   <div className="text-[10px] text-emerald-600/70">包含薪金、股息及租金收入</div>
                </div>
            </div>

            {/* Expense Table: Allow Flow */}
            <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2 mt-4 avoid-break">主要支出 (Top 5)</h4>
                <table className="w-full text-xs">
                   <tbody>
                      {client.cashFlow.filter(c => !c.isIncome).sort((a,b) => b.amount - a.amount).slice(0, 5).map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-50 last:border-0 avoid-break">
                            <td className="py-2 text-slate-600 font-medium">{item.category}</td>
                            <td className="py-2 text-right font-bold text-slate-800">${(item.frequency === 'Monthly' ? item.amount : Math.round(item.amount/12)).toLocaleString()}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
            </div>
            
            <div className="avoid-break bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                   <HeartPulse size={12} /> 健康指標 (Financial Vitals)
                </h4>
                <div className="space-y-3">
                   <div>
                      <div className="flex justify-between text-xs mb-1">
                         <span className="text-slate-600">緊急預備金</span>
                         <span className={`font-bold ${liquidityRatio >= 6 ? 'text-emerald-600' : 'text-amber-500'}`}>{liquidityRatio.toFixed(1)} 個月</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                         <div className={`h-full ${liquidityRatio >= 6 ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: `${Math.min((liquidityRatio/6)*100, 100)}%` }}></div>
                      </div>
                   </div>
                   <div>
                      <div className="flex justify-between text-xs mb-1">
                         <span className="text-slate-600">債務比率</span>
                         <span className={`font-bold ${debtRatio < 40 ? 'text-emerald-600' : 'text-red-500'}`}>{debtRatio.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                         <div className={`h-full ${debtRatio < 40 ? 'bg-emerald-500' : 'bg-red-400'}`} style={{ width: `${Math.min(debtRatio, 100)}%` }}></div>
                      </div>
                   </div>
                </div>
            </div>
        </div>

        {/* COL 2: HOLDINGS & LIABILITIES */}
        <div className="col-span-1 space-y-6">
            {/* Header: Keep Together */}
            <div className="avoid-break">
                <h3 className="text-sm font-bold text-slate-800 border-b-2 border-slate-100 pb-2 mb-4 flex items-center gap-2">
                   <TrendingUp size={16} className="text-blue-500" /> 投資及資產
                </h3>
            </div>

            {/* Holdings Table: Allow Flow */}
            <div>
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase">
                    <tr>
                        <th className="text-left py-1.5 px-2 rounded-l">持有項目</th>
                        <th className="text-right py-1.5 px-2 rounded-r">市值</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Top 3 Manual Assets */}
                    {client.assets.slice(0, 3).map((a, i) => (
                       <tr key={`a-${i}`} className="border-b border-slate-50 avoid-break">
                          <td className="py-2 px-2 text-slate-600 truncate max-w-[120px]">{a.name}</td>
                          <td className="py-2 px-2 text-right font-bold text-slate-800">${a.value.toLocaleString()}</td>
                       </tr>
                    ))}
                    {/* Top 5 Portfolio Items */}
                    {client.portfolio.slice(0, 5).map((p, i) => (
                        <tr key={`p-${i}`} className="border-b border-slate-50 avoid-break">
                          <td className="py-2 px-2 text-slate-600">
                             <span className="font-bold text-slate-700 mr-1">{p.ticker}</span> 
                             <span className="text-[10px]">{p.name}</span>
                          </td>
                          <td className="py-2 px-2 text-right font-bold text-slate-800">${(p.shares * p.currentPrice).toLocaleString()}</td>
                        </tr>
                    ))}
                  </tbody>
                </table>
            </div>

            {/* Liabilities: Allow Flow */}
            <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2 border-b border-slate-100 pb-1 avoid-break">負債列表 (Liabilities)</h4>
                <table className="w-full text-xs">
                   <tbody>
                      {client.liabilities.map((l, i) => (
                         <tr key={i} className="border-b border-slate-50 avoid-break">
                            <td className="py-2 text-slate-600">{l.name}</td>
                            <td className="py-2 text-right font-bold text-red-600">${l.amount.toLocaleString()}</td>
                         </tr>
                      ))}
                      {client.liabilities.length === 0 && <tr><td className="py-2 text-slate-400 italic">無負債</td></tr>}
                   </tbody>
                </table>
            </div>
        </div>

        {/* COL 3: INSURANCE & PROTECTION (Modified to allow flow) */}
        <div className="col-span-1 space-y-6">
            
            {/* 1. Header & Summary Stats - Keep this block together */}
            <div className="avoid-break">
                <h3 className="text-sm font-bold text-slate-800 border-b-2 border-slate-100 pb-2 mb-4 flex items-center gap-2">
                   <Shield size={16} className="text-rose-500" /> 保障摘要
                </h3>
                
                <div className="space-y-3 mb-6">
                   <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                      <div>
                         <span className="text-[10px] font-bold text-blue-400 uppercase block">人壽保額</span>
                         <span className="text-lg font-bold text-blue-700">${lifeCoverage.toLocaleString()}</span>
                      </div>
                      <Shield size={20} className="text-blue-300" />
                   </div>
                   <div className="flex items-center justify-between p-3 bg-rose-50/50 rounded-lg border border-rose-100">
                      <div>
                         <span className="text-[10px] font-bold text-rose-400 uppercase block">危疾保額</span>
                         <span className="text-lg font-bold text-rose-700">${ciCoverage.toLocaleString()}</span>
                      </div>
                      <HeartPulse size={20} className="text-rose-300" />
                   </div>
                   <div className="flex justify-between items-center px-2">
                      <span className="text-xs text-slate-500 font-medium">每月總保費支出</span>
                      <span className="text-sm font-bold text-slate-800">${totalPremiumMonthly.toLocaleString()}</span>
                   </div>
                </div>
            </div>

            {/* 2. Policy List - Allow this to break naturally across pages */}
            {/* NOT wrapped in avoid-break, but individual items ARE */}
            <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2 avoid-break">現有保單</h4>
                <div className="space-y-2">
                   {client.insurance.map((pol, i) => (
                      <div key={i} className="bg-white border border-slate-200 p-2.5 rounded-lg shadow-sm avoid-break">
                         <div className="flex justify-between mb-1">
                            <span className="font-bold text-slate-700 text-[10px]">{pol.provider}</span>
                            <span className="text-[9px] bg-slate-100 text-slate-500 px-1 rounded">{pol.type}</span>
                         </div>
                         <div className="text-xs text-emerald-600 font-bold truncate mb-1">{pol.name}</div>
                         <div className="flex justify-between text-[10px] text-slate-400">
                            <span>保額: ${pol.coverageAmount.toLocaleString()}</span>
                            <span>保費: ${pol.premium.toLocaleString()}</span>
                         </div>
                      </div>
                   ))}
                </div>
            </div>
        </div>

      </div>
      
      {/* 5. FOOTER */}
      <div className="pt-6 mt-10 border-t border-slate-100 text-[9px] text-slate-400 text-center leading-relaxed avoid-break">
         <p>此報告由 FinsiderPro 專業理財系統生成。資料僅供參考，不構成任何投資建議。投資涉及風險，資產價格可升可跌。</p>
         <p className="font-mono mt-1 text-slate-300">CONFIDENTIAL | Generated on {new Date().toLocaleString()}</p>
      </div>

    </div>
  );
};
