"use client";

import { Card, CardContent } from "@/components/ui/card";
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
    <div className="space-y-4 h-full">
      <h2 className="text-lg font-semibold">Tính năng</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {AI_CONFIG_FEATURES.map((feature, index) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className={`cursor-pointer h-full border hover:border-primary/60 transition-all shadow-none ${
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
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${feature.bgColor} ${feature.color}`}
                  >
                    <feature.icon className="size-5" />
                  </div>
                  <span className="font-medium text-sm group-hover:text-primary transition-colors">
                    {feature.title}
                  </span>
                </div>
                <ChevronRight
                  className={`size-4 text-muted-foreground/50 transition-transform duration-300 ${
                    activeFeature === feature.id ? "rotate-90 text-primary" : ""
                  }`}
                />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
