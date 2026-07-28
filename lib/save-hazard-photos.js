import { mkdir, writeFile } from "fs/promises";
import path from "path";
const MAX_PHOTOS = 5;
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
export async function saveHazardPhotos(files, hazardId) {
    if (files.length === 0)
        return [];
    if (files.length > MAX_PHOTOS) {
        throw new Error(`Maximum ${MAX_PHOTOS} photos per report`);
    }
    const dir = path.join(process.cwd(), "public", "uploads", "hazards", hazardId);
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
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(path.join(dir, filename), buffer);
        urls.push(`/uploads/hazards/${hazardId}/${filename}`);
    }
    return urls;
}
