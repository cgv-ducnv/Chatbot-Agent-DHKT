"use client";

import { format, isToday, isYesterday } from "date-fns";
import {
  Bot,
  CheckCheck,
  Copy,
  MoreVertical,
  Reply,
  Trash2,
  User,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
} from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "../utils/types";
import { MessageAttachment } from "./message-attachment";

interface MessageListProps {
  messages: ChatMessage[];
  isTyping?: boolean;
  loadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  conversationId: string;
  typingText?: React.ReactNode;
  isTypingRight?: boolean;
  typingRole?: "bot" | "staff" | "customer";
  typingName?: string;
}

// Helper function to generate avatar color based on role
const getRoleColor = (role?: string) => {
  switch (role) {
    case "bot":
      return "bg-blue-500";
    case "staff":
      return "bg-green-500";
    case "customer":
      return "bg-blue-500";
    default:
      return "bg-gray-500";
  }
};

// Helper function to get role badge
const getRoleBadge = (role?: string) => {
  switch (role) {
    case "bot":
      return {
        label: "Bot",
        color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      };
    case "staff":
      return {
        label: "Staff",
        color:
          "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      };
    case "customer":
      return {
        label: "Customer",
        color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      };
    default:
      return null;
  }
};

// Generate initials from name
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

// Get display name from message with role fallback
const getUserName = (message: ChatMessage) => {
  // If user info exists, use it
  if (message.user?.fullname) return message.user.fullname;
  if (message.user?.username) return message.user.username;

  // Fallback to role-based names
  switch (message.role) {
    case "bot":
      return "AI Assistant";
    case "customer":
      return "Customer";
    case "staff":
      return "Staff";
    default:
      return "User";
  }
};

export function MessageList({
  messages,
  isTyping = false,
  loadMore,
  hasMore,
  isLoadingMore,
  conversationId,
  typingText = (
    <div className="flex items-center gap-2 mb-1">
      <span className="text-sm font-semibold text-foreground">
        Đang soạn tin...
      </span>
    </div>
  ),
  isTypingRight = false,
  typingRole,
  typingName,
}: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isInitialLoadRef = useRef(true);
  const previousConversationRef = useRef<string | null>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Refs for scroll position maintenance
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const prevScrollHeightRef = useRef<number>(0);
  const prevScrollTopRef = useRef<number>(0);
  const prevLoadingMoreRef = useRef<boolean>(false);
  const isLoadingHistoryRef = useRef<boolean>(false);

  // Reset state when conversation changes
  useEffect(() => {
    if (conversationId !== previousConversationRef.current) {
      isInitialLoadRef.current = true;
      previousConversationRef.current = conversationId;
      setShouldAutoScroll(true);
      isLoadingHistoryRef.current = false;
    }
  }, [conversationId]);

  // Handle scroll to load more
  const onScroll = useCallback(
    (e: Event) => {
      const target = e.target as HTMLElement;

      // Only enable logs if needed for deep debugging
      // console.log("[MessageList] Scroll event:", {
      //   scrollTop: target.scrollTop,
      //   scrollHeight: target.scrollHeight,
      //   clientHeight: target.clientHeight,
      //   hasMore,
      //   isLoadingMore,
      // });

      // If user scrolls up near top, try monitoring for load more
      if (target.scrollTop <= 50 && hasMore && !isLoadingMore) {
        // Mark that we are loading history
        isLoadingHistoryRef.current = true;

        // Save current scroll metrics before loading
        prevScrollHeightRef.current = target.scrollHeight;
        prevScrollTopRef.current = target.scrollTop;
        loadMore();
      }

      // Check if user is near bottom to enable auto-scroll for new messages
      // Only update this if we are NOT loading history/more messages
      if (!isLoadingMore && !isLoadingHistoryRef.current) {
        const isNearBottom =
          target.scrollHeight - target.scrollTop - target.clientHeight < 100;
        setShouldAutoScroll(isNearBottom);
      }
    },
    [hasMore, isLoadingMore, loadMore],
  );

  // Attach scroll listener to viewport manually since ScrollArea doesn't expose onScroll
  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    ) as HTMLElement;

    if (viewport) {
      scrollContainerRef.current = viewport;
      viewport.addEventListener("scroll", onScroll);
      return () => viewport.removeEventListener("scroll", onScroll);
    }
  }, [onScroll]);

  // Restore scroll position when loading finishes (isLoadingMore: true -> false)
  useLayoutEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    // Detect when loading just finished (transition from true -> false)
    const justFinishedLoading = prevLoadingMoreRef.current && !isLoadingMore;
    prevLoadingMoreRef.current = isLoadingMore;

    if (isInitialLoadRef.current) {
      // Initial load: scroll to bottom
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
      isInitialLoadRef.current = false;
      return;
    }

    // Only restore scroll when loading just finished
    if (justFinishedLoading) {
      const currentScrollHeight = scrollContainer.scrollHeight;

      // Check if we have saved scroll metrics (which means we triggered loadMore)
      if (
        prevScrollHeightRef.current > 0 &&
        currentScrollHeight > prevScrollHeightRef.current
      ) {
        // Messages were added to the top - restore scroll position
        const heightDifference =
          currentScrollHeight - prevScrollHeightRef.current;

        const newScrollTop = heightDifference + prevScrollTopRef.current;

        // Restore position - keep user at the same visual position
        scrollContainer.scrollTop = newScrollTop;

        // Explicitly set false to prevent auto-scrolling
        setShouldAutoScroll(false);

        // Reset refs
        prevScrollHeightRef.current = 0;
        prevScrollTopRef.current = 0;
      }

      // Finished handling history load
      isLoadingHistoryRef.current = false;
      return;
    }

    // Auto-scroll logic happens here
    // Note: Keeping messages in the dependency array to trigger auto-scroll when new messages arrive
    if (shouldAutoScroll && !isLoadingMore && !isLoadingHistoryRef.current) {
      // New message at bottom and user is near bottom - auto scroll
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isLoadingMore, shouldAutoScroll, messages]);

  // Auto-scroll when bot starts typing
  useEffect(() => {
    if (isTyping && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isTyping]);

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, "HH:mm");
    } else if (isYesterday(date)) {
      return `Hôm qua ${format(date, "HH:mm")}`;
    } else {
      return format(date, "MMM d, HH:mm");
    }
  };

  // Generate senderKey from message
  const getSenderKey = (message: ChatMessage) => {
    return message.role === "bot"
      ? "bot"
      : message.user?.id
        ? `user-${message.user.id}`
        : "anonymous";
  };

  const groupMessagesByDay = (msgs: ChatMessage[]) => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];

    msgs.forEach((message) => {
      const messageDate = format(new Date(message.timestamp), "yyyy-MM-dd");
      const lastGroup = groups[groups.length - 1];

      if (lastGroup && lastGroup.date === messageDate) {
        lastGroup.messages.push(message);
      } else {
        groups.push({
          date: messageDate,
          messages: [message],
        });
      }
    });

    return groups;
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return "Hôm nay";
    } else if (isYesterday(date)) {
      return "Hôm qua";
    } else {
      return format(date, "EEEE, MMMM d");
    }
  };

  const messageGroups = groupMessagesByDay(messages);

  return (
    <ScrollArea
      className="flex-1 h-full overflow-auto [overflow-anchor:none]"
      ref={scrollAreaRef}
    >
      <div className="space-y-4 py-4 px-4">
        {messageGroups.map((group) => (
          <div key={group.date}>
            <div className="flex items-center justify-center py-4">
              <div className="text-xs font-medium text-muted-foreground bg-muted/50 px-4 py-1.5 rounded-full">
                {formatDateHeader(group.date)}
              </div>
            </div>

            <div className="space-y-3">
              {group.messages.map((message, messageIndex) => {
                // Generate senderKey for this message
                const senderKey = getSenderKey(message);

                // Bot and Customer messages on the right, Staff on the left
                const isRightSide =
                  message.role === "bot" || message.role === "customer";

                // Check if should show avatar - compare with previous message in THIS group
                const prevMessage =
                  messageIndex > 0 ? group.messages[messageIndex - 1] : null;
                const prevSenderKey = prevMessage
                  ? getSenderKey(prevMessage)
                  : null;

                const showAvatar =
                  !prevSenderKey || prevSenderKey !== senderKey;
                const showName = !prevSenderKey || prevSenderKey !== senderKey;

                const roleBadge = getRoleBadge(message.role);
                const userName = getUserName(message);

                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3 group",
                      isRightSide && "flex-row-reverse",
                    )}
                  >
                    {/* Always render avatar placeholder to maintain consistent layout */}
                    <div className="w-9 shrink-0">
                      {showAvatar && (
                        <Avatar className="size-9 cursor-pointer border-2 border-background shadow-sm">
                          {message.role === "bot" ? (
                            <AvatarFallback
                              className={cn(
                                getRoleColor(message.role),
                                "text-white",
                              )}
                            >
                              <Bot className="size-5" />
                            </AvatarFallback>
                          ) : (
                            <AvatarFallback
                              className={cn(
                                "text-white text-xs font-medium bg-muted",
                              )}
                            >
                              <User className="size-5 text-muted-foreground" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                      )}
                    </div>

                    <div
                      className={cn(
                        "flex-1 max-w-[70%]",
                        isRightSide && "flex flex-col items-end",
                      )}
                    >
                      {showName && (
                        <div
                          className={cn(
                            "flex items-center gap-2 mb-1",
                            isRightSide && "flex-row-reverse",
                          )}
                        >
                          <span className="text-sm font-semibold text-foreground">
                            {userName}
                          </span>
                          {roleBadge && (
                            <span
                              className={cn(
                                "text-xs font-medium px-2 py-0.5 rounded-full",
                                roleBadge.color,
                              )}
                            >
                              {roleBadge.label}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="relative group/message">
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-2.5 text-sm break-words shadow-sm transition-all",
                            message.role === "bot"
                              ? "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100 rounded-br-md"
                              : message.role === "customer"
                                ? "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100 rounded-br-md"
                                : message.role === "staff"
                                  ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-900 dark:text-green-100 rounded-bl-md"
                                  : "bg-muted rounded-bl-md",
                          )}
                        >
                          <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/message:opacity-100 transition-opacity z-10">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-6 rounded-full hover:bg-background/50 text-muted-foreground hover:text-foreground"
                                >
                                  <MoreVertical className="size-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align={isRightSide ? "start" : "end"}
                              >
                                <DropdownMenuItem className="cursor-pointer">
                                  <Reply className="size-4" />
                                  Reply
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                  <Copy className="size-4" />
                                  Copy
                                </DropdownMenuItem>
                                {message.role === "staff" && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                                      <Trash2 className="size-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <p className="break-words">{message.content}</p>

                          {message.attachments &&
                            message.attachments.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {message.attachments.map((attachment) => (
                                  <MessageAttachment
                                    key={attachment.id}
                                    attachment={attachment}
                                    isOwnMessage={isRightSide}
                                  />
                                ))}
                              </div>
                            )}

                          {message.reactions.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {message.reactions.map((reaction, idx) => (
                                <div
                                  key={idx}
                                  className={cn(
                                    "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border cursor-pointer",
                                    "bg-background/90 backdrop-blur-sm shadow-sm",
                                  )}
                                >
                                  <span>{reaction.emoji}</span>
                                  <span className="text-muted-foreground">
                                    {reaction.count}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          <div
                            className={cn(
                              "flex items-center gap-1 mt-1 text-xs opacity-70",
                              isRightSide ? "justify-end" : "",
                            )}
                          >
                            <span>{formatMessageTime(message.timestamp)}</span>
                            {message.isEdited && (
                              <span className="italic">(edited)</span>
                            )}
                            {message.role === "staff" && (
                              <div className="flex">
                                <CheckCheck className="size-3" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div
            className={cn("flex gap-3", isTypingRight && "flex-row-reverse")}
          >
            <div className="w-9 shrink-0">
              <Avatar className="size-9 border-2 border-background shadow-sm">
                {typingRole === "bot" ? (
                  <AvatarFallback
                    className={cn(getRoleColor("bot"), "text-white")}
                  >
                    <Bot className="size-5" />
                  </AvatarFallback>
                ) : typingRole === "customer" ? (
                  <AvatarFallback
                    className={cn(
                      getRoleColor("customer"),
                      "text-white text-xs font-medium",
                    )}
                  >
                    <User className="size-5" />
                  </AvatarFallback>
                ) : (
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    <User className="size-5" />
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
            <div
              className={cn(
                "flex-1 max-w-[70%] flex flex-col",
                isTypingRight ? "items-end" : "items-start",
              )}
            >
              {typingText}
              <div
                className={cn(
                  "rounded-2xl px-4 py-2.5 text-sm bg-muted",
                  isTypingRight ? "rounded-br-md" : "rounded-bl-md",
                )}
              >
                <div className="flex gap-1 items-center">
                  <span
                    className="animate-bounce inline-block"
                    style={{ animationDelay: "0ms" }}
                  >
                    ●
                  </span>
                  <span
                    className="animate-bounce inline-block"
                    style={{ animationDelay: "150ms" }}
                  >
                    ●
                  </span>
                  <span
                    className="animate-bounce inline-block"
                    style={{ animationDelay: "300ms" }}
                  >
                    ●
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
