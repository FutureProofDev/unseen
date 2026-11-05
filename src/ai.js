import { dbMode } from './db.js'

// Server mode: the key stays on the server. Local mode: the key is in this browser (demo only).
export async function askAI(settings, system, history) {
  const messages = [{ role: 'system', content: system }, ...history]
  const model = settings.model || 'grok-3'
  if (dbMode() === 'server') {
    const r = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model, messages }) })
    const j = await r.json()
    if (!r.ok) throw new Error(j.error || 'AI error')
    return j.text
  }
  if (!settings.aiKey) throw new Error('No AI key set')
  const r = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + settings.aiKey },
    body: JSON.stringify({ model, messages, max_tokens: 160, temperature: 0.8 })
  })
  const j = await r.json()
  if (!r.ok) throw new Error(j.error?.message || 'AI error')
  return j.choices[0].message.content.trim()
}