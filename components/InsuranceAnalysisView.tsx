
import React, { useState } from 'react';
import { ClientProfile, InsuranceType } from '../types';
import { Shield, AlertTriangle, CheckCircle, Wallet, HeartPulse, User, Info, Stethoscope, Activity, FilePlus, ChevronDown, Calculator } from 'lucide-react';
import { HK_MEDICAL_PROCEDURES } from '../constants';

interface Props {
  data: ClientProfile;
}

type Tab = 'GENERAL' | 'MEDICAL_SCENARIO';

const INSURANCE_TYPE_LABELS: Record<InsuranceType, string> = {
  'Life': '人壽',
  'Medical': '醫療',
  'Critical Illness': '危疾',
  'Disability': '意外/傷殘',
  'Savings': '儲蓄',
  'Annuity': '年金'
};

export const InsuranceAnalysisView: React.FC<Props> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<Tab>('GENERAL');
  
  // State for Critical Illness Multiplier (Default 3 Years)
  const [ciMultiplier, setCiMultiplier] = useState<number>(3);

  // Medical Analysis State
  const [selectedProcedureId, setSelectedProcedureId] = useState<string>(HK_MEDICAL_PROCEDURES[0].id);

  // --- General Analysis Logic ---
  const annualIncome = data.cashFlow
    .filter(c => c.isIncome)
    .reduce((sum, c) => sum + (c.frequency === 'Monthly' ? c.amount * 12 : c.amount), 0);

  // --- Life Insurance Logic (Needs Approach vs Rule of Thumb) ---
  const needs = data.financialNeeds;
  const totalOneOffNeeds = (needs?.funeralCost || 0) + (needs?.mortgageRedemption || 0) + (needs?.loansRedemption || 0) + (needs?.childEducationFund || 0);
  const totalRecurringNeeds = (needs?.monthlyFamilySupport || 0) * 12 * (needs?.supportYears || 0);
  const totalNeedsCalculated = totalOneOffNeeds + totalRecurringNeeds;

  // Use Calculated Needs if > 0, otherwise fallback to 10x Income Rule
  const lifeBenchmark = totalNeedsCalculated > 0 ? totalNeedsCalculated : annualIncome * 10;
  
  // --- Critical Illness Logic ---
  const ciBenchmark = annualIncome * ciMultiplier;

  const lifeCoverage = data.insurance
    .filter(i => i.type === 'Life')
    .reduce((sum, i) => sum + i.coverageAmount + (i.riders?.reduce((rSum, r) => rSum + r.coverageAmount, 0) || 0), 0);

  const ciCoverage = data.insurance
    .filter(i => i.type === 'Critical Illness')
    .reduce((sum, i) => sum + i.coverageAmount + (i.riders?.reduce((rSum, r) => rSum + r.coverageAmount, 0) || 0), 0);

  const savingsValue = data.insurance
    .filter(i => i.type === 'Savings' || i.type === 'Annuity')
    .reduce((sum, i) => sum + i.coverageAmount + (i.surrenderValue || 0), 0); // Include Surrender Value if applicable (approx)

  const lifeGap = Math.max(0, lifeBenchmark - lifeCoverage);
  const ciGap = Math.max(0, ciBenchmark - ciCoverage);


  // --- Medical Analysis Logic ---
  const selectedProcedure = HK_MEDICAL_PROCEDURES.find(p => p.id === selectedProcedureId) || HK_MEDICAL_PROCEDURES[0];
  const medicalPlans = data.medicalPlans || [];

  const calculateMedicalClaim = () => {
    let remainingCost = {
      room: selectedProcedure.costRoom,
      surgeon: selectedProcedure.costSurgeon,
      anaesthetist: selectedProcedure.costAnaesthetist,
      ot: selectedProcedure.costOT,
      misc: selectedProcedure.costMisc,
      specialist: selectedProcedure.costSpecialist
    };

    let totalClaim = 0;
    // Process Group Plans first (Usually 1st payor)
    const sortedPlans = [...medicalPlans].sort((a, b) => a.type === 'Group' ? -1 : 1);

    const planResults = sortedPlans.map(plan => {
      let planClaim = 0;
      let usedDeductible = 0; // Deductible consumed by this claim

      const calculateItemClaim = (cost: number, limit: number) => {
        if (plan.fullCover) return cost; // simplified full cover
        return Math.min(cost, limit);
      };

      // 1. Calculate Gross Claim for this plan
      let grossClaim = 0;
      let basicBenefit = 0;
      let smmBenefit = 0;

      // Helper to calculate benefit for a specific item
      const calcBenefit = (cost: number, limit: number) => Math.min(cost, limit);

      if (plan.fullCover) {
         // Simplified Full Cover Logic
         const totalRemainingBill = Object.values(remainingCost).reduce((a, b) => a + b, 0);
         basicBenefit = totalRemainingBill;
         if (plan.overallAnnualLimit > 0) {
            basicBenefit = Math.min(basicBenefit, plan.overallAnnualLimit);
         }
      } else {
         // Itemized Logic
         const bRoom = calcBenefit(remainingCost.room, plan.limitRoomAndBoard * selectedProcedure.days);
         const bSurgeon = calcBenefit(remainingCost.surgeon, plan.limitSurgical);
         const bAnaesthetist = calcBenefit(remainingCost.anaesthetist, plan.limitAnaesthetist);
         const bOT = calcBenefit(remainingCost.ot, plan.limitOperatingTheatre);
         const bMisc = calcBenefit(remainingCost.misc, plan.limitMiscServices);
         const bSpecialist = calcBenefit(remainingCost.specialist, plan.limitSpecialist);
         
         basicBenefit = bRoom + bSurgeon + bAnaesthetist + bOT + bMisc + bSpecialist;
      }

      // SMM Logic
      if (plan.smmEnabled) {
         const totalRemainingBill = Object.values(remainingCost).reduce((a, b) => a + b, 0);
         const shortfall = Math.max(0, totalRemainingBill - basicBenefit);
         
         if (shortfall > 0) {
            // SMM pays % of the shortfall
            let calculatedSMM = shortfall * (plan.smmReimbursementRate || 0.8);
            
            // Cap at SMM Annual Limit
            if (plan.smmAnnualLimit && plan.smmAnnualLimit > 0) {
               calculatedSMM = Math.min(calculatedSMM, plan.smmAnnualLimit);
            }
            
            smmBenefit = calculatedSMM;
         }
      }

      grossClaim = basicBenefit + smmBenefit;

      // 2. Apply Deductible
      let netClaim = Math.max(0, grossClaim - plan.deductible);
      usedDeductible = grossClaim - netClaim;

      // 3. Update Remaining Costs
      // For simplicity in this multi-plan simulation, we reduce the total remaining bill proportionally
      // In a real engine, we would track per-item remaining balance.
      // Here we just assume the claim reduces the "Total Outstanding" for the next plan.
      // To prevent double counting, we zero out the costs if fully covered, or reduce them.
      // Simplified: We don't update `remainingCost` object deeply for the next plan in this UI demo,
      // assuming usually 1 main plan or 1 Group + 1 Top-up (which is usually Full Cover).
      
      totalClaim += netClaim;
      
      return {
        planName: plan.name,
        grossClaim,
        basicBenefit,
        smmBenefit,
        deductibleApplied: usedDeductible,
        netClaim
      };
    });

    const totalCost = selectedProcedure.total;
    // Cap total claim at total cost
    const finalTotalClaim = Math.min(totalClaim, totalCost);
    const outOfPocket = totalCost - finalTotalClaim;

    return { totalCost, finalTotalClaim, outOfPocket, planResults };
  };

  const simResult = calculateMedicalClaim();

  // --- Render Components ---

  const PolicyCard = ({ title, icon, current, needed, gap, colorClass, iconBg, settingsControl, detailNote }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
         <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${iconBg}`}>
               {icon}
            </div>
            <div>
              <h4 className="font-bold text-lg text-slate-800">{title}</h4>
              {settingsControl && <div className="mt-1">{settingsControl}</div>}
            </div>
         </div>
         {gap > 0 ? (
           <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
             <AlertTriangle size={12} /> 有缺口
           </span>
         ) : (
           <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
             <CheckCircle size={12} /> 充足
           </span>
         )}
      </div>

      <div className="space-y-4 flex-1">
         {detailNote && (
            <div className="text-xs text-slate-400 bg-slate-50 p-2 rounded mb-2 border border-slate-100">
               {detailNote}
            </div>
         )}
         <div>
            <div className="flex justify-between text-sm mb-1">
               <span className="text-slate-500">現有保障 (Existing)</span>
               <span className="font-bold text-slate-800">${current.toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
               <div className={`h-2 rounded-full ${colorClass}`} style={{ width: `${Math.min((current/needed)*100, 100)}%` }}></div>
            </div>
         </div>
         <div className="flex justify-between text-sm border-t border-slate-50 pt-3">
            <span className="text-slate-500">建議保額 (Target)</span>
            <span className="font-medium text-slate-600">${needed.toLocaleString()}</span>
         </div>
         <div className="flex justify-between text-sm">
             <span className="text-slate-500">缺口 (Gap)</span>
             <span className={`font-bold ${gap > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                ${gap.toLocaleString()}
             </span>
         </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
         <button 
           onClick={() => setActiveTab('GENERAL')}
           className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'GENERAL' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
         >
           綜合保障分析
         </button>
         <button 
           onClick={() => setActiveTab('MEDICAL_SCENARIO')}
           className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'MEDICAL_SCENARIO' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
         >
           <Stethoscope size={16} /> 醫療開支模擬
         </button>
      </div>

      {/* GENERAL TAB CONTENT */}
      {activeTab === 'GENERAL' && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <PolicyCard 
                title="人壽保障 (Life)" 
                icon={<User className="text-blue-500" size={24} />}
                iconBg="bg-blue-50"
                current={lifeCoverage}
                needed={lifeBenchmark}
                gap={lifeGap}
                colorClass="bg-blue-500"
                detailNote={totalNeedsCalculated > 0 ? (
                   <div className="flex flex-col gap-1">
                      <div className="font-bold text-slate-600 mb-1 flex items-center gap-1"><Calculator size={12}/> 需求分析法 (Need Approach)</div>
                      <div className="flex justify-between"><span>一次性 (喪葬/按揭/教育):</span> <span>${totalOneOffNeeds.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>持續性 (生活費 x 年期):</span> <span>${totalRecurringNeeds.toLocaleString()}</span></div>
                   </div>
                ) : `以 10 倍年薪 (${(annualIncome * 10).toLocaleString()}) 作為粗略估算`}
             />
             <PolicyCard 
                title="危疾保障 (Critical Illness)" 
                icon={<HeartPulse className="text-rose-500" size={24} />}
                iconBg="bg-rose-50"
                current={ciCoverage}
                needed={ciBenchmark}
                gap={ciGap}
                colorClass="bg-rose-500"
                settingsControl={
                   <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">基準倍數</span>
                      <div className="flex bg-slate-100 rounded-lg p-0.5">
                         <button 
                           onClick={() => setCiMultiplier(3)}
                           className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${ciMultiplier === 3 ? 'bg-white shadow text-rose-600' : 'text-slate-400 hover:text-slate-600'}`}
                         >
                           3年
                         </button>
                         <button 
                           onClick={() => setCiMultiplier(5)}
                           className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${ciMultiplier === 5 ? 'bg-white shadow text-rose-600' : 'text-slate-400 hover:text-slate-600'}`}
                         >
                           5年
                         </button>
                      </div>
                   </div>
                }
                detailNote={`建議為 ${ciMultiplier} 年年薪 (${annualIncome.toLocaleString()} x ${ciMultiplier}) 以覆蓋治療期間的生活費及醫療開支`}
             />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                   <Shield className="text-emerald-500" /> 保單列表
                </h3>
                <span className="text-sm text-slate-500">年薪基準: ${annualIncome.toLocaleString()}</span>
             </div>
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                   <thead className="bg-white">
                      <tr>
                         <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">保險公司 / 計劃名稱</th>
                         <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">類別</th>
                         <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">性質</th>
                         <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">保額/價值</th>
                         <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">退保價值</th>
                         <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">保費 (月)</th>
                         <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider text-emerald-600">每年保費 (Est.)</th>
                         <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">備註</th>
                      </tr>
                   </thead>
                   <tbody className="bg-white divide-y divide-slate-50">
                      {data.insurance.map(pol => (
                         <React.Fragment key={pol.id}>
                            <tr className="hover:bg-slate-50 transition-colors group border-b border-slate-50">
                               <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">
                                  <div className="text-slate-900">{pol.provider}</div>
                                  {pol.name && <div className="text-xs text-emerald-600 font-medium mt-0.5">{pol.name}</div>}
                                  <div className="text-xs font-normal text-slate-400 mt-0.5">{pol.beneficiary && `受益人: ${pol.beneficiary}`}</div>
                               </td>
                               <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                                  {INSURANCE_TYPE_LABELS[pol.type] || pol.type}
                               </td>
                               <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                                     pol.nature === 'Savings' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                  }`}>
                                     {pol.nature === 'Savings' ? '儲蓄型' : '消費型'}
                                  </span>
                               </td>
                               <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-slate-900">
                                  ${pol.coverageAmount.toLocaleString()}
                               </td>
                               <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-slate-600">
                                  {pol.surrenderValue ? `$${pol.surrenderValue.toLocaleString()}` : '-'}
                               </td>
                               <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-500">
                                  ${pol.premium.toLocaleString()}
                               </td>
                               <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-emerald-600 font-bold">
                                  ${(pol.premium * (pol.premiumFrequency === 'Monthly' ? 12 : 1)).toLocaleString()}
                               </td>
                               <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                  {pol.policyNotes && (
                                     <div className="flex items-center gap-1 group-hover:text-slate-800 transition-colors" title={pol.policyNotes}>
                                        <Info size={14} className="text-blue-400" />
                                        <span className="truncate max-w-[150px]">{pol.policyNotes}</span>
                                     </div>
                                  )}
                               </td>
                            </tr>
                            {/* Riders Display */}
                            {(pol.riders || []).map((rider) => (
                               <tr key={rider.id} className="bg-slate-50/50">
                                  <td className="px-6 py-2 pl-10 whitespace-nowrap text-xs text-slate-500 flex items-center gap-2">
                                     <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                     {rider.name} <span className="text-[10px] bg-slate-200 px-1 rounded">附約</span>
                                  </td>
                                  <td className="px-6 py-2"></td>
                                  <td className="px-6 py-2"></td>
                                  <td className="px-6 py-2 whitespace-nowrap text-xs text-right text-slate-500">
                                     ${rider.coverageAmount.toLocaleString()}
                                  </td>
                                  <td className="px-6 py-2"></td>
                                  <td className="px-6 py-2 whitespace-nowrap text-xs text-right text-slate-500">
                                     +${rider.premium.toLocaleString()}
                                  </td>
                                  <td className="px-6 py-2 whitespace-nowrap text-xs text-right text-slate-400">
                                     ${(rider.premium * (pol.premiumFrequency === 'Monthly' ? 12 : 1)).toLocaleString()}
                                  </td>
                                  <td className="px-6 py-2"></td>
                               </tr>
                            ))}
                         </React.Fragment>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
          
          <div className="bg-indigo-50 rounded-2xl p-8 border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="flex items-center gap-4">
                <div className="bg-indigo-100 p-4 rounded-full text-indigo-600">
                   <Wallet size={32} />
                </div>
                <div>
                   <h4 className="text-xl font-bold text-indigo-900">儲蓄及年金總值 (Est. Total Savings Value)</h4>
                   <p className="text-indigo-600">基於保單保額或退保價值總和</p>
                </div>
             </div>
             <div className="text-right">
                <span className="text-4xl font-bold text-indigo-900">${savingsValue.toLocaleString()}</span>
             </div>
          </div>
        </div>
      )}

      {/* MEDICAL SCENARIO TAB CONTENT */}
      {activeTab === 'MEDICAL_SCENARIO' && (
        <div className="space-y-8 animate-fade-in">
           {/* 1. Selector Section */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                 <Activity size={20} className="text-blue-500" />
                 選擇模擬情境 (Scenario)
              </h3>
              <div className="flex flex-col md:flex-row gap-4">
                 <div className="flex-1">
                    <label className="text-xs font-bold text-slate-500 mb-2 block">手術/治療項目</label>
                    <select 
                       value={selectedProcedureId} 
                       onChange={(e) => setSelectedProcedureId(e.target.value)}
                       className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 font-medium text-slate-800"
                    >
                       {HK_MEDICAL_PROCEDURES.map(p => (
                          <option key={p.id} value={p.id}>{p.name} - Est. ${p.total.toLocaleString()}</option>
                       ))}
                    </select>
                 </div>
                 <div className="md:w-1/3">
                    <label className="text-xs font-bold text-slate-500 mb-2 block">預計住院日數</label>
                    <div className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-bold">
                       {selectedProcedure.days} 天
                    </div>
                 </div>
              </div>
           </div>

           {/* 2. Result Cards */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                 <h4 className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">預計總醫療開支</h4>
                 <p className="text-3xl font-bold mb-1">${simResult.totalCost.toLocaleString()}</p>
                 <div className="mt-4 space-y-1 text-xs text-slate-400">
                    <div className="flex justify-between"><span>醫生手術費:</span> <span>${selectedProcedure.costSurgeon.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>麻醉/手術室:</span> <span>${(selectedProcedure.costAnaesthetist + selectedProcedure.costOT).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>醫院雜費:</span> <span>${selectedProcedure.costMisc.toLocaleString()}</span></div>
                 </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                 <h4 className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">預計可索償金額 (Claimable)</h4>
                 <p className="text-3xl font-bold text-emerald-600 mb-1">${simResult.finalTotalClaim.toLocaleString()}</p>
                 <div className="w-full bg-slate-100 rounded-full h-2 mt-4">
                    <div 
                       className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                       style={{ width: `${(simResult.finalTotalClaim / simResult.totalCost) * 100}%` }}
                    ></div>
                 </div>
                 <p className="text-xs text-emerald-600 font-bold mt-2 text-right">
                    {(simResult.finalTotalClaim / simResult.totalCost * 100).toFixed(1)}% 覆蓋率
                 </p>
              </div>

              <div className={`p-6 rounded-2xl shadow-sm border ${simResult.outOfPocket > 0 ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                 <h4 className={`${simResult.outOfPocket > 0 ? 'text-red-600' : 'text-emerald-600'} font-bold text-xs uppercase tracking-wider mb-2`}>
                    預計自付金額 (Out-of-Pocket)
                 </h4>
                 <p className={`text-3xl font-bold ${simResult.outOfPocket > 0 ? 'text-red-700' : 'text-emerald-700'} mb-1`}>
                    ${simResult.outOfPocket.toLocaleString()}
                 </p>
                 {simResult.outOfPocket > 0 && (
                    <p className="text-xs text-red-500 mt-2 font-medium flex items-center gap-1">
                       <AlertTriangle size={12} /> 建議運用自願醫保(VHIS)或高端醫療填補
                    </p>
                 )}
              </div>
           </div>

           {/* 3. Breakdown Details */}
           <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50">
                 <h4 className="font-bold text-slate-800">索償分佈詳情 (Claim Breakdown)</h4>
              </div>
              
              {medicalPlans.length === 0 ? (
                 <div className="p-10 text-center text-slate-400 flex flex-col items-center">
                    <FilePlus size={48} className="mb-4 opacity-30" />
                    <p>尚未輸入任何醫療計劃。</p>
                    <p className="text-sm mt-1">請前往「資料編輯」頁面新增團體或個人醫療保單。</p>
                 </div>
              ) : (
                 <div className="p-6 space-y-6">
                    {simResult.planResults.map((res, idx) => (
                       <div key={idx} className="flex flex-col md:flex-row items-center gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                          <div className="flex-1">
                             <div className="flex items-center gap-2 mb-1">
                                <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">Plan {idx + 1}</span>
                                <span className="font-bold text-slate-800">{res.planName}</span>
                             </div>
                             <div className="text-xs text-slate-500">
                                自付費 (Deductible): ${data.medicalPlans.find(p => p.name === res.planName)?.deductible.toLocaleString()}
                             </div>
                          </div>
                          
                          <div className="flex gap-8 text-right">
                             <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">基本保障</p>
                                <p className="font-bold text-slate-700">${res.basicBenefit.toLocaleString()}</p>
                             </div>
                             {res.smmBenefit > 0 && (
                                <div>
                                   <p className="text-[10px] text-indigo-400 font-bold uppercase">SMM 賠償</p>
                                   <p className="font-bold text-indigo-600">+${res.smmBenefit.toLocaleString()}</p>
                                </div>
                             )}
                             <div>
                                <p className="text-[10px] text-red-400 font-bold uppercase">已扣除自付費</p>
                                <p className="font-bold text-red-600">-${res.deductibleApplied.toLocaleString()}</p>
                             </div>
                             <div className="pl-6 border-l border-slate-200">
                                <p className="text-[10px] text-emerald-500 font-bold uppercase">淨賠償額</p>
                                <p className="font-bold text-emerald-600 text-lg">${res.netClaim.toLocaleString()}</p>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              )}
           </div>
        </div>
      )}

    </div>
  );
};
