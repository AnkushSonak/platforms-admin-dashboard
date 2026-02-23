
import { IState } from "./IState";
import { INewsAndNtfn } from "./INewsAndNtfn";
import { IJob } from "./IJob";
import { IAdmitCard } from "./IAdmitCard";
import { IResult } from "./IResult";
import { IAnswerKey } from "./IAnswerKey";

export type OrganizationType =
  | "central"
  | "state"
  | "psu"
  | "banking"
  | "other";

export interface IOrganization {
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
  states: IState[];

  jobs: IJob[];
  admitCards: IAdmitCard[];
  results: IResult[];
  answerKeys: IAnswerKey[];
  newsAndNotifications: INewsAndNtfn[];

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}