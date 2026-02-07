import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Asset from '@/models/Asset';
import { logActivity } from '@/lib/activity';

export async function GET() {
    try {
        await dbConnect();
        const assets = await Asset.find({});
        return NextResponse.json(assets);
    } catch {
        return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 });
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
        return NextResponse.json({ error: "Failed to create asset" }, { status: 500 });
    }
}
