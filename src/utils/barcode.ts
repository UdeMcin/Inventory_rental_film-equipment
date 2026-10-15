// Utility to generate SVG Barcode (Code 128 / Code 39 aesthetic vector representation)
export function generateBarcodeSvgLines(text: string): { x: number; width: number }[] {
  const lines: { x: number; width: number }[] = [];
  let currentX = 10;
  
  // Deterministic pattern generator based on char codes
  // Guard quiet zones
  lines.push({ x: currentX, width: 2 });
  currentX += 4;
  lines.push({ x: currentX, width: 1 });
  currentX += 3;

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    const pattern = [
      (code % 3) + 1,
      ((code >> 1) % 2) + 1,
      ((code >> 2) % 3) + 1,
      ((code >> 3) % 2) + 1
    ];
    
    for (let p = 0; p < pattern.length; p++) {
      const barWidth = pattern[p];
      lines.push({ x: currentX, width: barWidth });
      currentX += barWidth + ((p % 2 === 0) ? 2 : 1);
    }
  }

  // End guard
  lines.push({ x: currentX, width: 3 });
  currentX += 4;
  lines.push({ x: currentX, width: 1 });

  return lines;
}
