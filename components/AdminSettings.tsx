
import React from 'react';
import { useClient } from '../contexts/ClientContext';
import { Shield, UserCheck, UserX, Trash2, Clock, CheckCircle, AlertTriangle, User, ArrowLeft, Mail, Fingerprint } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const AdminSettings: React.FC<Props> = ({ onClose }) => {
  const { currentUser, allUsers, updateUserStatus, deleteUser } = useClient();

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-10 text-slate-400">
        <Shield size={64} className="mb-4 text-slate-300" />
        <h2 className="text-xl font-bold text-slate-600">權限不足 (Access Denied)</h2>
        <p>此頁面僅供管理員訪問。</p>
        <button 
           onClick={onClose}
           className="mt-6 text-emerald-600 hover:text-emerald-700 font-bold"
        >
           返回主頁
        </button>
      </div>
    );
  }

  const pendingUsers = allUsers.filter(u => u.status === 'PENDING');
  const activeUsers = allUsers.filter(u => u.status === 'ACTIVE');
  const suspendedUsers = allUsers.filter(u => u.status === 'SUSPENDED');

  const UserRow = ({ user }: { user: typeof allUsers[0] }) => {
    const isCurrentUser = user.id === currentUser.id;

    return (
      <tr className={`border-b border-slate-100 last:border-0 transition-colors ${isCurrentUser ? 'bg-emerald-50/60 hover:bg-emerald-100/50' : 'hover:bg-slate-50'}`}>
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isCurrentUser ? 'bg-emerald-200 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
              <User size={18} />
            </div>
            <div>
              <div className="font-bold text-slate-800 flex items-center gap-2">
                {user.username}
                {isCurrentUser && (
                   <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold tracking-wide">YOU</span>
                )}
              </div>
              <div className="text-xs text-slate-500 font-mono flex items-center gap-1">
                 <Fingerprint size={10} /> {user.id}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
           {user.email ? (
              <div className="flex items-center gap-2 text-slate-600 text-sm">
                 <Mail size={14} className="text-slate-400" /> {user.email}
              </div>
           ) : (
              <span className="text-slate-400 text-xs italic">未提供電郵</span>
           )}
        </td>
        <td className="px-6 py-4">
           <span className={`px-2 py-1 rounded text-xs font-bold ${
              user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-blue-700 border border-blue-200'
           }`}>
              {user.role}
           </span>
        </td>
        <td className="px-6 py-4 text-sm text-slate-500">
           {new Date(user.createdAt).toLocaleDateString()}
        </td>
        <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-2">
             {!isCurrentUser && (
               <>
                 {user.status === 'PENDING' && (
                   <button 
                     onClick={() => updateUserStatus(user.id, 'ACTIVE')}
                     className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors border border-emerald-200"
                   >
                     <UserCheck size={14} /> 批准
                   </button>
                 )}
                 {user.status === 'SUSPENDED' && (
                   <button 
                     onClick={() => updateUserStatus(user.id, 'ACTIVE')}
                     className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors border border-emerald-200"
                   >
                     <UserCheck size={14} /> 啟用
                   </button>
                 )}
                 {user.status === 'ACTIVE' && (
                   <button 
                     onClick={() => updateUserStatus(user.id, 'SUSPENDED')}
                     className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors border border-amber-200"
                   >
                     <UserX size={14} /> 停用
                   </button>
                 )}
                 
                 <button 
                   onClick={() => deleteUser(user.id)}
                   className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                   title="刪除用戶"
                 >
                   <Trash2 size={16} />
                 </button>
               </>
             )}
             {isCurrentUser && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-200 rounded-full shadow-sm">
                   <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                   </span>
                   <span className="text-xs font-bold text-emerald-700">當前在線 (Current Session)</span>
                </div>
             )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="text-emerald-500" /> 系統管理後台 (Admin Settings)
          </h2>
          <p className="text-slate-500 mt-2">管理顧問帳戶權限及審批新註冊申請。</p>
        </div>
        <button 
          onClick={onClose}
          className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors font-bold shadow-sm"
        >
          <ArrowLeft size={18} /> 返回主頁
        </button>
      </div>

      {/* Pending Approvals */}
      <div className="mb-8">
         <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Clock className="text-amber-500" /> 待審批申請 (Pending)
            {pendingUsers.length > 0 && (
               <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingUsers.length}</span>
            )}
         </h3>
         
         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {pendingUsers.length === 0 ? (
               <div className="p-8 text-center text-slate-400 text-sm">暫無待審批的帳戶申請。</div>
            ) : (
               <table className="min-w-full text-left">
                  <thead className="bg-amber-50 text-amber-800 text-xs uppercase font-bold">
                     <tr>
                        <th className="px-6 py-3">用戶資訊</th>
                        <th className="px-6 py-3">聯絡電郵</th>
                        <th className="px-6 py-3">角色</th>
                        <th className="px-6 py-3">申請日期</th>
                        <th className="px-6 py-3 text-right">操作</th>
                     </tr>
                  </thead>
                  <tbody>
                     {pendingUsers.map(user => <UserRow key={user.id} user={user} />)}
                  </tbody>
               </table>
            )}
         </div>
      </div>

      {/* Active Users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
               <CheckCircle className="text-emerald-500" /> 已啟用帳戶 (Active Advisors)
            </h3>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
               <table className="min-w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                     <tr>
                        <th className="px-6 py-3">用戶資訊</th>
                        <th className="px-6 py-3">聯絡電郵</th>
                        <th className="px-6 py-3">角色</th>
                        <th className="px-6 py-3">建立日期</th>
                        <th className="px-6 py-3 text-right">操作</th>
                     </tr>
                  </thead>
                  <tbody>
                     {activeUsers.map(user => <UserRow key={user.id} user={user} />)}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Suspended / Stats */}
         <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
               <AlertTriangle className="text-red-500" /> 已停用/統計
            </h3>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                     <span className="text-sm font-bold text-slate-500">總用戶數</span>
                     <span className="text-xl font-bold text-slate-800">{allUsers.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-600">
                     <span className="text-sm font-bold">活躍用戶</span>
                     <span className="text-xl font-bold">{activeUsers.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-amber-600">
                     <span className="text-sm font-bold">待審批</span>
                     <span className="text-xl font-bold">{pendingUsers.length}</span>
                  </div>
               </div>
            </div>

            {suspendedUsers.length > 0 && (
               <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-red-50 px-4 py-2 border-b border-red-100 text-red-700 font-bold text-xs uppercase">
                     已停用名單
                  </div>
                  <div>
                     {suspendedUsers.map(user => (
                        <div key={user.id} className="p-4 border-b border-slate-100 last:border-0 flex items-center justify-between">
                           <div>
                              <div className="font-bold text-slate-800 text-sm">{user.username}</div>
                              <div className="text-xs text-red-400">Suspended</div>
                           </div>
                           <button 
                             onClick={() => updateUserStatus(user.id, 'ACTIVE')}
                             className="text-emerald-600 hover:bg-emerald-50 p-2 rounded transition-colors text-xs font-bold"
                           >
                              重新啟用
                           </button>
                        </div>
                     ))}
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};
