import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type {
  GeoJSONFeatureLayer,
  RasterLayer,
  ImageLayer,
  VectorTileLayer,
  LayerGroup,
  ContentTag,
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
    Object.values(layers).forEach(
      (
        layer: GeoJSONFeatureLayer | RasterLayer | ImageLayer | VectorTileLayer
      ) => {
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
      }
    );

    Object.values(layers).forEach(
      (
        layer: GeoJSONFeatureLayer | RasterLayer | ImageLayer | VectorTileLayer
      ) => {
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
                map.addLayer(
                  {
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
                  },
                  layer?.before ?? undefined
                );
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
            map.addLayer(
              {
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
              },
              layer?.before ?? undefined
            );
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
            map.addLayer(
              {
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
              },
              layer?.before ?? undefined
            );
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
            map.addLayer(
              {
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
              },
              layer?.before ?? undefined
            );
          }
        }
        // Handle mouse events if defined
        if (layer.mouseEvent) {
          const popup = new maplibregl.Popup({ offset: 15 });

          layer.mouseEvent.forEach((event) => {
            map.on(event.type, layer.id, (e) => {
              const popupContent = event.content
                .map((tag: { [key: string]: unknown }) => {
                  const tagName = Object.keys(tag)[0];

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
                                };
                          }) => {
                            if ("property" in item) {
                              return e.features && e.features[0]
                                ? e.features[0].properties[
                                    item.property as string
                                  ] || item.else
                                : item.else;
                            } else if ("str" in item) {
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

                  return `<${tagName}>${value}</${tagName}>`;
                })
                .join(" "); // Join all tags to form the full popup content

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
      }
    );
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
