import cors from 'cors'
import express from 'express'
import { eventStore } from './store/event-store'

const app = express()
const port = 3001

app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/events', (_req, res) => {
  res.json({ items: eventStore.getAll() })
})

app.post('/api/report', (req, res) => {
  const payload = req.body as { items?: unknown[] }
  const items = Array.isArray(payload.items) ? payload.items : []

  items.forEach((item) => eventStore.add(item))

  res.status(201).json({ ok: true, count: items.length })
})

app.listen(port, () => {
  console.log(`mock server listening on http://localhost:${port}`)
})
