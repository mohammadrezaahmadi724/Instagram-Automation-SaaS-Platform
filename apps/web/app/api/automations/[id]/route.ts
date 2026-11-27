import { jsonError, readCookie, rejectCrossSite } from '../../../../src/auth/http';
import { currentProfile } from '../../../../src/auth/service';
import { deleteAutomation, saveAutomation } from '../../../../src/instagram/gateway';
import { getRule } from '../../../../src/instagram/queries';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const token = readCookie(request.headers.get('cookie'), 'directora_session');
  if (!token) return jsonError('وارد نشده‌اید', 401);
  const profile = await currentProfile(token);
  if (!profile.ok || !profile.data.workspace) return jsonError('وارد نشده‌اید', 401);
  const { id } = await context.params;
  const rule = await getRule(profile.data.workspace.id, id);
  if (!rule) return jsonError('دستور پیدا نشد', 404);
  return Response.json(rule);
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const blocked = rejectCrossSite(request);
  if (blocked) return blocked;
  const token = readCookie(request.headers.get('cookie'), 'directora_session');
  if (!token) return jsonError('وارد نشده‌اید', 401);
  const { id } = await context.params;
  const result = await saveAutomation(token, await request.json().catch(() => null), id);
  if (!result.ok) return jsonError(result.error, result.status);
  return Response.json(result.data);
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const blocked = rejectCrossSite(request);
  if (blocked) return blocked;
  const token = readCookie(request.headers.get('cookie'), 'directora_session');
  if (!token) return jsonError('وارد نشده‌اید', 401);
  const { id } = await context.params;
  const result = await deleteAutomation(token, id);
  if (!result.ok) return jsonError(result.error, result.status);
  return Response.json(result.data);
}
