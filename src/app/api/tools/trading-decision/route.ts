import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
     return NextResponse.json({ message: 'test' }, { status: 200 });
  } catch (error) {
    console.error('Error getting persona:', error);
    return NextResponse.json({ error: 'Failed to get persona' }, { status: 500 });
  }
}