import nodemailer from 'nodemailer';

export const sendResetPasswordEmail = async (email: string, token: string) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: "tranthideptrai@gmail.com",
            pass: "kori dbhe nvhs emou",
        },
    });


    const resetUrl = `${process.env.RESET_URL}/${token}`;

    const message = `
    <h1>Password Reset Request</h1>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetUrl}">Reset Password</a>
  `;

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request',
        html: message,
    });
};
