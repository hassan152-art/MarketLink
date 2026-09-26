import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLoggedInUser();
  }, []);

  const checkLoggedInUser = async () => {
    const token = localStorage.getItem('marketlink_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const userData = await fetchAPI('/auth/me');
      setUser(userData);
    } catch (err) {
      console.error('Session expired or invalid token:', err);
      localStorage.removeItem('marketlink_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const data = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem('marketlink_token', data.token);
    setUser(data.user);
    return data;
  };

  const register = async (formData) => {
    const data = await fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    if (data.token) {
      localStorage.setItem('marketlink_token', data.token);
      setUser(data.user);
    }
    return data;
  };

  const googleLogin = async (credential, mockUser = null) => {
    const data = await fetchAPI('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential, mockUser }),
    });

    localStorage.setItem('marketlink_token', data.token);
    setUser(data.user);
    return data;
  };
  const sendOTP = async (email) => {
  return fetchAPI('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};



  const resetPassword = async (token, password) => {
    return fetchAPI(`/auth/reset-password/${token}`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  };

  const resetPasswordWithOTP = async (email, otp, password) => {
    const data = await fetchAPI('/auth/reset-password-with-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp, password }),
    });
    if (data.token) {
      localStorage.setItem('marketlink_token', data.token);
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('marketlink_token');
    setUser(null);
  };

  const updateProfile = async (updatedFields) => {
    const data = await fetchAPI('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updatedFields),
    });
    setUser(data.user);
    return data;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      googleLogin,
      sendOTP,
      resetPassword,
      resetPasswordWithOTP,
      logout,
      updateProfile
    }}>

      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
