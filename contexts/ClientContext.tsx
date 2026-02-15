
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ClientProfile, InvestmentHolding } from '../types';
import { MOCK_CLIENT } from '../constants';
import { updatePortfolioPrices } from '../services/geminiService';

interface ClientContextType {
  currentUser: string | null;
  clients: ClientProfile[];
  activeClient: ClientProfile | null;
  login: (username: string) => void;
  logout: () => void;
  selectClient: (id: string | null) => void;
  addClient: () => void;
  updateClient: (client: ClientProfile) => void;
  deleteClient: (id: string) => void;
  refreshPortfolioPrices: (clientId: string) => Promise<void>;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // Initialize User
  useEffect(() => {
    const savedUser = localStorage.getItem('finsider_current_user');
    if (savedUser) setCurrentUser(savedUser);
  }, []);

  // Load Data on User Change
  useEffect(() => {
    if (currentUser) {
      const dbKey = `finsider_db_${currentUser}`;
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
    } else {
      setClients([]);
      setSelectedClientId(null);
    }
  }, [currentUser]);

  // Persist Data
  useEffect(() => {
    if (currentUser && clients.length > 0) {
      const dbKey = `finsider_db_${currentUser}`;
      localStorage.setItem(dbKey, JSON.stringify(clients));
    }
  }, [clients, currentUser]);

  const login = (username: string) => {
    localStorage.setItem('finsider_current_user', username);
    setCurrentUser(username);
  };

  const logout = () => {
    localStorage.removeItem('finsider_current_user');
    setCurrentUser(null);
    setSelectedClientId(null);
  };

  const selectClient = (id: string | null) => {
    setSelectedClientId(id);
  };

  const addClient = () => {
    // Generate sequential ID logic
    // Extract numbers from IDs like "C-001", "c-001", "C-102"
    const existingIds = clients.map(c => {
      const match = c.id.match(/(\d+)/);
      return match ? parseInt(match[0], 10) : 0;
    });

    let nextIdNum = 1;
    if (existingIds.length > 0) {
      // Find the max ID. Filter out suspiciously large numbers (timestamps) if any exist from legacy versions,
      // assuming standard sequential IDs are < 1,000,000.
      const validSequenceIds = existingIds.filter(n => n < 1000000);
      const maxId = validSequenceIds.length > 0 ? Math.max(...validSequenceIds) : Math.max(...existingIds);
      nextIdNum = maxId + 1;
    }

    // Format new ID as C-XXX (e.g., C-002)
    const newId = `C-${String(nextIdNum).padStart(3, '0')}`;

    const newClient: ClientProfile = {
      ...MOCK_CLIENT,
      id: newId,
      name: '新客戶 (New Client)',
      email: '',
      phone: '',
      notes: '',
      lastUpdated: new Date().toISOString(),
      lastMeetingDate: new Date().toISOString().split('T')[0], // Default to Today
      dateOfBirth: '1990-01-01', // Default DOB
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
      logout,
      selectClient,
      addClient,
      updateClient,
      deleteClient,
      refreshPortfolioPrices
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
