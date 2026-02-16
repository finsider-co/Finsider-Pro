
import React from 'react';
import { ClientProfile, AssetType } from '../types';
import { calculateAge } from '../constants';
import { Sparkles, TrendingUp, DollarSign, Shield, Activity, PieChart, Wallet, HeartPulse } from 'lucide-react';

interface Props {
  client: ClientProfile;
}

export const PrintableReport: React.FC<Props> = ({ client }) => {
  const age = calculateAge(client.dateOfBirth);
  
  // Totals
  const portfolioValue = client.portfolio.reduce((sum, item) => sum + (item.currentPrice * item.shares), 0);
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
    <div className="w-full bg-white text-slate-900 text-xs leading-relaxed p-10 font-sans h-auto block">
      
      {/* Header - Keep Together */}
      <div className="flex justify-between items-center border-b-2 border-slate-800 pb-4 mb-8 avoid-break">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 text-white p-2.5 rounded-lg">
              <Sparkles size={24} className="text-emerald-400" />
          </div>
          <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{client.name}</h1>
              <p className="text-slate-500 font-semibold text-xs mt-0.5">專屬財務規劃報告 (Wealth Management Report)</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex gap-4 text-slate-600 font-bold mb-1 text-xs">
              <span className="bg-slate-100 px-3 py-1.5 rounded">年齡: {age}</span>
              <span className="bg-slate-100 px-3 py-1.5 rounded">目標退休: {client.retirementAge}</span>
              <span className="bg-slate-100 px-3 py-1.5 rounded">日期: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Top Cards - Key Metrics - Keep Together */}
      <div className="grid grid-cols-4 gap-6 mb-8 avoid-break">
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider mb-1">資產淨值 (Net Worth)</span>
            <span className="text-2xl font-bold text-slate-900 block tracking-tight">${netWorth.toLocaleString()}</span>
        </div>
        <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 shadow-sm">
            <span className="text-blue-500 block text-[10px] uppercase font-bold tracking-wider mb-1">總資產 (Total Assets)</span>
            <span className="text-xl font-bold text-blue-700 block">${totalAssets.toLocaleString()}</span>
        </div>
        <div className="bg-red-50/50 p-5 rounded-xl border border-red-100 shadow-sm">
            <span className="text-red-500 block text-[10px] uppercase font-bold tracking-wider mb-1">總負債 (Liabilities)</span>
            <span className="text-xl font-bold text-red-700 block">${totalLiabilities.toLocaleString()}</span>
        </div>
        <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100 shadow-sm">
            <span className="text-emerald-600 block text-[10px] uppercase font-bold tracking-wider mb-1">每月盈餘 (Surplus)</span>
            <span className="text-xl font-bold text-emerald-700 block">+${monthlySavings.toLocaleString()}</span>
        </div>
      </div>

      {/* Main Content Grid - Remove 'items-start' to allow flow */}
      <div className="grid grid-cols-3 gap-10">
        
        {/* Column 1: Cashflow & Assets Summary */}
        <div className="col-span-1 space-y-6">
            {/* Cashflow Card - No 'avoid-break' on container, only on header/items if needed */}
            <div className="bg-white rounded-xl">
              <div className="mb-4 avoid-break">
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Activity size={16} className="text-blue-500" /> 現金流分析 (Monthly)
                </h3>
                <div className="bg-slate-50 rounded-lg border border-slate-100 p-4 mb-3">
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-500 font-bold">總收入</span>
                      <span className="font-bold text-slate-800">${monthlyIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-500 font-bold">總支出</span>
                      <span className="font-bold text-red-600">-${monthlyExpense.toLocaleString()}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-xs font-bold text-emerald-600">儲蓄率 (Savings Rate)</span>
                      <span className="font-bold text-emerald-600 text-sm">{savingsRatio.toFixed(1)}%</span>
                    </div>
                </div>
              </div>
              
              <div className="avoid-break mb-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase">主要支出 (Top Expenses)</h4>
              </div>
              {/* Use table for list to allow cleaner breaks if needed */}
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

            {/* Assets/Liabilities - Allow break between sections */}
            <div>
              <div className="avoid-break mb-3">
                 <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                     <Wallet size={16} className="text-emerald-500" /> 資產負債表 (Balance Sheet)
                 </h3>
              </div>
              
              <div className="mb-6">
                  <table className="w-full text-xs mb-2">
                    <thead className="text-[10px] font-bold text-slate-400 uppercase">
                       <tr>
                         <th className="text-left pb-1">主要資產</th>
                         <th className="text-right pb-1">價值</th>
                       </tr>
                    </thead>
                    <tbody>
                        {client.assets.slice(0, 4).map((a, i) => (
                            <tr key={i} className="border-b border-slate-50 avoid-break">
                               <td className="py-1.5 text-slate-600 truncate max-w-[120px]">{a.name}</td>
                               <td className="py-1.5 text-right font-bold text-slate-800">${a.value.toLocaleString()}</td>
                            </tr>
                        ))}
                        {portfolioValue > 0 && (
                            <tr className="bg-slate-50 rounded avoid-break">
                               <td className="py-1.5 px-1 text-slate-700 font-bold">投資組合 (Portfolio)</td>
                               <td className="py-1.5 px-1 text-right text-emerald-600 font-bold">${portfolioValue.toLocaleString()}</td>
                            </tr>
                        )}
                    </tbody>
                  </table>
              </div>

              <div>
                  <table className="w-full text-xs">
                    <thead className="text-[10px] font-bold text-slate-400 uppercase">
                       <tr>
                         <th className="text-left pb-1">主要負債</th>
                         <th className="text-right pb-1">金額</th>
                       </tr>
                    </thead>
                    <tbody>
                        {client.liabilities.map((l, i) => (
                            <tr key={i} className="border-b border-slate-50 avoid-break">
                               <td className="py-1.5 text-slate-600 truncate max-w-[120px]">{l.name}</td>
                               <td className="py-1.5 text-right font-bold text-red-600">${l.amount.toLocaleString()}</td>
                            </tr>
                        ))}
                        {client.liabilities.length === 0 && (
                            <tr><td colSpan={2} className="text-xs text-slate-400 italic py-1 text-center">無負債記錄</td></tr>
                        )}
                    </tbody>
                  </table>
              </div>
            </div>
        </div>

        {/* Column 2: Portfolio & Health Analysis */}
        <div className="col-span-1 space-y-6">
            {/* Financial Health Analysis - Keep atomic */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 avoid-break">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <TrendingUp size={16} className="text-purple-500" /> 財務健康檢查
              </h3>
              
              <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-600">流動性比率 (Liquidity)</span>
                        <span className={`font-bold ${liquidityRatio >= 6 ? 'text-emerald-600' : liquidityRatio >= 3 ? 'text-blue-600' : 'text-amber-500'}`}>
                          {liquidityRatio.toFixed(1)} 個月
                        </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full">
                        <div className={`h-2 rounded-full ${liquidityRatio >= 6 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${Math.min((liquidityRatio/12)*100, 100)}%` }}></div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">建議: 6 個月以上</p>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-600">債務比率 (Debt Ratio)</span>
                        <span className={`font-bold ${debtRatio < 30 ? 'text-emerald-600' : 'text-amber-500'}`}>
                          {debtRatio.toFixed(1)}%
                        </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full">
                        <div className={`h-2 rounded-full ${debtRatio < 30 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(debtRatio, 100)}%` }}></div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">建議: 低於 50%</p>
                  </div>
              </div>
            </div>

            {/* Portfolio Holdings - Use THEAD for repeating headers */}
            <div>
              <div className="avoid-break mb-2">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                    <PieChart size={16} className="text-indigo-500" /> 投資組合配置
                </h3>
              </div>
              <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase">
                    <tr>
                        <th className="text-left py-2 px-2 rounded-l">Ticker</th>
                        <th className="text-left py-2">Name</th>
                        <th className="text-right py-2 px-2 rounded-r">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {client.portfolio.slice(0, 12).map((p, i) => (
                        <tr key={i} className="border-b border-slate-50 last:border-0 avoid-break">
                          <td className="py-2.5 px-2 font-bold text-slate-700">{p.ticker}</td>
                          <td className="py-2.5 text-slate-600 truncate max-w-[80px]">{p.name}</td>
                          <td className="py-2.5 px-2 text-right font-bold text-slate-800">${(p.shares * p.currentPrice).toLocaleString()}</td>
                        </tr>
                    ))}
                    {client.portfolio.length === 0 && (
                        <tr><td colSpan={3} className="text-center py-6 text-slate-400 italic">暫無投資持倉</td></tr>
                    )}
                  </tbody>
              </table>
            </div>
        </div>

        {/* Column 3: Insurance & Protection */}
        <div className="col-span-1 space-y-6">
            <div>
              <div className="avoid-break mb-3">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                      <Shield size={16} className="text-rose-500" /> 保障摘要
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4 mb-4">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-blue-500 uppercase">人壽保額</span>
                            <Shield size={14} className="text-blue-400"/>
                        </div>
                        <span className="text-xl font-bold text-blue-800 block">${lifeCoverage.toLocaleString()}</span>
                      </div>
                      <div className="bg-rose-50 p-4 rounded-lg border border-rose-100">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-rose-500 uppercase">危疾保額</span>
                            <HeartPulse size={14} className="text-rose-400"/>
                        </div>
                        <span className="text-xl font-bold text-rose-800 block">${ciCoverage.toLocaleString()}</span>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-600">每月總保費</span>
                        <span className="font-bold text-slate-800 text-sm">${totalPremiumMonthly.toLocaleString()}</span>
                      </div>
                  </div>

                  <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">保單列表</h4>
              </div>
              
              {/* Allow policies to flow */}
              <div className="space-y-3">
                  {client.insurance.map((pol, i) => (
                    <div key={i} className="border border-slate-200 rounded-lg p-3 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.02)] avoid-break">
                        <div className="flex justify-between mb-1">
                          <span className="font-bold text-slate-800 text-xs">{pol.provider}</span>
                          <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold">{pol.type}</span>
                        </div>
                        <div className="text-xs text-emerald-600 font-medium mb-1.5 truncate">{pol.name}</div>
                        <div className="flex justify-between text-[10px] text-slate-500 border-t border-slate-50 pt-1.5">
                          <span>保額: <span className="font-bold text-slate-800">${pol.coverageAmount.toLocaleString()}</span></span>
                          <span>保費: <span className="font-bold text-slate-800">${pol.premium.toLocaleString()}</span></span>
                        </div>
                    </div>
                  ))}
              </div>
            </div>
        </div>
      </div>
      
      {/* Disclaimer Footer - Keep Together */}
      <div className="pt-4 mt-8 border-t border-slate-100 text-[9px] text-slate-400 text-center leading-normal avoid-break">
         <p>免責聲明：本報告所載資料僅供參考，並不構成任何要約、招攬、建議、意見或任何保證。FinsiderPro 系統已盡力確保資料準確，惟不保證其完整性或準確性。投資涉及風險，證券價格有時可能會非常波動。過往表現未必可作為日後業績的指標。</p>
         <p className="mt-1">FinsiderPro Wealth Management System | Confidential Document</p>
      </div>

    </div>
  );
};
