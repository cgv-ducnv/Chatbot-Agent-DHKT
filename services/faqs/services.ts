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
   Model
===================== */
export interface FAQ {
  id: number;
  question: string;
  aliases?: string[]; // _varchar
  question_embedding?: number[]; // vector (FE không dùng trực tiếp)
  answer: string;
  intent: string;
  priority: number;
  search_count: number;
  ai_config_id: number;
  created_at?: string;
  updated_at?: string;
}

/* =====================
   Query Params
===================== */
export interface GetFAQParams {
  id?: number;
  ai_config_id?: number;
  page?: number; // default: 1
  page_size?: number; // default: 10, max: 100
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

/* =====================
   Requests
===================== */
export interface CreateFAQRequest {
  question: string;
  aliases?: string[];
  answer: string;
  intent: string;
  priority: number;
  ai_config_id: number;
}

export interface UpdateFAQRequest {
  question?: string;
  aliases?: string[];
  answer?: string;
  intent?: string;
  priority?: number;
}

export interface ImportExcelRequest {
  file: File;
  intent_default: string;
  priority_default: number;
  ai_config_id: number;
}

/* =====================
   Vector Search Request
===================== */
export interface FAQVectorSearchRequest {
  query: string;
  ai_config_id: number;
  top_k?: number; // default: 5
  threshold?: number; // default: 0.7
}

/* =====================
   Responses
===================== */

// List + pagination
export interface FAQListData {
  faqs: FAQ[];
  total_pages: number;
  total_records: number;
  current_page: number;
  page_size: number;
}

export type GetFAQResponse = ApiResponse<FAQListData>;
export type GetFAQByIdResponse = ApiResponse<FAQ>;
export type CreateFAQResponse = ApiResponse<FAQ>;
export type UpdateFAQResponse = ApiResponse<FAQ>;
export type DeleteFAQResponse = ApiResponse<null>;

// Vector search result
export interface FAQVectorSearchResult extends FAQ {
  similarity: number;
}

export type FAQVectorSearchResponse = ApiResponse<FAQVectorSearchResult[]>;

/* =====================
   API Services
===================== */

// Get list FAQs
export const faqService = {
  getFAQs: (params?: GetFAQParams) =>
    apiClient.get<GetFAQResponse>("/faqs", { params }),
  getFAQById: (id: number | string) =>
    apiClient.get<GetFAQByIdResponse>(`/faqs/${id}`),
  createFAQ: (data: CreateFAQRequest) =>
    apiClient.post<CreateFAQResponse>("/faqs", data),
  updateFAQ: (id: number | string, data: UpdateFAQRequest) =>
    apiClient.put<UpdateFAQResponse>(`/faqs/${id}`, data),
  deleteFAQ: (id: number | string) =>
    apiClient.delete<DeleteFAQResponse>(`/faqs/${id}`),
  searchFAQByVector: (data: FAQVectorSearchRequest) =>
    apiClient.post<FAQVectorSearchResponse>("/faqs/search", data),
  importExcel: (data: ImportExcelRequest) => {
    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("intent_default", data.intent_default);
    formData.append("priority_default", data.priority_default.toString());
    formData.append("ai_config_id", data.ai_config_id.toString());
    return apiClient.post<ApiResponse<null>>("/faqs/import-excel", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
