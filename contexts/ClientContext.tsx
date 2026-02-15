
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ClientProfile, InvestmentHolding, UserProfile, UserRole, UserStatus } from '../types';
import { MOCK_CLIENT } from '../constants';
import { updatePortfolioPrices } from '../services/geminiService';

interface ClientContextType {
  currentUser: UserProfile | null;
  clients: ClientProfile[];
  activeClient: ClientProfile | null;
  
  // Auth Functions
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (username: string, password: string, email: string) => Promise<{ success: boolean; message: string }>;
  requestPasswordReset: (username: string, email: string) => Promise<{ success: boolean; message: string }>;
  confirmPasswordReset: (username: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  
  // Client Management
  selectClient: (id: string | null) => void;
  addClient: () => void;
  updateClient: (client: ClientProfile) => void;
  deleteClient: (id: string) => void;
  refreshPortfolioPrices: (clientId: string) => Promise<void>;

  // Admin Functions
  allUsers: UserProfile[];
  updateUserStatus: (userId: string, status: UserStatus) => void;
  deleteUser: (userId: string) => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // 1. Initialize Users (Create Default Admin if empty)
  useEffect(() => {
    const savedUsersStr = localStorage.getItem('finsider_users_db');
    let loadedUsers: UserProfile[] = [];

    if (savedUsersStr) {
      try {
        loadedUsers = JSON.parse(savedUsersStr);
      } catch (e) { console.error(e); }
    }

    // Initialize default admin if no users exist
    if (loadedUsers.length === 0) {
      const defaultAdmin: UserProfile = {
        id: 'u_admin',
        username: 'admin',
        email: 'admin@finsider.pro',
        password: 'admin123', // Default Password
        role: 'ADMIN',
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      };
      loadedUsers.push(defaultAdmin);
      localStorage.setItem('finsider_users_db', JSON.stringify(loadedUsers));
    }
    setAllUsers(loadedUsers);

    // Check for logged in session
    const sessionUserStr = localStorage.getItem('finsider_current_session');
    if (sessionUserStr) {
      const sessionUser = JSON.parse(sessionUserStr);
      // Re-verify user exists and is active
      const validUser = loadedUsers.find(u => u.username === sessionUser.username && u.status === 'ACTIVE');
      if (validUser) {
        setCurrentUser(validUser);
      } else {
        localStorage.removeItem('finsider_current_session');
      }
    }
  }, []);

  // 2. Persist Users when changed
  useEffect(() => {
    if (allUsers.length > 0) {
      localStorage.setItem('finsider_users_db', JSON.stringify(allUsers));
    }
  }, [allUsers]);

  // 3. Load Clients Data based on Current User
  useEffect(() => {
    if (currentUser) {
      const dbKey = `finsider_db_${currentUser.username}`;
      const saved = localStorage.getItem(dbKey);
      if (saved) {
        try {
          setClients(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse DB", e);
          setClients([MOCK_CLIENT]);
        }
      } else {
        // Only load mock for fresh advisors
        setClients([MOCK_CLIENT]);
      }
    } else {
      setClients([]);
      setSelectedClientId(null);
    }
  }, [currentUser]);

  // 4. Persist Clients Data
  useEffect(() => {
    if (currentUser && clients.length > 0) {
      const dbKey = `finsider_db_${currentUser.username}`;
      localStorage.setItem(dbKey, JSON.stringify(clients));
    }
  }, [clients, currentUser]);


  // --- Auth Logic ---

  const login = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    const user = allUsers.find(u => u.username === username);
    
    if (!user) {
      return { success: false, message: '用戶不存在 (User not found)' };
    }

    if (user.password !== password) {
      return { success: false, message: '密碼錯誤 (Invalid password)' };
    }

    if (user.status === 'PENDING') {
      return { success: false, message: '帳戶等待審批中，請聯絡管理員 (Account Pending Approval)' };
    }

    if (user.status === 'SUSPENDED') {
      return { success: false, message: '帳戶已被停用 (Account Suspended)' };
    }

    // Success
    const updatedUser = { ...user, lastLogin: new Date().toISOString() };
    
    // Update local state and DB for last login time
    const newAllUsers = allUsers.map(u => u.id === user.id ? updatedUser : u);
    setAllUsers(newAllUsers);
    
    setCurrentUser(updatedUser);
    localStorage.setItem('finsider_current_session', JSON.stringify(updatedUser));
    return { success: true, message: 'Login Successful' };
  };

  const register = async (username: string, password: string, email: string): Promise<{ success: boolean; message: string }> => {
    if (allUsers.find(u => u.username === username)) {
      return { success: false, message: '用戶名已被使用 (Username taken)' };
    }

    const newUser: UserProfile = {
      id: `u_${Date.now()}`,
      username,
      email,
      password,
      role: 'ADVISOR', // Default role
      status: 'PENDING', // Default status
      createdAt: new Date().toISOString()
    };

    setAllUsers(prev => [...prev, newUser]);
    return { success: true, message: '註冊成功！請等待管理員開通您的帳戶。 (Registration successful. Please wait for admin approval.)' };
  };

  // Step 1: Request Reset (Simulate sending email)
  const requestPasswordReset = async (username: string, email: string): Promise<{ success: boolean; message: string }> => {
    const user = allUsers.find(u => u.username === username);
    
    // In a real app, we usually don't reveal if a user exists for security, but for this internal tool, it's fine.
    if (!user) {
      return { success: false, message: '用戶不存在 (User not found)' };
    }

    // Check email match (case insensitive)
    if (!user.email || user.email.toLowerCase() !== email.toLowerCase()) {
      return { success: false, message: '電郵地址不匹配 (Email does not match)' };
    }

    // Here we would normally call a backend API to send an email.
    // We return success to the UI to show the "Email Sent" screen.
    return { success: true, message: '重設密碼連結已發送至您的電郵 (Reset link sent to your email)' };
  };

  // Step 2: Confirm Reset (Simulate clicking link and setting new password)
  const confirmPasswordReset = async (username: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    const userIndex = allUsers.findIndex(u => u.username === username);
    if (userIndex === -1) return { success: false, message: 'Error finding user' };

    const updatedUser = { ...allUsers[userIndex], password: newPassword };
    const newAllUsers = [...allUsers];
    newAllUsers[userIndex] = updatedUser;
    
    setAllUsers(newAllUsers);
    return { success: true, message: '密碼已成功更新，請使用新密碼登入。' };
  };

  const logout = () => {
    localStorage.removeItem('finsider_current_session');
    setCurrentUser(null);
    setSelectedClientId(null);
  };

  // --- User Management (Admin) ---

  const updateUserStatus = (userId: string, status: UserStatus) => {
    if (currentUser?.role !== 'ADMIN') return;
    if (userId === currentUser.id) {
       alert("不能更改自己的狀態 (Cannot change own status)");
       return;
    }

    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
  };

  const deleteUser = (userId: string) => {
    if (currentUser?.role !== 'ADMIN') return;
    if (userId === currentUser.id) {
       alert("不能刪除自己的帳戶 (Cannot delete own account)");
       return;
    }
    
    if (confirm("確定刪除此用戶？該用戶的所有客戶資料將保留在瀏覽器記錄中，但無法再登入。")) {
       setAllUsers(prev => prev.filter(u => u.id !== userId));
    }
  };


  // --- Client Management ---

  const selectClient = (id: string | null) => {
    setSelectedClientId(id);
  };

  const addClient = () => {
    const existingIds = clients.map(c => {
      const match = c.id.match(/(\d+)/);
      return match ? parseInt(match[0], 10) : 0;
    });

    let nextIdNum = 1;
    if (existingIds.length > 0) {
      const validSequenceIds = existingIds.filter(n => n < 1000000);
      const maxId = validSequenceIds.length > 0 ? Math.max(...validSequenceIds) : Math.max(...existingIds);
      nextIdNum = maxId + 1;
    }

    const newId = `C-${String(nextIdNum).padStart(3, '0')}`;

    const newClient: ClientProfile = {
      ...MOCK_CLIENT,
      id: newId,
      name: '新客戶 (New Client)',
      email: '',
      phone: '',
      notes: '',
      lastUpdated: new Date().toISOString(),
      lastMeetingDate: new Date().toISOString().split('T')[0],
      dateOfBirth: '1990-01-01',
      assets: [],
      liabilities: [],
      cashFlow: [],
      insurance: [],
      portfolio: []
    };
    setClients(prev => [...prev, newClient]);
    setSelectedClientId(newClient.id);
  };

  const updateClient = (updated: ClientProfile) => {
    setClients(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const deleteClient = (id: string) => {
    if (window.confirm("確定要刪除此客戶檔案嗎？")) {
      setClients(prev => prev.filter(c => c.id !== id));
      if (selectedClientId === id) setSelectedClientId(null);
    }
  };

  const refreshPortfolioPrices = async (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client || client.portfolio.length === 0) return;

    try {
      const updatedHoldings = await updatePortfolioPrices(client.portfolio);
      const updatedClient = {
        ...client,
        portfolio: updatedHoldings,
        lastUpdated: new Date().toISOString()
      };
      updateClient(updatedClient);
    } catch (error) {
      console.error("Context: Failed to update prices", error);
      throw error;
    }
  };

  const activeClient = clients.find(c => c.id === selectedClientId) || null;

  return (
    <ClientContext.Provider value={{
      currentUser,
      clients,
      activeClient,
      login,
      register,
      requestPasswordReset,
      confirmPasswordReset,
      logout,
      selectClient,
      addClient,
      updateClient,
      deleteClient,
      refreshPortfolioPrices,
      allUsers,
      updateUserStatus,
      deleteUser
    }}>
      {children}
    </ClientContext.Provider>
  );
};

export const useClient = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
};
