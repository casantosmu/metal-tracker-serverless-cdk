import { stripHtml } from "string-strip-html";

type BuildUrlOptions = {
  path: string;
  params: Record<string, string>;
};

export const buildUrl = (baseUrl: string, options: BuildUrlOptions) => {
  const url = new URL(options.path, baseUrl);
  url.search = new URLSearchParams(options.params).toString();
  return url;
};

export const getStringWithoutHtml = (html: string) => stripHtml(html).result;
