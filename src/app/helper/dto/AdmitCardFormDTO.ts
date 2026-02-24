// import { UUID } from "crypto";
// import { AdmitCardStatus } from "@/app/helper/interfaces/IAdmitCard";
// import { ApplicationMode } from "@/app/helper/interfaces/IJob";
// import { ReviewStatus } from "./global";

// export interface AdmitCardFormDTO {
//   /* ================= Core Fields ================= */

//   id?: string;

//   admitCardTitle: string;
//   admitCardSlug?: string;

//   admitCardDescriptionJson: string;
//   admitCardDescriptionHtml: string;

//   admitCardAdvtNumber: string;
//   admitCardExamName: string;
//   admitCardOrganization: string;

//   categoryId: string | null;

//   admitCardStatus: AdmitCardStatus;

//   admitCardReleaseDate: Date | null;
//   admitCardExamDate: Date | null;

//   admitCardDownloadLink?: string | null;
//   admitCardOfficialWebsite: string | null;

//   isAdmitCardNew?: boolean;

//   /* ================= Exam Details ================= */

//   admitCardModeOfExam?: string;
//   admitCardExamShift?: string;
//   admitCardReportingTime?: string;
//   admitCardGateCloseTime?: string;
//   admitCardExamLocation?: string;
//   admitCardCredentialsRequired?: string;
//   admitCardHelpdeskContact?: string;

//   /* ================= Resource Links ================= */

//   mockTestLink?: string;
//   syllabusLink?: string;
//   notificationPdfLink?: string;
//   examPatternLink?: string;
//   previousYearPapersLink?: string;

//   /* ================= JSON / Array Fields ================= */

//   regionWiseLinks?: Record<string, string>;
// //   admitCardImportantInstructions?: string[];

//   /* ================= Relations (IDS ONLY) ================= */

//   jobId?: string | null;              // ✅ instead of Job object
//   stateIds: string[];                 // ✅ instead of State[]
//   newsAndNotifications: string[];     // ✅ instead of objects
//   relatedJobs: string[];              // ✅ job ids

//   /* ================= Picked From Job ================= */

//   sector: string | null;

//   locationText: string;
//   qualification: string;

//   logo: string;
//   logoImageUrl: string | null;
//   logoBgColor: string;

//   totalVacancies: string;

//   tags: string[] | null;
//   helpfullVideoLinks: string[] | null;

//   importantDates: any;
//   vacancyDetails: any;
//   eligibility: any;
//   applicationFee: any;
//   contactDetails: any;
//   examPattern: any;
//   importantLinks: {
//     label: string;
//     links: string[];
//   }[] | null;

//   jobType: string;
//   jobLevel: string;

//   ageLimitText: string;
//   applyLink: string;

// //   selectionProcess: string[] | null;
//   salary: string[] | null;
// //   howToApply: string[] | null;
// //   syllabus: string[] | null;

//   /* ================= Salary / Application ================= */

//   estimatedSalaryRange: {
//     min: string | number;
//     max: string | number;
//   };

//   applicationMode: ApplicationMode | null;

//   /* ================= Dynamic ================= */

//   dynamicFields: any;

//   /* ================= SEO ================= */

//   metaTitle: string;
//   metaDescription: string;
//   seoKeywords: string[] | null;
//   seoCanonicalUrl: string;
//   schemaMarkupJson: any;

//   /* ================= Admin / Lifecycle ================= */
//   publishDate: Date | null;
//   expiryDate: Date | null;
//   autoPublishAt: Date | null;
//   isExpired: boolean;

//   notes: string;
//   reviewStatus: ReviewStatus;

//   /* ================= Analytics (read-only but kept) ================= */

//   viewCount?: number;
//   clickCount?: number;
//   saveCount?: number;

//   /* ================= Metadata ================= */

//   lastUpdatedBy?: UUID | null;
// }


import { AdmitCardStatus } from "@/app/helper/interfaces/IAdmitCard";

export interface AdmitCardFormDTO {
  /* ================= Core ================= */

  id?: string;

  title: string;
  slug: string;
  examName: string;

  descriptionJson?: string | null;
  descriptionHtml?: string | null;

  organizationId: string;
  categoryId?: string | null;

  status: AdmitCardStatus;
  reviewStatus: string;

  /* ================= Dates ================= */

  releaseDate?: Date | null;
  examStartDate?: Date | null;
  examEndDate?: Date | null;
  publishDate?: Date | null;

  /* ================= Exam Details ================= */

  modeOfExam?: string | null;
  examShifts?: {
    shiftName: string;
    reportingTime: string;
    gateClosingTime: string;
    examTime: string;
    otherDetails?: string;
  }[] | null;

  examLocation?: string | null;

  importantInstructions?: string[] | null;

  /* ================= Relations (IDs only) ================= */

  jobId?: string | null;
  stateIds: string[];
  tagIds: string[];
  newsAndNotificationIds: string[];

  /* ================= Content Blocks ================= */

  cardTags?: string[] | null;
  helpfullVideoLinks?: string[] | null;

  importantDates?: Record<string, any> | null;

  importantLinks?: {
    label: string;
    url: string;
  }[] | null;

  /* ================= Dynamic ================= */

  dynamicFields?: {
    key: string;
    value: string | number | boolean | null;
  }[] | null;

  /* ================= SEO ================= */

  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[] | null;
    canonicalUrl?: string | null;
    schemaMarkupJson?: any;
  } | null;

  /* ================= Flags ================= */

  isFeatured?: boolean;

  /* ================= Admin ================= */

  lastUpdatedBy?: string | null;
}