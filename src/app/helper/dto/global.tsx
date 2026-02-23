export const REVIEW_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
} as const;

export type ReviewStatus =
  typeof REVIEW_STATUS[keyof typeof REVIEW_STATUS];
