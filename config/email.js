const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'FEM Bank <onboarding@resend.dev>';

// Beautiful card component for all emails
const emailWrapper = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FEM Bank</title>
</head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:'Courier New',monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          
          <!-- Header -->
          <tr>
            <td style="background:#0B3D2E;border:1px solid #FFD700;padding:24px;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="border:2px solid #FFD700;display:inline-block;padding:8px 24px;margin-bottom:8px;">
                      <span style="font-size:28px;font-weight:900;color:#FFD700;letter-spacing:6px;">FEM</span>
                      <span style="font-size:28px;font-weight:400;color:#00A86B;letter-spacing:6px;">BANK</span>
                    </div>
                    <p style="color:#B8960C;font-size:11px;letter-spacing:3px;margin:0;">SECURE · FAST · RELIABLE</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="background:#111111;border:1px solid #333;border-top:none;padding:32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0A0A0A;border:1px solid #222;border-top:none;padding:20px;text-align:center;">
              <p style="color:#333;font-size:11px;letter-spacing:2px;margin:0;">FEM BANK © 2026 — BANK CODE: 822</p>
              <p style="color:#222;font-size:10px;margin:4px 0 0 0;">POWERED BY NIBSSBYPHOENIX</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const sendWelcomeEmail = async (email, name, accountNumber) => {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: '🏦 Welcome to FEM Bank — Account Created Successfully',
      html: emailWrapper(`
        <p style="color:#00A86B;font-size:14px;letter-spacing:2px;margin:0 0 8px 0;">> SYSTEM_MESSAGE</p>
        <h2 style="color:#FFD700;font-size:20px;margin:0 0 24px 0;letter-spacing:2px;">ACCOUNT_CREATED_SUCCESSFULLY</h2>
        
        <p style="color:#cccccc;font-size:14px;margin:0 0 24px 0;">Dear <strong style="color:#FFD700;">${name}</strong>,</p>
        <p style="color:#aaaaaa;font-size:13px;line-height:1.6;margin:0 0 24px 0;">
          Welcome to FEM Bank! Your account has been successfully created and verified. 
          You can now access all our banking services.
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B3D2E;border:1px solid #FFD700;margin:0 0 24px 0;">
          <tr><td style="padding:20px;">
            <p style="color:#B8960C;font-size:11px;letter-spacing:2px;margin:0 0 16px 0;">> ACCOUNT_DETAILS</p>
            <table width="100%" cellpadding="8" cellspacing="0">
              <tr>
                <td style="color:#666;font-size:12px;">ACCOUNT_NAME</td>
                <td style="color:#FFD700;font-size:12px;text-align:right;">${name}</td>
              </tr>
              <tr>
                <td style="color:#666;font-size:12px;">ACCOUNT_NUMBER</td>
                <td style="color:#FFD700;font-size:16px;text-align:right;font-weight:bold;letter-spacing:2px;">${accountNumber}</td>
              </tr>
              <tr>
                <td style="color:#666;font-size:12px;">BANK_NAME</td>
                <td style="color:#FFD700;font-size:12px;text-align:right;">FEM BANK</td>
              </tr>
              <tr>
                <td style="color:#666;font-size:12px;">BANK_CODE</td>
                <td style="color:#FFD700;font-size:12px;text-align:right;">822</td>
              </tr>
              <tr>
                <td style="color:#666;font-size:12px;">OPENING_BALANCE</td>
                <td style="color:#00A86B;font-size:12px;text-align:right;">₦15,000.00</td>
              </tr>
            </table>
          </td></tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" style="background:#1A0A0A;border:1px solid #FF4444;">
          <tr><td style="padding:16px;">
            <p style="color:#FF4444;font-size:11px;letter-spacing:2px;margin:0 0 8px 0;">> SECURITY_NOTICE</p>
            <p style="color:#aaaaaa;font-size:12px;margin:0;line-height:1.6;">
              Never share your password, OTP, or account details with anyone — including FEM Bank staff.
            </p>
          </td></tr>
        </table>
      `)
    });
    console.log('✅ Welcome email sent to:', email);
  } catch (error) {
    console.log('❌ Welcome email failed:', error.message);
  }
};

const sendOTPEmail = async (email, name, otp, purpose = 'registration') => {
  const purposeLabel = purpose === 'reset' ? 'PASSWORD_RESET' : 'ACCOUNT_REGISTRATION';
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `🔐 FEM Bank — Your OTP for ${purposeLabel}`,
      html: emailWrapper(`
        <p style="color:#00A86B;font-size:14px;letter-spacing:2px;margin:0 0 8px 0;">> SECURITY_ALERT</p>
        <h2 style="color:#FFD700;font-size:20px;margin:0 0 24px 0;letter-spacing:2px;">ONE_TIME_PASSCODE</h2>

        <p style="color:#cccccc;font-size:14px;margin:0 0 8px 0;">Dear <strong style="color:#FFD700;">${name}</strong>,</p>
        <p style="color:#aaaaaa;font-size:13px;line-height:1.6;margin:0 0 24px 0;">
          Your one-time passcode for <strong style="color:#FFD700;">${purposeLabel}</strong> is:
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B3D2E;border:2px solid #FFD700;margin:0 0 24px 0;">
          <tr><td style="padding:32px;text-align:center;">
            <p style="color:#FFD700;font-size:48px;font-weight:900;letter-spacing:12px;margin:0;font-family:'Courier New',monospace;">${otp}</p>
            <p style="color:#B8960C;font-size:11px;letter-spacing:2px;margin:12px 0 0 0;">EXPIRES IN 10 MINUTES</p>
          </td></tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" style="background:#1A0A0A;border:1px solid #FF4444;">
          <tr><td style="padding:16px;">
            <p style="color:#FF4444;font-size:11px;letter-spacing:2px;margin:0 0 8px 0;">> SECURITY_WARNING</p>
            <p style="color:#aaaaaa;font-size:12px;margin:0;line-height:1.6;">
              Never share this OTP with anyone. FEM Bank will never ask for your OTP. 
              If you did not request this, please ignore this email.
            </p>
          </td></tr>
        </table>
      `)
    });
    console.log('✅ OTP email sent to:', email);
  } catch (error) {
    console.log('❌ OTP email failed:', error.message);
  }
};

const sendDebitEmail = async (email, name, amount, toAccount, reference) => {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `🔴 Debit Alert — ₦${Number(amount).toLocaleString()} sent from your account`,
      html: emailWrapper(`
        <p style="color:#FF4444;font-size:14px;letter-spacing:2px;margin:0 0 8px 0;">> DEBIT_ALERT</p>
        <h2 style="color:#FF4444;font-size:20px;margin:0 0 24px 0;letter-spacing:2px;">▼ FUNDS_DEBITED</h2>

        <p style="color:#cccccc;font-size:14px;margin:0 0 8px 0;">Dear <strong style="color:#FFD700;">${name}</strong>,</p>
        <p style="color:#aaaaaa;font-size:13px;line-height:1.6;margin:0 0 24px 0;">
          A debit transaction has been made on your FEM Bank account.
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B3D2E;border:1px solid #FF4444;margin:0 0 24px 0;">
          <tr><td style="padding:20px;">
            <p style="color:#FF4444;font-size:11px;letter-spacing:2px;margin:0 0 16px 0;">> TRANSACTION_DETAILS</p>
            <table width="100%" cellpadding="8" cellspacing="0">
              <tr>
                <td style="color:#666;font-size:12px;">AMOUNT_DEBITED</td>
                <td style="color:#FF4444;font-size:20px;text-align:right;font-weight:bold;">-₦${Number(amount).toLocaleString()}</td>
              </tr>
              <tr>
                <td style="color:#666;font-size:12px;">TO_ACCOUNT</td>
                <td style="color:#FFD700;font-size:12px;text-align:right;">${toAccount}</td>
              </tr>
              <tr>
                <td style="color:#666;font-size:12px;">REFERENCE</td>
                <td style="color:#FFD700;font-size:11px;text-align:right;">${reference}</td>
              </tr>
              <tr>
                <td style="color:#666;font-size:12px;">DATE_TIME</td>
                <td style="color:#FFD700;font-size:12px;text-align:right;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
          </td></tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" style="background:#1A0A0A;border:1px solid #FF4444;">
          <tr><td style="padding:16px;">
            <p style="color:#FF4444;font-size:11px;letter-spacing:2px;margin:0 0 8px 0;">> NOT_YOU?</p>
            <p style="color:#aaaaaa;font-size:12px;margin:0;line-height:1.6;">
              If you did not initiate this transaction, please contact FEM Bank immediately and change your password.
            </p>
          </td></tr>
        </table>
      `)
    });
    console.log('✅ Debit email sent to:', email);
  } catch (error) {
    console.log('❌ Debit email failed:', error.message);
  }
};

const sendCreditEmail = async (email, name, amount, fromAccount, reference) => {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `🟢 Credit Alert — ₦${Number(amount).toLocaleString()} received in your account`,
      html: emailWrapper(`
        <p style="color:#00A86B;font-size:14px;letter-spacing:2px;margin:0 0 8px 0;">> CREDIT_ALERT</p>
        <h2 style="color:#00A86B;font-size:20px;margin:0 0 24px 0;letter-spacing:2px;">▲ FUNDS_RECEIVED</h2>

        <p style="color:#cccccc;font-size:14px;margin:0 0 8px 0;">Dear <strong style="color:#FFD700;">${name}</strong>,</p>
        <p style="color:#aaaaaa;font-size:13px;line-height:1.6;margin:0 0 24px 0;">
          Your FEM Bank account has been credited.
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B3D2E;border:1px solid #00A86B;margin:0 0 24px 0;">
          <tr><td style="padding:20px;">
            <p style="color:#00A86B;font-size:11px;letter-spacing:2px;margin:0 0 16px 0;">> TRANSACTION_DETAILS</p>
            <table width="100%" cellpadding="8" cellspacing="0">
              <tr>
                <td style="color:#666;font-size:12px;">AMOUNT_RECEIVED</td>
                <td style="color:#00A86B;font-size:20px;text-align:right;font-weight:bold;">+₦${Number(amount).toLocaleString()}</td>
              </tr>
              <tr>
                <td style="color:#666;font-size:12px;">FROM_ACCOUNT</td>
                <td style="color:#FFD700;font-size:12px;text-align:right;">${fromAccount}</td>
              </tr>
              <tr>
                <td style="color:#666;font-size:12px;">REFERENCE</td>
                <td style="color:#FFD700;font-size:11px;text-align:right;">${reference}</td>
              </tr>
              <tr>
                <td style="color:#666;font-size:12px;">DATE_TIME</td>
                <td style="color:#FFD700;font-size:12px;text-align:right;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
          </td></tr>
        </table>
      `)
    });
    console.log('✅ Credit email sent to:', email);
  } catch (error) {
    console.log('❌ Credit email failed:', error.message);
  }
};

const sendPasswordResetEmail = async (email, name, otp) => {
  await sendOTPEmail(email, name, otp, 'reset');
};

module.exports = {
  sendWelcomeEmail,
  sendOTPEmail,
  sendDebitEmail,
  sendCreditEmail,
  sendPasswordResetEmail
};