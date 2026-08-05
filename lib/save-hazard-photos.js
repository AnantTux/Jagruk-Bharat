import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
const MAX_PHOTOS = 5;
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
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
        const ext = path.extname(file.name) || (file.type === "image/png" ? ".png" : ".jpg");
        const filename = `${i}-${Date.now()}${ext}`;
        if (useBlobStorage) {
            const blob = await put(`hazards/${hazardId}/${filename}`, file, {
                access: "public",
                addRandomSuffix: true,
                contentType: file.type,
            });
            urls.push(blob.url);
        }
        else {
            const buffer = Buffer.from(await file.arrayBuffer());
            await writeFile(path.join(dir, filename), buffer);
            urls.push(`/uploads/hazards/${hazardId}/${filename}`);
        }
    }
    return urls;
}
