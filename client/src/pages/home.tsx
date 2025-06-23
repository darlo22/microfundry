import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user?.userType === "founder") {
      setLocation("/founder/dashboard");
    } else if (user?.userType === "investor") {
      setLocation("/investor/dashboard");
    }
  }, [user, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fundry-orange"></div>
    </div>
  );
}
