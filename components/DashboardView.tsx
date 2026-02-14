import React from 'react';
import { ClientProfile, AssetType } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { COLORS } from '../constants';
import { TrendingUp, TrendingDown, DollarSign, Activity, Percent, AlertCircle } from 'lucide-react';

interface Props {
  data: ClientProfile;
}

export const DashboardView: React.FC<Props> = ({ data }) => {
  // Calculate Portfolio Value
  const portfolioValue = data.portfolio.reduce((sum, item) => sum + (item.currentPrice * item.shares), 0);

  // Total Assets = Manual Assets + Portfolio Value
  // Note: This assumes manual assets do not duplicate portfolio items. 
  // If the user maintains them separately, this gives the complete picture.
  const manualAssetsValue = data.assets.reduce((sum, item) => sum + item.value, 0);
  const totalAssets = manualAssetsValue + portfolioValue;
  
  const totalLiabilities = data.liabilities.reduce((sum, item) => sum + item.amount, 0);
  const netWorth = totalAssets - totalLiabilities;
  
  // Income & Expenses Calculation
  const monthlyIncome = data.cashFlow
    .filter(c => c.isIncome && c.frequency === 'Monthly')
    .reduce((sum, c) => sum + c.amount, 0);
    
  const monthlyExpenses = data.cashFlow
    .filter(c => !c.isIncome && c.frequency === 'Monthly')
    .reduce((sum, c) => sum + c.amount, 0);

  const cashFlowSavings = monthlyIncome - monthlyExpenses;

  // --- Financial Health Ratios ---

  // 1. Liquidity Ratio (Quick Ratio) - Emergency Fund in months
  const liquidAssets = data.assets
    .filter(a => a.type === AssetType.CASH)
    .reduce((sum, a) => sum + a.value, 0);
  const liquidityRatio = monthlyExpenses > 0 ? (liquidAssets / monthlyExpenses) : 0;
  
  // 2. Savings Ratio
  const savingsRatio = monthlyIncome > 0 ? (cashFlowSavings / monthlyIncome) * 100 : 0;

  // 3. Debt-to-Asset Ratio (Solvency)
  const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

  // 4. Debt Service Ratio (Monthly Debt Payments / Monthly Income)
  const monthlyDebtPayments = data.liabilities.reduce((sum, l) => sum + l.monthlyPayment, 0);
  const debtServiceRatio = monthlyIncome > 0 ? (monthlyDebtPayments / monthlyIncome) * 100 : 0;


  // Prepare Pie Chart Data (Asset Allocation by Type)
  const allocationMap = new Map<string, number>();
  
  // Add Manual Assets
  data.assets.forEach(asset => {
    allocationMap.set(asset.type, (allocationMap.get(asset.type) || 0) + asset.value);
  });

  // Add Portfolio Assets (Classify as EQUITY for simplicity, or based on logic if available)
  // Here we treat general portfolio items as EQUITY unless specified otherwise, 
  // but to be precise, we can just add a "Portfolio" category or merge into Equity.
  // For this view, let's merge into '股票' (Equity) as default for portfolio items
  if (portfolioValue > 0) {
     const currentEquity = allocationMap.get(AssetType.EQUITY) || 0;
     allocationMap.set(AssetType.EQUITY, currentEquity + portfolioValue);
  }

  const allocationData = Array.from(allocationMap).map(([name, value]) => ({ name, value }));

  // Custom Label for Pie Chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Hide labels for small slices
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
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">資產淨值 (Net Worth)</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">
                ${netWorth.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl">
              <TrendingUp className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 mt-4 flex items-center gap-1 font-medium">
            <span className="bg-emerald-100 px-2 py-0.5 rounded text-emerald-700">+4.2%</span> 較上月增長
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">每月盈餘 (Monthly Surplus)</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">
                ${cashFlowSavings.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <DollarSign className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5">
            <div 
              className="bg-blue-500 h-1.5 rounded-full" 
              style={{ width: `${Math.min((monthlyExpenses / monthlyIncome) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            支出佔收入 {Math.round((monthlyExpenses / monthlyIncome) * 100)}%
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">總資產 (Total Assets)</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">
                ${totalAssets.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <TrendingUp className="h-6 w-6 text-purple-500" />
            </div>
          </div>
           <p className="text-xs text-slate-500 mt-4">
            分佈於 {allocationData.length} 個資產類別
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">總負債 (Total Liabilities)</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">
                ${totalLiabilities.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl">
              <TrendingDown className="h-6 w-6 text-amber-500" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            資產負債比率: {((totalLiabilities / totalAssets) * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Financial Health Analysis Grid */}
      <h3 className="text-xl font-bold text-slate-800 px-1">財務健康檢查 (Financial Health Check)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={20} className="text-emerald-500" />
            <h4 className="font-semibold text-slate-700">流動性比率</h4>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900">{liquidityRatio.toFixed(1)} <span className="text-sm font-normal text-slate-500">個月</span></p>
            <p className="text-xs text-slate-400 mt-1">目標: 3-6 個月生活費</p>
          </div>
          <div className={`mt-auto pt-4 border-t border-slate-50 text-xs font-bold uppercase tracking-wide ${liquidityRatio >= 3 ? 'text-emerald-500' : 'text-amber-500'}`}>
            {liquidityRatio >= 3 ? '健康 (Healthy)' : '需關注 (Attention)'}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
           <div className="flex items-center gap-2 mb-2">
            <Percent size={20} className="text-blue-500" />
            <h4 className="font-semibold text-slate-700">儲蓄比率</h4>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900">{savingsRatio.toFixed(1)}%</p>
            <p className="text-xs text-slate-400 mt-1">目標: &gt;20% 收入</p>
          </div>
          <div className={`mt-auto pt-4 border-t border-slate-50 text-xs font-bold uppercase tracking-wide ${savingsRatio >= 20 ? 'text-emerald-500' : 'text-amber-500'}`}>
            {savingsRatio >= 20 ? '理想 (Ideal)' : '低於目標 (Below Target)'}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
           <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={20} className="text-amber-500" />
            <h4 className="font-semibold text-slate-700">資產負債比率</h4>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900">{debtToAssetRatio.toFixed(1)}%</p>
            <p className="text-xs text-slate-400 mt-1">目標: &lt;50%</p>
          </div>
          <div className={`mt-auto pt-4 border-t border-slate-50 text-xs font-bold uppercase tracking-wide ${debtToAssetRatio < 50 ? 'text-emerald-500' : 'text-amber-500'}`}>
            {debtToAssetRatio < 50 ? '健康 (Healthy)' : '高槓桿 (High Leverage)'}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
           <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={20} className="text-red-500" />
            <h4 className="font-semibold text-slate-700">供款佔入息比率</h4>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900">{debtServiceRatio.toFixed(1)}%</p>
            <p className="text-xs text-slate-400 mt-1">目標: &lt;35% 收入</p>
          </div>
          <div className={`mt-auto pt-4 border-t border-slate-50 text-xs font-bold uppercase tracking-wide ${debtServiceRatio < 35 ? 'text-emerald-500' : 'text-amber-500'}`}>
            {debtServiceRatio < 35 ? '可負擔 (Manageable)' : '負擔過重 (High Burden)'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Asset Allocation Chart */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 lg:col-span-1">
          <h4 className="text-lg font-bold text-slate-800 mb-6">資產分佈 (Asset Allocation)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {allocationData.map((entry, index) => (
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
          </div>
          <div className="mt-6 space-y-3">
            {allocationData.map((entry, index) => (
              <div key={entry.name} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-slate-600 font-medium">{entry.name}</span>
                </div>
                <span className="font-bold text-slate-900">${entry.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Updates & Priorities */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
           <h4 className="text-lg font-bold text-slate-800 mb-6">財務策劃建議 (Priorities)</h4>
           <div className="space-y-4">
              {debtServiceRatio > 35 && (
                 <div className="flex items-start gap-4 p-5 bg-red-50 rounded-xl border border-red-100">
                    <div className="bg-red-100 p-2 rounded-full text-red-600 mt-1"><AlertCircle size={18} /></div>
                    <div>
                      <h5 className="font-bold text-red-800 text-base">供款壓力過大</h5>
                      <p className="text-sm text-red-600 mt-1">客戶每月 {debtServiceRatio.toFixed(1)}% 的收入用於償還債務。建議考慮債務重組或轉按以降低利息支出。</p>
                    </div>
                 </div>
              )}
              {liquidityRatio < 3 && (
                 <div className="flex items-start gap-4 p-5 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="bg-amber-100 p-2 rounded-full text-amber-600 mt-1"><Activity size={18} /></div>
                    <div>
                      <h5 className="font-bold text-amber-800 text-base">流動資金不足</h5>
                      <p className="text-sm text-amber-600 mt-1">緊急預備金僅足夠維持 {liquidityRatio.toFixed(1)} 個月。建議增加現金儲備以應付不時之需。</p>
                    </div>
                 </div>
              )}
              {savingsRatio > 25 && (
                 <div className="flex items-start gap-4 p-5 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="bg-emerald-100 p-2 rounded-full text-emerald-600 mt-1"><TrendingUp size={18} /></div>
                    <div>
                      <h5 className="font-bold text-emerald-800 text-base">儲蓄能力優秀</h5>
                      <p className="text-sm text-emerald-600 mt-1">客戶每月儲蓄率達 {savingsRatio.toFixed(1)}%。這是一個極佳的機會將閒置資金投入到更高回報的投資組合或稅務優惠計劃中。</p>
                    </div>
                 </div>
              )}
              
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                 <h5 className="font-bold text-slate-800 mb-2">下次檢討日期</h5>
                 <p className="text-sm text-slate-500">年度投資組合再平衡將於 45 天後進行。</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};