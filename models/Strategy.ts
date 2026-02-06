import mongoose, { Schema, Document } from 'mongoose';

// Idea Schema
export interface IIdea extends Document {
    title: string;
    content: string;
    category: 'Content' | 'Product' | 'Marketing';
    color: string;
    votes: number;
}

const IdeaSchema = new Schema<IIdea>({
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: ['Content', 'Product', 'Marketing']
    },
    color: { type: String, default: 'blue' },
    votes: { type: Number, default: 0 },
}, { timestamps: true });

export const Idea = mongoose.models.Idea || mongoose.model<IIdea>('Idea', IdeaSchema);

// Competitor Schema
export interface ICompetitor extends Document {
    name: string;
    logo: string;
    logoUrl?: string;
    url: string;
    strengths: string[];
    weaknesses: string[];
    richNotes?: string;
    images?: string[];
}

const CompetitorSchema = new Schema<ICompetitor>({
    name: { type: String, required: true },
    logo: { type: String, default: "bg-indigo-500" },
    logoUrl: { type: String, default: "" },
    url: { type: String },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    richNotes: { type: String, default: "" },
    images: [{ type: String }],
}, { timestamps: true });

const existingModel = mongoose.models.Competitor as mongoose.Model<ICompetitor> | undefined;
const hasLogoField = Boolean(existingModel?.schema?.path("logo"));
const hasLogoUrlField = Boolean(existingModel?.schema?.path("logoUrl"));
const hasRichNotesField = Boolean(existingModel?.schema?.path("richNotes"));
const hasImagesField = Boolean(existingModel?.schema?.path("images"));
const hasPricePointField = Boolean(existingModel?.schema?.path("pricePoint"));

if (existingModel && (!hasLogoField || !hasLogoUrlField || !hasRichNotesField || !hasImagesField || hasPricePointField)) {
    delete mongoose.models.Competitor;
}

export const Competitor = mongoose.models.Competitor || mongoose.model<ICompetitor>('Competitor', CompetitorSchema);
