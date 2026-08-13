export function normalizeCategoryKey(value?: string | null): string {
  if (!value) return ''
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[\s-]+/g, ' ')
    .trim()
}
