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

// Real Pi SDK integration
declare global {
  interface Window {
    Pi: {
      authenticate: (scopes: string[], onIncompletePaymentFound: (payment: any) => void) => Promise<{
        accessToken: string;
        user: {
          uid: string;
          username: string;
        };
      }>;
      createPayment: (paymentData: any, callbacks: any) => void;
      openShareDialog: (title: string, message: string) => void;
    };
  }
}

const piAuth = {
  authenticate: async (): Promise<PiUser> => {
    if (!window.Pi) {
      throw new Error('Pi SDK not loaded. Please open this app in Pi Browser.');
    }

    try {
      const auth = await window.Pi.authenticate(['payments', 'username'], (payment) => {
        // Handle incomplete payment if any
        console.log('Incomplete payment found:', payment);
      });

      return {
        uid: auth.user.uid,
        username: auth.user.username,
        accessToken: auth.accessToken
      };
    } catch (error) {
      console.error('Pi authentication failed:', error);
      throw error;
    }
  },
  
  signOut: async (): Promise<void> => {
    localStorage.removeItem('piUser');
    // Pi SDK doesn't have explicit signOut, we just clear local storage
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
      const user = await piAuth.authenticate();
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
    await piAuth.signOut();
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