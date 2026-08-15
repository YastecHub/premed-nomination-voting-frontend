/**
 * Generate a deterministic HSL color from a nominee name.
 * Same name always produces the same color — no randomness.
 */
export function nameToColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = ((hash % 360) + 360) % 360;
  // Keep saturation/lightness in a pleasing range
  const saturation = 55 + (Math.abs(hash >> 8) % 20); // 55–75%
  const lightness = 45 + (Math.abs(hash >> 16) % 15); // 45–60%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Extract initials from a name (up to 2 characters).
 * "Dr. John Smith" → "JS"
 * "Alice" → "A"
 */
export function getInitials(name = "") {
  const words = name.trim().split(/\s+/).filter(Boolean);
  // Filter out titles
  const filtered = words.filter(
    (w) => !["dr.", "dr", "prof.", "prof", "mr.", "mr", "mrs.", "mrs", "ms.", "ms"].includes(w.toLowerCase())
  );
  if (filtered.length === 0) return name.charAt(0).toUpperCase();
  if (filtered.length === 1) return filtered[0].charAt(0).toUpperCase();
  return (filtered[0].charAt(0) + filtered[filtered.length - 1].charAt(0)).toUpperCase();
}
