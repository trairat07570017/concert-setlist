# 🎸 Google Apps Script & Google Sheets Setup Guide

คู่มือการติดตั้งฐานข้อมูล Google Sheets และ Deploy Google Apps Script Web App สำหรับโปรเจกต์ **Concert Setlist**

---

### ขั้นตอนที่ 1: สร้าง Google Sheets ใหม่
1. ไปที่ [Google Sheets](https://sheets.new) เพื่อสร้างสเปรดชีตใหม่
2. ตั้งชื่อไฟล์ตามต้องการ เช่น `Concert Setlist - 2026`

---

### ขั้นตอนที่ 2: วางโค้ด Google Apps Script
1. ที่เมนูด้านบนของ Google Sheets ไปที่:  
   **ส่วนขยาย (Extensions)** ➔ **Apps Script**
2. ลบโค้ดเริ่มต้นในไฟล์ `Code.gs` ทั้งหมด
3. คัดลอกโค้ดทั้งหมดจากไฟล์ [gas/Code.gs](file:///Users/sirirat/Desktop/Trairat/app%20script/ลิสต์เพลงคอนเสิร์ต/gas/Code.gs) มาวางในหน้าต่าง Apps Script
4. กดบันทึก (Ctrl + S หรือ Command + S)

---

### ขั้นตอนที่ 3: Deploy เป็น Web App
1. กดปุ่มสีน้ำเงิน **"ทำให้ใช้งานได้" (Deploy)** ที่มุมขวาบน ➔ เลือก **"การทำให้ใช้งานได้รายการใหม่" (New deployment)**
2. คลิกไอคอนรูปเฟือง ⚙️ ข้าง "เลือกประเภท" ➔ เลือก **"เว็บแอป" (Web app)**
3. กรอกข้อมูลดังนี้:
   - **คำอธิบาย (Description)**: `Concert Setlist API v1`
   - **ดำเนินการในฐานะ (Execute as)**: `ฉัน (อีเมลของคุณ)`
   - **ผู้มีสิทธิ์เข้าถึง (Who has access)**: `ทุกคน (Anyone)` ⚠️ **สำคัญมาก ต้องเลือก Anyone เพื่อให้เว็บแอปเรียก API ได้โดยไม่ต้องล็อกอิน**
4. กดปุ่ม **"ทำให้ใช้งานได้" (Deploy)**
5. หาก Google แจ้งขออนุญาตสิทธิ์ (Authorization Required):
   - กด **ตรวจสอบสิทธิ์ (Review permissions)**
   - เลือกบัญชี Google ของคุณ
   - กด **ขั้นสูง (Advanced)** ➔ กด **ไปยัง Concert Setlist (ไม่ปลอดภัย) / Go to Concert Setlist (unsafe)**
   - กด **อนุญาต (Allow)**
6. คัดลอก **URL ของเว็บแอป (Web App URL)** ที่ลงท้ายด้วย `/exec` เช่น:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```

---

### ขั้นตอนที่ 4: เชื่อมต่อกับ Web App
1. ในโปรเจกต์ของคุณ สร้างไฟล์ `.env` (คัดลอกจาก `.env.example`)
2. ใส่ URL ที่ได้ลงไป:
   ```env
   VITE_GAS_API_URL=https://script.google.com/macros/s/AKfycbx.../exec
   ```
3. รัน `npm run dev` ตัวเว็บจะสลับไปดึงและบันทึกข้อมูลเพลงกับ Google Sheets ของคุณแบบเรียลไทม์ทันที!
