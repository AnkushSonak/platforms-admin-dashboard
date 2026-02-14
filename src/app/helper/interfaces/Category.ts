export interface Category {
  id: number;
  categoryName: string;
  slug: string;
  isActive: boolean;
  deletedAt?: string | null;
}