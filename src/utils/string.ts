import { stripHtml } from "string-strip-html";

export const getQueryStringsFromObject = (
  queryStrings: Record<string, string | number>
) =>
  Object.entries(queryStrings)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

export const getStringWithoutHtml = (html: string) => stripHtml(html).result;
