import { useSyncExternalStore } from 'react'
import { apply } from './shared.js'
import { seed } from './data.js'

const LS = 'unseen.db.v2'
let state = null
let mode = 'local'
const subs = new Set()
const emit = () => subs.forEach(f => f())
const readLocal = () => { try { return JSON.parse(localStorage.getItem(LS)) } catch { return null } }
const writeLocal = s => { try { localStorage.setItem(LS, JSON.stringify(s)) } catch { /* storage unavailable */ } }

export const uid = p => p + Math.random().toString(36).slice(2, 8)
export const newCode = () => Array.from({ length: 4 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 24)]).join('')
export const getState = () => state
export const dbMode = () => mode
export const useDB = () => useSyncExternalStore(f => { subs.add(f); return () => subs.delete(f) }, () => state)

export function op(o) {
  if (mode === 'server') {
    state = apply({ ...state }, o)
    emit()
    fetch('/api/op', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) }).catch(() => {})
  } else {
    state = apply({ ...(readLocal() || state) }, o)
    writeLocal(state)
    emit()
  }
}

export async function setServerKey(key) {
  await fetch('/api/key', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key }) })
  state = { ...state, settings: { ...state.settings, hasKey: !!key } }
  emit()
}

async function poll() {
  try {
    const r = await fetch('/api/db', { cache: 'no-store' })
    const s = await r.json()
    if (JSON.stringify(s) !== JSON.stringify(state)) { state = s; emit() }
  } catch { /* server temporarily unreachable */ }
}

async function init() {
  try {
    const r = await fetch('/api/db', { cache: 'no-store' })
    if (!r.ok || !(r.headers.get('content-type') || '').includes('json')) throw new Error('no server')
    state = await r.json()
    mode = 'server'
    setInterval(poll, 2000)
  } catch {
    mode = 'local'
    state = readLocal() || seed()
    writeLocal(state)
    window.addEventListener('storage', e => { if (e.key === LS) { state = readLocal() || state; emit() } })
  }
  emit()
}
init()