import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChartLine, Rocket, TrendingUp } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "signin" | "signup";
  onModeChange: (mode: "signin" | "signup") => void;
}

export default function AuthModal({ isOpen, onClose, mode, onModeChange }: AuthModalProps) {
  const [userType, setUserType] = useState<"founder" | "investor" | "">("");

  const handleSignIn = () => {
    window.location.href = "/api/login";
  };

  const handleSignUp = () => {
    window.location.href = "/api/login";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-fundry-orange rounded-lg flex items-center justify-center">
              <ChartLine className="text-white" size={16} />
            </div>
            <span className="text-2xl font-bold text-fundry-navy">Fundry</span>
          </div>
          <DialogTitle className="text-center">
            {mode === "signin" ? "Welcome Back" : "Create Account"}
          </DialogTitle>
          <p className="text-center text-gray-600">
            {mode === "signin" ? "Sign in to your account" : "Join Fundry today"}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {mode === "signup" && (
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">I am a...</Label>
              <div className="grid grid-cols-2 gap-4">
                <Card 
                  className={`cursor-pointer transition-colors ${
                    userType === "founder" ? "border-fundry-orange bg-fundry-orange-light" : "hover:border-fundry-orange"
                  }`}
                  onClick={() => setUserType("founder")}
                >
                  <CardContent className="p-4 text-center">
                    <Rocket className="h-8 w-8 text-fundry-orange mx-auto mb-2" />
                    <div className="font-semibold">Founder</div>
                    <div className="text-xs text-gray-500">Raise capital</div>
                  </CardContent>
                </Card>
                <Card 
                  className={`cursor-pointer transition-colors ${
                    userType === "investor" ? "border-fundry-orange bg-fundry-orange-light" : "hover:border-fundry-orange"
                  }`}
                  onClick={() => setUserType("investor")}
                >
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-8 w-8 text-fundry-orange mx-auto mb-2" />
                    <div className="font-semibold">Investor</div>
                    <div className="text-xs text-gray-500">Invest in startups</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button 
              onClick={mode === "signin" ? handleSignIn : handleSignUp}
              className="w-full bg-fundry-orange hover:bg-orange-600"
              disabled={mode === "signup" && !userType}
            >
              {mode === "signin" ? "Sign In with Replit" : "Create Account with Replit"}
            </Button>
          </div>

          <div className="text-center">
            <span className="text-gray-600">
              {mode === "signin" ? "Don't have an account?" : "Already have an account?"}
            </span>
            <Button 
              variant="link" 
              onClick={() => onModeChange(mode === "signin" ? "signup" : "signin")}
              className="text-fundry-orange hover:text-orange-600 ml-1"
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
