import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Milestone from '@/models/Milestone';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const { id } = await params;
        const body = await request.json();
        const milestone = await Milestone.findByIdAndUpdate(id, body, { new: true, runValidators: true });

        if (!milestone) {
            return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
        }

        return NextResponse.json(milestone);
    } catch {
        return NextResponse.json({ error: 'Failed to update milestone' }, { status: 400 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const { id } = await params;
        const milestone = await Milestone.findByIdAndDelete(id);

        if (!milestone) {
            return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Milestone deleted successfully' });
    } catch {
        return NextResponse.json({ error: 'Failed to delete milestone' }, { status: 400 });
    }
}
