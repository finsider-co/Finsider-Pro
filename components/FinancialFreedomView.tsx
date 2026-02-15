
import React, { useState, useMemo } from 'react';
import { ClientProfile } from '../types';
import { 
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { Flame, TrendingUp, DollarSign, Target, Calculator, RefreshCw } from 'lucide-react';
import { calculateAge } from '../constants';

interface Props {
  data: ClientProfile;
}

export const FinancialFreedomView: React.FC<Props> = ({ data }) => {
  // --- 1. Initial State / Defaults ---
  const currentAge = calculateAge(data.dateOfBirth);
  const currentNetWorth = data.assets.reduce((sum, a) => sum + a.value, 0) - data.liabilities.reduce((sum, l) => sum + l.amount, 0);
  
  const monthlyIncome = data.cashFlow.filter(c => c.isIncome).reduce((sum, c) => sum + (c.frequency === 'Monthly' ? c.amount : c.amount/12), 0);
  const monthlyExpense = data.cashFlow.filter(c => !c.isIncome).reduce((sum, c) => sum + (c.frequency === 'Monthly' ? c.amount : c.amount/12), 0);
  const currentMonthlySavings = Math.max(0, monthlyIncome - monthlyExpense);

  const [targetRetirementAge, setTargetRetirementAge] = useState<number>(data.retirementAge || 60);
  const [lifeExpectancy, setLifeExpectancy] = useState<number>(90);
  // Default desired income to 70% of current income or just equal to current expenses
  const [desiredMonthlyIncomePV, setDesiredMonthlyIncomePV] = useState<number>(monthlyExpense > 0 ? monthlyExpense : 30000);
  
  const [currentInvestableAssets, setCurrentInvestableAssets] = useState<number>(currentNetWorth);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(currentMonthlySavings);
  
  const [inflationRate, setInflationRate] = useState<number>(3.0);
  const [preRetirementReturn, setPreRetirementReturn] = useState<number>(6.0);
  const [postRetirementReturn, setPostRetirementReturn] = useState<number>(4.0);

  // --- 2. Calculations ---
  
  const calculationResults = useMemo(() => {
    const yearsToRetire = Math.max(0, targetRetirementAge - currentAge);
    const yearsInRetirement = Math.max(0, lifeExpectancy - targetRetirementAge);
    
    // Future Value of Monthly Income Needed (adjusted for inflation)
    // FV = PV * (1+r)^n
    const inflationMultiplier = Math.pow(1 + inflationRate / 100, yearsToRetire);
    const futureMonthlyIncomeNeeded = desiredMonthlyIncomePV * inflationMultiplier;
    
    // Required Corpus (FIRE Number) at Retirement Age
    // We treat this as the Present Value of an Annuity Due (payments at start of month) 
    // growing with inflation (Real Return calculation).
    // Real Rate of Return during retirement
    const r_real = (1 + postRetirementReturn / 100) / (1 + inflationRate / 100) - 1;
    const monthlyRealRate = Math.pow(1 + r_real, 1/12) - 1;

    let requiredCorpus = 0;
    
    if (Math.abs(monthlyRealRate) < 0.0001) {
      // If real return is 0, simple multiplication
      requiredCorpus = futureMonthlyIncomeNeeded * 12 * yearsInRetirement;
    } else {
      const n_months = yearsInRetirement * 12;
      // PV of Annuity Formula
      requiredCorpus = futureMonthlyIncomeNeeded * ( (1 - Math.pow(1 + monthlyRealRate, -n_months)) / monthlyRealRate );
    }

    // --- Projection Logic ---
    const chartData = [];
    let projectedAssets = currentInvestableAssets;
    
    // For ideal calculation
    // We need to solve for PMT in FV formula:
    // Target = CurrentAssets * (1+r)^n + PMT * [((1+r)^n - 1)/r]
    // PMT = (Target - CurrentAssets*(1+r)^n) / [((1+r)^n - 1)/r]
    
    const monthlyPreRate = Math.pow(1 + preRetirementReturn/100, 1/12) - 1;
    const totalMonths = yearsToRetire * 12;
    
    const fvCurrentAssets = currentInvestableAssets * Math.pow(1 + preRetirementReturn/100, yearsToRetire);
    const shortfall = requiredCorpus - fvCurrentAssets;
    
    let requiredMonthlySavings = 0;
    if (shortfall > 0 && monthlyPreRate > 0) {
       const factor = (Math.pow(1 + monthlyPreRate, totalMonths) - 1) / monthlyPreRate;
       requiredMonthlySavings = shortfall / factor;
    } else if (shortfall > 0) {
       requiredMonthlySavings = shortfall / totalMonths;
    }

    // Generate Chart Points (Year by Year)
    let idealAssets = currentInvestableAssets;

    for (let i = 0; i <= yearsToRetire + 5; i++) { // Show 5 years past retirement for context
       const age = currentAge + i;
       const isRetired = age >= targetRetirementAge;

       chartData.push({
         age,
         projected: Math.round(projectedAssets),
         ideal: Math.round(idealAssets),
         required: i <= yearsToRetire ? Math.round(requiredCorpus) : null // Show flat line or target point
       });

       if (!isRetired) {
         // Grow Projected
         projectedAssets = projectedAssets * (1 + preRetirementReturn/100) + (monthlyContribution * 12);
         // Grow Ideal
         idealAssets = idealAssets * (1 + preRetirementReturn/100) + (requiredMonthlySavings * 12);
       } else {
         // Decumulation Phase (Simplified for visual)
         // Withdraw annual needs
         // Need to adjust expense for inflation year over year
         const yearsPast = age - targetRetirementAge;
         const annualExpense = (desiredMonthlyIncomePV * 12) * Math.pow(1 + inflationRate/100, yearsToRetire + yearsPast);
         
         projectedAssets = projectedAssets * (1 + postRetirementReturn/100) - annualExpense;
         idealAssets = idealAssets * (1 + postRetirementReturn/100) - annualExpense;
         
         // Clamp at 0 for visual sanity
         if(projectedAssets < 0) projectedAssets = 0;
         if(idealAssets < 0) idealAssets = 0;
       }
    }

    return {
      yearsToRetire,
      futureMonthlyIncomeNeeded,
      requiredCorpus,
      projectedCorpus: chartData[yearsToRetire].projected,
      shortfall: requiredCorpus - chartData[yearsToRetire].projected,
      requiredMonthlySavings,
      chartData
    };

  }, [currentAge, targetRetirementAge, lifeExpectancy, desiredMonthlyIncomePV, inflationRate, postRetirementReturn, preRetirementReturn, currentInvestableAssets, monthlyContribution]);


  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* 1. Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-700 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
              <Target size={100} />
           </div>
           <div className="relative z-10">
             <div className="flex items-center gap-2 mb-2 text-emerald-400">
                <Flame size={20} />
                <h3 className="font-bold text-sm uppercase tracking-wide">FIRE 目標資金 (Target Corpus)</h3>
             </div>
             <p className="text-3xl font-bold mb-1">${Math.round(calculationResults.requiredCorpus).toLocaleString()}</p>
             <p className="text-xs text-slate-400">
               在 {targetRetirementAge} 歲時需要準備的資金<br/>
               (以每月被動收入 ${Math.round(calculationResults.futureMonthlyIncomeNeeded).toLocaleString()} 計算)
             </p>
           </div>
        </div>

        <div className={`p-6 rounded-2xl shadow-sm border relative overflow-hidden ${calculationResults.shortfall <= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-200'}`}>
           <div className="flex items-center gap-2 mb-2 text-slate-500">
              <TrendingUp size={20} />
              <h3 className="font-bold text-sm uppercase tracking-wide">預計累積資金 (Projected)</h3>
           </div>
           <p className="text-3xl font-bold text-slate-900 mb-1">${Math.round(calculationResults.projectedCorpus).toLocaleString()}</p>
           <p className="text-sm font-medium">
             {calculationResults.shortfall > 0 ? (
                <span className="text-red-500">尚欠 ${(calculationResults.shortfall/1000000).toFixed(2)}M</span>
             ) : (
                <span className="text-emerald-600">超額完成目標!</span>
             )}
           </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
           <div className="flex items-center gap-2 mb-2 text-blue-500">
              <Calculator size={20} />
              <h3 className="font-bold text-sm uppercase tracking-wide text-slate-500">建議每月儲蓄 (Required Savings)</h3>
           </div>
           <p className="text-3xl font-bold text-slate-900 mb-1">${Math.round(calculationResults.requiredMonthlySavings).toLocaleString()}</p>
           <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
              <span>現時每月儲蓄: ${Math.round(monthlyContribution).toLocaleString()}</span>
              {monthlyContribution < calculationResults.requiredMonthlySavings && (
                 <span className="text-red-500 font-bold">(需增加 ${(Math.round(calculationResults.requiredMonthlySavings - monthlyContribution)).toLocaleString()})</span>
              )}
           </div>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Controls / Inputs */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                 <RefreshCw size={18} className="text-slate-400" /> 參數設定
              </h3>
              
              <div className="space-y-5">
                 <div>
                    <div className="flex justify-between mb-1">
                       <label className="text-xs font-bold text-slate-500">目標退休年齡</label>
                       <span className="text-xs font-bold text-emerald-600">{targetRetirementAge} 歲</span>
                    </div>
                    <input 
                      type="range" min={currentAge + 1} max={80} 
                      value={targetRetirementAge} 
                      onChange={(e) => setTargetRetirementAge(parseInt(e.target.value))}
                      className="w-full accent-emerald-500 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                       <span>現時: {currentAge}</span>
                       <span>尚餘 {Math.max(0, targetRetirementAge - currentAge)} 年</span>
                    </div>
                 </div>

                 <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">預期壽命 (歲)</label>
                    <div className="flex items-center border border-slate-200 rounded-lg px-3 py-2 bg-slate-50">
                       <input 
                         type="number" 
                         value={lifeExpectancy} 
                         onChange={(e) => setLifeExpectancy(parseInt(e.target.value))} 
                         className="w-full bg-transparent outline-none font-bold text-slate-700 text-sm" 
                       />
                    </div>
                 </div>

                 <div className="pt-4 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-500 block mb-1">退休後目標月入 (現值)</label>
                    <div className="flex items-center border border-slate-200 rounded-lg px-3 py-2 bg-white">
                       <span className="text-slate-400 mr-2 font-bold">$</span>
                       <input 
                         type="number" 
                         value={desiredMonthlyIncomePV} 
                         onChange={(e) => setDesiredMonthlyIncomePV(parseInt(e.target.value))} 
                         className="w-full bg-transparent outline-none font-bold text-slate-700" 
                       />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">連通脹 {inflationRate}% 計算，屆時需約 ${Math.round(calculationResults.futureMonthlyIncomeNeeded).toLocaleString()}/月</p>
                 </div>

                 <div className="pt-4 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-500 block mb-1">現有投資資產</label>
                    <div className="flex items-center border border-slate-200 rounded-lg px-3 py-2 bg-white">
                       <span className="text-slate-400 mr-2 font-bold">$</span>
                       <input 
                         type="number" 
                         value={currentInvestableAssets} 
                         onChange={(e) => setCurrentInvestableAssets(parseInt(e.target.value))} 
                         className="w-full bg-transparent outline-none font-bold text-slate-700" 
                       />
                    </div>
                 </div>

                 <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">現時每月儲蓄/投資</label>
                    <div className="flex items-center border border-slate-200 rounded-lg px-3 py-2 bg-white">
                       <span className="text-slate-400 mr-2 font-bold">$</span>
                       <input 
                         type="number" 
                         value={monthlyContribution} 
                         onChange={(e) => setMonthlyContribution(parseInt(e.target.value))} 
                         className="w-full bg-transparent outline-none font-bold text-slate-700" 
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <div>
                       <label className="text-[10px] font-bold text-slate-500 block mb-1">退休前回報 (%)</label>
                       <input type="number" step="0.5" value={preRetirementReturn} onChange={(e) => setPreRetirementReturn(parseFloat(e.target.value))} className="w-full border border-slate-200 rounded p-1.5 text-sm font-bold text-slate-700" />
                    </div>
                    <div>
                       <label className="text-[10px] font-bold text-slate-500 block mb-1">退休後回報 (%)</label>
                       <input type="number" step="0.5" value={postRetirementReturn} onChange={(e) => setPostRetirementReturn(parseFloat(e.target.value))} className="w-full border border-slate-200 rounded p-1.5 text-sm font-bold text-slate-700" />
                    </div>
                    <div className="col-span-2">
                       <label className="text-[10px] font-bold text-slate-500 block mb-1">通脹率 (%)</label>
                       <input type="number" step="0.1" value={inflationRate} onChange={(e) => setInflationRate(parseFloat(e.target.value))} className="w-full border border-slate-200 rounded p-1.5 text-sm font-bold text-slate-700" />
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Chart Visualization */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[400px]">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-slate-800 text-lg">資產增長預測 (Wealth Trajectory)</h3>
                 <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1">
                       <div className="w-3 h-3 bg-blue-500 rounded-full"></div> 現時路徑
                    </div>
                    <div className="flex items-center gap-1">
                       <div className="w-3 h-3 bg-emerald-400 rounded-full"></div> 理想路徑 (FIRE)
                    </div>
                 </div>
              </div>
              
              <ResponsiveContainer width="100%" height="100%" maxHeight={320}>
                 <ComposedChart data={calculationResults.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                       <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                       </linearGradient>
                       <linearGradient id="colorIdeal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="age" tick={{fontSize: 12, fill: '#94a3b8'}} tickMargin={10} />
                    <YAxis tickFormatter={(val) => `$${val/1000000}M`} tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                    <Tooltip 
                       formatter={(val: number) => `$${val.toLocaleString()}`}
                       labelFormatter={(label) => `${label} 歲`}
                       contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Area type="monotone" dataKey="ideal" name="理想路徑" stroke="#10b981" fill="url(#colorIdeal)" strokeWidth={2} strokeDasharray="5 5" />
                    <Area type="monotone" dataKey="projected" name="現時路徑" stroke="#3b82f6" fill="url(#colorProjected)" strokeWidth={3} />
                    {/* Add a reference line or dot for the retirement target if feasible, 
                        but the 'ideal' area chart covers the target nicely. */}
                 </ComposedChart>
              </ResponsiveContainer>
           </div>

           {/* Insights Box */}
           <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                 <Target size={18} className="text-emerald-500" /> 
                 分析總結
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                 要達成在 <strong>{targetRetirementAge}歲</strong> 退休並每月獲得 <strong>${desiredMonthlyIncomePV.toLocaleString()}</strong> (現值) 的目標，
                 您需要在退休一刻準備好 <strong>${(calculationResults.requiredCorpus/1000000).toFixed(2)}M</strong> 的資金。
                 <br/><br/>
                 {calculationResults.shortfall > 0 ? (
                    <>
                       目前路徑顯示資金將出現短缺。建議將每月儲蓄金額提升至 <strong>${Math.round(calculationResults.requiredMonthlySavings).toLocaleString()}</strong>，
                       或考慮將退休年齡延後至 <strong>{targetRetirementAge + Math.ceil(calculationResults.shortfall / (monthlyContribution * 12 * 2))}歲</strong> 左右。
                    </>
                 ) : (
                    <>
                       恭喜！按照目前的儲蓄和投資進度，您將能夠<strong>提早達成</strong>財務自由目標。您可以考慮提高生活質素或追求更保守的投資策略。
                    </>
                 )}
              </p>
           </div>
        </div>

      </div>
    </div>
  );
};
