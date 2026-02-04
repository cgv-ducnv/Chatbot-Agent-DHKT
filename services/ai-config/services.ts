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
export interface AIConfig {
  id: number;
  name: string;
  description: string;
  model_name: string;
  language: string;
  prompt: string;
  created_at: string;
  updated_at: string;
}

/* =====================
   Requests
===================== */
export interface CreateAIConfigRequest {
  name: string;
  description: string;
  model_name: string;
  language: string;
  prompt: string;
}

export interface UpdateAIConfigRequest {
  name?: string;
  description?: string;
  model_name?: string;
  language?: string;
  prompt?: string;
}

/* =====================
   Query Params
===================== */
export interface GetAIConfigParams {
  page?: number; // default: 1
  page_size?: number; // default: 10, max: 100
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

/* =====================
   Responses
===================== */

// List + pagination
export interface AIConfigListData {
  configs: AIConfig[];
  total_pages: number;
  total_records: number;
  current_page: number;
  page_size: number;
}

export type GetAIConfigResponse = ApiResponse<AIConfigListData>;
export type GetAIConfigByIdResponse = ApiResponse<AIConfig>;
export type CreateAIConfigResponse = ApiResponse<AIConfig>;
export type UpdateAIConfigResponse = ApiResponse<AIConfig>;
export type DeleteAIConfigResponse = ApiResponse<null>;

/* =====================
   API Services
===================== */

// Get list AI Configs
export const aiConfigService = {
  getAIConfigs: (params?: GetAIConfigParams) =>
    apiClient.get<GetAIConfigResponse>("/ai-configs", { params }),
  getAIConfigById: (id: number) =>
    apiClient.get<GetAIConfigByIdResponse>(`/ai-configs/${id}`),
  createAIConfig: (data: CreateAIConfigRequest) =>
    apiClient.post<CreateAIConfigResponse>("/ai-configs", data),
  updateAIConfig: (id: number, data: UpdateAIConfigRequest) =>
    apiClient.put<UpdateAIConfigResponse>(`/ai-configs/${id}`, data),
  deleteAIConfig: (id: number) =>
    apiClient.delete<DeleteAIConfigResponse>(`/ai-configs/${id}`),
};
