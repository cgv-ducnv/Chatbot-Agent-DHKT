import { z } from "zod";

export const aiConfigSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  model_name: z.string(),
  language: z.string(),
  prompt: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type AIConfig = z.infer<typeof aiConfigSchema>;

export const aiConfigFormSchema = z.object({
  name: z.string().min(1, "Tên cấu hình là bắt buộc"),
  description: z.string().optional(),
  model_name: z.string().min(1, "Tên model là bắt buộc"),
  language: z.string().min(1, "Ngôn ngữ là bắt buộc"),
  prompt: z.string().min(1, "Prompt là bắt buộc"),
});

export type AIConfigFormValues = z.infer<typeof aiConfigFormSchema>;

export const aiConfigDefaultValues: AIConfigFormValues = {
  name: "",
  description: "",
  model_name: "",
  language: "vi",
  prompt: "",
};
