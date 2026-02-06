import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Asset from '@/models/Asset';
import { logActivity } from '@/lib/activity';

type MemoryAsset = {
    _id: string;
    id?: string;
    name: string;
    category: string;
    price: number;
    status: string;
    owner: string;
    note?: string;
};

const isProduction = process.env.VERCEL_ENV === "production";

const globalForAssets = globalThis as unknown as { __memoryAssets?: MemoryAsset[] };

const getMemoryAssets = async () => {
    if (!globalForAssets.__memoryAssets) {
        const { assets: seedAssets } = await import("@/lib/store");
        globalForAssets.__memoryAssets = seedAssets.map((asset) => ({
            ...asset,
            _id: asset.id,
        }));
    }
    return globalForAssets.__memoryAssets;
};

const createMemoryId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export async function GET() {
    try {
        await dbConnect();
        const assets = await Asset.find({});
        return NextResponse.json(assets);
    } catch {
        if (isProduction) {
            return NextResponse.json([]);
        }
        const assets = await getMemoryAssets();
        return NextResponse.json(assets);
    }
}

export async function POST(request: Request) {
    const body = await request.json();
    try {
        await dbConnect();
        const asset = await Asset.create(body);
        await logActivity({
            action: "CREATE",
            entity: "Asset",
            description: `تمت إضافة أصل جديد: ${asset.name}`,
            user: "System",
        });
        return NextResponse.json(asset, { status: 201 });
    } catch {
        if (isProduction) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }
        const memoryAsset = { _id: createMemoryId(), ...body } as MemoryAsset;
        const assets = await getMemoryAssets();
        assets.push(memoryAsset);
        await logActivity({
            action: "CREATE",
            entity: "Asset",
            description: `تمت إضافة أصل جديد: ${memoryAsset.name}`,
            user: "System",
        });
        return NextResponse.json(memoryAsset, { status: 201 });
    }
}
