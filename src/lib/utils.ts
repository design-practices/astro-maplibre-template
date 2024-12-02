import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type {
  LayerGroup,
  ContentTag,
  MapLayer,
  MixedBlock,
  HTMLObject,
  Legend,
} from "../types";
import maplibregl from "maplibre-gl";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date) {
  return Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

export function readingTime(html: string) {
  const textOnly = html.replace(/<[^>]+>/g, "");
  const wordCount = textOnly.split(/\s+/).length;
  const readingTimeMinutes = (wordCount / 200 + 1).toFixed();
  return `${readingTimeMinutes} min read`;
}

export function dateRange(startDate: Date, endDate?: Date | string): string {
  const startMonth = startDate.toLocaleString("default", { month: "short" });
  const startYear = startDate.getFullYear().toString();
  let endMonth;
  let endYear;

  if (endDate) {
    if (typeof endDate === "string") {
      endMonth = "";
      endYear = endDate;
    } else {
      endMonth = endDate.toLocaleString("default", { month: "short" });
      endYear = endDate.getFullYear().toString();
    }
  }

  return `${startMonth}${startYear} - ${endMonth}${endYear}`;
}

export function loadMapLayers(
  map: maplibregl.Map,
  layers: LayerGroup,
  visibility: boolean = false
) {
  if (layers) {
    // Add toggle buttons if set to be so
    Object.values(layers).forEach((layer: MapLayer) => {
      if (layer.toggle) {
        const toggleButton = document.createElement("a");
        const menu = document.getElementById(`${map._container.id}-menu`);
        toggleButton.textContent = layer.label ?? layer.id;
        if (layer.visible === true) {
          toggleButton.className = "active";
        }
        toggleButton.onclick = () => {
          if (map.getLayoutProperty(layer.id, "visibility") === "visible") {
            map.setLayoutProperty(layer.id, "visibility", "none");
            toggleButton.className = "";
          } else {
            map.setLayoutProperty(layer.id, "visibility", "visible");
            toggleButton.className = "active";
          }
        };
        if (menu) {
          menu.appendChild(toggleButton);
        }
      }
    });

    Object.values(layers).forEach((layer: MapLayer) => {
      if (layer["data-type"] === "geojson") {
        fetch(layer.url)
          .then((response) => response.json())
          .then((data) => {
            data.features.forEach(
              (feature: {
                geometry: {
                  type: string;
                  coordinates: number[];
                };
                properties: {
                  longitude: number;
                  latitude: number;
                };
              }) => {
                // Check if there's already a valid geometry, otherwise reconstruct it
                if (!feature.geometry) {
                  feature.geometry = {
                    type: "Point",
                    coordinates: [
                      Number(feature.properties.longitude),
                      Number(feature.properties.latitude),
                    ],
                  };
                }
              }
            );

            // Add source if it doesn't exist
            if (!map.getSource(layer.id)) {
              map.addSource(layer.id, {
                type: "geojson",
                data: data,
              });
            }

            // Add layer if it doesn't already exist
            if (!map.getLayer(layer.id)) {
              map.addLayer({
                id: layer.id,
                type: layer["layer-type"],
                // @ts-expect-error expect source to be string via source above
                source: layer.id,
                // @ts-expect-error expect partial paint defs
                paint: layer.paint || {}, // Include paint if it exists
                layout: {
                  visibility: visibility
                    ? "visible"
                    : layer.visible
                      ? "visible"
                      : "none",
                },
              });
            }
          });
      } else if (layer["data-type"] === "raster") {
        // Add source if it doesn't exist
        if (!map.getSource(layer.id)) {
          map.addSource(layer.id, {
            type: "raster",
            tiles: [layer.url || ""],
            tileSize: layer.tileSize || 256,
          });
        }

        // Add layer if it doesn't already exist
        if (!map.getLayer(layer.id)) {
          map.addLayer({
            id: layer.id,
            type: "raster",
            source: layer.id,
            // @ts-expect-error expect partial paint defs
            paint: layer.paint || {}, // Include paint if it exists
            layout: {
              visibility: visibility
                ? "visible"
                : layer.visible
                  ? "visible"
                  : "none",
            },
          });
        }
      } else if (layer["data-type"] === "image") {
        // Add source if it doesn't exist
        if (!map.getSource(layer.id)) {
          map.addSource(layer.id, {
            type: "image",
            url: layer.url || "",
            coordinates: layer.coordinates || [],
          });
        }

        // Add layer if it doesn't already exist
        if (!map.getLayer(layer.id)) {
          map.addLayer({
            id: layer.id,
            type: "raster",
            source: layer.id,
            // @ts-expect-error expect partial paint defs
            paint: layer.paint || {}, // Include paint if it exists
            layout: {
              visibility: visibility
                ? "visible"
                : layer.visible
                  ? "visible"
                  : "none",
            },
          });
        }
      } else if (layer["data-type"] === "vector") {
        // Add source if it doesn't exist
        if (!map.getSource(layer.id)) {
          map.addSource(layer.id, {
            type: "vector",
            tiles: [layer.url || ""],
            minzoom: layer.minzoom || 0,
            maxzoom: layer.maxzoom || 22,
          });
        }

        // Add layer if it doesn't already exist
        if (!map.getLayer(layer.id)) {
          map.addLayer({
            id: layer.id,
            type: layer["layer-type"],
            source: layer.id,
            "source-layer": layer["source-layer"] ?? layer.id,
            // @ts-expect-error expect partial paint defs
            paint: layer.paint || {}, // Include paint if it exists
            layout: {
              visibility: visibility
                ? "visible"
                : layer.visible
                  ? "visible"
                  : "none",
            },
          });
        }
      }
      // Handle mouse events if defined
      if (layer.mouseEvent) {
        const popup = new maplibregl.Popup({ offset: 15 });

        layer.mouseEvent.forEach((event) => {
          map.on(event.type, layer.id, (e) => {
            const popupContent = event.content
              .map((tag) => {
                if (isContentTag(tag)) {
                  return renderHTMLObject(
                    transformMixedTagToHTMLObject(tag, e)
                  );
                }
                return "";
              })
              .join("");

            popup.setLngLat(e.lngLat).setHTML(popupContent).addTo(map);

            // If event is mouseover, add a mouseout event to remove the popup
            if (event.type === "mousemove") {
              map.on("mouseleave", layer.id, () => {
                popup.remove();
              });
            }
          });
        });
      }
    });
  }
}

export function parseMixedContent(block: ContentTag[]) {
  return block
    ? block
        .map((tag) => {
          const tagName = Object.keys(tag)[0];
          const classList =
            Array.isArray(tag[tagName]) &&
            typeof tag[tagName][0] === "object" &&
            "classList" in tag[tagName][0]
              ? `class="${tag[tagName][0].classList}"`
              : "";
          const id =
            Array.isArray(tag[tagName]) &&
            typeof tag[tagName][0] === "object" &&
            "id" in tag[tagName][0]
              ? `id="${tag[tagName][0].id}"`
              : "";
          if (tagName === "iframe") {
            if (
              Array.isArray(tag[tagName]) &&
              typeof tag[tagName][0] === "object" &&
              "src" in tag[tagName][0]
            ) {
              return tag[tagName][0]["src"];
            }
            return "";
          } else {
            const value = Array.isArray(tag[tagName])
              ? tag[tagName]
                  .map(
                    (item: {
                      [key: string]:
                        | string
                        | {
                            property?: string;
                            else?: string;
                            str?: string;
                            href?: string;
                            text?: string;
                            src?: string;
                            alt?: string;
                            class?: string;
                            id?: string;
                          };
                    }) => {
                      if ("str" in item) {
                        return item.str;
                      } else if (
                        tagName === "a" &&
                        "href" in item &&
                        "text" in item
                      ) {
                        // Handle link tag with href and text
                        return `<a href="${item.href}" target="_blank">${item.text}</a>`;
                      } else if (tagName === "img" && "src" in item) {
                        // Handle image tag with src and optional alt
                        const altText = item.alt || "";
                        return `<img src="${item.src}" alt="${altText}" />`;
                      } else {
                        return ""; // Fallback for any unexpected structure
                      }
                    }
                  )
                  .join(" ") // Join all parts together to form the full tag content
              : tag[tagName];

            return `<${tagName} ${classList} ${id}>${value}</${tagName}>`;
          }
        })
        .join(" ")
    : "not yet";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isMixedBlock(data: any): data is MixedBlock {
  return (
    typeof data === "object" &&
    data.type === "content" &&
    Array.isArray(data.content)
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isHTMLObjectBlock(data: any): data is HTMLObject {
  return typeof data === "object" && "tag" in data;
}

export function isContentTag(data: unknown): data is ContentTag {
  return typeof data === "object" && !Array.isArray(data);
}

export function isContentTagCollection(data: unknown): data is ContentTag[] {
  return Array.isArray(data) && data.every(isContentTag);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseYAMLBlock(data: any): HTMLObject[] {
  if (isHTMLObjectBlock(data)) {
    // Already in HTMLObject format
    return Array.isArray(data) ? data : [data as HTMLObject];
  } else if (isMixedBlock(data)) {
    // Transform MixedBlock into HTMLObjectBlock format
    return data.content.map((tag) => transformMixedTagToHTMLObject(tag));
  } else {
    throw new Error(
      "Invalid YAML structure: must match HTMLObject or MixedBlock schema"
    );
  }
}

// Transformer function: MixedBlock -> HTMLObjectBlock
export function transformMixedTagToHTMLObject(
  tag: ContentTag,
  e?: maplibregl.MapLayerMouseEvent
): HTMLObject {
  const tagName = Object.keys(tag)[0];
  const tagContent = tag[tagName];

  if (!Array.isArray(tagContent)) {
    return {
      tag: tagName,
      content: "",
      class: [],
      children: [],
      props: [],
    };
  }

  // Helper to resolve string or property values
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolveContent = (contentBlock: any): string => {
    if (contentBlock.str) {
      return contentBlock.str;
    }
    if (contentBlock.property && e?.features?.[0]?.properties) {
      return (
        e.features[0].properties[contentBlock.property] ||
        contentBlock.else ||
        ""
      );
    }
    return contentBlock.else || "";
  };

  // Handle elements with children (e.g., `p`, `div`, `a`)
  if (
    tagContent.length > 1
    // || tagContent.some((item) => typeof item === "object")
  ) {
    return {
      tag: tagName,
      class: tagContent[0]?.class || [],
      props: tagContent[0]?.href ? [{ href: tagContent[0].href }] : [],
      children: tagContent.map((child) => {
        if (typeof child === "object") {
          return transformMixedTagToHTMLObject(
            { [tagName]: [child] } as unknown as ContentTag,
            e
          );
        }
        return { tag: "span", content: resolveContent(child) };
      }),
    };
  }

  // Handle standalone tags (e.g., `img`, `iframe`)
  if (tagName === "img" || tagName === "iframe") {
    return {
      tag: tagName,
      class: tagContent[0]?.class || [],
      props: [
        {
          src: (Array.isArray(tagContent) && tagContent[0].src) || "",
        },
        {
          alt: (Array.isArray(tagContent) && tagContent[0].alt) || "",
        },
      ],
      content: "",
    };
  }

  // Default case for simple content
  return {
    tag: tagName,
    class: tagContent[0]?.class || [],
    content: resolveContent(tagContent[0]),
    children: [],
  };
}

export function transformMixedBlockToHTMLObject(
  block: MixedBlock,
  e?: maplibregl.MapLayerMouseEvent
): HTMLObject[] {
  return block.content.map((tag) => transformMixedTagToHTMLObject(tag, e));
}

export function parseLegend(legend: Legend): HTMLObject {
  if (!legend || !legend.items || !Array.isArray(legend.items)) {
    throw new Error("Invalid legend format: must include 'items'.");
  }
  console.log(legend);
  return {
    tag: "div",
    class: ["menu-item"],
    children: [
      ...(legend.title
        ? [
            {
              tag: "h3",
              content: legend.title,
            },
          ]
        : []),
      {
        tag: "ul",
        children: legend.items.map((item) => ({
          tag: "li",
          children: [
            {
              tag: "span",
              class: ["legend-color"],
              style: { "background-color": item.color },
            },
            {
              tag: "span",
              class: ["legend-label"],
              content: item.label,
            },
          ],
        })),
      },
    ].filter(Boolean), // Remove null elements
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseShorthand(data: any): HTMLObject[] {
  if (data.legend) {
    return [parseLegend(data.legend)];
  }

  throw new Error("Unsupported shorthand format");
}

export function renderHTMLObject(data: HTMLObject): string {
  console.log("its fugly");
  if (!data || !data.tag) return "";
  const children = (data.children || [])
    .map((child) => renderHTMLObject(child))
    .join("");
  const props = Object.entries(data.props || {})
    .map(([, value]) => `${Object.keys(value)}=${Object.values(value)}`)
    .join(" ");
  const classes = clsx(data.class || []);

  const id = data.id ? `id="${data.id}"` : "";
  const key = data.key ? `key="${data.key}"` : "";
  const classList = classes ? `class="${classes}"` : "";
  const styleList = data.style
    ? `style="${Object.entries(data.style)
        .map(([key, value]) => `${key}: ${value}`)
        .join(";")}"`
    : "";
  return `<${data.tag} ${classList} ${styleList} ${id} ${key} ${props}>${
    data.content || ""
  }${children}</${data.tag}>`;
}

export function renderHTMLObjects(data: HTMLObject[]): string {
  return data.map((item) => renderHTMLObject(item)).join("");
}

export function parseMixedContent2(block: MixedBlock | ContentTag[]): string {
  // Add a function to handle MixedBlock specifically
  // old code for just MixedBlock types; should not need if all objects are converted to HTMLObject first
  if (isContentTagCollection(block)) {
    return block
      .map((tag: ContentTag) => {
        const attributes =
          typeof tag === "object" ? Object.values(tag)[0] : null;
        return `
        <${tag.tag} ${tag.class ? `class="${tag.class}"` : ""}
          ${attributes && typeof attributes === "object" && attributes.src ? `src="${attributes.src}"` : ""}
          ${attributes && typeof attributes === "object" && attributes.alt ? `alt="${attributes.alt}"` : ""} >
          ${attributes && typeof attributes === "object" && (attributes.property || attributes.str || "")}
        </${tag.tag}>
        `;
      })
      .join("");
  } else if (isHTMLObjectBlock(block)) {
    // Otherwise handle as HTMLObject - need to test
    return renderHTMLObject(block);
  }
  return "";
}
