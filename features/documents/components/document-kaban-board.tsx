"use client";

import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useCallback, useEffect, useState } from "react";
import type { DocumentItem } from "@/services/documents/services";
import { EmptyData } from "@/components/empty-data";
import { IconMoodEmpty } from "@tabler/icons-react";
import { DocumentKabanCard } from "./document-kaban-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { DocumentUploadButton } from "./document-upload-button";

interface DocumentKabanBoardProps {
  documents: DocumentItem[];
  isLoading?: boolean;
}

type DocumentKanbanItem = Omit<DocumentItem, "status"> & { status: string };

type BoardStatus =
  | "pending"
  | "processing"
  | "preprocessed"
  | "processed"
  | "failed";

const BOARD_COLUMNS: { id: BoardStatus; label: string }[] = [
  { id: "processed", label: "Đã xử lý" },
  { id: "pending", label: "Chờ xử lý" },
  { id: "processing", label: "Đang xử lý" },
  { id: "preprocessed", label: "Tiền xử lý" },
  { id: "failed", label: "Lỗi" },
];

const VISIBLE_CARD_COUNT = 3;
// Ước lượng chiều cao 1 card hiện tại (để giới hạn max-h cột).
const APPROX_CARD_HEIGHT_PX = 176;
const CARD_GAP_PX = 8;
const COLUMN_CONTENT_MAX_HEIGHT =
  VISIBLE_CARD_COUNT * APPROX_CARD_HEIGHT_PX +
  (VISIBLE_CARD_COUNT - 1) * CARD_GAP_PX;

const STATUS_UI: Record<
  BoardStatus,
  {
    color: string;
    textColor: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  pending: {
    color: "bg-sky-500",
    textColor: "text-sky-700 dark:text-sky-300",
    bgColor: "bg-sky-50/70 dark:bg-sky-950/20",
    borderColor: "border-sky-200 dark:border-sky-900/40",
  },
  processing: {
    color: "bg-amber-500",
    textColor: "text-amber-700 dark:text-amber-300",
    bgColor: "bg-amber-50/70 dark:bg-amber-950/20",
    borderColor: "border-amber-200 dark:border-amber-900/40",
  },
  preprocessed: {
    color: "bg-violet-500",
    textColor: "text-violet-700 dark:text-violet-300",
    bgColor: "bg-violet-50/70 dark:bg-violet-950/20",
    borderColor: "border-violet-200 dark:border-violet-900/40",
  },
  processed: {
    color: "bg-emerald-500",
    textColor: "text-emerald-700 dark:text-emerald-300",
    bgColor: "bg-emerald-50/70 dark:bg-emerald-950/20",
    borderColor: "border-emerald-200 dark:border-emerald-900/40",
  },
  failed: {
    color: "bg-red-500",
    textColor: "text-red-700 dark:text-red-300",
    bgColor: "bg-red-50/70 dark:bg-red-950/20",
    borderColor: "border-red-200 dark:border-red-900/40",
  },
};

function normalizeStatus(status: string): BoardStatus {
  const s = status.toLowerCase();
  if (
    s === "pending" ||
    s === "processing" ||
    s === "preprocessed" ||
    s === "processed" ||
    s === "failed"
  ) {
    return s;
  }
  return "pending";
}

interface DocumentKanbanColumnProps {
  id: BoardStatus;
  title: string;
  documents: DocumentKanbanItem[];
}

function DocumentKanbanColumn({
  id,
  title,
  documents,
}: DocumentKanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: "column", status: id },
  });
  const config = STATUS_UI[id];

  return (
    <div
      className={cn(
        "flex h-full w-80 shrink-0 flex-col rounded-xl border transition-all duration-200",
        config.bgColor,
        config.borderColor,
        isOver && "ring-primary ring-2 scale-[1.01] shadow-lg",
      )}
    >
      <div className="flex items-center justify-between border-b p-4 rounded-t-xl bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className={cn("size-2.5 rounded-full", config.color)} />
          <h3
            className={cn("text-sm font-bold tracking-tight", config.textColor)}
          >
            {title}
          </h3>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-bold shadow-xs text-white",
              config.color,
            )}
          >
            {documents.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(
            "size-8 rounded-lg hover:bg-white transition-colors",
            config.textColor,
          )}
          type="button"
          disabled
        >
          <Plus className="size-4" />
        </Button>
      </div>

      {/* Giới hạn hiển thị đúng ~3 card để tránh cột bị kéo dài.
          Phần thừa sẽ bị cắt (overflow-hidden). */}
      <div
        className="flex-1 px-2 pt-2 overflow-hidden overflow-y-auto"
        style={{ maxHeight: `${COLUMN_CONTENT_MAX_HEIGHT}px` }}
      >
        <div ref={setNodeRef} className="flex min-h-0 flex-col gap-2 pb-2">
          <SortableContext
            items={documents.map((d) => d.id)}
            strategy={verticalListSortingStrategy}
          >
            {documents.map((doc) => (
              <DocumentKabanCard key={doc.id} document={doc} />
            ))}
          </SortableContext>

          {documents.length === 0 && (
            <div
              className={cn(
                "flex flex-col items-center justify-center h-32 rounded-lg border-2 border-dashed gap-2 transition-colors bg-white/30",
                config.borderColor,
              )}
            >
              <div
                className={cn(
                  "p-2 rounded-full bg-white shadow-sm",
                  config.textColor,
                )}
              >
                <Plus className="size-4 opacity-50" />
              </div>
              <p
                className={cn(
                  "text-[11px] font-bold uppercase tracking-wider",
                  config.textColor,
                )}
              >
                Không có tài liệu
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function DocumentKabanBoard({
  documents,
  isLoading,
}: DocumentKabanBoardProps) {
  const [items, setItems] = useState<DocumentKanbanItem[]>(documents);
  const [activeDocument, setActiveDocument] =
    useState<DocumentKanbanItem | null>(null);

  useEffect(() => {
    setItems(documents);
  }, [documents]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const getDocsByStatus = useCallback(
    (status: BoardStatus) =>
      items.filter(
        (doc) => normalizeStatus(doc.status ?? "pending") === status,
      ),
    [items],
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const doc = items.find((d) => d.id === active.id);
    if (doc) setActiveDocument(doc);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const activeDoc = items.find((d) => d.id === activeId);
    if (!activeDoc) return;

    const overData = over.data.current;
    if (overData?.type === "column") {
      const newStatus = overData.status as BoardStatus;
      if (normalizeStatus(activeDoc.status ?? "pending") !== newStatus) {
        setItems((prev) =>
          prev.map((d) =>
            d.id === activeId ? { ...d, status: newStatus } : d,
          ),
        );
      }
      return;
    }

    const overDoc = items.find((d) => d.id === overId);
    if (!overDoc) return;
    const activeStatus = normalizeStatus(activeDoc.status ?? "pending");
    const overStatus = normalizeStatus(overDoc.status ?? "pending");
    if (activeStatus !== overStatus) {
      setItems((prev) =>
        prev.map((d) => (d.id === activeId ? { ...d, status: overStatus } : d)),
      );
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDocument(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const activeDoc = items.find((d) => d.id === activeId);
    const overDoc = items.find((d) => d.id === overId);
    if (!activeDoc || !overDoc) return;

    const activeStatus = normalizeStatus(activeDoc.status ?? "pending");
    const overStatus = normalizeStatus(overDoc.status ?? "pending");
    if (activeStatus !== overStatus) return;

    setItems((prev) => {
      const columnDocs = prev.filter(
        (d) => normalizeStatus(d.status ?? "pending") === activeStatus,
      );
      const otherDocs = prev.filter(
        (d) => normalizeStatus(d.status ?? "pending") !== activeStatus,
      );
      const activeIndex = columnDocs.findIndex((d) => d.id === activeId);
      const overIndex = columnDocs.findIndex((d) => d.id === overId);
      const reordered = arrayMove(columnDocs, activeIndex, overIndex);
      return [...otherDocs, ...reordered];
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <DocumentUploadButton />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 2xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Card key={idx} className="h-[420px]">
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
        </div>
      </div>
    );
  }

  if (!documents.length) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <DocumentUploadButton />
        </div>
        <EmptyData
          icon={IconMoodEmpty}
          title="Chưa có tài liệu."
          description="Không có dữ liệu để hiển thị ở chế độ Kanban. Bạn có thể tải lên tài liệu mới."
          showButton={false}
          buttonText=""
          onButtonClick={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <DocumentUploadButton />
      </div>
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-[70vh] min-h-[520px] gap-4 overflow-x-auto overflow-y-auto pb-4 pr-2">
        {BOARD_COLUMNS.map((column) => (
          <DocumentKanbanColumn
            key={column.id}
            id={column.id}
            title={column.label}
            documents={getDocsByStatus(column.id)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeDocument ? (
          <DocumentKabanCard document={activeDocument} draggable={false} />
        ) : null}
      </DragOverlay>
    </DndContext>
    </div>
  );
}
