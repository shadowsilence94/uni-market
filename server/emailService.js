const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  // For development, use ethereal email (test email service)
  // For production, use your actual SMTP settings
  if (process.env.NODE_ENV === 'development' && !process.env.SMTP_USER) {
    // Return a dummy transporter for development
    return {
      sendMail: async (mailOptions) => {
        console.log('📧 Email would be sent in production:');
        console.log('To:', mailOptions.to);
        console.log('Subject:', mailOptions.subject);
        console.log('Link:', mailOptions.html.match(/href="([^"]+)"/)?.[1]);
        return { messageId: 'dev-' + Date.now() };
      }
    };
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Send verification email
const sendVerificationEmail = async (email, name, token) => {
  try {
    const transporter = createTransporter();
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'Uni-Market'}" <${process.env.FROM_EMAIL || 'noreply@uni-market.com'}>`,
      to: email,
      subject: 'Verify Your Email - Uni-Market',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1a5f3f, #2d8659); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #1a5f3f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .button:hover { background: #2d8659; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛒 Uni-Market</h1>
              <p>Welcome to the AIT Community Marketplace!</p>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>Thank you for registering with Uni-Market! We're excited to have you join our community.</p>
              <p>To complete your registration and start buying and selling, please verify your email address by clicking the button below:</p>
              <div style="text-align: center;">
                <a href="${verificationLink}" class="button">Verify Email Address</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #1a5f3f;">${verificationLink}</p>
              <p><strong>This link will expire in 24 hours.</strong></p>
              <p>If you didn't create an account with Uni-Market, please ignore this email.</p>
              <p>Best regards,<br>The Uni-Market Team</p>
            </div>
            <div class="footer">
              <p>© 2025 Uni-Market. All rights reserved.</p>
              <p>Asian Institute of Technology</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
};

// Send purchase confirmation email
const sendPurchaseConfirmation = async (email, name, itemTitle, amount) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'Uni-Market'}" <${process.env.FROM_EMAIL || 'noreply@uni-market.com'}>`,
    to: email,
    subject: 'Purchase Confirmation - Uni-Market',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1a5f3f, #2d8659); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛒 Purchase Confirmation</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Your order has been confirmed!</p>
            <div class="order-details">
              <h3>Order Details</h3>
              <p><strong>Item:</strong> ${itemTitle}</p>
              <p><strong>Amount:</strong> ฿${amount}</p>
            </div>
            <p>The payment is being held in escrow and will be released to the seller once you confirm receipt of the item.</p>
            <p>If you have any questions, please contact us.</p>
            <p>Best regards,<br>The Uni-Market Team</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Purchase confirmation sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPurchaseConfirmation
};
