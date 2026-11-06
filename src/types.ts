// Types for the site's own settings in src/consts.ts.
// (Maps and stories are typed by @maplibre-yaml; see src/maps and src/stories.)

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
