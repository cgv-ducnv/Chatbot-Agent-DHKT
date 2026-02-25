"use client";

import { Menu, X, Bot } from "lucide-react";
import { useEffect, useState, useMemo, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { ChatConversation, ChatMessage, ChatUser } from "../utils/types";
import { useChat } from "../utils/use-chat";
import { ChatConversationList } from "./chat-conversation-list";
import { ChatHeader } from "./chat-header";
import { MessageInput } from "./message-input";
import { MessageList } from "./message-list";
import { useGetConversationByIdInfinite } from "@/hooks/conversations/use-conversations";
import { useReplyMessage } from "@/hooks/messages/use-messages";
import { useSocket } from "@/contexts/socket-context";
import { EmptyData } from "@/components/empty-data";

interface ChatProps {
  conversations: ChatConversation[];
  messages: Record<string, ChatMessage[]>;
  users: ChatUser[];
}

export function Chat({ conversations, messages, users }: ChatProps) {
  const chatStore = useChat();
  const {
    selectedConversation,
    setSelectedConversation,
    setConversations,
    setMessages,
    setUsers,
    addMessage,
    toggleMute,
  } = chatStore;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [realtimeMessages, setRealtimeMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isBotResponding, setIsBotResponding] = useState(false);

  // WebSocket connection
  const { socket, isConnected } = useSocket();

  // Reply message mutation
  const replyMutation = useReplyMessage();

  // Fetch messages for the selected conversation
  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    fetchNextPage,
    hasNextPage,
    refetch,
    isFetchingNextPage,
  } = useGetConversationByIdInfinite(
    selectedConversation ? Number(selectedConversation) : 0,
  );

  // Transform API messages to ChatMessage format
  const apiMessages: ChatMessage[] = useMemo(() => {
    if (!messagesData?.pages) return [];

    return messagesData.pages
      .flatMap((page) => {
        const messages = (page as any).data.data.messages || [];

        return messages.map((msg: any) => {
          // Generate senderKey from role and user
          const senderKey =
            msg.role === "bot"
              ? "bot"
              : msg.user?.id
                ? `user-${msg.user.id}`
                : "anonymous";

          return {
            id: String(msg.id),
            content: msg.content,
            timestamp: msg.created_at,
            senderId: senderKey, // Use generated senderKey
            type: "text" as const,
            isEdited: false,
            reactions: [],
            replyTo: null,
            role: msg.role as "bot" | "customer" | "staff",
            user: msg.user,
            contact_id: msg.contact_id,
          };
        });
      })
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
  }, [messagesData]);

  const currentConversation = conversations.find(
    (conv) => conv.id === selectedConversation,
  );

  // Debug: Log contact changes
  // useEffect(() => {
  //   const contactId = apiMessages[0]?.contact_id;
  //   console.log("[Chat Debug] Contact Context Changed:", {
  //     conversationId: selectedConversation,
  //     contactId: contactId || "Not found in messages",
  //     totalMessages: apiMessages.length,
  //     conversationName: currentConversation?.name,
  //   });
  // }, [selectedConversation, apiMessages, currentConversation]);

  // WebSocket event handlers
  useEffect(() => {
    if (!socket || !isConnected || !selectedConversation) return;

    // 1. Luôn join room theo conversation_id (để nhận tin nhắn khi chưa có contact_id)
    const conversationRoom = `conversation_${selectedConversation}`;
    socket.emit("join_room", { room: conversationRoom });

    // 2. Nếu đã có contact_id thì join thêm room theo contact_id
    // Ưu tiên lấy contact_id từ currentConversation (được truyền từ props hoặc update từ list)
    // Nếu không có trong conversation, mới fallback sang apiMessages
    const contactId =
      currentConversation?.contact_id || apiMessages[0]?.contact_id;
    const contactRoom = contactId ? `contact_${contactId}` : null;

    if (contactRoom) {
      socket.emit("join_room", { room: contactRoom });
    }

    // Listen for staff messages (backend emits "staff_message")
    const handleStaffMessage = (data: any) => {
      // console.log("Raw Payload:", data);

      const msgContactId = data.contact_id ? Number(data.contact_id) : null;
      const msgConvId = data.conversation_id
        ? String(data.conversation_id)
        : null;
      const currentContactId = contactId ? Number(contactId) : null;

      // Check if message belongs to current conversation context
      // Logic mới: So khớp hoặc theo conversation_id HOẶC theo contact_id
      const matchesConversation =
        String(msgConvId) === selectedConversation ||
        (currentContactId && msgContactId === currentContactId);

      if (matchesConversation) {
        const newMessage: ChatMessage = {
          id: String(data.id),
          content: data.content,
          timestamp: data.created_at,
          senderId:
            data.role === "bot"
              ? "bot"
              : `user-${data.user?.id || "anonymous"}`,
          type: "text" as const,
          isEdited: false,
          reactions: [],
          replyTo: null,
          role: data.role as "bot" | "customer" | "staff",
          user: data.user,
          contact_id: data.contact_id,
        };

        // Check if message already exists (avoid duplicates)
        setRealtimeMessages((prev) => {
          const exists = prev.some((msg) => msg.id === newMessage.id);
          if (exists) {
            return prev;
          }
          return [...prev, newMessage];
        });

        if (data.role === "bot") {
          setIsBotResponding(false); // Bot finished responding
        } else if (data.role === "customer" || data.role === "user") {
          if (currentConversation?.ai_active) {
            setIsBotResponding(true); // User sent message, Bot starts responding
          }
        }
      }
    };

    // Listen for typing indicator
    const handleUserTyping = (data: any) => {
      const msgContactId = data.contact_id ? Number(data.contact_id) : null;
      const currentContactId = contactId ? Number(contactId) : null;

      if (currentContactId && msgContactId === currentContactId) {
        setIsTyping(!!data.is_typing);
      }
    };

    // Listen for correct event name from backend
    socket.on("staff_message", handleStaffMessage);
    socket.on("new_message", handleStaffMessage);
    socket.on("user_message", handleStaffMessage);
    socket.on("bot_message", handleStaffMessage);
    socket.on("message", handleStaffMessage);
    socket.on("user_typing", handleUserTyping);

    return () => {
      // Leave rooms when unmounting or changing conversation
      // console.log(`[Socket] Leaving rooms`);
      socket.emit("leave_room", { room: conversationRoom });
      if (contactRoom) {
        socket.emit("leave_room", { room: contactRoom });
      }

      socket.offAny();

      socket.off("staff_message", handleStaffMessage);
      socket.off("new_message", handleStaffMessage);
      socket.off("user_message", handleStaffMessage);
      socket.off("bot_message", handleStaffMessage);
      socket.off("message", handleStaffMessage);
      socket.off("user_typing", handleUserTyping);
    };
  }, [
    socket,
    isConnected,
    selectedConversation,
    apiMessages,
    currentConversation,
  ]);

  // Reset realtime messages when conversation changes
  useEffect(() => {
    setRealtimeMessages([]);
    setIsTyping(false);
    setIsBotResponding(false);
  }, [selectedConversation]);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined" ? window.innerWidth : 0 >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  useEffect(() => {
    setConversations(conversations);
    setUsers(users);

    Object.entries(messages).forEach(
      ([conversationId, conversationMessages]) => {
        setMessages(conversationId, conversationMessages);
      },
    );

    if (!selectedConversation && conversations.length > 0) {
      setSelectedConversation(conversations[0].id);
    }
  }, [
    conversations,
    messages,
    users,
    selectedConversation,
    setConversations,
    setMessages,
    setUsers,
    setSelectedConversation,
  ]);

  // Combine API messages with realtime messages and deduplicate
  const currentMessages = useMemo(() => {
    if (!selectedConversation) return [];

    const combined = [...apiMessages, ...realtimeMessages];
    const uniqueMap = new Map();

    combined.forEach((msg) => {
      if (!uniqueMap.has(msg.id)) {
        uniqueMap.set(msg.id, msg);
      }
    });

    return Array.from(uniqueMap.values()).sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  }, [selectedConversation, apiMessages, realtimeMessages]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!selectedConversation) return;

      try {
        // Send message via API and get the response
        const response = await replyMutation.mutateAsync({
          conversation_id: Number(selectedConversation),
          content,
          message_metadata: JSON.stringify({}),
        });

        // Extract message data from response
        const responseData = (response as any)?.data?.data;

        if (responseData) {
          // Add the sent message optimistically to realtime messages
          const newMessage: ChatMessage = {
            id: String(responseData.id),
            content: responseData.content,
            timestamp: responseData.created_at,
            senderId: responseData.user?.id
              ? `user-${responseData.user.id}`
              : "staff",
            type: "text" as const,
            isEdited: false,
            reactions: [],
            replyTo: null,
            role: responseData.role as "bot" | "customer" | "staff",
            user: responseData.user,
            contact_id: responseData.contact_id,
          };

          // console.log(
          //   "[handleSendMessage] Adding optimistic message:",
          //   newMessage,
          // );

          setRealtimeMessages((prev) => {
            const exists = prev.some((msg) => msg.id === newMessage.id);
            if (exists) return prev;
            return [...prev, newMessage];
          });

          // Update conversation list to remove unread alert and update last message
          // Move conversation to top and clear unread count
          setConversations(
            conversations.map((c) => {
              if (c.id === selectedConversation) {
                return {
                  ...c,
                  unreadCount: 0,
                  lastMessage: {
                    id: String(responseData.id),
                    content: responseData.content,
                    timestamp: responseData.created_at,
                    senderId: "staff",
                  },
                };
              }
              return c;
            }),
          );
        } else {
          console.warn("[handleSendMessage] No data in response:", response);
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    },
    [selectedConversation, replyMutation],
  );

  const handleToggleMute = () => {
    if (selectedConversation) {
      toggleMute(selectedConversation);
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="h-[calc(95vh-180px)] min-h-[500px] flex rounded-xl border shadow-sm overflow-hidden bg-background">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div
          className={`
          w-100 border-r bg-background shrink-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          lg:relative lg:block
          fixed inset-y-0 left-0 z-50
          transition-transform duration-300 ease-in-out
        `}
        >
          <div className="lg:hidden p-4 border-b flex items-center justify-between bg-background">
            <h2 className="text-lg font-semibold">Messages</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(false)}
              className="cursor-pointer"
            >
              <X className="size-4" />
            </Button>
          </div>

          <ChatConversationList
            users={users}
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={(id: string) => {
              setSelectedConversation(id);
              setIsSidebarOpen(false);
            }}
          />
        </div>

        <div className="flex-1 flex flex-col min-w-0 bg-background">
          <div className="flex items-center h-16 px-4 border-b bg-background">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(true)}
              className="cursor-pointer lg:hidden mr-2"
            >
              <Menu className="size-4" />
            </Button>

            <div className="flex-1">
              <ChatHeader
                conversation={currentConversation || null}
                users={users}
                onToggleMute={handleToggleMute}
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            {selectedConversation ? (
              <>
                {isLoadingMessages ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Đang tải tin nhắn...
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {currentMessages.length > 0 ? (
                      <MessageList
                        key={selectedConversation}
                        messages={currentMessages}
                        isTyping={
                          isTyping ||
                          (isBotResponding && !!currentConversation?.ai_active)
                        }
                        isTypingRight={
                          isBotResponding && !!currentConversation?.ai_active
                        }
                        typingRole={
                          isBotResponding && !!currentConversation?.ai_active
                            ? "bot"
                            : undefined
                        }
                        typingText={
                          isBotResponding &&
                          !!currentConversation?.ai_active ? (
                            <div className="flex items-center gap-2 mb-1 flex-row-reverse">
                              <span className="text-sm font-semibold text-foreground">
                                Bot đang phản hồi...
                              </span>
                            </div>
                          ) : undefined
                        }
                        loadMore={() => fetchNextPage()}
                        hasMore={!!hasNextPage}
                        isLoadingMore={isFetchingNextPage}
                        conversationId={selectedConversation}
                      />
                    ) : (
                      <EmptyData
                        title="Chưa có tin nhắn"
                        description="Bắt đầu trò chuyện để kết nối với khách hàng."
                        icon={Bot}
                      />
                    )}

                    <MessageInput
                      onSendMessage={handleSendMessage}
                      placeholder={`Nhập tin nhắn...`}
                      contactId={Number(currentConversation?.id)}
                    />
                  </>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">
                    Welcome to Chat
                  </h3>
                  <p className="text-muted-foreground">
                    Select a conversation to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
