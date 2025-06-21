import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, isSuccess } = useQuery({
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
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    // Set initial data to trigger immediate render
    initialData: undefined,
  });

  return {
    user,
    isLoading,
    isSuccess,
    isAuthenticated: !!user,
    // Add a flag to show if we've completed the first auth check
    hasCompletedAuthCheck: isSuccess || !isLoading,
  };
}
