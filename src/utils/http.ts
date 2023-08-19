import { ZodSchema } from "zod";
import { logger } from "./logger";

type UrlOptions = {
  path?: string;
  params?: Record<string, string | number>;
};

const buildUrl = (url: string, options?: UrlOptions) => {
  const result = options?.path ? new URL(options.path, url) : new URL(url);

  if (options?.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      result.searchParams.append(key, value.toString());
    });
  }

  return result.toString();
};

type FetcherOptions<T> = UrlOptions & {
  zodSchema?: ZodSchema<T>;
};

export const fetcher = {
  get: async <T = unknown>(url: string, options?: FetcherOptions<T>) => {
    const endpoint = buildUrl(url, options);

    logger.info(`Request to: '${endpoint}'`);

    const response = await fetch(endpoint);
    const data = await response.json();

    if (!response.ok) {
      const stringify = JSON.stringify(data, null, 2);
      throw new Error(`'${response.statusText}': ${stringify}`);
    }

    logger.info({ data }, "Request succeeded");

    if (options?.zodSchema) {
      return options.zodSchema.parse(data);
    }

    return data as T;
  },
};
