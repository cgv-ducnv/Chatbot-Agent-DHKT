"use client";

import {
  FileText,
  Image as ImageIcon,
  Mic,
  MoreHorizontal,
  Paperclip,
  Send,
  Smile,
} from "lucide-react";
import { useRef, useState } from "react";
import { useSocket } from "@/contexts/socket-context";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
  contactId?: number;
}

export function MessageInput({
  onSendMessage,
  disabled = false,
  placeholder = "Type a message...",
  contactId,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { socket } = useSocket();

  const handleSendMessage = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage);
      setMessage("");
      setIsTyping(false);

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Dynamic height adjustment
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }

    // Handle typing indicator emission
    if (socket && contactId) {
      // If just started typing or previously stopped
      if (value.trim() && !isTyping) {
        setIsTyping(true);
        socket.emit("staff_typing", {
          contact_id: contactId,
          is_typing: true,
        });
      }
      // If cleared input
      else if (!value.trim() && isTyping) {
        setIsTyping(false);
        socket.emit("staff_typing", {
          contact_id: contactId,
          is_typing: false,
        });
      }

      // Debounce stop typing
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (value.trim()) {
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          socket.emit("staff_typing", {
            contact_id: contactId,
            is_typing: false,
          });
        }, 1500);
      }
    } else {
      // Fallback local state logic if no socket/contactId
      if (value.trim() && !isTyping) {
        setIsTyping(true);
      } else if (!value.trim() && isTyping) {
        setIsTyping(false);
      }
    }
  };

  const handleFileUpload = (type: "image" | "file") => {
    console.log(`Upload ${type}`);
  };

  return (
    <div className="border-t p-4">
      <div className="flex items-end gap-2">
        <TooltipProvider>
          <DropdownMenu>
            <DropdownMenuContent side="top" align="start">
              <DropdownMenuItem
                onClick={() => handleFileUpload("image")}
                className="cursor-pointer"
              >
                <ImageIcon className="size-4 mr-2" />
                Photo or video
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleFileUpload("file")}
                className="cursor-pointer"
              >
                <FileText className="size-4 mr-2" />
                Document
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipProvider>

        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            placeholder={placeholder}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyPress}
            disabled={disabled}
            className={cn(
              "min-h-[40px] max-h-[120px] resize-none cursor-text disabled:cursor-not-allowed",
              "pr-20",
            )}
            rows={1}
          />
        </div>
      </div>
    </div>
  );
}
