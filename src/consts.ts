import type { Site, Metadata, Socials } from "@types";

export const SITE: Site = {
  NAME: "James E. Churchill NOLA beyond the pale",
  EMAIL: "james.churchill@columbia.edu",
  DESCRIPTION: "",
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "<Portfolio for your work>",
};

export const BLOG: Metadata = {
  TITLE: "Blog",
  DESCRIPTION: "A collection of articles on topics I am passionate about.",
};

export const WORK: Metadata = {
  TITLE: "Work",
  DESCRIPTION: "Where I have worked and what I have done.",
};

export const PROJECTS: Metadata = {
  TITLE: "Projects",
  DESCRIPTION:
    "A collection of my projects, with links to repositories and demos.",
};

export const SOCIALS: Socials = [
  {
    NAME: "twitter-x",
    HREF: "<your twitter handle here>",
  },
  {
    NAME: "github",
    HREF: "<your github url here>",
  },
  {
    NAME: "linkedin",
    HREF: "<your linkedin url here>",
  },
];
