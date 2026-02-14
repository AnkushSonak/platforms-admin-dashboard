// State interface updated
export interface State {
  id: number;
  stateName: string;
  slug: string;
  isActive: boolean;
  deletedAt?: string | null;
}