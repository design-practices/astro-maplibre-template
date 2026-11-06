# astro-maplibre-template

A starter website for telling stories with maps: maps placed between text and
images, a full-page map, and a scrollytelling story map. Fork it, change the
words and the maps, push, and GitHub publishes it for you.

This is **version 2**. It is built with [Astro](https://astro.build/),
[Tailwind CSS](https://tailwindcss.com/) and
[maplibre-yaml](https://docs.maplibre-yaml.org/), which turns a YAML file into
a [MapLibre](https://maplibre.org/) map. Every map on the site is a YAML file
you edit; you don't need to write JavaScript.

> **Using the old version?** Version 1 (custom map components, `_*.yaml` files
> in `src/pages/`) is kept at the [`v1` tag](../../tree/v1). Version 2 is not a
> drop-in upgrade: the YAML format is different (see
> [How v1 maps to v2](#coming-from-version-1)).

## Quick start

You need [Node.js](https://nodejs.org/) 22.23.4 or later (`node --version`
tells you which you have) and [Git](https://git-scm.com/).

1. On GitHub, click **Use this template → Create a new repository**. The
   repository name becomes part of your site's address.
2. Clone your new repository and open the folder in a terminal:

   ```bash
   git clone https://github.com/<your-user>/<your-repo>.git
   cd <your-repo>
   ```

3. Install and start the development server:

   ```bash
   npm install
   npm run dev
   ```

4. Open the address it prints (`http://localhost:4321/astro-maplibre-template/`
   until you change the base, below). Edit a file, save, and the page reloads.

## Commands

Run these from the project folder.

| Command | What it does |
| :--- | :--- |
| `npm install` | Installs everything the site needs (once, and after pulling changes to `package.json`) |
| `npm run dev` | Starts the site at `localhost:4321`; the page reloads as you save |
| `npm run dev:network` | Same, reachable from your phone on the same Wi-Fi |
| `npm run build` | Checks the code and every map, then builds the finished site into `dist/` |
| `npm run preview` | Serves the built `dist/` so you can check it before you push |
| `npm run validate` | Checks only the map and story YAML files (fast) |
| `npm run validate:watch` | Keeps checking them each time you save |
| `npm run lint` | Checks the code for common mistakes (`npm run lint:fix` fixes what it can) |

## Make it yours

### 1. Name and address

GitHub Pages publishes your site at `https://<your-user>.github.io/<your-repo>/`.
Tell the site that address in **`astro.config.mjs`**:

```js
site: "https://<your-user>.github.io",
base: "/<your-repo>",
```

`base` must match your repository name exactly. It is the only place the name
is written: links, maps, data files and images all pick it up. (If you rename
the repository on GitHub later, change `base` too.)

Then set the site's name, description and contact details in
**`src/consts.ts`**. `SITE.NAME` is shown in the header and footer.

### 2. Where things live

```text
src/
  pages/            one file per page: the file name is the address
    index.astro       the home page
    inline_maps.mdx   maps between text, images and embeds
    full_page_map.mdx one map that fills the window
    scrollytelling.mdx a story map
  maps/             one YAML file per map (used by the pages above)
  stories/          one YAML file per story map
  assets/img/       images for your pages (resized for you when the site builds)
  components/       the header, footer and other site parts
  layouts/          the page shell (PageLayout.astro)
  styles/global.css colours, fonts and text styles (Tailwind)
  consts.ts         site name and description
public/
  data/             data files for your maps (GeoJSON, …)
  img/              images for story chapters
```

To add a page, copy one of the `.mdx` files in `src/pages/`; `about.mdx`
becomes `/<your-repo>/about`. Link to it with the `url()` helper so the base
is added for you: `<a href={url("about")}>About</a>` (see `src/pages/index.astro`).

## Maps

Each map is a YAML file in `src/maps/`. A page loads it and shows it with a
component from `@maplibre-yaml/astro`:

```mdx
import { Map, loadMapConfig } from "@maplibre-yaml/astro";
export const squirrels = await loadMapConfig("./src/maps/squirrels.yaml");

<Map config={squirrels} height="60vh" class="map-frame not-prose" />
```

`loadMapConfig` checks the file while the site builds, so a mistake stops the
build with the file, line and column instead of reaching your site. (`class`
gives the map a border; `not-prose` keeps the page's text styles out of the
map's popups and legend.)

A map file has the map's starting view (`config:`) and its `layers:`:

```yaml
# yaml-language-server: $schema=https://docs.maplibre-yaml.org/schema/latest/map.schema.json
type: map
id: squirrels
config:
  mapStyle: "https://tiles.openfreemap.org/styles/positron" # the basemap
  center: [-73.9654, 40.7829] # [longitude, latitude]
  zoom: 13.5
layers:
  - id: squirrels
    type: circle # circle, line, fill, symbol, raster, …
    source:
      type: geojson
      url: "/data/squirrel20241021.geojson" # public/data/squirrel20241021.geojson
    paint:
      circle-radius: 4
      circle-color: "#c0642f"
```

The first line is a comment that gives editors autocomplete and error
underlines (in VS Code, install the recommended **YAML** extension). To find
`center` and `zoom` for a place, move around
[this location helper](https://labs.mapbox.com/location-helper/) and copy the
numbers. Note the order: **longitude first**, then latitude.

The basemaps are from [OpenFreeMap](https://openfreemap.org/) and need no API
key: `positron`, `liberty`, `bright`, `dark` and `fiord` all work in the URL
above. Any other MapLibre style URL works too.

### What the example maps show

| You want | Look at | Key parts |
| :--- | :--- | :--- |
| A popup when a point is clicked | `src/maps/squirrels.yaml` | `interactive: { click: { popup: … } }` |
| Colours by category, with a legend | `src/maps/squirrels.yaml`, `bike-lanes.yaml` | `classify: { field, categories }` |
| Data from a web address | `src/maps/bike-lanes.yaml` | `source: { type: geojson, url: "https://…" }` |
| Data written in the YAML | `src/maps/layers.yaml` (the park outline) | `source: { type: geojson, data: … }` |
| Checkboxes to turn layers on and off | `src/maps/layers.yaml`, `full-page.yaml` | `label:` on a layer; `visible: false` to start it off |
| A legend entry for a plain layer | `src/maps/layers.yaml` | `legend: { label, color, shape }` |
| A map that doesn't move | `src/maps/static.yaml` | `config: { interactive: false }` |
| Raster tiles | `src/maps/full-page.yaml` | `type: raster`, `source: { type: raster, tiles: […] }` |

A popup is a list of HTML elements; `str:` is fixed text and `property:` is a
value from the clicked feature:

```yaml
interactive:
  hover:
    cursor: pointer
  click:
    popup:
      - h3:
          - property: name
      - p:
          - str: "Fur: "
          - property: primary_fur_color
            else: "not recorded"
```

### Full-page map

`src/pages/full_page_map.mdx` shows `src/maps/full-page.yaml` with
`<FullPageMap>`, which fills the window under the header and adds zoom and
reset buttons. Any map file works there.

### Scrollytelling

`src/pages/scrollytelling.mdx` shows `src/stories/nyc.yaml` with
`<Scrollytelling>`. A story file is a map (`config:`, `layers:`) plus
`chapters:`. Each chapter moves the camera and can show and hide layers:

```yaml
chapters:
  - id: squirrels
    title: Squirrels in Central Park
    description: "<p>Chapter text is <strong>HTML</strong>, not Markdown.</p>"
    image: "/img/fisk02.jpg"   # optional: public/img/fisk02.jpg
    center: [-73.96778, 40.78376]
    zoom: 14
    pitch: 0                  # tilt, 0–85
    bearing: 20               # rotation
    animation: flyTo          # flyTo (default), easeTo or jumpTo
    alignment: left           # left, right, center or full
    layers:
      show: [squirrels]       # layer ids; hide: [ … ] turns them off
```

A layer that a chapter turns on later starts hidden with
`layout: { visibility: none }`. A chapter's changes last until another chapter
undoes them.

## Adding your own data

Put the file in `public/data/` and point a layer at it with `/data/<file name>`
(no `public/`, and the base is added for you). GeoJSON is simplest; export it
from QGIS, [geojson.io](https://geojson.io/) or most data portals. Keep files
small (a few MB at most); for bigger data see
[Large data](https://docs.maplibre-yaml.org/guides/cloud-native-data/).

A `url:` can also be a web address, such as an open-data API
(`src/maps/bike-lanes.yaml`). That data is fetched each time someone opens the
page, so the site breaks if that service goes down or changes.

## Text, images and maps together (MDX)

Pages are [MDX](https://mdxjs.com/): Markdown for the text, plus components and
HTML wherever you need them. `src/pages/inline_maps.mdx` shows each of these:

- **Text**: Markdown headings, paragraphs, lists, `**bold**`, `[links](https://…)`.
- **Maps**: `<Map config={…} />`, as above.
- **Images**: put the file in `src/assets/img/`, import it, and show it with
  Astro's `<Image>`, which resizes it for the web:

  ```mdx
  import { Image } from "astro:assets";
  import fiskMap from "../assets/img/fisk02.jpg";

  <Image src={fiskMap} width={600} alt="Describe the image" />
  ```

- **Embeds**: any HTML, such as an `<iframe>` with a video.
- **Two columns**: a `<div>` with Tailwind's grid classes, holding a map and
  text side by side (stacked on phones):

  ```mdx
  <div class="not-prose grid gap-6 md:grid-cols-2 items-center my-8">
    <Map config={locator} height="320px" class="map-frame my-0" />
    <div class="prose">
      <h3>Central Park</h3>
      <p>Text next to the map.</p>
    </div>
  </div>
  ```

Wrap a page's text in `<article>` to get the site's text styles.

## Checking your work

`npm run build` checks everything before it builds: the code (`astro check`),
then every map and story file (`mlym validate src/maps src/stories`). A mistake
in a YAML file stops the build with its file, line and column, and often a
suggestion:

```text
✗ src/stories/nyc.yaml
  error Chapter 2 ("squirrels"): Unknown key "centre" — did you mean "center"? ("center" is required here.)
    at line 72, column 5
```

Run `npm run validate` (or `npx mlym validate src/maps`) to check just the
YAML, or `npm run validate:watch` to check it every time you save. In
`npm run dev`, a broken file shows the same message in the browser.

## Publishing on GitHub Pages

1. Set `site` and `base` in `astro.config.mjs` ([above](#1-name-and-address)).
2. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to `main`. The workflow in `.github/workflows/deploy.yml` builds the
   site and publishes it; follow it in the **Actions** tab. Your site is at
   `https://<your-user>.github.io/<your-repo>/` a minute or two later.

If the build fails, open the failed run in the Actions tab: the log names the
file and line, as it does locally. The published site stays as it was until a
build succeeds.

To check the finished site before you push, run `npm run build` and then
`npm run preview`, and open `http://localhost:4321/<your-repo>/`.

## Learn more

- [maplibre-yaml documentation](https://docs.maplibre-yaml.org/)
  - [Astro components](https://docs.maplibre-yaml.org/integrations/astro/) (`Map`, `FullPageMap`, loading YAML)
  - [Story maps in Astro](https://docs.maplibre-yaml.org/integrations/astro-stories/) and [writing a story file](https://docs.maplibre-yaml.org/schema/scrollytelling/)
  - [Layers and styling](https://docs.maplibre-yaml.org/guides/layers/), [popups](https://docs.maplibre-yaml.org/guides/popups/), [legends and thematic maps](https://docs.maplibre-yaml.org/guides/thematic-maps/), [data sources](https://docs.maplibre-yaml.org/guides/data-sources/)
  - [Every layer key](https://docs.maplibre-yaml.org/reference/yaml/layers/), [the validate command](https://docs.maplibre-yaml.org/cli/reference/#validate)
  - [Publishing and subpaths](https://docs.maplibre-yaml.org/guides/publishing/), [Troubleshooting](https://docs.maplibre-yaml.org/troubleshooting/)
  - [Example gallery](https://docs.maplibre-yaml.org/examples/gallery/): dozens of maps to copy from
- [MapLibre style properties](https://maplibre.org/maplibre-style-spec/layers/): every `paint` and `layout` key
- [Astro docs](https://docs.astro.build/) and [Tailwind CSS docs](https://tailwindcss.com/docs)

## Coming from version 1

| Version 1 | Version 2 |
| :--- | :--- |
| `<MapLibre>` / `<Map>` with props in the page | `<Map config={…}>` with the map in `src/maps/*.yaml` |
| `_inline_map_components.yaml` with `content` / `mixed` blocks | MDX: write text, images and maps directly in `src/pages/*.mdx` |
| `_full_page_map_components.yaml` | `src/maps/full-page.yaml` + `<FullPageMap>` |
| `_scrollytelling_steps.yaml` | `src/stories/nyc.yaml` + `<Scrollytelling>` |
| `data-type` / `layer-type` / `url` on a layer | `type:` on the layer, `source: { type, url }` |
| `mouseEvent: [{ type: click, content: … }]` | `interactive: { click: { popup: … } }` (same `str` / `property` / `else` items) |
| `toggle: true` | `label:` on the layer |
| `visible: false` | `visible: false` (map) or `layout: { visibility: none }` (story) |
| `persist: false` on a step's layer | `layers: { show: […], hide: […] }` on chapters |
| `media:` / `position:` on a step | `image:` / `alignment:` on a chapter |
| Links written with `/astro-maplibre-template/…` and `update-paths.js` | `base` in `astro.config.mjs`, `url()` for links |
| MapTiler / Mapillary / Protomaps API keys | Keyless OpenFreeMap basemaps |
