export type BookStatus = "draft" | "published" | "archived";
export type ProjectStage = "translation" | "proofreading" | "typesetting" | "print";

export interface Publisher {
  id: number;
  user_id: string | null;
  name: string;
  website: string | null;
  verified: boolean;
  created_at: string;
}

export interface Book {
  id: number;
  title: string;
  author: string | null;
  publisher_id: number | null;
  publisher_name: string | null;
  isbn: string | null;
  year: string | null;
  buy_url: string | null;
  cover_url: string | null;
  original_title: string | null;
  notes: string | null;
  status: BookStatus;
  created_at: string;
}

export interface InProgressProject {
  id: number;
  publisher_id: number;
  title: string;
  author: string | null;
  stage: ProjectStage;
  progress_percent: number;
  needs_support: boolean;
  support_description: string | null;
  contact_url: string | null;
  created_at: string;
}