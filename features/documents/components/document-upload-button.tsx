"use client";

import {
  useState,
  useRef,
  useCallback,
  type ChangeEvent,
  type ComponentProps,
  type DragEvent,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useUploadDocument } from "@/hooks/documents/use-documents";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ButtonProps = ComponentProps<typeof Button>;

const ACCEPT = ".pdf,.doc,.docx,.txt,.md,.markdown,application/pdf,text/plain";

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentUploadButton({
  className,
  variant = "default",
  size = "sm",
  disabled,
  ...buttonProps
}: Omit<ButtonProps, "onClick" | "type" | "children">) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadDocument();

  const resetAndClose = useCallback(() => {
    setFile(null);
    setOpen(false);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const pickFile = useCallback((f: File | undefined | null) => {
    if (!f) return;
    setFile(f);
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    pickFile(e.target.files?.[0]);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    pickFile(f);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleUpload = async () => {
    if (!file) {
      toast.message("Chọn một tệp trước khi tải lên.");
      return;
    }
    try {
      await upload.mutateAsync(file);
      toast.success(`Đã tải lên: ${file.name}`);
      resetAndClose();
    } catch {
      toast.error("Không thể tải lên tài liệu.");
    }
  };

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={cn("cursor-pointer", className)}
        disabled={disabled}
        onClick={() => setOpen(true)}
        {...buttonProps}
      >
        <Upload className="mr-2 size-4 shrink-0" />
        Tải lên tài liệu
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setFile(null);
            if (inputRef.current) inputRef.current.value = "";
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tải lên tài liệu</DialogTitle>
            <DialogDescription>
              Chọn một tệp (PDF, Word, txt, …) để đưa vào xử lý. Sau khi tải
              lên, dùng track_id để theo dõi trạng thái.
            </DialogDescription>
          </DialogHeader>

          <input
            ref={inputRef}
            type="file"
            className="sr-only"
            tabIndex={-1}
            accept={ACCEPT}
            onChange={handleInputChange}
          />

          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            onClick={() => inputRef.current?.click()}
            onDragEnter={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setIsDragging(false);
              }
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={cn(
              "flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 bg-muted/30 hover:border-muted-foreground/40 hover:bg-muted/50",
            )}
          >
            <Upload className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Kéo thả tệp vào đây hoặc{" "}
              <span className="font-medium text-primary">bấm để chọn</span>
            </p>
            {file && (
              <p className="max-w-full truncate text-xs font-medium text-foreground">
                {file.name}{" "}
                <span className="text-muted-foreground">
                  ({formatBytes(file.size)})
                </span>
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => resetAndClose()}
              disabled={upload.isPending}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={() => void handleUpload()}
              disabled={!file || upload.isPending}
            >
              {upload.isPending ? "Đang tải lên…" : "Xác nhận tải lên"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
