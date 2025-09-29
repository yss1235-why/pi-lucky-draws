import { useState, useEffect } from 'react';

export interface LotteryEntry {
  id: string;
  userId: string;
  lotteryId: string;
  entryType: 'pi' | 'ad' | 'referral';
  createdAt: string;
}

export interface Lottery {
  id: string;
  type: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  status: 'open' | 'closed';
  winnerCount: number;
  winners?: string[];
  participants?: number;
}

export interface AdCredit {
  userId: string;
  credits: number;
  lastAdTime: string | null;
}

export interface User {
  id: string;
  username: string;
  uid: string;
  referralCode: string;
  referredBy?: string;
  createdAt: string;
}

const STORAGE_KEYS = {
  users: 'pi_lottery_users',
  lotteries: 'pi_lottery_lotteries',
  entries: 'pi_lottery_entries',
  adCredits: 'pi_lottery_ad_credits',
  lotteryHistory: 'pi_lottery_history'
};

const getStoredData = <T>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

const setStoredData = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const useLotteryStore = () => {
  const [users, setUsers] = useState<User[]>(() => getStoredData(STORAGE_KEYS.users, []));
  const [lotteries, setLotteries] = useState<Lottery[]>(() => getStoredData(STORAGE_KEYS.lotteries, []));
  const [entries, setEntries] = useState<LotteryEntry[]>(() => getStoredData(STORAGE_KEYS.entries, []));
  const [adCredits, setAdCredits] = useState<AdCredit[]>(() => getStoredData(STORAGE_KEYS.adCredits, []));
  const [lotteryHistory, setLotteryHistory] = useState<Lottery[]>(() => getStoredData(STORAGE_KEYS.lotteryHistory, []));

  // Auto-save to localStorage
  useEffect(() => setStoredData(STORAGE_KEYS.users, users), [users]);
  useEffect(() => setStoredData(STORAGE_KEYS.lotteries, lotteries), [lotteries]);
  useEffect(() => setStoredData(STORAGE_KEYS.entries, entries), [entries]);
  useEffect(() => setStoredData(STORAGE_KEYS.adCredits, adCredits), [adCredits]);
  useEffect(() => setStoredData(STORAGE_KEYS.lotteryHistory, lotteryHistory), [lotteryHistory]);

  const createUser = (userData: Omit<User, 'id' | 'referralCode' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      referralCode: `REF_${userData.username.toUpperCase()}_${Math.random().toString(36).substring(7)}`,
      createdAt: new Date().toISOString()
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const getUserByUid = (uid: string) => users.find(user => user.uid === uid);

  const createActiveLotteries = () => {
    const now = new Date();
    const newLotteries: Lottery[] = [
      {
        id: `daily_${Date.now()}`,
        type: 'daily',
        startDate: now.toISOString(),
        endDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'open',
        winnerCount: 1
      },
      {
        id: `weekly_${Date.now()}`,
        type: 'weekly',
        startDate: now.toISOString(),
        endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'open',
        winnerCount: 4
      },
      {
        id: `monthly_${Date.now()}`,
        type: 'monthly',
        startDate: now.toISOString(),
        endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'open',
        winnerCount: 12
      }
    ];
    setLotteries(newLotteries);
  };

  const addEntry = (userId: string, lotteryId: string, entryType: 'pi' | 'ad' | 'referral') => {
    const newEntry: LotteryEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      userId,
      lotteryId,
      entryType,
      createdAt: new Date().toISOString()
    };
    setEntries(prev => [...prev, newEntry]);
    return newEntry;
  };

  const getUserAdCredits = (userId: string): AdCredit => {
    return adCredits.find(ac => ac.userId === userId) || { userId, credits: 0, lastAdTime: null };
  };

  const updateAdCredits = (userId: string, newCredits: number, lastAdTime?: string) => {
    setAdCredits(prev => {
      const existing = prev.find(ac => ac.userId === userId);
      if (existing) {
        return prev.map(ac => ac.userId === userId ? 
          { ...ac, credits: newCredits, lastAdTime: lastAdTime || ac.lastAdTime } : ac
        );
      } else {
        return [...prev, { userId, credits: newCredits, lastAdTime: lastAdTime || null }];
      }
    });
  };

  const getEntriesForLottery = (lotteryId: string) => {
    return entries.filter(entry => entry.lotteryId === lotteryId);
  };

  const getEntriesForUser = (userId: string) => {
    return entries.filter(entry => entry.userId === userId);
  };

  const canWatchAd = (userId: string): boolean => {
    const userCredits = getUserAdCredits(userId);
    if (!userCredits.lastAdTime) return true;
    
    const timeSinceLastAd = Date.now() - new Date(userCredits.lastAdTime).getTime();
    return timeSinceLastAd >= (30 * 60 * 1000); // 30 minutes
  };

  const watchAd = (userId: string): boolean => {
    if (!canWatchAd(userId)) return false;
    
    const userCredits = getUserAdCredits(userId);
    const newCredits = userCredits.credits + 0.05;
    updateAdCredits(userId, newCredits, new Date().toISOString());
    return true;
  };

  const useCreditsForEntry = (userId: string): boolean => {
    const userCredits = getUserAdCredits(userId);
    if (userCredits.credits >= 1) {
      updateAdCredits(userId, userCredits.credits - 1);
      return true;
    }
    return false;
  };

  return {
    users,
    lotteries,
    entries,
    adCredits,
    lotteryHistory,
    createUser,
    getUserByUid,
    createActiveLotteries,
    addEntry,
    getUserAdCredits,
    updateAdCredits,
    getEntriesForLottery,
    getEntriesForUser,
    canWatchAd,
    watchAd,
    useCreditsForEntry,
    setLotteries,
    setLotteryHistory
  };
};