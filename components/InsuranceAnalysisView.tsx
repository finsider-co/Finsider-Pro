import React from 'react';
import { ClientProfile, InsurancePolicy } from '../types';
import { Shield, AlertTriangle, CheckCircle, Wallet, HeartPulse, User, Info } from 'lucide-react';

interface Props {
  data: ClientProfile;
}

export const InsuranceAnalysisView: React.FC<Props> = ({ data }) => {
  // Calculate Annual Income
  const annualIncome = data.cashFlow
    .filter(c => c.isIncome)
    .reduce((sum, c) => sum + (c.frequency === 'Monthly' ? c.amount * 12 : c.amount), 0);

  // Benchmarks
  const lifeBenchmark = annualIncome * 10;
  const ciBenchmark = annualIncome * 4; // Average of 3-5 years

  // Existing Coverage
  const lifeCoverage = data.insurance
    .filter(i => i.type === 'Life')
    .reduce((sum, i) => sum + i.coverageAmount, 0);

  const ciCoverage = data.insurance
    .filter(i => i.type === 'Critical Illness')
    .reduce((sum, i) => sum + i.coverageAmount, 0);

  const savingsValue = data.insurance
    .filter(i => i.type === 'Savings' || i.type === 'Annuity')
    .reduce((sum, i) => sum + i.coverageAmount, 0); // Simplified using coverage as surrender value proxy for now

  // Gaps
  const lifeGap = Math.max(0, lifeBenchmark - lifeCoverage);
  const ciGap = Math.max(0, ciBenchmark - ciCoverage);

  const PolicyCard = ({ title, icon, current, needed, gap, colorClass, iconBg }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
      <div className="flex items-start justify-between mb-6">
         <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${iconBg}`}>
               {icon}
            </div>
            <h4 className="font-bold text-lg text-slate-800">{title}</h4>
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
            <span className="text-slate-500">建議保額 (Needed)</span>
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
      
      {/* Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <PolicyCard 
            title="人壽保障 (Life)" 
            icon={<User className="text-blue-500" size={24} />}
            iconBg="bg-blue-50"
            current={lifeCoverage}
            needed={lifeBenchmark}
            gap={lifeGap}
            colorClass="bg-blue-500"
         />
         <PolicyCard 
            title="危疾保障 (Critical Illness)" 
            icon={<HeartPulse className="text-rose-500" size={24} />}
            iconBg="bg-rose-50"
            current={ciCoverage}
            needed={ciBenchmark}
            gap={ciGap}
            colorClass="bg-rose-500"
         />
      </div>

      {/* Summary Table */}
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
                     <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">保險公司</th>
                     <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">類別</th>
                     <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">性質</th>
                     <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">保額/價值</th>
                     <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">保費 (月)</th>
                     <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">總已供保費</th>
                     <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">備註</th>
                  </tr>
               </thead>
               <tbody className="bg-white divide-y divide-slate-50">
                  {data.insurance.map(pol => (
                     <tr key={pol.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">
                           {pol.provider}
                           <div className="text-xs font-normal text-slate-400">{pol.beneficiary && `受益人: ${pol.beneficiary}`}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                           {pol.type === 'Life' ? '人壽' : 
                            pol.type === 'Critical Illness' ? '危疾' :
                            pol.type === 'Health' ? '醫療' : 
                            pol.type === 'Savings' ? '儲蓄' : 
                            pol.type === 'Annuity' ? '年金' : pol.type}
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-500">
                           ${pol.premium.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-700 font-medium">
                           {pol.totalPremiumsPaid ? `$${pol.totalPremiumsPaid.toLocaleString()}` : '-'}
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
                  ))}
               </tbody>
               <tfoot className="bg-slate-50 font-bold text-slate-700">
                  <tr>
                     <td colSpan={4} className="px-6 py-4 text-right">每月總保費:</td>
                     <td className="px-6 py-4 text-right text-emerald-600">
                        ${data.insurance.reduce((sum, i) => sum + i.premium, 0).toLocaleString()}
                     </td>
                     <td colSpan={2}></td>
                  </tr>
               </tfoot>
            </table>
         </div>
      </div>
      
      {/* Savings & Annuity Summary */}
      <div className="bg-indigo-50 rounded-2xl p-8 border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-4">
            <div className="bg-indigo-100 p-4 rounded-full text-indigo-600">
               <Wallet size={32} />
            </div>
            <div>
               <h4 className="text-xl font-bold text-indigo-900">儲蓄及年金總值</h4>
               <p className="text-indigo-600">已累積的保單現金價值及年金</p>
            </div>
         </div>
         <div className="text-right">
            <span className="text-4xl font-bold text-indigo-900">${savingsValue.toLocaleString()}</span>
         </div>
      </div>
    </div>
  );
};
