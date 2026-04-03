"use client";

import { CodeBlock } from "@/components/ui/codeblock";

const WIDGET_SCRIPT_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/public/chatbot/chat-widget.js`;

export interface CodeBlockWidgetChatProps {
  /** ID cấu hình AI (FAQ / widget) — khớp `data-faq-ai-config-id` */
  aiConfigId: number;
  /** Base URL API, ví dụ `https://hau.telesip.vn/api/v1` */
  apiBaseUrl: string;
}

function buildScriptSnippet(apiBaseUrl: string, aiConfigId: number) {
  return `<script
  src="${WIDGET_SCRIPT_URL}"
  data-api-base-url="${apiBaseUrl}"
  data-faq-ai-config-id="${aiConfigId}"
  data-faq-suggestions-limit="6"
></script>`;
}

function buildReactSnippet(apiBaseUrl: string, aiConfigId: number) {
  const apiLiteral = JSON.stringify(apiBaseUrl);
  const srcLiteral = JSON.stringify(WIDGET_SCRIPT_URL);

  return `'use client';

import { useEffect } from 'react';

const WIDGET_SRC = ${srcLiteral};

/**
 * Gắn widget chatbot (cùng cơ chế với thẻ <script> trong HTML).
 * Đặt trong layout hoặc trang cần hiển thị bubble chat.
 */
export function ChatbotWidgetEmbed() {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const existing = document.querySelector(
      'script[src="' + WIDGET_SRC + '"]',
    );
    if (existing) return;

    const script = document.createElement('script');
    script.src = WIDGET_SRC;
    script.async = true;
    script.setAttribute('data-api-base-url', ${apiLiteral});
    script.setAttribute('data-faq-ai-config-id', '${String(aiConfigId)}');
    script.setAttribute('data-faq-suggestions-limit', '6');
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return null;
}`;
}

export function CodeBlockWidgetChat({
  aiConfigId,
  apiBaseUrl,
}: CodeBlockWidgetChatProps) {
  const scriptCode = buildScriptSnippet(apiBaseUrl, aiConfigId);
  const reactCode = buildReactSnippet(apiBaseUrl, aiConfigId);

  return (
    <div className="space-y-3 w-full min-w-0">
      <div>
        <h3 className="text-base font-semibold">Mã nguồn tích hợp widget</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Chèn script vào HTML hoặc dùng component React.
        </p>
      </div>
      <CodeBlock
        language="html"
        filename="chat-widget-integration"
        breadcrumb={["Integration", "chat-widget"]}
        tabs={[
          {
            name: "script.js",
            language: "html",
            code: scriptCode,
          },
          {
            name: "index.tsx",
            language: "tsx",
            code: reactCode,
          },
        ]}
      />
    </div>
  );
}
