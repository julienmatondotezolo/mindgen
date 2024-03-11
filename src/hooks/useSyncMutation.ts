import { MutationFunction, useMutation, UseMutationOptions } from "react-query";

const useSyncMutation = (
  mutationFn: MutationFunction<unknown, void>,
  options: Omit<UseMutationOptions<unknown, unknown, void, unknown>, "mutationFn"> | undefined,
) => {
  const mutationResults = useMutation(mutationFn, options);

  return {
    ...mutationResults,
    mutate: (...params: any) => {
      if (!mutationResults.isLoading) {
        mutationResults.mutate(...params);
      }
    },
  };
};

export { useSyncMutation };
