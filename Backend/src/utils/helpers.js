/**
 * Maps a hex color code to a human-readable color name.
 * Used for product filtering and display.
 */
export function mapHexToColorName(hex) {
  if (!hex) return "Unknown";
  const h = hex.toLowerCase();
  if (h === "#000" || h === "#000000" || h === "#111111" || h.includes("black")) return "Black";
  if (h === "#fff" || h === "#ffffff" || h.includes("white")) return "White";
  if (h === "#d4af37" || h.includes("gold")) return "Gold";
  if (h === "#2563eb" || h === "#1e88e5" || h.includes("blue")) return "Blue";
  return "Other";
}
