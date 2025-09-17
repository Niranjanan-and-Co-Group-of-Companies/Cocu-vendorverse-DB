
'use server';

import 'dotenv/config';

const ZEPTOMAIL_API_URL = "https://api.zeptomail.in/v1.1/email";

// Define the types of senders as outlined in the plan
export type MailSenderType = 'SYSTEM' | 'ORDERS' | 'VENDORS' | 'CHAMPIONS' | 'CORPORATE' | 'SUPPORT' | 'HELLO';

// Map the sender types to their corresponding from addresses and tokens
const SENDER_CONFIG: Record<MailSenderType, { address: string; name: string; token: string | undefined; }> = {
    SYSTEM: { address: 'system@coandcu.com', name: 'VendorVerse System', token: process.env.ZEPTOMAIL_SYSTEM_TOKEN },
    ORDERS: { address: 'orders@coandcu.com', name: 'VendorVerse Orders', token: process.env.ZEPTOMAIL_ORDERS_TOKEN },
    VENDORS: { address: 'vendors@coandcu.com', name: 'VendorVerse for Vendors', token: process.env.ZEPTOMAIL_VENDORS_TOKEN },
    CHAMPIONS: { address: 'champions@coandcu.com', name: 'VendorVerse Champions', token: process.env.ZEPTOMAIL_CHAMPIONS_TOKEN },
    CORPORATE: { address: 'corporate@coandcu.com', name: 'VendorVerse Corporate', token: process.env.ZEPTOMAIL_CORPORATE_TOKEN },
    SUPPORT: { address: 'support@coandcu.com', name: 'VendorVerse Support', token: process.env.ZEPTOMAIL_SUPPORT_TOKEN },
    HELLO: { address: 'hello@coandcu.com', name: 'VendorVerse', token: process.env.ZEPTOMAIL_HELLO_TOKEN },
};


interface ZeptoMailPayload {
    from: { address: string; name: string; };
    to: { email_address: { address: string; name: string; }; }[];
    subject: string;
    htmlbody: string;
}


/**
 * Sends an email using the ZeptoMail API with a specified sender type.
 */
async function sendEmail(senderType: MailSenderType, to: { email: string, name: string }, subject: string, htmlbody: string) {
    const sender = SENDER_CONFIG[senderType];
    const apiToken = sender.token;

    if (!apiToken || apiToken.startsWith('your_')) {
        console.log('--- EMAIL SIMULATION ---');
        console.log(`To: ${to.name} <${to.email}>`);
        console.log(`From: ${sender.name} <${sender.address}>`);
        console.log(`Subject: ${subject}`);
        console.log('Body:', htmlbody);
        console.log('--- END EMAIL SIMULATION ---');
        console.warn(`ZeptoMail token for ${senderType} is not configured. Email was simulated in the console.`);
        return { success: true, message: "Email simulated successfully." };
    }

    const payload: ZeptoMailPayload = {
        from: { address: sender.address, name: sender.name },
        to: [{ email_address: { address: to.email, name: to.name } }],
        subject,
        htmlbody,
    };

    try {
        const response = await fetch(ZEPTOMAIL_API_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': apiToken,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error("ZeptoMail API Error:", errorBody);
            throw new Error(errorBody.message || "Failed to send email.");
        }

        return { success: true, message: "Email sent successfully." };

    } catch (error) {
        console.error("Error sending email via ZeptoMail:", error);
        return { success: false, message: "An unexpected error occurred while sending the email." };
    }
}


/**
 * Sends a verification email to a new user.
 */
export async function sendVerificationEmail(toEmail: string, toName: string, verificationToken: string) {
    const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

    const subject = "Welcome to VendorVerse! Please Verify Your Email";
    const body = `
        <h1>Welcome, ${toName}!</h1>
        <p>Thank you for signing up. Please click the link below to verify your email address and activate your account:</p>
        <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email Address</a>
        <p>If you did not sign up for an account, you can safely ignore this email.</p>
    `;

    return sendEmail('HELLO', { email: toEmail, name: toName }, subject, body);
}
