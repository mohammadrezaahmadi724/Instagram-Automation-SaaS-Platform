import { InstagramApiError } from './errors';

export type ReplyButton =
  | { type: 'web_url'; title: string; url: string }
  | { type: 'postback'; title: string; payload: string };

export function assertOutboundMessage(text: string, buttons: ReplyButton[] = []) {
  if (Buffer.byteLength(text, 'utf8') > 1000) throw new InstagramApiError('REJECTED', false);
  if (buttons.length > 3) throw new InstagramApiError('REJECTED', false);
  for (const button of buttons) {
    if (!button.title.trim() || Buffer.byteLength(button.title, 'utf8') > 80) {
      throw new InstagramApiError('REJECTED', false);
    }
    if (button.type === 'web_url') {
      let url: URL;
      try {
        url = new URL(button.url);
      } catch {
        throw new InstagramApiError('REJECTED', false);
      }
      if (url.protocol !== 'https:') throw new InstagramApiError('REJECTED', false);
    }
  }
}

export function messageBody(text: string, buttons: ReplyButton[] = []) {
  assertOutboundMessage(text, buttons);
  if (buttons.length === 0) return { text };
  return {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text,
        buttons: buttons.map((button) =>
          button.type === 'web_url'
            ? { type: 'web_url', title: button.title, url: button.url }
            : { type: 'postback', title: button.title, payload: button.payload },
        ),
      },
    },
  };
}
