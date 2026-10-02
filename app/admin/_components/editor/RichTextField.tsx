"use client";

import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Underline,
  Undo2,
  Unlink,
} from "lucide-react";
import { useState } from "react";
import type { Field } from "@/lib/cms/registry";
import { cn } from "@/lib/utils";
import { FieldError } from "./parts";

/**
 * The story editor. It writes in the same typeface and spacing as the
 * article page, so what the team sees here is what visitors will read.
 *
 * The toolbar offers only what the public page knows how to show — two
 * heading sizes, emphasis, lists, quotes and links. Whatever is pasted in
 * (from Word, from a website) is cleaned to that on save.
 */
export default function RichTextField({
  field,
  defaultValue,
  error,
}: {
  field: Field;
  defaultValue: string;
  error?: string;
}) {
  const [html, setHtml] = useState(defaultValue);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          protocols: ["http", "https", "mailto"],
        },
      }),
      Placeholder.configure({ placeholder: field.placeholder ?? "Start writing…" }),
    ],
    content: defaultValue,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "article-body min-h-[18rem] px-6 py-6 focus:outline-none",
        "aria-label": field.label,
        "aria-multiline": "true",
        role: "textbox",
      },
    },
    onUpdate: ({ editor }) => setHtml(editor.isEmpty ? "" : editor.getHTML()),
  });

  return (
    <div className="flex flex-col">
      <input type="hidden" name={field.name} value={html} />
      <div
        className={cn(
          "rounded-xl border bg-card focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/15 transition-shadow",
          error && "border-destructive"
        )}
      >
        {editor && <Toolbar editor={editor} />}
        <EditorContent editor={editor} />
      </div>
      {error && (
        <div className="mt-2">
          <FieldError message={error} />
        </div>
      )}
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      paragraph: e.isActive("paragraph"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
      href: (e.getAttributes("link").href as string | undefined) ?? "",
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });
  const [linking, setLinking] = useState(false);
  const [url, setUrl] = useState("");

  const chain = () => editor.chain().focus();

  const applyLink = () => {
    const value = url.trim();
    if (!value) {
      chain().extendMarkRange("link").unsetLink().run();
    } else {
      const href = /^(https?:|mailto:)/i.test(value) ? value : `https://${value}`;
      chain().extendMarkRange("link").setLink({ href }).run();
    }
    setLinking(false);
  };

  return (
    <div className="sticky top-0 z-10 rounded-t-xl border-b bg-card/95 backdrop-blur-sm">
      <div role="toolbar" aria-label="Formatting" className="flex flex-wrap items-center gap-0.5 px-2 py-1.5">
        <Tool label="Normal text" active={state.paragraph} onClick={() => chain().setParagraph().run()}>
          <Pilcrow />
        </Tool>
        <Tool label="Heading" active={state.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()}>
          <Heading2 />
        </Tool>
        <Tool label="Subheading" active={state.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()}>
          <Heading3 />
        </Tool>
        <Divider />
        <Tool label="Bold" shortcut="⌘B" active={state.bold} onClick={() => chain().toggleBold().run()}>
          <Bold />
        </Tool>
        <Tool label="Italic" shortcut="⌘I" active={state.italic} onClick={() => chain().toggleItalic().run()}>
          <Italic />
        </Tool>
        <Tool label="Underline" shortcut="⌘U" active={state.underline} onClick={() => chain().toggleUnderline().run()}>
          <Underline />
        </Tool>
        <Divider />
        <Tool label="Bulleted list" active={state.bullet} onClick={() => chain().toggleBulletList().run()}>
          <List />
        </Tool>
        <Tool label="Numbered list" active={state.ordered} onClick={() => chain().toggleOrderedList().run()}>
          <ListOrdered />
        </Tool>
        <Tool label="Quote" active={state.quote} onClick={() => chain().toggleBlockquote().run()}>
          <Quote />
        </Tool>
        <Tool label="Divider line" onClick={() => chain().setHorizontalRule().run()}>
          <Minus />
        </Tool>
        <Divider />
        <Tool
          label={state.link ? "Edit link" : "Add a link"}
          active={state.link || linking}
          onClick={() => {
            setUrl(state.href);
            setLinking((open) => !open);
          }}
        >
          <LinkIcon />
        </Tool>
        {state.link && (
          <Tool label="Remove link" onClick={() => chain().extendMarkRange("link").unsetLink().run()}>
            <Unlink />
          </Tool>
        )}
        <span className="ml-auto flex">
          <Tool label="Undo" shortcut="⌘Z" disabled={!state.canUndo} onClick={() => chain().undo().run()}>
            <Undo2 />
          </Tool>
          <Tool label="Redo" shortcut="⇧⌘Z" disabled={!state.canRedo} onClick={() => chain().redo().run()}>
            <Redo2 />
          </Tool>
        </span>
      </div>

      {linking && (
        <div className="flex flex-wrap items-center gap-2 border-t px-3 py-2.5">
          <label htmlFor="editor-link" className="text-xs font-semibold text-muted-foreground">
            Link to
          </label>
          <input
            id="editor-link"
            autoFocus
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={(event) => {
              /* Enter would submit the whole article form. */
              if (event.key === "Enter") {
                event.preventDefault();
                applyLink();
              }
              if (event.key === "Escape") {
                event.preventDefault();
                setLinking(false);
              }
            }}
            placeholder="https://…"
            className="h-9 min-w-0 grow rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={applyLink}
            className="h-9 rounded-lg bg-primary px-3.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer"
          >
            {url.trim() ? "Apply" : "Remove link"}
          </button>
        </div>
      )}
    </div>
  );
}

function Tool({
  label,
  shortcut,
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  shortcut?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      /* Clicking keeps the cursor in the story: without this the button takes
         focus, the next letters typed are lost, and a space presses it again. */
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-label={label}
      title={shortcut ? `${label} (${shortcut})` : label}
      className={cn(
        "grid size-9 place-items-center rounded-lg transition-colors cursor-pointer disabled:cursor-default disabled:opacity-35 [&>svg]:size-[1.05rem]",
        active ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />;
}
