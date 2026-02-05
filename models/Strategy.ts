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
    url: string;
    pricePoint: string;
    strengths: string[];
    weaknesses: string[];
}

const CompetitorSchema = new Schema<ICompetitor>({
    name: { type: String, required: true },
    url: { type: String },
    pricePoint: { type: String },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
}, { timestamps: true });

export const Competitor = mongoose.models.Competitor || mongoose.model<ICompetitor>('Competitor', CompetitorSchema);
