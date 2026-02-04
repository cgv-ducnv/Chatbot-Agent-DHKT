import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { aiConfigService } from "@/services/ai-config/services";
import type {
  GetAIConfigParams,
  CreateAIConfigRequest,
  UpdateAIConfigRequest,
} from "@/services/ai-config/services";

export const useAIConfigs = (params?: GetAIConfigParams) => {
  return useQuery({
    queryKey: ["ai-configs", params],
    queryFn: () => aiConfigService.getAIConfigs(params),
  });
};

export const useAIConfig = (id: number) => {
  return useQuery({
    queryKey: ["ai-configs", id],
    queryFn: () => aiConfigService.getAIConfigById(id),
    enabled: !!id,
  });
};

export const useCreateAIConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAIConfigRequest) =>
      aiConfigService.createAIConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-configs"] });
    },
  });
};

export const useUpdateAIConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAIConfigRequest }) =>
      aiConfigService.updateAIConfig(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["ai-configs"] });
      queryClient.invalidateQueries({ queryKey: ["ai-configs", id] });
    },
  });
};

export const useDeleteAIConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => aiConfigService.deleteAIConfig(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-configs"] });
    },
  });
};
