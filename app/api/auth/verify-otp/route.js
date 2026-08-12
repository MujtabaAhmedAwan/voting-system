import { NextResponse } from 'next/server';
import { notifyAdmin } from '../../../utils/email';

export async function POST(request) {
  try {
    const { email, otp } = await request.json();
    
    const storedData = global.otpStore?.get(email);

    if (!storedData || storedData.otp !== otp) {
      return NextResponse.json({ success: false, error: 'Invalid or expired OTP' }, { status: 400 });
    }

    // OTP is correct! 
    // In a real app, we update the user as `isVerified: true` in the DB here.
    
    // Notify the admin via email
    if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
       await notifyAdmin(storedData);
    } else {
       console.log(`[DEV MODE] Admin notified about ${email}`);
    }

    // Clear the OTP
    global.otpStore.delete(email);

    return NextResponse.json({ success: true, message: 'Email verified successfully. Waiting for admin approval.' });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to verify OTP' }, { status: 500 });
  }
}
