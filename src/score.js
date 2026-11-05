// Deterministic demo scoring. Uses only recorded actions. Never speed, typing or message volume.
const KW = /confirm|unconfirm|unverif|assum|not sure|unknown|verif|don.t know/i
const CTX = ['visibility', 'focus', 'network', 'resume']
const map = n => (n === 0 ? null : n === 1 ? 2 : n === 2 ? 3 : 4)

export const mmss = ms => {
  const t = Math.max(0, Math.round(ms / 1000))
  return String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0')
}

const GOOD = { c1: 'Shares information and checks what is confirmed', c2: 'Works with the team and records decisions', c3: 'Weighs risk and fairness before choosing', c4: 'Stays honest under pressure and applies new information' }
const GROW = { c1: 'Share what you know and ask what is confirmed', c2: 'Build on teammates’ input and note who owns what', c3: 'Weigh impact and fairness before choosing', c4: 'Be upfront about your own part, even under pressure' }

export function buildCandidate(s, p, sc, user, refl) {
  const t0 = s.createdAt
  const log = s.log || []
  const mine = log.filter(l => l.p === p)
  const typed = mine.filter(l => l.k === 'msg')
  const decs = (s.decisions || []).filter(d => d.p === p).sort((a, b) => a.ts - b.ts)
  const notes = (s.notes?.[p] || '').trim()
  const ev = []
  const memo = {}
  const add = (key, ts, k, x) => {
    if (!memo[key]) { const id = 'e' + (ev.length + 1); ev.push({ id, t: mmss(ts - t0), k, x }); memo[key] = id }
    return memo[key]
  }
  const ofMsg = l => (l.k === 'share' ? add(l.id, l.ts, 'action', 'Shared own private information: “' + l.x + '”') : add(l.id, l.ts, 'message', '“' + l.x + '”'))
  const ofNotes = () => add('notes', Date.now(), 'notes', 'Notes at finish: “' + notes.slice(0, 160) + (notes.length > 160 ? '…' : '') + '”')
  const lv = d => sc[d.k]?.o?.[d.i]?.lv ?? 2
  const ofDec = d => add('d' + d.k, d.ts, 'decision', 'Chose: “' + sc[d.k].o[d.i].x + '” in reply to ' + sc[d.k].from)

  const sh = mine.find(l => l.k === 'share')
  const aq = mine.find(l => l.k === 'ask' || (l.k === 'msg' && l.x.includes('?')))
  const kwm = typed.find(l => KW.test(l.x))
  const nkw = KW.test(notes)
  const team = (s.mode?.B ?? 'scripted') !== 'none' || !!s.mode?.C
  const reach = sh || typed[0] || aq
  const builtOn = mine.find(m => log.some(o => o.p !== p && o.ts < m.ts))

  const e1 = [sh && ofMsg(sh), aq && ofMsg(aq), nkw ? ofNotes() : kwm && ofMsg(kwm)].filter(Boolean)
  const n1 = [sh, aq, nkw || kwm].filter(Boolean).length
  const e2 = team ? [reach && ofMsg(reach), notes && ofNotes(), builtOn && ofMsg(builtOn)].filter(Boolean) : []
  const n2 = team ? [reach, notes, builtOn].filter(Boolean).length : 0
  const e3 = decs.map(ofDec)

  let s3 = null
  let s4 = null
  if (decs.length) {
    const avg = decs.reduce((a, d) => a + lv(d), 0) / decs.length
    s3 = Math.floor(avg + 0.4)
    const pre = mine.some(l => (l.k === 'share' || l.k === 'ask' || l.x.includes('?')) && l.ts < decs[0].ts)
    if (decs.every(d => lv(d) === 3) && pre) s3 = 4
    const base = lv(decs[decs.length - 1])
    const better = decs.length > 1 && base > lv(decs[0])
    s4 = Math.min(4, base + (better && base >= 3 ? 1 : 0))
  }

  const r = {
    c1: n1 ? { s: map(n1), e: e1 } : { s: null, note: 'No information-sharing or checking actions were recorded.' },
    c2: !team ? { s: null, note: 'There was no teammate in this session, so collaboration could not be observed.' } : n2 ? { s: map(n2), e: e2 } : { s: null, note: 'No collaboration actions were recorded.' },
    c3: s3 ? { s: s3, e: e3 } : { s: null, note: 'No decisions were recorded.' },
    c4: s4 ? { s: s4, e: e3 } : { s: null, note: 'No decisions were recorded.' }
  }
  if (notes) ofNotes()
  ev.sort((a, b) => a.t.localeCompare(b.t))

  const strengths = Object.keys(r).filter(k => r[k].s >= 3).map(k => GOOD[k])
  const improve = Object.keys(r).filter(k => r[k].s && r[k].s <= 2).map(k => GROW[k])
  const d1 = decs[0] && memo['d' + decs[0].k]
  const d2 = decs.length > 1 && memo['d' + decs[decs.length - 1].k]
  let agility = 'Not enough decisions were recorded to see how new information was used.'
  if (d2) {
    const a = lv(decs[0]), b = lv(decs[decs.length - 1])
    agility = b > a ? `After the new information, the second choice was stronger than the first (${d1} → ${d2}).`
      : b === a && b === 3 ? `Held a consistent, well-grounded position after the new information (${d1}, ${d2}).`
      : 'No clear evidence of applying the new information was observed in this simulation.'
  }

  return {
    id: `cand_${s.id}_${p}`, userId: user.id, name: user.name, role: sc[p]?.role || 'Participant', scn: s.scn, sid: s.id, p,
    source: 'live', createdAt: Date.now(), status: 'New', r, ev,
    did: [...decs.map(d => 'Chose “' + sc[d.k].o[d.i].x + '”.'), ...(sh ? ['Shared their private information with the team.'] : [])],
    strengths: strengths.length ? strengths : ['No area reached “effective” in this session'],
    improve: improve.length ? improve : ['Keep checking assumptions as new information arrives'],
    follow: decs.map(d => 'Ask why they chose “' + sc[d.k].o[d.i].x + '” when ' + sc[d.k].from + ' pressed.'),
    agility, refl: refl || '', ctx: '',
    tele: (s.events || []).filter(e => !e.p || e.p === p).map(e => ({ at: e.at, text: e.text, k: CTX.includes(e.type) ? 'ctx' : undefined }))
  }
}