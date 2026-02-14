import { UUID } from "crypto";
import { Category } from "./Category";
import { Job } from "./Job";
import { INewsAndNtfn } from "./INewsAndNtfn";
import { State } from "./State";

export interface AdmitCard {
  // Core Fields
  id: string;
  admitCardTitle: string;
  admitCardSlug: string;
  admitCardDescriptionJson: string;
  admitCardDescriptionHtml: string;
  admitCardAdvtNumber: string;
  admitCardExamName: string;
  admitCardOrganization: string;
  category: Category | null;   // e.g., "Government", "Banking"
  admitCardStatus: AdmitCardStatus; // e.g., 'released', 'upcoming', 'closed'
  admitCardReleaseDate: Date; // ISO date string
  admitCardExamDate: Date;    // ISO date string
  admitCardDownloadLink?: string | null;
  admitCardOfficialWebsite: string | null;
  isAdmitCardNew?: boolean;
  
  // Exam Details
  admitCardModeOfExam?: string; // e.g., "Online", "Offline"
  admitCardExamShift?: string;  // e.g., "Morning", "Evening"
  admitCardReportingTime?: string; // e.g., "08:30 AM"
  admitCardGateCloseTime?: string; // e.g., "09:15 AM"
  admitCardExamLocation?: string;
  admitCardCredentialsRequired?: string;
  admitCardHelpdeskContact?: string;

  // Resource Links
  mockTestLink?: string;
  syllabusLink?: string;
  notificationPdfLink?: string;
  examPatternLink?: string;
  previousYearPapersLink?: string;

  // JSON Fields
  regionWiseLinks?: Record<string, string>; // e.g., { "North Region": "https://..." }
  // admitCardImportantInstructions?: string[];

  // Optional Relation
  jobId?: UUID | null;
  job: Job | null;


  /* ================= Picked from Job ================= */

  sector: string | null;
  states: State[];
  newsAndNotifications: string[];

  locationText: string;
  qualification: string;
  logo: string;

  logoImageUrl: string | null;
  logoBgColor: string;
  totalVacancies: string;

  tags: string[] | null;
  helpfullVideoLinks: string[] | null;

  importantDates: any;
  vacancyDetails: any;
  eligibility: any;
  applicationFee: any;
  contactDetails: any;
  examPattern: any;
  importantLinks: {
    label: string;
    links: string[];
  }[] | null;

  jobType: string;
  ageLimitText: string;
  applyLink: string;

  // selectionProcess: string[] | null;
  salary: string[] | null;
  // howToApply: string[] | null;
  // syllabus: string[] | null;

  // SEO
  metaTitle: string;
  metaDescription: string;
  seoKeywords: string[] | null;
  seoCanonicalUrl: string;
  schemaMarkupJson: any;

  // Analytics
  viewCount: number;
  clickCount: number;
  saveCount: number;

  // Lifecycle
  publishDate: Date | null;
  expiryDate: Date | null;
  autoPublishAt: Date | null;
  isExpired: boolean;

  lastUpdatedBy: UUID | null;
  notes: string;
  reviewStatus: string;

  relatedJobs: string[];

  estimatedSalaryRange: {
    min: string | number;
    max: string | number;
  };

  applicationMode: string;
  jobLevel: string;
  dynamicFields: any;

  // dynamicFields: Array<{
  //   label: string;
  //   type: "text" | "table" | "json";
  //   value?: string | { [key: string]: any } | Array<{ [key: string]: any }>;
  //   columns?: string[];
  //   rows?: Array<Array<string>>;
  // }> | null;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export enum AdmitCardStatus {
  RELEASED = 'released',
  UPCOMING = 'upcoming',
  CLOSED = 'closed',
}