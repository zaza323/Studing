import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Asset from '@/models/Asset';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const { id } = await params;
        const body = await request.json();
        const asset = await Asset.findByIdAndUpdate(id, body, { new: true, runValidators: true });

        if (!asset) {
            return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
        }

        return NextResponse.json(asset);
    } catch {
        return NextResponse.json({ error: 'Failed to update asset' }, { status: 400 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const { id } = await params;
        const asset = await Asset.findByIdAndDelete(id);

        if (!asset) {
            return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Asset deleted successfully' });
    } catch {
        return NextResponse.json({ error: 'Failed to delete asset' }, { status: 400 });
    }
}
