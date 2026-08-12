import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const action = searchParams.get('action'); // 'approve' or 'deny'

  if (!email || !action) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  // Ensure global store exists for demo purposes
  global.userStatusStore = global.userStatusStore || new Map();

  if (action === 'approve') {
    global.userStatusStore.set(email, 'APPROVED');
    return new NextResponse(`
      <html>
        <body style="font-family: sans-serif; text-align: center; margin-top: 50px;">
          <h1 style="color: green;">User Approved Successfully!</h1>
          <p>The user ${email} now has access to the application.</p>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } });
  } 
  
  if (action === 'deny') {
    global.userStatusStore.set(email, 'DENIED');
    return new NextResponse(`
      <html>
        <body style="font-family: sans-serif; text-align: center; margin-top: 50px;">
          <h1 style="color: red;">User Denied.</h1>
          <p>The user ${email} has been blocked from accessing the application.</p>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
