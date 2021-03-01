/**
 * Returns the next brightest variant of the passed in color
 * @param color the color to brightenColor
 */
export function brightenColor(color?: string): string {
  if (!color) {
    return "";
  }
  const currentVariantNumber = getColorVariant(color);
  if (currentVariantNumber === -1) {
    return color;
  }
  if (currentVariantNumber === 900) {
    return color;
  }
  if (currentVariantNumber === 50) {
    return color.replace(/\d{2,3}$/, `${currentVariantNumber + 50}`);
  }
  return color.replace(/\d{2,3}$/, `${currentVariantNumber + 100}`);
}

/**
 * Returns the next darkest variant of the passed in color
 * @param color the color to darkenColor
 */
export function darkenColor(color?: string): string {
  if (!color) {
    return "";
  }
  const currentVariantNumber = getColorVariant(color);
  if (currentVariantNumber === -1) {
    return color;
  }
  if (currentVariantNumber === 50 || currentVariantNumber === 100) {
    return color;
  }
  return color.replace(/\d{2,3}$/, `${currentVariantNumber - 100}`);
}

/**
 * Returns the Tailwind color variant
 * @param color the color
 * @return the color variant number, -1 if could not be determined
 */
function getColorVariant(color: string): number {
  const currentVariantNumber = color.match(/\d{2,3}$/);
  if (currentVariantNumber) {
    return parseInt(currentVariantNumber[0]);
  }
  return -1;
}
