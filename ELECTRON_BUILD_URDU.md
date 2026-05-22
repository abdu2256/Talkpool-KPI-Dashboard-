# Talkpool KPI — Windows .exe (Electron) Banane Ka Guide

## Kya Milega?

Build ke baad ye files banengi:

```
electron/release/
├── Talkpool KPI Dashboard Setup 1.0.0.exe   ← Ye file sir / employees ko do
└── win-unpacked/                             ← Test ke liye (install ke bina)
```

- **Double-click installer** → app install
- **Desktop shortcut** → roz Genex ki tarah kholen
- **Data permanent** → `C:\Users\<name>\AppData\Roaming\talkpool-kpi-desktop\data\`
- **Node.js employees ko install nahi** karna (sab app ke andar hai)

---

## Pehli Baar Build (Aapke Developer PC Par)

### 1. Requirements

- Windows 10/11
- Node.js 18+ ([nodejs.org](https://nodejs.org))
- Internet (packages download ke liye)
- ~2 GB free disk

### 2. Commands (PowerShell)

```powershell
cd c:\Users\DELL\Desktop\talkpool_dashboard

# Step 1: Sab dependencies
npm install

# Step 2: Frontend build
npm run build --prefix frontend

# Step 3: Electron folder
cd electron
npm install

# Step 4: SQLite ko Electron ke liye compile (zaroori)
npm run rebuild

# Step 5: .exe installer banao (5-15 minute)
npm run build
```

### Ya ek command (root se):

```powershell
cd c:\Users\DELL\Desktop\talkpool_dashboard
npm run build:exe
```

### 3. Installer kahan hai?

```
talkpool_dashboard\electron\release\Talkpool KPI Dashboard Setup 1.0.0.exe
```

Is **.exe** ko USB / Google Drive / email se share karo.

---

## Test Install Se Pehle (Optional)

```powershell
cd electron
npm start
```

App window khulni chahiye — bina .exe banaye test.

---

## Employees / Sir — Install Kaise Karein

1. `Talkpool KPI Dashboard Setup 1.0.0.exe` download karein
2. Double-click → Next → Install
3. Desktop par **Talkpool KPI** shortcut
4. Roz shortcut se app kholo
5. **Upload** se CSV import — data hamesha save

**Node.js ki zaroorat nahi.**

---

## Data Backup

Data yahan save hota hai:

```
C:\Users\<WindowsUser>\AppData\Roaming\talkpool-kpi-desktop\data\
├── talkpool.db
└── uploads\archive\
```

Backup: poora `data` folder copy karein.

---

## Build Error Fix

| Error | Solution |
|-------|----------|
| `better-sqlite3` / native module | `cd electron` → `npm run rebuild` |
| Frontend not found | `npm run build --prefix frontend` |
| Port 5000 in use | Purani app band karein |
| Build slow | Normal hai — 10+ min wait karein |

---

## Sir Ko Message

```
Talkpool KPI Dashboard install file attached.

Install: Setup.exe double-click → Install
Daily use: Desktop shortcut "Talkpool KPI"
Upload CSV files — data permanently saved on PC.
No browser link, no Node.js needed.

Sample CSV attached for testing.
```
