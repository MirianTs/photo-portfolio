// Supabase Storage rejects object keys with spaces, accents or non-Latin
// letters, so only safe characters go into the file path. The category shown
// in the gallery is stored unchanged in the database row.
export const safePathPart = (text) =>
  text.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'file'
