export const NewsAndNtfnPriorityType = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  BREAKING: "breaking",
} as const;

export type NewsAndNtfnPriorityType = typeof NewsAndNtfnPriorityType[keyof typeof NewsAndNtfnPriorityType];