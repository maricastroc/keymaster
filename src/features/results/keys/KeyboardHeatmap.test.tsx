// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { KeyboardHeatmap } from './KeyboardHeatmap';
import type { KeyStat } from './logic/keyStats';

afterEach(cleanup);

const stat = (key: string, presses: number, errors: number, avgMs: number): KeyStat => ({
  key,
  presses,
  errors,
  accuracy: Math.round(((presses - errors) / presses) * 100),
  avgMs,
});

describe('KeyboardHeatmap', () => {
  it('renders all 26 letter keys', () => {
    render(<KeyboardHeatmap stats={[]} />);
    for (const ch of 'abcdefghijklmnopqrstuvwxyz') {
      expect(screen.getByTitle(new RegExp(`^${ch.toUpperCase()} —`))).toBeTruthy();
    }
  });

  it('shows per-key stats in the tooltip for typed keys', () => {
    render(<KeyboardHeatmap stats={[stat('z', 5, 4, 300)]} />);
    expect(screen.getByTitle('Z — 5 presses, 20% accuracy, 300ms avg')).toBeTruthy();
  });

  it('labels untyped keys as "not typed"', () => {
    render(<KeyboardHeatmap stats={[stat('a', 4, 0, 100)]} />);
    expect(screen.getByTitle('Q — not typed')).toBeTruthy();
    expect(screen.getByTitle('A — 4 presses, 100% accuracy, 100ms avg')).toBeTruthy();
  });

  it('singularizes the tooltip for a single press', () => {
    render(<KeyboardHeatmap stats={[stat('a', 1, 0, 0)]} />);
    expect(screen.getByTitle('A — 1 press, 100% accuracy')).toBeTruthy();
  });

  it('toggles the active metric between accuracy and speed', () => {
    render(<KeyboardHeatmap stats={[stat('a', 5, 0, 100)]} />);
    const accuracyBtn = screen.getByRole('button', { name: 'accuracy' });
    const speedBtn = screen.getByRole('button', { name: 'speed' });

    expect(accuracyBtn.className).toContain('text-neutral-300');
    expect(speedBtn.className).not.toContain('text-neutral-300');

    fireEvent.click(speedBtn);

    expect(speedBtn.className).toContain('text-neutral-300');
    expect(accuracyBtn.className).not.toContain('text-neutral-300');
  });
});
