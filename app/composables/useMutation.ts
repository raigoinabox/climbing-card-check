import { parseError } from "~/utils/app_utils";

export function useMutation(mutation: () => Promise<void>) {
  const pending = ref(false);
  const success = ref(false);
  const error = ref<{
    payload?: object;
    title?: string;
    description?: string;
  }>();
  return {
    pending,
    success,
    error,
    mutate: async () => {
      try {
        pending.value = true;
        await mutation();
        success.value = true;
        error.value = undefined;
      } catch (promiseError) {
        success.value = false;
        error.value = parseError(promiseError);
      } finally {
        pending.value = false;
      }
    },
    reset() {
      success.value = false;
      error.value = undefined;
    },
    setError(newError: { description: string; title?: string }) {
      error.value = newError;
    },
  };
}
