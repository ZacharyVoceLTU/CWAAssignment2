import { NextRequest, NextResponse } from 'next/server';
import { ERConfig } from '@/app/lib/sequelize';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// OPTIONS – CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// GET – Get all users or one by ID (?id=1)
export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (id) {
      const room = await ERConfig.findByPk(parseInt(id));
      if (!room) {
        return new NextResponse('Room not found', { status: 404, headers: corsHeaders });
      }
      return NextResponse.json(room, { headers: corsHeaders });
    }

    const rooms = await ERConfig.findAll();
    return NextResponse.json(rooms, { headers: corsHeaders });
  } catch (error) {
    console.error(error);
    return new NextResponse('Server error', { status: 500, headers: corsHeaders });
  }
}

// POST – Create new user
export async function POST(request: NextRequest) {
  try {
    const { name, appliedImagesData } = await request.json();

    if (!name || !appliedImagesData) {
      return new NextResponse('Missing name or image configurations', { status: 400, headers: corsHeaders });
    }

    if (!Array.isArray(appliedImagesData)) {
      return new NextResponse('appliedImageData must be an array', {status: 400, headers: corsHeaders})
    }

    const newRoom = await ERConfig.create({
        name, appliedImagesData,
    });
    return NextResponse.json(newRoom, { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error(error);
    return new NextResponse('Invalid request body', { status: 400, headers: corsHeaders });
  }
}

// PATCH – Update user by ID (?id=1)
export async function PATCH(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return new NextResponse('Missing id', { status: 400, headers: corsHeaders });
    }

    const room = await ERConfig.findByPk(parseInt(id));
    if (!room) {
      return new NextResponse('User not found', { status: 404, headers: corsHeaders });
    }

    const { name, appliedImagesData } = await request.json();
    if (name !== undefined) room.name = name;
    if (appliedImagesData !== undefined) room.appliedImagesData = appliedImagesData;

    await room.save();
    return NextResponse.json(room, { headers: corsHeaders });
  } catch (error) {
    console.error(error);
    return new NextResponse('Invalid request', { status: 400, headers: corsHeaders });
  }
}

// DELETE – Delete user by ID (?id=1)
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return new NextResponse('Missing id', { status: 400, headers: corsHeaders });
    }

    const room = await ERConfig.findByPk(parseInt(id));
    if (!room) {
      return new NextResponse('User not found', { status: 404, headers: corsHeaders });
    }

    await room.destroy();
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  } catch (error) {
    console.error(error);
    return new NextResponse('Invalid request', { status: 400, headers: corsHeaders });
  }
}