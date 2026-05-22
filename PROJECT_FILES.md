# Talkpool Dashboard - Complete File List

All files required for the project to run.

## Root
- `package.json` - npm install + npm start
- `README.md` - Setup guide
- `docker-compose.yml` - Optional PostgreSQL
- `.gitignore`
- `PROJECT_FILES.md` - This file

## Database & Sample Data
- `database/schema.sql`
- `backend/schema.sql`
- `sample-data/sample_kpi_data.csv`
- `scripts/seed-sample.js`

## Backend (Express + PostgreSQL)
- `backend/package.json`
- `backend/.env.example`
- `backend/src/index.js`
- `backend/src/config/db.js`
- `backend/src/routes/kpiRoutes.js`
- `backend/src/routes/settingsRoutes.js`
- `backend/src/controllers/kpiController.js`
- `backend/src/controllers/settingsController.js`
- `backend/src/services/kpiService.js`
- `backend/src/services/settingsService.js`
- `backend/src/middleware/upload.js`
- `backend/src/middleware/errorHandler.js`
- `backend/src/utils/parseFile.js`
- `backend/uploads/.gitkeep`

## Frontend (React + Recharts)
- `frontend/package.json`
- `frontend/vite.config.js`
- `frontend/index.html`
- `frontend/.env.example`
- `frontend/public/favicon.svg`
- `frontend/src/main.jsx`
- `frontend/src/App.jsx`
- `frontend/src/services/api.js`
- `frontend/src/hooks/useKpiData.js`
- `frontend/src/styles/global.css`
- `frontend/src/pages/Dashboard.jsx`
- `frontend/src/pages/Upload.jsx`
- `frontend/src/pages/KpiAnalysis.jsx`
- `frontend/src/pages/Clusters.jsx`
- `frontend/src/pages/Export.jsx`
- `frontend/src/pages/Settings.jsx`
- `frontend/src/components/Layout/Layout.jsx`
- `frontend/src/components/Layout/Layout.css`
- `frontend/src/components/Layout/Sidebar.jsx`
- `frontend/src/components/Layout/Topbar.jsx`
- `frontend/src/components/common/FilterBar.jsx`
- `frontend/src/components/common/KpiCard.jsx`
- `frontend/src/components/common/DataTable.jsx`
- `frontend/src/components/common/LoadingSpinner.jsx`
- `frontend/src/components/common/EmptyState.jsx`
- `frontend/src/components/charts/HourlyLineChart.jsx`
- `frontend/src/components/charts/ThroughputChart.jsx`
- `frontend/src/components/charts/ClusterBarChart.jsx`
- `frontend/src/components/charts/DailyTrendChart.jsx`
