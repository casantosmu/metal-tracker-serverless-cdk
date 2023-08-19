import { stripHtml } from "string-strip-html";

export const removeControlCharacters = (string: string) =>
  string
    .split("")
    .filter((character) => character.charCodeAt(0) > 31)
    .join("");

export const getAsciiCharacters = (string: string) =>
  string
    .split("")
    .filter((character) => character.charCodeAt(0) <= 255)
    .join("");

export const removeHtml = (string: string) => stripHtml(string).result;

export const truncateString = (string: string, maxLong: number, end = "...") =>
  string.length <= maxLong
    ? string
    : `${string.slice(0, maxLong - end.length)}${end}`;
