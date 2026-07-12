export const toSafeObject = (value: unknown): Record<string, unknown> => {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack ?? '',
    }
  }

  if (typeof value === 'object' && value !== null) {
    return value as Record<string, unknown>
  }

  return { value }
}
