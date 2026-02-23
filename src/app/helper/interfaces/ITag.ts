import { IAdmitCard } from "./IAdmitCard";
import { IAnswerKey } from "./IAnswerKey";
import { IJob } from "./IJob";
import { INewsAndNtfn } from "./INewsAndNtfn";
import { IResult } from "./IResult";

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

export interface ITag {
  id: string;

  name: string;
  slug: string;

  group: TagGroup;

  description?: string | null;

  // UI & Branding
  icon?: string | null;
  color?: string | null;

  // Hierarchy (Self Reference)
  parent?: ITag | null;
  children?: ITag[];

  // SEO
  seoSettings?: SeoSettings | null;

  // Relations
  jobs?: IJob[];
  admitCards?: IAdmitCard[];
  results?: IResult[];
  answerKeys?: IAnswerKey[];
  notifications?: INewsAndNtfn[];

  // Analytics
  usageCount: number;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}