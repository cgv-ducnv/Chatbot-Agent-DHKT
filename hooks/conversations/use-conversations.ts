import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  conversationService,
  GetconversationParams,
  GetConversationByIdParams,
  CreateconversationRequest,
  UpdateconversationRequest,
} from "@/services/conversations/services";
import { toast } from "sonner";

export const conversationKeys = {
  all: ["conversations"] as const,
  lists: () => [...conversationKeys.all, "list"] as const,
  list: (params: GetconversationParams) =>
    [...conversationKeys.lists(), params] as const,
  prioritized: (params: GetconversationParams) =>
    [...conversationKeys.all, "prioritized", params] as const,
  details: () => [...conversationKeys.all, "detail"] as const,
  detail: (id: number) => [...conversationKeys.details(), id] as const,
  byChatContact: (id: number) =>
    [...conversationKeys.all, "byChatContact", id] as const,
};

export const useGetConversations = (params: GetconversationParams) => {
  return useQuery({
    queryKey: conversationKeys.list(params),
    queryFn: () => conversationService.getConversation(params),
  });
};

export const useGetConversationsInfinite = (params: GetconversationParams) => {
  return useInfiniteQuery({
    queryKey: [...conversationKeys.lists(), "infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      conversationService.getConversation({
        ...params,
        page: pageParam as number,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      const totalPages = lastPage.data?.data.total_pages || 0;
      const nextPage = (lastPageParam as number) + 1;
      return nextPage <= totalPages ? nextPage : undefined;
    },
  });
};

export const useGetConversationById = (
  id: number,
  params?: GetConversationByIdParams,
) => {
  return useQuery({
    queryKey: [...conversationKeys.detail(id), params],
    queryFn: () => conversationService.getConversationById(id, params),
    enabled: !!id,
  });
};

export const useGetConversationByIdInfinite = (id: number) => {
  return useInfiniteQuery({
    queryKey: [...conversationKeys.detail(id), "infinite"],
    queryFn: ({ pageParam = 1 }) =>
      conversationService.getConversationById(id, {
        page: pageParam as number,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      // Pagination is nested in data.data.pagination, not data.pagination
      const pagination = (lastPage as any).data?.data?.pagination;

      if (!pagination) {
        console.warn("⚠️ No pagination field found!");
        return undefined;
      }

      return pagination.has_more ? (lastPageParam as number) + 1 : undefined;
    },
    enabled: !!id,
  });
};

export const useGetPrioritizedConversations = (
  params: GetconversationParams,
) => {
  return useQuery({
    queryKey: conversationKeys.prioritized(params),
    queryFn: () => conversationService.getConversationPrioritized(params),
  });
};

export const useGetPrioritizedConversationsInfinite = (
  params: GetconversationParams,
) => {
  return useInfiniteQuery({
    queryKey: [...conversationKeys.prioritized(params), "infinite"],
    queryFn: ({ pageParam = 1 }) =>
      conversationService.getConversationPrioritized({
        ...params,
        page: pageParam as number,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      const totalPages = (lastPage as any).data?.data?.total_pages || 0;
      const nextPage = (lastPageParam as number) + 1;
      return nextPage <= totalPages ? nextPage : undefined;
    },
  });
};

export const useGetConversationsByChatContactId = (id: number) => {
  return useQuery({
    queryKey: conversationKeys.byChatContact(id),
    queryFn: () => conversationService.getConversationByChatContactId(id),
    enabled: !!id,
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateconversationRequest) =>
      conversationService.createConversation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
};

export const useUpdateConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateconversationRequest;
    }) => conversationService.updateConversation(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: conversationKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: conversationKeys.prioritized({}), // approximate invalidation
      });
      if (data.data.status_code === 200) {
        toast.success(data.data.message);
      } else {
        toast.error(data.data.message);
      }
    },
  });
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => conversationService.deleteConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
};
