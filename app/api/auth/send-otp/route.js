import { NextResponse } from 'next/server';
import { sendOTP } from '../../../../utils/email';
import { sign } from '../../../../utils/jwt';

export async function POST(request) {
  try {
    const { name, email, phone } = await request.json();
    
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Sign a token containing the OTP and user info (expires in 10 mins conceptually)
    const token = sign({ email, otp, name, phone, timestamp: Date.now() });

    // Send OTP via email
    if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
       await sendOTP(email, otp);
       return NextResponse.json({ success: true, message: 'OTP sent successfully', token });
    } else {
       console.log(`[DEV MODE] OTP for ${email} is: ${otp}`);
       return NextResponse.json({ success: false, error: 'Vercel Environment Variables (EMAIL_USER or EMAIL_APP_PASSWORD) are completely missing or empty!' }, { status: 500 });
    }
  } catch (error) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to send OTP' }, { status: 500 });
  }
}
