import type { gmail_v1 } from "googleapis";
import { google } from "googleapis";
import { createTransport, type SentMessageInfo } from "nodemailer";

let _gmail: gmail_v1.Gmail | null = null;
function getGmail() {
  if (_gmail == null) {
    const secretKey = getGoogleKey();

    _gmail = google.gmail({
      version: "v1",
      auth: new google.auth.JWT({
        email: secretKey.client_email,
        key: secretKey.private_key,
        scopes: ["https://www.googleapis.com/auth/gmail.send"],
        subject: "no-reply@ronimisliit.ee",
      }),
    });
  }

  return _gmail;
}

const emailTransport = createTransport({ streamTransport: true, buffer: true });

function formatMail(options: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  return new Promise<SentMessageInfo>((resolve, reject) => {
    emailTransport.sendMail(
      {
        from: "no-reply@ronimisliit.ee",
        replyTo: "julgestajakaart@ronimisliit.ee",
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      },
      (err, info) => {
        if (err) {
          reject(err);
        } else {
          resolve(info);
        }
      },
    );
  });
}

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html: string,
) {
  const mail = await formatMail({ to, subject, text, html });

  await getGmail().users.messages.send({
    userId: "me",
    requestBody: { raw: mail.message.toString("base64url") },
  });
}
