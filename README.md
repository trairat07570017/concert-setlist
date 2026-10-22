# 🎸 Concert Setlist | เว็บแอปจัดการลิสต์เพลงคอนเสิร์ต

เว็บแอปพลิเคชันสำหรับนักดนตรีและวงดนตรี ช่วยจัดการลิสต์เพลงคอนเสิร์ต จัดลำดับเพลง ระบุเวอร์ชันเพลงสำหรับซ้อม ระบุคีย์ที่วงเล่นจริง (Performance Key) พร้อมระบบดูคอร์ดเพลง ดึงคอร์ดจาก DoChord และโหมดขึ้นแสดงบนเวที (Stage Mode)

---

## ✨ ฟีเจอร์เด่น (Key Features)

1. **Setlist Reordering (Drag & Drop)**: จัดลำดับเพลงได้ตามใจชอบ ลากสลับตำแหน่งได้ทันที หรือกดปุ่มขึ้น/ลงบนมือถือ
2. **Performance Key & Tempo (BPM)**: ระบุคีย์เดิมและคีย์ที่วงเล่นจริงอย่างชัดเจน พร้อมบอกความเร็วเพลง (BPM)
3. **Rehearsal Version Preview**: แปะลิงก์ YouTube/Spotify พร้อมเปิดฟังหรือฝังเครื่องเล่นวิดีโอตัวอย่างในเว็บได้ทันที
4. **DoChord Integration & Transposition**:
   - ดึงคอร์ดและเนื้อเพลงจากเว็บ DoChord โดยอัตโนมัติผ่าน Google Apps Script CORS Proxy
   - แก้ไขคอร์ดและเนื้อเพลงเฉพาะท่อนได้เอง
   - ระบบ **Transpose Key** ทดคีย์ขึ้น/ลงตามเซมิโทนแบบเรียลไทม์
5. **Stage Mode (โหมดแสดงสดบนเวที)**:
   - ออกแบบมาสำหรับวางบนแท็บเล็ต/iPad บนขาตั้งโน้ต
   - คอนทราสต์สูง ตัวหนังสือใหญ่พิเศษ อ่านง่ายแม้อยู่ในที่มืดบนเวที
   - ระบบ **Auto-scroll** เลื่อนคอร์ดและเนื้อเพลงอัตโนมัติแบบ Hands-free ไม่ต้องเอามือไปแตะจอระหว่างเล่นดนตรี
6. **Zero-Friction Offline/Local Dev**:
   - โคลนโค้ดลงเครื่องไหน รัน `npm install && npm run dev` ใช้งานได้ทันที 100% ผ่าน LocalStorage Mock
   - พร้อมเชื่อมต่อกับ Google Sheets เป็นฐานข้อมูลกลางผ่าน Google Apps Script เมื่อใส่ URL ใน `.env`

---

## 🛠️ โครงสร้างสถาปัตยกรรม (Architecture & Clean Code)

```
├── CONTEXT.md                    # นิยามคำศัพท์และ Domain language
├── docs/adr/                     # บันทึกการตัดสินใจทางสถาปัตยกรรม (ADR)
├── gas/                          # โค้ด Google Apps Script Backend
│   ├── Code.gs                   # REST API Web App สำหรับ Google Sheets & DoChord Proxy
│   ├── appsscript.json           # การตั้งค่า Apps Script
│   └── README.md                 # คู่มือการ Deploy Apps Script ทีละขั้นตอน
├── src/
│   ├── domain/                   # Business Models & Domain Types (Song, Key)
│   ├── repositories/             # Seam Interface & Adapters (Mock vs GAS)
│   │   ├── song-repository.ts    # Interface กลาง
│   │   ├── mock-song-repository.ts # LocalStorage Mock Adapter
│   │   └── gas-song-repository.ts  # Google Apps Script Web App Adapter
│   ├── modules/
│   │   ├── setlist/              # จัดการรายการเพลง เพิ่ม/ลบ/แก้ไข/ลากสลับลำดับ
│   │   ├── chord-viewer/         # ดูคอร์ด, Transposition Engine, DoChord Fetcher
│   │   ├── player/               # เครื่องเล่น YouTube Preview
│   │   └── stage-mode/           # Full-screen Stage Display & Auto-scroller
│   ├── components/ui/            # Reusable UI (Button, Modal, Input, Badge)
│   ├── App.tsx
│   └── main.tsx
└── .env.example
```

---

## 🚀 วิธีเปิดใช้งานในเครื่อง (Local Development)

```bash
# 1. ติดตั้ง dependencies
npm install

# 2. รัน Local Development Server
npm run dev

# 3. รัน Unit & Contract Tests
npm run test

# 4. ทดสอบ Build โปรดักชัน
npm run build
```

---

## 🌐 การเชื่อมต่อกับ Google Sheets (Google Apps Script)

1. เปิดสเปรดชีต Google Sheets ใหม่
2. ไปที่ **ส่วนขยาย (Extensions)** ➔ **Apps Script**
3. คัดลอกโค้ดจาก [gas/Code.gs](file:///Users/sirirat/Desktop/Trairat/app%20script/ลิสต์เพลงคอนเสิร์ต/gas/Code.gs) ไปวาง
4. กด **Deploy ➔ New deployment ➔ Web App** (ตั้งค่า Execute as: `Me`, Access: `Anyone`)
5. นำ URL ที่ได้มาสร้างไฟล์ `.env`:
   ```env
   VITE_GAS_API_URL=https://script.google.com/macros/s/AKfycbx.../exec
   ```
*(อ่านคู่มืออย่างละเอียดได้ที่ [gas/README.md](file:///Users/sirirat/Desktop/Trairat/app%20script/ลิสต์เพลงคอนเสิร์ต/gas/README.md))*

---

## 📦 การ Deploy ขึ้น GitHub Pages

1. นำโค้ดขึ้น GitHub Repository ของคุณ:
   ```bash
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git branch -M main
   git push -u origin main
   ```
2. ใน GitHub Repository ไปที่ **Settings ➔ Pages**:
   - Source: เลือก **GitHub Actions**
   - หรือตั้งค่า Build output ไปที่โฟลเดอร์ `dist`
3. สามารถแชร์ลิงก์ให้สมาชิกในวงเปิดใช้งานบนมือถือหรือแท็บเล็ตได้ทันที!
