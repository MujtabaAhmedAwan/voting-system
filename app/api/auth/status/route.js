import { NextResponse } from 'next/server';
import { getStatus } from '../../../../utils/store';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const statusData = getStatus(email);
  if (!statusData) {
    return NextResponse.json({ status: 'not_found' });
  }

  return NextResponse.json(statusData);
}
