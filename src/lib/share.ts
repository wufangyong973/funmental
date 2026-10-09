/** Opens the share sheet where there is one, else copies. Returns what happened, for a confirmation label. */
export async function shareResult(text: string): Promise<'shared' | 'copied' | 'failed'> {
  const url = typeof window !== 'undefined' ? window.location.origin : ''
  if (typeof navigator !== 'undefined' && navigator.share && window.matchMedia?.('(pointer: coarse)').matches) {
    try {
      await navigator.share({ text: `${text}\n${url}` })
      return 'shared'
    } catch {
      // Dismissed or unsupported; fall back to copying.
    }
  }
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`)
    return 'copied'
  } catch {
    return 'failed'
  }
}
