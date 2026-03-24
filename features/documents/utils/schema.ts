import { z } from "zod";

// ─── Enums / literal (khớp documentsService & interfaces trong services) ───

/** Trạng thái từng document (response item) — chữ thường */
export const documentItemStatusSchema = z.enum([
  "processed",
  "processing",
  "failed",
]);

/** Filter phân trang API — chữ HOA */
export const documentPaginatedStatusFilterSchema = z.enum([
  "PROCESSED",
  "PENDING",
  "FAILED",
  "COMPLETED",
]);

export const sortDirectionSchema = z.enum(["asc", "desc"]);

// ─── Request: body / query / params (ứng với từng hàm service) ───

/** `insertText` — POST /documents/text */
export const insertTextBodySchema = z.object({
  file_source: z.string().min(1, "file_source không được rỗng"),
  text: z.string(),
});

/** `insertTexts` — POST /documents/texts */
export const insertTextsBodySchema = z.object({
  file_source: z.string().min(1, "file_source không được rỗng"),
  texts: z.array(z.string()),
});

/** `deleteEntity` — body DELETE /documents/entity */
export const deleteEntityBodySchema = z.object({
  entity_name: z.string().min(1, "entity_name không được rỗng"),
});

/** `deleteRelations` — body DELETE /documents/delete_relation */
export const deleteRelationsBodySchema = z.object({
  source_entity: z.string().min(1),
  target_entity: z.string().min(1),
});

/** Tham số `documentPaginated` */
export const documentPaginatedParamsSchema = z.object({
  page: z.number().int().min(1),
  page_size: z.number().int().min(1).max(500),
  sort_direction: sortDirectionSchema,
  sort_field: z.string().min(1),
  status_filter: documentPaginatedStatusFilterSchema,
});

/** `cancelPipeline` — POST /documents/cancel_pipeline */
export const cancelPipelineBodySchema = z.object({
  document_id: z.string().min(1, "document_id không được rỗng"),
});

/** `getTrackStatus(track_id)` — path param */
export const trackIdParamSchema = z.string().min(1, "track_id không được rỗng");

/** Upload file (client) — dùng khi validate trước khi gọi uploadDocument */
export const uploadFileInputSchema = z.object({
  file: z.custom<File>(
    (v) => typeof File !== "undefined" && v instanceof File,
    {
      message: "Cần một File hợp lệ",
    },
  ),
});

// ─── Response: khớp interfaces trong services/documents/services.ts ───

const booleanProgressArray = z.array(z.boolean());

export const documentMetadataSchema = z.object({
  processing_start_time: z.number().optional(),
  processing_end_time: z.number().optional(),
});

export const documentItemSchema = z.object({
  id: z.string(),
  content_summary: z.string(),
  content_length: z.number(),
  status: documentItemStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
  track_id: z.string(),
  chunks_count: z.number(),
  error_msg: z.string().nullable(),
  metadata: documentMetadataSchema,
  file_path: z.string(),
});

/** `getDocuments` — GET /documents */
export const getDocumentsResponseSchema = z.object({
  statuses: z
    .object({
      processed: z.array(documentItemSchema).optional(),
      processing: z.array(documentItemSchema).optional(),
      failed: z.array(documentItemSchema).optional(),
    })
    .passthrough(),
});

export const pipelineUpdateStatusSchema = z.object({
  full_docs: booleanProgressArray,
  text_chunks: booleanProgressArray,
  full_entities: booleanProgressArray,
  full_relations: booleanProgressArray,
  entity_chunks: booleanProgressArray,
  relation_chunks: booleanProgressArray,
  entities: booleanProgressArray,
  relationships: booleanProgressArray,
  chunks: booleanProgressArray,
  chunk_entity_relation: booleanProgressArray,
  llm_response_cache: booleanProgressArray,
  doc_status: booleanProgressArray,
});

/** `getDocumentPinelineStatus` — GET /documents/pipeline_status */
export const pipelineStatusResponseSchema = z.object({
  autoscanned: z.boolean(),
  busy: z.boolean(),
  job_name: z.string(),
  job_start: z.string().nullable(),
  docs: z.number(),
  batchs: z.number(),
  cur_batch: z.number(),
  request_pending: z.boolean(),
  latest_message: z.string(),
  history_messages: z.array(z.string()),
  update_status: pipelineUpdateStatusSchema,
});

export const trackDocumentItemSchema = z.object({
  id: z.string(),
  content_summary: z.string(),
  content_length: z.number(),
  status: documentItemStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
  track_id: z.string(),
  chunks_count: z.number(),
  error_msg: z.string().nullable(),
  metadata: z.object({
    processing_start_time: z.number().optional(),
    processing_end_time: z.number().optional(),
  }),
  file_path: z.string(),
});

/** `getTrackStatus` — GET /documents/track_status/:id */
export const trackStatusResponseSchema = z.object({
  track_id: z.string(),
  documents: z.array(trackDocumentItemSchema),
  total_count: z.number(),
  status_summary: z
    .object({
      processed: z.number().optional(),
      processing: z.number().optional(),
      failed: z.number().optional(),
    })
    .passthrough(),
});

/**
 * `getStatusCounts` — GET /documents/status_counts
 * Backend có thể trả object đếm theo key — cho phép thêm key lạ.
 */
export const statusCountsResponseSchema = z.record(z.string(), z.number());

/**
 * Response chung khi API chỉ trả message / success (xoá cache, scan, …).
 * Dùng .passthrough() nếu cần parse lỏng.
 */
export const genericOkMessageSchema = z
  .object({
    message: z.string().optional(),
    status: z.string().optional(),
    success: z.boolean().optional(),
  })
  .passthrough();

// ─── Inferred types (trùng shape với interfaces trong services — đặt tên rõ) ───

export type DocumentItemStatus = z.infer<typeof documentItemStatusSchema>;
export type DocumentPaginatedStatusFilter = z.infer<
  typeof documentPaginatedStatusFilterSchema
>;
export type InsertTextBody = z.infer<typeof insertTextBodySchema>;
export type InsertTextsBody = z.infer<typeof insertTextsBodySchema>;
export type DeleteEntityBody = z.infer<typeof deleteEntityBodySchema>;
export type DeleteRelationsBody = z.infer<typeof deleteRelationsBodySchema>;
export type DocumentPaginatedParams = z.infer<
  typeof documentPaginatedParamsSchema
>;
export type CancelPipelineBody = z.infer<typeof cancelPipelineBodySchema>;
/** Khớp `DocumentItem` trong services (infer từ Zod) */
export type DocumentItemParsed = z.infer<typeof documentItemSchema>;
export type GetDocumentsResponseParsed = z.infer<
  typeof getDocumentsResponseSchema
>;
export type PipelineStatusResponseParsed = z.infer<
  typeof pipelineStatusResponseSchema
>;
export type TrackStatusResponseParsed = z.infer<
  typeof trackStatusResponseSchema
>;
export type StatusCountsResponseParsed = z.infer<
  typeof statusCountsResponseSchema
>;

// ─── Helpers parse an toàn (optional) ───

export function safeParseDocumentPaginatedParams(input: unknown) {
  return documentPaginatedParamsSchema.safeParse(input);
}

export function safeParseTrackStatusResponse(data: unknown) {
  return trackStatusResponseSchema.safeParse(data);
}

export function safeParsePipelineStatusResponse(data: unknown) {
  return pipelineStatusResponseSchema.safeParse(data);
}
