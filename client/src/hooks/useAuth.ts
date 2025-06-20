import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/user"],
    queryFn: async () => {
      const res = await fetch("/api/user", {
        credentials: "include",
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (res.status === 401) {
        return null;
      }
      
      if (!res.ok) {
        console.error('Auth fetch error:', res.status, res.statusText);
        return null;
      }
      
      const userData = await res.json();
      console.log('Auth success:', userData?.id);
      return userData;
    },
    retry: (failureCount, error) => {
      // Only retry on network errors, not auth failures
      return failureCount < 2 && !error?.message?.includes('401');
    },
    staleTime: 2 * 60 * 1000, // Reduced to 2 minutes
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}
