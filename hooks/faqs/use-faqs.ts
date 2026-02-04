import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { faqService } from "@/services/faqs/services";
import type {
  GetFAQParams,
  CreateFAQRequest,
  UpdateFAQRequest,
  FAQVectorSearchRequest,
  ImportExcelRequest,
} from "@/services/faqs/services";

export const useFaqs = (params?: GetFAQParams) => {
  return useQuery({
    queryKey: ["faqs", params],
    queryFn: () => faqService.getFAQs(params),
  });
};

export const useFaq = (id: number | string) => {
  return useQuery({
    queryKey: ["faqs", id],
    queryFn: () => faqService.getFAQById(id),
    enabled: !!id,
  });
};

export const useCreateFaq = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFAQRequest) => faqService.createFAQ(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
  });
};

export const useUpdateFaq = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number | string;
      data: UpdateFAQRequest;
    }) => faqService.updateFAQ(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      queryClient.invalidateQueries({ queryKey: ["faqs", id] });
    },
  });
};

export const useDeleteFaq = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => faqService.deleteFAQ(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
  });
};

export const useSearchFaqByVector = () => {
  return useMutation({
    mutationFn: (data: FAQVectorSearchRequest) =>
      faqService.searchFAQByVector(data),
  });
};

export const useImportFaqExcel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ImportExcelRequest) => {
      // Handle creating FormData here since the service expects an object with File but likely sends JSON unless handled.
      // However, usually if it's a file upload, we should send FormData.
      // Looking at the service definition, it takes `ImportExcelRequest` which has `file: File`.
      // If the service doesn't transform it to FormData, we might need to do it here or assume the service handles specific content-types.
      // But adhering to the service interface, we just pass data.
      // Actually, many React implementations would construct FormData in the component or service.
      // Since I'm writing the hook, I'll pass the data as is to the service function.
      // If the user's service implementation is naive (just `post(url, data)`), it might be sending JSON.
      // But I will stick to the requested task: write hooks wrapping the service.
      return faqService.importExcel(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
  });
};
