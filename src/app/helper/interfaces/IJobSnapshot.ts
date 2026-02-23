import { IQualification } from "./IQualification";

export interface IJobSnapshot {
  advtNumber?: string;
  sector?: string;
  qualifications?: IQualification[];
  totalVacancies?: number;
  jobType?: string;
  ageLimitText?: string;
  applicationFee?: any;
}