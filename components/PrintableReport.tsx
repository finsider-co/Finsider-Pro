
import React from 'react';
import { ClientProfile, AssetType } from '../types';
import { calculateAge, COLORS } from '../constants';
import { Sparkles, TrendingUp, Activity, PieChart as PieIcon, Wallet, Shield, HeartPulse, Building2, AlertTriangle, CheckCircle, FileText, User, Calendar, Percent } from 'lucide-react';
import { PieChart, Pie, Cell } from 'recharts';

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

  // Add Portfolio
  if (portfolioValue > 0) {
     const pfLabel = '股票/基金';
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
  const debtRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
  const liquidAssets = client.assets.filter(a => a.type === AssetType.CASH).reduce((sum, a) => sum + a.value, 0);
  const liquidityRatio = monthlyExpense > 0 ? (liquidAssets / monthlyExpense) : 0;
  
  // Insurance & Gaps
  const annualIncome = monthlyIncome * 12;
  const lifeBenchmark = annualIncome * 10;
  const ciBenchmark = annualIncome * 3;

  const lifeCoverage = client.insurance.filter(i => i.type === 'Life').reduce((s,i) => s + i.coverageAmount, 0);
  const ciCoverage = client.insurance.filter(i => i.type === 'Critical Illness').reduce((s,i) => s + i.coverageAmount, 0);
  const totalPremiumMonthly = client.insurance.reduce((s, i) => s + (i.premiumFrequency === 'Monthly' ? i.premium : i.premium/12), 0);

  const lifeGap = Math.max(0, lifeBenchmark - lifeCoverage);
  const ciGap = Math.max(0, ciBenchmark - ciCoverage);

  const getProgress = (current: number, target: number) => {
     if (target <= 0) return 100;
     return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="w-full bg-white text-slate-900 font-sans p-8 h-auto block">
      
      {/* --- PAGE 1 START --- */}
      <div className="flex flex-col relative h-[280mm]">

        {/* 1. HEADER SECTION */}
        <div className="flex justify-between items-end border-b-2 border-slate-900 pb-4 mb-6 avoid-break">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg">
                <Sparkles size={24} className="text-emerald-400" />
            </div>
            <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none">{client.name}</h1>
                <p className="text-emerald-600 font-bold text-xs mt-1 uppercase tracking-wider">財富管理分析報告 (Wealth Analysis)</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex flex-col items-end gap-1">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client Profile</span>
               <div className="flex gap-3 text-[10px] font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <span><span className="text-slate-400">Age:</span> {age}</span>
                  <span className="border-l border-slate-300 pl-3"><span className="text-slate-400">Retirement:</span> {client.retirementAge}</span>
                  <span className="border-l border-slate-300 pl-3"><span className="text-slate-400">Date:</span> {new Date().toLocaleDateString()}</span>
               </div>
            </div>
          </div>
        </div>

        {/* 2. EXECUTIVE SUMMARY CARDS */}
        <div className="grid grid-cols-4 gap-4 mb-6 avoid-break">
          {/* Net Worth */}
          <div className="bg-slate-900 text-white p-3 rounded-lg shadow-md border border-slate-800">
              <div className="text-emerald-400 mb-1 flex items-start gap-2">
                 <Wallet size={14} className="mt-0.5 shrink-0" />
                 <div className="flex flex-col leading-none">
                     <span className="text-[10px] font-bold tracking-wide">資產淨值</span>
                     <span className="text-[8px] uppercase tracking-wider opacity-80 font-semibold">Net Worth</span>
                 </div>
              </div>
              <span className="text-lg font-bold block tracking-tight mt-1">${netWorth.toLocaleString()}</span>
          </div>
          
          {/* Total Assets */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
              <div className="text-blue-500 mb-1 flex items-start gap-2">
                 <Building2 size={14} className="mt-0.5 shrink-0" />
                 <div className="flex flex-col leading-none">
                     <span className="text-[10px] font-bold tracking-wide">總資產</span>
                     <span className="text-[8px] uppercase tracking-wider opacity-80 font-semibold">Total Assets</span>
                 </div>
              </div>
              <span className="text-lg font-bold text-slate-800 block tracking-tight mt-1">${totalAssets.toLocaleString()}</span>
          </div>
          
          {/* Liabilities */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
              <div className="text-red-500 mb-1 flex items-start gap-2">
                 <TrendingUp size={14} className="rotate-180 mt-0.5 shrink-0" />
                 <div className="flex flex-col leading-none">
                     <span className="text-[10px] font-bold tracking-wide">總負債</span>
                     <span className="text-[8px] uppercase tracking-wider opacity-80 font-semibold">Liabilities</span>
                 </div>
              </div>
              <span className="text-lg font-bold text-slate-800 block tracking-tight mt-1">${totalLiabilities.toLocaleString()}</span>
              <span className="text-[9px] text-slate-400 font-bold mt-0.5 block">槓桿: {debtRatio.toFixed(1)}%</span>
          </div>
          
          {/* Surplus */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
              <div className="text-emerald-600 mb-1 flex items-start gap-2">
                 <Activity size={14} className="mt-0.5 shrink-0" />
                 <div className="flex flex-col leading-none">
                     <span className="text-[10px] font-bold tracking-wide">每月盈餘</span>
                     <span className="text-[8px] uppercase tracking-wider opacity-80 font-semibold">Surplus</span>
                 </div>
              </div>
              <span className="text-lg font-bold text-slate-800 block tracking-tight mt-1">+${monthlySavings.toLocaleString()}</span>
              <span className="text-[9px] text-slate-400 font-bold mt-0.5 block">儲蓄率: {savingsRatio.toFixed(1)}%</span>
          </div>
        </div>

        {/* 3. ASSET ALLOCATION (FULL WIDTH) */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 avoid-break mb-6">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
               <PieIcon size={16} className="text-indigo-500" />
               <h3 className="text-sm font-bold text-slate-800">資產分佈分析</h3>
            </div>
            
            <div className="flex items-center justify-around gap-8">
               {/* Chart */}
               <div className="w-[140px] h-[140px] relative shrink-0">
                  <PieChart width={140} height={140}>
                     <Pie
                       data={chartData}
                       cx="50%"
                       cy="50%"
                       innerRadius={40}
                       outerRadius={65}
                       paddingAngle={2}
                       dataKey="value"
                       isAnimationActive={false} 
                       stroke="none"
                     >
                       {chartData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                     </Pie>
                  </PieChart>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-[9px] font-bold text-slate-400 uppercase">Total</span>
                     <span className="text-xs font-extrabold text-slate-800">${(totalAssets/1000000).toFixed(1)}M</span>
                  </div>
               </div>

               {/* Detailed Legend Table - Full Width Capability */}
               <div className="flex-1">
                  <table className="w-full text-xs">
                     <thead className="text-slate-400 border-b border-slate-200">
                        <tr>
                            <th className="text-left py-1.5 font-bold pl-2 text-[10px]">資產類別</th>
                            <th className="text-right py-1.5 font-bold text-[10px]">市值 (Value)</th>
                            <th className="text-right py-1.5 font-bold pr-2 text-[10px]">佔比 (%)</th>
                        </tr>
                     </thead>
                     <tbody>
                        {chartData.map((entry, index) => (
                           <tr key={index} className="border-b border-slate-200/50 last:border-0 hover:bg-slate-100/50">
                              <td className="py-2 pl-2 align-middle">
                                 <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-md shrink-0 shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="font-bold text-slate-700 text-xs block truncate max-w-[200px]">
                                        {entry.name}
                                    </span>
                                 </div>
                              </td>
                              <td className="py-2 text-right font-medium text-slate-600 text-xs whitespace-nowrap">
                                 ${entry.value.toLocaleString()}
                              </td>
                              <td className="py-2 text-right font-bold text-slate-800 text-xs whitespace-nowrap pr-2 w-16">
                                 {((entry.value / totalAssets) * 100).toFixed(1)}%
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
        </div>

        {/* 4. THREE COLUMN DETAILS GRID */}
        <div className="grid grid-cols-3 gap-6">
            
            {/* COLUMN 1: INCOME & EXPENSE + HEALTH METRICS */}
            <div className="col-span-1">
                <div className="avoid-break bg-white rounded-xl border border-slate-100 p-4 shadow-sm h-full flex flex-col">
                    <h3 className="text-xs font-bold text-slate-800 border-b-2 border-emerald-100 pb-2 mb-3 flex items-center gap-2">
                       <Activity size={14} className="text-emerald-500" /> 收支詳情
                    </h3>
                    
                    <div className="bg-emerald-50 rounded-lg p-2 mb-3 border border-emerald-100">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-emerald-800">每月總收入</span>
                          <span className="text-xs font-bold text-emerald-700">${monthlyIncome.toLocaleString()}</span>
                       </div>
                    </div>

                    <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">支出項目 (Top 5)</h4>
                    <table className="w-full text-xs mb-4">
                       <tbody>
                          {client.cashFlow.filter(c => !c.isIncome).sort((a,b) => b.amount - a.amount).slice(0, 5).map((item, idx) => (
                            <tr key={idx} className="border-b border-slate-50 last:border-0">
                                <td className="py-1.5 text-slate-600 font-medium truncate max-w-[80px] text-[10px]">{item.category}</td>
                                <td className="py-1.5 text-right font-bold text-slate-800 text-[10px]">${(item.frequency === 'Monthly' ? item.amount : Math.round(item.amount/12)).toLocaleString()}</td>
                            </tr>
                          ))}
                       </tbody>
                    </table>

                    {/* NEW: Health Metrics Section */}
                    <div className="mt-auto pt-3 border-t border-slate-100">
                       <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                          <Percent size={12}/> 健康指標 (Health)
                       </h4>
                       <div className="space-y-2">
                          <div className="flex justify-between items-center text-[10px]">
                             <span className="text-slate-500">流動性 (Liquidity)</span>
                             <span className={`font-bold ${liquidityRatio >= 3 ? 'text-emerald-600' : 'text-amber-500'}`}>{liquidityRatio.toFixed(1)} 月</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px]">
                             <span className="text-slate-500">儲蓄率 (Savings Rate)</span>
                             <span className={`font-bold ${savingsRatio >= 20 ? 'text-emerald-600' : 'text-amber-500'}`}>{savingsRatio.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px]">
                             <span className="text-slate-500">負債比率 (Debt Ratio)</span>
                             <span className={`font-bold ${debtRatio < 50 ? 'text-emerald-600' : 'text-amber-500'}`}>{debtRatio.toFixed(1)}%</span>
                          </div>
                       </div>
                    </div>
                </div>
            </div>

            {/* COLUMN 2: INVESTMENTS, ASSETS & LIABILITIES */}
            <div className="col-span-1">
                <div className="avoid-break bg-white rounded-xl border border-slate-100 p-4 shadow-sm h-full">
                    <h3 className="text-xs font-bold text-slate-800 border-b-2 border-blue-100 pb-2 mb-3 flex items-center gap-2">
                       <TrendingUp size={14} className="text-blue-500" /> 投資及資產
                    </h3>
                    
                    {/* Top Portfolio Items */}
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">股票/基金持倉</h4>
                    <table className="w-full text-xs mb-3">
                      <tbody>
                        {client.portfolio.sort((a,b) => (b.shares * b.currentPrice) - (a.shares * a.currentPrice)).slice(0, 3).map((p, i) => (
                           <tr key={`p-${i}`} className="border-b border-slate-50">
                              <td className="py-1.5 text-slate-600 truncate max-w-[80px] text-[10px]">{p.name}</td>
                              <td className="py-1.5 text-right font-bold text-slate-800 text-[10px]">${(p.shares * p.currentPrice).toLocaleString()}</td>
                           </tr>
                        ))}
                      </tbody>
                    </table>

                    <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2 border-t border-slate-50 pt-2">主要資產</h4>
                    <table className="w-full text-xs mb-3">
                      <tbody>
                        {client.assets.slice(0, 3).map((a, i) => (
                           <tr key={`a-${i}`} className="border-b border-slate-50">
                              <td className="py-1.5 text-slate-600 truncate max-w-[80px] text-[10px]">{a.name}</td>
                              <td className="py-1.5 text-right font-bold text-slate-800 text-[10px]">${a.value.toLocaleString()}</td>
                           </tr>
                        ))}
                      </tbody>
                    </table>

                    <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2 border-t border-slate-50 pt-2">主要負債</h4>
                    <table className="w-full text-xs">
                       <tbody>
                          {client.liabilities.slice(0, 3).map((l, i) => (
                             <tr key={i} className="border-b border-slate-50">
                                <td className="py-1.5 text-slate-600 truncate max-w-[80px] text-[10px]">{l.name}</td>
                                <td className="py-1.5 text-right font-bold text-red-600 text-[10px]">${l.amount.toLocaleString()}</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                </div>
            </div>

            {/* COLUMN 3: INSURANCE SUMMARY */}
            <div className="col-span-1">
                <div className="avoid-break bg-white rounded-xl border border-slate-100 p-4 shadow-sm h-full">
                    <h3 className="text-xs font-bold text-slate-800 border-b-2 border-rose-100 pb-2 mb-3 flex items-center gap-2">
                       <Shield size={14} className="text-rose-500" /> 保障摘要
                    </h3>
                    
                    <div className="space-y-3">
                       {/* Life Coverage */}
                       <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 relative">
                          <div className="flex justify-between items-center mb-1">
                             <div className="flex items-center gap-1">
                                 <Shield size={10} className="text-blue-500"/>
                                 <span className="text-[10px] font-bold text-slate-700">人壽</span>
                             </div>
                             <span className="text-[9px] font-medium text-slate-400">目標: ${(lifeBenchmark/1000000).toFixed(1)}M</span>
                          </div>
                          <div className="flex items-end justify-between mb-1">
                              <span className="text-sm font-bold text-slate-800 leading-none">${(lifeCoverage/1000000).toFixed(2)}M</span>
                              <span className="text-[9px] font-bold text-blue-600">{getProgress(lifeCoverage, lifeBenchmark).toFixed(0)}%</span>
                          </div>
                          <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden mb-1">
                             <div className={`h-full rounded-full ${lifeGap > 0 ? 'bg-blue-500' : 'bg-emerald-500'}`} style={{ width: `${getProgress(lifeCoverage, lifeBenchmark)}%` }}></div>
                          </div>
                       </div>

                       {/* CI Coverage */}
                       <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 relative">
                          <div className="flex justify-between items-center mb-1">
                             <div className="flex items-center gap-1">
                                 <HeartPulse size={10} className="text-rose-500"/>
                                 <span className="text-[10px] font-bold text-slate-700">危疾</span>
                             </div>
                             <span className="text-[9px] font-medium text-slate-400">目標: ${(ciBenchmark/1000000).toFixed(1)}M</span>
                          </div>
                          <div className="flex items-end justify-between mb-1">
                              <span className="text-sm font-bold text-slate-800 leading-none">${(ciCoverage/1000000).toFixed(2)}M</span>
                              <span className="text-[9px] font-bold text-rose-600">{getProgress(ciCoverage, ciBenchmark).toFixed(0)}%</span>
                          </div>
                          <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden mb-1">
                             <div className={`h-full rounded-full ${ciGap > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${getProgress(ciCoverage, ciBenchmark)}%` }}></div>
                          </div>
                       </div>

                       <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                          <span className="text-[10px] text-slate-500 font-bold">每月總保費</span>
                          <span className="text-xs font-bold text-slate-800">${totalPremiumMonthly.toLocaleString()}</span>
                       </div>
                    </div>
                </div>
            </div>

        </div>

        {/* FOOTER PAGE 1 */}
        <div className="absolute bottom-0 left-0 right-0 pt-4 border-t border-slate-100 text-[9px] text-slate-400 text-center">
             <p>FinsiderPro Wealth Report | Page 1 of 2</p>
        </div>
      </div>
      
      {/* PAGE BREAK */}
      <div className="page-break"></div>

      {/* --- PAGE 2 START --- */}
      <div className="min-h-[290mm] flex flex-col relative pt-8">
          
          {/* HEADER PAGE 2 */}
          <div className="flex items-center gap-3 mb-6 border-b-2 border-slate-900 pb-4">
             <div className="p-2 bg-emerald-50 rounded-lg">
                <Shield size={24} className="text-emerald-600" />
             </div>
             <div>
                <h2 className="text-2xl font-bold text-slate-900">現有保單詳情</h2>
                <p className="text-xs text-slate-500 font-bold mt-1">詳列所有持有的保險計劃及其保障範圍</p>
             </div>
          </div>

          {/* POLICY GRID - COMPACT & OPTIMIZED */}
          <div className="grid grid-cols-2 gap-4 mb-auto content-start">
             {client.insurance.map((pol, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm avoid-break flex flex-col hover:border-emerald-300 transition-colors">
                   {/* Card Header */}
                   <div className="flex justify-between items-start mb-2 pb-2 border-b border-slate-50">
                      <div className="overflow-hidden pr-2">
                         <div className="text-[9px] font-bold text-slate-400 uppercase mb-0.5 truncate">{pol.provider}</div>
                         <div className="text-sm font-bold text-slate-800 leading-tight truncate" title={pol.name}>{pol.name}</div>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide whitespace-nowrap ${
                         pol.type === 'Life' ? 'bg-blue-50 text-blue-600' :
                         pol.type === 'Critical Illness' ? 'bg-rose-50 text-rose-600' :
                         pol.type === 'Medical' ? 'bg-emerald-50 text-emerald-600' :
                         'bg-slate-100 text-slate-600'
                      }`}>
                         {pol.type}
                      </span>
                   </div>

                   {/* Key Stats - Compact Grid */}
                   <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="bg-slate-50 p-2 rounded border border-slate-100">
                         <span className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">保障額</span>
                         <span className="text-sm font-bold text-slate-900 block truncate">
                            ${pol.coverageAmount.toLocaleString()}
                         </span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded border border-slate-100">
                         <span className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">保費 ({pol.premiumFrequency === 'Monthly' ? '月' : '年'})</span>
                         <span className="text-sm font-bold text-slate-900">${pol.premium.toLocaleString()}</span>
                      </div>
                   </div>

                   {/* Details Grid - Removed Beneficiary */}
                   <div className="space-y-1.5 text-[10px] mb-2 flex-1">
                      <div className="flex justify-between border-b border-slate-50 pb-1">
                         <span className="text-slate-500 font-medium">性質</span>
                         <span className="font-bold text-slate-700">{pol.nature === 'Savings' ? '儲蓄型' : '消費型'}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 pb-1">
                         <span className="text-slate-500 font-medium">退保價值</span>
                         <span className="font-bold text-slate-700">${(pol.surrenderValue || 0).toLocaleString()}</span>
                      </div>
                      {pol.policyNotes && (
                         <div className="bg-amber-50 p-1.5 rounded text-amber-800 border border-amber-100 mt-1 flex items-start gap-1.5">
                            <FileText size={10} className="mt-0.5 shrink-0" />
                            <span className="leading-snug line-clamp-2">{pol.policyNotes}</span>
                         </div>
                      )}
                   </div>

                   {/* Riders Section - Compact */}
                   {(pol.riders && pol.riders.length > 0) && (
                      <div className="mt-auto pt-2 border-t border-slate-100">
                         <span className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">附約 (Riders)</span>
                         <div className="space-y-1">
                            {pol.riders.map((r, ridx) => (
                               <div key={ridx} className="flex justify-between items-center text-[9px] bg-slate-50 px-1.5 py-1 rounded">
                                  <span className="font-bold text-slate-600 truncate max-w-[100px]">{r.name}</span>
                                  <span className="font-mono text-slate-500">+${r.coverageAmount.toLocaleString()}</span>
                               </div>
                            ))}
                         </div>
                      </div>
                   )}
                </div>
             ))}
          </div>

          {/* FOOTER PAGE 2 */}
          <div className="absolute bottom-0 left-0 right-0 pt-4 border-t border-slate-100 text-[9px] text-slate-400 text-center">
             <p>CONFIDENTIAL | Page 2 of 2</p>
          </div>
      </div>

    </div>
  );
};
