import { z } from "zod";

export const faqSchema = z.object({
  id: z.number(),
  question: z.string(),
  aliases: z.array(z.string()),
  answer: z.string(),
  intent: z.string(),
  priority: z.number(),
  search_count: z.number().optional(),
  ai_config_id: z.number(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});

export const faqDefaultValues: FAQFormValues = {
  id: undefined,
  question: "",
  aliases: [],
  answer: "",
  intent: "",
  priority: 0,
  ai_config_id: 0,
};

export const faqFormSchema = z.object({
  id: z.number().optional(),
  question: z.string().min(1, "Câu hỏi không được để trống"),
  aliases: z.array(z.string()),
  answer: z.string().min(1, "Câu trả lời không được để trống"),
  intent: z.string(),
  priority: z.number().min(0),
  ai_config_id: z.number(),
});

export type FAQ = z.infer<typeof faqSchema>;

// Define type manually to avoid complex inference issues with zod defaults
export interface FAQFormValues {
  id?: number;
  question: string;
  aliases: string[];
  answer: string;
  intent: string;
  priority: number;
  ai_config_id: number;
}
