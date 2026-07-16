import cors from 'cors'
import express from 'express'
import { eventStore } from './store/event-store'
import { visualTrackStore } from './store/visual-track-store'
import type { VisualTrackConfig } from './types'

const app = express()
const port = 3001

app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/api/coupon/claim', (req, res) => {
  const payload = req.body as { name?: unknown; phone?: unknown } | null
  const name = typeof payload?.name === 'string' ? payload.name.trim() : ''
  const phone = typeof payload?.phone === 'string' ? payload.phone.trim() : ''

  if (!name || !/^1\d{10}$/.test(phone)) {
    res.status(422).json({ message: '请输入姓名和正确的手机号' })
    return
  }

  if (phone.endsWith('0000')) {
    res.status(409).json({ message: '当前手机号暂不满足活动领取条件' })
    return
  }

  res.json({
    ok: true,
    couponCode: `SUMMER-${phone.slice(-4)}-${Date.now().toString().slice(-4)}`,
    message: `${name}，优惠券已领取成功`,
  })
})

app.get('/api/downloads/promo-guide', (_req, res) => {
  const content = [
    '夏季会员大促活动规则',
    '',
    '1. 满299元包邮。',
    '2. 优惠券仅限本活动页面使用。',
    '3. 每位用户限领取一次。',
  ].join('\n')

  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Content-Disposition', 'attachment; filename="summer-promotion-guide.txt"')
  res.send(content)
})

app.get('/api/events', (_req, res) => {
  res.json({ items: eventStore.getAll() })
})

app.get('/api/events/summary', (_req, res) => {
  const items = eventStore.getAll()
  const byName = new Map<string, number>()
  items.forEach((item) => {
    if (!item || typeof item !== 'object' || !('name' in item)) return
    const name = (item as { name?: unknown }).name
    if (typeof name === 'string') byName.set(name, (byName.get(name) ?? 0) + 1)
  })
  res.json({
    total: items.length,
    today: items.length,
    errors: items.filter((item) => typeof item === 'object' && item !== null && 'type' in item && (item as { type?: unknown }).type === 'error').length,
    exposures: items.filter((item) => typeof item === 'object' && item !== null && 'subType' in item && (item as { subType?: unknown }).subType === 'exposure').length,
    byName: [...byName.entries()].map(([name, count]) => ({ name, count })),
    recent: items.slice(0, 8),
  })
})

app.get('/api/visual-track-configs', (_req, res) => {
  res.json({ items: visualTrackStore.getAll() })
})

app.post('/api/visual-track-configs', (req, res) => {
  const payload = req.body as Partial<VisualTrackConfig> | null

  if (!payload || typeof payload !== 'object') {
    res.status(400).json({ message: 'invalid config payload' })
    return
  }

  if (
    typeof payload.id !== 'string' ||
    typeof payload.trackId !== 'string' ||
    payload.eventName !== 'configured_element_click' ||
    !payload.id.trim() ||
    !payload.trackId.trim()
  ) {
    res.status(400).json({ message: 'id, trackId and eventName are required' })
    return
  }

  if (payload.mode === 'selector') {
    if (typeof payload.selector !== 'string' || !payload.selector.trim()) {
      res.status(400).json({ message: 'selector is required' })
      return
    }

    const item: VisualTrackConfig = {
      id: payload.id.trim(),
      mode: 'selector',
      selector: payload.selector.trim(),
      trackId: payload.trackId.trim(),
      eventName: 'configured_element_click',
    }

    visualTrackStore.add(item)
    res.status(201).json({ ok: true, item })
    return
  }

  if (payload.mode === 'track_key') {
    if (typeof payload.trackKey !== 'string' || !payload.trackKey.trim()) {
      res.status(400).json({ message: 'trackKey is required' })
      return
    }

    const item: VisualTrackConfig = {
      id: payload.id.trim(),
      mode: 'track_key',
      trackKey: payload.trackKey.trim(),
      trackId: payload.trackId.trim(),
      eventName: 'configured_element_click',
    }

    visualTrackStore.add(item)
    res.status(201).json({ ok: true, item })
    return
  }

  res.status(400).json({ message: 'mode must be selector or track_key' })
})

app.delete('/api/visual-track-configs/:id', (req, res) => {
  const removed = visualTrackStore.remove(req.params.id)

  if (!removed) {
    res.status(404).json({ message: 'config not found' })
    return
  }

  res.json({ ok: true })
})

app.post('/api/report', (req, res) => {
  const payload = req.body as { items?: unknown[] }
  const items = Array.isArray(payload.items) ? payload.items : []

  items.forEach((item) => eventStore.add(item))

  res.status(201).json({ ok: true, count: items.length })
})

app.get('/api/report/pixel', (req, res) => {
  const raw = typeof req.query.data === 'string' ? req.query.data : ''

  if (raw) {
    try {
      const item = JSON.parse(raw) as unknown
      eventStore.add(item)
    } catch {
      // ignore malformed pixel payloads and always return the pixel
    }
  }

  const gif = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
    'base64',
  )

  res.setHeader('Content-Type', 'image/gif')
  res.setHeader('Cache-Control', 'no-store, max-age=0')
  res.send(gif)
})

app.listen(port, () => {
  console.log(`mock server listening on http://localhost:${port}`)
})
