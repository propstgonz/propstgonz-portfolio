import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { name, email, message } = await request.json() as {
      name: string; email: string; message: string;
    };

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host:   import.meta.env.SMTP_HOST,
      port:   Number(import.meta.env.SMTP_PORT ?? 587),
      secure: import.meta.env.SMTP_SECURE === 'true',
      auth: {
        user: import.meta.env.SMTP_USER,
        pass: import.meta.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from:    `"${name}" <${import.meta.env.SMTP_USER}>`,
      replyTo: email,
      to:      import.meta.env.CONTACT_TO,
      subject: `[portfolio] Message from ${name}`,
      text:    `From: ${name} <${email}>\n\n${message}`,
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('[sendMail]', err);
    return new Response(JSON.stringify({ error: 'Failed to send' }), { status: 500 });
  }
};
