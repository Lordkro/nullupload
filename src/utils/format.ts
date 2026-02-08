export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function calcSavings(original: number, processed: number): string {
  if (original === 0) return '0%'
  const pct = ((1 - processed / original) * 100).toFixed(1)
  return `${pct}%`
}
