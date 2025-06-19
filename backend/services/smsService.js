import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendOTPSMS = async (phone, otp) => {
    try {
        await client.messages.create({
            body: `Your OTP for GGU Foodies signup is: ${otp}. It is valid for 10 minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone,
        });
        console.log(`OTP sent to ${phone}`);
    } catch (error) {
        console.error('Error sending OTP SMS:', error);
        throw new Error('Failed to send OTP SMS');
    }
};

export { sendOTPSMS };