export interface PostResult {
  platform: string;
  status: string;
  platform_post_id: string | null;
  platform_post_url: string | null;
  published_at: string | null;
}

export interface PostResultDetailed extends PostResult {
  account_name: string;
  error_message: string | null;
  attempts: number;
}

export interface Post {
  id: number;
  content: string | null;
  platforms: string[];
  status: string;
  media_id: number | null;
  scheduled_for: string | null;
  results: PostResult[];
  created_at: string;
}

export interface PostDetailed extends Omit<Post, "results"> {
  custom_content: Record<string, string> | null;
  results: PostResultDetailed[];
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ConnectedAccount {
  id: number;
  platform: string;
  account_name: string;
  account_type: string;
  status: string;
  token_expires_at: string | null;
  created_at: string;
}

export interface UserProfile {
  id: number;
  email: string;
  plan: string;
  subscription_status: string;
  plan_ends_at: string | null;
  posts_remaining: number;
  posts_limit: number;
  posts_used_this_period: number;
  billing_period_start: string;
  platforms_allowed: string[];
  webhooks_allowed: boolean;
  connected_accounts: Array<{
    id: number;
    platform: string;
    account_name: string;
    account_type: string;
  }>;
}

export interface MediaUpload {
  id: number;
  filename: string;
  mime_type: string;
  file_size: number;
  created_at: string;
}

export interface ApiResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiError {
  error: string;
  message: string;
  errors?: Record<string, string[]>;
}

export const PLATFORMS = [
  "twitter",
  "linkedin",
  "facebook",
  "instagram",
  "threads",
  "tiktok",
  "pinterest",
  "bluesky",
  "telegram",
  "youtube",
  "reddit",
  "google_business",
  "snapchat",
] as const;

export type Platform = (typeof PLATFORMS)[number];

export const POST_STATUSES = [
  "pending",
  "scheduled",
  "published",
  "partial",
  "failed",
] as const;

export type PostStatus = (typeof POST_STATUSES)[number];
