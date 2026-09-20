import type { APIContext } from 'astro';

const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;
const IPV6 = /^[0-9a-f:]+$/i;

function isValidIp(value: string): boolean {
  if (IPV4.test(value)) return value.split('.').every((o) => Number(o) <= 255);
  return value.includes(':') && IPV6.test(value);
}

export function resolveClientIp({ request, clientAddress }: Pick<APIContext, 'request' | 'clientAddress'>): string {
  const chain = request.headers.get('x-forwarded-for')?.split(',') ?? [];
  const forwarded = chain.at(-1)?.trim();

  if (forwarded && isValidIp(forwarded)) return forwarded;

  try {
    if (clientAddress && isValidIp(clientAddress)) return clientAddress;
  } catch {
  }

  return 'unknown';
}
