import chatConversations from "@/constants/chat-conversation.json";
import chatMessages from "@/constants/chat-messages.json";
import chatUsers from "@/constants/chat-users.json";
import { Chat } from "@/features/chats/components/chats";
import {
  ChatConversation,
  ChatMessage,
  ChatUser,
} from "@/features/chats/utils/types";
import { AppBreadcrumb } from "@/components/breadcrumb";
import { Home } from "lucide-react";
import { IconMessages } from "@tabler/icons-react";

export default function ChatsPage() {
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
          conversations={chatConversations as ChatConversation[]}
          messages={chatMessages as Record<string, ChatMessage[]>}
          users={chatUsers as ChatUser[]}
        />
      </div>
    </>
  );
}
