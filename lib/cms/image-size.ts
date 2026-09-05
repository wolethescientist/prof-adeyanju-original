/**
 * Minimal image dimension reader for the formats the CMS accepts.
 *
 * Parsing a few header bytes ourselves avoids pulling an image library into
 * the deployment just to fill in width and height — which `next/image` needs
 * in order to reserve space and avoid layout shift.
 */
export type Dimensions = { width: number; height: number } | null;

export function imageSize(buf: Buffer, mime: string): Dimensions {
  try {
    if (mime === "image/png") return pngSize(buf);
    if (mime === "image/jpeg") return jpegSize(buf);
    if (mime === "image/webp") return webpSize(buf);
    if (mime === "image/gif") return gifSize(buf);
  } catch {
    /* A malformed header is not worth failing an upload over. */
  }
  return null;
}

function pngSize(buf: Buffer): Dimensions {
  // 8-byte signature, then IHDR: length(4) type(4) width(4) height(4)
  if (buf.length < 24 || buf.toString("ascii", 12, 16) !== "IHDR") return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function gifSize(buf: Buffer): Dimensions {
  if (buf.length < 10) return null;
  return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
}

function webpSize(buf: Buffer): Dimensions {
  if (buf.length < 30 || buf.toString("ascii", 8, 12) !== "WEBP") return null;
  const format = buf.toString("ascii", 12, 16);
  if (format === "VP8X") {
    // 24-bit little-endian, stored as value-1
    const w = buf.readUIntLE(24, 3) + 1;
    const h = buf.readUIntLE(27, 3) + 1;
    return { width: w, height: h };
  }
  if (format === "VP8 ") {
    return {
      width: buf.readUInt16LE(26) & 0x3fff,
      height: buf.readUInt16LE(28) & 0x3fff,
    };
  }
  if (format === "VP8L") {
    const bits = buf.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }
  return null;
}

function jpegSize(buf: Buffer): Dimensions {
  let offset = 2; // skip SOI
  while (offset < buf.length - 9) {
    if (buf[offset] !== 0xff) {
      offset++;
      continue;
    }
    const marker = buf[offset + 1];
    // SOF0..SOF15, excluding the non-frame markers DHT(c4) JPGA(c8) DAC(cc)
    const isFrame =
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc;
    if (isFrame) {
      return {
        height: buf.readUInt16BE(offset + 5),
        width: buf.readUInt16BE(offset + 7),
      };
    }
    offset += 2 + buf.readUInt16BE(offset + 2);
  }
  return null;
}
