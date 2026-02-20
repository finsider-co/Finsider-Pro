import React from 'react';
import { ClientProfile, AssetType } from '../types';
import { Briefcase, CreditCard, Wallet, ArrowUpRight } from 'lucide-react';

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
