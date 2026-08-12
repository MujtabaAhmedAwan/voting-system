import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ status: 'ERROR' });
  }

  global.userStatusStore = global.userStatusStore || new Map();
  const status = global.userStatusStore.get(email) || 'PENDING';

  return NextResponse.json({ status });
}
