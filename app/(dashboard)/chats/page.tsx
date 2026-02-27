"use client";

import chatMessages from "@/constants/chat-messages.json";
import chatUsers from "@/constants/chat-users.json";
import { Chat } from "@/features/chats/components/chats";
import {
  ChatConversation,
  ChatMessage,
  ChatUser,
} from "@/features/chats/utils/types";
import { useChat } from "@/features/chats/utils/use-chat";
import { AppBreadcrumb } from "@/components/breadcrumb";
import { Home } from "lucide-react";
import { IconMessages } from "@tabler/icons-react";
import { useGetPrioritizedConversationsInfinite } from "@/hooks/conversations/use-conversations";
import { useMemo } from "react";

export default function ChatsPage() {
  const { searchQuery } = useChat();

  const { data, isLoading, isError } = useGetPrioritizedConversationsInfinite({
    page_size: 50,
    search: searchQuery || undefined,
  });

  // Transform API data to ChatConversation format
  const conversations: ChatConversation[] = useMemo(() => {
    if (!data?.pages) return [];

    // Flatten all pages and get conversations
    return data.pages.flatMap((page) => {
      const conversationsData = (page as any).data?.data?.conversations || [];

      return conversationsData.map((conv: any) => ({
        id: String(conv.id),
        type: "group" as const,
        participants: [], // Will be populated from messages/users
        name: conv.title,
        avatar: "", // Default avatar or generate from name
        lastMessage: {
          id: "",
          content: "",
          timestamp: conv.updated_at,
          senderId: "",
        },
        unreadCount: conv.unread_count || 0,
        isPinned: false,
        isMuted: false,
        // API fields
        status: conv.status || "active",
        ai_active: conv.ai_active || false,
        message_count: conv.message_count || 0,
        created_at: conv.created_at,
      }));
    });
  }, [data]);

  // Chỉ loading full-screen ở lần tải đầu tiên.
  // Khi search, giữ UI cũ để tránh nháy lại toàn bộ khung chat.
  if (isLoading && !data) {
    return (
      <>
        <div className="px-4 py-4 lg:px-6">
          <AppBreadcrumb
            items={[
              {
                label: "Dashboard",
                href: "/dashboard",
                icon: <Home className="size-4" />,
              },
              {
                label: "Cuộc trò chuyện",
                href: "/chats",
                icon: <IconMessages className="size-4" />,
              },
            ]}
          />
        </div>

        <div className="@container/main px-4 lg:px-6 space-y-6">
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">
                Đang tải cuộc trò chuyện...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <div className="px-4 py-4 lg:px-6">
          <AppBreadcrumb
            items={[
              {
                label: "Dashboard",
                href: "/dashboard",
                icon: <Home className="size-4" />,
              },
              {
                label: "Cuộc trò chuyện",
                href: "/chats",
                icon: <IconMessages className="size-4" />,
              },
            ]}
          />
        </div>

        <div className="@container/main px-4 lg:px-6 space-y-6">
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-center">
              <p className="text-destructive">Không thể tải cuộc trò chuyện</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="px-4 py-4 lg:px-6">
        <AppBreadcrumb
          items={[
            {
              label: "Dashboard",
              href: "/dashboard",
              icon: <Home className="size-4" />,
            },
            {
              label: "Cuộc trò chuyện",
              href: "/chats",
              icon: <IconMessages className="size-4" />,
            },
          ]}
        />
      </div>

      <div className="@container/main px-4 lg:px-6 space-y-6">
        <Chat
          conversations={conversations}
          messages={chatMessages as Record<string, ChatMessage[]>}
          users={chatUsers as ChatUser[]}
        />
      </div>
    </>
  );
}
