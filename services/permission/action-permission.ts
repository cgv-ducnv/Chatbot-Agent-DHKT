import apiClient from "@/lib/api-client";

export interface AssignRolePermissionPayload {
  role_id: string;
  permission_ids: string[];
}

export interface UnassignRolePermissionPayload {
  role_id: string;
  permission_id: string;
}

export interface AssignRolePermissionResponseApi {
  status: string;
  status_code: number;
  message: string;
}

export interface UnassignRolePermissionResponseApi {
  status: string;
  status_code: number;
  message: string;
}

/* ================== ASSIGN ================== */
export async function assignRolePermissionApi(
  payload: AssignRolePermissionPayload,
): Promise<AssignRolePermissionResponseApi> {
  const { role_id, permission_ids } = payload;

  const response = await apiClient.post<AssignRolePermissionResponseApi>(
    `/role-permission/${role_id}/assign`,
    {
      permission_ids,
    },
  );

  return response.data;
}

/* ================== UNASSIGN ================== */
export async function unassignRolePermissionApi(
  payload: UnassignRolePermissionPayload,
): Promise<UnassignRolePermissionResponseApi> {
  const { role_id, permission_id } = payload;

  const response = await apiClient.delete<UnassignRolePermissionResponseApi>(
    `/role-permission/${role_id}/permissions/${permission_id}`,
  );

  return response.data;
}
