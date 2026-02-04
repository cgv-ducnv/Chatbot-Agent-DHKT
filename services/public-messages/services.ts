import apiClient from "@/lib/api-client";

// Response chung
interface ApiResponse<T> {
  status: string;
  status_code: number;
  message: string;
  data: T;
}
export type SendMessageResponse = ApiResponse<{
  id: number;
  contact_id: number;
  role: string;
  content: string;
  created_at: string;
  message_metadata: string;
}>;

export interface Message {
  id: number;
  role: string;
  content: string;
  created_at: string;
  message_metadata: string;
}

export type GetMessagesHistoryResponse = ApiResponse<{
  messages: Message[];
  total_records: number;
  current_page: number;
  page_size: number;
}>;

// Request
export interface SendMessageRequest {
  contact_id: number;
  role: string;
  content: string;
  message_metadata: string;
  session_id: string;
}

// Params
export interface GetMessagesHistoryParams {
  contact_id: number;
  page?: number;
  page_size?: number;
}
export const publicMessageService = {
  sendMessage: (data: SendMessageRequest) =>
    apiClient.post<SendMessageResponse>("/public-messages", data),
  getMessagesHistory: (params: GetMessagesHistoryParams) =>
    apiClient.get<GetMessagesHistoryResponse>(`public/messages/history`, {
      params,
    }),
};
