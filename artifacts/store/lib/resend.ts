import { Resend } from 'resend';

let resendClient: Resend | null = null;

export function getResendClient() {
  if (resendClient) return resendClient;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    resendClient = new Resend(apiKey);
    return resendClient;
  } catch (error) {
    console.error('Failed to initialize Resend client:', error);
    return null;
  }
}

export async function sendOrderNotificationEmail(email: string, orderNumber: string, orderDetails: any) {
  const client = getResendClient();
  if (!client) {
    console.warn('Resend mailer is not configured yet. Skipping checkout mail confirmations.');
    return;
  }

  try {
    await client.emails.send({
      from: 'The Style Zone <orders@stylezone.com.np>',
      to: email,
      subject: `Order Confirmation #${orderNumber} | The Style Zone`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #101010; text-transform: uppercase;">Thank you for your Order!</h2>
          <p>We've received your order <strong>#${orderNumber}</strong> with The Style Zone Boutique.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <h4 style="margin-bottom: 5px;">Delivery Details:</h4>
          <p style="margin: 0; font-size: 14px; color: #555;">Name: ${orderDetails.customerName}</p>
          <p style="margin: 0; font-size: 14px; color: #555;">Address: ${orderDetails.shippingAddress}, ${orderDetails.shippingCity}</p>
          <p style="margin: 0; font-size: 14px; color: #555;">Phone: ${orderDetails.customerPhone}</p>
          <p style="margin: 0; font-size: 14px; color: #555;">Payment Mode: ${orderDetails.paymentMethod}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">If you made a QR payment transfer, please double-check that you entered your reference ID in the checkups queue helper.</p>
        </div>
      `
    });
  } catch (emailError) {
    console.error('Failed to send Resend email:', emailError);
  }
}
