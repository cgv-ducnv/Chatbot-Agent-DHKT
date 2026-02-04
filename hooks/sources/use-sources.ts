import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sourcesService } from "@/services/sources/services";
import type {
  GetSourcesParams,
  CreateSourcesRequest,
  UpdateSourcesRequest,
  IngestSourcesRequest,
  SearchSourcesRequest,
} from "@/services/sources/services";

export const useSources = (params?: GetSourcesParams) => {
  return useQuery({
    queryKey: ["sources", params],
    queryFn: () => sourcesService.getSources(params),
  });
};

export const useSource = (id: number) => {
  return useQuery({
    queryKey: ["sources", id],
    queryFn: () => sourcesService.getSourcesById(id),
    enabled: !!id,
  });
};

export const useCreateSource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSourcesRequest) =>
      sourcesService.createSources(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] });
    },
  });
};

export const useUpdateSource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSourcesRequest }) =>
      sourcesService.updateSources(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      queryClient.invalidateQueries({ queryKey: ["sources", id] });
    },
  });
};

export const useDeleteSource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => sourcesService.deleteSources(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] });
    },
  });
};

export const useIngestSource = () => {
  return useMutation({
    mutationFn: (data: IngestSourcesRequest) =>
      sourcesService.ingestSources(data),
  });
};

export const useSearchSource = () => {
  return useMutation({
    mutationFn: (data: SearchSourcesRequest) =>
      sourcesService.searchSources(data),
  });
};
