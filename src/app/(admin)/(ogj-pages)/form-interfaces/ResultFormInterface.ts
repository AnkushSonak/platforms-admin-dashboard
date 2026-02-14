import { ApplicationMode } from "@/app/helper/interfaces/Job";
import { UUID } from "crypto";
import { ReviewStatus } from "./global";

export interface ResultFormInterface {
    /* ================= Core Fields ================= */

      id: string;
    
      resultTitle: string;
      resultDescriptionJson: string | null;
      resultDescriptionHtml: string | null;
      resultSlug: string;
      resultAdvtNumber: string;
      resultExamName: string;
      resultOrganization: string;

      categoryId: string | null;

      resultStatus: string | null; 
    
      resultReleaseDate: Date | null;
    
      resultDownloadLink: string | null;
      resultOfficialWebsite: string | null;
    
      isResultNew: boolean;

      /* ================= Relations (IDS ONLY) ================= */
    
      jobId?: string | null;              // ✅ instead of Job object
      stateIds: string[];                 // ✅ instead of State[]
      newsAndNotifications: string[];     // ✅ instead of objects
      relatedJobs: string[];              // ✅ job ids
    
      /* ================= Picked From Job ================= */
    
      sector: string | null;
    
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
      jobLevel: string;
    
      ageLimitText: string;
      applyLink: string;
    
    //   selectionProcess: string[] | null;
      salary: string[] | null;
    //   howToApply: string[] | null;
    //   syllabus: string[] | null;
    
      /* ================= Salary / Application ================= */
    
      estimatedSalaryRange: {
        min: string | number;
        max: string | number;
      };
    
      applicationMode: ApplicationMode | null;
    
      /* ================= Dynamic ================= */
    
      dynamicFields: any;
    
      /* ================= SEO ================= */
    
      metaTitle: string;
      metaDescription: string;
      seoKeywords: string[] | null;
      seoCanonicalUrl: string;
      schemaMarkupJson: any;
    
      /* ================= Admin / Lifecycle ================= */
      publishDate: Date | null;
      expiryDate: Date | null;
      autoPublishAt: Date | null;
      isExpired: boolean;
    
      notes: string;
      reviewStatus: ReviewStatus;
    
      /* ================= Analytics (read-only but kept) ================= */
    
      viewCount?: number;
      clickCount?: number;
      saveCount?: number;
    
      /* ================= Metadata ================= */
    
      lastUpdatedBy?: UUID | null;
    
}