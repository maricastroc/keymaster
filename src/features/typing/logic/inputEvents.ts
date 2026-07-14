export function keysFromInput(inputType: string, data: string | null): string[] {
  if (inputType.startsWith('insert')) {
    return data ? Array.from(data) : [];
  }

  if (inputType.startsWith('delete')) {
    return inputType.includes('Forward') ? [] : ['Backspace'];
  }

  return [];
}
