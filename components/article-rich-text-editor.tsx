"use client";

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useRef } from "react";

import { uploadFileWithProgress } from "@/lib/upload/with-progress";
import { focusRingClassName } from "@/lib/ui/classes";

type ArticleRichTextEditorProps = {
  initialContent?: string;
  onChange: (html: string) => void;
};

function ToolbarButton({
  label,
  active,
  onClick,
  disabled,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={[
        "rounded px-2 py-1 text-xs font-medium transition-colors",
        focusRingClassName,
        active
          ? "bg-teal/15 text-teal"
          : "text-fg-muted hover:bg-[var(--hover-subtle)] hover:text-fg",
        disabled ? "cursor-not-allowed opacity-50" : "",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

export function ArticleRichTextEditor({ initialContent = "", onChange }: ArticleRichTextEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const uploadingRef = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-teal underline underline-offset-2",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "my-4 max-w-full rounded-md",
        },
      }),
      Placeholder.configure({
        placeholder: "Write your article…",
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "article-editor min-h-[240px] px-3 py-3 text-sm leading-relaxed text-fg outline-none",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  const setLink = useCallback(() => {
    if (!editor) {
      return;
    }

    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previousUrl ?? "https://");

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    const normalized = url.startsWith("http") ? url : `https://${url}`;
    editor.chain().focus().extendMarkRange("link").setLink({ href: normalized }).run();
  }, [editor]);

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!editor || uploadingRef.current) {
        return;
      }

      uploadingRef.current = true;

      const result = await uploadFileWithProgress("/api/post-images", file, () => {});

      uploadingRef.current = false;

      if (result.error || !result.url) {
        window.alert(result.error ?? "Couldn't upload that image.");
        return;
      }

      editor.chain().focus().setImage({ src: result.url }).run();
    },
    [editor]
  );

  if (!editor) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-md border border-border-subtle bg-surface-input">
      <div className="flex flex-wrap gap-1 border-b border-border-subtle px-2 py-2">
        <ToolbarButton
          label="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          label="Heading"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          label="Bullets"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          label="Numbered"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton label="Link" active={editor.isActive("link")} onClick={setLink} />
        <ToolbarButton
          label="Image"
          onClick={() => imageInputRef.current?.click()}
          disabled={uploadingRef.current}
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";

            if (file) {
              void handleImageUpload(file);
            }
          }}
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
