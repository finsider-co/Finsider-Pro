import React, { useState } from 'react';
import { ClientProfile, AssetType, LiabilityType, InsurancePolicy } from '../types';
import { SECTOR_OPTIONS } from '../constants';
import { Save, Plus, Trash2, Calendar } from 'lucide-react';

interface Props {
  client: ClientProfile;
  onSave: (updatedClient: ClientProfile) => void;
}

type TabType = 'PROFILE' | 'ASSETS' | 'LIABILITIES' | 'CASHFLOW' | 'PORTFOLIO' | 'INSURANCE';

export const DataEditor: React.FC<Props> = ({ client, onSave }) => {
  const [activeTab, setActiveTab] = useState<TabType>('PROFILE');
  const [formData, setFormData] = useState<ClientProfile>(JSON.parse(JSON.stringify(client)));

  const handleSave = () => {
    const updated = { ...formData, lastUpdated: new Date().toISOString() };
    onSave(updated);
  };

  const updateProfileField = (field: keyof ClientProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const removeItem = <T extends { id: string }>(listKey: keyof ClientProfile, id: string) => {
    setFormData(prev => ({
      ...prev,
      [listKey]: (prev[listKey] as T[]).filter(item => item.id !== id)
    }));
  };

  const addItem = (listKey: keyof ClientProfile, item: any) => {
    setFormData(prev => ({
      ...prev,
      [listKey]: [...(prev[listKey] as any[]), item]
    }));
  };

  const updateItem = (listKey: keyof ClientProfile, id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [listKey]: (prev[listKey] as any[]).map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const TabButton = ({ id, label }: { id: TabType, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-6 py-3 text-sm font-bold rounded-t-xl transition-all ${
        activeTab === id 
          ? 'bg-white text-emerald-600 border-t border-x border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]' 
          : 'text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
      <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h3 className="font-bold text-slate-800 text-xl">編輯客戶資料</h3>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-600 text-sm font-bold transition-colors shadow-sm"
        >
          <Save size={18} /> 儲存變更
        </button>
      </div>

      <div className="flex px-6 pt-6 border-b border-slate-200 gap-2 overflow-x-auto">
        <TabButton id="PROFILE" label="個人資料" />
        <TabButton id="ASSETS" label="資產" />
        <TabButton id="LIABILITIES" label="負債" />
        <TabButton id="CASHFLOW" label="現金流" />
        <TabButton id="PORTFOLIO" label="投資組合" />
        <TabButton id="INSURANCE" label="保險" />
      </div>

      <div className="p-8 overflow-y-auto flex-1 bg-slate-50/50">
        {activeTab === 'PROFILE' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">全名</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => updateProfileField('name', e.target.value)}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">年齡</label>
              <input 
                type="number" 
                value={formData.age}
                onChange={e => updateProfileField('age', parseInt(e.target.value))}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">電郵</label>
              <input 
                type="email" 
                value={formData.email || ''}
                onChange={e => updateProfileField('email', e.target.value)}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">電話</label>
              <input 
                type="text" 
                value={formData.phone || ''}
                onChange={e => updateProfileField('phone', e.target.value)}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
              />
            </div>
            <div className="space-y-2">
               <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
                 <Calendar size={16}/> 上次會面日期 (YYYY-MM-DD)
               </label>
               <input 
                  type="date"
                  value={formData.lastMeetingDate || ''}
                  onChange={e => updateProfileField('lastMeetingDate', e.target.value)}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
               />
            </div>
             <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">目標退休年齡</label>
              <input 
                type="number" 
                value={formData.retirementAge}
                onChange={e => updateProfileField('retirementAge', parseInt(e.target.value))}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-bold text-slate-700">顧問備註</label>
              <textarea 
                value={formData.notes || ''}
                onChange={e => updateProfileField('notes', e.target.value)}
                rows={4}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
              />
            </div>
          </div>
        )}

        {activeTab === 'ASSETS' && (
          <div>
            <div className="space-y-4">
              {formData.assets.map((asset, idx) => (
                <div key={asset.id} className="flex flex-col md:flex-row gap-4 p-5 border border-slate-200 rounded-xl bg-white shadow-sm items-end">
                   <div className="flex-1 w-full">
                     <label className="text-xs font-bold text-slate-500 mb-1 block">資產名稱</label>
                     <input 
                        type="text" 
                        value={asset.name} 
                        onChange={e => updateItem('assets', asset.id, 'name', e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                     />
                   </div>
                   <div className="w-full md:w-40">
                     <label className="text-xs font-bold text-slate-500 mb-1 block">類別</label>
                     <select 
                        value={asset.type}
                        onChange={e => updateItem('assets', asset.id, 'type', e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                     >
                       {Object.values(AssetType).map(t => <option key={t} value={t}>{t}</option>)}
                     </select>
                   </div>
                   <div className="w-full md:w-40">
                     <label className="text-xs font-bold text-slate-500 mb-1 block">估值</label>
                     <input 
                        type="number" 
                        value={asset.value} 
                        onChange={e => updateItem('assets', asset.id, 'value', parseFloat(e.target.value))}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                     />
                   </div>
                   <button 
                    onClick={() => removeItem('assets', asset.id)}
                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                   >
                     <Trash2 size={18} />
                   </button>
                </div>
              ))}
            </div>
            <button 
              onClick={() => addItem('assets', { id: `new_${Date.now()}`, name: '新資產', type: AssetType.CASH, value: 0, currency: 'HKD' })}
              className="mt-6 flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg"
            >
              <Plus size={18} /> 新增資產
            </button>
          </div>
        )}

        {activeTab === 'LIABILITIES' && (
           <div>
           <div className="space-y-4">
             {formData.liabilities.map((item, idx) => (
               <div key={item.id} className="flex flex-col md:flex-row gap-4 p-5 border border-slate-200 rounded-xl bg-white shadow-sm items-end">
                  <div className="flex-1 w-full">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">負債名稱</label>
                    <input type="text" value={item.name} onChange={e => updateItem('liabilities', item.id, 'name', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" />
                  </div>
                  <div className="w-full md:w-40">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">類別</label>
                    <select value={item.type} onChange={e => updateItem('liabilities', item.id, 'type', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500">
                      {Object.values(LiabilityType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="w-full md:w-32">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">金額</label>
                    <input type="number" value={item.amount} onChange={e => updateItem('liabilities', item.id, 'amount', parseFloat(e.target.value))} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" />
                  </div>
                   <div className="w-full md:w-24">
                     <label className="text-xs font-bold text-slate-500 mb-1 block">利率 %</label>
                     <input type="number" value={item.interestRate} onChange={e => updateItem('liabilities', item.id, 'interestRate', parseFloat(e.target.value))} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" />
                   </div>
                   <div className="w-full md:w-32">
                     <label className="text-xs font-bold text-slate-500 mb-1 block">月供</label>
                     <input type="number" value={item.monthlyPayment} onChange={e => updateItem('liabilities', item.id, 'monthlyPayment', parseFloat(e.target.value))} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" />
                   </div>
                  <button onClick={() => removeItem('liabilities', item.id)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
               </div>
             ))}
           </div>
           <button onClick={() => addItem('liabilities', { id: `new_l_${Date.now()}`, name: '新負債', type: LiabilityType.LOAN, amount: 0, interestRate: 5, monthlyPayment: 0 })} className="mt-6 flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg">
             <Plus size={18} /> 新增負債
           </button>
         </div>
        )}

        {activeTab === 'CASHFLOW' && (
           <div>
           <div className="space-y-4">
             {formData.cashFlow.map((item, idx) => (
               <div key={item.id} className="flex flex-col md:flex-row gap-4 p-5 border border-slate-200 rounded-xl bg-white shadow-sm items-end">
                  <div className="w-full md:w-32">
                     <label className="text-xs font-bold text-slate-500 mb-1 block">收支類別</label>
                     <select value={item.isIncome ? 'Income' : 'Expense'} onChange={e => updateItem('cashFlow', item.id, 'isIncome', e.target.value === 'Income')} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500">
                       <option value="Income">收入</option>
                       <option value="Expense">支出</option>
                     </select>
                  </div>
                  <div className="flex-1 w-full">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">項目名稱</label>
                    <input type="text" value={item.category} onChange={e => updateItem('cashFlow', item.id, 'category', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" />
                  </div>
                  <div className="w-full md:w-32">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">金額</label>
                    <input type="number" value={item.amount} onChange={e => updateItem('cashFlow', item.id, 'amount', parseFloat(e.target.value))} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" />
                  </div>
                  <div className="w-full md:w-32">
                     <label className="text-xs font-bold text-slate-500 mb-1 block">頻率</label>
                     <select value={item.frequency} onChange={e => updateItem('cashFlow', item.id, 'frequency', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500">
                       <option value="Monthly">每月</option>
                       <option value="Annually">每年</option>
                     </select>
                  </div>
                  <button onClick={() => removeItem('cashFlow', item.id)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
               </div>
             ))}
           </div>
           <button onClick={() => addItem('cashFlow', { id: `new_c_${Date.now()}`, category: '新項目', amount: 0, frequency: 'Monthly', isIncome: false })} className="mt-6 flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg">
             <Plus size={18} /> 新增項目
           </button>
         </div>
        )}

        {activeTab === 'PORTFOLIO' && (
           <div>
           <div className="space-y-4">
             {formData.portfolio.map((item, idx) => (
               <div key={item.id} className="grid grid-cols-2 md:grid-cols-6 gap-4 p-5 border border-slate-200 rounded-xl bg-white shadow-sm items-end">
                  <div className="col-span-1">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">代號 (Ticker)</label>
                    <input type="text" value={item.ticker} onChange={e => updateItem('portfolio', item.id, 'ticker', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" />
                  </div>
                  <div className="col-span-1">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">股數</label>
                    <input type="number" value={item.shares} onChange={e => updateItem('portfolio', item.id, 'shares', parseFloat(e.target.value))} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" />
                  </div>
                  <div className="col-span-1">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">現價</label>
                    <input type="number" value={item.currentPrice} onChange={e => updateItem('portfolio', item.id, 'currentPrice', parseFloat(e.target.value))} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" />
                  </div>
                  <div className="col-span-1">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">比重 %</label>
                    <input type="number" value={item.allocation} onChange={e => updateItem('portfolio', item.id, 'allocation', parseFloat(e.target.value))} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" />
                  </div>
                  <div className="col-span-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">資產名稱</label>
                    <input type="text" value={item.name} onChange={e => updateItem('portfolio', item.id, 'name', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" />
                  </div>
                   <div className="col-span-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">板塊</label>
                    <select 
                      value={item.sector}
                      onChange={e => updateItem('portfolio', item.id, 'sector', e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                    >
                      {SECTOR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2 md:col-span-6 flex justify-end">
                     <button onClick={() => removeItem('portfolio', item.id)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                  </div>
               </div>
             ))}
           </div>
           <button onClick={() => addItem('portfolio', { id: `new_p_${Date.now()}`, ticker: 'NEW', name: '新持倉', shares: 0, avgPrice: 0, currentPrice: 0, allocation: 0, sector: 'ETF' })} className="mt-6 flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg">
             <Plus size={18} /> 新增持倉
           </button>
         </div>
        )}

        {activeTab === 'INSURANCE' && (
          <div>
            <div className="space-y-4">
              {formData.insurance.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 border border-slate-200 rounded-xl bg-white shadow-sm items-start">
                   <div className="md:col-span-2">
                     <label className="text-xs font-bold text-slate-500 mb-1 block">類別</label>
                     <select 
                        value={item.type}
                        onChange={e => updateItem('insurance', item.id, 'type', e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                     >
                       <option value="Life">人壽</option>
                       <option value="Health">醫療</option>
                       <option value="Critical Illness">危疾</option>
                       <option value="Disability">意外/傷殘</option>
                       <option value="Savings">儲蓄</option>
                       <option value="Annuity">年金</option>
                     </select>
                   </div>
                   <div className="md:col-span-2">
                     <label className="text-xs font-bold text-slate-500 mb-1 block">性質</label>
                     <select 
                        value={item.nature}
                        onChange={e => updateItem('insurance', item.id, 'nature', e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                     >
                       <option value="Consumption">消費型</option>
                       <option value="Savings">儲蓄型</option>
                     </select>
                   </div>
                   <div className="md:col-span-3">
                     <label className="text-xs font-bold text-slate-500 mb-1 block">保險公司</label>
                     <input 
                        type="text" 
                        value={item.provider} 
                        onChange={e => updateItem('insurance', item.id, 'provider', e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                     />
                   </div>
                   <div className="md:col-span-2">
                     <label className="text-xs font-bold text-slate-500 mb-1 block">保額</label>
                     <input 
                        type="number" 
                        value={item.coverageAmount} 
                        onChange={e => updateItem('insurance', item.id, 'coverageAmount', parseFloat(e.target.value))}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                     />
                   </div>
                   <div className="md:col-span-2">
                     <label className="text-xs font-bold text-slate-500 mb-1 block">保費</label>
                     <input 
                        type="number" 
                        value={item.premium} 
                        onChange={e => updateItem('insurance', item.id, 'premium', parseFloat(e.target.value))}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                     />
                   </div>
                   
                   <div className="md:col-span-1 flex justify-end">
                     <button 
                      onClick={() => removeItem('insurance', item.id)}
                      className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                     >
                       <Trash2 size={18} />
                     </button>
                   </div>

                   {/* New Row for additional details */}
                   <div className="md:col-span-3">
                     <label className="text-xs font-bold text-slate-500 mb-1 block">受益人</label>
                     <input 
                        type="text" 
                        value={item.beneficiary} 
                        onChange={e => updateItem('insurance', item.id, 'beneficiary', e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                     />
                   </div>
                   <div className="md:col-span-3">
                     <label className="text-xs font-bold text-slate-500 mb-1 block">總已供保費</label>
                     <input 
                        type="number" 
                        value={item.totalPremiumsPaid || 0} 
                        onChange={e => updateItem('insurance', item.id, 'totalPremiumsPaid', parseFloat(e.target.value))}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                     />
                   </div>
                   <div className="md:col-span-6">
                     <label className="text-xs font-bold text-slate-500 mb-1 block">備註</label>
                     <input 
                        type="text" 
                        value={item.policyNotes || ''} 
                        onChange={e => updateItem('insurance', item.id, 'policyNotes', e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                        placeholder="例如: 包含特別條款..."
                     />
                   </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => addItem('insurance', { id: `new_i_${Date.now()}`, provider: '新保單', type: 'Life', nature: 'Consumption', coverageAmount: 0, premium: 0, premiumFrequency: 'Monthly', beneficiary: '' })}
              className="mt-6 flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg"
            >
              <Plus size={18} /> 新增保單
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
