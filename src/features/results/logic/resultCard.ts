export type ResultCardData = {
  wpm: number;
  accuracy: number;
  consistency: number;
  mode: string;
  difficulty: string;
};

/**
 * Renders a shareable 1200×630 PNG of the round result on a canvas and returns
 * it as a Blob. Uses "IBM Plex Mono" (loaded by literal name via the font link
 * in _document, so the canvas can render with it). Returns null off the client
 * or if canvas is unavailable.
 */
export async function generateResultCard(data: ResultCardData): Promise<Blob | null> {
  if (typeof document === 'undefined') return null;

  const W = 1200;
  const H = 630;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Best-effort: wait for the branded font before drawing text.
  try {
    await (document as unknown as { fonts?: { ready?: Promise<unknown> } }).fonts?.ready;
  } catch {
    /* ignore */
  }

  const font = "'IBM Plex Mono', ui-monospace, monospace";
  const gold = '#dbb942';
  const fg = '#d1d0c9';
  const dim = '#9a9da3';
  const faint = '#646669';

  ctx.fillStyle = '#1a1b1e';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#2f3134';
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, W - 48, H - 48);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // Wordmark
  ctx.fillStyle = dim;
  ctx.font = `600 40px ${font}`;
  ctx.fillText('KEYMASTER', 80, 130);
  ctx.fillStyle = faint;
  ctx.font = `400 24px ${font}`;
  ctx.fillText('master your keystrokes', 80, 168);

  // Big WPM number + label
  ctx.fillStyle = gold;
  ctx.font = `700 220px ${font}`;
  const wpmStr = String(data.wpm);
  ctx.fillText(wpmStr, 76, 430);
  const wpmWidth = ctx.measureText(wpmStr).width;
  ctx.fillStyle = dim;
  ctx.font = `500 56px ${font}`;
  ctx.fillText('wpm', 76 + wpmWidth + 28, 430);

  // Secondary stats line
  const parts = [
    `${data.accuracy}% acc`,
    `${data.consistency}% consistency`,
    `${data.mode} · ${data.difficulty}`,
  ];
  const sep = '  •  ';
  ctx.font = `500 32px ${font}`;
  let x = 80;
  const y = 528;
  parts.forEach((part, i) => {
    ctx.fillStyle = fg;
    ctx.fillText(part, x, y);
    x += ctx.measureText(part).width;
    if (i < parts.length - 1) {
      ctx.fillStyle = faint;
      ctx.fillText(sep, x, y);
      x += ctx.measureText(sep).width;
    }
  });

  // Footer URL
  ctx.fillStyle = faint;
  ctx.font = `400 28px ${font}`;
  ctx.fillText('keymaster.marianacastro.dev', 80, 588);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
}
