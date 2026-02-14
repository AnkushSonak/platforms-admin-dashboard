// types/header.types.ts
export interface SearchResultItem {
  id: string | number;
  title: string;
  slug: string;
  type: 'job' | 'newsAndNotification' | 'admit-card' | 'result' | 'exam-event';
  description?: string;
}

export interface NavLink {
  href: string;
  label: string;
  icon: React.ComponentType | null;
}

// types/auth.types.ts (if not already present)
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role?: 'admin' | 'user';
}
