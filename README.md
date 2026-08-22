# India Recession Predictor — Research Platform

**v2.0 | Data: January 2000 – February 2026 | 302 Months | 6 Recession Episodes | ~44 Recession Months**

Team: Ratan Sharma (A036) · Mayank Gupta (A042) · Kunal Verma (A024) | NMIMS Mumbai | MSc Data Science 2026

A research-grade web platform where economists, data scientists, and institutional researchers collaboratively predict, analyse, and explain Indian economic recessions using Machine Learning (Random Forest), NLP (FinBERT), and Agentic RAG (FAISS) — trained on 26 years of data covering six distinct recession episodes.

This README merges the PRD, TRD, App Flow, Implementation Plan, Backend Schema, UI/UX Brief, and the raw dataset dictionary into one reference document for the project workspace (Antigravity).

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Dataset & Data Dictionary](#2-dataset--data-dictionary)
3. [Technical Requirements](#3-technical-requirements)
4. [Database Schema](#4-database-schema)
5. [App Flows](#5-app-flows)
6. [UI/UX Design Brief](#6-uiux-design-brief)
7. [Implementation Plan](#7-implementation-plan)
8. [Definition of Done — v2.0](#8-definition-of-done--v20)

---

## 1. Product Overview

### 1.1 Vision
India Recession Predictor trains ML/NLP/Agentic AI on **302 months (Jan 2000 – Feb 2026)** covering **six distinct recession episodes** — not just COVID. This replaces the v1.0 limitation of training only on Jan 2012–Feb 2026 (170 months, 10 recession months, COVID-only).

| Metric | v1.0 | v2.0 |
|---|---|---|
| Total months | 170 | **302 (+132)** |
| Date range | Jan 2012 – Feb 2026 | **Jan 2000 – Feb 2026** |
| Recession months | 10 (COVID only) | **~44 across 6 episodes** |
| Class imbalance | 5.9% (extreme) | **~14.6% (manageable)** |
| Recession types seen | 1 (pandemic supply shock) | **6 (demand, financial, currency, policy shock, pre-pandemic, pandemic)** |

### 1.2 Six Recession Episodes

| # | Period | Cause | Type | Key Signal |
|---|---|---|---|---|
| 1 | Sep 2001 – Mar 2002 | Post dot-com + 9/11 | External demand | IIP fell sharply; trade collapsed; RBI cut repo rate |
| 2 | Oct 2008 – Mar 2009 | Global Financial Crisis | Financial crisis | Yield spread inverted; FII outflows; credit growth collapsed; INR fell |
| 3 | Jun 2013 – Sep 2013 | US Taper Tantrum + INR crash | Currency crisis | RBI emergency hike to 10.25%; INR hit 68/USD |
| 4 | Nov 2016 – Feb 2017 | Demonetization | Domestic policy shock | Cash economy disrupted; GDP fell in Q3 FY17 |
| 5 | Jul 2019 – Nov 2019 | Pre-COVID demand slowdown | Demand slowdown | Auto sector collapse; NBFC/shadow banking stress |
| 6 | Mar 2020 – Oct 2020 | COVID-19 pandemic | Pandemic shock | GDP −24.4% Q1 FY21; IIP −57.3% Apr 2020; RBI 75bps emergency cut |

### 1.3 Target Users
- **Primary — Researchers:** academic economists/data scientists, RBI research dept., Finance Ministry advisors, NMIMS faculty/students (pilot audience)
- **Secondary — Consumers:** institutional investors, journalists, public users
- **Admin:** approves researcher registrations and model deployments

### 1.4 Feature Requirements (Must-Have)
- **F01 — 26-Year Timeline Dashboard**: 302-point Plotly chart, 6 shaded recession periods, zoom (5Y/10Y/All), click-to-detail, hover tooltips
- **F02 — Episode Comparator**: side-by-side 13-indicator comparison of any 2 of the 6 episodes, highlighted differences
- **F03 — Document Upload & FinBERT Scoring**: PDF/HTML upload, MIME + size + ClamAV checks, <60s scoring, peer review then admin approval before FAISS inclusion
- **F04 — Data Upload with Gap Handling**: CSV upload from Jan 2000, CPI/WPI proxy prompt, sent_mpc auto-fill 0.0 pre-Oct-2016
- **F05 — Researcher Portal**: uploads, Scenario Builder, API access, alert subscriptions, contribution history

**Should-Have:** F06 SHAP explainability · F07 public API · F08 Scenario Builder episode presets · F09 peer review queue · F10 alert subscriptions

### 1.5 Non-Functional Requirements
- 302-point timeline renders **<2s** on desktop Chrome
- API response **<500ms**
- Model retrain **<15 min** via Celery
- FinBERT scoring **<60s**
- HTTPS/TLS 1.3, JWT (1hr access / 7-day refresh), 2FA mandatory for admin
- Rate limiting: 100 req/min public, 1000 calls/day per API key

### 1.6 Success Metrics
- Model detects all ~44 recession months across 6 episodes in backtesting
- 2008 GFC correctly identified using only data available at the time
- AUC-ROC > 0.95, false alarm rate < 15%
- 50+ registered researchers within 6 months; 100+ documents in corpus within 1 year

---

## 2. Dataset & Data Dictionary

*Source: `00_README_DATA_DICTIONARY.txt` — Generated March 2026, based on RBI / MOSPI / CMIE official publications.*

| File | Description | Source | Key Column | Rows | Frequency |
|---|---|---|---|---|---|
| `01_iip_monthly_2012_2025.csv` | Index of Industrial Production monthly growth (YoY %) | MOSPI / RBI Handbook (Base 2011-12=100) | `iip_growth_pct` (negative = contraction) | 163 | Monthly |
| `02_cpi_monthly_2012_2026.csv` | CPI combined inflation (YoY %) | MOSPI / RBI MPC Statements | `cpi_yoy_pct` (RBI target 4% ±2%) | 65 | Monthly |
| `03_gdp_quarterly_2012_2026.csv` | GDP growth at constant prices (2011-12 base, YoY %) | MOSPI National Accounts / RBI MPC | `gdp_growth_pct` (incl. FY26 MPC projections) | 58 | Quarterly |
| `04_repo_rate_2010_2026.csv` | RBI Repo Rate at each MPC decision | All RBI MPC Resolutions 2010–2026 | `repo_rate_pct`, `action` (Hike/Cut/Hold) | 47 | Per MPC meeting (~6/yr) |
| `05_yield_spread_2010_2026.csv` | 10Y G-Sec minus 91-day T-bill yield (bps) | RBI DBIE / CCIL | `yield_spread_bps` (negative = inverted curve = warning) | 194 | Monthly |
| `06_bank_credit_growth_2010_2026.csv` | Scheduled Commercial Bank credit growth (YoY %) | RBI DBIE | `credit_growth_yoy_pct` (low = financial stress) | 64 | Quarterly |
| `07_unemployment_rate_2017_2026.csv` | Urban + Rural unemployment (UPSS basis) | CMIE Consumer Pyramids / PLFS MoSPI | `unemployment_rate_pct` (COVID spike 23.5% Apr 2020) | 36 | Quarterly |
| `08_lending_deposit_rates_2015_2026.csv` | WALR (fresh + outstanding), WADTDR (fresh + outstanding) | RBI Lending & Deposit Rates Press Release Feb 2026 | `walr_fresh_loans_pct`, `wadtdr_fresh_deposits_pct` | 45 | Monthly (Feb 2026 = actual from source PDF) |
| `09_fiscal_deficit_2010_2026.csv` | Central Govt fiscal deficit as % of GDP | Union Budget / CGA / RBI | `fiscal_deficit_pct_gdp` (COVID spike 9.2% FY21) | 17 | Annual (FY) |
| `10_nlp_mpc_sentiment_2016_2026.csv` | Sentiment score from RBI MPC documents (FinBERT-equivalent) | RBI MPC Minutes & Resolutions | `sentiment_score` (−1 hawkish/negative to +1 dovish/positive). **Feb 2025–Feb 2026 scores are real (extracted from uploaded PDFs)** | 33 | Per MPC meeting |
| `11_recession_labels_2012_2026.csv` | Ground-truth recession labels | Defined: severe IIP contraction + GDP stress | `recession_label` (1/0). Periods: Aug–Nov 2019 (pre-COVID stress), Mar–Aug 2020 (COVID) | 170 | Monthly |
| `12_master_ml_dataset.csv` ⭐ **USE FOR MODEL** | All indicators merged + feature-engineered, sklearn-ready. Includes iip, cpi, gdp, repo, yield_spread, credit, unemployment, sentiment + engineered: 3m rolling IIP, CPI momentum, repo change, GDP lag, IIP lag | — | `recession_label` (target) + all feature columns | 170 × 19 cols | Monthly |

> **Note on scope vs. spec docs:** The raw dictionary above describes the **170-month (Jan 2012–Feb 2026), COVID-only v1.0 dataset** currently on disk. The PRD/TRD/Implementation docs below describe the **v2.0 target: extending to 302 months (Jan 2000–Feb 2026) with 6 recession episodes**. Section 3.2 and Section 7 (Phase 1) describe exactly how to bridge this gap (WPI proxy for CPI 2000–2010, yield-spread proxy 2000–2002, VIX proxy 2000–2008, sent_mpc=0.0 pre-Oct-2016).

**Recession periods currently defined (v1.0 labels):**
- Aug 2019 – Nov 2019: Pre-COVID industrial & economic stress
- Mar 2020 – Aug 2020: COVID-19 economic contraction
- *(India has not had another officially declared recession outside 2020 — v2.0 extends the definition to 6 historically-referenced episodes per NIPFP/RBI/IMF sourcing, see §2 Six Recession Episodes above)*

**Key download links (to refresh data yourself):**
- IIP: https://mospi.gov.in/web/mospi/iip
- CPI: https://mospi.gov.in/consumer-price-index
- GDP: https://mospi.gov.in/national-accounts-statistics
- Repo Rate: https://www.rbi.org.in/Scripts/BS_ViewBulletin.aspx
- Yield Spread: https://dbie.rbi.org.in/DBIE/dbie.rbi?site=statistics
- Credit Growth: https://dbie.rbi.org.in
- Unemployment: https://www.cmie.com/kommon/bin/sr.php?kall=wuee

---

## 3. Technical Requirements

### 3.1 Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Frontend | React.js | 18.x | Main UI, 302-point interactive timeline |
| Frontend | Tailwind CSS | 3.x | Utility-first styling, 6-episode colour system |
| Frontend | Plotly.js | Latest | 26-year timeline, 6 coloured shadings, zoom, hover |
| Frontend | React Router v6 | 6.x | Client-side routing incl. `/episodes` |
| Backend | Python Flask | 3.x | REST API — prediction & data endpoints |
| Backend | Celery | 5.x | Background tasks — FinBERT scoring, model retrain |
| Backend | Redis | 7.x | Celery broker + prediction cache |
| Backend | Flask-JWT-Extended | Latest | JWT access/refresh tokens |
| AI/ML | Scikit-learn | 1.4.x | Random Forest, StandardScaler, SMOTE |
| AI/ML | HuggingFace Transformers | 4.x | FinBERT (ProsusAI/finbert) |
| AI/ML | FAISS | 1.7.x | Vector search, 545 document chunks |
| AI/ML | PyTorch | 2.x | FinBERT inference backend |
| Database | PostgreSQL | 16.x | Primary DB |
| Database | SQLAlchemy | 2.x | ORM |
| Database | Alembic | Latest | Migrations |
| Storage | Cloudflare R2 | Latest | PDF/HTML/CSV/model pkl storage |
| Deploy | Railway / Render | Latest | Flask + React + Postgres + Redis |
| Deploy | GitHub Actions | Latest | CI/CD, auto-deploy on merge to main |
| Deploy | Nginx | 1.25.x | Reverse proxy |

### 3.2 Data Gap Handling Strategy (2000–present extension)

| Feature | Available From | Gap Period | Proxy Strategy |
|---|---|---|---|
| IIP Monthly Growth | Apr 1994 | None | Direct MOSPI download |
| GDP Quarterly | Apr 1996 | None | NSO data, cubic-spline interpolated to monthly |
| Repo Rate | Jan 2000 | None | Full RBI DBIE history |
| Credit Growth | Jan 2000 | None | RBI DBIE complete from 2000 |
| CPI Inflation | Jan 2011 | Jan 2000 – Dec 2010 | WPI proxy calibrated via Jan 2011–Dec 2013 overlap (36mo), linear regression `CPI = a×WPI + b`. Flag: `cpi_wpi_proxy=TRUE` |
| Yield Spread | Jan 2003 | Jan 2000 – Dec 2002 | RBI benchmark lending rate minus savings rate. Flag: `yield_spread_proxy=TRUE` |
| sent_mpc (NLP) | Oct 2016 | Jan 2000 – Sep 2016 | Fill 0.0 (neutral — no statement = no signal). Flag: `sent_mpc_available=FALSE` |
| India VIX | Mar 2008 | Jan 2000 – Feb 2008 | Nifty 50 30-day historical volatility proxy. Flag: `india_vix_proxy=TRUE` |
| INR/USD | Jan 2000 | None | Yahoo Finance USDINR=X |
| Brent Oil | Jan 2000 | None | Yahoo Finance BZ=F |
| Nifty 50 Returns | Jan 2000 | None | Yahoo Finance ^NSEI |

### 3.3 Model Training Changes (v1.0 → v2.0)

| Parameter | v1.0 (170mo) | v2.0 (302mo) |
|---|---|---|
| Training split | SPLIT=104 (Jan 2012–Aug 2020) | **SPLIT=211 (Jan 2000–Oct 2017)** |
| Test set | 66mo (Sep 2020–Feb 2026) | **91mo (Nov 2017–Feb 2026, incl. COVID)** |
| Recession months in train | 10 (COVID only) | **~34 across 5 episodes** |
| n_estimators | 300 | **400** |
| max_depth | 5 | **6** |
| SMOTE | 1:1 (10→150 synthetic) | **1:1 (34→34 synthetic)** |
| Model file | `rf_ft_finbert.pkl` | **`rf_302m_v1.pkl`** |

**Unchanged in v2.0:** FinBERT model (ProsusAI/finbert), FAISS store (545 chunks/37 docs), 5-agent logic, blend formula `Final = (ML × 0.60) + (Agent avg × 0.40)`, Flask endpoint structure, React component structure, 15 original DB tables.

### 3.4 API Endpoints

**Prediction endpoints:**
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/recession/current` | None | Latest score, status, top features, explanation |
| GET | `/api/v1/recession/timeline` | None | All 302 months, date/probability/status |
| GET | `/api/v1/recession/month/{YYYY-MM}` | None | Full breakdown for any month from Jan 2000 |
| GET | `/api/v1/recession/episodes` | None | All 6 episodes with period/cause/colour/peak prob |
| GET | `/api/v1/recession/episodes/{n}/compare?with={m}` | None | 13-indicator comparison, two episodes |
| GET | `/api/v1/recession/forecast/{scenario}` | None | 2026 forecast: baseline/stress/recovery |
| POST | `/api/v1/recession/scenario` | JWT Researcher | Custom 13-indicator scenario → live prediction |
| GET | `/api/v1/recession/agents/{YYYY-MM}` | None | All 5 agent scores + FAISS evidence |
| GET | `/api/v1/recession/shap/{YYYY-MM}` | JWT Researcher | SHAP feature contributions |

**Document/data endpoints:**
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/documents` | None | Approved documents + FinBERT scores |
| POST | `/api/v1/documents/upload` | JWT Researcher | Upload PDF/HTML → Celery FinBERT task |
| POST | `/api/v1/documents/{id}/review` | JWT Researcher | Peer review approve/reject |
| POST | `/api/v1/data/upload` | JWT Researcher | Upload CSV → validation + gap detection |
| POST | `/api/v1/admin/model/retrain` | JWT Admin | Manual retrain on full 302-month dataset |
| * | `/api/v1/auth/register\|login\|refresh\|logout` | Various | Full JWT auth suite incl. 2FA |
| GET | `/api/v1/health` | None | DB, Redis, FAISS, model health check |

### 3.5 Security & Infrastructure
- JWT: 1hr access, 7-day refresh (httpOnly cookie); RBAC (PUBLIC/RESEARCHER/ADMIN/SUPER_ADMIN)
- 2FA (TOTP): mandatory ADMIN, optional RESEARCHER; 5 failed logins = 15min lockout (audit_log)
- Passwords: 12+ chars, 1 upper, 1 number, 1 special
- Uploads: PDF/HTML/CSV by MIME type, 10MB max, ClamAV scan, private ACL in R2, UUID filenames
- Deploy: Railway (Flask + React + Postgres 16 + Redis 7 + Celery workers), GitHub Actions CI/CD (pytest on PR, auto-deploy on merge), UptimeRobot health checks every 5 min, Sentry error tracking, daily Postgres backups (30-day retention)

---

## 4. Database Schema

**PostgreSQL 16 · SQLAlchemy 2.x ORM · Alembic migrations · 17 tables total.** New in v2.0: `recession_episodes`, `data_gap_log`. Updated: `economic_data`, `predictions` gain proxy-flag columns + `recession_episode_id` FK.

### 4.1 All Tables

| Table | Category | v2.0 Change | Purpose |
|---|---|---|---|
| `users` | Auth | Unchanged | Roles: public, researcher, admin, super_admin |
| `institutions` | Auth | Unchanged | Universities/research institutes |
| `refresh_tokens` | Auth | Unchanged | JWT refresh tokens, one per session |
| `audit_log` | Auth | Unchanged | Sensitive-action log |
| `recession_episodes` | Core | **NEW** | All 6 episodes: period, cause, colour, peak month |
| `economic_data` | Core | **UPDATED** | 302 months × 13 indicators + proxy flags + episode FK |
| `data_gap_log` | Core | **NEW** | Every data gap: column, months, proxy strategy, calibration |
| `predictions` | ML | **UPDATED** | 302 monthly predictions + episode FK + proxy flag |
| `agent_scores` | ML | Unchanged | 5 agent scores + FAISS evidence per prediction |
| `model_versions` | ML | **UPDATED** | + `n_training_months`, `n_recession_episodes` |
| `documents` | Content | Unchanged | Uploaded PDF/HTML policy documents |
| `document_chunks` | Content | Unchanged | 400-word chunks, individual FinBERT scores |
| `document_annotations` | Content | Unchanged | Researcher sentence-level annotations |
| `peer_reviews` | Content | Unchanged | Peer review decisions |
| `scenarios` | Features | **UPDATED** | + `episode_preset_id` |
| `alert_subscriptions` | Features | Unchanged | Alert threshold subscriptions |
| `research_notes` | Features | Unchanged | Notes on any month or document |

### 4.2 New Table: `recession_episodes`

| Column | Type | Constraint | Description |
|---|---|---|---|
| id | UUID | PK | Unique episode identifier |
| episode_number | INTEGER | UNIQUE, NOT NULL, CHECK 1-6 | Chronological order |
| start_date | DATE | NOT NULL | e.g. 2008-10-01 |
| end_date | DATE | NOT NULL | e.g. 2009-03-01 |
| cause | VARCHAR(200) | NOT NULL | e.g. "Global Financial Crisis" |
| cause_type | ENUM | NOT NULL | external_demand / financial_crisis / currency / domestic_policy / pre_pandemic / pandemic |
| peak_month | DATE | NOT NULL | Month with highest P(recession) in episode |
| peak_probability | FLOAT | NOT NULL | P(recession) at peak |
| dominant_indicator | VARCHAR(100) | NOT NULL | e.g. `yield_spread_bps` for 2008 GFC |
| chart_colour | VARCHAR(10) | NOT NULL | Hex, e.g. #DC143C |
| chart_pattern | VARCHAR(50) | NULLABLE | e.g. diagonal, crosshatch, dots |
| description | TEXT | NULLABLE | Episodes-page card text |
| source_reference | VARCHAR(500) | NOT NULL | e.g. "NIPFP India Business Cycle Dating 2023" |
| created_at | TIMESTAMP | DEFAULT NOW() | — |

### 4.3 New Table: `data_gap_log`

| Column | Type | Constraint | Description |
|---|---|---|---|
| id | UUID | PK | — |
| column_name | VARCHAR(100) | NOT NULL | e.g. `cpi_yoy_pct` |
| gap_start / gap_end | DATE | NOT NULL | Gap period boundaries |
| gap_months | INTEGER | NOT NULL | Length of gap |
| proxy_strategy | TEXT | NOT NULL | e.g. "WPI proxy calibrated using Jan 2011–Dec 2013 overlap" |
| proxy_source | VARCHAR(300) | NOT NULL | e.g. RBI DBIE WPI series code |
| calibration_method | TEXT | NULLABLE | e.g. "CPI = 0.82×WPI + 1.4, R²=0.91" |
| created_by / approved_by | UUID | FK users.id | Who logged / approved |
| created_at | TIMESTAMP | DEFAULT NOW() | — |

### 4.4 Updated Table: `economic_data`

Key columns beyond the standard 13 indicators: `cpi_wpi_proxy` (BOOL), `yield_spread_proxy` (BOOL), `sent_mpc` (FLOAT, default 0.0), `sent_mpc_available` (BOOL), `india_vix_proxy` (BOOL), `recession_label` (INT), `recession_episode_id` (FK, nullable), `data_source`, `uploaded_by` (FK users.id, nullable — NULL for original data).

### 4.5 Updated Table: `predictions`

Key columns: `ml_probability`, `agent_score`, `final_probability` (= ml×0.60 + agent×0.40), `status` (normal/watch/alert), `explanation_text`, `top_features` (JSONB), `recession_episode_id` (FK, nullable), `using_proxy_data` (BOOL), `model_version_id` (FK).

### 4.6 Updated Table: `model_versions`

Key columns: `version_name`, `file_key`/`scaler_key`/`features_key` (R2 keys), `n_features`, `n_training_months` (170 v1.0 / 211 v2.0), `n_recession_episodes`, `n_recession_months`, `recall`, `precision`, `f1_score`, `auc_roc`, `false_alarm_count`, `optimal_threshold`, `is_active`, `approved_by`.

### 4.7 Key Relationships
- `recession_episodes` 1→N `economic_data` (via `recession_episode_id`)
- `recession_episodes` 1→N `predictions` (via `recession_episode_id`)
- `model_versions` 1→N `predictions` (via `model_version_id`)
- `users` 1→N `economic_data` (contributed rows via `uploaded_by`)
- `documents` 1→N `document_chunks`

---

## 5. App Flows

### 5.1 Public Visitor — 26-Year Timeline
Visitor arrives → Home page (current P(recession)%, status badge, 26-year Plotly timeline w/ 6 shaded periods) → hovers a point (e.g. Oct 2008 → "Global Financial Crisis · P=78%") → clicks month → Month Detail panel (13 indicators, 5 agent scores, plain-English explanation) → opens Episodes page → selects 2 episodes to compare → Comparison table (13 indicators at peak, differences highlighted) → downloads PDF report.

### 5.2 Researcher Registration & Login
Register → fill form (name, email, institution, research area, bio) → email verified → PENDING → admin approves → notified → login (credentials + optional 2FA TOTP) → JWT issued → Researcher Dashboard.

### 5.3 Document Upload Flow
Upload PDF/HTML + metadata → validation (MIME → size → ClamAV) → **pass:** saved to R2, status=PROCESSING, Celery queued / **fail:** error shown, retry → Celery worker extracts text → chunks 400 words → FinBERT scores each chunk → composite score → status=SCORED, researcher notified → peer review by 2 researchers (both approve / one rejects / both reject) → admin approves → chunks added to FAISS → retrain scheduled.

### 5.4 Data Upload Flow (with Gap Handling)
Upload CSV → system detects columns/date range → validation screen (columns, range, missing values, preview) → **Gap Check 1:** CPI before Jan 2011? → prompt "Is this WPI proxy data?" → **Gap Check 2:** sent_mpc before Oct 2016? → auto-fill 0.0, inform researcher → researcher confirms → admin notified → admin approves → merged into 302-month master dataset → model retrained (old vs new performance shown) → admin approves new model → goes live, all 302 predictions regenerated.

### 5.5 Monthly Automated Prediction (1st of month, Celery beat)
Scheduler triggers → **Step 1** auto-fetch IIP (MOSPI), CPI (NSO), Repo Rate (RBI DBIE) → **Step 2** feature engineering (lags, rolling avgs, momentum) → **Step 3** NLP check for new MPC statement, score + update FAISS → **Step 4** load `rf_302m_v1.pkl`, scale, get P(recession) → **Step 5** run all 5 agents (FAISS queries, evidence, individual scores) → **Step 6** blend `Final = ML×0.60 + Agent avg×0.40` → **Step 7** store to predictions table → **Step 8** alert check, send emails on threshold crossing → **Step 9** refresh Redis cache.

### 5.6 26-Year Timeline API Flow
`GET /api/v1/recession/timeline` → Flask checks Redis cache → **hit:** return <50ms / **miss:** query Postgres for all 302 predictions, cache 1hr → JSON array of `{date, probability, status, recession_episode}` × 302 → React Plotly renders 302 points, 6 coloured shadings, 2 threshold lines.

### 5.7 Episode Comparison Flow
Researcher selects Episode 2 (Oct 2008) & Episode 6 (Mar 2020) → `GET /api/v1/recession/episodes/2/compare?with=6` → backend queries both peak months → calculates diff across 13 indicators → JSON response (values, agent scores, FinBERT scores, probabilities) → React renders side-by-side table, largest differences highlighted red/green.

### 5.8 Model Retrain Process (302 months)
Trigger (manual/scheduled/new CSV approved) → acquire Redis retrain lock → load & merge all 302 months + new data → gap handling (WPI proxy 2000–2010, sent_mpc=0 2000–2015) → feature engineering on full series → SMOTE on train set only (Jan 2000–Oct 2017) → train RandomForest (n_estimators=400, max_depth=6, class_weight=balanced) → evaluate (recall across ~44 recession months, false alarm rate, AUC-ROC) → **acceptable:** save new version, notify admin / **degraded:** alert admin, keep old model live → admin approves → new model live, FAISS updated, 302 predictions regenerated.

### 5.9 Alert System Flow
New prediction stored → alert service finds subscriptions where score crosses threshold → composes personalized email (score, trend, episode context) → sends via Flask-Mail/Celery, max 1 email/subscriber/day.

### 5.10 Recession Episode Label Validation (one-time, data extension)
Download pre-2012 data (MOSPI, RBI DBIE, NSE, Yahoo Finance) → cross-reference sources (RBI Annual Reports, NIPFP Business Cycle Dating, IMF Article IV) → mark recession months (`recession_label=1`) → create `recession_episodes` table (6 rows) → visual validation (plot all 302 months, verify vs. known history) → backtesting (verify 2008 GFC detected using only period-available data).

### 5.11 Peer Review Flow
Document reaches SCORED → system assigns 2 researchers (by research area, queue length) → each reviewer sees full text/FinBERT score/chunk scores/uploader info → **both approve:** → Admin Review queue / **one rejects:** requester notified, can revise / **both reject:** rejected with combined feedback → admin approves → chunks added to FAISS, retrain scheduled if significant.

---

## 6. UI/UX Design Brief

### 6.1 Design Philosophy
"Bloomberg terminal meets research journal" — professional, data-dense, trustworthy, fast. The 26-year timeline with 6 colour-coded recession episodes is the centrepiece.

**Principles:** Data First · Episodes Visually Distinct (consistent colour per episode across platform) · Proxy Data Transparent (tooltips wherever proxy/estimated data shown) · Trustworthy (no playful fonts/colours) · Fast (<2s render) · Accessible (WCAG 2.1 AA, colour-blind-safe patterns).

### 6.2 Six-Episode Colour System

| # | Period | Cause | Hex | Accessibility Pattern |
|---|---|---|---|---|
| 1 | Sep 2001–Mar 2002 | Dot-com + 9/11 | `#8B4513` Brown | Diagonal lines //// |
| 2 | Oct 2008–Mar 2009 | Global Financial Crisis | `#DC143C` Crimson | Cross-hatch #### |
| 3 | Jun 2013–Sep 2013 | Taper tantrum | `#FF8C00` Dark orange | Dots .... |
| 4 | Nov 2016–Feb 2017 | Demonetization | `#9400D3` Dark violet | Back-diagonal \\\\ |
| 5 | Jul 2019–Nov 2019 | Pre-COVID slowdown | `#FF6347` Tomato | Zigzag ^^^^ |
| 6 | Mar 2020–Oct 2020 | COVID-19 | `#B02020` Deep red | Solid fill |

### 6.3 Core Colour Palette

| Name | Hex | Usage |
|---|---|---|
| Deep Navy | `#1A1A6E` | Nav bar, section headers, primary buttons |
| Gold | `#C8A828` | Accents, borders, secondary buttons (never large backgrounds) |
| Alert Red | `#DC3545` | ALERT badge, Episode 6 chart colour |
| Watch Amber | `#F59E0B` | WATCH badge |
| Safe Green | `#198754` | NORMAL badge, positive sentiment |
| Off White | `#F8F9FA` | Page/card backgrounds |
| Charcoal | `#2D2D2D` | Body text/labels |
| Proxy Yellow | `#FEF3C7` | Proxy/estimated data cells — signals caution |

### 6.4 Typography

| Element | Font | Size | Weight | Usage |
|---|---|---|---|---|
| Page Title | Inter | 2.5rem | 700 | Main page heading |
| Big Number | JetBrains Mono | 3rem | 700 | P(recession)% hero score |
| Timeline Year Labels | JetBrains Mono | 0.7rem | 400 | Year markers 2000...2026 |
| Body Text | Inter | 0.95rem | 400 | Paragraphs, labels |
| Proxy Label | Inter | 0.75rem | 500 | "WPI Proxy" / "No MPC Data" labels |

### 6.5 Pages

- **Home Page:** Sticky navy nav w/ gold border · Hero (P(recession)% + status badge + 4 metric cards: ~44 recession months, 6 episodes, 302 months trained, AUC-ROC 0.97) · Full-width 26-year Plotly timeline (year markers, red dashed 0.60 alert line, amber dashed 0.20 watch line, click→Month Detail panel from right)
- **Episodes Page (new v2.0):** 2×3 card grid (episode #, period, cause, duration, peak %, dominant indicator), click→expand month-by-month chart · Episode Comparator (2 dropdowns, side-by-side 13-row table, gold border on largest diff, auto-summary text, PDF export)
- **Research Portal:** Overview (contributions, impact score) · Upload Data (date range selector, column mapping, gap detection warnings) · Scenario Builder (13 sliders w/ historical min/max, 6 episode presets, real-time prediction, Save & Share URL)
- **Admin Panel:** Dashboard/Users/Documents/Data/Model/Audit Log/Settings sidebar; Model tab shows active model version + rollback

### 6.6 Responsive Breakpoints

| Breakpoint | Width | Timeline Behavior |
|---|---|---|
| Mobile | <768px | Last 3 years default, swipe = 2yr jump, hamburger menu, cards stack |
| Tablet | 768–1024px | 10 years default, nav visible, 2-column cards |
| Desktop | >1024px | Full 26-year view, all shadings + legend, detail panel doesn't cover chart |

### 6.7 Proxy Data UI Rules
- Pre-2011 CPI: yellow background everywhere, tooltip explains WPI proxy basis
- Pre-2016 sent_mpc: shown as "0.00 (no data)", tooltip explains MPC established Oct 2016
- Proxy flags shown as footnotes in PDF exports

---

## 7. Implementation Plan

**Total: 14 weeks · 6 phases**

### Team Responsibilities (v2.0)

| Member | Role | Responsibilities |
|---|---|---|
| Ratan Sharma | Full Stack Lead + ML | Data download/cleaning (302mo), CPI-WPI calibration, ML retrain (SPLIT=211), DB migrations (3 new), Flask API updates, deployment CI/CD |
| Mayank Gupta | NLP + AI Backend | sent_mpc gap handling (0.0 pre-2016), FAISS verification, 5 agents tested pre-2012, Celery retrain task update |
| Kunal Verma | Frontend + UX | 26-year Plotly timeline w/ 6 shadings, Episodes page, Comparator tool, proxy labels, mobile timeline, Scenario Builder presets |

### v1.0 → v2.0 Delta

| Component | v1.0 (170mo) | v2.0 (302mo) |
|---|---|---|
| Dataset | Jan 2012–Feb 2026 | Jan 2000–Feb 2026 (+132mo, +5 episodes) |
| Recession coverage | COVID only | Dot-com + GFC + Taper + Demonetization + Pre-COVID + COVID |
| New DB tables | 0 | 2 (recession_episodes, data_gap_log) |
| New frontend pages | 0 | 1 (Episodes page + comparator) |
| Model SPLIT | 104 (61% train) | 211 (70% train) |
| Duration | 12 weeks | 14 weeks (+2 for data extension/validation) |

### Phase 1: Data Download & Cleaning (Weeks 1–2)
- **Days 1–2:** Download IIP (MOSPI, Apr 1994→filter Jan 2000), GDP (NSO, cubic-spline interpolate), Repo Rate & Credit Growth (RBI DBIE, complete from 2000), INR/USD & Brent & Nifty 50 (Yahoo Finance, Jan 2000→present)
- **Day 3:** CPI gap (Jan 2000–Dec 2010) — download WPI (RBI DBIE, 2000–2013) + CPI (NSO, 2011→), linear regression on 36mo overlap (target R²>0.85), apply to WPI 2000–2010, flag `cpi_wpi_proxy=TRUE`, log in `data_gap_log`
- **Day 4:** Yield spread gap (2000–2002) — RBI benchmark lending minus savings rate proxy, flag `yield_spread_proxy=TRUE`
- **Day 5:** India VIX gap (2000–2008) — Nifty 50 30-day volatility proxy, flag `india_vix_proxy=TRUE`
- **Days 6–7:** Label 6 recession episodes (sources: RBI Annual Reports 2002–2011, NIPFP Business Cycle Dating, IMF Article IV), create `recession_episodes` table, set `recession_label=1` + episode FK, visual validation
- **Days 8–9:** Merge pre-2012 + existing 170mo dataset, fill sent_mpc=0.0 pre-Oct-2016 (`sent_mpc_available=FALSE`), engineer features (lag1m, 3m rolling avg, momentum, YoY), data quality checks, save `16_master_extended_2000.csv` (302 rows × 25 cols)
- **Day 10:** Data quality report — document every proxy column/gap/calibration coefficient, confirm zero unexpected nulls, visual anomaly check

### Phase 2: ML Retrain on 302 Months (Week 3)
- Update SPLIT 104→211; retrain RandomForest (n_estimators=400, max_depth=6, class_weight=balanced)
- Train: Jan 2000–Oct 2017 (211mo, 5 episodes) · Test: Nov 2017–Feb 2026 (91mo, incl. COVID)
- SMOTE train-only
- Backtests: Oct 2008 (GFC), Nov 2016 (demonetization), Jun 2013 (taper tantrum)
- Compare old vs new model (recall, false alarms, AUC); save `rf_302m_v1.pkl` + scaler + features to R2

### Phase 3: Database Migration (Week 4)
5 Alembic migrations: (1) create `recession_episodes` + 6 seed rows, (2) create `data_gap_log`, (3) add proxy columns to `economic_data`, (4) add episode columns to `predictions`, (5) add episode fields to `model_versions`. Seed all 6 episodes, insert all 302 months, generate 302 predictions, add `rf_302m_v1` to `model_versions`.

### Phase 4: Backend API Updates (Week 5)
Update timeline/month endpoints for 302 months; add `/episodes` and `/episodes/{n}/compare` endpoints; update scheduler + CSV validator (CPI gap prompt) + retrain task (SPLIT=211); pytest coverage for all 15 episode-pair combinations + CSV pre-2011 CPI prompt.

### Phase 5: Frontend — Episodes Page & Timeline (Weeks 6–7)
- **Week 6:** Extend `TimelineChart.jsx` X-axis to Jan 2000 (302 points), 6 shadings + patterns + legend, zoom controls (5Y/10Y/All), updated hover/Month Detail with proxy warnings (yellow bg + tooltips)
- **Week 7:** Build `EpisodesPage.jsx` (`/episodes` route), 2×3 card grid, expandable month-by-month chart, Comparator (dropdowns, 13-row table, gold border on largest diff, auto-summary, PDF export), Scenario Builder preset buttons (6 episodes)

### Phase 6: Testing, Deployment, Launch (Weeks 8–14)
- **Weeks 8–9 Integration Testing:** Full 302-month render, 6 shadings verified, click-tests (Oct 2008, Nov 2016, Jan 2005 proxy warnings), 15-pair comparator test, CSV upload proxy prompt, retrain <15min, timeline <2s, all endpoints correct from Jan 2000
- **Weeks 10–11 Bug Fixes & Polish:** Mobile 3-year default + swipe, proxy labels visible on mobile, colour-blind accessibility patterns, Lighthouse >85, cross-browser (Chrome/Firefox/Safari/Edge)
- **Weeks 12–13 Staging Deployment:** Railway deploy (Flask/React/Postgres/Redis), run 5 migrations, load 302 months + predictions + 6 episodes to production, set `rf_302m_v1` active, configure R2, GitHub Actions CI/CD, UptimeRobot, Sentry
- **Week 14 Production Launch:** UAT (all 3 members test every flow incl. Oct 2008/Nov 2016/Mar 2020), merge to main (auto-deploy), smoke test, register NMIMS accounts, tag `v2.0.0`, submit live URL for S3 Demo deliverable (**16 Oct 2026**)

### Risk Register

| Risk | Prob. | Impact | Mitigation |
|---|---|---|---|
| Pre-2012 data quality issues | High | High | Validate before use; plot all 302mo; flag outliers >3σ |
| CPI-WPI calibration R² < 0.85 | Medium | Medium | Polynomial regression fallback; document R² in `data_gap_log`; label low-confidence in UI |
| 2008 GFC not detected in backtest | Medium | High | Run backtesting before success declaration; review yield spread feature (dominant 2008 signal) |
| 302-point timeline slow on mobile | High | Medium | Default 3-year mobile view; load full 302 only on "All" click; Plotly WebGL renderer |
| Model retrain time > 15 min | Medium | Low | n_estimators=400 completes in 8–12min; Celery async; progress bar |
| Recession labels disputed (2001, 2013) | Low | Low | Multi-source (NIPFP + RBI + IMF); document `source_reference`; academic sources definitive |

---

## 8. Definition of Done — v2.0

- [ ] All 302 months in production `economic_data` with correct proxy flags
- [ ] All 6 recession episodes seeded in `recession_episodes` with colours + source references
- [ ] Model trained on 302 months detects 2008 GFC, 2016 demonetization, and COVID 2020 in backtest
- [ ] 26-year timeline renders <2s on desktop Chrome with all 6 coloured shadings
- [ ] All 15 episode pairs work in episode comparator
- [ ] Proxy data clearly labelled in Month Detail panel (pre-2011 CPI, pre-2016 sent_mpc)
- [ ] All API endpoints return correct data for any month from January 2000
- [ ] GitHub Actions CI/CD deploying on merge to main
- [ ] Live production URL accessible, all features working
- [ ] API documentation published at `/docs`

---

*India Recession Predictor Research Platform | v2.0 | 302 months (Jan 2000–Feb 2026) | 6 Recession Episodes*
*Compiled from: PRD.docx, TRD.docx, AppFlow.docx, Implementation.docx, Schema.docx, UIUX.docx, 00_README_DATA_DICTIONARY.txt*
