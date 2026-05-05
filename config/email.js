const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendWelcomeEmail = async (email, name, accountNumber) => {
  try {
    await transporter.sendMail({
      from: `"FEM Bank" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to FEM Bank! 🏦',
      html: `
        <div style="background:#0A0A0A;padding:40px;font-family:monospace;color:#FFD700;">
          <h1 style="color:#FFD700;letter-spacing:4px;">🏦 FEM BANK</h1>
          <hr style="border-color:#FFD700;"/>
          <p style="color:#00A86B;font-size:16px;">Dear ${name},</p>
          <p style="color:#ffffff;">Welcome to FEM Bank! Your account has been created successfully.</p>
          <div style="background:#0B3D2E;border:1px solid #FFD700;padding:20px;margin:20px 0;">
            <p style="color:#B8960C;">ACCOUNT_NUMBER :: <strong style="color:#FFD700;">${accountNumber}</strong></p>
            <p style="color:#B8960C;">BANK_NAME :: <strong style="color:#FFD700;">FEM BANK</strong></p>
            <p style="color:#B8960C;">BANK_CODE :: <strong style="color:#FFD700;">822</strong></p>
          </div>
          <p style="color:#444;">Keep your account details safe and never share your password.</p>
          <hr style="border-color:#333;"/>
          <p style="color:#333;font-size:12px;">FEM BANK © 2026 — POWERED BY NIBSSBYPHOENIX</p>
        </div>
      `
    });
    console.log('✅ Welcome email sent to:', email);
  } catch (error) {
    console.log('❌ Welcome email failed:', error.message);
  }
};

const sendDebitEmail = async (email, name, amount, toAccount, reference) => {
  try {
    await transporter.sendMail({
      from: `"FEM Bank" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Debit Alert — ₦${Number(amount).toLocaleString()} sent`,
      html: `
        <div style="background:#0A0A0A;padding:40px;font-family:monospace;color:#FFD700;">
          <h1 style="color:#FFD700;letter-spacing:4px;">🏦 FEM BANK</h1>
          <hr style="border-color:#FF4444;"/>
          <p style="color:#FF4444;font-size:20px;">▼ DEBIT ALERT</p>
          <p style="color:#00A86B;">Dear ${name},</p>
          <p style="color:#ffffff;">A debit transaction has been made on your account.</p>
          <div style="background:#0B3D2E;border:1px solid #FF4444;padding:20px;margin:20px 0;">
            <p style="color:#B8960C;">AMOUNT :: <strong style="color:#FF4444;">-₦${Number(amount).toLocaleString()}</strong></p>
            <p style="color:#B8960C;">TO_ACCOUNT :: <strong style="color:#FFD700;">${toAccount}</strong></p>
            <p style="color:#B8960C;">REFERENCE :: <strong style="color:#FFD700;">${reference}</strong></p>
            <p style="color:#B8960C;">DATE :: <strong style="color:#FFD700;">${new Date().toLocaleString()}</strong></p>
          </div>
          <p style="color:#444;">If you did not initiate this transaction, contact us immediately.</p>
          <hr style="border-color:#333;"/>
          <p style="color:#333;font-size:12px;">FEM BANK © 2026</p>
        </div>
      `
    });
    console.log('✅ Debit email sent to:', email);
  } catch (error) {
    console.log('❌ Debit email failed:', error.message);
  }
};

const sendCreditEmail = async (email, name, amount, fromAccount, reference) => {
  try {
    await transporter.sendMail({
      from: `"FEM Bank" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Credit Alert — ₦${Number(amount).toLocaleString()} received`,
      html: `
        <div style="background:#0A0A0A;padding:40px;font-family:monospace;color:#FFD700;">
          <h1 style="color:#FFD700;letter-spacing:4px;">🏦 FEM BANK</h1>
          <hr style="border-color:#00A86B;"/>
          <p style="color:#00A86B;font-size:20px;">▲ CREDIT ALERT</p>
          <p style="color:#00A86B;">Dear ${name},</p>
          <p style="color:#ffffff;">Your account has been credited.</p>
          <div style="background:#0B3D2E;border:1px solid #00A86B;padding:20px;margin:20px 0;">
            <p style="color:#B8960C;">AMOUNT :: <strong style="color:#00A86B;">+₦${Number(amount).toLocaleString()}</strong></p>
            <p style="color:#B8960C;">FROM_ACCOUNT :: <strong style="color:#FFD700;">${fromAccount}</strong></p>
            <p style="color:#B8960C;">REFERENCE :: <strong style="color:#FFD700;">${reference}</strong></p>
            <p style="color:#B8960C;">DATE :: <strong style="color:#FFD700;">${new Date().toLocaleString()}</strong></p>
          </div>
          <hr style="border-color:#333;"/>
          <p style="color:#333;font-size:12px;">FEM BANK © 2026</p>
        </div>
      `
    });
    console.log('✅ Credit email sent to:', email);
  } catch (error) {
    console.log('❌ Credit email failed:', error.message);
  }
};

const sendForgotPasswordEmail = async (email, name, newPassword) => {
  try {
    await transporter.sendMail({
      from: `"FEM Bank" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'FEM Bank — Password Reset',
      html: `
        <div style="background:#0A0A0A;padding:40px;font-family:monospace;color:#FFD700;">
          <h1 style="color:#FFD700;letter-spacing:4px;">🏦 FEM BANK</h1>
          <hr style="border-color:#FFD700;"/>
          <p style="color:#00A86B;">Dear ${name},</p>
          <p style="color:#ffffff;">Your password has been reset successfully.</p>
          <div style="background:#0B3D2E;border:1px solid #FFD700;padding:20px;margin:20px 0;">
            <p style="color:#B8960C;">NEW_PASSWORD :: <strong style="color:#FFD700;">${newPassword}</strong></p>
          </div>
          <p style="color:#FF4444;">Please login and change your password immediately.</p>
          <hr style="border-color:#333;"/>
          <p style="color:#333;font-size:12px;">FEM BANK © 2026</p>
        </div>
      `
    });
    console.log('✅ Password reset email sent to:', email);
  } catch (error) {
    console.log('❌ Password reset email failed:', error.message);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendDebitEmail,
  sendCreditEmail,
  sendForgotPasswordEmail
};