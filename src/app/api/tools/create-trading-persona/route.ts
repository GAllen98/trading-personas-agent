import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const description = searchParams.get('description');

    if (!name || !description) {
      return NextResponse.json({ error: 'name and description are required parameters' }, { status: 400 });
    }

    const persona = {
      name,
      description,
      personaAddress: process.env.USER_ADDRESS || '0x0',
      userAddress: process.env.USER_ADDRESS || '0x0',
    };

    return NextResponse.json(persona, { status: 200 });
  } catch (error) {
    console.error('Error creating trading persona:', error);
    return NextResponse.json({ error: 'Failed to create trading persona' }, { status: 500 });
  }
}
