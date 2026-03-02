import { createContext, useContext, useState } from 'react';

// Global state container
const AuthContext = createContext();

// Provides auth state and functions to the app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => { // Initialize from localStorage if available
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  // Save user data and token on login
  const login = (userData, token) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // Clear user data and token on logout
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);