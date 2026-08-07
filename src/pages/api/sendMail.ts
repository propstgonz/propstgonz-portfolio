import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024; // 25MB

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    const file = formData.get('file');

    if (
      typeof name !== 'string' || !name.trim() ||
      typeof email !== 'string' || !email.trim() ||
      typeof message !== 'string' || !message.trim()
    ) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    const attachments: { filename: string; content: Buffer; contentType: string }[] = [];

    if (file && typeof file !== 'string') {
      const buffer = Buffer.from(await file.arrayBuffer());

      if (buffer.length > MAX_ATTACHMENT_BYTES) {
        return new Response(
          JSON.stringify({ error: 'Your file exceeds 25MB' }),
          { status: 400 },
        );
      }

      if (buffer.length > 0) {
        attachments.push({
          filename: file.name,
          content: buffer,
          contentType: file.type || 'application/octet-stream',
        });
      }
    }

    const transporter = nodemailer.createTransport({
      host: import.meta.env.SMTP_HOST,
      port: Number(import.meta.env.SMTP_PORT ?? 587),
      secure: import.meta.env.SMTP_SECURE === 'true',
      auth: {
        user: import.meta.env.SMTP_USER,
        pass: import.meta.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${name}" <${import.meta.env.SMTP_USER}>`,
      replyTo: email,
      to: import.meta.env.CONTACT_TO,
      subject: `[portfolio] Message from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
      attachments,
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('[sendMail]', err);
    return new Response(JSON.stringify({ error: 'Failed to send' }), { status: 500 });
  }
};
