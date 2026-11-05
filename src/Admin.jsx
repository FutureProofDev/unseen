import { useState } from 'react'
import { op, uid, dbMode, setServerKey } from './db.js'
import { askAI } from './ai.js'
import { seed } from './data.js'
import { Events } from './ui.jsx'

const TABS = ['Settings', 'Scenarios', 'Candidates', 'Users', 'Sessions', 'Data']
const STATUS = ['Invited', 'New', 'Shortlisted', 'Interview', 'Human review requested', 'Reviewed']
const BMODES = [['scripted', 'Scripted teammate'], ['ai', 'AI teammate (Grok)'], ['human', 'Real person (join by code)'], ['none', 'No teammate']]
const clone = o => JSON.parse(JSON.stringify(o))

function Json({ value, onSave, onClose }) {
  const [t, setT] = useState(JSON.stringify(value, null, 2))
  const [err, setErr] = useState('')
  const save = () => { try { onSave(JSON.parse(t)); onClose() } catch (e) { setErr('Invalid JSON: ' + e.message) } }
  return <div className="editor">
    <textarea rows={18} value={t} onChange={e => setT(e.target.value)} spellCheck={false} aria-label="JSON editor" />
    {err && <p role="alert" className="err">{err}</p>}
    <div className="btns"><button className="btn sm" onClick={save}>Save</button><button className="btn sm ghost" onClick={onClose}>Cancel</button></div>
  </div>
}

export function Admin({ db }) {
  const [tab, setTab] = useState('Settings')
  const T = { Settings, Scenarios, Candidates, Users, Sessions, Data }[tab]
  return <>
    <p className="eyebrow">Admin</p><h1>Control panel</h1>
    <div className="tabs" role="tablist">{TABS.map(t => <button key={t} role="tab" aria-selected={tab === t} className={'nl' + (tab === t ? ' on' : '')} onClick={() => setTab(t)}>{t}</button>)}</div>
    <T db={db} />
  </>
}

function Settings({ db }) {
  const s = db.settings
  const set = rec => op({ op: 'settings', rec })
  const [key, setKey] = useState('')
  const [msg, setMsg] = useState('')
  const server = dbMode() === 'server'
  const saveKey = async () => { if (server) await setServerKey(key); else set({ aiKey: key }); setKey(''); setMsg('Key saved.') }
  const test = async () => {
    setMsg('Testing…')
    try { setMsg('AI replied: ' + await askAI(s, 'You are a test.', [{ role: 'user', content: 'Reply with the word ok.' }])) } catch (e) { setMsg('Failed: ' + e.message) }
  }
  return <div className="split">
    <section>
      <h2>Storage</h2>
      <p>{server ? 'Shared server storage. Everyone using this server sees the same data.' : 'This browser only. Separate tabs act as separate users. Run the server for shared data.'}</p>
      <h2>Candidate flow</h2>
      <p><label>Default teammate <select value={s.defaultB} onChange={e => set({ defaultB: e.target.value })}>{BMODES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label></p>
      <p><label className="check"><input type="checkbox" checked={!!s.defaultC} onChange={e => set({ defaultC: e.target.checked })} /> Add an AI colleague (Participant C) by default</label></p>
      <p><label>Reflection <select value={s.reflection} onChange={e => set({ reflection: e.target.value })}><option value="optional">Optional</option><option value="off">Off</option></select></label></p>
      <p><label>Admin passcode <input defaultValue={s.adminPass} onBlur={e => set({ adminPass: e.target.value })} /></label></p>
    </section>
    <section className="field">
      <h2>AI participants (Grok)</h2>
      <label className="check"><input type="checkbox" checked={!!s.aiOn} onChange={e => set({ aiOn: e.target.checked })} /> Enable AI participants</label>
      <p><label>Model <input value={s.model || ''} onChange={e => set({ model: e.target.value })} /></label></p>
      <p><label>API key <input type="password" value={key} onChange={e => setKey(e.target.value)} placeholder={(server ? s.hasKey : s.aiKey) ? 'Saved. Enter a new key to replace' : 'xai-…'} autoComplete="off" /></label></p>
      <div className="btns"><button className="btn sm" disabled={!key} onClick={saveKey}>Save key</button><button className="btn sm ghost" onClick={test}>Test AI</button></div>
      {msg && <p role="status">{msg}</p>}
      <p className="note">{server ? 'The key is stored on the server and never sent to browsers.' : 'In local mode the key is stored in this browser and sent straight to xAI. Use only for testing. If the browser blocks the call, run the server.'}</p>
    </section>
  </div>
}

function Scenarios({ db }) {
  const list = Object.values(db.scenarios).sort((a, b) => a.ord - b.ord)
  const [ed, setEd] = useState(null)
  const patch = (id, rec) => op({ op: 'patch', c: 'scenarios', id, rec })
  const dup = sc => { const id = uid('s_'); op({ op: 'put', c: 'scenarios', id, rec: { ...clone(sc), id, t: sc.t + ' (copy)', ord: Math.max(...list.map(x => x.ord), 0) + 1 } }) }
  return <>
    <div className="btns"><button className="btn sm" onClick={() => dup(list[0])}>New from template</button></div>
    <div className="scroll"><table>
      <thead><tr><th>Scenario</th><th>Level</th><th>Live</th><th>Teammate</th><th>AI colleague</th><th /></tr></thead>
      <tbody>{list.map(sc => <tr key={sc.id}>
        <td>{sc.t}</td><td>{sc.level}</td>
        <td><input type="checkbox" checked={sc.active !== false} aria-label="Active" onChange={e => patch(sc.id, { active: e.target.checked })} /></td>
        <td><select value={sc.mode?.B || ''} onChange={e => patch(sc.id, { mode: { B: e.target.value } })}><option value="">Default</option>{BMODES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></td>
        <td><select value={sc.mode?.C == null ? '' : sc.mode.C ? 'on' : 'off'} onChange={e => patch(sc.id, { mode: { C: e.target.value === '' ? null : e.target.value === 'on' } })}><option value="">Default</option><option value="on">On</option><option value="off">Off</option></select></td>
        <td className="acts"><button className="link" onClick={() => setEd(sc.id)}>Edit</button> <button className="link" onClick={() => dup(sc)}>Duplicate</button> <button className="link" onClick={() => window.confirm('Delete this scenario?') && op({ op: 'del', c: 'scenarios', id: sc.id })}>Delete</button></td>
      </tr>)}</tbody></table></div>
    {ed && db.scenarios[ed] && <Json value={db.scenarios[ed]} onClose={() => setEd(null)} onSave={v => { if (v.id !== ed) op({ op: 'del', c: 'scenarios', id: ed }); op({ op: 'put', c: 'scenarios', id: v.id, rec: v }) }} />}
  </>
}

function Candidates({ db }) {
  const list = Object.values(db.candidates).sort((a, b) => b.createdAt - a.createdAt)
  const [ed, setEd] = useState(null)
  const [nm, setNm] = useState('')
  const [sc, setSc] = useState(Object.keys(db.scenarios)[0])
  const add = () => {
    const n = nm.trim(); if (!n) return
    const uidv = uid('u_'), id = uid('c_'), ts = Date.now()
    op({ op: 'put', c: 'users', id: uidv, rec: { id: uidv, name: n, createdAt: ts } })
    op({ op: 'put', c: 'candidates', id, rec: { id, userId: uidv, name: n, role: '–', scn: sc, source: 'admin', createdAt: ts, status: 'Invited', r: {}, ev: [], did: [], strengths: [], improve: [], follow: [], tele: [], ctx: '' } })
    setNm('')
  }
  return <>
    <div className="btns">
      <input value={nm} onChange={e => setNm(e.target.value)} placeholder="New candidate name" aria-label="New candidate name" />
      <select value={sc} onChange={e => setSc(e.target.value)} aria-label="Scenario">{Object.values(db.scenarios).map(s => <option key={s.id} value={s.id}>{s.t}</option>)}</select>
      <button className="btn sm" disabled={!nm.trim()} onClick={add}>Add (invited)</button>
    </div>
    <div className="scroll"><table>
      <thead><tr><th>Name</th><th>Scenario</th><th>Source</th><th>Status</th><th /></tr></thead>
      <tbody>{list.map(c => <tr key={c.id}>
        <td>{c.name}</td><td>{db.scenarios[c.scn]?.t || c.scn}</td><td>{c.source}</td>
        <td><select value={c.status} onChange={e => op({ op: 'patch', c: 'candidates', id: c.id, rec: { status: e.target.value } })}>{STATUS.map(x => <option key={x}>{x}</option>)}</select></td>
        <td className="acts"><button className="link" onClick={() => setEd(c.id)}>Edit</button> <button className="link" onClick={() => window.confirm('Delete ' + c.name + '?') && op({ op: 'del', c: 'candidates', id: c.id })}>Delete</button></td>
      </tr>)}</tbody></table></div>
    {ed && db.candidates[ed] && <Json value={db.candidates[ed]} onClose={() => setEd(null)} onSave={v => op({ op: 'put', c: 'candidates', id: ed, rec: { ...v, id: ed } })} />}
  </>
}

function Users({ db }) {
  const list = Object.values(db.users).sort((a, b) => b.createdAt - a.createdAt)
  const [nm, setNm] = useState('')
  const add = () => { const id = uid('u_'); op({ op: 'put', c: 'users', id, rec: { id, name: nm.trim(), createdAt: Date.now() } }); setNm('') }
  const del = u => {
    if (!window.confirm('Delete ' + u.name + ' and their candidate records and sessions?')) return
    Object.values(db.candidates).filter(c => c.userId === u.id).forEach(c => op({ op: 'del', c: 'candidates', id: c.id }))
    Object.values(db.sessions).filter(s => s.cand.A === u.id).forEach(s => op({ op: 'del', c: 'sessions', id: s.id }))
    op({ op: 'del', c: 'users', id: u.id })
  }
  return <>
    <div className="btns"><input value={nm} onChange={e => setNm(e.target.value)} placeholder="New user name" aria-label="New user name" /><button className="btn sm" disabled={!nm.trim()} onClick={add}>Add user</button></div>
    <div className="scroll"><table>
      <thead><tr><th>Name</th><th>Attempts</th><th /></tr></thead>
      <tbody>{list.map(u => <tr key={u.id}>
        <td><input defaultValue={u.name} aria-label="Name" onBlur={e => e.target.value.trim() && op({ op: 'patch', c: 'users', id: u.id, rec: { name: e.target.value.trim() } })} /></td>
        <td>{Object.values(db.candidates).filter(c => c.userId === u.id && c.ev.length).length}</td>
        <td className="acts"><button className="link" onClick={() => del(u)}>Delete</button></td>
      </tr>)}</tbody></table></div>
  </>
}

function Sessions({ db }) {
  const list = Object.values(db.sessions).sort((a, b) => b.createdAt - a.createdAt)
  const [v, setV] = useState(null)
  const nm = id => db.users[id]?.name || '–'
  if (!list.length) return <p>No live sessions yet.</p>
  return <>
    <div className="scroll"><table>
      <thead><tr><th>Code</th><th>Scenario</th><th>A</th><th>B</th><th>Teammate mode</th><th>AI colleague</th><th>Status</th><th /></tr></thead>
      <tbody>{list.map(s => <tr key={s.id}>
        <td>{s.code}</td><td>{db.scenarios[s.scn]?.t || s.scn}</td><td>{nm(s.cand.A)}</td><td>{s.cand.B ? nm(s.cand.B) : '–'}</td>
        <td><select value={s.mode.B} onChange={e => op({ op: 'patch', c: 'sessions', id: s.id, rec: { mode: { B: e.target.value } } })}>{BMODES.map(([x, l]) => <option key={x} value={x}>{l}</option>)}</select></td>
        <td><input type="checkbox" checked={!!s.mode.C} aria-label="AI colleague" onChange={e => op({ op: 'patch', c: 'sessions', id: s.id, rec: { mode: { C: e.target.checked } } })} /></td>
        <td>{s.status}</td>
        <td className="acts"><button className="link" onClick={() => setV(v === s.id ? null : s.id)}>{v === s.id ? 'Hide' : 'View'}</button> <button className="link" onClick={() => window.confirm('Delete this session?') && op({ op: 'del', c: 'sessions', id: s.id })}>Delete</button></td>
      </tr>)}</tbody></table></div>
    {v && db.sessions[v] && (() => {
      const s = db.sessions[v], sc = db.scenarios[s.scn]
      return <div className="field">
        <h3>Transcript</h3>
        <ol className="log">{(s.log || []).map(l => <li key={l.id}><b>{l.p} · {l.w}</b>{l.x}</li>)}</ol>
        <h3>Decisions</h3>
        {(s.decisions || []).map((d, i) => <p key={i}><b>{d.p}</b> {d.k}: {sc?.[d.k]?.o?.[d.i]?.x}</p>)}
        <h3>Notes</h3><pre>A: {s.notes?.A}{'\n'}B: {s.notes?.B}</pre>
        <h3>Events</h3><Events ev={(s.events || []).map(e => ({ at: e.at, text: `${e.p}: ${e.text}` }))} />
      </div>
    })()}
  </>
}

function Data({ db }) {
  const [msg, setMsg] = useState('')
  const exp = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' }))
    a.download = 'unseen-data.json'; a.click()
  }
  const imp = e => {
    const f = e.target.files[0]; if (!f) return
    f.text().then(t => { const j = JSON.parse(t); delete j.settings; op({ op: 'replace', rec: j }); setMsg('Imported.') }).catch(() => setMsg('That file could not be read.'))
  }
  const clearLive = () => {
    if (!window.confirm('Delete every live and admin-created record? Seeded examples stay.')) return
    op({ op: 'replace', rec: {
      candidates: Object.fromEntries(Object.entries(db.candidates).filter(([, c]) => c.source === 'seed')),
      users: Object.fromEntries(Object.entries(db.users).filter(([, u]) => u.seed)),
      sessions: {}
    } })
  }
  const reset = () => { if (window.confirm('Reset scenarios, candidates, users and sessions to the original demo data? Settings are kept.')) { const s = seed(); delete s.settings; op({ op: 'replace', rec: s }) } }
  return <div className="btns">
    <button className="btn sm" onClick={exp}>Export JSON</button>
    <label className="btn sm ghost">Import JSON<input type="file" accept="application/json" onChange={imp} hidden /></label>
    <button className="btn sm ghost" onClick={clearLive}>Delete live data</button>
    <button className="btn sm ghost" onClick={reset}>Reset demo data</button>
    {msg && <span role="status">{msg}</span>}
  </div>
}