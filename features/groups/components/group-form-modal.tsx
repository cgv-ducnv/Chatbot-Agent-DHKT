"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  groupDefaultValues,
  groupFormSchema,
  type GroupFormValues,
} from "../utils/schema";
import { useCreateGroup, useUpdateGroup } from "@/hooks/group/use-action-group";
import type { Group } from "../utils/schema";
import { removeEmptyFields } from "@/utils/remove-field-empty";

interface GroupFormDialogProps {
  group?: Group | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  departmentId?: string;
}

export function GroupFormDialog({
  group,
  open: controlledOpen,
  onOpenChange,
  departmentId,
}: GroupFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled =
    controlledOpen !== undefined && onOpenChange !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange : setInternalOpen;

  const isEditMode = !!group;

  const createGroupMutation = useCreateGroup();
  const updateGroupMutation = useUpdateGroup();

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema) as any,
    defaultValues: groupDefaultValues,
  });

  // Auto-populate department_id
  useEffect(() => {
    if (group && open) {
      const formData = {
        id: String(group.id),
        name: String(group.name || ""),
        description: String(group.description || ""),
        department_id: Number(group.department_id),
      };
      form.reset(formData as unknown as GroupFormValues);
    } else if (!group && open) {
      // Reset về default values khi tạo mới
      form.reset({
        ...groupDefaultValues,
        department_id: departmentId ? Number(departmentId) : 0,
      } as unknown as GroupFormValues);
    }
  }, [group, open, form, departmentId]);

  function onSubmit(data: GroupFormValues) {
    let payload: any = removeEmptyFields(data);

    if (isEditMode && group) {
      payload = { ...payload, id: Number(group.id) };
      updateGroupMutation.mutate(payload, {
        onSuccess: () => {
          form.reset();
          setOpen(false);
        },
      });
    } else {
      createGroupMutation.mutate(payload, {
        onSuccess: () => {
          form.reset();
          setOpen(false);
        },
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Only show trigger button when not controlled */}
      {!isControlled && (
        <DialogTrigger asChild>
          <Button className="cursor-pointer">
            <Plus className="size-4" />
            Thêm nhóm
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Sửa nhóm" : "Thêm nhóm"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Cập nhật thông tin nhóm. Nhấn lưu khi hoàn tất."
              : "Tạo nhóm mới. Nhấn lưu khi hoàn tất."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Hidden field for department_id to ensure it is registered */}
            <FormField
              control={form.control}
              name="department_id"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input type="hidden" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4">
              {/* Tên vai trò */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên nhóm</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên nhóm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Mô tả */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập mô tả" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="submit"
                className="cursor-pointer"
                disabled={
                  isEditMode
                    ? updateGroupMutation.isPending
                    : createGroupMutation.isPending
                }
              >
                {isEditMode
                  ? updateGroupMutation.isPending
                    ? "Đang cập nhật..."
                    : "Cập nhật nhóm"
                  : createGroupMutation.isPending
                    ? "Đang tạo nhóm..."
                    : "Lưu nhóm"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
