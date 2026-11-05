import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { apply } from '../src/shared.js'
import { seed } from '../src/data.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const FILE = path.join(here, 'db.json')
const DIST = path.join(here, '..', 'dist')
const PORT = process.env.PORT || 3001

let db
try { db = JSON.parse(fs.readFileSync(FILE, 'utf8')) } catch { db = { ...seed(), _key: '' } }
if (process.env.XAI_API_KEY) db._key = process.env.XAI_API_KEY

let timer
const save = () => { clearTimeout(timer); timer = setTimeout(() => fs.writeFile(FILE, JSON.stringify(db), () => {}), 200) }
const pub = () => { const { _key, ...rest } = db; return { ...rest, settings: { ...rest.settings, hasKey: !!_key } } }
const body = req => new Promise(r => { let b = ''; req.on('data', c => { b += c }); req.on('end', () => { try { r(JSON.parse(b || '{}')) } catch { r({}) } }) })
const send = (res, code, o) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(o)) }
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' }

http.createServer(async (req, res) => {
  const url = req.url.split('?')[0]
  if (url === '/api/db' && req.method === 'GET') return send(res, 200, pub())
  if (url === '/api/op' && req.method === 'POST') {
    const o = await body(req)
    if (o.op === 'settings' && o.rec) delete o.rec.aiKey
    db = apply(db, o); save()
    return send(res, 200, { ok: true })
  }
  if (url === '/api/key' && req.method === 'POST') {
    const { key } = await body(req)
    db._key = key || ''; save()
    return send(res, 200, { ok: true })
  }
  if (url === '/api/ai' && req.method === 'POST') {
    if (!db._key) return send(res, 400, { error: 'No AI key configured on the server' })
    const { model, messages } = await body(req)
    try {
      const r = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + db._key },
        body: JSON.stringify({ model: model || 'grok-3', messages, max_tokens: 160, temperature: 0.8 })
      })
      const j = await r.json()
      if (!r.ok) return send(res, 502, { error: j.error?.message || (typeof j.error === 'string' ? j.error : 'AI request failed') })
      return send(res, 200, { text: j.choices[0].message.content.trim() })
    } catch (e) { return send(res, 502, { error: String(e.message || e) }) }
  }
  if (url.startsWith('/api/')) return send(res, 404, { error: 'Not found' })
  let f = path.join(DIST, url === '/' ? 'index.html' : url)
  if (!f.startsWith(DIST) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(DIST, 'index.html')
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); return res.end('Run "npm run build" first') }
    res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' })
    res.end(d)
  })
}).listen(PORT, () => console.log('Unseen server: http://localhost:' + PORT))