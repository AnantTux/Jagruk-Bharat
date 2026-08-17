import { v2 as cloudinary } from "cloudinary";

function isConfigured() {
    return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

export function uploadHazardPhoto(buffer, hazardId, filename) {
    if (!isConfigured())
        throw new Error("Cloudinary is not configured.");
    cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET, secure: true });
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: `jagruk-bharat/hazards/${hazardId}`, public_id: filename.replace(/\.jpg$/, ""), resource_type: "image", overwrite: false }, (error, result) => error ? reject(error) : resolve(result.secure_url));
        stream.end(buffer);
    });
}
