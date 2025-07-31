"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_ENDPOINT,
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
        user: process.env.SMTP_AUTH_EMAIL,
        pass: process.env.SMTP_AUTH_PASSWORD,
    },
});
// async..await is not allowed in global scope, must use a wrapper
async function sendEmail(to, body) {
    const info = await transporter.sendMail({
        from: process.env.SMTP_AUTH_EMAIL,
        to,
        subject: "From Automation App",
        text: body,
    });
    console.log("Message sent: %s", info.messageId);
}
