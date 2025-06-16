import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export function useAuth() {
  const [authChecked, setAuthChecked] = useState(false);
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/user"],
    queryFn: async () => {
      const res = await fetch("/api/user", {
        credentials: "include",
      });
      
      if (res.status === 401) {
        setAuthChecked(true);
        return null;
      }
      
      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }
      
      const userData = await res.json();
      setAuthChecked(true);
      return userData;
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
