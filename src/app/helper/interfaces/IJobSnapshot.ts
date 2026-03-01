import { IQualification } from "./IQualification";

export interface IJobSnapshot {
  advtNumber?: string;
  sector?: string;
  qualifications?: IQualification[];
  qualificationSummary?: string;
  totalVacancies?: number;
  jobType?: string;
  ageLimitText?: string;
  applicationFee?: any;
  minAge?: number;
  maxAge?: number;
}