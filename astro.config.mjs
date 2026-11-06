// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import maplibreYaml from "@maplibre-yaml/astro/integration";

export default defineConfig({
  // GitHub Pages serves this site at https://<your-user>.github.io/<your-repo>/.
  // Put your user name in `site` and your repository name in `base`. Every
  // link, map, data file and image on the site picks up `base` from here, so
  // this is the only place the repository name is written.
  site: "https://design-practices.github.io",
  base: "/astro-maplibre-template",

  // mdx: pages written in MDX. sitemap: sitemap-index.xml for search engines.
  // maplibreYaml: `npm run dev` reloads the page when you save a map's YAML.
  integrations: [mdx(), sitemap(), maplibreYaml()],

  vite: {
    plugins: [tailwindcss()],
    // The map engine is one large file (~1.5 MB). It is loaded only by pages
    // with a map; this just quiets the "chunks are larger than 500 kB" notice.
    build: { chunkSizeWarningLimit: 2000 },
  },
});
