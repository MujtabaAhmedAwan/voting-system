import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD, // App password from Google
  },
});

export const sendOTP = async (to, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: 'Voting List App - Your Verification OTP',
    text: `Your OTP for the Voting List App is: ${otp}\nPlease do not share this code with anyone.`,
  };
  await transporter.sendMail(mailOptions);
};

export const notifyAdmin = async (user, approveToken, denyToken) => {
  let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  
  // Use path parameters instead of query parameters so email clients don't strip them
  const approveLink = `${baseUrl}/api/auth/admin-action/${approveToken}`;
  const denyLink = `${baseUrl}/api/auth/admin-action/${denyToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL || 'sultanmujtabaahmedawan@gmail.com',
    subject: '🚨 New User Pending Approval - Voting List App',
    html: `
      <h2>New Access Request</h2>
      <p>A new user has verified their email and is waiting for your approval to access the Voting App.</p>
      <ul>
        <li><strong>Name:</strong> ${user.name}</li>
        <li><strong>Email:</strong> ${user.email}</li>
        <li><strong>Phone:</strong> ${user.phone}</li>
      </ul>
      <p>Please click one of the buttons below to grant or deny access:</p>
      <br>
      <a href="${approveLink}" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 15px; font-weight: bold;">✅ Approve Access</a>
      <a href="${denyLink}" style="background-color: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">❌ Deny Access</a>
    `,
  };
  await transporter.sendMail(mailOptions);
};
