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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  sourcesDefaultValues,
  sourcesFormSchema,
  sourceTypes,
  type SourcesFormValues,
  type Sources,
} from "../utils/schema";
import { useParams } from "next/navigation";
import { SourcesDetailForm } from "./sources-modal-detail-form";
import { useCreateSource, useUpdateSource } from "@/hooks/sources/use-sources";
import { toast } from "sonner";

interface SourcesFormDialogProps {
  source?: Sources | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (data: SourcesFormValues) => void;
  aiConfigId?: number; // Optional: override params
}

export function SourcesFormDialog({
  source,
  open: controlledOpen,
  onOpenChange,
  onSubmit: onSubmitProp,
  aiConfigId: propAiConfigId,
}: SourcesFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled =
    controlledOpen !== undefined && onOpenChange !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange : setInternalOpen;

  const params = useParams();
  const paramId = Array.isArray(params.aiconfigId)
    ? params.aiconfigId[0]
    : params.aiconfigId;
  const aiConfigId = propAiConfigId || Number(paramId);

  const isEditMode = !!source;

  // Mutations
  const createSource = useCreateSource();
  const updateSource = useUpdateSource();

  const isLoading = createSource.isPending || updateSource.isPending;

  // State for selected files from detail form
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const form = useForm<SourcesFormValues>({
    resolver: zodResolver(sourcesFormSchema),
    defaultValues: sourcesDefaultValues,
  });

  // Auto-populate ai_config_id from params
  useEffect(() => {
    if (aiConfigId && !isEditMode) {
      form.setValue("ai_config_id", aiConfigId);
    }
  }, [aiConfigId, form, isEditMode]);

  // Populate form khi edit mode
  useEffect(() => {
    if (source && open) {
      const formData = {
        id: source.id,
        name: source.name,
        description: source.description,
        source_type: source.source_type,
        source_url: source.source_url,
        ai_config_id: source.ai_config_id,
        check_sum: source.check_sum,
      };
      form.reset(formData);
    } else if (!source && open) {
      // Reset về default values khi tạo mới
      form.reset(sourcesDefaultValues);
    }
  }, [source, open, form]);

  async function handleSubmit(data: SourcesFormValues) {
    // Ensure required fields have values
    // Use aiConfigId from state for create, or from source for edit
    const configId = isEditMode ? source?.ai_config_id : aiConfigId;

    const payload = {
      name: data.name,
      description: data.description || "",
      source_type: data.source_type,
      source_url: data.source_url || "",
      ai_config_id: configId || data.ai_config_id,
      check_sum: data.check_sum || "",
    };
    try {
      if (isEditMode && source?.id) {
        const response = await updateSource.mutateAsync({
          id: source.id,
          data: payload,
        });
        if (response.data.status_code == 200) {
          toast.success(response.data.message);
        } else {
          toast.error(response.data.message);
        }
      } else {
        const response = await createSource.mutateAsync(payload);
        if (response.data.status_code == 200) {
          toast.success(response.data.message);
        } else {
          toast.error(response.data.message);
        }
      }

      // Success callback
      if (onSubmitProp) {
        onSubmitProp(data);
      }
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error saving source:", error);
      toast.error(
        isEditMode
          ? "Cập nhật nguồn dữ liệu thất bại!"
          : "Tạo nguồn dữ liệu thất bại!",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Only show trigger button when not controlled */}
      {!isControlled && (
        <DialogTrigger asChild>
          <Button className="cursor-pointer">
            <Plus className="size-4" />
            Thêm nguồn
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Sửa nguồn dữ liệu" : "Thêm nguồn dữ liệu"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Cập nhật thông tin nguồn dữ liệu. Nhấn lưu khi hoàn tất."
              : "Tạo nguồn dữ liệu mới. Nhấn lưu khi hoàn tất."}
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
            className="flex flex-col"
          >
            <div className="relative grid grid-cols-2 gap-0 max-h-[calc(90vh-240px)] min-h-[400px]">
              {/* Left Panel - Basic Info */}
              <div className="space-y-4 overflow-y-auto pr-6 h-full">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên nguồn</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nhập tên nguồn dữ liệu"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="source_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loại nguồn dữ liệu</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isEditMode}
                        >
                          <FormControl>
                            <SelectTrigger
                              className={`w-full ${isEditMode ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                              <SelectValue placeholder="Chọn loại nguồn" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sourceTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type === "pdf" && "📕 PDF"}
                                {type === "docx" && "📘 DOCX"}
                                {type === "txt" && "📄 TXT"}
                                {type === "csv" && "📊 CSV"}
                                {type === "xlsx" && "📗 XLSX"}
                                {type === "json" && "🔧 JSON"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {isEditMode && (
                          <p className="text-xs text-muted-foreground">
                            Không thể thay đổi loại nguồn khi chỉnh sửa
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mô tả (Tùy chọn)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Nhập mô tả nguồn dữ liệu"
                            className="resize"
                            rows={5}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Absolute Divider */}
              <div
                className="absolute inset-y-0 left-1/2 w-px bg-border"
                aria-hidden="true"
              />

              {/* Right Panel - Detail Form */}
              <div className="pl-6 h-full overflow-y-auto">
                <SourcesDetailForm
                  form={form}
                  sourceType={form.watch("source_type")}
                  onFilesChange={setSelectedFiles}
                  isEditMode={isEditMode}
                />
              </div>
            </div>

            <DialogFooter className="mt-6 pt-4 border-t">
              <Button
                type="submit"
                className="cursor-pointer"
                disabled={isLoading}
              >
                {isLoading
                  ? "Đang lưu..."
                  : isEditMode
                    ? "Cập nhật nguồn"
                    : "Lưu nguồn"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
