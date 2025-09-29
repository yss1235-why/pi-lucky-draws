import { useState, useEffect } from 'react';

interface PiUser {
  uid: string;
  username: string;
  accessToken: string;
}

interface AuthState {
  user: PiUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Simulated Pi SDK for demo purposes
const mockPiAuth = {
  authenticate: async (): Promise<PiUser> => {
    // Simulate Pi SDK authentication
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser: PiUser = {
          uid: `pi_${Math.random().toString(36).substring(7)}`,
          username: `piuser_${Math.random().toString(36).substring(7)}`,
          accessToken: `token_${Math.random().toString(36).substring(7)}`
        };
        resolve(mockUser);
      }, 1000);
    });
  },
  
  signOut: async (): Promise<void> => {
    localStorage.removeItem('piUser');
  }
};

export const usePiAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('piUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('piUser');
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    } else {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  }, []);

  const signIn = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const user = await mockPiAuth.authenticate();
      localStorage.setItem('piUser', JSON.stringify(user));
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false
      });
      return user;
    } catch (error) {
      console.error('Authentication failed:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
      throw error;
    }
  };

  const signOut = async () => {
    await mockPiAuth.signOut();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  const isAdmin = (username?: string) => {
    return username === 'admin' || username === 'ADMIN_USERNAME';
  };

  return {
    ...authState,
    signIn,
    signOut,
    isAdmin: isAdmin(authState.user?.username)
  };
};