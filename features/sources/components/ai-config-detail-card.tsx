"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LANGUAGE_OPTIONS } from "@/constants/language";
import type { AIConfig } from "@/services/ai-config/services";
import { convertDateTime } from "@/utils/convert-time";
import {
  IconBrain,
  IconCalendar,
  IconEdit,
  IconLanguage,
  IconRobot,
} from "@tabler/icons-react";
import ReactCountryFlag from "react-country-flag";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

interface AIConfigDetailCardProps {
  config: AIConfig | null;
  isLoading?: boolean;
  onEdit?: (config: AIConfig) => void;
}

export function AIConfigDetailCard({
  config,
  isLoading,
  onEdit,
}: AIConfigDetailCardProps) {
  if (isLoading) {
    return <AIConfigDetailCardSkeleton />;
  }

  if (!config) {
    return (
      <Card className="flex h-full min-h-0 flex-col">
        <CardContent className="flex flex-1 items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">
            Không tìm thấy thông tin cấu hình AI
          </p>
        </CardContent>
      </Card>
    );
  }

  const languageOption = LANGUAGE_OPTIONS.find(
    (opt) => opt.value === config.language,
  );

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden">
      {/* Compact Header */}
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg">
              <DotLottieReact
                src="/Ai-powered-marketing-tools-abstract.lottie"
                loop
                autoplay
                style={{ width: "100%", height: "100%" }}
              />
            </div>
            <div className="min-w-0">
              <CardTitle className="truncate text-lg">{config.name}</CardTitle>
              {config.description && (
                <p className="truncate text-sm text-muted-foreground">
                  {config.description}
                </p>
              )}
            </div>
          </div>
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => onEdit(config)}
            >
              <IconEdit className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0 flex-1">
        {/* Info Row - Horizontal layout for compact display */}
        <div className="flex flex-col gap-4 text-sm">
          <div className="flex items-center gap-4 justify-between">
            <div className="flex items-center gap-2">
              <IconBrain className="h-4 w-4 text-blue-500" />
              <span className="text-muted-foreground">Model:</span>
              <span className="font-medium">{config.model_name}</span>
            </div>

            <div className="flex items-center gap-2">
              <IconLanguage className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">Ngôn ngữ:</span>
              <div className="flex items-center gap-1.5">
                {languageOption && (
                  <ReactCountryFlag
                    countryCode={languageOption.countryCode}
                    svg
                    style={{ width: "1em", height: "1em" }}
                  />
                )}
                <span className="font-medium">
                  {languageOption?.label || config.language}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <IconCalendar className="h-4 w-4 text-orange-500" />
            <span className="text-muted-foreground">Thời gian tạo:</span>
            <span className="font-medium">
              {convertDateTime(config.created_at, "short").datetime}
            </span>
          </div>
        </div>

        {/* Prompt Section - Minimal */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Prompt</span>
            <Badge variant="outline" className="text-xs">
              {config.prompt?.length || 0} ký tự
            </Badge>
          </div>
          <div className="max-h-48 overflow-y-auto rounded-md border bg-muted/30 p-3">
            <pre className="whitespace-pre-wrap text-xs leading-relaxed text-foreground/80">
              {config.prompt || "Chưa có prompt được cấu hình"}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AIConfigDetailCardSkeleton() {
  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-24 w-full rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}
