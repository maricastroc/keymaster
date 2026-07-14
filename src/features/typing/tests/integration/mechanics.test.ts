import { describe, it, expect } from 'vitest';
import { engineReducer, createInitialState } from '../../hooks/engineReducer';
import { typeChar, typeWord } from './helpers';

const WORDS = ['hello', 'world', 'test'];

describe('engine mechanics — typing', () => {
  it('typing a correct char records it as correct keystroke', () => {
    let state = createInitialState(WORDS);
    state = engineReducer(state, { type: 'START' });
    state = typeChar(state, 0, 'h', 'hello', 100);

    expect(state.userInput[0]).toBe('h');
    expect(state.keystrokes[0].isCorrect).toBe(true);
    expect(state.keystrokes[0].typedChar).toBe('h');
    expect(state.keystrokes[0].expectedChar).toBe('h');
  });

  it('typing a wrong char records it as incorrect keystroke', () => {
    let state = createInitialState(WORDS);
    state = engineReducer(state, { type: 'START' });
    state = typeChar(state, 0, 'x', 'hello', 100);

    expect(state.userInput[0]).toBe('x');
    expect(state.keystrokes[0].isCorrect).toBe(false);
    expect(state.keystrokes[0].expectedChar).toBe('h');
  });

  it('typing multiple chars accumulates in userInput', () => {
    let state = createInitialState(WORDS);
    state = engineReducer(state, { type: 'START' });
    state = typeWord(state, 0, 'hel', 'hello', 0);

    expect(state.userInput[0]).toBe('hel');
    expect(state.keystrokes).toHaveLength(3);
  });

  it('typing the full word correctly marks all keystrokes correct', () => {
    let state = createInitialState(WORDS);
    state = engineReducer(state, { type: 'START' });
    state = typeWord(state, 0, 'hello', 'hello', 0);

    expect(state.userInput[0]).toBe('hello');
    expect(state.keystrokes.every((k) => k.isCorrect)).toBe(true);
  });

  it('typing beyond word length + 10 is blocked by canTypeMoreChars', () => {
    const word = 'hi';
    let state = createInitialState([word]);
    state = engineReducer(state, { type: 'START' });

    state = typeWord(state, 0, 'hi          ', word, 0);
    expect(state.userInput[0].length).toBeLessThanOrEqual(word.length + 10);
  });
});

describe('engine mechanics — backspace', () => {
  it('backspace removes the last typed char', () => {
    let state = createInitialState(WORDS);
    state = engineReducer(state, { type: 'START' });
    state = typeWord(state, 0, 'hel', 'hello', 0);
    state = engineReducer(state, { type: 'BACKSPACE', wordIndex: 0 });

    expect(state.userInput[0]).toBe('he');
  });

  it('backspace on empty input keeps it empty', () => {
    let state = createInitialState(WORDS);
    state = engineReducer(state, { type: 'BACKSPACE', wordIndex: 0 });

    expect(state.userInput[0]).toBe('');
  });

  it('backspace does not affect other words', () => {
    let state = createInitialState(WORDS);
    state = engineReducer(state, { type: 'START' });
    state = typeWord(state, 0, 'hello', 'hello', 0);
    state = engineReducer(state, { type: 'ADVANCE_WORD' });
    state = typeWord(state, 1, 'wor', 'world', 1000);
    state = engineReducer(state, { type: 'BACKSPACE', wordIndex: 1 });

    expect(state.userInput[0]).toBe('hello');
    expect(state.userInput[1]).toBe('wo');
  });

  it('multiple backspaces remove chars one at a time', () => {
    let state = createInitialState(WORDS);
    state = engineReducer(state, { type: 'START' });
    state = typeWord(state, 0, 'hello', 'hello', 0);
    state = engineReducer(state, { type: 'BACKSPACE', wordIndex: 0 });
    state = engineReducer(state, { type: 'BACKSPACE', wordIndex: 0 });

    expect(state.userInput[0]).toBe('hel');
  });
});

describe('engine mechanics — word advance', () => {
  it('advancing word increments activeWordIndex', () => {
    let state = createInitialState(WORDS);
    state = engineReducer(state, { type: 'START' });
    state = typeWord(state, 0, 'hello', 'hello', 0);
    state = engineReducer(state, { type: 'ADVANCE_WORD' });

    expect(state.activeWordIndex).toBe(1);
  });

  it('advancing word does not clear previous word input', () => {
    let state = createInitialState(WORDS);
    state = engineReducer(state, { type: 'START' });
    state = typeWord(state, 0, 'hello', 'hello', 0);
    state = engineReducer(state, { type: 'ADVANCE_WORD' });

    expect(state.userInput[0]).toBe('hello');
  });

  it('advancing preserves keystrokes from previous word', () => {
    let state = createInitialState(WORDS);
    state = engineReducer(state, { type: 'START' });
    state = typeWord(state, 0, 'hello', 'hello', 0);
    const keystrokesBefore = state.keystrokes.length;
    state = engineReducer(state, { type: 'ADVANCE_WORD' });

    expect(state.keystrokes).toHaveLength(keystrokesBefore);
  });

  it('can advance through all words', () => {
    let state = createInitialState(WORDS);
    state = engineReducer(state, { type: 'START' });

    for (let i = 0; i < WORDS.length - 1; i++) {
      state = typeWord(state, i, WORDS[i], WORDS[i], i * 1000);
      state = engineReducer(state, { type: 'ADVANCE_WORD' });
    }

    expect(state.activeWordIndex).toBe(WORDS.length - 1);
  });
});
