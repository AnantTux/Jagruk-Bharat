import { Schema, model, models } from "mongoose";

const systemSettingSchema = new Schema({
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, required: true },
}, { timestamps: true });

export const SystemSetting = models.SystemSetting ?? model("SystemSetting", systemSettingSchema);
