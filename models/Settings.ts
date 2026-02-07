import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
    key: string;
    totalBudget: number;
    launchDate: string;
    revenuePerStudent: number;
}

const SettingsSchema = new Schema<ISettings>({
    key: { type: String, required: true, unique: true },
    totalBudget: { type: Number, required: true, default: 15000 },
    launchDate: { type: String, required: true, default: "2026-04-30" },
    revenuePerStudent: { type: Number, required: true, default: 49.99 },
}, { timestamps: true });

const existingModel = mongoose.models.Settings as mongoose.Model<ISettings> | undefined;
const hasLaunchDate = Boolean(existingModel?.schema?.path("launchDate"));
const hasRevenue = Boolean(existingModel?.schema?.path("revenuePerStudent"));

if (existingModel && (!hasLaunchDate || !hasRevenue)) {
    delete mongoose.models.Settings;
}

export default mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);
