import { z } from "zod";
import { getDateDaysAgo } from "../utils/date";
import { fetcher } from "../utils/http";
import { removeHtml } from "../utils/string";

const fetchPostInTheLastDays = z.coerce
  .number()
  .parse(process.env.FETCH_POST_IN_THE_LAST_DAYS);

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
  }),
);

const angryMetalGuyConstants = {
  blogName: "AngryMetalGuy",
  baseUrl: "https://angrymetalguy.com",
  tags: {
    progressiveMetal: 8161,
  },
  categories: {
    review: 13,
  },
};

const getAngryMetalGuyPosts = async () => {
  const { maxPerPage, jsonV2PostsPath } = wordPressConstants;
  const { blogName, baseUrl, tags, categories } = angryMetalGuyConstants;

  const params = {
    page: 1,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    per_page: maxPerPage,
    order: "desc",
    orderby: "date",
    after: getDateDaysAgo(fetchPostInTheLastDays).toISOString(),
    tags: tags.progressiveMetal,
    categories: categories.review,
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
    }),
  );
};

export const getPosts = async () => getAngryMetalGuyPosts();
