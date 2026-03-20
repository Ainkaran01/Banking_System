import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  customerId: number | null;
  customerName: string;
  token: string | null;
}

interface AuthContextType extends AuthState {
  login: (token: string, customerId: number, name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>(() => {
    const token = localStorage.getItem('token');
    const customerId = localStorage.getItem('customerId');
    const customerName = localStorage.getItem('customerName') || '';
    console.log(customerId);
    return {
      isAuthenticated: !!token || !!customerId,
      customerId: customerId ? parseInt(customerId) : null,
      customerName,
      token,
    };
  });

  const login = (token: string, customerId: number, name: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('customerId', String(customerId));
    localStorage.setItem('customerName', name);
    setAuth({ isAuthenticated: true, customerId, customerName: name, token });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('customerId');
    localStorage.removeItem('customerName');
    setAuth({ isAuthenticated: false, customerId: null, customerName: '', token: null });
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
