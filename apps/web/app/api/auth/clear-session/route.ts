import { clearSessionCookie } from '../../../../src/auth/http';

export async function GET(request: Request) {
  const response = Response.redirect(new URL('/login', request.url), 303);
  response.headers.append('set-cookie', clearSessionCookie());
  return response;
}
