export type QualificationCategory =
  | "general"
  | "technical"
  | "medical"
  | "diploma";

export interface Qualification {
  id: string;

  name: string;
  slug: string;

  description?: string | null;

  /**
   * Rank Logic
   * 10 = 10th
   * 12 = 12th
   * 15 = Graduation
   * 18 = PostGrad
   */
  rank: number;

  categoryType: QualificationCategory;

  aliases?: string[] | null;

  isProfessionalDegree: boolean;

  // Metadata
  isActive: boolean;
  priorityOrder: number;

  // Audit
  createdAt: Date;
  updatedAt: Date;
}