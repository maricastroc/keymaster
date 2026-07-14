import { describe, it, expect } from 'vitest';
import { engineReducer, createInitialState } from '../../hooks/engineReducer';
import { simulateSession, typeWord } from './helpers';

describe('complete session flow', () => {
  it('starts with correct initial state', () => {
    const state = createInitialState(['hello', 'world']);
    expect(state.hasStarted).toBe(false);
    expect(state.isReady).toBe(false);
    expect(state.isCompleted).toBe(false);
    expect(state.activeWordIndex).toBe(0);
    expect(state.keystrokes).toHaveLength(0);
    expect(state.finishedTime).toBeNull();
  });

  it('prepare → start transitions correctly', () => {
    let state = createInitialState(['hello']);
    state = engineReducer(state, { type: 'PREPARE' });
    expect(state.isReady).toBe(true);
    expect(state.hasStarted).toBe(false);

    state = engineReducer(state, { type: 'START' });
    expect(state.hasStarted).toBe(true);
    expect(state.isCompleted).toBe(false);
  });

  it('finishing session sets isCompleted and finalTime', () => {
    let state = simulateSession(['hello', 'world'], ['hello', 'world']);
    state = engineReducer(state, { type: 'FINISH', finalTime: 30 });

    expect(state.isCompleted).toBe(true);
    expect(state.finishedTime).toBe(30);
  });

  it('accumulates all keystrokes across words', () => {
    const words = ['hello', 'world'];
    const state = simulateSession(words, ['hello', 'world']);

    expect(state.keystrokes).toHaveLength(10);
  });

  it('perfect session has all keystrokes correct', () => {
    const words = ['hi', 'go'];
    const state = simulateSession(words, ['hi', 'go']);

    expect(state.keystrokes.every((k) => k.isCorrect)).toBe(true);
  });

  it('session with errors records both correct and incorrect keystrokes', () => {
    const words = ['hello'];
    const state = simulateSession(words, ['hXllo']);

    const correct = state.keystrokes.filter((k) => k.isCorrect).length;
    const incorrect = state.keystrokes.filter((k) => !k.isCorrect).length;
    expect(correct).toBe(4);
    expect(incorrect).toBe(1);
  });

  it('reset after session clears all state', () => {
    let state = simulateSession(['hello', 'world'], ['hello', 'world']);
    state = engineReducer(state, { type: 'FINISH', finalTime: 30 });
    state = engineReducer(state, { type: 'RESET', words: ['foo', 'bar'] });

    expect(state.hasStarted).toBe(false);
    expect(state.isCompleted).toBe(false);
    expect(state.isReady).toBe(false);
    expect(state.activeWordIndex).toBe(0);
    expect(state.keystrokes).toHaveLength(0);
    expect(state.finishedTime).toBeNull();
    expect(state.userInput).toEqual(['', '']);
  });

  it('reset with new words updates userInput length', () => {
    let state = createInitialState(['one', 'two']);
    state = engineReducer(state, { type: 'RESET', words: ['a', 'b', 'c', 'd'] });

    expect(state.userInput).toHaveLength(4);
  });

  it('keystrokes include correct charIndex relative to word position', () => {
    const words = ['ab', 'cd'];
    let state = createInitialState(words);
    state = engineReducer(state, { type: 'START' });
    state = typeWord(state, 0, 'ab', 'ab', 0);

    expect(state.keystrokes[0].charIndex).toBe(0);
    expect(state.keystrokes[1].charIndex).toBe(1);
  });

  it('session without start still records input when dispatched directly', () => {
    const words = ['hello'];

    let state = createInitialState(words);
    state = engineReducer(state, {
      type: 'TYPE_CHAR',
      wordIndex: 0,
      char: 'h',
      isCorrect: true,
      timestampMs: 0,
      charIndex: 0,
      expectedChar: 'h',
    });

    expect(state.userInput[0]).toBe('h');
    expect(state.hasStarted).toBe(false);
  });
});
