export const NewsAndNntfnStatusType = {
  PENDING: "pending",
  PUBLISHED: "published",
  UPDATED: "updated",
  RETRACTED: "retracted",
  EXPIRED: "expired",
} as const;

export type NewsAndNntfnStatusType = typeof NewsAndNntfnStatusType[keyof typeof NewsAndNntfnStatusType];