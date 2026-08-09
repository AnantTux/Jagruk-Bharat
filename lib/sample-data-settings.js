import { connectToDatabase } from "@/lib/mongodb";
import { SystemSetting } from "@/lib/models/system-setting";

const KEY = "sample-data-visible";

export async function getSampleDataVisible() {
    await connectToDatabase();
    const setting = await SystemSetting.findOne({ key: KEY }).lean();
    return setting?.value !== false;
}

export async function setSampleDataVisible(visible) {
    await connectToDatabase();
    await SystemSetting.updateOne({ key: KEY }, { $set: { value: visible } }, { upsert: true });
    return visible;
}

export function hideSampleDataFilter(visible) {
    return visible ? {} : { isDemo: { $ne: true } };
}
