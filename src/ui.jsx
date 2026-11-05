import { RUBRIC, SCALE } from './data.js'

export const Tag = ({ children = 'Demo data' }) => <span className="tag">{children}</span>

export const sum = c => {
  const v = RUBRIC.map(r => c.r?.[r.id]?.s).filter(Boolean)
  return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : '–'
}

export const Pips = ({ s }) => s
  ? <span className="pips" aria-label={`${s} of 4: ${SCALE[s - 1]}`}>{[1, 2, 3, 4].map(i => <i key={i} className={i <= s ? 'on' : ''} />)}<b>{s}</b><small>{SCALE[s - 1]}</small></span>
  : <span className="no">Not observed</span>

export const Events = ({ ev }) => <ol className="events">{ev.map((e, i) => <li key={i}><time>{e.at}</time>{e.text}</li>)}</ol>

export const Note = () => <p className="note">Scores are decision-support evidence for a human reviewer, not automated hiring decisions. The 1–4 scale and any summary figure are illustrative and unvalidated. Response speed, message volume and writing style are never scored.</p>

export function Scorecard({ c }) {
  return <div className="rows">{RUBRIC.map(r => {
    const v = c.r?.[r.id] || {}
    return <div className="row" key={r.id}>
      <div><h4>{r.n}</h4><Pips s={v.s} /></div>
      <div>{v.s
        ? (v.e || []).map(id => { const e = c.ev.find(x => x.id === id); return e && <blockquote key={id}><small>{id.toUpperCase()} · {e.t} · {e.k}</small>{e.x}</blockquote> })
        : <p className="muted">Not observed. {v.note}</p>}</div>
    </div>
  })}</div>
}