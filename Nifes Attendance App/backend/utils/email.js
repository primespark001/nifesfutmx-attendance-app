import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(path.dirname(path.dirname(__dirname)), 'frontend');

export async function sendCode(details){
    const {email, code} = details;
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'NIFES FUTMX Password Reset',
        text: 'NIFES FUTMX Password Reset Code',
        html: `
            <body>
                <div style="margin-bottom: 1em; display: flex; flex-direction: column; gap: .5em; align-items: center">
                    <img style="height: 5em; width: 5em; border-radius: 50%; object-fit: cover; object-position: center;" src="${path.join(frontendPath, 'resources', 'nifeslogo.png')}" alt="Nifes Logo">
                    <h1>NIFES FUTMX</h1>                
                </div>
                <h3>Password Reset Code</h3>
                <div style="display: flex; gap: 1em; align-items: center; margin-bottom: 1em;">
                    <p>Code</p>
                    <h2 style="padding: .5em; background: #008; color: #fff; border-radius: 5px;">${code}</h2>
                </div>
                <p>Use this code to reset your password</p>
                <p><b>NOTE: IF YOU DID NOT REQUEST FOR THIS CODE JUST LEAVE IT! CODE EXPIRES IN ONE MINUTE!</b></p>
                <i>Building tomorrow's leaders today...</i>
            </body>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if(error){
            console.error(`Error occurred: ${error}`);
            return false;
        } else {
            console.log('Email sent successfully');
            console.log(`Message ID: ${info.messageId}`);
            return true;
        }
    });
}