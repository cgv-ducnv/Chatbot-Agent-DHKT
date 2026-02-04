import apiClient from "@/lib/api-client";

export const publicContactService = {
  contactUserInfo: (data: any) =>
    apiClient.post<any>("/contact-user-info", data),
};
