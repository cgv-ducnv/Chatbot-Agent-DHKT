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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  aiConfigDefaultValues,
  aiConfigFormSchema,
  type AIConfigFormValues,
} from "../utils/schema";
import {
  useCreateAIConfig,
  useUpdateAIConfig,
} from "@/hooks/ai-configs/services";
import type { AIConfig } from "../utils/schema";
import { removeEmptyFields } from "@/utils/remove-field-empty";
import { MODEL_OPTIONS } from "@/constants/model-ai";
import { LANGUAGE_OPTIONS } from "@/constants/language";
import ReactCountryFlag from "react-country-flag";
import { toast } from "sonner";

interface AIConfigFormDialogProps {
  config?: AIConfig | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AIConfigFormDialog({
  config,
  open: controlledOpen,
  onOpenChange,
}: AIConfigFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled =
    controlledOpen !== undefined && onOpenChange !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange : setInternalOpen;

  const isEditMode = !!config;

  const createConfigMutation = useCreateAIConfig();
  const updateConfigMutation = useUpdateAIConfig();

  const form = useForm<AIConfigFormValues>({
    resolver: zodResolver(aiConfigFormSchema),
    defaultValues: aiConfigDefaultValues,
  });

  // Populate form khi edit mode
  useEffect(() => {
    if (config && open) {
      const formData = {
        name: config.name,
        description: config.description,
        model_name: config.model_name,
        language: config.language,
        prompt: config.prompt,
      };
      form.reset(formData);
    } else if (!config && open) {
      // Reset về default values khi tạo mới
      form.reset({
        ...aiConfigDefaultValues,
        model_name: MODEL_OPTIONS[0]?.value || "",
      });
    }
  }, [config, open, form]);

  function onSubmit(data: AIConfigFormValues) {
    const payload = removeEmptyFields(data);

    if (isEditMode && config) {
      updateConfigMutation.mutate(
        { id: config.id, data: payload as any },
        {
          onSuccess: (response) => {
            if (response.status_code === 200) {
              toast.success(response.message || "Cập nhật cấu hình thành công");
              form.reset();
              setOpen(false);
            } else {
              toast.error(response?.message || "Cập nhật cấu hình thất bại");
            }
          },
        },
      );
    } else {
      createConfigMutation.mutate(payload as any, {
        onSuccess: (response) => {
          if (response.status_code === 200) {
            toast.success(response.message || "Tạo cấu hình thành công");
            form.reset();
            setOpen(false);
          } else {
            toast.error(response?.message || "Tạo cấu hình thất bại");
          }
          form.reset();
          setOpen(false);
        },
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Only show trigger button when not controlled */}
      {!isControlled && (
        <DialogTrigger asChild>
          <Button className="cursor-pointer">
            <Plus className="size-4" />
            Thêm agent
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[min(90vh,640px)] gap-3 overflow-y-auto p-4 sm:p-5">
        <DialogHeader className="space-y-1 pb-3 text-left">
          <DialogTitle className="text-base">
            {isEditMode ? "Sửa thông tin agent" : "Thêm mới agent"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isEditMode
              ? "Cập nhật thông tin agent. Nhấn lưu khi hoàn tất."
              : "Tạo agent mới. Nhấn lưu khi hoàn tất."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên agent</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập Tên agent" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nhập mô tả"
                        rows={2}
                        className="min-h-0 resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="model_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô hình A.I</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MODEL_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngôn ngữ</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn ngôn ngữ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LANGUAGE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              {option.countryCode && (
                                <ReactCountryFlag
                                  countryCode={option.countryCode}
                                  svg
                                  style={{
                                    width: "1.5em",
                                    height: "1.5em",
                                  }}
                                />
                              )}
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập prompt hệ thống"
                      rows={5}
                      className="min-h-[100px] max-h-[200px] resize-y overflow-y-auto"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 pt-2 sm:justify-end">
              <Button
                type="submit"
                size="sm"
                className="cursor-pointer"
                disabled={
                  isEditMode
                    ? updateConfigMutation.isPending
                    : createConfigMutation.isPending
                }
              >
                {isEditMode
                  ? updateConfigMutation.isPending
                    ? "Đang cập nhật..."
                    : "Cập nhật cấu hình"
                  : createConfigMutation.isPending
                    ? "Đang lưu..."
                    : "Lưu cấu hình"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
