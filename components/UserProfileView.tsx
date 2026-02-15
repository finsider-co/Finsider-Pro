
import React, { useState } from 'react';
import { useClient } from '../contexts/ClientContext';
import { User, Mail, Lock, Save, CheckCircle, AlertCircle, Shield, KeyRound } from 'lucide-react';

export const UserProfileView: React.FC = () => {
  const { currentUser, updateCurrentUserProfile, changeCurrentUserPassword } = useClient();
  
  // Profile State
  const [email, setEmail] = useState(currentUser?.email || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password State
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdError, setPwdError] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileError('');

    if (!email) {
       setProfileError('請輸入電郵地址');
       return;
    }

    const result = await updateCurrentUserProfile({ email });
    if (result.success) {
       setProfileMsg(result.message);
    } else {
       setProfileError(result.message);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg('');
    setPwdError('');

    if (!currentPwd || !newPwd || !confirmPwd) {
       setPwdError('請填寫所有密碼欄位');
       return;
    }

    if (newPwd !== confirmPwd) {
       setPwdError('新密碼與確認密碼不符');
       return;
    }

    if (newPwd.length < 6) {
       setPwdError('新密碼長度需至少 6 個字元');
       return;
    }

    const result = await changeCurrentUserPassword(currentPwd, newPwd);
    if (result.success) {
       setPwdMsg(result.message);
       setCurrentPwd('');
       setNewPwd('');
       setConfirmPwd('');
    } else {
       setPwdError(result.message);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
           <User size={32} />
        </div>
        <div>
           <h2 className="text-3xl font-bold text-slate-900">個人檔案設定 (Profile)</h2>
           <p className="text-slate-500">管理您的帳戶資訊及安全設定</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Basic Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <User size={20} className="text-blue-500" /> 基本資料
              </h3>
           </div>
           
           <div className="p-8">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                 <div>
                    <label className="block text-sm font-bold text-slate-500 mb-2">用戶名 (User ID)</label>
                    <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-xl border border-slate-200 text-slate-500 cursor-not-allowed">
                       <User size={18} />
                       <span className="font-bold">{currentUser.username}</span>
                       <span className="ml-auto text-xs bg-slate-200 px-2 py-0.5 rounded">唯讀</span>
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-slate-500 mb-2">角色權限 (Role)</label>
                    <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-xl border border-slate-200 text-slate-500 cursor-not-allowed">
                       <Shield size={18} />
                       <span className="font-bold">{currentUser.role}</span>
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">聯絡電郵 (Email)</label>
                    <div className="relative">
                       <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                       <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-slate-800"
                       />
                    </div>
                 </div>

                 {profileError && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                       <AlertCircle size={16} /> {profileError}
                    </div>
                 )}
                 {profileMsg && (
                    <div className="bg-emerald-50 text-emerald-600 text-sm p-3 rounded-lg flex items-center gap-2">
                       <CheckCircle size={16} /> {profileMsg}
                    </div>
                 )}

                 <button 
                    type="submit"
                    className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                 >
                    <Save size={18} /> 儲存資料變更
                 </button>
              </form>
           </div>
        </div>

        {/* Security Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <Lock size={20} className="text-emerald-500" /> 安全設定 (Security)
              </h3>
           </div>
           
           <div className="p-8">
              <form onSubmit={handleChangePassword} className="space-y-6">
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">舊密碼 (Current Password)</label>
                    <div className="relative">
                       <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                       <input 
                          type="password" 
                          value={currentPwd}
                          onChange={(e) => setCurrentPwd(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-slate-800"
                          placeholder="輸入目前使用的密碼"
                       />
                    </div>
                 </div>

                 <div className="border-t border-slate-100 my-4"></div>

                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">新密碼 (New Password)</label>
                    <div className="relative">
                       <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                       <input 
                          type="password" 
                          value={newPwd}
                          onChange={(e) => setNewPwd(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-slate-800"
                          placeholder="至少 6 個字元"
                       />
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">確認新密碼 (Confirm)</label>
                    <div className="relative">
                       <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                       <input 
                          type="password" 
                          value={confirmPwd}
                          onChange={(e) => setConfirmPwd(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-slate-800"
                          placeholder="再次輸入新密碼"
                       />
                    </div>
                 </div>

                 {pwdError && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                       <AlertCircle size={16} /> {pwdError}
                    </div>
                 )}
                 {pwdMsg && (
                    <div className="bg-emerald-50 text-emerald-600 text-sm p-3 rounded-lg flex items-center gap-2">
                       <CheckCircle size={16} /> {pwdMsg}
                    </div>
                 )}

                 <button 
                    type="submit"
                    className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                 >
                    <Save size={18} /> 更新密碼
                 </button>
              </form>
           </div>
        </div>

      </div>
    </div>
  );
};
