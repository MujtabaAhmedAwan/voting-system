import { NextResponse } from 'next/server';
import { sendApprovalToUser } from '@/utils/email';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const action = searchParams.get('action'); // 'approve' or 'deny'

  if (!email || !action) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  if (action === 'approve') {
    try {
      global.userStatusStore = global.userStatusStore || new Map();
      global.userStatusStore.set(email, 'APPROVED');
      await sendApprovalToUser(email);
      return new NextResponse(`
        <html>
          <body style="font-family: sans-serif; text-align: center; margin-top: 50px;">
            <h1 style="color: green;">User Approved Successfully!</h1>
            <p>An email has been sent to ${email} with their access link.</p>
          </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' } });
    } catch (e) {
      console.error(e);
      return NextResponse.json({ error: 'Failed to send approval email' }, { status: 500 });
    }
  } 
  
  if (action === 'deny') {
    global.userStatusStore = global.userStatusStore || new Map();
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
