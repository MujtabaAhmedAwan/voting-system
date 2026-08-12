import { NextResponse } from 'next/server';
import { sendOTP } from '../../../utils/email';

// In a real app, this would be stored in the database.
// For Vercel deployment preview, we use an in-memory map (note: resets on serverless cold starts)
global.otpStore = global.otpStore || new Map();

export async function POST(request) {
  try {
    const { name, email, phone } = await request.json();
    
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP temporarily (email as key)
    global.otpStore.set(email, { otp, name, phone, timestamp: Date.now() });

    // Send OTP via email
    if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
       await sendOTP(email, otp);
    } else {
       console.log(`[DEV MODE] OTP for ${email} is: ${otp}`);
       // If no email config, we still pretend it succeeded for UI preview
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send OTP' }, { status: 500 });
  }
}
