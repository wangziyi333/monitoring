export const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

export const createSessionId = () => {
  const key = 'monitoring-demo-session-id'
  const current = sessionStorage.getItem(key)

  if (current) {
    return current
  }

  const next = createId()
  sessionStorage.setItem(key, next)

  return next
}
