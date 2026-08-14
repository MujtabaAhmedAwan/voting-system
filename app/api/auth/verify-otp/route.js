import { NextResponse } from 'next/server';
import { notifyAdmin } from '../../../../utils/email';
import { verify, sign } from '../../../../utils/jwt';

export async function POST(request) {
  try {
    const { token, otp } = await request.json();
    
    if (!token) {
      return NextResponse.json({ success: false, error: 'Missing token' }, { status: 400 });
    }

    const payload = verify(token);

    if (!payload || payload.otp !== otp) {
      return NextResponse.json({ success: false, error: 'Invalid or expired OTP' }, { status: 400 });
    }

    // OTP is correct!
    // Generate admin action tokens
    const approveToken = sign({ email: payload.email, action: 'approve', name: payload.name, phone: payload.phone });
    const denyToken = sign({ email: payload.email, action: 'deny' });

    // Notify the admin via email
    if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
       await notifyAdmin(payload, approveToken, denyToken);
    } else {
       console.log(`[DEV MODE] Admin notified about ${payload.email}. Tokens generated.`);
    }

    return NextResponse.json({ success: true, message: 'Email verified successfully. Waiting for admin approval.' });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to verify OTP' }, { status: 500 });
  }
}
