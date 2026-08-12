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
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL || 'sultanmujtabaahmedawan@gmail.com',
    subject: 'New User Pending Approval - Voting List App',
    text: `A new user has verified their email and is waiting for your approval to access the app.\n\nName: ${user.name}\nEmail: ${user.email}\nPhone: ${user.phone}\n\nPlease login to the Admin Dashboard to approve or reject them.`,
  };
  await transporter.sendMail(mailOptions);
};
