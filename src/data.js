export const SCALE = ['Concerning behaviour observed', 'Developing / inconsistent', 'Effective', 'Consistently strong']

export const RUBRIC = [
  { id: 'c1', n: 'Communication and information stewardship', a: ['Shares relevant information accurately', 'Asks useful clarifying questions', 'Separates facts from assumptions', 'Confirms shared understanding and uncertainty'] },
  { id: 'c2', n: 'Collaboration and shared ownership', a: ['Builds on a partner’s contribution', 'Invites other perspectives', 'Shares work and documents decisions', 'Disagrees respectfully'] },
  { id: 'c3', n: 'Judgement, adaptability and problem-solving', a: ['Identifies the real problem and constraints', 'Prioritises safety and impact', 'Adjusts when credible new information appears', 'Chooses proportionate escalation'] },
  { id: 'c4', n: 'Integrity, accountability and learning agility', a: ['Honest about uncertainty and mistakes', 'Protects confidential information', 'Applies feedback or new guidance', 'Reflects specifically on what to change'] }
]

export const REFLECT = 'What, if anything, would you do differently next time, and why?'

// o(text, level, why). level 3 = well-grounded, 2 = partly, 1 = risky. Shown to nobody during play.
const o = (x, lv, why) => ({ x, lv, why })

const SC = [
  {
    id: 's4', ord: 1, level: 'Simple', t: 'Too much change', org: 'Adjoa’s Provisions (fictional)', mins: 10, src: [],
    brief: 'You work the till at a corner shop in Madina. At closing the till is GH₵20 short, and shortages come out of the cashier’s pay. This afternoon you think you gave a customer too much change.',
    A: { role: 'Cashier', fact: 'You are fairly sure the extra GH₵20 went to Auntie Esi, a regular who lives nearby.' },
    B: { role: 'Stock Clerk', fact: 'Yaw, the evening cashier, was warned last week for sloppy counting. He used this till after the afternoon shift.' },
    C: { role: 'Shop Assistant', fact: 'You once heard the owner say shortages are “always the cashier’s problem”.' },
    ask: 'Nothing is written down yet. The till roll is still in the drawer and the owner has not asked anyone.',
    nudge: 'You worry about your pay and mildly prefer calling it a simple counting mistake, or pointing at Yaw. Do not insist if the other person disagrees.',
    p1: { from: 'Shop owner', x: 'The till is short by GH₵20. Whoever it was, it comes out of pay. What goes in the log?', o: [
      o('Pay the GH₵20 yourself and leave the log clean.', 2, 'Covers the cost but hides the shortage.'),
      o('Log the shortage as it is and note the change may have been wrong.', 3, 'Accurate record, own part named.'),
      o('Log it as a counting slip so nobody is blamed or fined.', 1, 'Falsifies the record.')] },
    ch: { from: 'Shop owner', x: 'One more thing: the camera has been broken all week, so nothing shows who gave what change.' },
    p2: { from: 'Kofi, colleague', x: 'Honestly, Yaw has been sloppy all week. If we say it was him, the owner will not check.', o: [
      o('Say nobody can tell who it was and suggest closing the matter.', 2, 'Evasive; leaves the truth out.'),
      o('Say it was probably Yaw, given how his week has gone.', 1, 'Unsupported accusation.'),
      o('Say only what you know first-hand, including any part you played, and leave Yaw out.', 3, 'Honest, fair to Yaw.')] }
  },
  {
    id: 's5', ord: 2, level: 'Simple', t: 'Signing in a friend', org: 'Tema Cold Store (fictional)', mins: 10, src: [],
    brief: 'You work at a cold store in Tema. HR checks attendance at 10am today, and if the whole team is on time everyone gets a GH₵50 bonus. Abu, who covered your shift twice, is stuck in traffic.',
    A: { role: 'Picker', fact: 'Abu messaged you: “Trotro stuck at Kasoa, will be there by 9:30. Please sign me in.”' },
    B: { role: 'Packer', fact: 'Abu once told you he is already on a written warning for lateness.' },
    C: { role: 'Forklift Driver', fact: 'The bonus is what pays your transport this month.' },
    ask: 'Nobody has signed for anyone yet. The supervisor reads the sheet at 10.',
    nudge: 'You really want the team bonus and mildly prefer signing Abu in just once. Do not insist.',
    p1: { from: 'Abu', x: 'Please just sign me in. I covered for you twice. I am nearly there, honest.', o: [
      o('Sign him in just this once and tell him never to ask again.', 1, 'Falsifies the register.'),
      o('Leave his line empty and say nothing to anyone.', 2, 'Honest register, but no help and no word to anyone.'),
      o('Say you cannot sign for him, but you will tell the supervisor he is coming.', 3, 'Keeps the record true and still helps.')] },
    ch: { from: 'Supervisor', x: 'Heads up: HR is on site and will read the sheet at 10. A full team gets the bonus. Anyone late goes in my report.' },
    p2: { from: 'Supervisor', x: 'Is everyone here? Do not make me write anyone up.', o: [
      o('Say you have not looked at who is in.', 2, 'Evasive.'),
      o('Say Abu is on his way and should be here by 9:30.', 3, 'Truthful and constructive.'),
      o('Say everyone is here so the team keeps the bonus.', 1, 'False statement for gain.')] }
  },
  {
    id: 's6', ord: 3, level: 'Simple', t: 'A wrong number in the report', org: 'Ashanti Brand Studio (fictional)', mins: 10, src: [],
    brief: 'You are an intern at a marketing agency in Kumasi. Yesterday’s client report showed sales ten times too high, and the client has noticed. The data file came from Nana, another intern, but the report was built and sent by the team.',
    A: { role: 'Report Intern', fact: 'You pasted Nana’s file into the report and did not check the totals before sending.' },
    B: { role: 'Data Intern', fact: 'You prepared the file. You noticed one repeated row but did not flag it. You are on a final warning for missed deadlines.' },
    C: { role: 'Account Manager', fact: 'The client decides this week whether to renew the contract.' },
    ask: 'The corrected figure has not been worked out yet. The client wants an explanation by 3pm.',
    nudge: 'You are nervous about your job and mildly prefer calling it a system glitch or blaming the data file. Do not insist.',
    p1: { from: 'Manager', x: 'The client is angry. Who got this wrong, and what do I tell them?', o: [
      o('Say you are still checking the cause and will report back once you know.', 2, 'Delays without owning anything.'),
      o('Say it was a system glitch so nobody has to take the blame.', 1, 'Untrue.'),
      o('Explain what happened, including your part, and promise a corrected figure by 3pm.', 3, 'Honest and constructive.')] },
    ch: { from: 'Manager', x: 'New information: the client wants a short, honest written explanation. Nana’s file was fine apart from one repeated row.' },
    p2: { from: 'Nana', x: 'Please keep my name out of it. I am on a final warning and cannot lose this job.', o: [
      o('Agree, and call it a system glitch in the email.', 1, 'Hides the cause.'),
      o('Tell Nana the email will be honest and fair and will not single anyone out.', 3, 'Honest without scapegoating.'),
      o('Tell Nana you will decide after the email is written.', 2, 'Avoids the question.')] }
  },
  {
    id: 's1', ord: 4, level: 'Advanced', t: 'Patient records unavailable', org: 'Riverbend District Hospital (fictional)', mins: 25,
    src: [['MyJoyOnline, 8 Nov 2025: E-health records disaster', 'https://www.myjoyonline.com/e-health-records-disaster-clinicians-risk-misdiagnosing-patients-after-losing-5-years-of-medical-data/'], ['MyJoyOnline: Clinic stored patient records on an unassessed system', 'https://www.myjoyonline.com/ghanaian-clinic-stored-patient-records-on-an-unassessed-system-before-regulator-intervened/']],
    brief: 'It is 9am at a district hospital. The records system has been down for an hour and the outpatient queue is out of the door. With a colleague, keep intake moving without guessing at patient information, and report the outage. Dr Boadi is on the ward and the Records Lead is hard to reach. This is about workplace judgement, not medicine.',
    A: { role: 'Records Assistant', fact: 'A paper intake form exists in the records office, but its medication-history section is incomplete.' },
    B: { role: 'Ward Clerk', fact: 'Dr Boadi warned that missing medication history must never be guessed. It has to be checked with the patient or a clinician.' },
    C: { role: 'Triage Nurse', fact: 'Two people in the queue take regular medication, and one of them is a child.' },
    ask: 'Nothing else is confirmed. The cause of the outage is unknown and nobody has given a restoration time.',
    nudge: 'You are tired and the queue is long. You mildly prefer filling in usual medication from memory to keep things moving.',
    p1: { from: 'Supervisor', x: 'The queue is out of the door. Fill in the usual medication from memory so we keep moving. Dr Boadi can sort it out later.', o: [
      o('Fill in the common medication and flag the form for a later check.', 2, 'A later check does not remove the risk.'),
      o('Fill in the usual medication from memory, then move to the next patient.', 1, 'Invents clinical information.'),
      o('Leave medication blank, mark it unverified and ask Dr Boadi or the patient.', 3, 'Keeps uncertainty visible.')] },
    ch: { from: 'Records Lead', x: 'Update: the approved paper procedure needs a clinician signature on every temporary record and a log of who handled it. Please apply it.' },
    p2: { from: 'Worried relative', x: 'My neighbour was admitted last week and she has no family. Please open her file and tell me what she was given. I only want to help.', o: [
      o('Check whether she has an authorised contact and share nothing for now.', 2, 'Still opens the file without authority.'),
      o('Share her medication, since the relative seems genuine.', 1, 'Privacy breach.'),
      o('Say you cannot share it and point to the patient or the records office.', 3, 'Protects confidentiality and stays helpful.')] }
  },
  {
    id: 's2', ord: 5, level: 'Advanced', t: 'Tema Port clearance disruption', org: 'Gold Coast Freight (fictional)', mins: 25,
    src: [['MyJoyOnline, 4 Sep 2025: Freight forwarders raise alarm over ICUMS downtimes', 'https://www.myjoyonline.com/freight-forwarders-raise-alarm-over-frequent-icums-downtimes-at-tema-port/'], ['MyJoyOnline, 30 Aug 2026: Stronger GRA digital systems needed at ports', 'https://www.myjoyonline.com/stronger-gra-digital-systems-needed-at-ports-ieag/'], ['MyJoyOnline, 21 Oct 2026: Finance Ministry to meet maritime stakeholders', 'https://www.myjoyonline.com/finance-ministry-to-meet-maritime-stakeholders-over-tema-port-clearance-delays/']],
    brief: 'A customer’s container has been waiting at Tema Port and extra storage charges start on Friday. The customs clearance platform keeps dropping out. With a colleague at a freight company, update the customer and find a way forward without bypassing controls. Your supervisor owns escalation.',
    A: { role: 'Freight Coordinator', fact: 'You received an unverified message saying the system will be back shortly.' },
    B: { role: 'Documents Officer', fact: 'You have a confirmed update that this shipment is at risk of extra storage charges after Friday.' },
    C: { role: 'Customer Liaison', fact: 'The customer has said they will move to a rival agent if there is another delay.' },
    ask: 'There is no official restoration time. The terminal desk handles manual queries and your supervisor owns escalation.',
    nudge: 'You fear losing the customer and mildly prefer promising delivery or marking the step done. Do not insist.',
    p1: { from: 'Customer', x: 'Mark the clearance step complete now so my truck can collect. I will bring the paperwork later. I will move my business if this drags on.', o: [
      o('Mark it pending but let the truck come, and chase the paperwork later.', 2, 'Still implies clearance.'),
      o('Keep it open until confirmed and give the customer a verified update.', 3, 'Protects the control and stays helpful.'),
      o('Mark it complete, since the customer will send the paperwork.', 1, 'Bypasses a control.')] },
    ch: { from: 'Operations Manager', x: 'Update: the agency confirms a manual declaration route through its official service desk. It needs the shipment reference and a supervisor sign-off.' },
    p2: { from: 'Operations Manager', x: 'The customer is furious. Can you promise delivery by Monday? I need to keep this account.', o: [
      o('Say Monday is likely, without promising it.', 2, 'Implies more than is known.'),
      o('Promise Monday and call if it slips.', 1, 'Unsupported promise.'),
      o('Say what is confirmed, what is not, and when you will update them next.', 3, 'Honest and owned.')] }
  },
  {
    id: 's3', ord: 6, level: 'Advanced', t: 'Cash discrepancy and a fair investigation', org: 'Savannah Trust Bank (fictional)', mins: 25,
    src: [['MyJoyOnline, 9 Jul 2026: Not every staff implicated in fraud steals money – BoG', 'https://www.myjoyonline.com/not-every-staff-implicated-in-fraud-steals-money-bank-of-ghana/'], ['MyJoyOnline, 9 Jul 2026: Staff fraud in banks, SDIs drops by 40% in 2025', 'https://www.myjoyonline.com/staff-fraud-in-banks-sdis-drops-by-40-in-2025-bog/']],
    brief: 'A bank branch finds a gap between cash collected and deposits posted. Records are incomplete. Ama, a teller, used a shared terminal that day and has been late twice this month. With a colleague, preserve evidence, report through the right channel, speak carefully to a customer and keep the process fair. The audit has not started.',
    A: { role: 'Customer Service Officer', fact: 'The reconciliation record for the day is missing from the file.' },
    B: { role: 'Teller Supervisor', fact: 'Ama had a login problem that day and used a shared terminal. She has also been late twice this month.' },
    C: { role: 'Teller', fact: 'You are Ama. You had a login problem and used a shared terminal. You did nothing wrong, but you are frightened and would like the others not to mention it.' },
    ask: 'Nothing proves who handled the cash. The audit has not started.',
    nudge: 'You are frightened of being blamed. You may ask the others, gently, to leave the shared terminal out of what they report. Do not be aggressive.',
    p1: { from: 'Branch Manager', x: 'Customers are asking. Tell me who did it so we can close this today. Ama has been late twice this month.', o: [
      o('Say Ama is the likeliest, given the shared terminal.', 1, 'Unsupported accusation.'),
      o('Tell the manager unofficially that Ama may be involved.', 2, 'Speculation can harm a colleague.'),
      o('Say the facts are incomplete, share what is known, and report to compliance.', 3, 'Fair and evidence-based.')] },
    ch: { from: 'Compliance Officer', x: 'Update: log it in the incident register, leave the till roll and terminal logs untouched, and do not discuss individuals outside the audit.' },
    p2: { from: 'Concerned customer', x: 'My deposit is missing. Was a staff member stealing it? Tell me the truth.', o: [
      o('Say you cannot discuss it and end the call.', 2, 'Leaves the customer without an owner.'),
      o('Say a staff member is likely responsible and it is being handled.', 1, 'Unsupported and unfair.'),
      o('Say it is under review, with no conclusions yet, and give a reference and next contact.', 3, 'Honest, careful, fair.')] }
  }
]

const d = s => Date.parse(s)
const T = (end, extra = []) => [{ at: '00:00', text: 'Simulation started' }, ...extra, { at: end, text: 'Simulation submitted and completed' }]
const BLANK = { source: 'seed', ctx: '' }

const CANDS = [
  {
    ...BLANK, id: 'c1', name: 'Efua Quaye', role: 'Operations Trainee', scn: 's2', status: 'New', createdAt: d('2026-10-21'),
    r: { c1: { s: 4, e: ['e1'] }, c2: { s: 3, e: ['e2'] }, c3: { s: 2, e: ['e4'] }, c4: { s: 3, e: ['e5'] } },
    ev: [
      { id: 'e1', t: '04:10', k: 'message', x: '“Before we update the customer, let’s separate what is confirmed, the storage-charge risk, from the unverified note that the system is returning soon.”' },
      { id: 'e2', t: '06:30', k: 'message', x: '“I’ll draft the customer note if you call the terminal desk, then we compare.”' },
      { id: 'e3', t: '10:05', k: 'decision', x: 'Declined to mark the clearance step complete; offered a verified update instead.' },
      { id: 'e4', t: '14:20', k: 'message', x: '“Let’s keep an eye on it.” No owner or route was named for escalation.' },
      { id: 'e5', t: '16:45', k: 'message', x: '“Thanks, that changes things. I’ll revise the update to say system status is unconfirmed.”' }
    ],
    did: ['Declined to mark clearance complete before confirmation.', 'Wrote a customer update that separated fact from rumour.'],
    strengths: ['Clear, accurate information sharing'], improve: ['Name who owns the next escalation step.'],
    follow: ['Ask: who would you escalate to, and when?'],
    agility: 'Revised the customer update after the manual-declaration route was confirmed (e5).',
    refl: '“I would name the supervisor as escalation owner straight away.”', tele: T('18:10')
  },
  {
    ...BLANK, id: 'c2', name: 'Yaw Darko', role: 'Patient Services Trainee', scn: 's1', status: 'Shortlisted', createdAt: d('2026-10-18'),
    r: { c1: { s: 3, e: ['e1'] }, c2: { s: 3, e: ['e2'] }, c3: { s: 3, e: ['e3'] }, c4: { s: 4, e: ['e4', 'e5'] } },
    ev: [
      { id: 'e1', t: '03:10', k: 'message', x: '“Dr Boadi said not to guess medication history. Should we mark that field ‘unknown, verify with clinician’?”' },
      { id: 'e2', t: '05:40', k: 'message', x: '“I’ve written both our facts in the shared log so we use the same wording.”' },
      { id: 'e3', t: '09:15', k: 'decision', x: 'Declined to fill medication from memory; marked it unverified and flagged it to the clinician.' },
      { id: 'e4', t: '13:02', k: 'message', x: '“I don’t know the approved fallback procedure. Can the records lead walk us through it?”' },
      { id: 'e5', t: '14:30', k: 'message', x: '“Using the walkthrough, I’ve added a clinician-signature line to the temporary form.”' }
    ],
    did: ['Sent fewer messages, but each added accurate information.', 'Asked for the approved procedure, then applied it.'],
    strengths: ['Asks good questions; applies new guidance'], improve: ['Offer a view earlier when the facts are clear.'],
    follow: ['Ask: how would you explain the outage to a worried caregiver?'],
    agility: 'Recognised a knowledge gap (e4), asked for guidance, then applied it in the next step (e5).',
    refl: '“I would ask for the fallback procedure sooner.”', tele: T('19:40')
  },
  {
    ...BLANK, id: 'c3', name: 'Abena Ofori', role: 'Branch Operations Trainee', scn: 's3', status: 'New', createdAt: d('2026-10-25'),
    r: { c1: { s: 3, e: ['e2'] }, c2: { s: null, note: 'The partner contributed little in this session, so there is no collaboration evidence either way. This is not penalised.' }, c3: { s: 3, e: ['e3'] }, c4: { s: 3, e: ['e1', 'e2'] } },
    ev: [
      { id: 'e1', t: '02:20', k: 'message', x: '“It looks like the cashier on duty took it. Can we report that?”' },
      { id: 'e2', t: '06:05', k: 'message', x: '“I assumed too fast. We only know a reconciliation record is missing and one access issue. Let me restate it neutrally.”' },
      { id: 'e3', t: '08:30', k: 'decision', x: 'Preserved the till roll, logged the missing record and reported to compliance without naming a person.' }
    ],
    did: ['Made an early assumption, then acknowledged and corrected it.', 'Reported through compliance without naming a person.'],
    strengths: ['Corrects course openly'], improve: ['Check assumptions before stating them.'],
    follow: ['Ask: what prompted you to revisit the early assumption?'],
    agility: 'Acknowledged an assumption (e1), corrected it (e2) and kept the later report neutral (e3).',
    refl: '“I would wait for IT to confirm before saying anything about a person.”', tele: T('17:25')
  },
  {
    ...BLANK, id: 'c4', name: 'Nii Lamptey', role: 'Logistics Trainee', scn: 's2', status: 'Human review requested', createdAt: d('2026-10-27'),
    r: { c1: { s: 3, e: ['e1'] }, c2: { s: 3, e: ['e2'] }, c3: { s: 3, e: ['e3'] }, c4: { s: null, note: 'The session was interrupted, so there is not enough evidence to judge feedback uptake.' } },
    ev: [
      { id: 'e1', t: '03:50', k: 'message', x: '“The confirmed charge risk goes first. ‘Back soon’ is unverified, so we should label it that way.”' },
      { id: 'e2', t: '07:10', k: 'message', x: '“I’ll draft the escalation to the shipping-line contact while you handle the customer.”' },
      { id: 'e3', t: '11:30', k: 'decision', x: 'Proposed a manual declaration through the agency’s official desk rather than marking the step complete.' }
    ],
    did: ['Put confirmed information ahead of rumour.', 'Proposed a contingency that kept the control in place.'],
    strengths: ['Prioritises by impact'], improve: ['Document decisions in the shared log.'],
    follow: ['Ask what happened during the interruption.', 'Offer a reassessment if needed.'],
    agility: 'No clear evidence of applying feedback was observed in this simulation (the session was interrupted).',
    refl: '“The interruption cost me the second half of the task.”',
    ctx: 'My connection dropped for about two minutes and I resumed after it came back.',
    tele: [{ at: '00:00', text: 'Simulation started' }, { at: '08:42', text: 'Tab became hidden for 18 seconds', k: 'ctx' }, { at: '12:15', text: 'Connection interrupted; session resumed after 2 minutes', k: 'ctx' }, { at: '16:50', text: 'Simulation submitted and completed' }]
  },
  { ...BLANK, id: 'c5', name: 'Kojo Tetteh', role: 'Patient Services Trainee', scn: 's1', status: 'Invited', createdAt: d('2026-10-30'), r: {}, ev: [], did: [], strengths: [], improve: [], follow: [], tele: [] }
]

export function seed() {
  return {
    users: Object.fromEntries(CANDS.map(c => ['u_' + c.id, { id: 'u_' + c.id, name: c.name, seed: true, createdAt: c.createdAt }])),
    candidates: Object.fromEntries(CANDS.map(c => [c.id, { ...c, userId: 'u_' + c.id }])),
    sessions: {},
    scenarios: Object.fromEntries(SC.map(s => [s.id, { ...s, active: true }])),
    settings: { adminPass: 'unseen', aiOn: false, model: 'grok-3', defaultB: 'scripted', defaultC: false, reflection: 'optional' }
  }
}