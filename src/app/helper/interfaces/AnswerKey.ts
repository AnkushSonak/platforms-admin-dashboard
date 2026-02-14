import { Category } from "./Category";
import { Job } from "./Job";
import { State } from "./State";
import { INewsAndNtfn } from "./INewsAndNtfn";

export interface AnswerKey {
  id: string;

  // Basic Title Info
  answerKeyTitle: string;
  answerKeyDescriptionJson?: string;
  answerKeyDescriptionHtml?: string;
  answerKeySlug: string;
  answerKeyAdvtNumber?: string;
  answerKeyExamName: string;
  answerKeyOrganization: string;

  category: Category | null;

  answerKeyStatus: string;

  // Dates
  answerKeyReleaseDate?: Date;

  answerKeyDownloadLink: string | null;
  answerKeyOfficialWebsite: string | null;

  // Job relation
  job: Job | null;
  jobId: string | null;

  /* Picked from Job entity */
  sector?: string;

  states: State[];
  newsAndNotifications: INewsAndNtfn[];

  locationText?: string;
  qualification?: string;
  logo?: string;
  logoImageUrl?: string | null;
  logoBgColor?: string;
  totalVacancies?: string;

  tags?: string[];
  helpfullVideoLinks?: string[];

  importantDates?: any;
  importantLinks?: {
    label: string;
    links: string[];
  }[] | null;

  vacancyDetails?: any;
  eligibility?: any;

  jobType?: string;
  ageLimitText?: string;
  applicationFee?: any;

  selectionProcess?: string[];
  salary?: string[];
  howToApply?: string[];

  contactDetails?: any;
  examPattern?: any;
  syllabus?: string[];

  isAnswerKeyNew: boolean;

  metaTitle?: string;
  metaDescription?: string;
  applyLink?: string;

  seoKeywords?: string[];
  seoCanonicalUrl?: string;

  schemaMarkupJson?: any;

  viewCount: number;
  clickCount: number;
  saveCount: number;

  publishDate: Date;
  expiryDate: Date;
  autoPublishAt?: Date;

  isExpired: boolean;

  lastUpdatedBy?: string | null;
  notes?: string;

  reviewStatus: string;

  relatedJobs?: string[];

  estimatedSalaryRange?: {
    min: string | number;
    max: string | number;
  };

  applicationMode?: string;
  jobLevel?: string;

  dynamicFields?: any;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // dynamicFields?: Array<{
  //   label: string;
  //   type: "text" | "table" | "json";
  //   value?: string | Record<string, any> | Array<Record<string, any>>;
  //   columns?: string[];
  //   rows?: string[][];
  // }>;
}

export enum AnswerKeyStatus {
  RELEASED = 'released',
  UPCOMING = 'upcoming',
  CLOSED = 'closed',
}
