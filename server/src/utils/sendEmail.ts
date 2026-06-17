import nodemailer from 'nodemailer';

interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export const sendEmail = async (options: SendEmailOptions) => {
  try {
    let transporter;

    const isMockEnv = !process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_USER === 'your_email@gmail.com';

    if (isMockEnv) {
      // Create a fake test account dynamically (Ethereal Email)
      const testAccount = await nodemailer.createTestAccount();
      
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass, // generated ethereal password
        },
      });

      console.log('Using Ethereal (Mock) Email Provider');
    } else {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    }

    const mailOptions = {
      from: `FormBuilder <${process.env.EMAIL_USER || 'test@ethereal.email'}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    
    // If it's a test email, generate a preview URL
    if (isMockEnv) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log("Preview URL: %s", previewUrl);
      return { success: true, previewUrl };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending email: ', error);
    return { success: false };
  }
};
