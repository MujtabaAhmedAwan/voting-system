import { NextResponse } from 'next/server';
import { sendApprovalToUser } from '../../../../utils/email';
import { verify, sign } from '../../../../utils/jwt';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  const payload = verify(token);
  
  if (!payload || !payload.email || !payload.action) {
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 400 });
  }

  const { email, action } = payload;

  if (action === 'approve') {
    try {
      // Generate the final access token for the user
      const accessToken = sign({ email, approved: true });
      
      await sendApprovalToUser(email, accessToken);
      
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
