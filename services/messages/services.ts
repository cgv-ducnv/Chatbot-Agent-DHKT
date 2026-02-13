import apiClient from "@/lib/api-client";

export interface ReplyMessageRequest {
  conversation_id: number;
  content: string;
  message_metadata: string;
}

export const messageService = {
  replyMessages: (data: ReplyMessageRequest) =>
    apiClient.post("/messages/reply", data),
};
