
import React, { useState } from 'react';
import { Sparkles, ArrowRight, Lock, User, UserPlus, AlertCircle, CheckCircle, Mail, KeyRound, ArrowLeft, Send } from 'lucide-react';
import { useClient } from '../contexts/ClientContext';

interface Props {
  onLogin: (username: string) => void;
}

type AuthMode = 'LOGIN' | 'REGISTER' | 'RESET';

// Reset Process Stages
enum ResetStage {
  INPUT_INFO = 0,
  EMAIL_SENT = 1,
  NEW_PASSWORD = 2
}

export const LoginView: React.FC<Props> = () => {
  const { login, register, requestPasswordReset, confirmPasswordReset } = useClient();
  
  const [authMode, setAuthMode] = useState<AuthMode>('LOGIN');
  const [resetStage, setResetStage] = useState<ResetStage>(ResetStage.INPUT_INFO);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reset form fields when switching modes
  const switchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setResetStage(ResetStage.INPUT_INFO); // Reset the reset flow
    setError('');
    setSuccessMsg('');
    setPassword('');
    // We generally keep username/email if entered for UX, or you could clear them.
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (authMode === 'LOGIN') {
        if (!username || !password) throw new Error('請輸入用戶名及密碼 (Please enter username and password)');
        const result = await login(username, password);
        if (!result.success) setError(result.message);

      } else if (authMode === 'REGISTER') {
        if (!username || !password || !email) throw new Error('請填寫所有欄位 (Please fill all fields)');
        const result = await register(username, password, email);
        if (result.success) {
           setSuccessMsg(result.message);
           switchMode('LOGIN'); 
           setSuccessMsg(result.message); 
        } else {
           setError(result.message);
        }

      } else if (authMode === 'RESET') {
        // --- RESET FLOW LOGIC ---
        if (resetStage === ResetStage.INPUT_INFO) {
           // Step 1: Request Reset
           if (!username || !email) throw new Error('請輸入用戶名及註冊電郵');
           const result = await requestPasswordReset(username, email);
           if (result.success) {
              setResetStage(ResetStage.EMAIL_SENT);
              setSuccessMsg(result.message);
           } else {
              setError(result.message);
           }

        } else if (resetStage === ResetStage.NEW_PASSWORD) {
           // Step 3: Confirm Reset
           if (!password) throw new Error('請設定新密碼');
           const result = await confirmPasswordReset(username, password);
           if (result.success) {
              setSuccessMsg(result.message);
              switchMode('LOGIN');
              setSuccessMsg(result.message); // Show success on login screen
           } else {
              setError(result.message);
           }
        }
      }
    } catch (err: any) {
      setError(err.message || '發生錯誤，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to simulate clicking the email link
  const simulateEmailClick = () => {
     setSuccessMsg('');
     setError('');
     setResetStage(ResetStage.NEW_PASSWORD);
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
        
        {/* Tabs for Login/Register - Only show when not in Reset mode */}
        {authMode !== 'RESET' && (
          <div className="flex border-b border-slate-100">
             <button 
               onClick={() => switchMode('LOGIN')}
               className={`flex-1 py-4 text-sm font-bold transition-colors ${authMode === 'LOGIN' ? 'text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50/50' : 'text-slate-400 hover:text-slate-600'}`}
             >
               登入帳戶 (Login)
             </button>
             <button 
               onClick={() => switchMode('REGISTER')}
               className={`flex-1 py-4 text-sm font-bold transition-colors ${authMode === 'REGISTER' ? 'text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50/50' : 'text-slate-400 hover:text-slate-600'}`}
             >
               建立新帳戶 (Register)
             </button>
          </div>
        )}

        {/* Reset Password Header */}
        {authMode === 'RESET' && (
           <div className="bg-amber-50 p-4 border-b border-amber-100 flex items-center gap-2 text-amber-700 font-bold justify-center text-sm">
              <KeyRound size={18} /> 重設密碼 (Reset Password)
           </div>
        )}
        
        {/* === MAIN FORM AREA === */}
        <div className="p-10 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-left font-medium border border-red-100 flex items-start gap-2 animate-fade-in">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="bg-emerald-50 text-emerald-600 text-sm p-3 rounded-lg text-left font-medium border border-emerald-100 flex items-start gap-2 animate-fade-in">
              <CheckCircle size={18} className="shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Step 2 Special View: Email Sent Simulation */}
          {authMode === 'RESET' && resetStage === ResetStage.EMAIL_SENT ? (
             <div className="text-center space-y-6 py-4 animate-fade-in">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto">
                   <Mail size={32} />
                </div>
                <div>
                   <h3 className="text-lg font-bold text-slate-800">請查收您的郵件</h3>
                   <p className="text-slate-500 text-sm mt-2">
                      我們已發送重設連結至 <strong>{email}</strong>。<br/>請點擊郵件中的連結以設定新密碼。
                   </p>
                </div>
                
                <div className="border-t border-slate-100 pt-6">
                   <p className="text-xs text-slate-400 mb-3">(由於此為示範系統，請點擊下方按鈕模擬「點擊郵件連結」)</p>
                   <button 
                     type="button"
                     onClick={simulateEmailClick}
                     className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm shadow-lg shadow-blue-200 transition-all w-full"
                   >
                     (模擬) 點擊郵件中的重設連結
                   </button>
                </div>
                
                <button
                  type="button"
                  onClick={() => switchMode('LOGIN')}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold flex items-center justify-center gap-1 mx-auto"
                >
                   <ArrowLeft size={14} /> 返回登入
                </button>
             </div>
          ) : (
            /* Normal Form Inputs */
            <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
              
              {/* Username Input - Hidden if in Reset Step 3 (New Password) */}
              {(resetStage !== ResetStage.NEW_PASSWORD) && (
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">
                    {authMode === 'REGISTER' ? '設定用戶名 (User ID)' : '用戶名 (User ID)'}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-slate-800"
                      placeholder={authMode === 'REGISTER' ? "例如: advisor_john" : "輸入您的用戶ID"}
                      required
                      disabled={authMode === 'RESET' && resetStage !== ResetStage.INPUT_INFO}
                    />
                  </div>
                  {authMode === 'REGISTER' && <p className="text-xs text-slate-400 pl-1">這將是您的專屬資料庫識別碼</p>}
                </div>
              )}

              {/* Email Input - Register OR Reset Step 1 */}
              {(authMode === 'REGISTER' || (authMode === 'RESET' && resetStage === ResetStage.INPUT_INFO)) && (
                <div className="space-y-2 animate-fade-in">
                  <label className="block text-sm font-bold text-slate-700">
                    {authMode === 'RESET' ? '驗證電郵 (Verify Email)' : '電郵地址 (Email)'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-slate-800"
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-400 pl-1">
                    {authMode === 'RESET' ? '請輸入註冊時的電郵地址以接收重設連結' : '用於忘記密碼時驗證身分'}
                  </p>
                </div>
              )}

              {/* Password Input - Login, Register, OR Reset Step 3 (New Password) */}
              {(authMode !== 'RESET' || resetStage === ResetStage.NEW_PASSWORD) && (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-bold text-slate-700">
                        {authMode === 'REGISTER' ? '設定密碼' : authMode === 'RESET' ? '設定新密碼 (New Password)' : '密碼 (Password)'}
                    </label>
                    {authMode === 'LOGIN' && (
                        <button 
                          type="button" 
                          onClick={() => switchMode('RESET')} 
                          className="text-xs font-bold text-emerald-600 hover:underline"
                        >
                          忘記密碼？
                        </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-slate-800"
                      placeholder={authMode === 'RESET' ? '輸入新密碼' : '••••••••'}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button 
                type="submit"
                disabled={isLoading}
                className={`w-full text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 group mt-4 disabled:opacity-50 disabled:cursor-not-allowed ${
                  authMode === 'RESET' 
                      ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' 
                      : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'
                }`}
              >
                {isLoading ? (
                  <span>處理中...</span>
                ) : authMode === 'REGISTER' ? (
                  <>立即申請 <UserPlus size={18} /></>
                ) : authMode === 'RESET' ? (
                  resetStage === ResetStage.INPUT_INFO ? 
                      <>發送重設郵件 <Send size={18} /></> : 
                      <>確認更改密碼 <CheckCircle size={18} /></>
                ) : (
                  <>登入系統 <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} /></>
                )}
              </button>
              
              {/* Back to Login for Reset Mode */}
              {authMode === 'RESET' && (
                <button
                  type="button"
                  onClick={() => switchMode('LOGIN')}
                  className="w-full text-center text-slate-500 text-sm font-bold hover:text-slate-700 mt-2 flex items-center justify-center gap-1"
                >
                    <ArrowLeft size={14} /> 返回登入
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
