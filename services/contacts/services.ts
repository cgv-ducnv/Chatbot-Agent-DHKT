import apiClient from "@/lib/api-client";

/* =====================
   Base API Response
===================== */
export interface ApiResponse<T> {
  status: string;
  status_code: number;
  message: string;
  data: T;
}

/* =====================
   Model
===================== */
export interface Contacts {
  id: number;
  username?: string;
  sdt: string;
  email: string;
  specialized: string | null;
  session_id?: string;
  created_at?: string;
  updated_at?: string;
}

/* =====================
   Requests
===================== */
export interface CreateContactsRequest {
  sdt: string;
  email: string;
  specialized: string;
  session_id: string;
}

export interface UpdateContactsRequest {
  sdt?: string;
  email?: string;
  specialized?: string;
  session_id?: string;
}

/* =====================
   Query Params
===================== */
export interface GetContactsParams {
  page?: number; // default: 1
  page_size?: number; // default: 10, max: 100
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  /** Lọc theo 1 id: GET /contacts?id=1 (gọi nhiều lần nếu cần nhiều id) */
  id?: number;
}

/* =====================
   Responses
===================== */

// List + pagination
export interface ContactsListData {
  contacts: Contacts[];
  total_pages: number;
  total_records: number;
  current_page: number;
  page_size: number;
}

export type GetContactsResponse = ApiResponse<ContactsListData>;
export type GetContactsByIdResponse = ApiResponse<Contacts>;
export type CreateContactsResponse = ApiResponse<Contacts>;
export type UpdateContactsResponse = ApiResponse<Contacts>;
export type DeleteContactsResponse = ApiResponse<null>;

/* =====================
   API Services
===================== */

// Get list Contacts
export const contactsService = {
  getContacts: (params?: GetContactsParams) =>
    apiClient.get<GetContactsResponse>("/contacts", { params }),
  getContactsById: (id: number) =>
    apiClient.get<GetContactsByIdResponse>(`/contacts/${id}`),
  createContacts: (data: CreateContactsRequest) =>
    apiClient.post<CreateContactsResponse>("/contacts", data),
  updateContacts: (id: number, data: UpdateContactsRequest) =>
    apiClient.put<UpdateContactsResponse>(`/contacts/${id}`, data),
  deleteContacts: (id: number) =>
    apiClient.delete<DeleteContactsResponse>(`/contacts/${id}`),
};
