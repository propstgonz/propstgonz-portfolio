import { defineMiddleware } from 'astro:middleware';

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];
const FORM_CONTENT_TYPES = [
  'application/x-www-form-urlencoded',
  'multipart/form-data',
  'text/plain',
];

export const onRequest = defineMiddleware(({ request, url, isPrerendered }, next) => {
  if (isPrerendered || SAFE_METHODS.includes(request.method)) return next();

  const contentType = request.headers.get('content-type');
  const isFormLike =
    !contentType || FORM_CONTENT_TYPES.some((t) => contentType.toLowerCase().includes(t));

  if (!isFormLike) return next();

  const proto =
    request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() ||
    url.protocol.replace(':', '');

  if (request.headers.get('origin') !== `${proto}://${url.host}`) {
    return new Response(`Cross-site ${request.method} form submissions are forbidden`, {
      status: 403,
    });
  }

  return next();
});
