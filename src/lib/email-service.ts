
'use server';

const ZEPTOMAIL_API_KEY = process.env.ZEPTOMAIL_API_KEY;
const ZEPTOMAIL_API_URL = "https://api.zeptomail.in/v1.1/email";

interface ZeptoMailPayload {
    from: { address: string; name: string; };
    to: { email_address: { address: string; name: string; }; }[];
    subject: string;
    htmlbody: string;
}


/**
 * Sends an email using the ZeptoMail API.
 */
async function sendEmail(payload: ZeptoMailPayload) {
    if (!ZEPTOMAIL_API_KEY) {
        console.error('ZeptoMail API key is missing. Email not sent.');
        // In a non-demo app, you might want to throw an error or handle this more gracefully
        return { success: false, message: "Email service is not configured." };
    }

    try {
        const response = await fetch(ZEPTOMAIL_API_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': ZEPTOMAIL_API_KEY,
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

    const payload: ZeptoMailPayload = {
        from: { address: "no-reply@vendorverse.com", name: "VendorVerse" },
        to: [{ email_address: { address: toEmail, name: toName } }],
        subject: "Welcome to VendorVerse! Please Verify Your Email",
        htmlbody: `
            <h1>Welcome, ${toName}!</h1>
            <p>Thank you for signing up. Please click the link below to verify your email address and activate your account:</p>
            <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email Address</a>
            <p>If you did not sign up for an account, you can safely ignore this email.</p>
        `
    };

    return sendEmail(payload);
}
