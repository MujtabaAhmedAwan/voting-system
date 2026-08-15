import { NextResponse } from 'next/server';
import { verify, sign } from '../../../../../utils/jwt';
import { setStatus } from '../../../../../utils/store';

export async function GET(request, { params }) {
  const token = params.token;
  let email, action;

  if (token) {
    const payload = verify(token);
    if (!payload || !payload.email || !payload.action) {
      return NextResponse.json({ error: 'Invalid or expired link' }, { status: 400 });
    }
    email = payload.email;
    action = payload.action;
  } else {
    return NextResponse.json({ error: 'Missing token in URL. Please try registering again.' }, { status: 400 });
  }

  if (action === 'approve') {
    try {
      // Generate the final access token for the user
      const accessToken = sign({ email, approved: true });
      
      // Save state to store so frontend can automatically login without opening gmail
      setStatus(email, { status: 'approved', accessToken });
      
      return new NextResponse(`
        <html>
          <body style="font-family: sans-serif; text-align: center; margin-top: 50px;">
            <h1 style="color: green;">User Approved Successfully!</h1>
            <p>The user will be logged in automatically in their app.</p>
          </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' } });
    } catch (e) {
      console.error(e);
      return NextResponse.json({ error: 'Failed to process approval' }, { status: 500 });
    }
  } 
  
  if (action === 'deny') {
    setStatus(email, { status: 'denied' });
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
