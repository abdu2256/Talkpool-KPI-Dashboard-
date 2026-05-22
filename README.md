# Talkpool Telecom KPI Dashboard

Full-stack telecom KPI dashboard with React frontend, Express API, and PostgreSQL.

## Quick Start

```powershell
# 1. Go to project folder
Set-Location "c:\Users\DELL\Desktop\talkpool_dashboard"

# 2. Install everything (backend + frontend)
npm install

# 3. Start PostgreSQL (choose ONE option)

# Option A - Docker (recommended)
npm run db:up

# Option B - Local PostgreSQL
# Create database: CREATE DATABASE talkpool_kpi;
# Edit backend/.env with your password

# 4. Configure backend (if not using Docker defaults)
# Copy backend/.env.example to backend/.env and set DB_PASSWORD

# 5. Start backend + frontend together
npm start
```

| Service   | URL                        |
|-----------|----------------------------|
| Dashboard | http://localhost:5173      |
| API       | http://localhost:5000      |
| Health    | http://localhost:5000/api/health |

## Upload Sample Data

1. Open http://localhost:5173/upload
2. Upload `sample-data/sample_kpi_data.csv`
3. View dashboard at http://localhost:5173

Or seed from command line (PostgreSQL must be running):

```powershell
npm run seed --prefix backend
```

## Project Structure

```
talkpool_dashboard/
├── package.json              # Root: npm install + npm start
├── docker-compose.yml        # Optional PostgreSQL via Docker
├── README.md
├── database/
│   └── schema.sql            # PostgreSQL schema
├── sample-data/
│   └── sample_kpi_data.csv   # Sample KPI data
├── scripts/
│   └── seed-sample.js        # Load sample CSV into DB
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── schema.sql
│   ├── src/
│   │   ├── index.js          # Express server entry
│   │   ├── config/db.js      # PostgreSQL + auto tables
│   │   ├── routes/           # KPI + settings routes
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/       # Multer upload, errors
│   │   └── utils/parseFile.js
│   └── uploads/
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── src/
    │   ├── App.jsx           # React Router routes
    │   ├── pages/            # Dashboard, Upload, Analysis, etc.
    │   ├── components/       # Layout, charts, filters
    │   ├── hooks/useKpiData.js
    │   ├── services/api.js   # Axios API client
    │   └── styles/global.css
    └── public/
```

## NPM Scripts

| Command | Description |
|---------|-------------|
| `npm install` | Install root, backend, and frontend dependencies |
| `npm start` | Start backend (port 5000) + frontend (port 5173) |
| `npm run dev` | Backend with nodemon + frontend |
| `npm run db:up` | Start PostgreSQL in Docker |
| `npm run build` | Build frontend for production |

## PostgreSQL Setup

### Docker (easiest)

```powershell
npm run db:up
```

Default credentials (match `backend/.env`):

- Host: `localhost`
- Port: `5432`
- Database: `talkpool_kpi`
- User: `postgres`
- Password: `postgres`

### Manual install

1. Install PostgreSQL 14+
2. Create database:

```sql
CREATE DATABASE talkpool_kpi;
```

3. Copy and edit environment file:

```powershell
Copy-Item backend\.env.example backend\.env
```

4. Set `DB_PASSWORD` in `backend/.env`

Tables are **created automatically** when the backend starts.

## Environment Variables

### backend/.env

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=talkpool_kpi
DB_USER=postgres
DB_PASSWORD=postgres
CLIENT_URL=http://localhost:5173
```

### frontend/.env

```env
VITE_API_URL=http://localhost:5000/api
```

## CSV Format

Required columns:

```
Date,Hour,Cluster,RRC Setup Success Rate,ERAB Setup Success Rate,Drop Rate,Per User Throughput DL,Per User Throughput UL
2025-05-01,0,Cluster-A,98.5,97.2,0.8,45.2,12.3
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/kpi/records` | List records (`?date=&cluster=&hour=`) |
| GET | `/api/kpi/summary` | KPI summary cards |
| GET | `/api/kpi/trend/hourly` | Hourly chart data |
| GET | `/api/kpi/trend/daily` | Daily trend data |
| GET | `/api/kpi/clusters` | Cluster comparison |
| GET | `/api/kpi/meta` | Filter options (dates, clusters) |
| POST | `/api/kpi/upload` | Upload CSV/XLSX (`file` field) |
| GET | `/api/kpi/export` | Download CSV export |
| DELETE | `/api/kpi/clear` | Clear all records |
| GET/PUT | `/api/settings` | App settings |

## Frontend Pages

| Route | Page |
|-------|------|
| `/` | Dashboard – KPI cards, charts, table |
| `/upload` | Upload CSV/XLSX |
| `/analysis` | KPI Analysis – deep-dive charts |
| `/clusters` | Cluster comparison |
| `/export` | Export CSV reports |
| `/settings` | Settings & system status |

## Troubleshooting

**Backend exits immediately**

- PostgreSQL is not running
- Wrong `DB_PASSWORD` in `backend/.env`
- Database `talkpool_kpi` does not exist

**Frontend shows connection error**

- Run `npm start` from project root (starts both services)
- Check http://localhost:5000/api/health

**Charts empty after upload**

- Refresh the dashboard
- Check filters (Date / Cluster / Hour) are not too restrictive

## Production Deployment

```powershell
# Build frontend
npm run build

# Set production env
# backend: NODE_ENV=production
# frontend: VITE_API_URL=https://your-api.com/api

# Start backend only (serve frontend dist via Nginx/CDN)
npm start --prefix backend
```

## License

MIT
