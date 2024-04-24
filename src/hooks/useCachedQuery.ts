// hooks/useCachedQuery.ts
import { useQueryClient } from "react-query";

// Define a generic type for the key parameter
type QueryKey = string | string[];

// Make the hook generic to allow for flexibility in the type of data it can return
const useCachedQuery = <T>(key: QueryKey): T | undefined => {
  const queryClient = useQueryClient();

  // Use the generic type T for the return value
  return queryClient.getQueryData<T>(key);
};

export { useCachedQuery };
