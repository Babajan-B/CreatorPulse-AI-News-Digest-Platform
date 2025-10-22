# 🔑 Add Service Role Key - Manual Instructions

**Your Service Role Key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwdGtic3F4eHRqdXlrc3Vjbmt5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDAzMjA0NCwiZXhwIjoyMDc1NjA4MDQ0fQ.zhDxidIsi8KvDZfS-thGqDn63qxjoy0USHyxaT2-t4M
```

---

## 📝 What to Do (Manual)

### Step 1: Open .env.local in Your Code Editor

1. In VS Code or Cursor
2. Open file: `creatorpulse/.env.local`
3. Scroll to the bottom

### Step 2: Add This Line

Copy and paste this at the end of the file:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwdGtic3F4eHRqdXlrc3Vjbmt5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDAzMjA0NCwiZXhwIjoyMDc1NjA4MDQ0fQ.zhDxidIsi8KvDZfS-thGqDn63qxjoy0USHyxaT2-t4M
```

### Step 3: Save the File

Press `Cmd+S` to save

---

## Step 4: Restart Server (Open NEW Terminal)

```bash
cd /Users/jaan/Desktop/New-Assigmnet-10-9-25/creatorpulse
pkill -9 -f "next dev"
npm run dev
```

---

## ✅ Then Test Voice Training

1. http://localhost:3000/voice-training
2. Login if needed
3. Copy from `training.md`
4. Upload
5. Should work! ✅

---

**Just add that one line to .env.local manually, save, and restart!** 🚀




