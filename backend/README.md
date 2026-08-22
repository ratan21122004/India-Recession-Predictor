# Backend — India Recession Predictor (Phase 1)

Phase 1 = a working Flask API that serves your trained RandomForest model.
No database yet — that's Phase 2 (PostgreSQL, per the Schema doc).

## Folder structure

```
backend/
  app.py              → starts the Flask server (run this file)
  config.py           → file paths & settings — edit if you rename things
  requirements.txt    → list of Python packages needed
  ml/
    predict.py         → loads your model + generates predictions
  routes/
    health.py          → GET /api/v1/health
    recession.py       → GET /api/v1/recession/current, /timeline, /month/<YYYY-MM>
  models/              → PUT YOUR .pkl FILES HERE (see below)
  data/                → PUT YOUR .csv DATASET HERE (see below)
  policy_docs/         → PUT YOUR FinBERT/policy doc outputs here (used in Phase 2)
```

## Step 1 — Copy your files in

From your notebooks' output folder (`...OneDrive\Desktop\uml data`), copy:

**Into `backend/models/`:**
- `rf_ft_finbert.pkl` (or `rf_scaled_v1.pkl` / `rf_targeted.pkl` — whichever you have)
- `scaler_ft_finbert.pkl` (matching scaler)
- `features_ft_finbert.pkl` (matching feature list)

**Into `backend/data/`:**
- `12_master_ml_dataset.csv` (or a newer version like `13_master_ml_enhanced.csv` if you have it)

If you don't have the `.pkl` files yet, run your `RM_Part_1` notebook first (the cells that train and save the RandomForest model) — it should have a `pickle.dump(...)` step near the end that creates these three files.

## Step 2 — Install Python packages

Open a terminal in the `backend` folder (in Antigravity: right-click `backend` folder → "Open in Integrated Terminal", or `cd` into it manually) and run:

```
pip install -r requirements.txt
```

## Step 3 — Run the server

```
python app.py
```

You should see:
```
🇮🇳  India Recession Predictor API
   Running at: http://localhost:5000
   Health check: http://localhost:5000/api/v1/health
```

## Step 4 — Test it

Open these in your browser (or use the "Thunder Client" extension if you installed it):

- http://localhost:5000/api/v1/health → should show `"model": "ok"` and `"dataset": "ok"`
- http://localhost:5000/api/v1/recession/current → latest prediction
- http://localhost:5000/api/v1/recession/timeline → every month
- http://localhost:5000/api/v1/recession/month/2020-04 → April 2020 detail

If `health` shows an error instead of "ok", it means the files aren't in the right folder — check Step 1.

## Next (Phase 2)

Once this works, we'll add:
- PostgreSQL database (per Schema.docx) instead of reading CSV every time
- FinBERT document scoring endpoints
- The 5-agent system + FAISS
- Episodes/comparator endpoints (needs the 302-month extended dataset)
