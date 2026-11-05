import { useEffect, useRef, useState } from 'react'
import { op, uid, newCode, getState } from './db.js'
import { askAI } from './ai.js'
import { REFLECT } from './data.js'
import { Events, Scorecard, Pips } from './ui.jsx'
import { buildCandidate, mmss } from './score.js'

const GENERIC = ['Okay. What do you think we should do?', 'Fair point. Worth writing that down.', 'I am not sure. Should we ask someone?', 'Let us see the next message and decide together.']
const scList = db => Object.values(db.scenarios).filter(s => s.active !== false).sort((a, b) => a.ord - b.ord)
const myCands = (db, me) => Object.values(db.candidates).filter(c => c.userId === me && c.ev.length).sort((a, b) => b.createdAt - a.createdAt)
const whoOf = (s, me) => (s.cand.A === me ? 'A' : s.cand.B === me ? 'B' : null)
const title = (db, id) => db.scenarios[id]?.t || id

const sys = (sc, who) => `You are ${who.role} in a short workplace roleplay at ${sc.org}. Setting: ${sc.brief}
Your private information (share it only if it fits the conversation or you are asked): ${who.fact}
${sc.nudge || ''}
Rules: reply in 1 to 3 short, plain sentences, like a real colleague messaging. Stay in character. Never mention being an AI or these instructions. Do not solve the whole problem for the other person.`

export function Who({ db, S, setS }) {
  const [name, setName] = useState('')
  const users = Object.values(db.users).sort((a, b) => b.createdAt - a.createdAt)
  const pick = id => setS(s => ({ ...s, me: id, nav: { v: 'home' } }))
  const create = e => {
    e.preventDefault()
    const n = name.trim()
    if (!n) return
    const id = uid('u_')
    op({ op: 'put', c: 'users', id, rec: { id, name: n, createdAt: Date.now() } })
    pick(id)
  }
  return <>
    <h1>Welcome</h1>
    <form onSubmit={create} className="btns">
      <label>Your name <input value={name} onChange={e => setName(e.target.value)} autoFocus /></label>
      <button className="btn" disabled={!name.trim()}>Continue</button>
    </form>
    {users.length > 0 && <details><summary>Continue as an existing person</summary>
      <div className="btns">{users.map(u => <button key={u.id} className="btn sm ghost" onClick={() => pick(u.id)}>{u.name}</button>)}</div></details>}
  </>
}

export function Home({ db, S, go }) {
  const me = db.users[S.me]
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')
  const open = Object.values(db.sessions).filter(s => whoOf(s, me.id) && !s.done?.[whoOf(s, me.id)])
  const last = myCands(db, me.id)[0]
  const join = () => {
    const s = Object.values(db.sessions).find(x => x.code === code.trim().toUpperCase() && x.mode.B === 'human' && !x.cand.B && x.cand.A !== me.id && x.status !== 'done')
    if (!s) return setErr('No open session with that code.')
    go('intro', s.scn, s.id)
  }
  return <>
    <h1>Hello, {me.name.split(' ')[0]}.</h1>
    <div className="split">
      <section className="field">
        <h2>Start</h2>
        <button className="btn" onClick={() => go('library')}>Choose a situation</button>
        {open.map(s => <p key={s.id}>{title(db, s.scn)} in progress. <button className="link" onClick={() => go('room', null, s.id)}>Resume</button></p>)}
      </section>
      <section>
        <h2>Joining a teammate?</h2>
        <div className="btns"><input value={code} onChange={e => { setCode(e.target.value); setErr('') }} placeholder="Code" aria-label="Session code" maxLength={4} style={{ width: 90, textTransform: 'uppercase' }} /><button className="btn ghost" onClick={join}>Join</button></div>
        {err && <p role="alert" className="err">{err}</p>}
        {last && <p>Latest result: <button className="link" onClick={() => go('results', last.id)}>{title(db, last.scn)}</button></p>}
      </section>
    </div>
  </>
}

export function Library({ db, go }) {
  const list = scList(db)
  const levels = [...new Set(list.map(s => s.level))]
  return <>
    <h1>Choose a situation</h1>
    {levels.map(l => <section key={l}><h2>{l}</h2>
      {list.filter(s => s.level === l).map(s => <article className="scn" key={s.id}>
        <div><h3>{s.t}</h3><p>{s.brief}</p><p className="muted">About {s.mins} minutes</p></div>
        <button className="btn" onClick={() => go('intro', s.id)}>Start</button>
      </article>)}</section>)}
  </>
}

export function Intro({ db, S, go, id, sid }) {
  const me = db.users[S.me]
  const sc = db.scenarios[id]
  const joining = sid ? db.sessions[sid] : null
  const [ok, setOk] = useState(false)
  if (!sc) return <><p>Scenario not found.</p><button className="btn" onClick={() => go('library')}>Back</button></>
  const start = () => {
    const ts = Date.now()
    if (joining) {
      op({ op: 'patch', c: 'sessions', id: sid, rec: { cand: { B: me.id } } })
      op({ op: 'append', c: 'sessions', id: sid, f: 'events', items: [{ p: 'B', type: 'start', ts, at: mmss(ts - joining.createdAt), text: 'Simulation started' }] })
      return go('room', null, sid)
    }
    const m = sc.mode || {}
    const st = db.settings
    let B = m.B || st.defaultB
    let C = m.C ?? st.defaultC
    if (!st.aiOn) { if (B === 'ai') B = 'scripted'; C = false }
    const nid = uid('s_')
    op({ op: 'put', c: 'sessions', id: nid, rec: {
      id: nid, code: newCode(), scn: id, createdAt: ts, status: 'active', cand: { A: me.id, B: null }, mode: { B, C },
      stage: { A: 0, B: 0 }, log: [], notes: { A: '', B: '' }, decisions: [], done: {},
      events: [{ p: 'A', type: 'start', ts, at: '00:00', text: 'Simulation started' }]
    } })
    go('room', null, nid)
  }
  return <>
    <button className="link" onClick={() => go('library')}>← Back</button>
    <p className="eyebrow">{sc.level} · about {sc.mins} minutes</p>
    <h1>{sc.t}</h1>
    <p className="lede">{sc.brief}</p>
    {joining && <p>You are joining a teammate’s session.</p>}
    <div className="field">
      <p><b>What we record:</b> your messages, choices and notes, and when this tab is hidden, loses focus, goes offline or is reopened. Nothing else. These events are context for a person reviewing your results and never fail you.</p>
      <p className="muted">Your work saves automatically. Need extra time or support? You can ask on the results page.</p>
      {sc.src?.length > 0 && <details><summary>Scenario inspiration</summary>
        <p className="muted">Inspired by public reports. All people, employers and details here are fictional.</p>
        <ul>{sc.src.map(([l, u]) => <li key={u}><a href={u} target="_blank" rel="noreferrer">{l}</a></li>)}</ul></details>}
      <label className="check"><input type="checkbox" checked={ok} onChange={e => setOk(e.target.checked)} /> I understand and agree to take part.</label>
      <button className="btn" disabled={!ok} onClick={start}>Begin</button>
    </div>
  </>
}

function useTelemetry(sid, p) {
  useEffect(() => {
    const add = (type, text) => {
      const s = getState().sessions[sid]
      if (!s) return
      const ts = Date.now()
      op({ op: 'append', c: 'sessions', id: sid, f: 'events', items: [{ p, type, ts, at: mmss(ts - s.createdAt), text }] })
    }
    const key = 'seen:' + sid + p
    if (sessionStorage.getItem(key)) add('resume', 'Page reloaded or re-entered; saved session resumed')
    sessionStorage.setItem(key, '1')
    let hid = 0
    const vis = () => {
      if (document.hidden) { hid = Date.now(); add('visibility', 'Tab became hidden') }
      else add('visibility', 'Tab visible again after ' + (hid ? Math.round((Date.now() - hid) / 1000) : 0) + ' seconds')
    }
    const hs = [
      ['visibilitychange', vis, document],
      ['blur', () => { if (!document.hidden) add('focus', 'Window lost focus (secondary signal, not a confirmed tab change)') }, window],
      ['focus', () => { if (!document.hidden) add('focus', 'Window regained focus') }, window],
      ['offline', () => add('network', 'Connection interrupted'), window],
      ['online', () => add('network', 'Connection restored; work was autosaved'), window]
    ]
    hs.forEach(([e, f, t]) => t.addEventListener(e, f))
    return () => hs.forEach(([e, f, t]) => t.removeEventListener(e, f))
  }, [sid, p])
}

export function Room({ db, S, go, sid }) {
  const s = db.sessions[sid]
  const p = s && whoOf(s, S.me)
  if (!s || !p || !db.scenarios[s.scn]) return <><h1>Session not found</h1><button className="btn" onClick={() => go('library')}>Back to situations</button></>
  return <RoomInner db={db} go={go} s={s} p={p} />
}

function RoomInner({ db, go, s, p }) {
  const sid = s.id
  const sc = db.scenarios[s.scn]
  const st = s.stage?.[p] ?? 0
  const other = p === 'A' ? 'B' : 'A'
  const person = w => sc[w] || { role: 'Colleague', fact: '' }
  const mine = person(p)
  const [paused, setPaused] = useState(false)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [nt, setNt] = useState(s.notes?.[p] || '')
  const ntRef = useRef(nt)
  const patchNotes = () => op({ op: 'patch', c: 'sessions', id: sid, rec: { notes: { [p]: ntRef.current } } })
  useEffect(() => { ntRef.current = nt; const t = setTimeout(patchNotes, 500); return () => clearTimeout(t) }, [nt])
  useEffect(() => () => patchNotes(), [])
  useTelemetry(sid, p)

  const ev = (type, text) => { const ts = Date.now(); op({ op: 'append', c: 'sessions', id: sid, f: 'events', items: [{ p, type, ts, at: mmss(ts - s.createdAt), text }] }) }
  const say = (who, k, x) => op({ op: 'append', c: 'sessions', id: sid, f: 'log', items: [{ id: uid('m_'), p: who, w: person(who).role, x, k, ts: Date.now() }] })
  const scripted = (kind) => kind === 'share' ? 'Thanks. From my side: ' + sc.B.fact : kind === 'ask' ? sc.ask : GENERIC[(getState().sessions[sid]?.log.length || 0) % GENERIC.length]

  const respond = async kind => {
    if (s.mode.B === 'scripted') setTimeout(() => say('B', 'msg', scripted(kind)), 600)
    const bots = [s.mode.B === 'ai' && 'B', s.mode.C && 'C'].filter(Boolean)
    for (const who of bots) {
      setBusy(true)
      let text
      try {
        const hist = (getState().sessions[sid]?.log || []).slice(-12).map(l => ({ role: l.p === who ? 'assistant' : 'user', content: l.p === who ? l.x : `${l.w}: ${l.x}` }))
        text = await askAI(db.settings, sys(sc, person(who)), hist)
      } catch { text = scripted('msg') }
      say(who, 'msg', text)
    }
    setBusy(false)
  }
  const send = (k, x) => { say(p, k, x); respond(k) }
  const choose = (k, i) => {
    op({ op: 'append', c: 'sessions', id: sid, f: 'decisions', items: [{ p, k, i, ts: Date.now() }] })
    op({ op: 'patch', c: 'sessions', id: sid, rec: { stage: { [p]: st + 1 } } })
  }
  const dec = k => s.decisions?.find(d => d.p === p && d.k === k)
  const opts = k => <div role="group" aria-label="Your response">{sc[k].o.map((o, i) => <button key={i} className="opt" disabled={paused} onClick={() => choose(k, i)}>{o.x}</button>)}</div>
  const said = k => dec(k) && <div className="msg me"><b>You</b>{sc[k].o[dec(k).i]?.x}</div>
  const waiting = s.mode.B === 'human' && !s.cand.B && p === 'A'
  const present = [(s.mode.B !== 'none') && person(other).role, s.mode.C && person('C').role].filter(Boolean)

  return <>
    <p className="eyebrow">{sc.t}</p>
    <div className="demo-bar">
      <span>{waiting ? <>Invite code: <b>{s.code}</b></> : present.length ? <>With: {present.join(', ')}</> : 'Working on your own'}</span>
      <button className="btn sm ghost" onClick={() => { setPaused(!paused); ev(paused ? 'resume' : 'pause', paused ? 'Simulation resumed' : 'Simulation paused') }}>{paused ? 'Resume' : 'Pause'}</button>
    </div>
    <div className="room">
      <section>
        <h2>You are the {mine.role}</h2>
        <p className="private"><b>Only you know:</b> {mine.fact}</p>
        <label htmlFor="notes"><b>Notes</b></label>
        <textarea id="notes" rows={7} value={nt} disabled={paused} onChange={e => setNt(e.target.value)} placeholder="What is confirmed, what is assumed, who does what." />
      </section>
      <section aria-live="polite">
        <h2>Situation</h2>
        <div className="msg"><b>Brief</b>{sc.brief}</div>
        {st === 0 && <button className="btn" onClick={() => choose0()}>Open first message</button>}
        {st >= 1 && <div className="msg"><b>{sc.p1.from}</b>{sc.p1.x}</div>}
        {st === 1 ? opts('p1') : said('p1')}
        {st >= 2 && <><div className="msg chg"><b>{sc.ch.from} · New information</b>{sc.ch.x}</div><div className="msg"><b>{sc.p2.from}</b>{sc.p2.x}</div></>}
        {st === 2 ? opts('p2') : said('p2')}
        {st >= 3 && <button className="btn" onClick={() => { ev('submit', 'Simulation submitted'); go('reflect', null, sid) }}>Finish</button>}
      </section>
      <section>
        <h2>Team chat</h2>
        <ol className="log">{(s.log || []).map(l => <li key={l.id} className={l.p === p ? 'me' : ''}><b>{l.p === p ? 'You' : l.w}</b>{l.x}</li>)}{busy && <li className="muted">…</li>}</ol>
        {!paused && <>
          <div className="btns">
            <button className="btn sm ghost" disabled={s.log?.some(l => l.p === p && l.k === 'share')} onClick={() => send('share', mine.fact)}>Share what I know</button>
            <button className="btn sm ghost" onClick={() => send('ask', 'Can we confirm what is known and what is still unconfirmed?')}>Ask what is confirmed</button>
          </div>
          <div className="btns"><input className="grow" value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && draft.trim()) { send('msg', draft.trim()); setDraft('') } }} placeholder="Message your team" aria-label="Message" />
            <button className="btn sm" disabled={!draft.trim()} onClick={() => { send('msg', draft.trim()); setDraft('') }}>Send</button></div>
        </>}
      </section>
    </div>
    <details><summary>Session log</summary><Events ev={(s.events || []).filter(e => !e.p || e.p === p)} /></details>
  </>
  function choose0() { op({ op: 'patch', c: 'sessions', id: sid, rec: { stage: { [p]: 1 } } }) }
}

function finalize(sid, p, me, refl, go) {
  const now = Date.now()
  const cur = getState().sessions[sid]
  if (!cur) return go('library')
  op({ op: 'append', c: 'sessions', id: sid, f: 'events', items: [{ p, type: 'complete', ts: now, at: mmss(now - cur.createdAt), text: 'Simulation completed' }] })
  const st = getState()
  const s = st.sessions[sid]
  const cand = buildCandidate(s, p, st.scenarios[s.scn], st.users[me], refl)
  op({ op: 'put', c: 'candidates', id: cand.id, rec: cand })
  const done = { ...(s.done || {}), [p]: cand.id }
  op({ op: 'patch', c: 'sessions', id: sid, rec: { done: { [p]: cand.id }, status: done.A && (s.cand.B ? done.B : true) ? 'done' : 'active' } })
  go('results', cand.id)
}

export function Reflect({ db, S, go, sid }) {
  const s = db.sessions[sid]
  const p = s && whoOf(s, S.me)
  const [t, setT] = useState('')
  const off = db.settings.reflection === 'off'
  useEffect(() => { if (off && p) finalize(sid, p, S.me, '', go) }, [])
  if (!s || !p) return <button className="btn" onClick={() => go('library')}>Back</button>
  if (off) return <p>Preparing your results…</p>
  return <>
    <p className="eyebrow">Optional</p><h1>One last question</h1>
    <label htmlFor="r"><b>{REFLECT}</b></label>
    <textarea id="r" rows={4} value={t} onChange={e => setT(e.target.value)} />
    <div className="btns"><button className="btn" onClick={() => finalize(sid, p, S.me, t.trim(), go)}>Submit</button><button className="btn ghost" onClick={() => finalize(sid, p, S.me, '', go)}>Skip</button></div>
  </>
}

export function Results({ db, S, go, id }) {
  const list = myCands(db, S.me)
  const c = (id && db.candidates[id]) || list[0]
  const [t, setT] = useState(c?.ctx || '')
  if (!c) return <><h1>No results yet</h1><button className="btn" onClick={() => go('library')}>Choose a situation</button></>
  const up = rec => op({ op: 'patch', c: 'candidates', id: c.id, rec })
  return <>
    <p className="eyebrow">{title(db, c.scn)}</p><h1>Your feedback</h1>
    <div className="split">
      <section>
        <h2>What you did</h2><p>{c.did.join(' ') || 'No decisions were recorded.'}</p>
        <h3>Strengths</h3><ul>{c.strengths.map(x => <li key={x}>{x}</li>)}</ul>
        <h3>To work on</h3><ul>{c.improve.map(x => <li key={x}>{x}</li>)}</ul>
        <h3>Using new information</h3><p>{c.agility}</p>
      </section>
      <section className="field">
        <h2>Something not right?</h2>
        <textarea rows={3} value={t} aria-label="Context" onChange={e => setT(e.target.value)} placeholder="Add context for the reviewer" />
        <div className="btns">
          <button className="btn sm" onClick={() => up({ ctx: t })}>Save context</button>
          <button className="btn sm ghost" onClick={() => up({ status: 'Human review requested' })}>Request human review</button>
          <button className="btn sm ghost" onClick={() => up({ req: 'Accommodation or reassessment requested' })}>Request reassessment or support</button>
        </div>
        {c.status === 'Human review requested' && <p role="status">Human review requested.</p>}
        {c.req && <p role="status">{c.req}.</p>}
      </section>
    </div>
    <h2>Evidence behind each area</h2><Scorecard c={c} />
    <details><summary>Session log</summary><Events ev={c.tele} /></details>
    <div className="btns"><button className="btn" onClick={() => go('premium')}>Premium feedback</button><button className="btn ghost" onClick={() => go('library')}>Try another</button></div>
  </>
}

export function Premium({ db, S }) {
  const me = db.users[S.me]
  return <>
    <h1>Premium feedback</h1>
    <p className="lede">Your free feedback already includes strengths, areas to work on and the evidence behind every rating. Premium would add optional extras.</p>
    <div className="split">
      <section><ul><li>Line-by-line evidence analysis</li><li>Practice suggestions for each area</li><li>A skill-development plan</li><li>Progress comparison across attempts</li></ul></section>
      <section className="field">
        <button className="btn" onClick={() => op({ op: 'patch', c: 'users', id: me.id, rec: { prem: true } })}>Join the waitlist</button>
        {me.prem && <p role="status">Noted. No payment taken and no subscription started.</p>}
      </section>
    </div>
  </>
}

export function History({ db, S, go }) {
  const list = myCands(db, S.me)
  return <>
    <h1>Your attempts</h1>
    {list.length === 0 ? <p>Nothing yet.</p> : <div className="scroll"><table>
      <thead><tr><th>Date</th><th>Situation</th><th>Communication</th><th>Collaboration</th><th>Judgement</th><th>Integrity and learning</th><th /></tr></thead>
      <tbody>{list.map(c => <tr key={c.id}>
        <td>{new Date(c.createdAt).toLocaleDateString()}</td><td>{title(db, c.scn)}</td>
        {['c1', 'c2', 'c3', 'c4'].map(k => <td key={k}><Pips s={c.r?.[k]?.s} /></td>)}
        <td><button className="link" onClick={() => go('results', c.id)}>View</button></td>
      </tr>)}</tbody></table></div>}
    <p className="note">Different situations test different things, so changes between attempts are only a rough guide.</p>
  </>
}