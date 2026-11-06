import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { HOME } from "@consts";

export async function GET(context: APIContext) {
  return rss({
    title: HOME.TITLE,
    description: HOME.DESCRIPTION,
    site: context.site ?? "",
    items: [],
  });
}
