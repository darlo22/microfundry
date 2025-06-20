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
    staleTime: 5 * 60 * 1000,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
