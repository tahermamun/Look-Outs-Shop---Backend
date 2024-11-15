import nodemailer from 'nodemailer';

export const sendEmail = async (subjectText, emailTo, message) => {
    const transporter = nodemailer.createTransport({
        service: process.env.SERVICE,
        // host: "smtp.gmail.com",
        // port: 465,
        // secure: true,
        auth: {
            user: process.env.MAIL,
            pass: process.env.PASSWORD,
        },
    });

    const info = await transporter.sendMail({
        from: process.env.MAIL,
        to: emailTo,
        subject: subjectText,
        text: message.toString(),
    });
};
