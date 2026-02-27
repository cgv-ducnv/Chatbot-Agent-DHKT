"use client";

import { format, isToday, isYesterday } from "date-fns";
import {
  ArrowDown,
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

export interface MessageListProps {
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
    case "user":
      return "bg-green-500";
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
    case "user":
      return {
        label: "User",
        color:
          "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      };
    default:
      return null;
  }
};

const getUserName = (message: ChatMessage) => {
  if (message.user?.fullname) return message.user.fullname;
  if (message.user?.username) return message.user.username;
  if (message.user?.email) return message.user.email;

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
      return format(date, "hh:mm a");
    } else if (isYesterday(date)) {
      return `Hôm qua, ${format(date, "hh:mm a")}`;
    } else if (date.getFullYear() === new Date().getFullYear()) {
      return format(date, "dd/MM, hh:mm a");
    } else {
      return format(date, "dd/MM/yyyy, hh:mm a");
    }
  };

  // Generate senderKey from message
  const getSenderKey = (message: ChatMessage) => {
    if (message.role === "bot") return "bot";
    if (message.user?.id) return `${message.role}-${message.user.id}`;
    return message.role ?? "anonymous";
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
    } else if (date.getFullYear() === new Date().getFullYear()) {
      return format(date, "dd/MM");
    } else {
      return format(date, "dd/MM/yyyy");
    }
  };

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setShouldAutoScroll(true);
  }, []);

  const messageGroups = groupMessagesByDay(messages);
  return (
    <div className="relative flex-1 h-full overflow-hidden">
      <ScrollArea
        className="h-full overflow-auto [overflow-anchor:none]"
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
                        "flex-1 max-w-[75%] flex flex-col",
                        isRightSide ? "items-end" : "items-start",
                      )}
                    >
                      {showName && (
                        <div
                          className={cn(
                            "mb-1 px-1",
                            isRightSide && "text-right",
                          )}
                        >
                          <div
                            className={cn(
                              "flex items-center gap-1.5",
                              isRightSide && "flex-row-reverse",
                            )}
                          >
                            <span className="text-xs font-semibold text-foreground/80">
                              {userName}
                            </span>
                            {roleBadge && (
                              <span
                                className={cn(
                                  "text-[10px] font-medium px-1.5 py-0.5 rounded-full leading-none",
                                  roleBadge.color,
                                )}
                              >
                                {roleBadge.label}
                              </span>
                            )}
                          </div>
                          {message.role === "user" &&
                            (message.user?.sdt || message.user?.email) && (
                              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70 mt-0.5">
                                {message.user.email && (
                                  <span>{message.user.email}</span>
                                )}
                                {message.user.sdt && message.user.email && (
                                  <span>·</span>
                                )}
                                {message.user.sdt && (
                                  <span>{message.user.sdt}</span>
                                )}
                              </div>
                            )}
                        </div>
                      )}

                      <div className="relative group/message flex items-center gap-1">
                        <div
                          className={cn(
                            "rounded-2xl px-3.5 py-2 text-sm leading-relaxed w-fit max-w-full",
                            message.role === "bot" ||
                              message.role === "customer"
                              ? "bg-primary/10 dark:bg-primary/15 border border-primary/20 text-foreground rounded-br-sm"
                              : message.role === "user"
                                ? "bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-foreground rounded-bl-sm"
                                : message.role === "staff"
                                  ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-foreground rounded-bl-sm"
                                  : "bg-muted text-foreground rounded-bl-sm",
                          )}
                        >
                          <p className="wrap-break-word whitespace-pre-wrap">
                            {message.content}
                          </p>

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
                        </div>

                        <div
                          className={cn(
                            "opacity-0 group-hover/message:opacity-100 transition-opacity shrink-0",
                            isRightSide && "order-first",
                          )}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-6 rounded-full text-muted-foreground/50 hover:text-foreground hover:bg-muted"
                              >
                                <MoreVertical className="size-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align={isRightSide ? "start" : "end"}
                            >
                              <DropdownMenuItem className="cursor-pointer">
                                <Reply className="size-4" />
                                Phản hồi
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <Copy className="size-4" />
                                Sao chép
                              </DropdownMenuItem>
                              {message.role === "staff" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                                    <Trash2 className="size-4" />
                                    Xóa
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {message.reactions.length > 0 && (
                        <div
                          className={cn(
                            "flex gap-1 mt-1 px-1",
                            isRightSide && "justify-end",
                          )}
                        >
                          {message.reactions.map((reaction, idx) => (
                            <button
                              type="button"
                              key={idx}
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] border bg-background/80 backdrop-blur-sm hover:bg-muted transition-colors"
                            >
                              <span>{reaction.emoji}</span>
                              <span className="text-muted-foreground">
                                {reaction.count}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      <div
                        className={cn(
                          "flex items-center gap-1 mt-0.5 px-1 text-[10px] text-muted-foreground/60",
                          isRightSide && "flex-row-reverse",
                        )}
                      >
                        <span>{formatMessageTime(message.timestamp)}</span>
                        {message.isEdited && (
                          <span className="italic">(đã sửa)</span>
                        )}
                        {message.role === "staff" && (
                          <CheckCheck className="size-3" />
                        )}
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

      {!shouldAutoScroll && (
        <Button
          variant="secondary"
          size="icon"
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 z-20 size-9 rounded-full shadow-lg border bg-background/90 backdrop-blur-sm hover:bg-background text-muted-foreground hover:text-foreground transition-all"
        >
          <ArrowDown className="size-4" />
        </Button>
      )}
    </div>
  );
}
