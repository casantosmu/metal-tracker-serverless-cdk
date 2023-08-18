import { z } from "zod";
import { getDateDaysAgo } from "../utils/date";
import { logger } from "../utils/logger";
import { fetcher } from "../utils/http";
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

  const posts = await fetcher.get(baseUrl, {
    path: jsonV2PostsPath,
    params,
    zodSchema: getPostsWordPressV2ResponseSchema,
  });

  return posts.map(
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
};

export const getPosts = async () => getAngryMetalGuyPosts();
