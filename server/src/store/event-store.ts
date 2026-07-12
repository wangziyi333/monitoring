const items: unknown[] = []

export const eventStore = {
  add(item: unknown) {
    items.unshift(item)
  },
  getAll() {
    return items.slice(0, 200)
  },
}
