import type { InstagramTrigger } from './parse';

/**
 * When several active rules match, the winner is the most specific media scope
 * (`SPECIFIC` before `ALL`) and then the oldest `createdAt`.
 */
export type MatchableRule = {
  id: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED';
  triggerType: InstagramTrigger;
  mediaScope: 'ALL' | 'SPECIFIC';
  mediaId: string | null;
  matchType: 'EXACT' | 'CONTAINS' | 'ANY';
  keywords: string[];
  createdAt: string;
};

export type MatchableEvent = {
  triggerType: InstagramTrigger;
  mediaId: string | null;
  text: string;
};

export function normalizeMatchText(value: string) {
  return value
    .replace(/[\u200b\u200c\u200d\ufeff]/g, '')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function keywordHit(rule: MatchableRule, text: string) {
  if (rule.matchType === 'ANY') return true;
  const normalized = normalizeMatchText(text);
  const keywords = rule.keywords.map(normalizeMatchText).filter(Boolean);
  if (keywords.length === 0) return false;
  if (rule.matchType === 'EXACT') return keywords.some((keyword) => keyword === normalized);
  return keywords.some((keyword) => normalized.includes(keyword));
}

export function matchAutomationRule(event: MatchableEvent, rules: MatchableRule[]) {
  const matches = rules.filter((rule) => {
    if (rule.status !== 'ACTIVE' || rule.triggerType !== event.triggerType) return false;
    if (rule.mediaScope === 'SPECIFIC' && (!rule.mediaId || rule.mediaId !== event.mediaId))
      return false;
    return keywordHit(rule, event.text);
  });
  matches.sort((left, right) => {
    const scope = Number(left.mediaScope !== 'SPECIFIC') - Number(right.mediaScope !== 'SPECIFIC');
    if (scope !== 0) return scope;
    return left.createdAt.localeCompare(right.createdAt);
  });
  return matches[0] ?? null;
}
