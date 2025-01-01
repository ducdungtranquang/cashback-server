import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const resetUrl = `${process.env.RESET_URL}/${token}`;

  const message = `
    <h1>Password Reset Request</h1>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetUrl}">Reset Password</a>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset Request",
    html: message,
  });
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${process.env.VERIFY_URL}/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify Your Email",
    html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
  };

  await transporter.sendMail(mailOptions);
};

export const sendEmailWithdrawRequest = async (
  email: string,
  verificationCode: string
) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Xác thực email",
    html: verificationCode,
  };

  await transporter.sendMail(mailOptions);
};
