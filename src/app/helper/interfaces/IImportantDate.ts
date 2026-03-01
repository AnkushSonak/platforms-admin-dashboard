export type ImportantDateType = "application" | "exam" | "result" | "other";

export interface IImportantDate {
  label: string;
  date: string;
  type: ImportantDateType;
  description?: string;
  tag?: string;
  isMilestone?: boolean;
  color?: string;
  icon?: string;
}