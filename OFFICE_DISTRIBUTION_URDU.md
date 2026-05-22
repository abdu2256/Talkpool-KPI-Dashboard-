# Talkpool KPI — Office / Sir Ko Kaise Dein (Genex Style)

## Aap Kya Dein Ge?

Employees ko **ek ZIP file** ya **USB folder** den jisme:

1. `Talkpool-Start.bat` — roz is par double-click (Genex ki tarah)
2. `backend/` + `frontend/dist/` + `data/` (khud banega pehli dafa)
3. `sample-data/sample_kpi_data.csv` — test file

**Koi website URL nahi** — har PC par app install/copy hogi, data usi PC par hamesha save rahega.

---

## Aap (Developer) — Package Banana (Ek Baar)

### Step 1: Node.js install (aapke PC par)
https://nodejs.org — LTS version download karein

### Step 2: Package build karein

```powershell
cd c:\Users\DELL\Desktop\talkpool_dashboard
npm install
npm run build --prefix frontend
```

Ya double-click: **`Create-Office-Package.bat`**

### Step 3: ZIP banayein

Poora folder compress karein:
`Talkpool-KPI-Dashboard.zip`

Is ZIP ko sir / IT / employees ko dein.

---

## Har Employee / Sir — Roz Use Kaise Karein

### Pehli dafa (5 minute)

1. **Node.js** install karein (sirf ek baar): https://nodejs.org  
2. ZIP extract karein → folder kahi rakhein (Desktop / `C:\TalkpoolKPI`)
3. **`Talkpool-Start.bat`** par double-click
4. Browser khul jayega: `http://localhost:5000`
5. **Upload** page se CSV upload karein

### Roz subah (Genex jaisa)

1. **`Talkpool-Start.bat`** double-click  
2. Dashboard kholo → purana data + nayi uploads sab maujood  
3. Kaam khatam → window band karo (data `data\` folder mein save rehta hai)

---

## Data Kahan Save Hota Hai? (Hamesha Ke Liye)

| Cheez | Location |
|-------|----------|
| Database (sab KPI) | `data\talkpool.db` |
| Uploaded CSV files | `data\uploads\archive\` |
| Settings | database ke andar |

⚠️ **`data` folder delete mat karo** — warna sab records gayab.

Backup: poora `data` folder copy karke USB / network par rakho.

---

## PostgreSQL Ki Zaroorat?

**Office desktop app:** PostgreSQL **nahi** chahiye — SQLite use hota hai.

**Server mode (pehle wala):** PostgreSQL + `npm start` — sirf agar ek central server chahiye.

---

## Desktop Shortcut (Optional)

1. `Talkpool-Start.bat` par right-click  
2. **Send to → Desktop (create shortcut)**  
3. Shortcut rename: `Talkpool KPI`

---

## Sir Ko Message Template

```
Assalam o Alaikum,

Talkpool KPI Dashboard ready hai.

Install:
1. Attached ZIP extract karein
2. Node.js install (one time): https://nodejs.org
3. Talkpool-Start.bat run karein

Roz use: Talkpool-Start.bat double-click → browser mein dashboard
Upload: CSV file se KPI data import
Data permanently save hota hai system par.

Sample file attached: sample_kpi_data.csv

Regards
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `node is not recognized` | Node.js install karein, PC restart |
| Blank page | `npm run build --prefix frontend` phir Start.bat |
| Purana data nahi | `data` folder same jagah hona chahiye |
| Port busy | `PORT=5001` set karein bat file mein |

---

## Professional: Windows .exe Installer (Recommended)

**Genex jaisi real software** — employees ko sirf Setup.exe do, Node.js ki zaroorat nahi.

Guide: **`ELECTRON_BUILD_URDU.md`**

Quick build: double-click **`Build-Talkpool-EXE.bat`**  
Output: `electron\release\Talkpool KPI Dashboard Setup 1.0.0.exe`
