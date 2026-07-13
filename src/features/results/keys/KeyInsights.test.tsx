// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { KeyInsights } from './KeyInsights';
import type { Keystroke } from '@/types/keyStore';

afterEach(cleanup);

function k(expectedChar: string, typedChar: string, timestampMs: number): Keystroke {
  return {
    charIndex: 0,
    expectedChar,
    typedChar,
    isCorrect: expectedChar === typedChar,
    timestampMs,
  };
}

// 'z' is typed 4× with 3 mistakes (25% accuracy); 'a' is clean. So 'z' is the
// clear weak key for this round.
const keystrokes: Keystroke[] = [
  k('a', 'a', 0),
  k('a', 'a', 100),
  k('a', 'a', 200),
  k('a', 'a', 300),
  k('z', 'x', 400),
  k('z', 'x', 500),
  k('z', 'x', 600),
  k('z', 'z', 700),
];

describe('KeyInsights', () => {
  it('renders nothing when there are no letter keystrokes', () => {
    const { container } = render(
      <KeyInsights keystrokes={[]} accumulatedWeak={[]} onPractice={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the keyboard and surfaces the round weak key when no profile exists', () => {
    render(<KeyInsights keystrokes={keystrokes} accumulatedWeak={[]} onPractice={() => {}} />);

    // Keyboard is present (the 'z' key cell carries a tooltip).
    expect(screen.getByTitle(/^Z —/)).toBeTruthy();

    // Weakest-keys chips show 'Z' with its accuracy.
    expect(screen.getByText('weakest keys')).toBeTruthy();
    expect(screen.getByText('Z')).toBeTruthy();
    expect(screen.getByText('25%')).toBeTruthy();
  });

  it('calls onPractice when the drill button is clicked', () => {
    const onPractice = vi.fn();
    render(<KeyInsights keystrokes={keystrokes} accumulatedWeak={[]} onPractice={onPractice} />);

    fireEvent.click(screen.getByRole('button', { name: /practice these keys/i }));
    expect(onPractice).toHaveBeenCalledTimes(1);
  });
});
