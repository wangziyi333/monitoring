const items: unknown[] = []

export const replayStore = {
  add(item: unknown) {
    items.unshift(item)
  },
  getAll() {
    return items.slice(0, 50)
  },
  getLatest() {
    return items[0] ?? null
  },
  getById(replayId: string) {
    return items.find(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        'replayId' in item &&
        (item as { replayId?: unknown }).replayId === replayId,
    ) ?? null
  },
}
