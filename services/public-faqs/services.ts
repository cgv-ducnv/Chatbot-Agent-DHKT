import apiClient from "@/lib/api-client";

/* =====================
   Base API Response
===================== */
export interface ApiResponse<T> {
  status: string;
  status_code: number;
  message: string;
  data: T;
}

/* =====================
   Model (Public dùng chung)
===================== */
export interface PublicFAQ {
  id: number;
  question: string;
  answer: string;
  intent: string;
  priority: number;
  search_count: number;
  ai_config_id: number;
}

/* =====================
   Query Params (Public GET)
===================== */
export interface GetPublicFAQParams {
  id?: number;
  ai_config_id?: number;
  page?: number; // default: 1
  page_size?: number; // default: 6, max: 6
  search?: string;
  sort_by?: string; // default: search_count
  sort_order?: "asc" | "desc"; // default: desc
}

/* =====================
   Responses
===================== */
export interface PublicFAQListData {
  faqs: PublicFAQ[];
  total_pages: number;
  total_records: number;
  current_page: number;
  page_size: number;
}

export type GetPublicFAQResponse = ApiResponse<PublicFAQListData>;

/* =====================
   Vector Search (Public)
===================== */
export interface PublicFAQSearchRequest {
  query: string;
  ai_config_id: number;
  top_k?: number; // default: 5
  threshold?: number; // default: 0.7
}

export interface PublicFAQSearchResult extends PublicFAQ {
  similarity: number;
}

export type PublicFAQSearchResponse = ApiResponse<PublicFAQSearchResult[]>;

export const getPublicFAQs = (params?: GetPublicFAQParams) =>
  apiClient.get<GetPublicFAQResponse>("/api/v1/public/faqs", {
    params: {
      page: 1,
      page_size: 6,
      sort_by: "search_count",
      sort_order: "desc",
      ...params,
    },
  });

// POST: vector similarity search
export const searchPublicFAQs = (data: PublicFAQSearchRequest) =>
  apiClient.post<PublicFAQSearchResponse>("/api/v1/public/faqs/search", data);

// POST: vector similarity search (stream)
export const searchPublicFAQsStream = (data: PublicFAQSearchRequest) =>
  apiClient.post("/api/v1/public/faqs/search/stream", data, {
    responseType: "stream", // hoặc "text/event-stream" nếu BE dùng SSE
  });
