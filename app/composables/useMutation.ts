import { parseError } from "~/utils/app_utils";

interface Error {
  payload?: object;
  title?: string;
  description?: string;
}

export function useMutation(mutation: () => Promise<void>) {
  const pending = ref(false);
  const success = ref(false);
  const error = ref<Error>();
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
    setError(newError: Error) {
      error.value = newError;
    },
  };
}
