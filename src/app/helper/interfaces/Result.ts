import { Category } from "./Category";
import { Job } from "./Job";
import { INewsAndNtfn } from "./INewsAndNtfn";
import { State } from "./State";

export interface Result {
  id: string;

  resultTitle: string;
  resultDescriptionJson: string | null;
  resultDescriptionHtml: string | null;
  resultSlug: string;
  resultExamName: string;
  resultOrganization: string;
  resultStatus: string | null;
  category: Category | null; 

  resultReleaseDate: Date | null;

  resultDownloadLink: string | null;
  resultOfficialWebsite: string | null;

  isResultNew: boolean;

  /** Relations */
  job: Job | null;
  jobId: string | null;

  /** Picked from Job entity */
  sector: string | null;

  states: State[];

  newsAndNotifications: INewsAndNtfn[];

  locationText: string | null;
  qualification: string | null;
  logo: string | null;

  /** Logo image URL or local path */
  logoImageUrl: string | null;
  logoBgColor: string | null;

  totalVacancies: string | null;

  tags: string[] | null;
  helpfullVideoLinks: string[] | null;

  importantDates: any;

  importantLinks: {
    label: string;
    links: string[];
  }[] | null;

  vacancyDetails: any;
  eligibility: any;

  jobType: string | null;
  ageLimitText: string | null;

  applicationFee: any;

  selectionProcess: string[] | null;
  salary: string[] | null;
  howToApply: string[] | null;

  contactDetails: any;
  examPattern: any;

  syllabus: string[] | null;

  metaTitle: string | null;
  metaDescription: string | null;

  applyLink: string | null;

  seoKeywords: string[] | null;
  seoCanonicalUrl: string | null;

  schemaMarkupJson: any;

  viewCount: number;
  clickCount: number;
  saveCount: number;

  publishDate: Date | null;
  expiryDate: Date | null;
  autoPublishAt: Date | null;

  isExpired: boolean;

  lastUpdatedBy: string | null;

  notes: string | null;

  reviewStatus: string;

  relatedJobs: string[] | null;

  estimatedSalaryRange?: {
    min: string | number;
    max: string | number;
  };

  applicationMode: string | null;
  jobLevel: string | null;

  dynamicFields: any;
  
  // dynamicFields: Array<{
  //   label: string;
  //   type: "text" | "table" | "json";
  //   value?: string | { [key: string]: any } | Array<{ [key: string]: any }>;
  //   columns?: string[];
  //   rows?: Array<Array<string>>;
  // }> | null;

  createdAt: Date;
  updatedAt: Date;
}


export enum ResultStatus {
  RELEASED = 'released',
  UPCOMING = 'upcoming',
  CLOSED = 'closed',
}
