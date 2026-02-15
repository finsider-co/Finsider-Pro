
import React from 'react';
import { ClientProfile } from '../types';
import { User, Plus, Search, Trash2, ChevronRight, Clock, FileSpreadsheet, Cake, Settings } from 'lucide-react';
import { exportAllClientsToExcel } from '../services/exportService';
import { calculateAge } from '../constants';
import { useClient } from '../contexts/ClientContext';

interface Props {
  clients: ClientProfile[];
  onSelectClient: (client: ClientProfile) => void;
  onAddClient: () => void;
  onDeleteClient: (id: string) => void;
  onOpenProfile: () => void;
}

export const ClientList: React.FC<Props> = ({ clients, onSelectClient, onAddClient, onDeleteClient, onOpenProfile }) => {
  const { currentUser } = useClient();
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isBirthdaySoon = (dob: string) => {
    if(!dob) return false;
    const today = new Date();
    const birthDate = new Date(dob);
    const currentYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    const diffTime = currentYearBirthday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays >= 0 && diffDays <= 7;
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in p-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            Welcome back, <span className="text-emerald-600">{currentUser?.username}</span>
          </h2>
          <p className="text-slate-500 mt-2 text-lg">客戶資料庫與理財規劃中心</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onOpenProfile}
            className="flex items-center gap-2 bg-white text-slate-700 border border-slate-300 px-5 py-3 rounded-xl hover:bg-slate-50 transition-all font-bold shadow-sm"
          >
            <Settings size={20} /> 個人設定
          </button>
          <button 
            onClick={() => exportAllClientsToExcel(clients)}
            className="flex items-center gap-2 bg-white text-emerald-700 border border-emerald-200 px-5 py-3 rounded-xl hover:bg-emerald-50 transition-all font-bold shadow-sm"
          >
            <FileSpreadsheet size={20} /> 匯出 Excel
          </button>
          <button 
            onClick={onAddClient}
            className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 font-bold"
          >
            <Plus size={20} /> 新增客戶
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input 
            type="text" 
            placeholder="搜尋客戶姓名或電郵..." 
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredClients.map(client => {
          const age = calculateAge(client.dateOfBirth);
          const birthdayAlert = isBirthdaySoon(client.dateOfBirth);

          return (
            <div 
              key={client.id} 
              className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 group overflow-hidden flex flex-col relative"
            >
              {birthdayAlert && (
                 <div className="absolute top-4 right-4 animate-bounce bg-pink-100 text-pink-600 p-2 rounded-full shadow-sm" title="近期生日">
                    <Cake size={20} />
                 </div>
              )}

              <div className="p-8 cursor-pointer flex-1" onClick={() => onSelectClient(client)}>
                <div className="flex items-start justify-between mb-6">
                  <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xl group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                    {client.name.split(' ').map(n => n[0]).join('').substring(0,2)}
                  </div>
                  <div className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 uppercase tracking-wide">
                    年齡: {age}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-1">{client.name}</h3>
                <p className="text-sm text-slate-500 truncate mb-6">{client.email || '未提供電郵'}</p>
                
                <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl">
                  {client.lastMeetingDate ? (
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-slate-500 font-medium flex items-center gap-2">
                        <Clock size={16} /> 上次會面
                      </span>
                      <span className="font-bold text-slate-800">{client.lastMeetingDate}</span>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-400 italic">尚未記錄會面時間</div>
                  )}
                  
                  <div className="flex justify-between text-sm items-center mt-2">
                     <span className="text-slate-500 font-medium flex items-center gap-2">
                        <User size={16} /> 客戶編號
                     </span>
                     <span className="font-mono text-slate-600">{client.id}</span>
                  </div>
                </div>

                {client.notes && (
                   <div className="text-xs text-slate-500 line-clamp-2 italic bg-white p-2 rounded border border-slate-100">
                      "{client.notes}"
                   </div>
                )}
              </div>

              <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex items-center justify-between">
                <button 
                  onClick={() => onSelectClient(client)}
                  className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                >
                  進入檔案 <ChevronRight size={16} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeleteClient(client.id); }}
                  className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                  title="刪除客戶"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}

        {filteredClients.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-400">
            <User size={64} className="mx-auto mb-6 opacity-30" />
            <p className="text-lg">找不到符合條件的客戶。</p>
          </div>
        )}
      </div>
    </div>
  );
};
