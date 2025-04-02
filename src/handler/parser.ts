import type { ForwardableEmailMessage } from '@cloudflare/workers-types';
import type { Email, RawEmail } from 'postal-mime';
import { convert } from 'html-to-text';
import PostalMime from 'postal-mime';

export async function parseEmail(message: ForwardableEmailMessage): Promise<Email | null> {
    let emailRaw = message.raw;
    try {
        const parser = new PostalMime();
        const email = await parser.parse(emailRaw as RawEmail);
        if (email.html) {
            email.text = convert(email.html, {});
        }
        return email;
    } catch (e) {
        const msg = `Error parsing email: ${(e as Error).message}`;
        console.error(msg)
    }
    return null;
}