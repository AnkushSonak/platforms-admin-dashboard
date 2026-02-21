import { AdmitCard } from "./AdmitCard";
import { AnswerKey } from "./AnswerKey";
import { INewsAndNtfn } from "./INewsAndNtfn";
import { Job } from "./Job";
import { Result } from "./Result";

// Optional: Extract enum as a proper TypeScript union type
export type TagGroup =
  | "sector"
  | "qualification"
  | "urgency"
  | "type"
  | "benefit"
  | "location_highlight"
  | "other";

export interface SeoSettings {
  metaTitle?: string;
  metaDescription?: string;
  isNoIndex?: boolean;
}

export interface Tag {
  id: string;

  name: string;
  slug: string;

  group: TagGroup;

  description?: string | null;

  // UI & Branding
  icon?: string | null;
  color?: string | null;

  // Hierarchy (Self Reference)
  parent?: Tag | null;
  children?: Tag[];

  // SEO
  seoSettings?: SeoSettings | null;

  // Relations
  jobs?: Job[];
  admitCards?: AdmitCard[];
  results?: Result[];
  answerKeys?: AnswerKey[];
  notifications?: INewsAndNtfn[];

  // Analytics
  usageCount: number;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}