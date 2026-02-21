
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ClientProfile, InvestmentHolding, UserProfile, UserRole, UserStatus } from '../types';
import { MOCK_CLIENT } from '../constants';
import { updatePortfolioPrices } from '../services/geminiService';
import { db } from '/src/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, query, where, limit } from 'firebase/firestore';

interface ClientContextType {
  currentUser: UserProfile | null;
  clients: ClientProfile[];
  activeClient: ClientProfile | null;
  connectionStatus: 'connected' | 'disconnected' | 'checking' | 'unknown';
  checkConnection: () => Promise<void>;
  
  // Auth Functions
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (username: string, password: string, email: string) => Promise<{ success: boolean; message: string }>;
  requestPasswordReset: (username: string, email: string) => Promise<{ success: boolean; message: string }>;
  confirmPasswordReset: (username: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  
  // User Self-Management
  updateCurrentUserProfile: (data: { email: string }) => Promise<{ success: boolean; message: string }>;
  changeCurrentUserPassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;

  // Client Management
  selectClient: (id: string | null) => void;
  addClient: () => void;
  updateClient: (client: ClientProfile) => Promise<void>;
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

  // 3. Load Clients Data based on Current User (Firebase or Local)
  useEffect(() => {
    const loadClients = async () => {
      if (currentUser) {
        if (db) {
          // Firebase Mode
          try {
            // In a real app, we would query by advisorId. For this demo, we fetch all and filter client-side or assume collection is per-user if we had auth.
            // Let's assume a 'clients' collection where we store everything for now, filtering by 'advisorId' if we added that field.
            // Since we don't have advisorId on ClientProfile yet, we'll just fetch all for the demo.
            // To make it multi-tenant safe, we SHOULD add advisorId. 
            // For this demo, we will use a subcollection or just a query.
            // Let's use a simple query: collection 'clients'
            
            const querySnapshot = await getDocs(collection(db, 'clients'));
            const fbClients: ClientProfile[] = [];
            querySnapshot.forEach((doc) => {
              // We store the Firestore ID as the client ID for consistency in updates
              const data = doc.data() as ClientProfile;
              fbClients.push({ ...data, id: doc.id }); 
            });
            
            if (fbClients.length > 0) {
               setClients(fbClients);
            } else {
               // Initial seed if empty
               setClients([]);
            }
          } catch (error) {
            console.error("Firebase load error:", error);
            // Fallback to local
            loadLocalClients();
          }
        } else {
          // Local Mode
          loadLocalClients();
        }
      } else {
        setClients([]);
        setSelectedClientId(null);
      }
    };

    loadClients();
  }, [currentUser]);

  const loadLocalClients = () => {
    if (!currentUser) return;
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
      setClients([MOCK_CLIENT]);
    }
  };

  // 4. Persist Clients Data (Local Only - Firebase updates happen on action)
  useEffect(() => {
    if (currentUser && clients.length > 0 && !db) {
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

  // --- New Self-Service User Functions ---

  const updateCurrentUserProfile = async (data: { email: string }): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: 'Not logged in' };
    
    const updatedUser = { ...currentUser, email: data.email };
    
    // Update State
    setCurrentUser(updatedUser);
    
    // Update Database List
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    
    // Update Session Storage
    localStorage.setItem('finsider_current_session', JSON.stringify(updatedUser));

    return { success: true, message: '個人資料已更新 (Profile Updated)' };
  };

  const changeCurrentUserPassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: 'Not logged in' };
    
    // Check old password
    if (currentUser.password !== currentPassword) {
       return { success: false, message: '舊密碼錯誤 (Incorrect current password)' };
    }

    const updatedUser = { ...currentUser, password: newPassword };
    
    // Update State (password is part of session usually for re-auth, though risky in localstorage, keeping consistent with demo)
    setCurrentUser(updatedUser);
    
    // Update Database List
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    
    // Update Session Storage
    localStorage.setItem('finsider_current_session', JSON.stringify(updatedUser));

    return { success: true, message: '密碼已更改 (Password Changed)' };
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

  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking' | 'unknown'>('unknown');

  // Helper to clean undefined values for Firestore
  const cleanData = (obj: any): any => {
     if (obj === undefined) return null; // Firestore doesn't support undefined
     if (obj === null) return null;
     
     // Handle Date objects - Firestore supports them
     if (obj instanceof Date) return obj;
     
     if (typeof obj !== 'object') return obj; // Primitives

     if (Array.isArray(obj)) {
        return obj.map(v => cleanData(v)).filter(v => v !== undefined);
     }
     
     // Object
     return Object.entries(obj).reduce((acc, [key, value]) => {
        if (value !== undefined) {
           const cleaned = cleanData(value);
           if (cleaned !== undefined) {
              acc[key] = cleaned;
           }
        }
        return acc;
     }, {} as any);
  };

  const checkConnection = async () => {
    if (!db) {
      setConnectionStatus('disconnected');
      return;
    }
    setConnectionStatus('checking');
    try {
      // Try to fetch 1 document to test connection
      await getDocs(query(collection(db, 'clients'), limit(1)));
      setConnectionStatus('connected');
      console.log("Firebase connection verified");
    } catch (e) {
      console.error("Firebase connection check failed:", e);
      setConnectionStatus('disconnected');
    }
  };

  // Check connection on mount
  useEffect(() => {
    if (db) {
      checkConnection();
    }
  }, []);

  const addClient = async () => {
    // Generate ID
    const existingIds = clients.map(c => {
      // Handle both numeric IDs (local) and UUIDs (firebase) gracefully
      // For generating new local ID, we look for C-XXX pattern
      const match = c.id.match(/C-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });

    let nextIdNum = 1;
    if (existingIds.length > 0) {
      const maxId = Math.max(...existingIds);
      nextIdNum = maxId + 1;
    }

    const newLocalId = `C-${String(nextIdNum).padStart(3, '0')}`;

    const newClient: ClientProfile = {
      ...MOCK_CLIENT,
      id: newLocalId, // Temporary ID, will be replaced by Firestore ID if connected
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

    // Optimistic Update: Immediately show the new client
    setClients(prev => [...prev, newClient]);
    setSelectedClientId(newClient.id);

    if (db) {
       // Run Firebase sync in background
       (async () => {
         let retries = 3;
         while (retries > 0) {
            try {
                // Add to Firestore
                const { id, ...clientData } = newClient;
                const cleanedData = cleanData(clientData);
                
                // Add timeout (20s)
                const timeoutPromise = new Promise((_, reject) => 
                   setTimeout(() => reject(new Error("Request timed out")), 20000)
                );

                const docRef = await Promise.race([
                   addDoc(collection(db, 'clients'), cleanedData),
                   timeoutPromise
                ]) as any; 
                
                const realId = docRef.id;
                console.log(`Firebase sync success. Swapping local ID ${newLocalId} with real ID ${realId}`);

                // Swap Local ID with Real ID
                setClients(prev => prev.map(c => c.id === newLocalId ? { ...c, id: realId } : c));
                
                // If the user is still viewing this client, update the selection too
                setSelectedClientId(prev => prev === newLocalId ? realId : prev);
                
                // Success - break loop
                break;

            } catch (e: any) {
                retries--;
                console.warn(`Background sync attempt failed (${3 - retries}/3):`, e.message);
                
                if (retries === 0) {
                   console.warn("All sync attempts failed. Data remains local-only for now.");
                   // We don't alert the user here because they are already working.
                } else {
                   // Wait 2 seconds before retry
                   await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
         }
       })();
    }
  };

  const updateClient = async (updated: ClientProfile) => {
    // Optimistic Update: Update local state immediately
    setClients(prev => prev.map(c => c.id === updated.id ? updated : c));

    if (db) {
       try {
          console.log("Starting updateClient for ID:", updated.id);
          
          // If ID is local (starts with C-), we can't update Firestore yet unless we create it
          // For simplicity in this hybrid mode, if it's a local ID, we just skip Firestore update or try to add it
          if (updated.id.startsWith('C-')) {
             console.warn("Skipping Firestore update for local ID:", updated.id);
             return; 
          }

          const clientRef = doc(db, 'clients', updated.id);
          
          // Update Firestore
          // We exclude the ID from the update payload
          const { id, ...data } = updated;
          const cleanedData = cleanData(data);
          
          // Add a timeout to the setDoc promise
          const timeoutPromise = new Promise((_, reject) => 
             setTimeout(() => reject(new Error("Request timed out")), 5000) // Reduced to 5s
          );
          
          await Promise.race([
             setDoc(clientRef, cleanedData, { merge: true }),
             timeoutPromise
          ]);
          
          console.log("Firestore update successful");
       } catch (e: any) {
          console.error("Error updating document (background): ", e);
          // We already updated local state, so just notify user of sync issue
          if (e.message === "Request timed out") {
             console.warn("Sync timed out - data saved locally only");
          }
       }
    }
  };

  const deleteClient = async (id: string) => {
    if (window.confirm("確定要刪除此客戶檔案嗎？")) {
       if (db) {
          try {
             await deleteDoc(doc(db, 'clients', id));
             setClients(prev => prev.filter(c => c.id !== id));
             if (selectedClientId === id) setSelectedClientId(null);
          } catch (e) {
             console.error("Error deleting document: ", e);
             alert("Firebase Error: Could not delete client.");
          }
       } else {
          setClients(prev => prev.filter(c => c.id !== id));
          if (selectedClientId === id) setSelectedClientId(null);
       }
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
      connectionStatus,
      checkConnection,
      login,
      register,
      requestPasswordReset,
      confirmPasswordReset,
      logout,
      updateCurrentUserProfile,
      changeCurrentUserPassword,
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
