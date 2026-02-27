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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  faqDefaultValues,
  faqFormSchema,
  type FAQFormValues,
  type FAQ,
} from "../utils/schema";
import { useParams } from "next/navigation";
import { useCreateFaq, useUpdateFaq } from "@/hooks/faqs/use-faqs";
import { toast } from "sonner";

interface FAQFormDialogProps {
  faq?: FAQ | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (data: FAQFormValues) => void;
  aiConfigId?: number; // Optional: override params
}

export function FAQFormDialog({
  faq,
  open: controlledOpen,
  onOpenChange,
  onSubmit: onSubmitProp,
  aiConfigId: propAiConfigId,
}: FAQFormDialogProps) {
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

  const isEditMode = !!faq;

  // Mutations
  const createFaq = useCreateFaq();
  const updateFaq = useUpdateFaq();

  const isLoading = createFaq.isPending || updateFaq.isPending;

  // State for aliases input
  const [aliasInput, setAliasInput] = useState("");

  const form = useForm<FAQFormValues>({
    resolver: zodResolver(faqFormSchema) as any,
    defaultValues: faqDefaultValues,
  });

  // Watch aliases for display
  const aliases = form.watch("aliases") || [];

  // Auto-populate ai_config_id from params
  useEffect(() => {
    if (aiConfigId && !isEditMode) {
      form.setValue("ai_config_id", aiConfigId);
    }
  }, [aiConfigId, form, isEditMode]);

  // Populate form when edit mode
  useEffect(() => {
    if (faq && open) {
      const formData = {
        id: faq.id,
        question: faq.question,
        aliases: faq.aliases || [],
        answer: faq.answer,
        intent: faq.intent || "",
        priority: faq.priority,
        ai_config_id: faq.ai_config_id,
      };
      form.reset(formData);
    } else if (!faq && open) {
      // Reset to default values when creating new
      form.reset({
        ...faqDefaultValues,
        ai_config_id: aiConfigId,
      });
    }
  }, [faq, open, form, aiConfigId]);

  // Handle adding alias
  const handleAddAlias = () => {
    const trimmedAlias = aliasInput.trim();
    if (trimmedAlias && !aliases.includes(trimmedAlias)) {
      form.setValue("aliases", [...aliases, trimmedAlias]);
      setAliasInput("");
    }
  };

  // Handle removing alias
  const handleRemoveAlias = (aliasToRemove: string) => {
    form.setValue(
      "aliases",
      aliases.filter((a) => a !== aliasToRemove),
    );
  };

  // Handle Enter key in alias input
  const handleAliasKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddAlias();
    }
  };

  async function handleSubmit(data: FAQFormValues) {
    // Use aiConfigId from state for create, or from faq for edit
    const configId = isEditMode ? faq?.ai_config_id : aiConfigId;

    const payload = {
      question: data.question,
      aliases: data.aliases || [],
      answer: data.answer,
      intent: data.intent || "",
      priority: data.priority,
      ai_config_id: configId || data.ai_config_id,
    };

    try {
      if (isEditMode && faq?.id) {
        const response = await updateFaq.mutateAsync({
          id: faq.id,
          data: payload,
        });
        if (response.data.status_code === 200) {
          toast.success(response.data.message || "Cập nhật FAQ thành công!");
        } else {
          toast.error(response.data.message || "Cập nhật FAQ thất bại!");
        }
      } else {
        const response = await createFaq.mutateAsync(payload);
        if (
          response.data.status_code === 200 ||
          response.data.status_code === 201
        ) {
          toast.success(response.data.message || "Tạo FAQ thành công!");
        } else {
          toast.error(response.data.message || "Tạo FAQ thất bại!");
        }
      }

      // Success callback
      if (onSubmitProp) {
        onSubmitProp(data);
      }
      form.reset();
      setAliasInput("");
      setOpen(false);
    } catch (error) {
      console.error("Error saving FAQ:", error);
      toast.error(isEditMode ? "Cập nhật FAQ thất bại!" : "Tạo FAQ thất bại!");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Only show trigger button when not controlled */}
      {!isControlled && (
        <DialogTrigger asChild>
          <Button className="cursor-pointer">
            <Plus className="size-4" />
            Thêm FAQ
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Sửa FAQ" : "Thêm FAQ mới"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Cập nhật thông tin FAQ."
              : "Tạo FAQ mới. Nhấn lưu khi hoàn tất."}
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
            <div className="space-y-4 max-h-[calc(90vh-240px)] min-h-[300px] overflow-y-auto pr-2">
              {/* Question */}
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Câu hỏi *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nhập câu hỏi..."
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Answer */}
              <FormField
                control={form.control}
                name="answer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Câu trả lời *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nhập câu trả lời..."
                        className="resize"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Aliases */}
              <FormField
                control={form.control}
                name="aliases"
                render={() => (
                  <FormItem>
                    <FormLabel>Từ khóa đồng nghĩa (Aliases)</FormLabel>
                    <FormDescription>
                      Thêm các cách hỏi khác cho câu hỏi này
                    </FormDescription>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nhập từ khóa và nhấn Enter..."
                        value={aliasInput}
                        onChange={(e) => setAliasInput(e.target.value)}
                        onKeyDown={handleAliasKeyDown}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddAlias}
                        disabled={!aliasInput.trim()}
                      >
                        Thêm
                      </Button>
                    </div>
                    {aliases.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {aliases.map((alias, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 font-normal text-[10px] px-1 py-0 h-5"
                          >
                            {alias}
                            <button
                              type="button"
                              onClick={() => handleRemoveAlias(alias)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="size-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                {/* Intent */}
                <FormField
                  control={form.control}
                  name="intent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intent (Tùy chọn)</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập intent..." {...field} />
                      </FormControl>
                      <FormDescription>
                        Phân loại ý định của câu hỏi
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Priority */}
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Độ ưu tiên</FormLabel>
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
                      <FormDescription>
                        Số càng cao, ưu tiên càng lớn
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="mt-6 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="cursor-pointer"
                disabled={isLoading}
              >
                {isLoading
                  ? "Đang lưu..."
                  : isEditMode
                    ? "Cập nhật"
                    : "Tạo FAQ"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
