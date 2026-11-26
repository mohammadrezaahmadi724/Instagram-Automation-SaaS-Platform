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
  console.info(
    JSON.stringify({ source: 'csp-report', bytes: body.length, body: redactReport(body) }),
  );
  return new Response(null, { status: 204 });
}

const uriKeys = new Set(['document-uri', 'blocked-uri', 'documentURL', 'blockedURL', 'referrer']);

function stripQuery(value: string) {
  const query = value.indexOf('?');
  return query === -1 ? value : value.slice(0, query);
}

function redactReport(body: string): string {
  try {
    return JSON.stringify(redactValue(JSON.parse(body)));
  } catch {
    return stripQuery(body);
  }
}

function redactValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactValue);
  if (!value || typeof value !== 'object') return value;
  const output: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    output[key] =
      uriKeys.has(key) && typeof item === 'string' ? stripQuery(item) : redactValue(item);
  }
  return output;
}
