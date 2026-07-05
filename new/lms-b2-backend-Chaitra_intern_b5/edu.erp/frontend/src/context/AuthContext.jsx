import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/staff_student_login/staff_login', {
        username,
        password
      });
      if (response.data.status_code === 200 || response.data.access_token) {
        // Backend could return flat response or wrapped in data
        const data = response.data.data || response.data;
        const access_token = response.data.access_token || data.access_token;
        const user_data = data.user_data || { username };
        
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(user_data));
        localStorage.setItem('org_id', user_data.org_id || '1');
        
        setUser(user_data);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('org_id');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
