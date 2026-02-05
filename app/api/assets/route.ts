import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Asset from '@/models/Asset';
import { assets as seedAssets } from "@/lib/store";

type MemoryAsset = (typeof seedAssets)[number] & { _id: string };

const globalForAssets = globalThis as unknown as { __memoryAssets?: MemoryAsset[] };

const getMemoryAssets = () => {
    if (!globalForAssets.__memoryAssets) {
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
        return NextResponse.json(getMemoryAssets());
    }
}

export async function POST(request: Request) {
    const body = await request.json();
    try {
        await dbConnect();
        const asset = await Asset.create(body);
        return NextResponse.json(asset, { status: 201 });
    } catch {
        const memoryAsset = { _id: createMemoryId(), ...body } as MemoryAsset;
        const assets = getMemoryAssets();
        assets.push(memoryAsset);
        return NextResponse.json(memoryAsset, { status: 201 });
    }
}
