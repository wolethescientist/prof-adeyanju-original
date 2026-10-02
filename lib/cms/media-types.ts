/**
 * What the browser is told about a library file — everything except its
 * bytes. Kept free of server imports so the editor's pickers can use it; the
 * matching column list is LIBRARY_COLUMNS in lib/cms/media.ts.
 */
export type MediaItem = {
  id: string;
  filename: string;
  mimeType: string;
  alt: string;
  checksum: string;
  width: number | null;
  height: number | null;
  byteSize: number;
  createdAt: Date;
};

export function isPdf(item: Pick<MediaItem, "mimeType">) {
  return item.mimeType === "application/pdf";
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
