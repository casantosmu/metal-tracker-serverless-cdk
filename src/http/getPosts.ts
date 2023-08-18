import { z } from "zod";
import { getDateDaysAgo } from "../utils/date";
import { logger } from "../utils/logger";
import { buildUrl } from "../utils/http";
import { removeHtml } from "../utils/string";

const wordPressConstants = {
  maxPerPage: 100,
  jsonV2PostsPath: "/wp-json/wp/v2/posts",
};

const getPostsWordPressV2ResponseSchema = z.array(
  z.object({
    id: z.number(),
    date: z.string(),
    link: z.string(),
    title: z.object({ rendered: z.string() }),
    excerpt: z.object({ rendered: z.string() }),
  })
);

const angryMetalGuyConstants = {
  blogName: "AngryMetalGuy",
  baseUrl: "https://angrymetalguy.com",
  tags: {
    progressiveMetal: 8161,
  },
};

const getAngryMetalGuyPosts = async () => {
  const { maxPerPage, jsonV2PostsPath } = wordPressConstants;
  const { blogName, baseUrl, tags } = angryMetalGuyConstants;

  const params = {
    page: 1,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    per_page: maxPerPage,
    order: "desc",
    orderby: "date",
    after: getDateDaysAgo(1).toISOString(),
    tags: tags.progressiveMetal,
  };

  const endpoint = buildUrl(baseUrl, {
    path: jsonV2PostsPath,
    params,
  });

  logger.info(`Fetching data from: ${endpoint}`);

  const response = await fetch(endpoint);
  const data = (await response.json()) as unknown;

  if (!response.ok) {
    const stringify = JSON.stringify(data, null, 2);
    throw new Error(`Request failed '${response.statusText}': ${stringify}`);
  }

  const parsedData = getPostsWordPressV2ResponseSchema
    .parse(data)
    .map(
      ({
        id,
        date,
        link,
        title: { rendered: title },
        excerpt: { rendered: summary },
      }) => ({
        blogName,
        id,
        date,
        link,
        title: removeHtml(title),
        summary: removeHtml(summary),
      })
    );

  logger.info({ data: parsedData }, "Fetch data");

  return parsedData;
};

export const getPosts = async () => getAngryMetalGuyPosts();
