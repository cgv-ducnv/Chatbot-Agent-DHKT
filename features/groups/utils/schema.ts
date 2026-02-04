import { z } from "zod";

export const groupSchema = z.object({
  id: z.number(),
  name: z.string(),
  department_id: z.string(),
  description: z.string(),
  tenant_id: z.string(),
  member_count: z.number().optional(),
});

export const groupDefaultValues = {
  name: "",
  department_id: 0,
  description: "",
  tenant_id: "",
};

export const groupFormSchema = z.object({
  id: z.number().optional(),
  name: z
    .string()
    .min(1, "Tên nhóm không được để trống")
    .max(50, "Tên nhóm không được quá 50 ký tự"),
  department_id: z.coerce.number().min(1, "Cần có phòng ban"),
  tenant_id: z.string().optional(),
  description: z.string().optional(),
});

export type Group = z.infer<typeof groupSchema>;
export type GroupFormValues = z.infer<typeof groupFormSchema>;
