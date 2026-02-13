import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  messageService,
  ReplyMessageRequest,
} from "@/services/messages/services";

export const messageKeys = {
  all: ["messages"] as const,
  lists: () => [...messageKeys.all, "list"] as const,
  list: (params: any) => [...messageKeys.lists(), params] as const,
};

export const useReplyMessage = () => {
  return useMutation({
    mutationFn: (data: ReplyMessageRequest) =>
      messageService.replyMessages(data),
    // Don't invalidate queries - let WebSocket handle real-time updates
    // This prevents UI flickering from refetch
  });
};
