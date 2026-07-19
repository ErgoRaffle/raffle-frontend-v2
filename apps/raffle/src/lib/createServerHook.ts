'use client';

import { useEffect, useState, useTransition } from 'react';

type ServerHookResult<T> = {
  data: T | null;
  error: unknown;
  isLoading: boolean;
};

export const createServerHook =
  <T, A extends readonly unknown[]>(action: (...args: A) => Promise<T>) =>
  (...args: A): ServerHookResult<T> => {
    const [data, setData] = useState<T | null>(null);

    const [error, setError] = useState<unknown>(null);

    const [isLoading, startTransition] = useTransition();

    useEffect(() => {
      let mounted = true;

      startTransition(async () => {
        try {
          const result = await action(...args);
          if (mounted) setData(result);
        } catch (error) {
          if (mounted) setError(error);
        }
      });

      return () => {
        mounted = false;
      };
    }, [action, ...args]);

    return {
      data,
      error,
      isLoading
    };
  };
