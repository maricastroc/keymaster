import { describe, it, expect } from 'vitest';
import { smoothData } from './smoothData';

describe('smoothData', () => {
  it('returns data unchanged when windowSize <= 1', () => {
    const data = [{ second: 1, wpm: 10 }, { second: 2, wpm: 20 }];
    expect(smoothData(data, 1)).toEqual(data);
  });

  it('returns empty array for empty input', () => {
    expect(smoothData([], 4)).toEqual([]);
  });

  it('smooths numeric values using sliding window average', () => {
    const data = [
      { second: 1, wpm: 0 },
      { second: 2, wpm: 60 },
      { second: 3, wpm: 0 },
    ];
    const result = smoothData(data, 3);
    expect(result[1].wpm).toBe(20);
  });

  it('preserves the "second" key without averaging', () => {
    const data = [{ second: 1, wpm: 10 }, { second: 2, wpm: 20 }, { second: 3, wpm: 30 }];
    const result = smoothData(data, 3);
    expect(result.map((d) => d.second)).toEqual([1, 2, 3]);
  });

  it('preserves null values for "errors" key', () => {
    const data = [
      { second: 1, wpm: 10, errors: null },
      { second: 2, wpm: 20, errors: null },
    ];
    const result = smoothData(data, 2);
    expect(result[0].errors).toBeNull();
  });
});
