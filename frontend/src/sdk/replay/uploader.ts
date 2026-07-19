import { getReplaySnapshot, markReplayUploaded } from './recorder'

let lastUploadedReplayKey: string | null = null

export const uploadReplaySnapshot = async () => {
  const snapshot = getReplaySnapshot()

  if (!snapshot || !snapshot.retainedReason) {
    return
  }

  const replayKey = `${snapshot.replayId}:${snapshot.retainedReason}`

  if (replayKey === lastUploadedReplayKey) {
    return
  }

  const response = await fetch('/api/replays', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(snapshot),
  })

  if (!response.ok) {
    throw new Error(`upload replay snapshot failed with status ${response.status}`)
  }

  lastUploadedReplayKey = replayKey
  markReplayUploaded()
}
