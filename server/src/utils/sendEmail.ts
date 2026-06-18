import nodemailer from 'nodemailer';

interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export const sendEmail = async (options: SendEmailOptions) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Error: EMAIL_USER and EMAIL_PASS environment variables must be set.');
      return { success: false };
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `FormBuilder <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    await transporter.sendMail(mailOptions);

    return { success: true };
  } catch (error) {
    console.error('Error sending email: ', error);
    return { success: false };
  }
};
