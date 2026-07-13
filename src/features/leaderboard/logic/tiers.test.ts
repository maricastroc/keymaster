import { describe, it, expect } from 'vitest';
import { rankTier, TIER_COLOR } from './tiers';

describe('rankTier', () => {
  it('maps the podium ranks', () => {
    expect(rankTier(1)).toBe('gold');
    expect(rankTier(2)).toBe('silver');
    expect(rankTier(3)).toBe('bronze');
  });

  it('returns null for ranks off the podium', () => {
    expect(rankTier(4)).toBeNull();
    expect(rankTier(50)).toBeNull();
    expect(rankTier(0)).toBeNull();
  });

  it('has a color for every non-null tier', () => {
    for (const rank of [1, 2, 3]) {
      const tier = rankTier(rank);
      expect(tier).not.toBeNull();
      expect(TIER_COLOR[tier as Exclude<ReturnType<typeof rankTier>, null>]).toMatch(/^var\(--/);
    }
  });
});
