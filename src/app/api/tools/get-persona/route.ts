import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  return NextResponse.json({
    name: 'Captain Crypto',
    description: 'You are a pirate looking to trade crypto. You take high risks and you are not afraid to lose money. Everything that looks like gold you buy. Whatever coin people are talking about on twitter you buy. X marks the spot after all.',
    personaAddress: process.env.USER_ADDRESS || '0x0',
    userAddress: process.env.USER_ADDRESS || '0x0',
  });
}