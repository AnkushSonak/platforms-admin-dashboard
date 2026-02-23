import { UUID } from "crypto";
import { IState } from "./IState";
import { ICategory } from "./ICategory";
import { IOrganization } from "./IOrganization";

export enum JobStatus {
  ACTIVE = "active",
  EXPIRED = "expired",
  UPCOMING = "upcoming",
  DRAFT = "draft",
  ARCHIVED = "archived",
  POSTPONED = "postponed",
}

export enum ApplicationMode {
  ONLINE = 'Online',
  OFFLINE = 'Offline',
  BOTH = 'Both',
}

export interface IJob {
  readonly id: string;
  title: string;
  slug: string;
  descriptionJson?: string | null;
  descriptionHtml?: string | null;
  advtNumber?: string | null;
  status: JobStatus;
  isFeatured: boolean;

  organization: IOrganization; //eg. SSC, IBPS, Railways etc.
  organizationId: string;
  category: ICategory | null; //eg. Banking, SSC, Railways etc.
  categoryId: string | null;

  sector: string | null; //eg. Central Govt, State Govt, PSU etc.
  jobType: string | null; //eg. Full-time, Part-time, Contract etc.
  jobLevel: string | null; //eg. Entry Level, Mid Level, Senior Level etc.
  applicationMode: string | null;

  officialWebsite: string;
  applyLink: string | null;

  locationText: string | null;
  states: IState[];
  stateIds: string[];

  minAge?: number;
  maxAge?: number;
  ageLimitText?: string;

  qualificationSummary?: string; //eg. Bachelor's Degree, Master's Degree etc.
 
  minSalary?: number;
  salaryText?: string;

  totalVacancies: number;
  applicationFee?: any;

  applyStartDate?: Date;
  expiryDate?: Date | null;
  mainExamDate?: Date;

  cardTags: string[] | null;
  tags: string[];
  helpfulVideoLinks?: string[];

  importantDates: any | null;
  importantLinks: any | null;

  tagIds?: string[];
  relatedJobIds?: string[];

  postIds?: string[];
  newsAndNotificationIds?: string[];
  admitCardIds?: string[];
  resultIds?: string[];
  answerKeyIds?: string[];

  dynamicFields?: any | null;

  notificationPdf: string;

  seoKeywords: string[];
  seoCanonicalUrl: string | null;
  schemaMarkupJson: any | null;
  metaTitle: string | null;
  metaDescription: string | null;

  readonly createdAt: Date;
  readonly updatedAt: Date;
  lastUpdatedBy?: string;
  deletedAt?: Date | null;
}