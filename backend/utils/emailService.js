const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1. Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
    port: process.env.SMTP_PORT || 2525,
    auth: {
      user: process.env.SMTP_USER || "placeholder_user", 
      pass: process.env.SMTP_PASS || "placeholder_pass",
    },
  });

  // 2. Define email options
  const mailOptions = {
    from: process.env.EMAIL_FROM || "Student Event Management System <noreply@studentevents.com>",
    to: options.email,
    subject: options.subject,
    html: options.html || `<p>${options.message}</p>`,
    text: options.message,
  };

  // 3. Actually send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${options.email}`);
  } catch (error) {
    console.log("Error sending email: ", error);
    throw error;
  }
};

module.exports = sendEmail;
