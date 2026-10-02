"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { MediaItem } from "@/lib/cms/media-types";

/**
 * What every field in the editor shares: the library (so a photo uploaded in
 * one field can be picked in another without a reload) and the entry's
 * current title, which new uploads use as their description.
 */
type Editor = {
  images: MediaItem[];
  files: MediaItem[];
  remember: (item: MediaItem) => void;
  title: () => string;
};

const EditorContext = createContext<Editor | null>(null);

export function EditorProvider({
  images: initialImages,
  files: initialFiles,
  titleField,
  children,
}: {
  images: MediaItem[];
  files: MediaItem[];
  titleField: string;
  children: React.ReactNode;
}) {
  const [images, setImages] = useState(initialImages);
  const [files, setFiles] = useState(initialFiles);

  const remember = useCallback((item: MediaItem) => {
    const add = (list: MediaItem[]) =>
      list.some((existing) => existing.id === item.id) ? list : [item, ...list];
    if (item.mimeType.startsWith("image/")) setImages(add);
    else setFiles(add);
  }, []);

  const title = useCallback(() => {
    const field = document.getElementById(titleField) as HTMLInputElement | HTMLTextAreaElement | null;
    return field?.value.trim() ?? "";
  }, [titleField]);

  return (
    <EditorContext.Provider value={{ images, files, remember, title }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditorContext() {
  const context = useContext(EditorContext);
  if (!context) throw new Error("Editor fields must be inside <EditorProvider>.");
  return context;
}
