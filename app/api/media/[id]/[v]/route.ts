import { eq } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";

/**
 * Serves an uploaded image out of the database.
 *
 * The second path segment is the file's checksum. It is not used to look the
 * image up — the id alone does that — it exists so that every version of a file has
 * its own URL and the response can be cached forever.
 *
 * The checksum sits in the path rather than a query string deliberately: it
 * lets `images.localPatterns` in next.config.ts pin `search: ""`, so the image
 * optimizer accepts these URLs without also accepting arbitrary query strings
 * that could be used to flood the optimizer's cache.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; v: string }> }
) {
  const { id } = await params;

  /* An invalid uuid would make Postgres throw rather than return no rows. */
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return new Response("Not found", { status: 404 });
  }

  const [row] = await db
    .select({
      data: media.data,
      mimeType: media.mimeType,
      byteSize: media.byteSize,
      checksum: media.checksum,
      filename: media.filename,
    })
    .from(media)
    .where(eq(media.id, id))
    .limit(1);

  if (!row) return new Response("Not found", { status: 404 });

  const headers: Record<string, string> = {
    "Content-Type": row.mimeType,
    "Content-Length": String(row.byteSize),
    "Cache-Control": "public, max-age=31536000, immutable",
    ETag: `"${row.checksum}"`,
    /* Uploads are only ever served as what they were checked to be. */
    "X-Content-Type-Options": "nosniff",
  };

  /* PDFs open in the browser's viewer, and save under their real name when
     the visitor downloads them (the article page's link sets `download`). */
  if (row.mimeType === "application/pdf") {
    const ascii = row.filename.replace(/[^\x20-\x7e]|["\\]/g, "_");
    headers["Content-Disposition"] =
      `inline; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(row.filename)}`;
  }

  return new Response(new Uint8Array(row.data), { headers });
}
