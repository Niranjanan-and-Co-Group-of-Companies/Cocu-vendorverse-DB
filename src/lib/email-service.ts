
'use server';

import 'dotenv/config';

const ZEPTOMAIL_API_URL = "https://api.zeptomail.in/v1.1/email/template";

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


interface ZeptoMailTemplatePayload {
    mail_template_key: string;
    from: { address: string; name: string; };
    to: { email_address: { address: string; name: string; }; }[];
    merge_info: Record<string, any>;
}


/**
 * Sends a templated email using the ZeptoMail API.
 */
async function sendEmail(
    senderType: MailSenderType, 
    to: { email: string, name: string }, 
    templateKey: string,
    mergeInfo: Record<string, any>
) {
    const sender = SENDER_CONFIG[senderType];
    const apiToken = sender.token;

    if (!apiToken || apiToken.startsWith('your_') || !templateKey || templateKey.startsWith('your_')) {
        console.log('--- EMAIL SIMULATION (Template) ---');
        console.log(`To: ${to.name} <${to.email}>`);
        console.log(`From: ${sender.name} <${sender.address}>`);
        console.log(`Template Key: ${templateKey}`);
        console.log('Merge Info:', JSON.stringify(mergeInfo, null, 2));
        console.log('--- END EMAIL SIMULATION ---');
        const reason = !apiToken || apiToken.startsWith('your_') ? `token for ${senderType}` : 'template key';
        console.warn(`ZeptoMail ${reason} is not configured. Email was simulated in the console.`);
        return { success: true, message: "Email simulated successfully." };
    }

    const payload: ZeptoMailTemplatePayload = {
        mail_template_key: templateKey,
        from: { address: sender.address, name: sender.name },
        to: [{ email_address: { address: to.email, name: to.name } }],
        merge_info: mergeInfo,
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
 * Sends a welcome email to a new user.
 */
export async function sendWelcomeEmail(toEmail: string, toName: string) {
    const templateKey = process.env.ZEPTOMAIL_WELCOME_TEMPLATE_KEY || '';

    const mergeInfo = {
        name: toName,
    };
    
    // Use the HELLO mail agent for a friendly welcome
    return sendEmail('HELLO', { email: toEmail, name: toName }, templateKey, mergeInfo);
}

/**
 * Sends an OTP email to a user.
 */
export async function sendOtpEmail(toEmail: string, toName: string, otp: string) {
    const templateKey = process.env.ZEPTOMAIL_OTP_TEMPLATE_KEY || '';
    
    const mergeInfo = {
        name: toName,
        otp: otp,
        expires_in_minutes: '10' // Standard expiry time
    };

    // Use the SYSTEM mail agent for critical transactional emails
    return sendEmail('SYSTEM', { email: toEmail, name: toName }, templateKey, mergeInfo);
}
