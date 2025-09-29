import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Users } from "lucide-react";
import { useLotteryStore } from "@/hooks/useLotteryStore";

export const LotteryHistory = () => {
  const { lotteryHistory, users } = useLotteryStore();

  const getUsernameById = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.username || 'Unknown User';
  };

  const getLotteryColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'weekly': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'monthly': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (lotteryHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Lottery History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No completed lotteries yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Lottery History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {lotteryHistory.map((lottery, index) => (
          <div key={lottery.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={getLotteryColor(lottery.type)}>
                  {lottery.type.charAt(0).toUpperCase() + lottery.type.slice(1)}
                </Badge>
                <span className="text-sm text-muted-foreground">#{index + 1}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {formatDate(lottery.endDate)}
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{lottery.participants || 0} participants</span>
              </div>
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-muted-foreground" />
                <span>{lottery.winners?.length || 0} winners</span>
              </div>
            </div>

            {lottery.winners && lottery.winners.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h4 className="font-medium text-green-800 mb-2 text-sm">Winners:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {lottery.winners.map((winnerId, winnerIndex) => (
                    <p key={winnerId} className="text-sm text-green-700">
                      🏆 {getUsernameById(winnerId)}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};