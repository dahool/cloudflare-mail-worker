import type { ForwardableEmailMessage } from '@cloudflare/workers-types';
import { parseEmail } from './parser'

export interface Environment {
    AUTH_TOKEN: string;
    FORWARD_URL: string;
}

function encodeText(text: string): string {
    return Buffer.from(text, 'utf-8').toString('base64');
}

export async function emailHandler(message: ForwardableEmailMessage, env: Environment): Promise<void> {
    const id = message.headers.get('Message-ID') || '';
    const mail = await parseEmail(message);
    if (!mail) {
        console.log('Error parsing email');
        return;
    }

    console.log(`Body: ${mail.text}`);

    const payload = {
        from: mail.from,
        to: mail.to,
        datetime: mail.date || new Date().toISOString(),
        subject: mail.subject,
        message: encodeText(mail.text!)
    };

    console.log(`Payload POST ${env.FORWARD_URL}: ${payload}`);

    const response = await fetch(env.FORWARD_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-AUTHORIZATION-TOKEN": env.AUTH_TOKEN
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();
      console.log(responseData);

}