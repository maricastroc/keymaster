import { describe, it, expect } from 'vitest';
import { keysFromInput } from './inputEvents';

describe('keysFromInput', () => {
  it('maps a single typed character to one key', () => {
    expect(keysFromInput('insertText', 'a')).toEqual(['a']);
  });

  it('passes a space through as a key (word advance)', () => {
    expect(keysFromInput('insertText', ' ')).toEqual([' ']);
  });

  it('preserves accented characters', () => {
    expect(keysFromInput('insertText', 'á')).toEqual(['á']);
  });

  it('splits multi-character inserts (swipe / paste) into individual keys', () => {
    expect(keysFromInput('insertText', 'the')).toEqual(['t', 'h', 'e']);
    expect(keysFromInput('insertFromPaste', 'ab c')).toEqual(['a', 'b', ' ', 'c']);
  });

  it('ignores insertions without data (Enter / line breaks)', () => {
    expect(keysFromInput('insertLineBreak', null)).toEqual([]);
    expect(keysFromInput('insertParagraph', null)).toEqual([]);
  });

  it('maps backward deletions to Backspace', () => {
    expect(keysFromInput('deleteContentBackward', null)).toEqual(['Backspace']);
    expect(keysFromInput('deleteWordBackward', null)).toEqual(['Backspace']);
    expect(keysFromInput('deleteByCut', null)).toEqual(['Backspace']);
  });

  it('ignores forward deletions (Del key)', () => {
    expect(keysFromInput('deleteContentForward', null)).toEqual([]);
    expect(keysFromInput('deleteWordForward', null)).toEqual([]);
  });

  it('ignores unrelated input types', () => {
    expect(keysFromInput('historyUndo', null)).toEqual([]);
    expect(keysFromInput('formatBold', null)).toEqual([]);
  });
});
