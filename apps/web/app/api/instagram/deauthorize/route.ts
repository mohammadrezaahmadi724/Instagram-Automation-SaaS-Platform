import { deauthorizeInstagram } from '../../../../src/instagram/gateway';

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const signed = String(form?.get('signed_request') ?? '');
  const status = await deauthorizeInstagram(signed);
  return new Response(null, { status });
}
