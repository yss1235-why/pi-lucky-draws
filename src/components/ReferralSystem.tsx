import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Share2, Copy, Users, Gift } from "lucide-react";
import { toast } from "sonner";

interface ReferralSystemProps {
  referralCode: string;
  onUseReferral: (referralCode: string) => void;
}

export const ReferralSystem = ({ referralCode, onUseReferral }: ReferralSystemProps) => {
  const [inputCode, setInputCode] = useState("");

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied to clipboard!");
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success("Referral code copied to clipboard!");
  };

  const handleUseReferral = () => {
    if (!inputCode.trim()) {
      toast.error("Please enter a referral code");
      return;
    }
    onUseReferral(inputCode.trim());
    setInputCode("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          Referral System
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Your Referral Code */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Gift className="w-4 h-4" />
            Your Referral Code
          </h3>
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-lg px-3 py-1">
                {referralCode}
              </Badge>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={copyReferralCode}
                className="h-8"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <Button 
              onClick={copyReferralLink}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Copy Referral Link
            </Button>
          </div>
        </div>

        {/* Use Referral Code */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Users className="w-4 h-4" />
            Use Someone's Referral
          </h3>
          <div className="flex gap-2">
            <Input
              placeholder="Enter referral code"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleUseReferral} variant="outline">
              Apply
            </Button>
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-secondary/20 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-sm">How Referrals Work:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Share your code with friends</li>
            <li>• When they join their first lottery, you get a bonus ticket</li>
            <li>• Daily referral = Daily ticket</li>
            <li>• Weekly referral = Weekly ticket</li>
            <li>• Monthly referral = Monthly ticket</li>
            <li>• No limits on referral bonuses!</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};