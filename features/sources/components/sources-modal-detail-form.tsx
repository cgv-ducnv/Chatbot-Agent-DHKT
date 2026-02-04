"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X, FileIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { SourcesFormValues } from "../utils/schema";
import { useState, useEffect } from "react";

interface SourcesDetailFormProps {
  form: UseFormReturn<SourcesFormValues>;
  sourceType: string;
  onFilesChange?: (files: File[]) => void;
  isEditMode?: boolean;
}

// Map source type to file extension and display info
const fileTypeConfig: Record<
  string,
  { accept: string; icon: string; label: string; color: string }
> = {
  pdf: {
    accept: ".pdf",
    icon: "📕",
    label: "PDF Document",
    color: "text-red-600 dark:text-red-400",
  },
  docx: {
    accept: ".docx,.doc",
    icon: "📘",
    label: "Word Document",
    color: "text-blue-600 dark:text-blue-400",
  },
  txt: {
    accept: ".txt",
    icon: "📄",
    label: "Text File",
    color: "text-gray-600 dark:text-gray-400",
  },
  csv: {
    accept: ".csv",
    icon: "📊",
    label: "CSV Spreadsheet",
    color: "text-green-600 dark:text-green-400",
  },
  xlsx: {
    accept: ".xlsx,.xls",
    icon: "📗",
    label: "Excel Spreadsheet",
    color: "text-emerald-600 dark:text-emerald-400",
  },
  json: {
    accept: ".json",
    icon: "🔧",
    label: "JSON File",
    color: "text-orange-600 dark:text-orange-400",
  },
};

export function SourcesDetailForm({
  form,
  sourceType,
  onFilesChange,
  isEditMode = false,
}: SourcesDetailFormProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const config = fileTypeConfig[sourceType];

  // Clear files when source type changes
  useEffect(() => {
    if (!isEditMode) {
      setSelectedFiles([]);
      form.setValue("source_url", "");
      onFilesChange?.([]);
    }
  }, [sourceType, form, onFilesChange, isEditMode]);

  // Notify parent when files change
  useEffect(() => {
    onFilesChange?.(selectedFiles);
  }, [selectedFiles, onFilesChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setSelectedFiles(fileArray);

      // Set source_url to file name(s)
      const fileNames = fileArray.map((f) => f.name).join(", ");
      form.setValue("source_url", fileNames);
    }
  };

  const handleClearFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);

    // Update source_url
    const fileNames = newFiles.map((f) => f.name).join(", ");
    form.setValue("source_url", fileNames);

    // Reset input
    const input = document.getElementById("file-upload") as HTMLInputElement;
    if (input) {
      input.value = "";
    }
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
    form.setValue("source_url", "");
    const input = document.getElementById("file-upload") as HTMLInputElement;
    if (input) {
      input.value = "";
    }
  };

  if (!config) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <Upload className="size-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Chọn loại nguồn dữ liệu</p>
          <p className="text-sm mt-2">
            Chọn loại file bên trái để xem form upload
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pt-1">
      <div className="space-y-4">
        {/* Header */}
        <div className={`flex items-center gap-3 ${config.color} mb-4`}>
          <span className="text-2xl">{config.icon}</span>
          <h3 className="text-lg font-semibold">
            {isEditMode ? `File ${config.label}` : `Tải lên ${config.label}`}
          </h3>
        </div>

        {/* Edit Mode - Show existing file info */}
        {isEditMode ? (
          <div className="space-y-4">
            <div className="p-4 bg-accent/30 rounded-lg border">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{config.icon}</span>
                <div>
                  <p className="font-medium">
                    {form.getValues("source_url") || "Không có file"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Loại: {sourceType.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground italic">
              Không thể thay đổi file khi chỉnh sửa. Vui lòng tạo nguồn mới nếu
              cần sử dụng file khác.
            </p>
          </div>
        ) : (
          /* Create Mode - Show upload area */
          <>
            {/* Upload Area */}
            <div className="space-y-2">
              <Label>Chọn file {sourceType.toUpperCase()}</Label>
              <Label
                htmlFor="file-upload"
                className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-accent/50 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[180px]"
              >
                <span className="text-5xl mb-4">{config.icon}</span>
                <p className="text-sm font-medium mb-1">
                  Kéo thả file vào đây hoặc click để chọn
                </p>
                <p className="text-xs text-muted-foreground">
                  Chấp nhận file:{" "}
                  {config.accept.replace(/\./g, "").toUpperCase()}
                </p>
                <Input
                  id="file-upload"
                  type="file"
                  accept={config.accept}
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </Label>
            </div>

            {/* Selected Files Display */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>File đã chọn ({selectedFiles.length})</Label>
                  {selectedFiles.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAll}
                      className="text-destructive hover:text-destructive h-7 px-2"
                    >
                      <X className="size-3 mr-1" />
                      Xóa tất cả
                    </Button>
                  )}
                </div>
                <div className="space-y-2 max-h-[150px] overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-accent/30 rounded-lg group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <FileIcon
                          className={`size-5 shrink-0 ${config.color}`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleClearFile(index)}
                        className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
