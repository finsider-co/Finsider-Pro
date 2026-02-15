
import React, { useState } from 'react';
import { ClientProfile, AssetType, LiabilityType, InsurancePolicy, InsuranceRider } from '../types';
import { SECTOR_OPTIONS } from '../constants';
import { Save, Plus, Trash2, Calendar, Gift, PieChart, HeartPulse, Paperclip, X } from 'lucide-react';

interface Props {
  client: ClientProfile;
  onSave: (updatedClient: ClientProfile) => void;
}

type TabType = 'PROFILE' | 'ASSETS' | 'LIABILITIES' | 'CASHFLOW' | 'PORTFOLIO' | 'INSURANCE' | 'MEDICAL';

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
      [listKey]: (prev[listKey] as unknown as T[]).filter(item => item.id !== id)
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

  // Helper to handle Rider updates within a specific policy
  const updateRider = (policyId: string, riderId: string, field: keyof InsuranceRider, value: any) => {
     setFormData(prev => ({
        ...prev,
        insurance: prev.insurance.map(policy => {
           if (policy.id !== policyId) return policy;
           const updatedRiders = (policy.riders || []).map(r => 
              r.id === riderId ? { ...r, [field]: value } : r
           );
           return { ...policy, riders: updatedRiders };
        })
     }));
  };

  const addRider = (policyId: string) => {
     const newRider: InsuranceRider = {
        id: `r_${Date.now()}`,
        name: '',
        coverageAmount: 0,
        premium: 0
     };
     setFormData(prev => ({
        ...prev,
        insurance: prev.insurance.map(policy => {
           if (policy.id !== policyId) return policy;
           return { ...policy, riders: [...(policy.riders || []), newRider] };
        })
     }));
  };

  const removeRider = (policyId: string, riderId: string) => {
     setFormData(prev => ({
        ...prev,
        insurance: prev.insurance.map(policy => {
           if (policy.id !== policyId) return policy;
           return { ...policy, riders: (policy.riders || []).filter(r => r.id !== riderId) };
        })
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
        <TabButton id="MEDICAL" label="醫療計劃" />
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
               <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
                 <Gift size={16}/> 出生日期 (Date of Birth)
               </label>
               <input 
                  type="date"
                  value={formData.dateOfBirth || ''}
                  onChange={e => updateProfileField('dateOfBirth', e.target.value)}
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

        {/* MEDICAL TAB */}
        {activeTab === 'MEDICAL' && (
          <div>
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6 flex items-start gap-3">
               <HeartPulse className="text-blue-500 mt-1" size={20} />
               <div>
                  <h4 className="font-bold text-blue-800 text-sm">醫療計劃配置 (Medical Plan Setup)</h4>
                  <p className="text-xs text-blue-600 mt-1">在此輸入客戶持有的團體醫療或個人醫療計劃細節。這些資料將用於「醫療保障分析」中計算預計賠償額。</p>
               </div>
            </div>
            {/* ... Medical Plans list (unchanged) ... */}
            <div className="space-y-6">
              {(formData.medicalPlans || []).map((plan, idx) => (
                <div key={plan.id} className="p-6 border border-slate-200 rounded-xl bg-white shadow-sm relative">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                      <div className="md:col-span-1">
                        <label className="text-xs font-bold text-slate-500 mb-1 block">計劃名稱</label>
                        <input 
                           type="text" value={plan.name} 
                           onChange={e => updateItem('medicalPlans', plan.id, 'name', e.target.value)} 
                           className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:border-emerald-500"
                           placeholder="e.g. 公司醫保"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">類型</label>
                        <select 
                           value={plan.type} onChange={e => updateItem('medicalPlans', plan.id, 'type', e.target.value)} 
                           className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                        >
                           <option value="Group">團體醫療 (Group)</option>
                           <option value="Personal">個人醫療 (Personal)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">自付費 (Deductible)</label>
                        <input 
                           type="number" value={plan.deductible} 
                           onChange={e => updateItem('medicalPlans', plan.id, 'deductible', parseFloat(e.target.value))} 
                           className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700"
                        />
                      </div>
                   </div>
                   {/* Rest of Medical Plan fields (same as before) */}
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                      <div>
                        <label className="text-xs font-bold text-slate-400 mb-1 block">病房等級</label>
                        <select 
                           value={plan.roomType} onChange={e => updateItem('medicalPlans', plan.id, 'roomType', e.target.value)} 
                           className="w-full p-2 bg-white border border-slate-200 rounded text-xs"
                        >
                           <option value="Ward">大房 (Ward)</option>
                           <option value="Semi-Private">半私家 (Semi-Private)</option>
                           <option value="Private">私家房 (Private)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 mb-1 block">全數保障 (Full Cover)</label>
                        <select 
                           value={plan.fullCover ? 'Yes' : 'No'} onChange={e => updateItem('medicalPlans', plan.id, 'fullCover', e.target.value === 'Yes')} 
                           className="w-full p-2 bg-white border border-slate-200 rounded text-xs"
                        >
                           <option value="No">逐項限額 (Itemized)</option>
                           <option value="Yes">全數保障 (Subject to limits)</option>
                        </select>
                      </div>
                   </div>
                   {!plan.fullCover && (
                     <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 bg-slate-50 p-4 rounded-lg">
                        <div>
                           <label className="text-[10px] font-bold text-slate-400 block mb-1">每日病房限額</label>
                           <input type="number" value={plan.limitRoomAndBoard} onChange={e => updateItem('medicalPlans', plan.id, 'limitRoomAndBoard', parseFloat(e.target.value))} className="w-full p-1.5 border rounded text-xs" />
                        </div>
                        <div>
                           <label className="text-[10px] font-bold text-slate-400 block mb-1">手術費限額</label>
                           <input type="number" value={plan.limitSurgical} onChange={e => updateItem('medicalPlans', plan.id, 'limitSurgical', parseFloat(e.target.value))} className="w-full p-1.5 border rounded text-xs" />
                        </div>
                        <div>
                           <label className="text-[10px] font-bold text-slate-400 block mb-1">麻醉師費限額</label>
                           <input type="number" value={plan.limitAnaesthetist} onChange={e => updateItem('medicalPlans', plan.id, 'limitAnaesthetist', parseFloat(e.target.value))} className="w-full p-1.5 border rounded text-xs" />
                        </div>
                        <div>
                           <label className="text-[10px] font-bold text-slate-400 block mb-1">手術室費限額</label>
                           <input type="number" value={plan.limitOperatingTheatre} onChange={e => updateItem('medicalPlans', plan.id, 'limitOperatingTheatre', parseFloat(e.target.value))} className="w-full p-1.5 border rounded text-xs" />
                        </div>
                         <div>
                           <label className="text-[10px] font-bold text-slate-400 block mb-1">雜費限額</label>
                           <input type="number" value={plan.limitMiscServices} onChange={e => updateItem('medicalPlans', plan.id, 'limitMiscServices', parseFloat(e.target.value))} className="w-full p-1.5 border rounded text-xs" />
                        </div>
                     </div>
                   )}
                   <button onClick={() => removeItem('medicalPlans', plan.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors">
                     <Trash2 size={18} />
                   </button>
                </div>
              ))}
              <button onClick={() => addItem('medicalPlans', { id: `mp_${Date.now()}`, name: '新醫療計劃', type: 'Personal', deductible: 0, roomType: 'Ward', limitRoomAndBoard: 1000, limitSurgical: 20000, limitAnaesthetist: 5000, limitOperatingTheatre: 5000, limitMiscServices: 5000, limitSpecialist: 1000, overallAnnualLimit: 0, fullCover: false })} className="flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 bg-emerald-50 px-4 py-3 rounded-lg w-full justify-center border border-emerald-100 border-dashed">
                <Plus size={18} /> 新增醫療計劃
              </button>
            </div>
          </div>
        )}

        {/* Existing Assets Tab */}
        {activeTab === 'ASSETS' && (
           /* ... existing ASSETS code ... */
           <div>
            <div className="space-y-4">
              {formData.assets.map((asset, idx) => (
                <div key={asset.id} className="flex flex-col md:flex-row gap-4 p-5 border border-slate-200 rounded-xl bg-white shadow-sm items-end">
                   <div className="flex-1 w-full">
                     <label className="text-xs font-bold text-slate-500 mb-1 block">資產名稱</label>
                     <input type="text" value={asset.name} onChange={e => updateItem('assets', asset.id, 'name', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" />
                   </div>
                   <div className="w-full md:w-40">
                     <label className="text-xs font-bold text-slate-500 mb-1 block">類別</label>
                     <select value={asset.type} onChange={e => updateItem('assets', asset.id, 'type', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500">
                       {Object.values(AssetType).map(t => <option key={t} value={t}>{t}</option>)}
                     </select>
                   </div>
                   <div className="w-full md:w-40">
                     <label className="text-xs font-bold text-slate-500 mb-1 block">估值</label>
                     <input type="number" value={asset.value} onChange={e => updateItem('assets', asset.id, 'value', parseFloat(e.target.value))} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" />
                   </div>
                   <button onClick={() => removeItem('assets', asset.id)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
            <button onClick={() => addItem('assets', { id: `new_${Date.now()}`, name: '新資產', type: AssetType.CASH, value: 0, currency: 'HKD' })} className="mt-6 flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg">
              <Plus size={18} /> 新增手動資產
            </button>
            {formData.portfolio.length > 0 && (
              <div className="mt-10 pt-6 border-t border-slate-200">
                 <div className="flex items-center gap-2 mb-4 text-slate-500">
                    <PieChart size={18} />
                    <h4 className="text-sm font-bold">來自投資組合 (Linked Portfolio)</h4>
                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-400">自動同步</span>
                 </div>
                 <div className="space-y-4 opacity-80">
                    {formData.portfolio.map(item => (
                       <div key={`p-${item.id}`} className="flex flex-col md:flex-row gap-4 p-5 border border-slate-200 border-dashed rounded-xl bg-slate-50 items-end">
                           <div className="flex-1 w-full">
                               <label className="text-xs font-bold text-slate-400 mb-1 block">資產名稱</label>
                               <div className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-600">{item.ticker} - {item.name}</div>
                           </div>
                           <div className="w-full md:w-40">
                               <label className="text-xs font-bold text-slate-400 mb-1 block">類別</label>
                               <div className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-600">{AssetType.EQUITY} (股票)</div>
                           </div>
                           <div className="w-full md:w-40">
                               <label className="text-xs font-bold text-slate-400 mb-1 block">估值 (Est.)</label>
                               <div className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-600">${(item.shares * item.currentPrice).toLocaleString()}</div>
                           </div>
                           <button onClick={() => setActiveTab('PORTFOLIO')} className="p-2.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors text-xs font-bold whitespace-nowrap">編輯投資組合</button>
                       </div>
                    ))}
                 </div>
              </div>
            )}
          </div>
        )}

        {/* Existing Liabilities Tab */}
        {activeTab === 'LIABILITIES' && (
           /* ... existing LIABILITIES code ... */
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

        {/* Existing Cashflow Tab */}
        {activeTab === 'CASHFLOW' && (
           /* ... existing CASHFLOW code ... */
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

        {/* Existing Portfolio Tab */}
        {activeTab === 'PORTFOLIO' && (
           /* ... existing PORTFOLIO code ... */
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
                    <select value={item.sector} onChange={e => updateItem('portfolio', item.id, 'sector', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500">
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

        {/* Updated Insurance Tab */}
        {activeTab === 'INSURANCE' && (
          <div>
            <div className="space-y-4">
              {formData.insurance.map((item, idx) => (
                <div key={item.id} className="p-5 border border-slate-200 rounded-xl bg-white shadow-sm">
                   {/* Policy Header / Basic Info */}
                   <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                     <div className="md:col-span-2">
                       <label className="text-xs font-bold text-slate-500 mb-1 block">類別</label>
                       <select 
                          value={item.type}
                          onChange={e => updateItem('insurance', item.id, 'type', e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                       >
                         <option value="Life">人壽 (Life)</option>
                         <option value="Medical">醫療 (Medical)</option>
                         <option value="Critical Illness">危疾 (Critical Illness)</option>
                         <option value="Disability">意外/傷殘 (Disability)</option>
                         <option value="Savings">儲蓄 (Savings)</option>
                         <option value="Annuity">年金 (Annuity)</option>
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
                     <div className="md:col-span-3">
                       <label className="text-xs font-bold text-slate-500 mb-1 block">計劃名稱</label>
                       <input 
                          type="text" 
                          value={item.name || ''} 
                          onChange={e => updateItem('insurance', item.id, 'name', e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500 font-medium"
                          placeholder="e.g. 守護健康危疾加倍保"
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
                       <label className="text-xs font-bold text-slate-500 mb-1 block">主約保費</label>
                       <input 
                          type="number" 
                          value={item.premium} 
                          onChange={e => updateItem('insurance', item.id, 'premium', parseFloat(e.target.value))}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                       />
                     </div>
                     <div className="md:col-span-2">
                       <label className="text-xs font-bold text-slate-500 mb-1 block">繳付頻率</label>
                       <select 
                          value={item.premiumFrequency}
                          onChange={e => updateItem('insurance', item.id, 'premiumFrequency', e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                       >
                          <option value="Monthly">每月 (Monthly)</option>
                          <option value="Annually">每年 (Annually)</option>
                       </select>
                     </div>
                     
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
                     <div className="md:col-span-12">
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

                   {/* Rider Section */}
                   <div className="mt-6 pt-6 border-t border-slate-100 bg-slate-50 -mx-5 px-5 pb-2">
                      <div className="flex items-center justify-between mb-4">
                         <h4 className="text-sm font-bold text-slate-600 flex items-center gap-2">
                            <Paperclip size={14} className="text-slate-400" />
                            附約 (Riders)
                         </h4>
                         <div className="text-xs font-bold text-emerald-600">
                           總保費: ${(item.premium + (item.riders || []).reduce((sum, r) => sum + r.premium, 0)).toLocaleString()} / {item.premiumFrequency === 'Monthly' ? '月' : '年'}
                         </div>
                      </div>

                      <div className="space-y-3">
                         {(item.riders || []).map((rider) => (
                            <div key={rider.id} className="flex flex-col md:flex-row gap-3 items-end bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                               <div className="flex-1 w-full">
                                  <label className="text-[10px] font-bold text-slate-400 block mb-1">附約名稱</label>
                                  <input 
                                     type="text" 
                                     value={rider.name} 
                                     onChange={(e) => updateRider(item.id, rider.id, 'name', e.target.value)}
                                     className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs font-medium"
                                     placeholder="例如: 意外附加保障"
                                  />
                               </div>
                               <div className="w-full md:w-32">
                                  <label className="text-[10px] font-bold text-slate-400 block mb-1">保額</label>
                                  <input 
                                     type="number" 
                                     value={rider.coverageAmount} 
                                     onChange={(e) => updateRider(item.id, rider.id, 'coverageAmount', parseFloat(e.target.value))}
                                     className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs"
                                  />
                               </div>
                               <div className="w-full md:w-32">
                                  <label className="text-[10px] font-bold text-slate-400 block mb-1">保費</label>
                                  <input 
                                     type="number" 
                                     value={rider.premium} 
                                     onChange={(e) => updateRider(item.id, rider.id, 'premium', parseFloat(e.target.value))}
                                     className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs"
                                  />
                               </div>
                               <button 
                                  onClick={() => removeRider(item.id, rider.id)}
                                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                               >
                                  <X size={16} />
                               </button>
                            </div>
                         ))}
                         
                         <button 
                            onClick={() => addRider(item.id)}
                            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-3 py-2 rounded flex items-center gap-1 transition-colors"
                         >
                            <Plus size={14} /> 新增附約
                         </button>
                      </div>
                   </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => addItem('insurance', { id: `new_i_${Date.now()}`, name: '', provider: '新保單', type: 'Life', nature: 'Consumption', coverageAmount: 0, premium: 0, premiumFrequency: 'Monthly', beneficiary: '', riders: [] })}
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
