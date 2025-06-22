import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage = res.statusText;
    try {
      const text = await res.text();
      // Check if response is HTML (like an error page)
      if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
        errorMessage = `Server returned HTML instead of JSON. This usually indicates a routing or server error.`;
      } else {
        errorMessage = text || res.statusText;
      }
    } catch (e) {
      // If we can't read the response, use the status text
      errorMessage = res.statusText;
    }
    throw new Error(`${res.status}: ${errorMessage}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  
  // Validate that response is actually JSON for API requests
  const contentType = res.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await res.clone().text();
    if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
      throw new Error('Login failed: Server returned HTML instead of expected JSON. This may indicate a routing error.');
    }
  }
  
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    
    // Check if response is JSON before parsing
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        return await res.json();
      } catch (error) {
        throw new Error('Failed to parse JSON response');
      }
    } else {
      // If not JSON, try to get text for better error message
      const text = await res.text();
      if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
        throw new Error('Server returned HTML instead of expected JSON data');
      }
      throw new Error('Server returned non-JSON response');
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: false,
    },
  },
});
