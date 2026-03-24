import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { documentsService } from "@/services/documents/services";

const DOCUMENTS_QUERY_KEY = ["documents"];
const STATUS_COUNTS_QUERY_KEY = ["documents-status-counts"];
const PIPELINE_STATUS_QUERY_KEY = ["documents-pipeline-status"];
/** Prefix invalidate mọi query phân trang tài liệu */
export const DOCUMENTS_PAGINATED_QUERY_KEY = ["documents-paginated"] as const;

export const useDocuments = () => {
  return useQuery({
    queryKey: DOCUMENTS_QUERY_KEY,
    queryFn: () => documentsService.getDocuments(),
    staleTime: 60 * 1000,
  });
};

export const useDocumentStatusCounts = () => {
  return useQuery({
    queryKey: STATUS_COUNTS_QUERY_KEY,
    queryFn: () => documentsService.getStatusCounts(),
    staleTime: 30 * 1000,
  });
};

export const useScanNewDocuments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => documentsService.scanNewDocuments(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: STATUS_COUNTS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: DOCUMENTS_PAGINATED_QUERY_KEY,
      });
    },
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => documentsService.uploadDocument(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: STATUS_COUNTS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: DOCUMENTS_PAGINATED_QUERY_KEY,
      });
    },
  });
};

export const useInsertText = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { file_source: string; text: string }) =>
      documentsService.insertText(params.file_source, params.text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: DOCUMENTS_PAGINATED_QUERY_KEY,
      });
    },
  });
};

export const useInsertTexts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { file_source: string; texts: string[] }) =>
      documentsService.insertTexts(params.file_source, params.texts),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: DOCUMENTS_PAGINATED_QUERY_KEY,
      });
    },
  });
};

export const useDeletesDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => documentsService.deleteDocuments(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: STATUS_COUNTS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: DOCUMENTS_PAGINATED_QUERY_KEY,
      });
    },
  });
};

export const useDocumentPipelineStatus = () => {
  return useQuery({
    queryKey: PIPELINE_STATUS_QUERY_KEY,
    queryFn: () => documentsService.getDocumentPinelineStatus(),
  });
};

export const useDeleteEntity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entity_name: string) =>
      documentsService.deleteEntity(entity_name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: DOCUMENTS_PAGINATED_QUERY_KEY,
      });
    },
  });
};

export const useClearDocumentsCache = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => documentsService.clearCache(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: STATUS_COUNTS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: DOCUMENTS_PAGINATED_QUERY_KEY,
      });
    },
  });
};

export const useDeleteRelations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { source_entity: string; target_entity: string }) =>
      documentsService.deleteRelations(
        params.source_entity,
        params.target_entity,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: DOCUMENTS_PAGINATED_QUERY_KEY,
      });
    },
  });
};

export const useTrackDocumentStatus = (document_id: string | null) => {
  return useQuery({
    queryKey: ["document-track-status", document_id],
    queryFn: () =>
      document_id ? documentsService.getTrackStatus(document_id) : null,
    enabled: !!document_id,
  });
};

export type DocumentPaginatedParams = {
  page: number;
  page_size: number;
  sort_direction: "asc" | "desc";
  sort_field: string;
  // Optional: Khi không truyền `status_filter` (vd view kanban),
  // backend sẽ trả về toàn bộ document theo mọi trạng thái.
  status_filter?:
    | "pending"
    | "processing"
    | "preprocessed"
    | "processed"
    | "failed";
};

export const useDocumentPaginated = (params: DocumentPaginatedParams) => {
  return useQuery({
    queryKey: ["documents-paginated", params],
    queryFn: () =>
      documentsService.documentPaginated(
        params.page,
        params.page_size,
        params.sort_direction,
        params.sort_field,
        params.status_filter,
      ),
    placeholderData: keepPreviousData,
  });
};

export const useReprocessFailedDocuments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => documentsService.reprocessFailedDocuments(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: STATUS_COUNTS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: DOCUMENTS_PAGINATED_QUERY_KEY,
      });
    },
  });
};

export const useCancelPipeline = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (document_id: string) =>
      documentsService.cancelPipeline(document_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PIPELINE_STATUS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: DOCUMENTS_PAGINATED_QUERY_KEY,
      });
    },
  });
};
