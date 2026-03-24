import { lightRagApi } from "@/lib/light-rag-client";

// Response interface Document
export interface DocumentMetadata {
  processing_start_time?: number;
  processing_end_time?: number;
}

export type DocumentStatus = "processed" | "processing" | "failed";

export interface DocumentItem {
  id: string;
  content_summary: string;
  content_length: number;
  status: DocumentStatus;
  created_at: string;
  updated_at: string;
  track_id: string;
  chunks_count: number;
  error_msg: string | null;
  metadata: DocumentMetadata;
  file_path: string;
}

export interface GetDocumentsResponse {
  statuses: {
    processed?: DocumentItem[];
    processing?: DocumentItem[];
    failed?: DocumentItem[];
  };
}

// Response interface Pipeline Status
export interface PipelineUpdateStatus {
  full_docs: boolean[];
  text_chunks: boolean[];
  full_entities: boolean[];
  full_relations: boolean[];
  entity_chunks: boolean[];
  relation_chunks: boolean[];
  entities: boolean[];
  relationships: boolean[];
  chunks: boolean[];
  chunk_entity_relation: boolean[];
  llm_response_cache: boolean[];
  doc_status: boolean[];
}

export interface PipelineStatusResponse {
  autoscanned: boolean;
  busy: boolean;
  job_name: string;
  job_start: string | null;
  docs: number;
  batchs: number;
  cur_batch: number;
  request_pending: boolean;
  latest_message: string;
  history_messages: string[];
  update_status: PipelineUpdateStatus;
  /** Một số bản LightRAG trả thêm */
  pending_requests?: boolean;
  cancellation_requested?: boolean;
}

// Interface get truck status
export interface TrackDocumentItem {
  id: string;
  content_summary: string;
  content_length: number;
  status: DocumentStatus;
  created_at: string;
  updated_at: string;
  track_id: string;
  chunks_count: number;
  error_msg: string | null;
  metadata: {
    processing_start_time?: number;
    processing_end_time?: number;
  };
  file_path: string;
}

export interface TrackStatusResponse {
  track_id: string;
  documents: TrackDocumentItem[];
  total_count: number;
  status_summary: {
    processed?: number;
    processing?: number;
    failed?: number;
  };
}

/**
 * Client gọi LightRAG Documents API (qua {@link lightRagApi}: base URL + Bearer token).
 *
 * Nhóm chức năng:
 * - 🧠 INGEST DATA — đưa dữ liệu vào RAG
 * - ⚙️ PIPELINE / PROCESSING — xử lý dữ liệu
 * - 📊 TRACKING / MONITORING — theo dõi & danh sách
 * - 🧹 CLEANUP / MAINTENANCE — dọn cache
 * - 🧩 KNOWLEDGE GRAPH — entity & relation
 */
export const documentsService = {
  // ─── 🧠 1. INGEST DATA ─────────────────────────────────────────────

  /**
   * 🔹 `POST /documents/scan` (hoặc GET tùy backend)
   *
   * **Tác dụng:** Quét thư mục input để tìm file mới, tự động đưa vào pipeline xử lý.
   *
   * **Dùng khi:** Không upload qua API mà drop file trực tiếp vào folder server.
   */
  scanNewDocuments: async () => {
    const response = await lightRagApi.post("/documents/scan");
    return response.data;
  },

  /**
   * 🔹 `POST /documents/upload`
   *
   * **Tác dụng:** Upload file (PDF, DOCX, txt, …) vào hệ thống — lưu file + đưa vào pipeline
   * (parse → embedding → index).
   *
   * **Điểm quan trọng:**
   * - Check trùng tên (sync) → có thể trả `duplicated` ngay
   * - Check trùng nội dung (async) → phát hiện sau khi xử lý
   * - Trả về `track_id` để theo dõi
   *
   * **Dùng khi:** Có file thật cần đưa vào hệ thống hỏi đáp.
   *
   * @param file - File cần upload
   */
  uploadDocument: async (file: File) => {
    const response = await lightRagApi.post("/documents/upload", { file });
    return response.data;
  },

  /**
   * 🔹 `POST /documents/text`
   *
   * **Tác dụng:** Insert một đoạn text trực tiếp (không cần file).
   *
   * **Dùng khi:** Data nhỏ, test nhanh, không cần upload file.
   *
   * @param file_source - Nguồn / nhãn gắn với đoạn text
   * @param text - Nội dung text
   */
  insertText: async (file_source: string, text: string) => {
    const response = await lightRagApi.post("/documents/text", {
      file_source,
      text,
    });
    return response.data;
  },

  /**
   * 🔹 `POST /documents/texts`
   *
   * **Tác dụng:** Insert nhiều đoạn text cùng lúc.
   *
   * **Dùng khi:** Batch insert / import dữ liệu lớn — hiệu năng tốt hơn gọi nhiều lần `/text`.
   *
   * @param file_source - Nguồn / nhãn chung
   * @param texts - Mảng các đoạn text
   */
  insertTexts: async (file_source: string, texts: string[]) => {
    const response = await lightRagApi.post("/documents/texts", {
      file_source,
      texts,
    });
    return response.data;
  },

  // ─── 📊 3. TRACKING / MONITORING (một phần) + deprecated ─────────────

  /**
   * 🔹 `GET /documents`
   *
   * ⚠️ **Deprecated** — lấy danh sách document theo status (thường giới hạn ~1000).
   *
   * Ưu tiên dùng {@link documentsService.documentPaginated} cho UI dashboard / dữ liệu lớn.
   */
  getDocuments: async () => {
    const response = await lightRagApi.get("/documents");
    return response.data;
  },

  /**
   * Xóa document (endpoint tổng quát — chi tiết theo contract backend).
   *
   * Gọi `DELETE` tới `/documents`.
   */
  deleteDocuments: async () => {
    const response = await lightRagApi.delete("/documents");
    return response.data;
  },

  // ─── 🧩 5. KNOWLEDGE GRAPH ─────────────────────────────────────────

  /**
   * 🔹 `DELETE /documents/entity` (tương đương delete entity trên KG)
   *
   * **Tác dụng:** Xóa một entity khỏi knowledge graph.
   *
   * **Dùng khi:** Hệ thống có graph (Neo4j, KG, …) và cần chỉnh sửa tri thức.
   *
   * @param entity_name - Tên entity cần xóa
   */
  deleteEntity: async (entity_name: string) => {
    const response = await lightRagApi.delete("/documents/entity", {
      data: { entity_name },
    });
    return response.data;
  },

  // ─── 🧹 4. CLEANUP / MAINTENANCE ───────────────────────────────────

  /**
   * 🔹 `POST /documents/clear_cache` (implementation có thể là DELETE tùy backend)
   *
   * **Tác dụng:** Xóa cache response của LLM.
   *
   * **Dùng khi:** Muốn reset kết quả hoặc debug hệ thống RAG.
   */
  clearCache: async () => {
    const response = await lightRagApi.delete("/documents/clear_cache");
    return response.data;
  },

  /**
   * 🔹 `DELETE /documents/delete_relation`
   *
   * **Tác dụng:** Xóa quan hệ giữa hai entity trên knowledge graph.
   *
   * **Dùng khi:** Cần chỉnh sửa cấu trúc quan hệ trong graph.
   *
   * @param source_entity - Entity nguồn
   * @param target_entity - Entity đích
   */
  deleteRelations: async (source_entity: string, target_entity: string) => {
    const response = await lightRagApi.delete("/documents/delete_relation", {
      data: { source_entity, target_entity },
    });
    return response.data;
  },

  /**
   * Xóa một hoặc nhiều tài liệu — body `{ doc_ids, delete_file, delete_llm_cache }`.
   * Trên danh sách phân trang, `doc_ids` thường là các `track_id` đã chọn.
   */
  deleteDocumentsBatch: async (payload: {
    doc_ids: string[];
    delete_file: boolean;
    delete_llm_cache: boolean;
  }) => {
    const ids = [...new Set(payload.doc_ids.filter(Boolean))];
    if (!ids.length) {
      throw new Error("doc_ids không được rỗng");
    }
    const response = await lightRagApi.delete(
      `/documents/delete_document/${encodeURIComponent(ids[0])}`,
      {
        data: {
          doc_ids: ids,
          delete_file: payload.delete_file,
          delete_llm_cache: payload.delete_llm_cache,
        },
      },
    );
    return response.data;
  },

  deleteDocument: async (
    document_id: string,
    data: {
      doc_ids: string[];
      delete_file: boolean;
      delete_llm_cache: boolean;
    },
  ) => {
    return documentsService.deleteDocumentsBatch({
      doc_ids: data.doc_ids.length ? data.doc_ids : [document_id],
      delete_file: data.delete_file,
      delete_llm_cache: data.delete_llm_cache,
    });
  },

  /**
   * 🔹 `GET /documents/track_status/{track_id}`
   *
   * **Tác dụng:** Theo dõi tiến trình của một lần upload/insert (async).
   *
   * **Quan trọng phía client:** Mọi thứ xử lý bất đồng bộ — đây là API then chốt để poll trạng thái.
   *
   * @param document_id - `track_id` (hoặc id theo contract backend) trả về từ upload/insert
   */
  getTrackStatus: async (document_id: string) => {
    const response = await lightRagApi.get(
      `/documents/track_status/${document_id}`,
    );
    return response.data;
  },

  /**
   * 🔹 `POST /documents/paginated` (spec; hiện tại code dùng GET + body — nên đồng bộ với backend)
   *
   * **Tác dụng:** Lấy danh sách document có phân trang + filter/sort.
   *
   * **Dùng khi:** UI dashboard, quản lý dữ liệu lớn.
   */
  documentPaginated: async (
    page: number,
    page_size: number,
    sort_direction: "asc" | "desc",
    sort_field: string,
    status_filter?:
      | "pending"
      | "processing"
      | "preprocessed"
      | "processed"
      | "failed",
  ) => {
    const body = {
      page,
      page_size,
      sort_direction,
      sort_field,
      ...(status_filter ? { status_filter } : {}),
    };
    const response = await lightRagApi.post("/documents/paginated", body);
    return response.data;
  },

  /**
   * 🔹 `GET /documents/status_counts`
   *
   * **Tác dụng:** Đếm số document theo trạng thái (PENDING, PROCESSING, PROCESSED, FAILED, …).
   *
   * **Dùng khi:** Dashboard thống kê tổng quan.
   */
  getStatusCounts: async () => {
    const response = await lightRagApi.get("/documents/status_counts");
    return response.data;
  },

  // ─── ⚙️ 2. PIPELINE / PROCESSING ───────────────────────────────────

  /**
   * 🔹 `POST /documents/reprocess_failed`
   *
   * **Tác dụng:** Chạy lại các document FAILED, PENDING, hoặc PROCESSING bị crash.
   *
   * **Dùng khi:** Server crash, LLM lỗi, cần retry hàng loạt.
   */
  reprocessFailedDocuments: async () => {
    const response = await lightRagApi.post("/documents/reprocess_failed");
    return response.data;
  },

  /**
   * 🔹 `GET /documents/pipeline_status`
   *
   * **Tác dụng:** Xem trạng thái pipeline: có đang bận, batch nào, tiến độ, …
   *
   * **Dùng khi:** Debug hệ thống — rất quan trọng để theo dõi xử lý.
   */
  getDocumentPinelineStatus: async () => {
    const response = await lightRagApi.get("/documents/pipeline_status");
    return response.data;
  },

  /**
   * 🔹 `POST /documents/cancel_pipeline`
   *
   * **Tác dụng:** Dừng pipeline đang chạy.
   *
   * **Dùng khi:** Cần stop xử lý, pipeline lỗi hoặc treo.
   *
   * @param document_id - Id document / job liên quan pipeline cần hủy
   */
  cancelPipeline: async (document_id: string) => {
    const response = await lightRagApi.post("/documents/cancel_pipeline", {
      document_id,
    });
    return response.data;
  },
};
