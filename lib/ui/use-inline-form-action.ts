"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition, type FormEvent } from "react";

import type { InlineActionResult } from "@/lib/actions/inline-result";
import { refreshInPlace } from "@/lib/ui/refresh-in-place";

type UseInlineFormActionOptions = {
  onSuccess?: () => void;
};

export function useInlineFormAction(
  action: (formData: FormData) => Promise<InlineActionResult>,
  options: UseInlineFormActionOptions = {}
) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = useCallback(
    (formData: FormData) => {
      startTransition(async () => {
        setSuccess(false);
        const result = await action(formData);

        if (!result.ok) {
          setError(result.error);
          return;
        }

        setError(null);
        setSuccess(true);
        options.onSuccess?.();
        refreshInPlace(router);
      });
    },
    [action, options, router]
  );

  const onSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      submit(new FormData(event.currentTarget));
    },
    [submit]
  );

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return {
    submit,
    onSubmit,
    isPending,
    error,
    success,
    clearMessages,
    setError,
  };
}
