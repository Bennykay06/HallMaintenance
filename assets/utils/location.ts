// Helpers for displaying a resident's location consistently across screens.

// Ensure a room value reads "Room <n>" even when only a bare number was
// stored (onboarding captures just the number, e.g. "204B").
export const formatRoom = (room?: string): string => {
  const trimmed = (room || '').trim();
  if (!trimmed) return '';
  return /^room\b/i.test(trimmed) ? trimmed : `Room ${trimmed}`;
};

// Extract the hall (first segment) from a "Hall, Floor, Room" location.
export const getHall = (location?: string): string => {
  const value = (location || '').trim();
  if (!value) return '';
  return value.split(',')[0].trim();
};

// Normalize a full location string ("Hall, Floor, Room") so its trailing
// room segment is prefixed with "Room" when missing. Leaves hall/floor as-is.
export const formatLocation = (location?: string): string => {
  const value = (location || '').trim();
  if (!value) return '';
  const parts = value.split(',').map(p => p.trim());
  // Only the last segment is the room; prefix it when there is a hall/floor
  // in front of it so we don't accidentally relabel a lone value.
  if (parts.length >= 2) {
    parts[parts.length - 1] = formatRoom(parts[parts.length - 1]);
  }
  return parts.join(', ');
};
