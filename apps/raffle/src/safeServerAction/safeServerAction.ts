import { addKnownErrorConstructor, deserializeError, serializeError } from 'serialize-error';

// biome-ignore lint/suspicious/noExplicitAny: make it better
type AsyncFunction = (...args: any[]) => Promise<any>;

type CreateSafeActionConfig = {
  // biome-ignore lint/suspicious/noExplicitAny: make it better
  errors: Record<string, new (...args: any[]) => Error>;
  // biome-ignore lint/suspicious/noExplicitAny: make it better
  onError: (error: unknown, traceKey?: string, args?: any[]) => Promise<void>;
};

type WrapOptions = {
  cache?: number;
};

type Wrap = <Action extends AsyncFunction>(
  action: Action,
  traceKey: string,
  options?: WrapOptions
) => (...args: Parameters<Action>) => WrapResult<Action>;

type WrapResult<Action extends AsyncFunction> = Promise<{
  cache?: number;
  result?: Awaited<ReturnType<Action>>;
  // biome-ignore lint/suspicious/noExplicitAny: make it better
  serializedError?: any;
  traceKey: string;
}>;

type Unwrap = <Action extends ReturnType<Wrap>>(
  action: Action
) => (...args: Parameters<Action>) => UnwrapResult<Action>;

type UnwrapResult<Action extends ReturnType<Wrap>> = Promise<
  NonNullable<Awaited<ReturnType<Action>>['result']>
>;

export const createSafeAction = (config: CreateSafeActionConfig) => {
  // biome-ignore lint/complexity/noBannedTypes: change it
  const actions = new Map<Function, number>();

  const caches: Record<
    string,
    {
      cache?: number;
      initiated?: boolean;
      promise: Promise<Awaited<ReturnType<AsyncFunction>>>;
      timestamp?: number;
    }
  > = {};

  Object.keys(config.errors).forEach((key) => {
    addKnownErrorConstructor(config.errors[key]);
  });

  const wrap: Wrap =
    (action, traceKey, options) =>
    async (...args) => {
      try {
        return {
          cache: options?.cache,
          result: await action(...args),
          traceKey
        };
      } catch (error: unknown) {
        await config.onError(error, traceKey, args);
        return {
          serializedError: serializeError(error),
          traceKey
        };
      }
    };

  const unwrap: Unwrap = (action) => {
    if (!actions.has(action)) {
      actions.set(action, Math.random());
    }

    return async (...args) => {
      const key = [
        actions.get(action),
        ...args.map((arg) => {
          try {
            return JSON.stringify(arg);
          } catch {
            return arg.toString();
          }
        })
      ].join('_');

      const handler = action;

      const isInCache = key in caches;

      const isInitiated = caches[key]?.initiated;

      const isExpired = Date.now() >= (caches[key]?.timestamp || 0) + (caches[key]?.cache || 0);

      if (!isInCache || (isInitiated && isExpired)) {
        caches[key] = Object.assign({}, caches[key], {
          timestamp: Date.now(),
          promise: handler(...args)
        });
      }

      const unwrapResult = await caches[key].promise;

      if (unwrapResult.serializedError) {
        delete caches[key];

        const error = deserializeError(unwrapResult.serializedError);

        await config.onError(error, unwrapResult.traceKey, args);

        throw error;
      }

      caches[key].cache = unwrapResult.cache;

      caches[key].initiated = true;

      return unwrapResult.result;
    };
  };

  return { wrap, unwrap };
};
