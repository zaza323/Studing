import mongoose, { Schema, Document } from 'mongoose';

export interface IAsset extends Document {
    name: string;
    category: 'Production' | 'Infrastructure' | 'Electronics' | 'Licenses' | 'Furniture';
    price: number;
    status: string;
    owner: string;
    note?: string;
}

const AssetSchema = new Schema<IAsset>({
    name: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: ['Production', 'Infrastructure', 'Electronics', 'Licenses', 'Furniture']
    },
    price: { type: Number, required: true },
    status: { type: String, required: true },
    owner: { type: String, default: '--' },
    note: { type: String, default: "" },
}, { timestamps: true });

const existingModel = mongoose.models.Asset as mongoose.Model<IAsset> | undefined;
const existingEnum = (existingModel?.schema?.path("category") as { enumValues?: string[] } | undefined)?.enumValues ?? [];
const hasNoteField = Boolean(existingModel?.schema?.path("note"));

if (existingModel && (!existingEnum.includes("Furniture") || !hasNoteField)) {
    delete mongoose.models.Asset;
}

export default mongoose.models.Asset || mongoose.model<IAsset>('Asset', AssetSchema);
