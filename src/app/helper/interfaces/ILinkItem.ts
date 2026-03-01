export type LinkType = "website" | "pdf" | "video" | "other";

export type LinkItem = {
  title: string;
  url: string;
  type: LinkType;
  description?: string;
};
