import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePiAuth } from "@/hooks/usePiAuth";

export const AuthScreen = () => {
  const { signIn, isLoading } = usePiAuth();

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-foreground">π</span>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Pi Network Lottery
          </CardTitle>
          <CardDescription className="text-base">
            Connect with Pi Browser to participate in daily, weekly, and monthly lotteries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
          >
            {isLoading ? "Connecting..." : "Connect with Pi"}
          </Button>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Secure authentication via Pi SDK
          </p>
        </CardContent>
      </Card>
    </div>
  );
};