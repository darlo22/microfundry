import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/user"],
    queryFn: async () => {
      const res = await fetch("/api/user", {
        credentials: "include",
      });
      
      if (res.status === 401) {
        return null;
      }
      
      if (!res.ok) {
        return null;
      }
      
      return res.json();
    },
    retry: false,
    staleTime: 10 * 60 * 1000, // Increased from 5 to 10 minutes
    gcTime: 15 * 60 * 1000, // Cache for 15 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount if data exists
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
