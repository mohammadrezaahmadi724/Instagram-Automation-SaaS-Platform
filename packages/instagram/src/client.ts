import { randomBytes } from 'node:crypto';
import { InstagramApiError, mapGraphFailure } from './errors';
import { messageBody, type ReplyButton } from './messages';

export const instagramScopes = [
  'instagram_business_basic',
  'instagram_business_manage_comments',
  'instagram_business_manage_messages',
] as const;

const authorizeUrl = 'https://www.instagram.com/oauth/authorize';
const shortLivedUrl = 'https://api.instagram.com/oauth/access_token';
const graphBase = 'https://graph.instagram.com';

export type InstagramMode = 'mock' | 'live';

export function resolveInstagramMode(env: {
  NODE_ENV?: string;
  INSTAGRAM_API_MODE?: string;
}): InstagramMode {
  if (env.NODE_ENV === 'production') {
    if (env.INSTAGRAM_API_MODE !== 'live') throw new InstagramApiError('REJECTED', false);
    return 'live';
  }
  return env.INSTAGRAM_API_MODE === 'live' ? 'live' : 'mock';
}

export function buildInstagramAuthUrl(input: {
  clientId: string;
  redirectUri: string;
  scopes: readonly string[];
  state: string;
}) {
  const url = new URL(authorizeUrl);
  url.searchParams.set('client_id', input.clientId);
  url.searchParams.set('redirect_uri', input.redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', input.scopes.join(','));
  url.searchParams.set('state', input.state);
  return url.toString();
}

export type InstagramProfile = {
  userId: string;
  username: string;
  name: string | null;
  profilePictureUrl: string | null;
  accountType: string;
  followersCount: number | null;
};

export type InstagramMedia = {
  id: string;
  mediaType: string;
  caption: string;
  permalink: string | null;
  thumbnailUrl: string | null;
  timestamp: string | null;
};

type TokenResult = { accessToken: string; expiresIn: number | null };

async function readJson(response: Response) {
  return (await response.json().catch(() => null)) as unknown;
}

export function createInstagramApi(options: {
  mode: InstagramMode;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}) {
  const timeoutMs = options.timeoutMs ?? 10_000;
  const fetchImpl = options.fetchImpl ?? fetch;

  async function graph(url: string, init?: RequestInit) {
    if (options.mode === 'mock')
      return { status: 200, body: { message_id: `mock_${randomBytes(8).toString('hex')}` } };
    const response = await fetchImpl(url, {
      ...init,
      signal: AbortSignal.timeout(timeoutMs),
    }).catch(() => {
      throw new InstagramApiError('TRANSIENT', true);
    });
    const body = await readJson(response);
    if (!response.ok) throw mapGraphFailure(response.status, body);
    return { status: response.status, body };
  }

  function tokenOf(body: unknown): TokenResult {
    const record =
      body && typeof body === 'object'
        ? (body as { access_token?: unknown; expires_in?: unknown })
        : {};
    if (typeof record.access_token !== 'string' || !record.access_token)
      throw new InstagramApiError('REJECTED', false);
    return {
      accessToken: record.access_token,
      expiresIn: typeof record.expires_in === 'number' ? record.expires_in : null,
    };
  }

  return {
    async exchangeCodeForShortLivedToken(input: {
      clientId: string;
      clientSecret: string;
      redirectUri: string;
      code: string;
    }) {
      if (options.mode === 'mock')
        return { accessToken: `mock-short-${randomBytes(4).toString('hex')}`, expiresIn: 3600 };
      const form = new URLSearchParams({
        client_id: input.clientId,
        client_secret: input.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: input.redirectUri,
        code: input.code,
      });
      const result = await graph(shortLivedUrl, { method: 'POST', body: form });
      return tokenOf(result.body);
    },
    async exchangeShortLivedForLongLivedToken(input: {
      clientSecret: string;
      accessToken: string;
    }) {
      if (options.mode === 'mock')
        return {
          accessToken: `mock-long-${randomBytes(4).toString('hex')}`,
          expiresIn: 60 * 24 * 60 * 60,
        };
      const url = new URL(`${graphBase}/access_token`);
      url.searchParams.set('grant_type', 'ig_exchange_token');
      url.searchParams.set('client_secret', input.clientSecret);
      url.searchParams.set('access_token', input.accessToken);
      const result = await graph(url.toString());
      return tokenOf(result.body);
    },
    async refreshLongLivedToken(accessToken: string) {
      if (options.mode === 'mock')
        return {
          accessToken: `mock-refresh-${randomBytes(4).toString('hex')}`,
          expiresIn: 60 * 24 * 60 * 60,
        };
      const url = new URL(`${graphBase}/refresh_access_token`);
      url.searchParams.set('grant_type', 'ig_refresh_token');
      url.searchParams.set('access_token', accessToken);
      const result = await graph(url.toString());
      return tokenOf(result.body);
    },
    async fetchInstagramProfile(accessToken: string): Promise<InstagramProfile> {
      if (options.mode === 'mock') {
        return {
          userId: 'mock-user',
          username: 'directora_demo',
          name: 'دایرکتورا',
          profilePictureUrl: null,
          accountType: 'BUSINESS',
          followersCount: 12400,
        };
      }
      const url = new URL(`${graphBase}/me`);
      url.searchParams.set(
        'fields',
        'user_id,username,name,profile_picture_url,account_type,followers_count',
      );
      url.searchParams.set('access_token', accessToken);
      const result = await graph(url.toString());
      const record =
        result.body && typeof result.body === 'object'
          ? (result.body as Record<string, unknown>)
          : {};
      return {
        userId: String(record.user_id ?? record.id ?? ''),
        username: String(record.username ?? ''),
        name: typeof record.name === 'string' ? record.name : null,
        profilePictureUrl:
          typeof record.profile_picture_url === 'string' ? record.profile_picture_url : null,
        accountType: String(record.account_type ?? ''),
        followersCount: typeof record.followers_count === 'number' ? record.followers_count : null,
      };
    },
    async fetchRecentMedia(accessToken: string): Promise<InstagramMedia[]> {
      if (options.mode === 'mock') return [];
      const url = new URL(`${graphBase}/me/media`);
      url.searchParams.set('fields', 'id,media_type,caption,permalink,thumbnail_url,timestamp');
      url.searchParams.set('limit', '12');
      url.searchParams.set('access_token', accessToken);
      const result = await graph(url.toString());
      const data =
        result.body && typeof result.body === 'object' && 'data' in result.body
          ? (result.body as { data?: unknown }).data
          : [];
      if (!Array.isArray(data)) return [];
      return data.flatMap((item) => {
        if (!item || typeof item !== 'object') return [];
        const record = item as Record<string, unknown>;
        if (typeof record.id !== 'string') return [];
        const caption = typeof record.caption === 'string' ? record.caption.slice(0, 80) : '';
        return [
          {
            id: record.id,
            mediaType: String(record.media_type ?? ''),
            caption,
            permalink: typeof record.permalink === 'string' ? record.permalink : null,
            thumbnailUrl: typeof record.thumbnail_url === 'string' ? record.thumbnail_url : null,
            timestamp: typeof record.timestamp === 'string' ? record.timestamp : null,
          },
        ];
      });
    },
    async sendDirectMessage(
      accessToken: string,
      igUserId: string,
      recipientIgsid: string,
      text: string,
      buttons?: ReplyButton[],
    ) {
      const message = messageBody(text, buttons);
      if (options.mode === 'mock') return { messageId: `mock_${randomBytes(8).toString('hex')}` };
      const result = await graph(`${graphBase}/${igUserId}/messages`, {
        method: 'POST',
        headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' },
        body: JSON.stringify({ recipient: { id: recipientIgsid }, message }),
      });
      const record =
        result.body && typeof result.body === 'object'
          ? (result.body as { message_id?: unknown })
          : {};
      return { messageId: String(record.message_id ?? '') };
    },
    async sendPrivateReplyToComment(
      accessToken: string,
      igUserId: string,
      commentId: string,
      text: string,
      buttons?: ReplyButton[],
    ) {
      const message = messageBody(text, buttons);
      if (options.mode === 'mock') return { messageId: `mock_${randomBytes(8).toString('hex')}` };
      const result = await graph(`${graphBase}/${igUserId}/messages`, {
        method: 'POST',
        headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' },
        body: JSON.stringify({ recipient: { comment_id: commentId }, message }),
      });
      const record =
        result.body && typeof result.body === 'object'
          ? (result.body as { message_id?: unknown })
          : {};
      return { messageId: String(record.message_id ?? '') };
    },
    async replyToCommentPublicly(accessToken: string, commentId: string, text: string) {
      if (Buffer.byteLength(text, 'utf8') > 1000) throw new InstagramApiError('REJECTED', false);
      if (options.mode === 'mock') return { id: `mock_${randomBytes(8).toString('hex')}` };
      const result = await graph(`${graphBase}/${commentId}/replies`, {
        method: 'POST',
        headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const record =
        result.body && typeof result.body === 'object' ? (result.body as { id?: unknown }) : {};
      return { id: String(record.id ?? '') };
    },
  };
}

export function isProfessionalAccount(accountType: string) {
  const normalized = accountType.trim().toUpperCase();
  return normalized === 'BUSINESS' || normalized === 'CREATOR';
}
