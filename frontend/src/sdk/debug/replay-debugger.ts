import { getReplaySnapshot } from '../replay/recorder'

declare global {
  interface Window {
    __MONITOR_REPLAY__?: {
      getSnapshot: typeof getReplaySnapshot
    }
  }
}

export const registerReplayDebugger = () => {
  if (!import.meta.env.DEV || typeof window === 'undefined') {
    return
  }

  window.__MONITOR_REPLAY__ = {
    getSnapshot: getReplaySnapshot,
  }
}
