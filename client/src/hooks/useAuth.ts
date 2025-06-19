import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export function useAuth() {
  const [authChecked, setAuthChecked] = useState(false);
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/user", {
          credentials: "include",
        });
        
        if (res.status === 401) {
          setAuthChecked(true);
          return null;
        }
        
        if (!res.ok) {
          // For session deserialization errors, try to clear the session
          if (res.status === 500) {
            try {
              await fetch("/api/clear-session", {
                method: "POST",
                credentials: "include",
              });
            } catch (clearError) {
              console.error("Failed to clear session:", clearError);
            }
          }
          throw new Error(`${res.status}: ${res.statusText}`);
        }
        
        const userData = await res.json();
        setAuthChecked(true);
        return userData;
      } catch (error) {
        console.error("Authentication error:", error);
        setAuthChecked(true);
        // Try to clear session on persistent errors
        try {
          await fetch("/api/clear-session", {
            method: "POST",
            credentials: "include",
          });
        } catch (clearError) {
          console.error("Failed to clear session after error:", clearError);
        }
        return null;
      }
    },
    retry: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (!isLoading) {
      setAuthChecked(true);
    }
  }, [isLoading]);

  return {
    user,
    isLoading: isLoading && !authChecked,
    isAuthenticated: !!user,
    error,
  };
}
