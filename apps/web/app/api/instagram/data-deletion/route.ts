import { startDataDeletion } from '../../../../src/instagram/gateway';

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const signed = String(form?.get('signed_request') ?? '');
  const statusUrl = new URL('/api/instagram/data-deletion/CODE', request.url).toString();
  const result = await startDataDeletion(signed, statusUrl);
  if (!result) return new Response(null, { status: 401 });
  return Response.json(result);
}
