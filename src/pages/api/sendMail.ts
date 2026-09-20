import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
import { env } from '../../lib/api';
import { resolveClientIp } from '../../lib/ip';

const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;
const MAX_BODY_BYTES = MAX_ATTACHMENT_BYTES + 64 * 1024;

const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 5000;

const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);

  if (recent.length >= RATE_LIMIT) {
    hits.set(ip, recent);
    return true;
  }

  recent.push(now);
  hits.set(ip, recent);

  if (hits.size > 1000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(key);
    }
  }

  return false;
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function cleanField(value: FormDataEntryValue | null, max: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return null;
  if (/[\r\n]/.test(trimmed)) return null;
  return trimmed;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const ip = resolveClientIp({ request, clientAddress });
    if (rateLimited(ip)) {
      return json({ error: 'Too many messages, try again later' }, 429);
    }

    const declared = Number(request.headers.get('content-length'));
    if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
      return json({ error: 'Your file exceeds 25MB' }, 400);
    }

    const formData = await request.formData();
    const name = cleanField(formData.get('name'), MAX_NAME);
    const email = cleanField(formData.get('email'), MAX_EMAIL);
    const message = cleanField(formData.get('message'), MAX_MESSAGE);

    if (!name || !email || !message) {
      return json({ error: 'Missing or invalid fields' }, 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: 'Invalid email address' }, 400);
    }

    const attachments: { filename: string; content: Buffer; contentType: string }[] = [];
    const file = formData.get('file');

    if (file && typeof file !== 'string') {
      if (file.size > MAX_ATTACHMENT_BYTES) {
        return json({ error: 'Your file exceeds 25MB' }, 400);
      }

      if (file.size > 0) {
        attachments.push({
          filename: file.name,
          content: Buffer.from(await file.arrayBuffer()),
          contentType: file.type || 'application/octet-stream',
        });
      }
    }

    const user = env('SMTP_USER');
    const transporter = nodemailer.createTransport({
      host: env('SMTP_HOST'),
      port: Number(env('SMTP_PORT') ?? 587),
      secure: env('SMTP_SECURE') === 'true',
      auth: { user, pass: env('SMTP_PASS') },
    });

    await transporter.sendMail({
      from: { name, address: user ?? '' },
      replyTo: email,
      to: env('CONTACT_TO'),
      subject: `[portfolio] Message from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
      attachments,
    });

    return json({ ok: true }, 200);
  } catch (err) {
    console.error('[sendMail]', err);
    return json({ error: 'Failed to send' }, 500);
  }
};
