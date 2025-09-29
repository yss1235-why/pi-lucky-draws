import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Trophy, Clock, Coins } from "lucide-react";
import { useLotteryStore } from "@/hooks/useLotteryStore";
import { toast } from "sonner";

export const AdminPanel = () => {
  const { 
    lotteries, 
    entries, 
    users, 
    getEntriesForLottery,
    setLotteries,
    setLotteryHistory
  } = useLotteryStore();

  const selectWinners = (lotteryId: string) => {
    const lottery = lotteries.find(l => l.id === lotteryId);
    if (!lottery) return;

    const lotteryEntries = getEntriesForLottery(lotteryId);
    const uniqueParticipants = [...new Set(lotteryEntries.map(e => e.userId))];
    
    if (uniqueParticipants.length === 0) {
      toast.error("No participants in this lottery");
      return;
    }

    // Simple random winner selection
    const shuffled = [...uniqueParticipants].sort(() => Math.random() - 0.5);
    const winnerCount = Math.min(lottery.winnerCount, shuffled.length);
    const winners = shuffled.slice(0, winnerCount);

    // Update lottery with winners
    setLotteries(prev => prev.map(l => 
      l.id === lotteryId 
        ? { ...l, status: 'closed' as const, winners, participants: uniqueParticipants.length }
        : l
    ));

    // Add to history
    setLotteryHistory(prev => {
      const updatedLottery = { ...lottery, status: 'closed' as const, winners, participants: uniqueParticipants.length };
      const newHistory = [updatedLottery, ...prev].slice(0, 6);
      return newHistory;
    });

    toast.success(`Selected ${winners.length} winner(s) for ${lottery.type} lottery`);
  };

  const getUsernameById = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.username || 'Unknown User';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Admin Panel
          </CardTitle>
          <CardDescription>
            Manage lotteries, view participants, and select winners
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Lotteries</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {lotteries.map(lottery => {
            const lotteryEntries = getEntriesForLottery(lottery.id);
            const uniqueParticipants = [...new Set(lotteryEntries.map(e => e.userId))];
            
            return (
              <Card key={lottery.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="capitalize">{lottery.type} Lottery</CardTitle>
                    <Badge variant={lottery.status === 'open' ? 'default' : 'secondary'}>
                      {lottery.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{uniqueParticipants.length} participants</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-muted-foreground" />
                      <span>{lotteryEntries.length} total entries</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-muted-foreground" />
                      <span>{lottery.winnerCount} winner slots</span>
                    </div>
                  </div>

                  {lottery.winners && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <h4 className="font-medium text-green-800 mb-2">Winners:</h4>
                      <div className="space-y-1">
                        {lottery.winners.map((winnerId, index) => (
                          <p key={winnerId} className="text-sm text-green-700">
                            #{index + 1}: {getUsernameById(winnerId)}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {lottery.status === 'open' && uniqueParticipants.length > 0 && (
                    <Button 
                      onClick={() => selectWinners(lottery.id)}
                      className="w-full"
                    >
                      Select Winners
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="participants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {users.map(user => {
                  const userEntries = entries.filter(e => e.userId === user.id);
                  return (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-muted-foreground">
                          Referral: {user.referralCode}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {userEntries.length} entries
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{users.length}</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{entries.length}</p>
                    <p className="text-sm text-muted-foreground">Total Entries</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{lotteries.filter(l => l.status === 'open').length}</p>
                    <p className="text-sm text-muted-foreground">Active Lotteries</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};