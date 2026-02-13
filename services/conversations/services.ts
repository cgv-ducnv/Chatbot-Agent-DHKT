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
export interface Conversation {
  id: number;
  title: string;
  group_id: number;
  group_name: string;
  status: string;
  ai_active: boolean;
  message_count: number;
  created_at: string;
  updated_at: string;
}

/* =====================
   Requests
===================== */
export interface CreateconversationRequest {
  title: string;
  group_id: number;
  status: string;
  ai_active: boolean;
}

export interface UpdateconversationRequest {
  title?: string;
  group_id?: number;
  status?: string;
  ai_active?: boolean;
}

/* =====================
   Query Params
===================== */
export interface GetconversationParams {
  page?: number; // default: 1
  page_size?: number; // default: 10, max: 100
  search?: string;
  sort_by?: string;
  group_id?: number;
  status?: string;
  sort_order?: "asc" | "desc";
}

export interface GetConversationByIdParams {
  page?: number; // default: 1
  page_size?: number; // default: 10, max: 100
}

/* =====================
   Responses
===================== */

// List + pagination
export interface ConversationListData {
  conversations: Conversation[];
  total_pages: number;
  total_records: number;
}

export interface ConversationPrioritizedData {
  conversations: {
    id: number;
    title: string;
    group_id: number;
    group_name: string;
    status: string;
    ai_active: boolean;
    message_count: number;
    unread_count: number;
    created_at: string;
    updated_at: string;
  }[];
  total_pages: number;
  total_records: number;
  current_page: number;
  page_size: number;
}

export interface Message {
  id: number;
  role: string;
  content: string;
  user: {
    id: number;
    username: string;
    fullname: string;
    email: string;
  };
  contact_id: number;
  message_metadata: string;
  created_at: string;
}

export interface ConversationDetailByID {
  id: number;
  title: string;
  group_id: number;
  group: {
    id: number;
    name: string;
    description: string;
  };
  status: string;
  ai_active: boolean;
  message_count: number;
  messages: Message[];
  pagination: {
    current_page: number;
    page_size: number;
    total_pages: number;
    total_records: number;
    has_more: boolean;
  };
  created_at: string;
  updated_at: string;
}

export type GetconversationResponse = ApiResponse<ConversationListData>;
export type GetconversationByIdResponse = ApiResponse<ConversationDetailByID>;
export type CreateconversationResponse = ApiResponse<Conversation>;
export type UpdateconversationResponse = ApiResponse<Conversation>;
export type DeleteconversationResponse = ApiResponse<null>;
export type GetconversationByChatContactIdResponse = ApiResponse<
  Conversation[]
>;
export type GetconversationPrioritizedResponse =
  ApiResponse<ConversationPrioritizedData>;

/* =====================
   API Services
===================== */

// Get list conversation
export const conversationService = {
  getConversation: (params?: GetconversationParams) =>
    apiClient.get<GetconversationResponse>("/conversations", { params }),
  getConversationById: (id: number, params?: GetConversationByIdParams) =>
    apiClient.get<GetconversationByIdResponse>(`/conversations/${id}`, {
      params,
    }),
  getConversationPrioritized: (params?: GetconversationParams) =>
    apiClient.get<GetconversationPrioritizedResponse>(
      `/conversations/prioritized`,
      { params },
    ),
  getConversationByChatContactId: (id: number) =>
    apiClient.get<GetconversationByChatContactIdResponse>(
      `/conversations/chat-contact/${id}`,
    ),
  createConversation: (data: CreateconversationRequest) =>
    apiClient.post<CreateconversationResponse>("/conversations", data),
  updateConversation: (id: number, data: UpdateconversationRequest) =>
    apiClient.put<UpdateconversationResponse>(`/conversations/${id}`, data),
  deleteConversation: (id: number) =>
    apiClient.delete<DeleteconversationResponse>(`/conversations/${id}`),
};
