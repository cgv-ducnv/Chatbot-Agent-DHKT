"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, FileSpreadsheet, X, AlertCircle } from "lucide-react";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useParams } from "next/navigation";
import { useImportFaqExcel } from "@/hooks/faqs/use-faqs";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Schema for import form
const importFormSchema = z.object({
  file: z.instanceof(File, { message: "Vui lòng chọn file Excel" }),
  intent_default: z.string().default("general"),
  priority_default: z.number().min(0).default(0),
});

type ImportFormValues = z.infer<typeof importFormSchema>;

interface FAQsImportExcelDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  aiConfigId?: number;
  trigger?: React.ReactNode;
}

// Interface for API validation error
interface ApiValidationError {
  type: string;
  loc: string[];
  msg: string;
  input: any;
  url?: string;
}

export function FAQsImportExcelDialog({
  open: controlledOpen,
  onOpenChange,
  aiConfigId: propAiConfigId,
  trigger,
}: FAQsImportExcelDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled =
    controlledOpen !== undefined && onOpenChange !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange : setInternalOpen;

  const [apiErrors, setApiErrors] = useState<ApiValidationError[]>([]);

  const params = useParams();
  const paramId = Array.isArray(params.aiconfigId)
    ? params.aiconfigId[0]
    : params.aiconfigId;
  const aiConfigId = propAiConfigId || Number(paramId);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const importExcel = useImportFaqExcel();
  const isLoading = importExcel.isPending;

  const form = useForm<ImportFormValues>({
    resolver: zodResolver(importFormSchema) as any,
    defaultValues: {
      intent_default: "general",
      priority_default: 0,
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ];
      if (
        !validTypes.includes(file.type) &&
        !file.name.endsWith(".xlsx") &&
        !file.name.endsWith(".xls")
      ) {
        toast.error("Vui lòng chọn file Excel (.xlsx hoặc .xls)");
        return;
      }
      setSelectedFile(file);
      form.setValue("file", file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    form.setValue("file", undefined as any);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
        toast.error("Vui lòng chọn file Excel (.xlsx hoặc .xls)");
        return;
      }
      setSelectedFile(file);
      form.setValue("file", file);
    }
  };

  async function handleSubmit(data: ImportFormValues) {
    if (!selectedFile) {
      toast.error("Vui lòng chọn file Excel");
      return;
    }

    // Clear previous errors
    setApiErrors([]);

    try {
      const response = await importExcel.mutateAsync({
        file: selectedFile,
        intent_default: data.intent_default,
        priority_default: data.priority_default,
        ai_config_id: aiConfigId,
      });

      if (
        response.data.status_code === 200 ||
        response.data.status_code === 201
      ) {
        toast.success(response.data.message || "Import FAQ thành công!");
        form.reset();
        setSelectedFile(null);
        setOpen(false);
      } else {
        toast.error(response.data.message || "Import FAQ thất bại!");
      }
    } catch (error: any) {
      console.error("Error importing FAQ:", error);

      // Handle 422 validation errors
      const errorData = error?.response?.data;
      if (error?.response?.status === 422 && errorData?.detail) {
        setApiErrors(errorData.detail);
        toast.error("Có lỗi validation từ server");
      } else {
        toast.error(errorData?.message || "Import FAQ thất bại!");
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import FAQ từ Excel</DialogTitle>
          <DialogDescription>
            Chọn file Excel (.xlsx hoặc .xls) chứa danh sách FAQ để import.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit, (errors) => {
              console.error("Form validation errors:", errors);
              const firstError = Object.values(errors)[0];
              toast.error(
                firstError?.message || "Vui lòng kiểm tra lại thông tin!",
              );
            })}
            className="space-y-4"
          >
            {/* File Upload Area */}
            <FormField
              control={form.control}
              name="file"
              render={() => (
                <FormItem>
                  <FormLabel>File Excel *</FormLabel>
                  <FormControl>
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                        selectedFile
                          ? "border-green-300 bg-green-50"
                          : "border-muted-foreground/25 hover:border-muted-foreground/50"
                      }`}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      {selectedFile ? (
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                            <FileSpreadsheet className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {selectedFile.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(selectedFile.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleRemoveFile}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                            <Upload className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              Kéo thả file vào đây hoặc
                            </p>
                            <label className="cursor-pointer text-sm text-primary hover:underline">
                              chọn file
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileSelect}
                                className="hidden"
                              />
                            </label>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Chỉ hỗ trợ file .xlsx hoặc .xls
                          </p>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Intent Default */}
              <FormField
                control={form.control}
                name="intent_default"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intent mặc định</FormLabel>
                    <FormControl>
                      <Input placeholder="general" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Intent mặc định cho FAQ
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Priority Default */}
              <FormField
                control={form.control}
                name="priority_default"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Độ ưu tiên mặc định</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value, 10) || 0)
                        }
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Số từ 0 trở lên
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* API Validation Errors */}
            {apiErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Lỗi từ server</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    {apiErrors.map((err, index) => (
                      <li key={index}>
                        <span className="font-medium">
                          {err.loc.slice(1).join(" > ") || "Field"}:
                        </span>{" "}
                        {err.msg}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading || !selectedFile}>
                {isLoading ? "Đang import..." : "Xác nhận Import"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
