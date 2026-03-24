import type { DocumentItem } from "@/services/documents/services";

export interface DocumentsPaginationMeta {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * Chuẩn hóa response phân trang từ LightRAG (shape có thể khác nhau từng version).
 */
export function normalizeDocumentsPaginated(data: unknown): {
  items: DocumentItem[];
  pagination: DocumentsPaginationMeta | undefined;
} {
  if (data == null || typeof data !== "object") {
    return { items: [], pagination: undefined };
  }

  const d = data as Record<string, unknown>;

  const rawItems =
    (Array.isArray(d.items) ? d.items : null) ??
    (Array.isArray(d.documents) ? d.documents : null) ??
    (Array.isArray(d.data) ? d.data : null) ??
    [];

  const items = rawItems.filter(
    (x): x is DocumentItem =>
      typeof x === "object" && x !== null && "id" in (x as object),
  ) as DocumentItem[];

  const p = d.pagination ?? d.meta;
  let pagination: DocumentsPaginationMeta | undefined;

  if (p && typeof p === "object") {
    const pm = p as Record<string, unknown>;
    pagination = {
      total: Number(pm.total ?? pm.total_count ?? items.length) || 0,
      page: Number(pm.page ?? pm.current_page ?? 1) || 1,
      page_size: Number(pm.page_size ?? pm.per_page ?? 10) || 10,
      total_pages: Number(pm.total_pages ?? pm.last_page ?? 1) || 1,
    };
  }

  return { items, pagination };
}
