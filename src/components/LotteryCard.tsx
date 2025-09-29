import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Trophy, Coins, Play } from "lucide-react";
import { Lottery } from "@/hooks/useLotteryStore";
import { toast } from "sonner";

interface LotteryCardProps {
  lottery: Lottery;
  userCredits: number;
  canWatchAd: boolean;
  entries: number;
  onEnterWithPi: () => void;
  onWatchAd: () => void;
}

export const LotteryCard = ({
  lottery,
  userCredits,
  canWatchAd,
  entries,
  onEnterWithPi,
  onWatchAd
}: LotteryCardProps) => {
  const [isWatchingAd, setIsWatchingAd] = useState(false);

  const getLotteryColor = (type: string) => {
    switch (type) {
      case 'daily': return 'from-blue-500 to-cyan-500';
      case 'weekly': return 'from-purple-500 to-pink-500';
      case 'monthly': return 'from-orange-500 to-red-500';
      default: return 'from-primary to-secondary';
    }
  };

  const getTimeRemaining = () => {
    const end = new Date(lottery.endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return "Ended";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleWatchAd = async () => {
    if (!canWatchAd) {
      toast.error("Please wait 30 minutes between ads");
      return;
    }

    setIsWatchingAd(true);
    
    // Simulate ad watching
    setTimeout(() => {
      setIsWatchingAd(false);
      onWatchAd();
    }, 2000);
  };

  const canUseCredits = userCredits >= 1;

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold capitalize flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getLotteryColor(lottery.type)}`} />
            {lottery.type} Lottery
          </CardTitle>
          <Badge variant="secondary" className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <Trophy className="w-3 h-3 mr-1" />
            {lottery.winnerCount} winner{lottery.winnerCount > 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{getTimeRemaining()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>{lottery.participants || 0} entries</span>
          </div>
        </div>

        {entries > 0 && (
          <div className="bg-primary/5 rounded-lg p-3">
            <p className="text-sm font-medium text-primary">
              Your entries: {entries}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between text-sm bg-secondary/20 rounded-lg p-3">
          <span className="flex items-center gap-2">
            <Coins className="w-4 h-4" />
            Ad Credits: {userCredits.toFixed(2)} Pi
          </span>
          {canUseCredits && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Can enter with credits!
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={onEnterWithPi}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
          >
            <Coins className="w-4 h-4 mr-2" />
            Pay 1 π
          </Button>
          
          <Button 
            onClick={handleWatchAd}
            disabled={!canWatchAd || isWatchingAd}
            variant="outline"
            className="hover:bg-secondary/50"
          >
            <Play className="w-4 h-4 mr-2" />
            {isWatchingAd ? "Loading..." : "Watch Ad"}
          </Button>
        </div>

        {!canWatchAd && (
          <p className="text-xs text-muted-foreground text-center">
            Next ad available in 30 minutes
          </p>
        )}
      </CardContent>
    </Card>
  );
};