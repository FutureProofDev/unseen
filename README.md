# Unseen — Workplace Skills Simulation Platform

Unseen is a web application designed to evaluate early-career applicants on soft skills, workplace judgment, and collaboration through interactive, scenario-based workplace simulations.

---

## Features

- **Dual-Portal Interface:** Switch between **Employer** (scoring rubrics, candidate analytics, side-by-side comparison) and **Candidate** (simulation scenarios, reflection, integrity tracking) modes.
- **Interactive Scenarios:** Grounded Ghana-based workplace situations (hospital records outage, port clearance disruptions, cash discrepancies).
- **Flexible Teammate Options:** Play solo, with scripted responses, with an AI-powered colleague (powered by xAI Grok), or live multiplayer with another user via a 4-letter session code.
- **Dual Storage Engine:** Runs out-of-the-box in **Local Mode** (`localStorage`) or **Server Mode** (Node.js JSON file database).
- **Integrity Telemetry:** Logs context events (tab visibility, window focus, network disconnects) as non-penalizing context for human reviewers.

---

##  Project Structure

```text
unseen-demo/
├── index.html            # Entry HTML file
├── package.json          # Dependencies & scripts
├── vite.config.js        # Vite + React configuration & server proxy
├── ARCHITECTURE.md       # Technical architecture overview
├── README.md             # Project documentation
├── server/
│   ├── server.js         # Node.js API server (REST endpoints & Grok proxy)
│   └── db.json           # Auto-generated JSON file database
└── src/
    ├── main.jsx          # React app entry point
    ├── App.jsx           # Root layout & routing router
    ├── Candidate.jsx     # Candidate portal & simulation room
    ├── Employer.jsx      # Employer dashboard, scorecard, & comparison tool
    ├── Admin.jsx         # Administrative control panel (Passcode: unseen)
    ├── ui.jsx            # Reusable UI components (Scorecard, Pips, Events)
    ├── data.js           # Default scenarios, rubric items, and seed data
    ├── db.js             # Unified storage layer (local vs server mode)
    ├── shared.js         # Operations engine for data state mutations
    ├── score.js          # Deterministic candidate scoring algorithms
    ├── ai.js             # Integration wrapper for xAI / Grok API
    └── styles.css        # Global CSS styling