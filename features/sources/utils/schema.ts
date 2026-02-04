import { z } from "zod";

export const sourceTypes = [
  "pdf",
  "docx",
  "txt",
  "csv",
  "xlsx",
  "json",
] as const;
export const chunkStrategies = ["fixed", "semantic", "overlapping"] as const;

export const sourcesSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  source_type: z.string(),
  source_url: z.string(),
  ai_config_id: z.number(),
  check_sum: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const sourcesDefaultValues = {
  id: 0,
  name: "",
  description: "",
  source_type: "pdf",
  source_url: "",
  ai_config_id: 0,
  check_sum: "",
};

export const sourcesFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Tên nguồn không được để trống"),
  description: z.string().optional(),
  source_type: z.string().min(1, "Loại nguồn không được để trống"),
  source_url: z.string().optional(),
  ai_config_id: z.number(),
  check_sum: z.string().optional(),
});

export const ingestSourcesFormSchema = z.object({
  ai_config_id: z.coerce.number().optional(),
  root_path: z.string().min(1, "Đường dẫn gốc không được để trống"),
  source_paths: z.array(z.string()).min(1, "Cần có ít nhất 1 đường dẫn"),
  allowed_extensions: z.array(z.string()).default([".pdf", ".txt", ".docx"]),
  chunk_size: z.coerce
    .number()
    .min(100, "Kích thước chunk tối thiểu là 100")
    .default(1000),
  chunk_overlap: z.coerce.number().min(0).default(200),
  chunk_strategy: z.enum(chunkStrategies).default("fixed"),
  max_files: z.coerce.number().min(1).default(100),
  force: z.boolean().default(false),
  include_hidden: z.boolean().default(false),
  use_docling_for_pdf: z.boolean().default(false),
  redact_pii: z.boolean().default(false),
});

export type Sources = z.infer<typeof sourcesSchema>;
export type SourcesFormValues = z.infer<typeof sourcesFormSchema>;
export type IngestSourcesFormValues = z.infer<typeof ingestSourcesFormSchema>;
