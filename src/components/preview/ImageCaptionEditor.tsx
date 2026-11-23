import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ImageCaption } from "@/stores/types";

interface ImageCaptionEditorProps {
  caption?: ImageCaption;
  onSave: (caption: ImageCaption) => void;
}

export function ImageCaptionEditor({ caption, onSave }: ImageCaptionEditorProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const titleId = useId();
  const bodyId = useId();

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          setTitle(caption?.title ?? "");
          setBody(caption?.body ?? "");
        }
        setOpen(nextOpen);
      }}
    >
      <DialogTrigger className="rounded-lg bg-white/90 px-5 py-2.5 text-sm font-medium text-on-surface shadow-sm md:px-3 md:py-1.5 md:text-xs">
        キャプション
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogTitle>画像のキャプション</DialogTitle>
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSave({ title, body });
            setOpen(false);
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor={titleId}>タイトル</Label>
            <Input id={titleId} value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={bodyId}>本文</Label>
            <textarea
              id={bodyId}
              rows={4}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base md:text-sm"
              value={body}
              onChange={(event) => setBody(event.target.value)}
            />
          </div>
          <DialogFooter>
            {caption && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  onSave({ title: "", body: "" });
                  setOpen(false);
                }}
              >
                キャプションを削除
              </Button>
            )}
            <DialogClose render={<Button type="button" variant="outline" />}>
              キャンセル
            </DialogClose>
            <Button type="submit">保存</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
