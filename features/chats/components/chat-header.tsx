"use client";

import { useState } from "react";
import {
  Bell,
  BellOff,
  Info,
  Mail,
  MoreVertical,
  Phone,
  Users,
  Video,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import type { ChatConversation, ChatUser } from "../utils/types";
import { toast } from "sonner";

interface ChatHeaderProps {
  conversation: ChatConversation | null;
  users: ChatUser[];
  phoneNumber?: string | null;
  emailAddress?: string | null;
  onToggleMute?: () => void;
  onToggleInfo?: () => void;
}

export function ChatHeader({
  conversation,
  users,
  phoneNumber,
  emailAddress,
  onToggleMute,
  onToggleInfo,
}: ChatHeaderProps) {
  const router = useRouter();
  const [isEmailHelpOpen, setIsEmailHelpOpen] = useState(false);

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">
          Chọn một trò chuyện để bắt đầu trò chuyện
        </p>
      </div>
    );
  }
  console.log(conversation);
  console.log(users);
  console.log(phoneNumber);
  console.log(emailAddress);
  return (
    <div className="flex items-center justify-between h-full">
      {/* Left side - Avatar and info */}
      <div className="flex items-center gap-3">
        <Avatar className="size-10 cursor-pointer">
          <AvatarImage src={conversation.avatar} alt={conversation.name} />
          <AvatarFallback>
            {conversation.type === "group" ? (
              <Users className="size-5" />
            ) : (
              conversation.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2)
            )}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold truncate">{conversation.name}</h2>
            {conversation.isMuted && (
              <BellOff className="size-4 text-muted-foreground" />
            )}
            {/* {conversation.type === "group" && (
              <Badge variant="secondary" className="text-xs cursor-pointer">
                Group
              </Badge>
            )} */}
          </div>
          {/* <p className={`text-sm ${getStatusColor()}`}>{getStatusText()}</p> */}
        </div>
      </div>

      {/* Right side - Action buttons */}
      <div className="flex items-center gap-1">
        <TooltipProvider>
          {/* Search */}
          {/* <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="cursor-pointer">
                <Search className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Tìm kiếm tin nhắn thoại</p>
            </TooltipContent>
          </Tooltip> */}

          {/* Phone call */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="cursor-pointer"
                onClick={() => {
                  if (phoneNumber) {
                    if (typeof window !== "undefined") {
                      window.location.href = `tel:${phoneNumber}`;
                    }
                  } else {
                    toast.error(
                      "Không tìm thấy số điện thoại khách hàng. Kiểm tra lại thông tin khách hàng hoặc kiểm tra lại quyền truy cập dữ liệu khách hàng của bạn",
                    );
                    return;
                  }
                }}
              >
                <Phone className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Cuộc gọi thoại</p>
            </TooltipContent>
          </Tooltip>

          {/* Email */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="cursor-pointer"
                onClick={() => {
                  if (!emailAddress) {
                    toast.error(
                      "Không tìm thấy email khách hàng. Kiểm tra lại thông tin khách hàng hoặc kiểm tra lại quyền truy cập dữ liệu khách hàng của bạn",
                    );
                    return;
                  }
                  setIsEmailHelpOpen(true);
                }}
              >
                <Mail className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Gửi email</p>
            </TooltipContent>
          </Tooltip>

          {/* Info */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleInfo}
                className="cursor-pointer"
              >
                <Info className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Thông tin trò chuyện</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* More options */}
        <DropdownMenu>
          {/* <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger> */}
          <DropdownMenuContent align="end">
            {/* <DropdownMenuItem onClick={onToggleMute} className="cursor-pointer">
              {conversation.isMuted ? (
                <>
                  <Bell className="size-4 mr-2" />
                  Bật tiếng trò chuyện
                </>
              ) : (
                <>
                  <BellOff className="size-4 mr-2" />
                  Tắt tiếng trò chuyện
                </>
              )}
            </DropdownMenuItem> */}
            {/* <DropdownMenuItem className="cursor-pointer">
              <Search className="size-4 mr-2" />
              Tìm kiếm tin nhắn
            </DropdownMenuItem> */}
            {/* {conversation.type === "group" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <Users className="size-4 mr-2" />
                  Quản lý thành viên
                </DropdownMenuItem>
              </>
            )} */}
            <DropdownMenuSeparator />
            {/* <DropdownMenuItem className="cursor-pointer text-destructive">
              Xóa trò chuyện
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Email help modal: hướng dẫn cấu hình ứng dụng mail và mở mailto */}
      <Dialog open={isEmailHelpOpen} onOpenChange={setIsEmailHelpOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Gửi email cho khách hàng
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2 text-sm">
            {emailAddress && (
              <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground break-all">
                <span className="font-medium text-foreground mr-1">Email:</span>
                {emailAddress}
              </div>
            )}

            <p>
              Hệ thống sẽ mở ứng dụng email mặc định trên máy của bạn thông qua
              liên kết <code>mailto:</code>.
            </p>

            <ul className="list-disc pl-4 space-y-1 text-xs text-muted-foreground">
              <li>
                Nếu không có ứng dụng nào mở, hãy kiểm tra phần{" "}
                <span className="font-medium">Settings &gt; Default apps</span>{" "}
                (hoặc Ứng dụng mặc định) của hệ điều hành.
              </li>
              <li>
                Đặt Gmail Desktop, Outlook, hoặc ứng dụng mail khác làm ứng dụng
                mặc định cho liên kết <code>mailto</code>.
              </li>
            </ul>
          </div>

          <DialogFooter className="mt-2 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => setIsEmailHelpOpen(false)}
            >
              Đóng
            </Button>
            <Button
              size="sm"
              className="cursor-pointer"
              onClick={() => {
                if (!emailAddress) {
                  router.push("/settings");
                  return;
                }
                if (typeof window !== "undefined") {
                  window.location.href = `mailto:${emailAddress}`;
                }
                setIsEmailHelpOpen(false);
              }}
            >
              Mở ứng dụng email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
