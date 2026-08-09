import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import sharp from "sharp";
const MAX_PHOTOS = 5;
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function detectImageType(buffer) {
    if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])))
        return "image/jpeg";
    if (buffer.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex")))
        return "image/png";
    if (buffer.subarray(0, 6).toString("ascii") === "GIF87a" || buffer.subarray(0, 6).toString("ascii") === "GIF89a")
        return "image/gif";
    if (buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP")
        return "image/webp";
    return null;
}
export async function saveHazardPhotos(files, hazardId) {
    if (files.length === 0)
        return [];
    if (files.length > MAX_PHOTOS) {
        throw new Error(`Maximum ${MAX_PHOTOS} photos per report`);
    }
    const useBlobStorage = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
    if (!useBlobStorage && process.env.NODE_ENV === "production") {
        throw new Error("Photo uploads require BLOB_READ_WRITE_TOKEN in production.");
    }
    const dir = path.join(process.cwd(), "public", "uploads", "hazards", hazardId);
    if (!useBlobStorage)
        await mkdir(dir, { recursive: true });
    const urls = [];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!ALLOWED_TYPES.has(file.type)) {
            throw new Error(`Unsupported file type: ${file.type || file.name}`);
        }
        if (file.size > MAX_BYTES) {
            throw new Error(`Each photo must be under 10MB (${file.name})`);
        }
        const sourceBuffer = Buffer.from(await file.arrayBuffer());
        const detectedType = detectImageType(sourceBuffer);
        if (!detectedType || detectedType !== file.type)
            throw new Error(`Photo content does not match its declared image type: ${file.name}`);
        // Re-encoding strips EXIF GPS/device metadata and prevents serving the raw upload.
        const sanitizedBuffer = await sharp(sourceBuffer, { animated: false })
            .rotate()
            .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
            .jpeg({ quality: 85, mozjpeg: true })
            .toBuffer();
        const filename = `${i}-${Date.now()}.jpg`;
        if (useBlobStorage) {
            const blob = await put(`hazards/${hazardId}/${filename}`, sanitizedBuffer, {
                access: "public",
                addRandomSuffix: true,
                contentType: "image/jpeg",
            });
            urls.push(blob.url);
        }
        else {
            await writeFile(path.join(dir, filename), sanitizedBuffer);
            urls.push(`/uploads/hazards/${hazardId}/${filename}`);
        }
    }
    return urls;
}
