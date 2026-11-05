export const isObj = v => v && typeof v === 'object' && !Array.isArray(v)

export function merge(a, b) {
  const o = { ...(a || {}) }
  for (const k in b) o[k] = isObj(b[k]) && isObj(o[k]) ? merge(o[k], b[k]) : b[k]
  return o
}

// One operation format, used by both the browser and the server.
export function apply(s, op) {
  const c = op.c
  switch (op.op) {
    case 'put': s[c] = { ...s[c], [op.id]: op.rec }; break
    case 'patch': if (s[c]?.[op.id]) s[c] = { ...s[c], [op.id]: merge(s[c][op.id], op.rec) }; break
    case 'append': {
      const r = s[c]?.[op.id]
      if (r) s[c] = { ...s[c], [op.id]: { ...r, [op.f]: [...(r[op.f] || []), ...op.items] } }
      break
    }
    case 'del': { const rest = { ...(s[c] || {}) }; delete rest[op.id]; s[c] = rest; break }
    case 'settings': s.settings = merge(s.settings, op.rec); break
    case 'replace': Object.assign(s, op.rec); break
    default: break
  }
  return s
}