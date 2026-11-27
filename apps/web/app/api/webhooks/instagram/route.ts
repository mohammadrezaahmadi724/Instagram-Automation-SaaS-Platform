import {
  ingestInstagramWebhook,
  verifyWebhookSubscription,
} from '../../../../src/instagram/gateway';

export async function GET(request: Request) {
  const challenge = verifyWebhookSubscription(new URL(request.url).searchParams);
  if (challenge === null) return new Response(null, { status: 403 });
  return new Response(challenge, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}

export async function POST(request: Request) {
  const raw = Buffer.from(await request.arrayBuffer());
  const status = await ingestInstagramWebhook(raw, request.headers.get('x-hub-signature-256'));
  return new Response(null, { status });
}
