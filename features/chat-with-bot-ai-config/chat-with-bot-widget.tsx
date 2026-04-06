"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { IconMessageChatbot } from "@tabler/icons-react";
import { CornerRightDown, Layers, Sparkles } from "lucide-react";
import { useEffect } from "react";

/** Khớp `app/globals.css` — do `ai-configs/[aiconfigId]/page.tsx` gắn khi `activeFeature === "chat"`. */
export const CW_AI_CONFIG_CHAT_TAB_BODY_CLASS = "cw-ai-config-chat-tab-active";

const DEFAULT_WIDGET_SRC = `https://hau.telesip.vn/public/chatbot/chat-widget.js`;

export interface ChatWithBotWidgetProps {
  aiConfigId: number;
  apiBaseUrl: string;
  /** Tuỳ chỉnh URL file widget (mặc định env hoặc Telesip). */
  scriptSrc?: string;
}

/**
 * Chỉ nhúng widget chat qua &lt;script&gt; (cùng data-* như file HTML / widget.js).
 * Bubble chat hiển thị cố định trên trang; script toàn cục chỉ khởi tạo một lần.
 */
export function ChatWithBotWidget({
  aiConfigId,
  apiBaseUrl,
  scriptSrc = process.env.NEXT_PUBLIC_CHAT_WIDGET_SCRIPT_URL ??
    DEFAULT_WIDGET_SRC,
}: ChatWithBotWidgetProps) {
  useEffect(() => {
    if (!apiBaseUrl || typeof document === "undefined") return;

    const marker = `script[data-cw-dash="${aiConfigId}"]`;
    if (document.querySelector(marker)) return;

    const s = document.createElement("script");
    s.src = scriptSrc;
    s.async = true;
    s.dataset.cwDash = String(aiConfigId);
    s.setAttribute("data-api-base-url", apiBaseUrl);
    s.setAttribute("data-faq-ai-config-id", String(aiConfigId));
    s.setAttribute("data-faq-suggestions-limit", "6");
    document.body.appendChild(s);
  }, [aiConfigId, apiBaseUrl, scriptSrc]);

  if (!apiBaseUrl) {
    return (
      <p className="text-destructive text-sm">
        Thiếu{" "}
        <code className="rounded bg-muted px-1">NEXT_PUBLIC_API_BASE_URL</code>.
      </p>
    );
  }

  const tips = [
    {
      icon: CornerRightDown,
      text: "Biểu tượng trò chuyện nằm góc màn hình — giống trải nghiệm khi nhúng lên website.",
    },

    {
      icon: Sparkles,
      text: "Widget dùng FAQ & stream theo đúng cấu hình AI hiện tại.",
    },
  ] as const;

  return (
    <Card className="max-w-full h-full overflow-hidden border-primary/15 bg-linear-to-br from-primary/6 via-card to-card shadow-sm">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-2xl",
              "bg-linear-to-br from-sky-500/20 to-violet-500/15 text-primary",
              "ring-1 ring-primary/20",
            )}
          >
            <IconMessageChatbot className="size-7" stroke={1.5} />
          </div>
          <div className="min-w-0 space-y-1.5 pt-0.5">
            <CardTitle className="text-lg tracking-tight">
              Xem trước widget chat
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              Script widget đã được tải — bạn đang thử giao diện đúng như người
              dùng cuối nhìn thấy.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 border-t border-border/60 bg-muted/20 px-6 pt-5 pb-6">
        <p className="text-foreground/90 text-xs font-medium uppercase tracking-wide">
          Mẹo nhanh
        </p>
        <ul className="space-y-3">
          {tips.map(({ icon: Icon, text }) => (
            <li key={text} className="flex gap-3 text-sm leading-snug">
              <div
                className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-background text-primary shadow-xs ring-1 ring-border/80"
                aria-hidden
              >
                <Icon className="size-4" />
              </div>
              <span className="text-muted-foreground pt-1">{text}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
