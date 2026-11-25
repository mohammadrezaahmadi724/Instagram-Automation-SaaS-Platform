function linearize(channel: number): number {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function channels(input: string): [number, number, number] {
  const hex = input.trim().match(/^#([0-9a-f]{6})$/i);
  if (hex?.[1]) {
    const value = hex[1];
    return [
      Number.parseInt(value.slice(0, 2), 16),
      Number.parseInt(value.slice(2, 4), 16),
      Number.parseInt(value.slice(4, 6), 16),
    ];
  }
  const rgb = input.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
  if (rgb?.[1] && rgb[2] && rgb[3]) {
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  }
  throw new Error('unsupported color');
}

export function relativeLuminance(color: string): number {
  const [red, green, blue] = channels(color);
  return 0.2126 * linearize(red) + 0.7152 * linearize(green) + 0.0722 * linearize(blue);
}

export function contrastRatio(foreground: string, background: string): number {
  const first = relativeLuminance(foreground);
  const second = relativeLuminance(background);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

export function readableOn(hex: string): '#0B1B3F' | '#FFFFFF' {
  const onInk = contrastRatio('#0B1B3F', hex);
  const onWhite = contrastRatio('#FFFFFF', hex);
  return onInk >= onWhite ? '#0B1B3F' : '#FFFFFF';
}
