import { deleteCategory, updateCategory } from '../../../../../../src/admin/help';
import { guardAdmin } from '../../../../../../src/admin/http';
import { jsonError } from '../../../../../../src/auth/http';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const guard = await guardAdmin(request);
  if ('response' in guard) return guard.response;
  const { id } = await context.params;
  const result = await updateCategory(id, await request.json().catch(() => null));
  if (!result.ok) return jsonError(result.error, result.status);
  return Response.json(result.data);
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const guard = await guardAdmin(request);
  if ('response' in guard) return guard.response;
  const { id } = await context.params;
  const result = await deleteCategory(id);
  if (!result.ok) return jsonError(result.error, result.status);
  return Response.json(result.data);
}
