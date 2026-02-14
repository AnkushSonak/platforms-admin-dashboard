import { Job } from "./Job";
import { AdmitCard } from "./AdmitCard";
import { Result } from "./Result";
import { AnswerKey } from "./AnswerKey";
import { State } from "./State";
import { INewsAndNtfn } from "./INewsAndNtfn";

export type OrganizationType =
  | "central"
  | "state"
  | "psu"
  | "banking"
  | "other";

export interface Organization {
  id: string;

  fullName: string;       // e.g., Staff Selection Commission
  shortName: string;      // e.g., SSC
  slug: string;           // e.g., ssc, upsc, rrb

  description?: string;   // About section

  orgType: OrganizationType;

  // --- Branding ---
  logoUrl?: string;
  
  brandColor?: string;    // Hex code, e.g. #ffffff

  logoText?: string;
  
  officialWebsite?: string;

  socialLinks?: {
    twitter?: string;
    facebook?: string;
    youtube?: string;
  };

  headquarters?: string;  // e.g., New Delhi

  // Relations
  states: State[];

  jobs: Job[];
  admitCards: AdmitCard[];
  results: Result[];
  answerKeys: AnswerKey[];
  newsAndNotifications: INewsAndNtfn[];

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}