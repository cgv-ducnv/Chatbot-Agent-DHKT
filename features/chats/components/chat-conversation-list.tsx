"use client";

import {
  AlertCircle,
  Filter,
  Hash,
  MoreVertical,
  Pin,
  Search,
  Settings,
  UserPlus,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { ChatConversation, ChatUser } from "../utils/types";
import { useChat } from "../utils/use-chat";
import { useUpdateConversation } from "@/hooks/conversations/use-conversations";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { convertDateTime } from "@/utils/convert-time";

interface ChatConversationItemProps {
  conversation: ChatConversation;
  selectedConversation: string | null;
  onSelectConversation: (conversationId: string) => void;
}

function ChatConversationItem({
  conversation,
  selectedConversation,
  onSelectConversation,
}: ChatConversationItemProps) {
  const updateConversation = useUpdateConversation();

  // const isActive = conversation.status === "active";
  const hasUnread = conversation.unreadCount > 0;
  const isSelected = selectedConversation === conversation.id;

  const hasBeenOpenedRef = useRef(false);
  const [hideDot, setHideDot] = useState(false);
  useEffect(() => {
    if (isSelected && !hasBeenOpenedRef.current) {
      hasBeenOpenedRef.current = true; // đánh dấu đã mở
      setHideDot(true); // ẩn dot
    }
  }, [isSelected]);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative flex items-start gap-3 p-3.5 cursor-pointer transition-all duration-300",
        "border border-transparent",
        isSelected
          ? "bg-primary/[0.08] border-primary/10 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.05)]"
          : "hover:bg-accent/40 hover:border-accent-foreground/5",
        hasUnread && !isSelected && "dark:bg-blue-900/10",
      )}
      onClick={() => onSelectConversation(conversation.id)}
    >
      {/* Selection Pillar */}
      {isSelected && (
        <motion.div
          layoutId="active-pillar"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}

      {/* Avatar Container */}
      <div className="relative shrink-0">
        <div
          className={cn(
            "rounded-full p-0.5 transition-transform duration-300 group-hover:scale-105",
            isSelected ? "bg-primary/20" : "bg-transparent",
          )}
        >
          <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
            <AvatarImage src={conversation.avatar} alt={conversation.name} />
            <AvatarFallback className="text-sm font-bold bg-linear-to-br from-primary/20 to-primary/5 text-primary">
              {conversation.type === "group" ? (
                <Users className="size-5" />
              ) : (
                conversation.name.slice(0, 3).toUpperCase()
              )}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Status Dot dưới Avatar */}
        <div className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center">
          {conversation.unreadCount === 1 && !hideDot && (
            <span className="relative flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-4 w-4 rounded-full bg-green-500 border-2 border-background shadow-sm" />
            </span>
          )}
        </div>
      </div>

      {/* Main Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          {/* Left: name + last message */}
          <div className="min-w-0 flex-1 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h3
                className={cn(
                  "font-semibold text-sm truncate leading-none transition-colors",
                  isSelected ? "text-primary" : "text-foreground",
                  hasUnread && "font-bold",
                )}
              >
                {conversation.name}
              </h3>
              {conversation.ai_active && (
                <span className="inline-flex items-center rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-medium px-2 py-0.5">
                  Bot
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <p className="mt-1 text-xs text-muted-foreground/80 truncate">
                <span className="text-[11px] font-medium text-muted-foreground/70 tabular-nums whitespace-nowrap">
                  Tạo lúc:{" "}
                  {convertDateTime(conversation.created_at, "short").datetime}
                </span>{" "}
              </p>
              <div className="h-4 text-[10px] font-semibold leading-none rounded-full">
                Có{" "}
                <span className="font-bold text-blue-600">
                  {conversation.message_count}
                </span>{" "}
                tin nhắn
              </div>
            </div>
          </div>

          {/* Right: time + unread badge */}
          {/* <div className="flex flex-col items-end gap-1 shrink-0 ">
            {hasUnread && (
              <span className="inline-flex min-w-[16px] h-[16px] items-center justify-center rounded-full bg-red-500 text-sm font-semibold text-white">
                {conversation.unreadCount}
              </span>
            )}
          </div> */}
        </div>
      </div>

      {/* Floating Action (Switch) */}
      <div
        className="self-center ml-2 flex flex-col items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Switch */}
        <div
          className="flex flex-col items-center cursor-pointer"
          title={conversation.ai_active ? "Bot mode" : "Manual mode"}
        >
          <Switch
            checked={conversation.ai_active}
            onCheckedChange={(checked) => {
              updateConversation.mutate({
                id: Number(conversation.id),
                data: { ai_active: checked },
              });
            }}
            className="h-4 w-8 data-[state=checked]:bg-blue-600"
          />
        </div>

        {/* Icons + Badge (reserved for future actions) */}
        <div className="flex items-center gap-2" />
      </div>
    </motion.div>
  );
}

interface ConversationListProps {
  conversations: ChatConversation[];
  users: ChatUser[];
  selectedConversation: string | null;
  onSelectConversation: (conversationId: string) => void;
}

export function ChatConversationList({
  conversations,
  users,
  selectedConversation,
  onSelectConversation,
}: ConversationListProps) {
  const { searchQuery, setSearchQuery } = useChat();

  const filteredConversations = conversations.filter((conversation) =>
    conversation.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const sortedConversations = filteredConversations.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    return (
      new Date(b.lastMessage.timestamp).getTime() -
      new Date(a.lastMessage.timestamp).getTime()
    );
  });

  return (
    <div className="flex flex-col h-full">
      <div className="hidden lg:flex items-center justify-between h-16 px-4 border-b shrink-0">
        <h2 className="text-lg font-semibold">Danh sách trò chuyện</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 cursor-pointer"
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="cursor-pointer">
              <UserPlus className="size-4 mr-2" />
              New Chat
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Filter className="size-4 mr-2" />
              Filter Messages
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="size-4 mr-2" />
              Chat Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 cursor-text"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 h-0 min-h-0">
        <div>
          {sortedConversations.map((conversation) => (
            <ChatConversationItem
              key={conversation.id}
              conversation={conversation}
              selectedConversation={selectedConversation}
              onSelectConversation={onSelectConversation}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
