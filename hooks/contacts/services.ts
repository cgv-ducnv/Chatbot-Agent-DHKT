import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contactsService } from "@/services/contacts/services";
import type {
  GetContactsParams,
  CreateContactsRequest,
  UpdateContactsRequest,
} from "@/services/contacts/services";

export const useContacts = (params?: GetContactsParams) => {
  return useQuery({
    queryKey: ["contacts", params],
    queryFn: () => contactsService.getContacts(params),
  });
};

export const useContact = (id: number) => {
  return useQuery({
    queryKey: ["contacts", id],
    queryFn: () => contactsService.getContactsById(id),
    enabled: !!id,
  });
};

export const useCreateContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateContactsRequest) =>
      contactsService.createContacts(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
};

export const useUpdateContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateContactsRequest }) =>
      contactsService.updateContacts(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["contacts", id] });
    },
  });
};

export const useDeleteContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => contactsService.deleteContacts(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
};
