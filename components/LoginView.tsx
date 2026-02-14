import React, { useState } from 'react';
import { Sparkles, ArrowRight, Lock, User, UserPlus } from 'lucide-react';

interface Props {
  onLogin: (username: string) => void;
}

export const LoginView: React.FC<Props> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('請輸入用戶名及密碼');
      return;
    }
    if (username.length < 3) {
      setError('用戶名長度最少為 3 個字元');
      return;
    }
    
    // In this local-first architecture, registration and login are functionally identical
    // (creating a new namespace in localStorage if it doesn't exist).
    // The UI separation is purely for User Experience mental models.
    onLogin(username);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-10 bg-slate-950 text-center text-white">
          <div className="flex justify-center mb-4">
            <div className="bg-slate-800 p-3 rounded-full shadow-lg shadow-emerald-500/20">
               <Sparkles className="h-8 w-8 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Finsider<span className="text-emerald-400">Pro</span></h1>
          <p className="text-slate-400 text-sm">專業理財顧問平台</p>
        </div>
        
        <div className="flex border-b border-slate-100">
           <button 
             onClick={() => { setIsRegister(false); setError(''); }}
             className={`flex-1 py-4 text-sm font-bold transition-colors ${!isRegister ? 'text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50/50' : 'text-slate-400 hover:text-slate-600'}`}
           >
             登入帳戶 (Login)
           </button>
           <button 
             onClick={() => { setIsRegister(true); setError(''); }}
             className={`flex-1 py-4 text-sm font-bold transition-colors ${isRegister ? 'text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50/50' : 'text-slate-400 hover:text-slate-600'}`}
           >
             建立新帳戶 (Register)
           </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg text-center font-medium border border-red-100">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">
               {isRegister ? '設定用戶名 (User ID)' : '顧問帳戶 (用戶名)'}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-slate-800"
                placeholder={isRegister ? "例如: advisor_john" : "輸入您的用戶ID"}
              />
            </div>
            {isRegister && <p className="text-xs text-slate-400 pl-1">這將是您的專屬資料庫識別碼</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">
               {isRegister ? '設定密碼' : '密碼'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-slate-800"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 group mt-4"
          >
            {isRegister ? (
               <>立即開通 <UserPlus size={18} /></>
            ) : (
               <>登入系統 <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} /></>
            )}
          </button>
          
          {!isRegister && (
             <p className="text-center text-xs text-slate-400 mt-6">
               提示: 輸入不同的用戶名可建立獨立的客戶資料庫
             </p>
          )}
        </form>
      </div>
    </div>
  );
};
