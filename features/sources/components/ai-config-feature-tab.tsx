"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  IconMessageChatbot,
  IconCode,
  IconQuestionMark,
  IconSourceCode,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

export const AI_CONFIG_FEATURES = [
  {
    id: "source",
    title: "Nguồn dữ liệu",
    description: "Quản lý dữ liệu knowledge base",
    icon: IconSourceCode,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/20",
  },
  {
    id: "faqs",
    title: "FAQs",
    description: "Câu hỏi thường gặp",
    icon: IconQuestionMark,
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-100 dark:bg-teal-900/20",
  },
  {
    id: "chat",
    title: "Chat với trợ lý ảo",
    description: "Tải script widget; rời tab thì ẩn bubble (CSS)",
    icon: IconMessageChatbot,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/20",
  },
  {
    id: "integration",
    title: "Mã nguồn tích hợp",
    description: "Tích hợp API vào ứng dụng",
    icon: IconCode,
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-100 dark:bg-pink-900/20",
  },
];

interface AIConfigFeatureTabProps {
  activeFeature: string | null;
  onFeatureChange: (featureId: string | null) => void;
}

export function AIConfigFeatureTab({
  activeFeature,
  onFeatureChange,
}: AIConfigFeatureTabProps) {
  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg">
              <DotLottieReact
                src="/Artificial-Intelligence-Chatbot.lottie"
                loop
                autoplay
                style={{ width: "100%", height: "100%" }}
              />
            </div>
            <div className="min-w-0">
              <CardTitle className="truncate text-lg">
                Danh sách tính năng
              </CardTitle>
              <p className="truncate text-sm text-muted-foreground">
                Chọn tính năng phù hợp với yêu cầu của bạn
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col min-h-0 pt-0">
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2 sm:content-start sm:auto-rows-fr">
          {AI_CONFIG_FEATURES.map((feature, index) => (
            <motion.div
              key={feature.id}
              className="flex min-h-0 min-w-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`flex h-full min-h-0 w-full cursor-pointer flex-col border transition-all shadow-none hover:border-primary/60 ${
                  activeFeature === feature.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border hover:bg-muted/30"
                }`}
                onClick={() => {
                  onFeatureChange(
                    activeFeature === feature.id ? null : feature.id,
                  );
                }}
              >
                <CardContent className="flex flex-1 items-center justify-between gap-2 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`shrink-0 rounded-lg p-2 ${feature.bgColor} ${feature.color}`}
                    >
                      <feature.icon className="size-5" />
                    </div>
                    <span className="truncate text-sm font-medium transition-colors group-hover:text-primary">
                      {feature.title}
                    </span>
                  </div>
                  <ChevronRight
                    className={`size-4 shrink-0 text-muted-foreground/50 transition-transform duration-300 ${
                      activeFeature === feature.id
                        ? "rotate-90 text-primary"
                        : ""
                    }`}
                  />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
