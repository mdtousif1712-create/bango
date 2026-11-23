# bango — Bengaluru Smart City Discovery

> A modern, responsive smart city discovery and intelligent recommendation platform for **Bengaluru, Karnataka, India**, powered by an authentic backend **Apriori Algorithm (Association Rule Mining)** engine.

---

## 🌆 1. Project Overview

**bango** provides citizens and visitors with an interactive geographical and data-driven exploration experience across 8 core urban domains. The application pairs **Leaflet.js + OpenStreetMap** geographical mapping with an **MLxtend Apriori association engine** that extracts real behavioral co-visitation patterns from 1,250+ smart city mobility journeys.

### Key Highlights
- **Interactive OpenStreetMap of Bengaluru**: Real coordinates, custom domain markers, user geolocation, and floating place cards.
- **Real Backend Apriori Algorithm**: Implemented with Python & `mlxtend.frequent_patterns.apriori` and `association_rules`. Rules calculate exact **Support**, **Confidence**, and **Lift** metrics (no hardcoded/simulated results).
- **8 Smart City Domains**: Healthcare, Transportation, Tourism, Shopping, Education, Entertainment, Restaurants, and Real Estate.
- **Natural Language Search Assistant**: Floating bottom search bar with prompt chips and rule-based query parser (extracting domain, locality, and entity).
- **Citizen-Centric SaaS Experience**: Clean modern UI (#E7EBEF / #5681EB palette) inspired by premium discovery platforms. No administrator logins, panels, or complex management overhead.
- **Transparency & Parameter Tuning**: Real-time modal displaying frequent itemsets and rules with sliders to retrain the algorithm on demand.

---

## 🛠️ 2. Tech Stack & Architecture

### Backend
- **Framework**: Python 3.11 + FastAPI
- **Association Rule Mining**: `mlxtend` (`apriori`, `association_rules`), `pandas`, `numpy`, `scikit-learn`
- **Database**: MongoDB (with automated JSON/CSV fallback mechanism)
- **Server**: Uvicorn ASGI

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Lucide React icons
- **Maps**: Leaflet + React-Leaflet + OpenStreetMap tiles
- **State & Storage**: React Hooks, localStorage persistence for bookmarked places

---

## 📊 3. The Apriori Recommendation Engine

The recommendation system implements the 8-step Apriori pipeline:
1. **Load Mobility Transactions**: 1,250 realistic smart city activity itineraries.
2. **Preprocessing**: Cleans and filters multi-item sets.
3. **One-Hot Encoding**: Transformed via `mlxtend.preprocessing.TransactionEncoder`.
4. **Apriori Algorithm**: Discovers frequent itemsets satisfying $\text{Support} \ge 0.02$.
5. **Rule Generation**: Generates directional association rules satisfying $\text{Confidence} \ge 0.30$ and $\text{Lift} \ge 1.0$.
6. **Metric Evaluation**:
   $$\text{Confidence}(X \rightarrow Y) = \frac{\text{Support}(X \cup Y)}{\text{Support}(X)}$$
   $$\text{Lift}(X \rightarrow Y) = \frac{\text{Confidence}(X \rightarrow Y)}{\text{Support}(Y)}$$
7. **Resolution**: Resolves abstract consequent names into verified Bengaluru geographical places.
8. **Ranking**: Ranked by Confidence $\rightarrow$ Lift $\rightarrow$ Support $\rightarrow$ Proximity.

---

## 📍 4. Eight Smart City Domains

| Domain | Marker Color | Sample Places | Description |
|---|---|---|---|
| **Healthcare** | Red (`#EF4444`) | Manipal Hospital, Aster CMI, Victoria Hospital | Quaternary hospitals, research institutes & clinics |
| **Transportation** | Blue (`#3B82F6`) | Majestic Metro, MG Road Metro, Yeshwanthpur | Metro interchanges, transit hubs & bus terminals |
| **Tourism** | Green (`#10B981`) | Cubbon Park, Lalbagh, Bengaluru Palace | Heritage parks, botanical gardens & palaces |
| **Shopping** | Orange (`#F97316`) | Orion Mall, UB City, Phoenix Marketcity | Regional malls, luxury shopping & high streets |
| **Education** | Indigo (`#6366F1`) | IISc, Christ University, RVCE, Central Library | Premier universities, colleges & libraries |
| **Entertainment** | Purple (`#8B5CF6`) | PVR Superplex, Ranga Shankara, Play Arena | IMAX multiplexes, theatres & adventure parks |
| **Restaurants** | Amber (`#F59E0B`) | Toit Brewpub, Vidyarthi Bhavan, MTR, Truffles | Craft breweries, heritage tiffins & cafes |
| **Real Estate** | Cyan (`#06B6D4`) | Indiranagar, Koramangala, Whitefield, Hebbal | Planned living hubs, IT corridors & lake districts |

---

## 🚀 5. Installation & Execution

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- MongoDB (running locally on port 27017 or remote URI)

### Quick Start

1. **Install Backend Dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Generate Seed Data & Populate Database**:
   ```bash
   python scripts/generate_data.py
   ```

3. **Start FastAPI Backend**:
   ```bash
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```
   API will be available at `http://127.0.0.1:8000` (Docs at `/docs`).

4. **Install Frontend Dependencies & Run**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   Application will be running at `http://127.0.0.1:5173`.

---

## 🧪 6. Automated Verification Test Suite

Run the comprehensive test suite verifying all 10 mandatory workflows:
```bash
python test_workflows.py
```

### Verified Workflows
- **TEST 1**: Application health & initial Bengaluru coordinates (12.9716, 77.5946).
- **TEST 2**: Category filtering (Tourism, Healthcare, etc.).
- **TEST 3**: Natural query and exact entity search ("Cubbon Park").
- **TEST 4**: Apriori recommendation retrieval for selected places.
- **TEST 5**: Verification of Support, Confidence, and Lift calculations.
- **TEST 6**: Natural language query parsing ("Find hospitals near Whitefield").
- **TEST 7**: Trending destinations calculated from transaction frequency.
- **TEST 8**: Graceful handling of missing rules with domain fallbacks.
- **TEST 9**: All 8 smart city domains verified with verified locations.
- **TEST 10**: Summary analytics and transparency inspection.

---

## 🔒 7. Disclaimer
Mobility transactions are synthetic datasets generated for algorithmic demonstration and do not reflect official surveillance or proprietary citizen records.
