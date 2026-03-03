import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import type {
  ApiResponse,
  PaginatedResponse,
  Post,
  PostDetailed,
  UserProfile,
  ConnectedAccount,
  MediaUpload,
} from "./types.js";

const BASE_URL = "https://postbolt.dev/api/v1";

export class PostBoltClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = `${BASE_URL}${path}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      Accept: "application/json",
    };

    const init: RequestInit = { method, headers };

    if (body) {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    }

    const res = await fetch(url, init);

    if (res.status === 204) {
      return {} as T;
    }

    const json = await res.json();

    if (!res.ok) {
      const errMsg = json.message || json.error || `HTTP ${res.status}`;
      throw new Error(`PostBolt API error (${res.status}): ${errMsg}`);
    }

    return json as T;
  }

  // --- Posts ---

  async createPost(params: {
    content?: string;
    platforms: string[];
    scheduled_for?: string;
    media_id?: number;
    custom_content?: Record<string, string>;
  }): Promise<ApiResponse<Post>> {
    return this.request("POST", "/posts", params as Record<string, unknown>);
  }

  async listPosts(params?: {
    page?: number;
    status?: string;
  }): Promise<PaginatedResponse<Post>> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.status) query.set("status", params.status);
    const qs = query.toString();
    return this.request("GET", `/posts${qs ? `?${qs}` : ""}`);
  }

  async getPost(postId: number): Promise<ApiResponse<PostDetailed>> {
    return this.request("GET", `/posts/${postId}`);
  }

  async updatePost(
    postId: number,
    params: {
      content?: string;
      custom_content?: Record<string, string>;
      scheduled_for?: string;
    }
  ): Promise<ApiResponse<Post>> {
    return this.request(
      "PATCH",
      `/posts/${postId}`,
      params as Record<string, unknown>
    );
  }

  async cancelPost(postId: number): Promise<void> {
    await this.request("DELETE", `/posts/${postId}`);
  }

  // --- Profile ---

  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return this.request("GET", "/me");
  }

  // --- Accounts ---

  async getAccounts(): Promise<ApiResponse<ConnectedAccount[]>> {
    return this.request("GET", "/accounts");
  }

  // --- Media ---

  async uploadMedia(filePath: string): Promise<ApiResponse<MediaUpload>> {
    const fileBuffer = await readFile(filePath);
    const fileName = basename(filePath);

    // Detect MIME type from extension
    const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
    const mimeMap: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
    };
    const mimeType = mimeMap[ext] ?? "application/octet-stream";

    const blob = new Blob([fileBuffer], { type: mimeType });
    const formData = new FormData();
    formData.append("file", blob, fileName);

    const url = `${BASE_URL}/media`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: "application/json",
      },
      body: formData,
    });

    const json = await res.json();

    if (!res.ok) {
      const errMsg = json.message || json.error || `HTTP ${res.status}`;
      throw new Error(`PostBolt API error (${res.status}): ${errMsg}`);
    }

    return json as ApiResponse<MediaUpload>;
  }
}
