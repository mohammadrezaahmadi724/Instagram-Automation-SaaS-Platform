export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const maxBytes = 8 * 1024;

export async function POST(request: Request) {
  const declared = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(declared) && declared > maxBytes) {
    return new Response(null, { status: 413 });
  }
  const body = await request.text();
  if (body.length > maxBytes) {
    return new Response(null, { status: 413 });
  }
  console.info(JSON.stringify({ source: 'csp-report', bytes: body.length, body }));
  return new Response(null, { status: 204 });
}
