type UrlOptions = {
  path?: string;
  params?: Record<
    string,
    string | number | boolean | (string | number | boolean)[]
  >;
};

export const buildUrl = (url: string, options?: UrlOptions) => {
  const result = options?.path ? new URL(options.path, url) : new URL(url);

  if (options?.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      const values = Array.isArray(value) ? value : [value];

      values.forEach((val) => {
        result.searchParams.append(key, val.toString());
      });
    });
  }

  return result.toString();
};
