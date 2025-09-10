import React, { createContext, ReactNode, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string;
  name: string;
  isGuest: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } else {
        // Initialize with guest user if no data exists
        await initializeGuestUser();
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // Fallback to guest user on any error
      await initializeGuestUser();
    } finally {
      setIsLoading(false);
    }
  };

  const initializeGuestUser = async () => {
    try {
      const guestUser: User = {
        id: `guest_${Date.now()}`,
        email: 'guest@example.com',
        name: 'Guest User',
        isGuest: true
      };
      setUser(guestUser);
      await AsyncStorage.setItem('user', JSON.stringify(guestUser));
    } catch (error) {
      console.error('Error initializing guest user:', error);
      // Set guest user in memory even if storage fails
      setUser({
        id: `guest_${Date.now()}`,
        email: 'guest@example.com',
        name: 'Guest User',
        isGuest: true
      });
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock login - replace with real authentication
      if (email === 'test@example.com' && password === '123456') {
        const userData: User = {
          id: 'user_1',
          email,
          name: 'Test User',
          isGuest: false
        };
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      // Mock signup - replace with real authentication
      const userData: User = {
        id: `user_${Date.now()}`,
        email,
        name,
        isGuest: false
      };
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsGuest = async () => {
    setIsLoading(true);
    try {
      await initializeGuestUser();
    } catch (error) {
      console.error('Error in guest login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem('user');
      // Reinitialize with guest user after logout
      await initializeGuestUser();
    } catch (error) {
      console.error('Error logging out:', error);
      // Ensure we have a guest user even if logout fails
      await initializeGuestUser();
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      signUp,
      loginAsGuest,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}