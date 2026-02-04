import apiClient from "@/lib/api-client";
import { DeleteAIConfigResponse } from "../ai-config/services";

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
export interface Sources {
  id: number;
  name: string;
  description: string;
  source_type: string;
  source_url: string;
  ai_config_id: number;
  check_sum: string;
  created_at: string;
  updated_at: string;
}

/* =====================
   Requests
===================== */
export interface CreateSourcesRequest {
  name: string;
  description: string;
  source_type: string;
  source_url: string;
  ai_config_id: number;
  check_sum: string;
}

export interface UpdateSourcesRequest {
  name: string;
  description: string;
  source_type: string;
  source_url: string;
  ai_config_id: number;
  check_sum: string;
}

export interface IngestSourcesRequest {
  ai_config_id: number;
  root_path: string;
  source_paths: string[];
  allowed_extensions: string[];
  chunk_size: number;
  chunk_overlap: number;
  chunk_strategy: string;
  max_files: number;
  force: boolean;
  include_hidden: boolean;
  use_docling_for_pdf: boolean;
  redact_pii: boolean;
}

export interface SearchSourcesRequest {
  query: string;
  ai_config_id: number;
  source_id: number;
  source_type: string;
  top_k: number;
  threshold: number;
  return_prompt: boolean;
}

/* =====================
   Query Params
===================== */
export interface GetSourcesParams {
  page?: number; // default: 1
  page_size?: number; // default: 10, max: 100
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  ai_config_id?: number;
}

/* =====================
   Responses
===================== */

// List + pagination
export interface SourcesListData {
  sources: Sources[];
  total_pages: number;
  total_records: number;
  current_page: number;
  page_size: number;
}

export interface IngestSourcesData {
  processed_files: number;
  skipped_files: number;
  error_count: number;
  errors: string[];
  model: string;
  language: string;
}

export type GetSourcesResponse = ApiResponse<SourcesListData>;
export type GetSourcesByIdResponse = ApiResponse<Sources>;
export type CreateSourcesResponse = ApiResponse<Sources>;
export type UpdateSourcesResponse = ApiResponse<Sources>;
export type DeleteSourcesResponse = ApiResponse<null>;
export type IngestSourcesResponse = ApiResponse<null>;
export type SearchSourcesResponse = ApiResponse<null>;

/* =====================
   API Services
===================== */

export const sourcesService = {
  getSources: (params?: GetSourcesParams) =>
    apiClient.get<GetSourcesResponse>("/sources", { params }),
  getSourcesById: (id: number) =>
    apiClient.get<GetSourcesByIdResponse>(`/sources/${id}`),
  createSources: (data: CreateSourcesRequest) =>
    apiClient.post<CreateSourcesResponse>("/sources", data),
  updateSources: (id: number, data: UpdateSourcesRequest) =>
    apiClient.put<UpdateSourcesResponse>(`/sources/${id}`, data),
  deleteSources: (id: number) =>
    apiClient.delete<DeleteSourcesResponse>(`/sources/${id}`),
  ingestSources: (data: IngestSourcesRequest) =>
    apiClient.post<IngestSourcesResponse>(`/sources/ingest`, data),
  searchSources: (data: SearchSourcesRequest) =>
    apiClient.post<SearchSourcesResponse>(`/sources/search`, data),
};
