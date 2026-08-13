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

export const notifyAdmin = async (user) => {
  let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  
  const approveLink = `${baseUrl}/api/auth/admin-action?email=${encodeURIComponent(user.email)}&action=approve`;
  const denyLink = `${baseUrl}/api/auth/admin-action?email=${encodeURIComponent(user.email)}&action=deny`;

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

export const sendApprovalToUser = async (userEmail) => {
  let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const accessLink = `${baseUrl}/?approved=true&email=${encodeURIComponent(userEmail)}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: '✅ Access Approved - Voting List App',
    html: `
      <h2>Access Granted!</h2>
      <p>The admin has approved your request. You can now access the Voting List System.</p>
      <br>
      <a href="${accessLink}" style="background-color: #3b82f6; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Login to System</a>
    `,
  };
  await transporter.sendMail(mailOptions);
};
