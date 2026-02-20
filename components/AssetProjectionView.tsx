import React, { useState, useMemo } from 'react';
import { ClientProfile, ProjectedPolicy } from '../types';
import { TrendingUp, Calculator, Plus, Trash2, DollarSign, Calendar, LineChart as LineChartIcon, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Line, Bar } from 'recharts';

interface Props {
  data: ClientProfile;
  onUpdate: (updatedClient: ClientProfile) => void;
}

export const AssetProjectionView: React.FC<Props> = ({ data, onUpdate }) => {
  // --- State ---
  const [projectionYears, setProjectionYears] = useState<number>(30);
  const [inflationRate, setInflationRate] = useState<number>(2.5);
  const [assetGrowthRate, setAssetGrowthRate] = useState<number>(5.0);
  const [savingsReturnRate, setSavingsReturnRate] = useState<number>(4.0);
  const [generalYieldRate, setGeneralYieldRate] = useState<number>(3.0); // New: General Portfolio Yield
  
  // Monthly Savings (Default from Cashflow)
  const monthlyIncome = data.cashFlow.filter(c => c.isIncome).reduce((sum, c) => sum + (c.frequency === 'Monthly' ? c.amount : c.amount/12), 0);
  const monthlyExpense = data.cashFlow.filter(c => !c.isIncome).reduce((sum, c) => sum + (c.frequency === 'Monthly' ? c.amount : c.amount/12), 0);
  const defaultMonthlySavings = Math.max(0, monthlyIncome - monthlyExpense);
  const [monthlySavings, setMonthlySavings] = useState<number>(Math.round(defaultMonthlySavings));

  // Smart Assets (Manual + Imported)
  const [smartAssets, setSmartAssets] = useState<ProjectedPolicy[]>(data.projectedPolicies || []);
  
  // New Asset Form State
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetValue, setNewAssetValue] = useState(1000000);
  const [newAssetStartAge, setNewAssetStartAge] = useState(60); // Target Age
  const [newAssetGrowth, setNewAssetGrowth] = useState(4.0);
  const [newAssetDividend, setNewAssetDividend] = useState(6.0);
  const [newAssetDivStartAge, setNewAssetDivStartAge] = useState(60);

  // Persistence Helper
  const updateSmartAssets = (newAssets: ProjectedPolicy[]) => {
    setSmartAssets(newAssets);
    // Persist to client profile
    onUpdate({
      ...data,
      projectedPolicies: newAssets
    });
  };

  // ... (Calculations remain the same) ...
  const currentYear = new Date().getFullYear();
  const birthYear = data.dateOfBirth ? new Date(data.dateOfBirth).getFullYear() : currentYear - 30;
  const currentAge = currentYear - birthYear;
  
  // Initial Values
  const portfolioValue = data.portfolio.reduce((sum, item) => sum + (item.currentPrice * item.shares), 0);
  const manualAssetsValue = data.assets.reduce((sum, item) => sum + item.value, 0);
  const initialTotalAssets = manualAssetsValue + portfolioValue;
  const initialLiabilities = data.liabilities.reduce((sum, item) => sum + item.amount, 0);

  // Projection Logic
  const projectionData = useMemo(() => {
    const result = [];
    let currentBaseAssets = initialTotalAssets;
    let accumulatedSavings = 0;
    let currentLiabilities = initialLiabilities;

    // Smart Assets State Tracking
    // We assume Smart Assets are "Injected" or "Mature" at their startAge.
    // Before startAge, they are 0 (or handled separately if we wanted to track premiums, but simplified for now).
    // Once they hit startAge, they start at initialValue and grow/pay out.
    let currentSmartAssets = smartAssets.map(asset => ({
      ...asset,
      currentValue: 0,
      hasStarted: false
    }));

    for (let i = 0; i <= projectionYears; i++) {
      const year = currentYear + i;
      const age = currentAge + i;
      
      // 1. Apply Growth to Base Assets & Savings
      if (i > 0) {
        currentBaseAssets = currentBaseAssets * (1 + assetGrowthRate / 100);
        accumulatedSavings = accumulatedSavings * (1 + savingsReturnRate / 100);
        accumulatedSavings += (monthlySavings * 12);
        currentLiabilities = currentLiabilities * 0.95; 
      }

      // 2. Process Smart Assets
      let totalSmartAssetsValue = 0;
      let totalSmartAssetsPassiveIncome = 0;

      currentSmartAssets = currentSmartAssets.map(asset => {
        let newValue = asset.currentValue;
        let hasStarted = asset.hasStarted;

        // Check if asset matures/starts this year
        if (!hasStarted && age >= asset.startAge) {
           newValue = asset.initialValue;
           hasStarted = true;
        } else if (hasStarted) {
           // Grow existing asset
           newValue = newValue * (1 + asset.growthRate / 100);
        }

        // Calculate Dividend/Passive Income
        let passiveIncome = 0;
        if (hasStarted && age >= asset.dividendStartAge && newValue > 0) {
           passiveIncome = newValue * (asset.dividendRate / 100);
           // Note: We assume dividend is withdrawn (passive income), so it doesn't compound into the asset value?
           // Or does the asset grow AND pay dividend? 
           // User said: "Savings plan continues to grow". 
           // Usually, if you take 6% out, growth is impacted. 
           // But if the user says "Value grows X% AND pays Y%", we follow that.
           // Let's assume the Growth Rate is the NET growth of the policy cash value, 
           // and Dividend Rate is the payout on top (or coupon).
        }

        if (hasStarted) {
            totalSmartAssetsValue += newValue;
            totalSmartAssetsPassiveIncome += passiveIncome;
        }

        return { ...asset, currentValue: newValue, hasStarted };
      });

      // 3. Calculate Totals
      // Base Passive Income = (Base Assets + Savings) * General Yield
      const basePassiveIncome = (currentBaseAssets + accumulatedSavings) * (generalYieldRate / 100);
      
      const totalAssets = currentBaseAssets + accumulatedSavings + totalSmartAssetsValue;
      const totalPassiveIncome = basePassiveIncome + totalSmartAssetsPassiveIncome;
      const netWorth = totalAssets - currentLiabilities;

      // Inflation Adjustment
      const inflationFactor = Math.pow(1 + inflationRate / 100, i);
      const realNetWorth = netWorth / inflationFactor;

      result.push({
        year,
        age,
        totalAssets: Math.round(totalAssets),
        netWorth: Math.round(netWorth),
        realNetWorth: Math.round(realNetWorth),
        passiveIncome: Math.round(totalPassiveIncome / 12), // Monthly
        liabilities: Math.round(currentLiabilities)
      });
    }
    return result;
  }, [projectionYears, inflationRate, assetGrowthRate, savingsReturnRate, monthlySavings, smartAssets, initialTotalAssets, initialLiabilities, currentAge, currentYear, generalYieldRate]);

  // --- Handlers ---
  const addSmartAsset = () => {
    if (!newAssetName || newAssetValue <= 0) return;
    const newAsset: ProjectedPolicy = {
      id: Date.now().toString(),
      name: newAssetName,
      startAge: newAssetStartAge,
      initialValue: newAssetValue,
      growthRate: newAssetGrowth,
      dividendRate: newAssetDividend,
      dividendStartAge: newAssetDivStartAge,
      type: 'ASSET'
    };
    updateSmartAssets([...smartAssets, newAsset]);
    setNewAssetName('');
    setNewAssetValue(1000000);
  };

  const removeSmartAsset = (id: string) => {
    updateSmartAssets(smartAssets.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      
      {/* Header - Clean, no cards */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="text-emerald-500" /> 資產預測 (Asset Projection)
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            預測未來 {projectionYears} 年的資產增長及被動收入，協助規劃退休及財務自由。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Controls & Inputs */}
        <div className="space-y-6">
           
           {/* 1. Basic Parameters */}
           <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                 <Calculator size={18} className="text-blue-500" /> 基礎參數設定
              </h3>
              
              <div className="space-y-4">
                 <div>
                    <div className="flex justify-between mb-1">
                       <label className="text-xs font-bold text-slate-500">預測年期 (Years)</label>
                       <span className="text-xs font-bold text-blue-600">{projectionYears} 年 (至 {currentAge + projectionYears} 歲)</span>
                    </div>
                    <input 
                      type="range" min="1" max="40" step="1"
                      value={projectionYears} onChange={(e) => setProjectionYears(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1">現有資產增長 (%)</label>
                       <input 
                         type="number" value={assetGrowthRate} onChange={(e) => setAssetGrowthRate(parseFloat(e.target.value))}
                         className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold"
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1">新資金回報 (%)</label>
                       <input 
                         type="number" value={savingsReturnRate} onChange={(e) => setSavingsReturnRate(parseFloat(e.target.value))}
                         className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold"
                       />
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">一般資產派息率 (%)</label>
                    <div className="flex items-center gap-2">
                        <input 
                          type="number" value={generalYieldRate} onChange={(e) => setGeneralYieldRate(parseFloat(e.target.value))}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold"
                        />
                        <div className="group relative">
                            <HelpCircle size={14} className="text-slate-400 cursor-help" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                適用於一般投資組合及現金儲蓄的預期年派息率，用於計算基礎被動收入。
                            </div>
                        </div>
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">每月儲蓄投入 ($)</label>
                    <div className="relative">
                       <span className="absolute left-3 top-2 text-slate-400 text-sm">$</span>
                       <input 
                         type="number" value={monthlySavings} onChange={(e) => setMonthlySavings(parseFloat(e.target.value))}
                         className="w-full p-2 pl-6 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold"
                       />
                    </div>
                 </div>
                 
                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">通脹率 (%) <span className="text-[10px] font-normal text-slate-400">- 用於計算實質價值</span></label>
                    <input 
                      type="number" value={inflationRate} onChange={(e) => setInflationRate(parseFloat(e.target.value))}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold"
                    />
                 </div>
              </div>
           </div>

           {/* 2. Smart Assets (Policies/Investments) */}
           <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                 <Plus size={18} className="text-emerald-500" /> 新增預期資產 / 保單
              </h3>
              
              {/* Add New Form */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4 space-y-3">
                 <input 
                   placeholder="項目名稱 (e.g. 儲蓄保單 A)" 
                   value={newAssetName} onChange={(e) => setNewAssetName(e.target.value)}
                   className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                 />
                 <div className="grid grid-cols-2 gap-2">
                    <div>
                       <label className="text-[10px] font-bold text-slate-400 block mb-1">預期生效歲數</label>
                       <input 
                         type="number"
                         value={newAssetStartAge} onChange={(e) => setNewAssetStartAge(parseInt(e.target.value))}
                         className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                       />
                    </div>
                    <div>
                       <label className="text-[10px] font-bold text-slate-400 block mb-1">預期價值 ($)</label>
                       <input 
                         type="number"
                         value={newAssetValue} onChange={(e) => setNewAssetValue(parseFloat(e.target.value))}
                         className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                       />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                    <div>
                       <label className="text-[10px] font-bold text-slate-400 block mb-1">每年增長 (%)</label>
                       <input 
                         type="number"
                         value={newAssetGrowth} onChange={(e) => setNewAssetGrowth(parseFloat(e.target.value))}
                         className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                       />
                    </div>
                    <div>
                       <label className="text-[10px] font-bold text-slate-400 block mb-1">派息率 (%)</label>
                       <input 
                         type="number"
                         value={newAssetDividend} onChange={(e) => setNewAssetDividend(parseFloat(e.target.value))}
                         className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                       />
                    </div>
                 </div>
                 {newAssetDividend > 0 && (
                    <div>
                       <label className="text-[10px] font-bold text-slate-400 block mb-1">開始派息歲數</label>
                       <input 
                         type="number"
                         value={newAssetDivStartAge} onChange={(e) => setNewAssetDivStartAge(parseInt(e.target.value))}
                         className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                       />
                    </div>
                 )}
                 
                 <button 
                   onClick={addSmartAsset}
                   className="w-full py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors"
                 >
                    加入預測
                 </button>
              </div>

              {/* List */}
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                 {smartAssets.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-2">暫無額外投資項目</p>
                 )}
                 {smartAssets.map(asset => (
                    <div key={asset.id} className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                       <div className="flex justify-between items-start mb-1">
                          <p className="text-xs font-bold text-slate-700">{asset.name}</p>
                          <button onClick={() => removeSmartAsset(asset.id)} className="text-slate-300 hover:text-red-400">
                             <Trash2 size={14} />
                          </button>
                       </div>
                       <div className="flex flex-wrap gap-2 text-[10px] text-slate-500">
                          <span className="bg-slate-50 px-1.5 py-0.5 rounded">{asset.startAge}歲開始</span>
                          <span className="bg-slate-50 px-1.5 py-0.5 rounded">${asset.initialValue.toLocaleString()}</span>
                          <span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">+{asset.growthRate}% 增長</span>
                          {asset.dividendRate > 0 && (
                             <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{asset.dividendRate}% 派息 (@{asset.dividendStartAge}歲)</span>
                          )}
                       </div>
                    </div>
                 ))}
              </div>
           </div>

        </div>

        {/* Right Column: Charts & Analysis */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* Main Chart */}
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[600px] flex flex-col">
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <h3 className="font-bold text-slate-800 text-lg">資產增長趨勢</h3>
                    <p className="text-xs text-slate-500 mt-1">預測期內資產淨值及被動收入的變化</p>
                 </div>
                 <div className="flex gap-6">
                    <div className="text-right">
                       <p className="text-xs text-slate-400 font-bold uppercase mb-1">預測總資產</p>
                       <p className="text-xl font-bold text-blue-600">${projectionData[projectionData.length-1].totalAssets.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-xs text-slate-400 font-bold uppercase mb-1">預測資產淨值</p>
                       <p className="text-xl font-bold text-emerald-600">${projectionData[projectionData.length-1].netWorth.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-xs text-slate-400 font-bold uppercase mb-1">預測月被動收入</p>
                       <p className="text-xl font-bold text-amber-500">${projectionData[projectionData.length-1].passiveIncome.toLocaleString()}</p>
                    </div>
                 </div>
              </div>
              
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                   <ComposedChart data={projectionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                         <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                         </linearGradient>
                      </defs>
                      <XAxis 
                         dataKey="age" 
                         type="number" 
                         domain={['dataMin', 'dataMax']} 
                         tickCount={10}
                         axisLine={false} 
                         tickLine={false} 
                         tick={{fill: '#94a3b8', fontSize: 12}} 
                         dy={10} 
                         label={{ value: '年齡', position: 'insideBottomRight', offset: -5, fill: '#94a3b8', fontSize: 10 }}
                      />
                      <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(val) => `$${val/1000000}M`} />
                      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(val) => `$${val/1000}K`} />
                      <CartesianGrid vertical={false} stroke="#f1f5f9" />
                      <Tooltip 
                         labelFormatter={(age) => `${age} 歲`}
                         contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                         formatter={(value: number) => `$${value.toLocaleString()}`}
                      />
                      <Legend verticalAlign="top" height={36}/>
                      <Area yAxisId="left" type="monotone" dataKey="netWorth" name="資產淨值" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorNetWorth)" />
                      <Line yAxisId="left" type="monotone" dataKey="totalAssets" name="總資產" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      <Bar yAxisId="right" dataKey="passiveIncome" name="預測月被動收入" fill="#f59e0b" opacity={0.5} barSize={20} />
                   </ComposedChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Summary Table */}
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="font-bold text-slate-800">詳細數據 (Detailed Projection)</h3>
                 <span className="text-xs text-slate-400">每 5 年快照</span>
              </div>
              <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-slate-500 font-bold">
                    <tr>
                       <th className="px-6 py-3">年齡 (年份)</th>
                       <th className="px-6 py-3 text-right">資產淨值</th>
                       <th className="px-6 py-3 text-right">實質淨值 (通脹後)</th>
                       <th className="px-6 py-3 text-right">預測月被動收入</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {projectionData.filter((_, i) => i % 5 === 0 || i === projectionData.length - 1).map((row) => (
                       <tr key={row.year} className="hover:bg-slate-50">
                          <td className="px-6 py-3 font-bold text-slate-700">{row.age} 歲 <span className="text-xs font-normal text-slate-400">({row.year})</span></td>
                          <td className="px-6 py-3 text-right font-bold text-emerald-600">${row.netWorth.toLocaleString()}</td>
                          <td className="px-6 py-3 text-right font-medium text-slate-500">${row.realNetWorth.toLocaleString()}</td>
                          <td className="px-6 py-3 text-right font-bold text-amber-500">${row.passiveIncome.toLocaleString()}</td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>

        </div>

      </div>
    </div>
  );
};
