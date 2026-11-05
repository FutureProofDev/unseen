import { op } from './db.js'
import { RUBRIC, SCALE } from './data.js'
import { Tag, Pips, Events, Note, Scorecard, sum } from './ui.jsx'

const all = db => Object.values(db.candidates).sort((a, b) => b.createdAt - a.createdAt)
const title = (db, id) => db.scenarios[id]?.t || id
const STATUS = ['New', 'Shortlisted', 'Interview', 'Human review requested', 'Reviewed']

export function Dash({ db, go }) {
  const cs = all(db)
  const stats = [
    ['Applicants', cs.length],
    ['Simulations completed', cs.filter(c => c.ev.length).length],
    ['Need review', cs.filter(c => ['New', 'Human review requested'].includes(c.status)).length],
    ['Shortlisted or interview', cs.filter(c => ['Shortlisted', 'Interview'].includes(c.status)).length]
  ]
  return <>
    <p className="eyebrow">Recruitment overview <Tag /></p>
    <h1>Who is worth a closer conversation?</h1>
    <p className="lede">Unseen shows how early-career applicants handle realistic workplace situations, with the evidence behind every rating. It supports your interview; it does not replace it.</p>
    <div className="stats">{stats.map(([l, n]) => <div key={l}><b>{n}</b><span>{l}</span></div>)}</div>
    <div className="split">
      <section>
        <h2>Scoring rubric</h2>
        {RUBRIC.map(r => <details key={r.id}><summary>{r.n}</summary><ul>{r.a.map(a => <li key={a}>{a}</li>)}</ul></details>)}
        <p className="muted">Scale: {SCALE.map((s, i) => `${i + 1} ${s}`).join(' · ')} · plus “Not observed”.</p>
      </section>
      <section className="field">
        <h2>How to read results</h2>
        <p>Each rating links to evidence from the session or is marked “Not observed”. Live candidates are scored by fixed rules from what they did; seeded candidates are pre-written examples. Integrity events are neutral context for a person to interpret, never proof of misconduct. Candidates can add context and request human review or reassessment.</p>
        <Note />
        <div className="btns"><button className="btn" onClick={() => go('list')}>View candidates</button><button className="btn ghost" onClick={() => go('compare')}>Compare two</button></div>
      </section>
    </div>
  </>
}

export function List({ db, go }) {
  const cs = all(db)
  const attempts = uid => cs.filter(c => c.userId === uid && c.ev.length).length
  return <>
    <p className="eyebrow">Candidates <Tag /></p><h1>Candidates</h1>
    <div className="scroll"><table>
      <thead><tr><th>Name</th><th>Role</th><th>Simulation</th><th>State</th><th>Attempts</th><th>Illustrative summary</th><th>Strength</th><th>Review status</th></tr></thead>
      <tbody>{cs.map(c => <tr key={c.id}>
        <td><button className="link" onClick={() => go('detail', c.id)}>{c.name}</button> <span className="badge">{c.source === 'live' ? 'Live' : 'Seed'}</span></td>
        <td>{c.role}</td><td>{title(db, c.scn)}</td><td>{c.ev.length ? 'Completed' : 'Invited'}</td>
        <td>{attempts(c.userId)}</td><td>{sum(c)} / 4</td><td>{c.strengths?.[0] || '–'}</td><td><span className="chip">{c.status}</span></td>
      </tr>)}</tbody></table></div>
    <p className="note">The summary is the mean of observed area scores, shown for orientation only. Read the four areas, not one number.</p>
  </>
}

export function Detail({ db, go, id }) {
  const c = db.candidates[id]
  if (!c) return <><p>Candidate not found.</p><button className="btn ghost" onClick={() => go('list')}>Back</button></>
  const set = v => op({ op: 'patch', c: 'candidates', id: c.id, rec: { status: v } })
  const others = all(db).filter(x => x.userId === c.userId && x.id !== c.id && x.ev.length)
  if (!c.ev.length) return <><button className="link" onClick={() => go('list')}>← Candidates</button><h1>{c.name}</h1><p>Invited to “{title(db, c.scn)}”. No simulation completed yet.</p></>
  const ctxEvents = c.tele.filter(e => e.k === 'ctx').length
  return <>
    <button className="link" onClick={() => go('list')}>← Candidates</button>
    <p className="eyebrow">{c.role} · {title(db, c.scn)} <Tag>{c.source === 'live' ? 'Live data' : 'Seeded example'}</Tag></p>
    <h1>{c.name} <span className="chip">{c.status}</span></h1>
    <div className="btns">
      {[['Shortlist', 'Shortlisted'], ['Move to interview', 'Interview'], ['Request human review', 'Human review requested'], ['Mark as reviewed', 'Reviewed']].map(([l, v]) =>
        <button key={v} className={'btn' + (c.status === v ? '' : ' ghost')} onClick={() => set(v)}>{l}</button>)}
    </div>
    <dl className="glance">
      <div><dt>What did they do?</dt><dd>{c.did.join(' ') || '–'}</dd></div>
      <div><dt>Did well</dt><dd>{c.strengths.join('; ')}</dd></div>
      <div><dt>Could improve</dt><dd>{c.improve.join('; ')}</dd></div>
      <div><dt>Follow up in interview</dt><dd>{c.follow.join(' ') || '–'}</dd></div>
      <div><dt>Integrity events</dt><dd>{ctxEvents ? `${ctxEvents} context event(s), see below` : 'None beyond start and finish'}</dd></div>
      <div><dt>Illustrative summary</dt><dd>{sum(c)} / 4 (not validated)</dd></div>
    </dl>
    <h2>Competency evidence</h2><Scorecard c={c} />
    <div className="split">
      <section>
        <h2>Learning-agility signal</h2><p>{c.agility}</p>
        {c.refl && <><h3>Reflection (not scored)</h3><p>{c.refl}</p></>}
        {others.length > 0 && <><h3>Other attempts by {c.name}</h3>{others.map(o => <p key={o.id}><button className="link" onClick={() => go('detail', o.id)}>{title(db, o.scn)}</button> <span className="muted">· {sum(o)} / 4</span></p>)}</>}
      </section>
      <section>
        <h2>Assessment integrity events</h2><Events ev={c.tele} />
        <p className="note">Context for a human to interpret. Never treated as proof of cheating and never changes a rating.</p>
        {c.ctx && <p><b>Candidate context:</b> {c.ctx}</p>}{c.req && <p><b>Candidate request:</b> {c.req}</p>}
      </section>
    </div>
    <Note />
  </>
}

export function Compare({ db, S, setS }) {
  const done = all(db).filter(c => c.ev.length)
  if (done.length < 2) return <><h1>Compare</h1><p>At least two completed simulations are needed.</p></>
  const pickId = i => (db.candidates[S.cmp?.[i]] ? S.cmp[i] : done[Math.min(i, done.length - 1)].id)
  const [a, b] = [pickId(0), pickId(1)].map(i => db.candidates[i])
  const pick = (i, v) => setS(s => { const n = [pickId(0), pickId(1)]; n[i] = v; return { ...s, cmp: n } })
  return <>
    <p className="eyebrow">Compare <Tag /></p><h1>Side by side</h1>
    <div className="btns">{[0, 1].map(i => <label key={i}>Candidate {i + 1}{' '}
      <select value={[a, b][i].id} onChange={e => pick(i, e.target.value)}>{done.map(c => <option key={c.id} value={c.id}>{c.name} · {title(db, c.scn)}</option>)}</select></label>)}</div>
    <div className="scroll"><table className="cmp"><thead><tr><th>Area</th><th>{a.name}</th><th>{b.name}</th></tr></thead><tbody>
      {RUBRIC.map(r => <tr key={r.id}><th>{r.n}</th>{[a, b].map(c => {
        const v = c.r[r.id] || {}, e = v.s && c.ev.find(x => x.id === v.e?.[0])
        return <td key={c.id}><Pips s={v.s} />{e && <blockquote><small>{e.id.toUpperCase()} · {e.t}</small>{e.x}</blockquote>}</td>
      })}</tr>)}
      <tr><th>Simulation</th><td>{title(db, a.scn)}</td><td>{title(db, b.scn)}</td></tr>
      <tr><th>Follow up</th><td>{a.follow.join(' ')}</td><td>{b.follow.join(' ')}</td></tr>
    </tbody></table></div>
    <p className="note">Candidates may have taken different scenarios, so differences describe observed behaviour, not rank. Neither profile is a hiring decision.</p><Note />
  </>
}