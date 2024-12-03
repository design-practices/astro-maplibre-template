import type {
  FillLayerSpecification,
  CircleLayerSpecification,
  LineLayerSpecification,
  SymbolLayerSpecification,
  RasterLayerSpecification,
} from "maplibre-gl";

export type Site = {
  NAME: string;
  EMAIL: string;
  DESCRIPTION: string;
};

export type Metadata = {
  TITLE: string;
  DESCRIPTION: string;
};

export type Socials = {
  NAME: string;
  HREF: string;
}[];

// add map interfaces here
export interface GeoJSONFeatureLayer {
  "data-type": "geojson";
  id: string;
  label?: string;
  url: string;
  toggle?: boolean;
  visible?: boolean;
  "layer-type":
    | "symbol"
    | "fill"
    | "custom"
    | "raster"
    | "line"
    | "circle"
    | "heatmap"
    | "fill-extrusion"
    | "hillshade"
    | "background";
  paint?:
    | FillLayerSpecification
    | LineLayerSpecification
    | CircleLayerSpecification
    | SymbolLayerSpecification;
  mouseEvent: MapEvent[];
  legend?: {
    title?: string;
    items: {
      color: string;
      label: string;
    }[];
  };
  before?: string;
}

/**
 * Raster Tile Layer
 * @see https://maplibre.org/maplibre-style-spec/sources/#raster
 **/
export interface RasterLayer {
  "data-type": "raster";
  id: string;
  label?: string;
  url?: string;
  tiles?: string[];
  bounds?: number[];
  minzoom?: number;
  maxzoom?: number;
  tileSize?: number;
  toggle?: boolean;
  visible?: boolean;
  paint?: RasterLayerSpecification;
  mouseEvent: MapEvent[];
  legend?: {
    title?: string;
    items: {
      color: string;
      label: string;
    }[];
  };
  before?: string;
}

/**
 * Image Layer
 * @see https://maplibre.org/maplibre-style-spec/sources/#image
 **/
export interface ImageLayer {
  "data-type": "image";
  id: string;
  label?: string;
  url: string;
  // make coordinates as an array of four coordinate pair arrays
  coordinates: [CoordinatePair, CoordinatePair, CoordinatePair, CoordinatePair];
  toggle?: boolean; // currently used in full page map map toggle
  visible?: boolean;
  mouseEvent: MapEvent[];
  legend?: {
    title?: string;
    items: {
      color: string;
      label: string;
    }[];
  };
  before?: string;
}

export interface VectorTileLayer {
  "data-type": "vector";
  id: string;
  label?: string;
  url?: string;
  "source-layer"?: string;
  tiles?: string[]; // array of tile urls; use in favor of url
  bounds?: number[];
  minzoom?: number;
  maxzoom?: number;
  toggle?: boolean;
  "layer-type":
    | "symbol"
    | "fill"
    | "custom"
    | "raster"
    | "line"
    | "circle"
    | "heatmap"
    | "fill-extrusion"
    | "hillshade"
    | "background";
  visible?: boolean;
  mouseEvent: MapEvent[];
  paint?:
    | FillLayerSpecification
    | LineLayerSpecification
    | CircleLayerSpecification
    | SymbolLayerSpecification;
  legend?: {
    title?: string;
    items: {
      color: string;
      label: string;
    }[];
  }[];
  before?: string;
}

type CoordinatePair = [number, number];

export interface MapEvent {
  type: "click" | "mousemove" | "mouseenter" | "mouseleave";
  content: Array<{
    [key: string]: string | ((e: maplibregl.MapLayerMouseEvent) => string);
  }>;
}

export interface LayerGroup {
  layers: (GeoJSONFeatureLayer | RasterLayer | ImageLayer | VectorTileLayer)[];
}

export interface MapBlock {
  type: "map";
  latitude: number;
  longitude: number;
  zoom: number;
  mapstyle: string;
  container: string;
  interactive?: boolean;
  containerstyle?: string;
  pitch?: number;
  bearing?: number;
  layers?: LayerGroup[];
}

export interface MixedBlock {
  type: "content";
  content: ContentTag[];
}

export interface ContentTag {
  [key: string]:
    | string
    | {
        property?: string; // Indicates a feature property to pull data from
        else?: string; // Fallback value if the property doesn't exist
        str?: string; // A raw string value to display
        href?: string; // Hyperlink for anchor tags
        text?: string; // Display text for anchor tags
        src?: string; // Image source URL for img tags
        alt?: string; // Alternate text for img tags
        class: string; // Class name for the tag
        id?: string; // ID for the tag
      };
}

export interface ContentBlock {
  type: "map" | "content" | "mixed";
  id?: string;
  classList?: string;
  content: MapBlock | MixedBlock | ContentBlock[]; // Mixed content allows nesting
}
