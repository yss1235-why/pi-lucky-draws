import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthScreen } from "@/components/AuthScreen";
import { LotteryCard } from "@/components/LotteryCard";
import { AdminPanel } from "@/components/AdminPanel";
import { LotteryHistory } from "@/components/LotteryHistory";
import { ReferralSystem } from "@/components/ReferralSystem";
import { usePiAuth } from "@/hooks/usePiAuth";
import { useLotteryStore } from "@/hooks/useLotteryStore";
import { LogOut, Coins, Clock, Gift } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const { user, isAuthenticated, isLoading, signOut, isAdmin } = usePiAuth();
  const {
    users,
    lotteries,
    entries,
    createUser,
    getUserByUid,
    createActiveLotteries,
    addEntry,
    getUserAdCredits,
    canWatchAd,
    watchAd,
    useCreditsForEntry,
    getEntriesForUser
  } = useLotteryStore();

  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (user && isAuthenticated) {
      let existingUser = getUserByUid(user.uid);
      
      if (!existingUser) {
        existingUser = createUser({
          username: user.username,
          uid: user.uid
        });
      }
      
      setCurrentUser(existingUser);

      // Create active lotteries if none exist
      if (lotteries.length === 0) {
        createActiveLotteries();
      }
    }
  }, [user, isAuthenticated]);

  const handleSignOut = async () => {
    await signOut();
    setCurrentUser(null);
  };

  const handleEnterLottery = (lotteryId: string, entryType: 'pi' | 'ad') => {
    if (!currentUser) return;

    if (entryType === 'pi') {
      // Simulate Pi payment (would integrate with Pi SDK in real app)
      addEntry(currentUser.id, lotteryId, 'pi');
      toast.success("Entered lottery with Pi payment!");
    } else if (entryType === 'ad') {
      const userCredits = getUserAdCredits(currentUser.id);
      if (userCredits.credits >= 1) {
        if (useCreditsForEntry(currentUser.id)) {
          addEntry(currentUser.id, lotteryId, 'ad');
          toast.success("Entered lottery using ad credits!");
        }
      } else {
        toast.error("Not enough ad credits. Need 1 Pi worth of credits.");
      }
    }
  };

  const handleWatchAd = () => {
    if (!currentUser) return;

    if (watchAd(currentUser.id)) {
      toast.success("Ad watched! +0.05 Pi credits");
    } else {
      toast.error("Please wait 30 minutes between ads");
    }
  };

  const handleUseReferral = (referralCode: string) => {
    const referrer = users.find(u => u.referralCode === referralCode);
    if (!referrer) {
      toast.error("Invalid referral code");
      return;
    }

    if (referrer.id === currentUser?.id) {
      toast.error("Cannot use your own referral code");
      return;
    }

    // Give referral tickets to referrer for each lottery type
    ['daily', 'weekly', 'monthly'].forEach(type => {
      const lottery = lotteries.find(l => l.type === type && l.status === 'open');
      if (lottery) {
        addEntry(referrer.id, lottery.id, 'referral');
      }
    });

    toast.success(`Applied referral code! ${referrer.username} received bonus tickets.`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const userCredits = currentUser ? getUserAdCredits(currentUser.id) : { credits: 0, lastAdTime: null };
  const userEntries = currentUser ? getEntriesForUser(currentUser.id) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">π</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Pi Lottery
              </h1>
              <p className="text-sm text-muted-foreground">Welcome, {user?.username}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Coins className="w-4 h-4 text-primary" />
              <span className="font-medium">{userCredits.credits.toFixed(2)} Pi Credits</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isAdmin ? (
          <AdminPanel />
        ) : (
          <Tabs defaultValue="lotteries" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="lotteries">Lotteries</TabsTrigger>
              <TabsTrigger value="referral">Referrals</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="lotteries" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {lotteries.filter(l => l.status === 'open').map(lottery => {
                  const userLotteryEntries = userEntries.filter(e => e.lotteryId === lottery.id);
                  return (
                    <LotteryCard
                      key={lottery.id}
                      lottery={lottery}
                      userCredits={userCredits.credits}
                      canWatchAd={canWatchAd(currentUser?.id || '')}
                      entries={userLotteryEntries.length}
                      onEnterWithPi={() => handleEnterLottery(lottery.id, 'pi')}
                      onWatchAd={handleWatchAd}
                    />
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="referral">
              {currentUser && (
                <ReferralSystem
                  referralCode={currentUser.referralCode}
                  onUseReferral={handleUseReferral}
                />
              )}
            </TabsContent>

            <TabsContent value="history">
              <LotteryHistory />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Index;
