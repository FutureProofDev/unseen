import { useEffect, useState } from 'react'
import { useDB, dbMode } from './db.js'
import { Dash, List, Detail, Compare } from './Employer.jsx'
import { Who, Home, Library, Intro, Room, Reflect, Results, Premium, History } from './Candidate.jsx'
import { Admin } from './Admin.jsx'

const KEY = 'unseen.tab.v2'
const init = { role: 'employer', nav: { v: 'dash' }, me: null, adm: false, cmp: [] }
const NAV = {
  employer: [['dash', 'Overview'], ['list', 'Candidates'], ['compare', 'Compare']],
  candidate: [['home', 'Home'], ['library', 'Situations'], ['results', 'Results'], ['history', 'History'], ['premium', 'Premium']],
  admin: []
}
const EMP = { dash: Dash, list: List, detail: Detail, compare: Compare }
const CAN = { home: Home, library: Library, intro: Intro, room: Room, reflect: Reflect, results: Results, premium: Premium, history: History }

function Gate({ db, setS }) {
  const [pw, setPw] = useState('')
  const [bad, setBad] = useState(false)
  const submit = e => { e.preventDefault(); if (pw === db.settings.adminPass) setS(s => ({ ...s, adm: true })); else setBad(true) }
  return <>
    <h1>Admin</h1>
    <form onSubmit={submit} className="btns">
      <label>Passcode <input type="password" value={pw} onChange={e => { setPw(e.target.value); setBad(false) }} /></label>
      <button className="btn">Enter</button>
    </form>
    {bad && <p role="alert" className="err">Incorrect passcode.</p>}
    <p className="note">Demo gate only. This is not real security.</p>
  </>
}

export default function App() {
  const db = useDB()
  const [S, setS] = useState(() => { try { return { ...init, ...JSON.parse(sessionStorage.getItem(KEY)) } } catch { return init } })
  useEffect(() => { try { sessionStorage.setItem(KEY, JSON.stringify(S)) } catch { /* storage unavailable */ } }, [S])
  if (!db) return <main id="main"><p>Loading…</p></main>

  const go = (v, id, sid) => { setS(s => ({ ...s, nav: { v, id, sid } })); window.scrollTo(0, 0) }
  const role = r => setS(s => ({ ...s, role: r, nav: { v: r === 'employer' ? 'dash' : r === 'candidate' ? 'home' : 'a' } }))
  const { v, id, sid } = S.nav
  const P = { db, S, setS, go, id, sid }

  let view
  if (S.role === 'admin') view = S.adm ? <Admin db={db} /> : <Gate db={db} setS={setS} />
  else if (S.role === 'employer') { const V = EMP[v] || Dash; view = <V {...P} /> }
  else if (!db.users[S.me]) view = <Who {...P} />
  else { const V = CAN[v] || Home; view = <V {...P} /> }

  const items = NAV[S.role]
  return <>
    <a className="skip" href="#main">Skip to content</a>
    <header>
      <button className="brand" onClick={() => role(S.role)} aria-label="Unseen home"><b>u.</b>unseen<span>SKILLS WE<br />CAN’T SEE</span></button>
      <nav aria-label="Sections">
        {items.map(([k, l]) => <button key={k} className={'nl' + (v === k ? ' on' : '')} aria-current={v === k ? 'page' : undefined} onClick={() => go(k)}>{l}</button>)}
        {S.role === 'candidate' && S.me && <button className="nl" onClick={() => setS(s => ({ ...s, me: null }))}>Switch person</button>}
      </nav>
      <div className="roles" role="group" aria-label="Switch portal">
        {['employer', 'candidate', 'admin'].map(r => <button key={r} aria-pressed={S.role === r} className={S.role === r ? 'on' : ''} onClick={() => role(r)}>{r[0].toUpperCase() + r.slice(1)}</button>)}
      </div>
    </header>
    <main id="main">{view}</main>
    <footer>Unseen is a demonstration with fictional people and employers, not a validated hiring tool. {dbMode() === 'server' ? 'Data is shared via the server.' : 'Data is stored in this browser.'}</footer>
  </>
}